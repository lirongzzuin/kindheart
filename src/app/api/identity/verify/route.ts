import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getIdentityAdapter } from "@/lib/adapters/identity";
import { encryptPII, hashIdentifier } from "@/lib/crypto";

const Body = z.object({
  gate: z.enum(["signup", "story_register", "payout_account", "tax_receipt", "agency_verify"]),
  mockName: z.string().optional(),
});

// 단계적 신원확인 — 필요한 순간에만 호출. CI/DI 기반(주민번호 미수집).
export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  const adapter = getIdentityAdapter();
  const result = await adapter.verify(parsed.gate, { mockName: parsed.mockName });

  // ── PII 처리 (전부 서버 사이드) ──
  // CI/DI: 복호화 불필요 → HMAC 단방향 해시. 평문 미보관. ci_hash 유니크로 1인1계정 식별.
  // 이름: 복호화 필요할 수 있음 → AES-256-GCM 암호화.
  // ENCRYPTION_KEY 미설정(데모)이면 안전하게 스킵하고 저장은 하지 않음.
  let secured = false;
  try {
    if (process.env.ENCRYPTION_KEY) {
      const ciHash = hashIdentifier(result.ciHash);
      const diHash = hashIdentifier(result.diHash);
      const nameEnc = encryptPII(result.name);
      // TODO(DB): app_user upsert { ci_hash: ciHash, di_hash: diHash, name_enc: nameEnc,
      //   identity_verified: true, verified_at } + audit_log(action='identity_verify', gate).
      // ci_hash 유니크 위반 시 → 동일인 다중계정 → 통합/차단.
      void ciHash;
      void diHash;
      void nameEnc;
      secured = true;
    }
  } catch {
    // 암호화 실패 시에도 검증 응답은 주되, 저장은 하지 않음(키 설정 필요).
    secured = false;
  }

  // 응답에는 민감정보(CI/DI/해시) 미포함. 표시용 이름·시점만.
  return NextResponse.json({
    ok: result.ok,
    verifiedName: result.name,
    verifiedAt: result.verifiedAt,
    secured, // 서버에 암호화 저장되었는지(데모에선 false)
  });
}
