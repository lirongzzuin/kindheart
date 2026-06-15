/**
 * 비즈니스 규칙 — CLAUDE.md §1 절대 원칙을 코드로 강제.
 * 위반 시 throw RuleViolation. API/서버 액션에서 자금이동 직전 항상 통과시킨다.
 */

import { DonationMode, Disbursement, Story } from "./types";

export class RuleViolation extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "RuleViolation";
  }
}

/** #1 + #2: Mode A 는 Fund 만, Mode B 는 Story 만. 특정인 지정과 세액공제 결합 금지. */
export function assertDonationTarget(input: {
  mode: DonationMode;
  fundId: string | null;
  storyId: string | null;
}): void {
  if (input.mode === DonationMode.A_TAX_DEDUCTIBLE) {
    if (!input.fundId) throw new RuleViolation("A_REQUIRES_FUND", "세액공제 기부는 펀드(불특정 다수)만 선택할 수 있습니다.");
    if (input.storyId) throw new RuleViolation("A_NO_STORY", "세액공제 기부에 특정 사연을 지정할 수 없습니다.");
  } else {
    if (!input.storyId) throw new RuleViolation("B_REQUIRES_STORY", "지정 후원은 특정 사연을 선택해야 합니다.");
    if (input.fundId) throw new RuleViolation("B_NO_FUND", "지정 후원은 펀드를 대상으로 할 수 없습니다.");
  }
}

/** #2: Mode B 에서 세액공제/영수증 용어·기능 노출 금지 */
export function assertNoTaxBenefit(mode: DonationMode): void {
  if (mode === DonationMode.B_DIRECT_SUPPORT) {
    // Mode B 결제 직전 후원자의 "세액공제 안 됨" 명시 동의가 필요 (UI 에서 강제)
    return;
  }
}

/** #3: 수령 계좌 명의 == 본인인증 명의 */
export function assertAccountHolderMatch(verifiedName: string, accountHolderName: string): void {
  const norm = (s: string) => s.replace(/\s+/g, "").trim();
  if (!verifiedName || !accountHolderName || norm(verifiedName) !== norm(accountHolderName)) {
    throw new RuleViolation("ACCOUNT_HOLDER_MISMATCH", "후원금 수령 계좌는 본인 명의여야 합니다.");
  }
}

/** #5 + §6.6: 직전 회차 사용증빙 확인 전 다음 회차 집행 금지 */
export function assertDisbursementGate(prev: Disbursement | null): void {
  if (prev == null) return; // 1회차는 직전 회차 없음
  if (prev.status !== "PAID") {
    throw new RuleViolation("PREV_ROUND_NOT_PAID", "직전 회차가 완료되지 않았습니다.");
  }
  if (!prev.usageReportId) {
    throw new RuleViolation("USAGE_REPORT_REQUIRED", "직전 회차 사용 증빙이 제출·확인되어야 다음 회차를 집행할 수 있습니다.");
  }
}

/** #8: 모금 대상 사연이 후원 가능한 상태인지 (Mode B) */
export function assertStoryFundable(story: Pick<Story, "status">): void {
  const ok = story.status === "FUNDING" || story.status === "APPROVED";
  if (!ok) throw new RuleViolation("STORY_NOT_FUNDABLE", "현재 후원을 받을 수 없는 사연입니다.");
}

/** Mode B 결제 직전 "세액공제 불가" 동의 확인 */
export function assertModeBConsent(mode: DonationMode, consented: boolean): void {
  if (mode === DonationMode.B_DIRECT_SUPPORT && !consented) {
    throw new RuleViolation("MODE_B_CONSENT_REQUIRED", "세액공제가 되지 않음을 확인해 주세요.");
  }
}
