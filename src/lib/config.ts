/**
 * 전역 설정 & 피처 플래그.
 * Phase 1 = Mode B(지정 후원)만 활성. Mode A 는 FEATURE_MODE_A 로 토글.
 */

function truthy(v: string | undefined): boolean {
  return v === "1" || v?.toLowerCase() === "true";
}

// 주의: Next.js 는 클라이언트 번들에 `process.env.NEXT_PUBLIC_*` 의 "정적 멤버 접근"만 인라인한다.
// 동적 `process.env[name]` 은 클라이언트에서 undefined 가 되므로, UI 게이팅용 플래그는
// 반드시 NEXT_PUBLIC_ 정적 접근으로 읽는다. (서버 전용 enforcement 는 별도 서버 플래그로 OR)
export const FEATURES = {
  /** Mode A(세액공제 기부)를 UI/결제에 노출할지. Phase 2 에 활성. 서버·클라 공통. */
  MODE_A: truthy(process.env.NEXT_PUBLIC_FEATURE_MODE_A) || truthy(process.env.FEATURE_MODE_A),
  /** 기부금영수증 발급 (공익법인 + 국세청 연동) */
  TAX_RECEIPT:
    truthy(process.env.NEXT_PUBLIC_FEATURE_TAX_RECEIPT) || truthy(process.env.FEATURE_TAX_RECEIPT),
  /** 실제 PG 연동 vs mock 어댑터 (서버 전용) */
  REAL_PAYMENT: truthy(process.env.FEATURE_REAL_PAYMENT),
  /** 실제 본인확인(NICE/PASS) vs mock. UI(팝업 분기)에서도 읽어야 하므로 NEXT_PUBLIC 포함. */
  REAL_IDENTITY:
    truthy(process.env.NEXT_PUBLIC_FEATURE_REAL_IDENTITY) || truthy(process.env.FEATURE_REAL_IDENTITY),
} as const;

/** 모금 누적액 모니터링 — 기부금품모집법 1천만원 등록 임계 경보 */
export const FUNDRAISING_REGISTRATION_THRESHOLD = 10_000_000;

/** 금액 임계값 초과 시 2인 교차심사 + 화상 인터뷰 의무 (CLAUDE.md §6.4) */
export const REVIEW_DUAL_THRESHOLD = 3_000_000;

/** 신규(new) 등급 사연자 최대 목표금액 한도 */
export const NEW_GRADE_GOAL_CAP = 5_000_000;

/** 분할 지급 기본 정책: 회차 수 / 주기(일) */
export const DEFAULT_DISBURSEMENT = { rounds: 3, intervalDays: 30 } as const;

/** 고객센터 / 전화 후원·해지 (접근성 대체수단) */
export const SUPPORT_PHONE = "1588-0000";
export const SUPPORT_HOURS = "평일 오전 9시 ~ 오후 6시";

/**
 * 전화 기반 안내(전화 신청·전화 후원·전화 해지·전화 문의)를 화면에 노출할지.
 * 실제 콜센터 운영 전까지 우선 숨김(false). 콜센터 가동 후 true 로 전환하면 전부 복구.
 * ⚠️ 공개 런칭 전에는 접근성(장애인차별금지법) 비디지털 대체수단을 위해 재활성 필요.
 */
export const SHOW_PHONE_SUPPORT = false;

export const BRAND = {
  name: "KindHeart",
  nameKo: "킨드하트",
} as const;
