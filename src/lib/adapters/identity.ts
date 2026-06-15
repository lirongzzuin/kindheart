/**
 * 본인확인(CI/DI) 어댑터 — PASS 등 본인확인기관 연동. 초기엔 mock.
 * 단계적 신원확인: 필요한 순간(사연등록/수령계좌/영수증/기관자격)에만 호출.
 * 주민번호는 수집하지 않으며 CI/DI 기반으로만 식별한다.
 */

import { FEATURES, SUPPORT_PHONE } from "../config";
import { IdentityGate } from "../types";

export interface IdentityVerifyResult {
  ok: boolean;
  /** 연계정보(CI) 해시 — 1인1계정 식별키. 평문 CI 미보관. */
  ciHash: string;
  /** 중복식별 정보(DI) 해시 */
  diHash: string;
  name: string;
  verifiedAt: string;
}

export interface IdentityAdapter {
  readonly name: string;
  /** 본인확인 요청. gate 는 어떤 행위 때문에 요구되는지(감사/UX용). */
  verify(gate: IdentityGate, opts?: { mockName?: string }): Promise<IdentityVerifyResult>;
  /** 수령계좌 명의 == 본인확인 명의 일치 검증 (CLAUDE.md 절대원칙 #3) */
  matchAccountHolder(ciHash: string, accountHolderName: string, verifiedName: string): boolean;
}

class MockIdentityAdapter implements IdentityAdapter {
  readonly name = "mock-pass";

  async verify(_gate: IdentityGate, opts?: { mockName?: string }): Promise<IdentityVerifyResult> {
    const name = opts?.mockName ?? "홍길동";
    const seed = encodeURIComponent(name);
    return {
      ok: true,
      ciHash: `ci_mock_${seed}`,
      diHash: `di_mock_${seed}`,
      name,
      verifiedAt: new Date().toISOString(),
    };
  }

  matchAccountHolder(_ciHash: string, accountHolderName: string, verifiedName: string): boolean {
    // 공백/정규화 후 비교
    const norm = (s: string) => s.replace(/\s+/g, "").trim();
    return norm(accountHolderName) === norm(verifiedName);
  }
}

export function getIdentityAdapter(): IdentityAdapter {
  if (FEATURES.REAL_IDENTITY) {
    throw new Error("실 본인확인 어댑터 미구현 — FEATURE_REAL_IDENTITY 비활성 필요");
  }
  return new MockIdentityAdapter();
}

/** 비디지털 대체 수단 안내 (장애인차별금지법 대응) */
export const IDENTITY_OFFLINE_ALTERNATIVE = {
  message: "온라인 본인확인이 어려우시면 고객센터를 통해 도움을 받으실 수 있습니다.",
  phone: SUPPORT_PHONE,
};
