/** 운영자 대시보드용 mock 데이터. 실제는 DB 조회 + RLS(admin). */
import { REVIEW_DUAL_THRESHOLD } from "./config";

export interface ReviewItem {
  id: string;
  title: string;
  applicant: string; // 닉네임/기관명(비식별)
  channel: "self" | "agency" | "offline";
  goalAmount: number;
  riskScore: number;
  evidenceVerified: boolean;
  plagiarismScore: number;
  needsDualReview: boolean; // 금액 임계 초과 → 2인 교차심사+화상 의무
  submittedAt: string;
}

export interface PendingDisbursement {
  id: string;
  storyTitle: string;
  round: number;
  amount: number;
  scheduledDate: string;
  /** 직전 회차 사용증빙 제출·검증 여부 (집행 게이트) */
  prevUsageVerified: boolean;
  prevRound: number | null;
}

export interface ReportedItem {
  id: string;
  type: "story" | "post" | "comment";
  preview: string;
  reason: string;
  reportCount: number;
  reportedAt: string;
}

export const REVIEW_QUEUE: ReviewItem[] = [
  {
    id: "rv-1",
    title: "어린 자녀를 둔 한부모 가정 생계 지원",
    applicant: "성동구 사회복지관",
    channel: "agency",
    goalAmount: 3_000_000,
    riskScore: 12,
    evidenceVerified: true,
    plagiarismScore: 0.05,
    needsDualReview: 3_000_000 > REVIEW_DUAL_THRESHOLD,
    submittedAt: "2026-06-14T10:00:00Z",
  },
  {
    id: "rv-2",
    title: "갑작스러운 사고로 수술이 필요합니다",
    applicant: "본인 직접",
    channel: "self",
    goalAmount: 8_000_000,
    riskScore: 47,
    evidenceVerified: false,
    plagiarismScore: 0.62,
    needsDualReview: 8_000_000 > REVIEW_DUAL_THRESHOLD,
    submittedAt: "2026-06-14T15:30:00Z",
  },
];

export const PENDING_DISBURSEMENTS: PendingDisbursement[] = [
  {
    id: "pd-1",
    storyTitle: "수술이 필요한 아이에게 희망을",
    round: 3,
    amount: 1_500_000,
    scheduledDate: "2026-05-15",
    prevUsageVerified: true, // 2회차 증빙 검증됨 → 집행 가능
    prevRound: 2,
  },
  {
    id: "pd-2",
    storyTitle: "보육원 퇴소 청년들의 첫 걸음 응원",
    round: 2,
    amount: 1_500_000,
    scheduledDate: "2026-08-10",
    prevUsageVerified: false, // 1회차 증빙 미검증 → 집행 차단되어야 함
    prevRound: 1,
  },
];

export const REPORTED_ITEMS: ReportedItem[] = [
  {
    id: "rp-1",
    type: "post",
    preview: "급하게 도움이 필요해서요... (계좌 유도 의심)",
    reason: "사기·외부 송금 유도",
    reportCount: 3,
    reportedAt: "2026-06-14T18:00:00Z",
  },
];

export const ADMIN_METRICS = {
  reviewPending: REVIEW_QUEUE.length,
  disbursementPending: PENDING_DISBURSEMENTS.length,
  reportsPending: REPORTED_ITEMS.length,
  todayDonationAmount: 1_240_000,
  todayDonationCount: 38,
  activeSubscriptions: 156,
};
