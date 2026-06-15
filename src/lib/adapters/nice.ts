import "server-only";
/**
 * NICE 디지털 본인확인(체크플러스 표준창) 어댑터 — 실제 연동.
 * 흐름: ① access token → ② 암호화 토큰 → ③ 요청데이터 AES-128-CBC 암호화 + 무결성(HMAC)
 *       → ④ 표준창으로 사용자 리다이렉트 → ⑤ NICE 가 returnUrl 로 enc_data POST → ⑥ 복호화하여 CI/DI 취득.
 *
 * ⚠️ 엔드포인트/필드명/키파생은 NICE API 문서 기준으로 구현했으나,
 *    반드시 NICE 테스트베드(테스트 client_id/secret)로 검증 후 운영하세요.
 *    제공값(productID 등)은 계약 시 NICE 가 부여합니다.
 */
import { createCipheriv, createDecipheriv, createHash, createHmac } from "node:crypto";

const TOKEN_URL = "https://svc.niceapi.co.kr:22001/digital/niceid/oauth/oauth/token";
const CRYPTO_TOKEN_URL = "https://svc.niceapi.co.kr:22001/digital/niceid/api/v1.0/common/crypto/token";
export const CHECKPLUS_URL = "https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb";

function creds() {
  const id = process.env.NICE_CLIENT_ID;
  const secret = process.env.NICE_CLIENT_SECRET;
  const productId = process.env.NICE_PRODUCT_ID ?? "";
  if (!id || !secret) throw new Error("NICE_CLIENT_ID / NICE_CLIENT_SECRET 미설정");
  return { id, secret, productId };
}

export function niceConfigured(): boolean {
  return !!process.env.NICE_CLIENT_ID && !!process.env.NICE_CLIENT_SECRET;
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function reqDtimNow(): string {
  const d = new Date();
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}${pad2(d.getHours())}${pad2(
    d.getMinutes()
  )}${pad2(d.getSeconds())}`;
}

async function getAccessToken(): Promise<string> {
  const { id, secret } = creds();
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "default" }),
    cache: "no-store",
  });
  const j = await res.json();
  const token = j?.dataBody?.access_token ?? j?.access_token;
  if (!token) throw new Error("NICE access_token 발급 실패");
  return token as string;
}

async function getCryptoToken(accessToken: string, reqDtim: string, reqNo: string) {
  const { id, productId } = creds();
  const ts = Math.floor(Date.now() / 1000).toString();
  const auth = Buffer.from(`${accessToken}:${ts}:${id}`).toString("base64");
  const res = await fetch(CRYPTO_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${auth}`,
      "Content-Type": "application/json",
      ProductID: productId,
    },
    body: JSON.stringify({
      dataHeader: { CNTY_CD: "ko" },
      dataBody: { req_dtim: reqDtim, req_no: reqNo, enc_mode: "1" },
    }),
    cache: "no-store",
  });
  const j = await res.json();
  const b = j?.dataBody;
  if (!b?.token_val) throw new Error("NICE 암호화 토큰 발급 실패");
  return {
    siteCode: b.site_code as string,
    tokenVal: b.token_val as string,
    tokenVersionId: b.token_version_id as string,
  };
}

/** 키 파생: SHA256(req_dtim+req_no+token_val) → key(앞16)/iv(뒤16)/hmac(앞32) */
function deriveKeys(reqDtim: string, reqNo: string, tokenVal: string) {
  const hash = createHash("sha256").update(reqDtim + reqNo + tokenVal).digest("base64");
  return { key: hash.slice(0, 16), iv: hash.slice(-16), hmacKey: hash.slice(0, 32) };
}

function encrypt(plain: string, key: string, iv: string): string {
  const c = createCipheriv("aes-128-cbc", Buffer.from(key), Buffer.from(iv));
  return Buffer.concat([c.update(plain, "utf8"), c.final()]).toString("base64");
}
function hmac(data: string, hmacKey: string): string {
  return createHmac("sha256", hmacKey).update(data).digest("base64");
}

export interface NiceRequest {
  tokenVersionId: string;
  encData: string;
  integrityValue: string;
  /** 콜백 복호화용 — 암호화하여 쿠키에 저장 */
  key: string;
  iv: string;
  reqNo: string;
}

/** 표준창 호출에 필요한 enc_data/무결성 생성 */
export async function buildNiceRequest(returnUrl: string): Promise<NiceRequest> {
  const reqNo = `KH${reqDtimNow()}${Math.floor(Math.random() * 10000)}`;
  const reqDtim = reqDtimNow();
  const accessToken = await getAccessToken();
  const { tokenVal, tokenVersionId } = await getCryptoToken(accessToken, reqDtim, reqNo);
  const { key, iv, hmacKey } = deriveKeys(reqDtim, reqNo, tokenVal);

  const reqData = {
    requestno: reqNo,
    returnurl: returnUrl,
    sitecode: tokenVersionId, // 표준창 표준 필드
    methodtype: "post",
    popupyn: "Y",
  };
  const encData = encrypt(JSON.stringify(reqData), key, iv);
  const integrityValue = hmac(encData, hmacKey);
  return { tokenVersionId, encData, integrityValue, key, iv, reqNo };
}

export interface NiceResult {
  resultcode: string;
  ci?: string;
  di?: string;
  name?: string;
  birthdate?: string;
  gender?: string;
  mobileno?: string;
}

/** 콜백으로 받은 enc_data 를 복호화 */
export function decodeNiceResult(encData: string, key: string, iv: string): NiceResult {
  const d = createDecipheriv("aes-128-cbc", Buffer.from(key), Buffer.from(iv));
  const out = Buffer.concat([d.update(Buffer.from(encData, "base64")), d.final()]).toString("utf8");
  return JSON.parse(out) as NiceResult;
}
