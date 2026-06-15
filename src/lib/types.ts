/**
 * KindHeart 도메인 타입 — CLAUDE.md §5 엔티티 모델 기준.
 *
 * 핵심 규칙(타입 레벨에서 강제):
 * - DonationMode.A(기부/세액공제) ↔ Fund 만 연결, Story 직접 지정 불가.
 * - DonationMode.B(후원/펀딩)   ↔ Story 만 연결, 세액공제 없음.
 * - 두 모드의 용어/필드를 절대 섞지 않는다.
 */

// ─────────────────────────── enum / 상태 ───────────────────────────

export type Role = "donor" | "beneficiary" | "agency" | "reviewer" | "admin";

export type SocialProvider = "kakao" | "naver" | "google" | "apple";

/** 본인확인(CI/DI)이 필요한 시점 — 단계적 신원확인(progressive identity) */
export type IdentityGate =
  | "signup" // 이메일/비밀번호 회원가입 시 본인인증
  | "story_register" // 사연 등록
  | "payout_account" // 후원금 수령 계좌 등록
  | "tax_receipt" // 세액공제 영수증 발급(Mode A)
  | "agency_verify"; // 대리신청 기관 자격확인

export type StoryStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "FUNDING"
  | "FUNDED"
  | "DISBURSING"
  | "COMPLETED"
  | "REJECTED"
  | "SUSPENDED";

export type StoryCategory = "medical" | "emergency" | "independence" | "living" | "education" | "housing";

export type StoryChannel = "self" | "agency" | "offline"; // 본인직접 / 기관대리 / 비디지털

/** 후원 모드 — 절대 결합 금지 (CLAUDE.md 절대원칙 #1) */
export enum DonationMode {
  /** 세액공제형 기부: 불특정 다수(Fund) 대상. "기부/세액공제/영수증" 용어만. */
  A_TAX_DEDUCTIBLE = "A",
  /** 특정인 지정 후원: Story 대상. 세액공제 없음. "후원/펀딩/응원" 용어만. */
  B_DIRECT_SUPPORT = "B",
}

export type PaymentType = "ONE_TIME" | "SUBSCRIPTION";

export type PaymentMethod = "kakaopay" | "naverpay" | "tosspay" | "card" | "transfer";

export type DonationStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED" | "REFUNDED";

export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELED" | "FAILED";

export type DisbursementStatus = "PENDING" | "HELD" | "PAID" | "BLOCKED";

export type EvidenceKind = "medical" | "public" | "income" | "identity" | "other";
export type EvidenceVerifyMethod = "agency_api" | "metadata" | "manual";
export type EvidenceResult = "verified" | "flagged" | "pending" | "rejected";

export type VerificationGrade = "new" | "basic" | "trusted"; // 사연자 등급제

export type LegalEntityType = "operator" | "foundation"; // 영리 운영사 / 공익법인

// ─────────────────────────── 엔티티 ───────────────────────────

export interface AccessibilityPrefs {
  fontScale: number; // 1 = 기본, 1.25, 1.5 ...
  highContrast: boolean;
  screenReader: boolean;
  simpleMode: boolean;
}

export interface User {
  id: string;
  role: Role;
  displayName: string;
  email: string | null;
  /** 다중 소셜 공급자 연결 가능 (account linking) */
  linkedProviders: SocialProvider[];
  /** 본인확인은 필요한 순간에만. 미확인이면 null. CI는 1인1계정 식별키. */
  identityVerified: boolean;
  ciHash: string | null; // 연계정보(CI) 해시 — 평문 미보관
  verifiedAt: string | null;
  accessibility: AccessibilityPrefs;
  preferredChannel: "alimtalk" | "sms" | "email" | "push";
  lastPaymentMethod: PaymentMethod | null;
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string; // User.id (본인 또는 대리기관 담당자)
  channel: StoryChannel;
  agencyId: string | null; // 기관 대리신청 시 기관 id
  category: StoryCategory;
  title: string;
  /** 후원자 공개용 본문 (비식별 처리됨) */
  summary: string;
  bodyEasyRead: string; // "쉬운 말" 본문
  imageUrl: string | null;
  status: StoryStatus;
  goalAmount: number; // 원
  raisedAmount: number;
  /** 분할 지급 계획 — 승인 시 자동 생성 */
  disbursementPlan: DisbursementPlanItem[];
  verificationGrade: VerificationGrade;
  riskScore: number; // 0-100, 높을수록 위험
  /** 수령 계좌 명의 = 본인인증 명의 일치 검증 결과 */
  payoutAccountVerified: boolean;
  createdAt: string;
  fundedAt: string | null;
}

export interface DisbursementPlanItem {
  round: number;
  amount: number;
  scheduledDate: string;
  purpose: string;
}

export interface Fund {
  /** Mode A 전용: 후원자가 선택하는 단위. 사연자 직접 지정 아님. */
  id: string;
  name: string;
  description: string;
  category: StoryCategory;
  foundationId: string; // 운영 공익법인
  totalRaised: number;
  active: boolean;
}

export interface FundAllocation {
  /**
   * Mode A 배분 로그 — 공익법인이 펀드 자금을 "심사 기준에 따라" 어디에 집행했는지 기록.
   * 후원자의 특정인 지정이 아님을 분리 증명(세제 무효화 방지). 수혜 대상은 비식별.
   */
  id: string;
  fundId: string;
  period: string; // 예: "2026-05"
  category: StoryCategory;
  beneficiaryCount: number; // 수혜 인원(비식별 집계)
  amount: number;
  note: string;
}

export interface Evidence {
  id: string;
  storyId: string;
  kind: EvidenceKind;
  verifyMethod: EvidenceVerifyMethod;
  result: EvidenceResult;
  tampered: boolean; // 위변조 플래그
  /** 후원자에게는 비식별 요약만. 원본 storagePath 는 심사자 전용. */
  publicSummary: string;
  storagePath: string | null;
  createdAt: string;
}

export interface Donation {
  id: string;
  donorId: string | null; // 비로그인 결제 흐름 대비 nullable
  mode: DonationMode;
  paymentType: PaymentType;
  method: PaymentMethod;
  amount: number;
  /** 후원자가 운영비를 추가 부담하면 true (전액 전달 옵션) */
  coversFee: boolean;
  feeAmount: number; // 적용된 플랫폼 운영 수수료
  pgFeeAmount: number; // PG 결제대행 실비
  netToBeneficiary: number; // 실제 사연자/펀드 전달액
  status: DonationStatus;
  /** Mode A 만 보유. Mode B 는 항상 null. (타입 레벨 분리) */
  fundId: string | null;
  taxReceiptId: string | null;
  /** Mode B 만 보유. Mode A 는 항상 null. */
  storyId: string | null;
  subscriptionId: string | null;
  createdAt: string;
}

export interface Subscription {
  id: string;
  donorId: string;
  mode: DonationMode;
  amount: number;
  method: PaymentMethod;
  billingKeyRef: string; // PG 빌링키 참조(평문 미보관, KMS 암호화)
  status: SubscriptionStatus;
  nextChargeDate: string;
  fundId: string | null; // Mode A
  storyId: string | null; // Mode B
  createdAt: string;
}

export interface Disbursement {
  id: string;
  storyId: string;
  round: number;
  amount: number;
  scheduledDate: string;
  status: DisbursementStatus;
  /** 직전 회차 사용증빙 연결 — 없으면 다음 회차 BLOCKED */
  usageReportId: string | null;
  paidAt: string | null;
}

export interface UsageReport {
  id: string;
  storyId: string;
  disbursementRound: number;
  /** 후원자 열람용 비식별 카테고리 요약 */
  category: string;
  amountUsed: number;
  /** 검증 상태 */
  verified: boolean;
  publicNote: string;
  createdAt: string;
}

export interface Receipt {
  /** Mode A 전용 기부금영수증 (Phase 2) */
  id: string;
  donationId: string;
  foundationId: string;
  amount: number;
  issuedAt: string;
  ntsReported: boolean; // 국세청 연동
}

export interface FraudSignal {
  id: string;
  type:
    | "multi_story_short_period"
    | "same_ip_multi_account"
    | "duplicate_text"
    | "self_dealing"
    | "abnormal_payment";
  subjectId: string; // story 또는 user id
  weight: number;
  detail: string;
  createdAt: string;
}

export interface Report {
  id: string;
  storyId: string;
  reporterId: string | null;
  reason: string;
  createdAt: string;
}

// ─────────────────────────── 임팩트 루프 ───────────────────────────

/** 사연 소식 — 사연자/기관이 올리는 진행 후기. 후원자가 "내 덕분의 변화"를 직접 확인. */
export interface StoryUpdate {
  id: string;
  storyId: string;
  title: string;
  body: string;
  imageUrl: string | null;
  /** 운영/기관 검증 여부 (가짜 후기 방지) */
  verified: boolean;
  /** 연결된 집행 회차(있으면) */
  disbursementRound: number | null;
  createdAt: string;
}

export type NotificationType =
  | "story_update" // 후원한 사연에 새 소식
  | "disbursement" // 후원금 집행됨
  | "goal_reached" // 목표 달성
  | "completed" // 사연 완주
  | "thanks" // 사연자/기관의 감사
  | "badge"; // 새 배지 획득

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  /** 연결 대상 (사연 등) 링크 */
  href: string | null;
  read: boolean;
  createdAt: string;
}

/** 후원자 누적 임팩트 통계 */
export interface ImpactStats {
  totalDonated: number; // 누적 후원 금액
  storiesSupported: number; // 함께한 사연 수
  completedStories: number; // 후원한 사연 중 완주한 수
  activeSubscriptions: number; // 정기후원 수
  categories: StoryCategory[]; // 후원한 카테고리들
  thanksReceived: number; // 받은 감사 수
}

/** 나눔 레벨 (자연 메타포: 씨앗→숲) */
export interface DonorLevel {
  key: "seed" | "sprout" | "tree" | "forest";
  name: string;
  icon: string;
  min: number; // 누적 후원 임계
  message: string;
}

export interface Badge {
  key: string;
  name: string;
  icon: string;
  description: string;
}

// ─────────────────────────── 커뮤니티 ───────────────────────────

export type CommunityCategory = "thanks" | "story_share" | "question" | "free";
export type ContentStatus = "visible" | "hidden" | "under_review";

export interface CommunityPost {
  id: string;
  authorId: string;
  /** 닉네임만 노출 — 실명/이메일/CI 등 PII 절대 비노출 */
  authorNickname: string;
  category: CommunityCategory;
  title: string;
  body: string; // 저장 전 PII 스캔·마스킹 통과본
  status: ContentStatus;
  likeCount: number;
  commentCount: number;
  /** 후원 인증 배지(이 사용자가 실제 후원자인지) */
  verifiedDonor: boolean;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  body: string;
  status: ContentStatus;
  createdAt: string;
}

export const COMMUNITY_CATEGORY_LABEL: Record<CommunityCategory, string> = {
  thanks: "감사 인사",
  story_share: "후원 후기",
  question: "질문",
  free: "자유",
};

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  /** 자금이동/상태변경/민감조회 불변 기록 */
  meta: Record<string, unknown>;
  createdAt: string;
}

// ─────────────────────────── 표시용 메타 ───────────────────────────

export const CATEGORY_LABEL: Record<StoryCategory, string> = {
  medical: "의료",
  emergency: "긴급",
  independence: "자립",
  living: "생계",
  education: "교육",
  housing: "주거",
};

export const STORY_STATUS_LABEL: Record<StoryStatus, string> = {
  DRAFT: "작성 중",
  SUBMITTED: "접수됨",
  UNDER_REVIEW: "심사 중",
  APPROVED: "승인됨",
  FUNDING: "모금 중",
  FUNDED: "목표 달성",
  DISBURSING: "지급 중",
  COMPLETED: "완료",
  REJECTED: "반려됨",
  SUSPENDED: "일시정지",
};
