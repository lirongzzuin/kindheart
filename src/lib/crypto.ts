import "server-only";
/**
 * 개인정보 암호화 코어 — 서버 전용. 절대 클라이언트 번들로 가지 않는다("server-only").
 *
 * 정책 (CLAUDE.md §11 / 개인정보보호법·신용정보법):
 *  - 주민번호는 수집하지 않는다. 본인확인은 CI/DI 기반.
 *  - 복호화가 필요한 PII(이름·계좌번호·연락처)는 AES-256-GCM 으로 암호화 저장.
 *  - 식별/중복확인만 필요한 값(CI 등)은 복호화 불필요 → HMAC-SHA256 단방향 해시로 저장(평문 미보관).
 *  - 암호화/복호화는 서버 사이드에서만. 키는 환경변수(KMS 권장)로 주입.
 */
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12; // GCM 권장 96-bit
const VERSION = "v1"; // 키 로테이션 대비 버전 프리픽스

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("ENCRYPTION_KEY 미설정 — PII 암호화 불가. 32바이트 base64 키를 설정하세요.");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY 는 32바이트(base64)여야 합니다 (AES-256).");
  }
  return key;
}

function getHmacKey(): Buffer {
  // 해시 전용 키. 별도 지정 없으면 암호화 키에서 파생.
  const raw = process.env.HASH_KEY;
  if (raw) return Buffer.from(raw, "base64");
  return createHmac("sha256", getKey()).update("kindheart:hash:salt").digest();
}

/** 복호화 가능한 PII 암호화. 결과: "v1:base64(iv|tag|ciphertext)" */
export function encryptPII(plaintext: string): string {
  if (plaintext === "") return "";
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${Buffer.concat([iv, tag, ct]).toString("base64")}`;
}

/** 복호화. 잘못된 입력/변조 시 throw. */
export function decryptPII(payload: string): string {
  if (payload === "") return "";
  const [ver, b64] = payload.split(":");
  if (ver !== VERSION || !b64) throw new Error("암호문 형식 오류 또는 미지원 버전");
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + 16);
  const ct = buf.subarray(IV_LEN + 16);
  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/**
 * 단방향 결정적 해시 (CI/DI 등 식별·중복확인용). 복호화 불가.
 * 같은 입력 → 같은 해시 → DB 유니크 인덱스로 1인1계정 식별 가능.
 */
export function hashIdentifier(value: string): string {
  return createHmac("sha256", getHmacKey()).update(value.trim()).digest("hex");
}

/** 해시 비교 (타이밍 공격 방지) */
export function safeHashEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** 32바이트 base64 키 생성 헬퍼 (운영 키 발급용 — 콘솔에서 1회 실행) */
export function generateKey(): string {
  return randomBytes(32).toString("base64");
}
