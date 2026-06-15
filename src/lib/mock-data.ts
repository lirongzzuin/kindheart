/**
 * Mock 데이터 — DB 연결 전에도 전체 플로우가 동작하도록 제공.
 * 후원자에게 노출되는 필드는 모두 비식별 처리된 값만 담는다.
 */

import { Disbursement, Fund, FundAllocation, Story, UsageReport } from "./types";

export const MOCK_STORIES: Story[] = [
  {
    id: "story-winter-kim",
    authorId: "agency-1",
    channel: "agency",
    agencyId: "agency-1",
    category: "medical",
    title: "혼자 사시는 김어르신의 따뜻한 겨울나기",
    summary:
      "다가오는 겨울, 난방비 걱정으로 힘들어하시는 어르신께 따뜻한 온기를 전해주세요. 여러분의 작은 도움이 큰 위로가 됩니다.",
    bodyEasyRead:
      "어르신은 혼자 사세요. 겨울이 오면 방이 너무 추워요. 난방비가 부족해요. 여러분의 도움으로 따뜻하게 겨울을 보낼 수 있어요.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPyzRR1AtJukX2-rrdpywIldr7MQZgYd-XmFfFzRnyZbz6JWlBOZoApDHuHPkgEf61XKZF9Hs5zkz4Jle1dEGscWW4Iep-PKym6L55Nvht424LikzDcActKmsVmBXp6fp45zFbfMsiYopPjoyjAgfoUOQ8hET3rcy7HDJundeTct5AFjzYB0NK9TaveL-Vj0IPV9xFh7BsNB9WEAR5kWSoir7IOLKQWvd-NPyJPUFVRw85tYE8TZegblTwoP3iB4Hcgp8vIC2czpA",
    status: "FUNDING",
    goalAmount: 2_000_000,
    raisedAmount: 1_500_000,
    disbursementPlan: [
      { round: 1, amount: 700_000, scheduledDate: "2026-07-01", purpose: "긴급 난방비" },
      { round: 2, amount: 700_000, scheduledDate: "2026-08-01", purpose: "방한 물품" },
      { round: 3, amount: 600_000, scheduledDate: "2026-09-01", purpose: "주거 보수" },
    ],
    verificationGrade: "trusted",
    riskScore: 8,
    payoutAccountVerified: true,
    createdAt: "2026-06-01T00:00:00Z",
    fundedAt: null,
  },
  {
    id: "story-youth-independence",
    authorId: "agency-2",
    channel: "agency",
    agencyId: "agency-2",
    category: "independence",
    title: "보육원 퇴소 청년들의 첫 걸음 응원",
    summary:
      "홀로 세상에 첫발을 내딛는 자립준비청년들이 안정적으로 사회에 정착할 수 있도록 긴급 생계비와 주거비를 지원합니다.",
    bodyEasyRead:
      "보육원을 나온 청년들이 혼자 살기 시작해요. 집과 생활비가 필요해요. 여러분의 응원이 큰 힘이 됩니다.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0ijHRCLjweMg3j43Cni3ygq02yJRbd-6NxVFKOpJ2aVB-h_UvxPVqXocJPXbzrGiup1p5mn0lu7MJ5CLH-PE49k4ZTlpBz-9Ss1aBSzT5ZcmOU65EkDgUyUWQtUGdTCqW7OqklnautkKpn_k_4tjeYbNw6vpClt2xOYrUhBZmS9UzPow0-VwmzyXBTsEbQp2oc8ftvw_jIpO3s44rGG8YL8kziYvuIAxm7ORRTxBgTXeIGUcZ99tDniSCphJ1pbhrAGfucO2vHVE",
    status: "FUNDING",
    goalAmount: 5_000_000,
    raisedAmount: 2_100_000,
    disbursementPlan: [
      { round: 1, amount: 2_000_000, scheduledDate: "2026-07-10", purpose: "주거 보증금" },
      { round: 2, amount: 1_500_000, scheduledDate: "2026-08-10", purpose: "생계비" },
      { round: 3, amount: 1_500_000, scheduledDate: "2026-09-10", purpose: "자립 교육" },
    ],
    verificationGrade: "basic",
    riskScore: 14,
    payoutAccountVerified: true,
    createdAt: "2026-06-03T00:00:00Z",
    fundedAt: null,
  },
  {
    id: "story-surgery-child",
    authorId: "agency-1",
    channel: "agency",
    agencyId: "agency-1",
    category: "medical",
    title: "수술이 필요한 아이에게 희망을",
    summary: "치료 시기를 놓치면 안 되는 아이의 수술비를 함께 마련해 주세요. 회차별 의료비 증빙으로 투명하게 집행됩니다.",
    bodyEasyRead: "아이가 수술을 받아야 해요. 수술비가 많이 부족해요. 도와주시면 아이가 건강해질 수 있어요.",
    imageUrl: null,
    status: "DISBURSING",
    goalAmount: 12_000_000,
    raisedAmount: 12_540_000,
    disbursementPlan: [
      { round: 1, amount: 3_000_000, scheduledDate: "2026-03-05", purpose: "초기 긴급 수술비" },
      { round: 2, amount: 4_278_000, scheduledDate: "2026-04-10", purpose: "의료비 및 재활 치료" },
      { round: 3, amount: 1_500_000, scheduledDate: "2026-05-15", purpose: "주거 환경 개선 잔금" },
    ],
    verificationGrade: "trusted",
    riskScore: 5,
    payoutAccountVerified: true,
    createdAt: "2026-02-20T00:00:00Z",
    fundedAt: "2026-03-01T00:00:00Z",
  },
];

export const MOCK_FUNDS: Fund[] = [
  {
    id: "fund-emergency-medical",
    name: "긴급의료지원 펀드",
    description: "수술·치료가 시급한 이웃을 위해 공익법인이 심사 후 가장 필요한 곳에 배분합니다.",
    category: "medical",
    foundationId: "foundation-1",
    totalRaised: 48_300_000,
    active: true,
  },
  {
    id: "fund-youth-independence",
    name: "자립준비청년 응원 펀드",
    description: "보육원 퇴소 청년의 주거·생계 자립을 돕습니다.",
    category: "independence",
    foundationId: "foundation-1",
    totalRaised: 21_750_000,
    active: true,
  },
];

export const MOCK_DISBURSEMENTS: Record<string, Disbursement[]> = {
  "story-surgery-child": [
    {
      id: "disb-1",
      storyId: "story-surgery-child",
      round: 1,
      amount: 3_000_000,
      scheduledDate: "2026-03-05",
      status: "PAID",
      usageReportId: "ur-1",
      paidAt: "2026-03-05T00:00:00Z",
    },
    {
      id: "disb-2",
      storyId: "story-surgery-child",
      round: 2,
      amount: 4_278_000,
      scheduledDate: "2026-04-10",
      status: "PAID",
      usageReportId: "ur-2",
      paidAt: "2026-04-10T00:00:00Z",
    },
    {
      id: "disb-3",
      storyId: "story-surgery-child",
      round: 3,
      amount: 1_500_000,
      scheduledDate: "2026-05-15",
      status: "HELD",
      usageReportId: null,
      paidAt: null,
    },
  ],
};

export const MOCK_USAGE_REPORTS: Record<string, UsageReport[]> = {
  "story-surgery-child": [
    {
      id: "ur-1",
      storyId: "story-surgery-child",
      disbursementRound: 1,
      category: "의료비(수술)",
      amountUsed: 3_000_000,
      verified: true,
      publicNote: "수술비 영수증 검증 완료 (병원 직접 진위확인)",
      createdAt: "2026-03-20T00:00:00Z",
    },
    {
      id: "ur-2",
      storyId: "story-surgery-child",
      disbursementRound: 2,
      category: "의료비(재활)",
      amountUsed: 4_278_000,
      verified: true,
      publicNote: "재활치료비·약제비 영수증 검증 완료",
      createdAt: "2026-04-25T00:00:00Z",
    },
  ],
};

// 공익법인 배분 로그 (Mode A 투명성) — 특정인 지정이 아닌 "불특정 다수 배분" 증명.
export const MOCK_FUND_ALLOCATIONS: Record<string, FundAllocation[]> = {
  "fund-emergency-medical": [
    { id: "fa-1", fundId: "fund-emergency-medical", period: "2026-05", category: "medical", beneficiaryCount: 12, amount: 18_600_000, note: "긴급 수술·입원비 분할 지원" },
    { id: "fa-2", fundId: "fund-emergency-medical", period: "2026-04", category: "medical", beneficiaryCount: 9, amount: 14_200_000, note: "재활·약제비 지원" },
  ],
  "fund-youth-independence": [
    { id: "fa-3", fundId: "fund-youth-independence", period: "2026-05", category: "independence", beneficiaryCount: 7, amount: 11_500_000, note: "주거 보증금·생계비 지원" },
  ],
};

export function getStoryById(id: string): Story | undefined {
  return MOCK_STORIES.find((s) => s.id === id);
}
export function getFundById(id: string): Fund | undefined {
  return MOCK_FUNDS.find((f) => f.id === id);
}
export function getFundAllocations(fundId: string): FundAllocation[] {
  return MOCK_FUND_ALLOCATIONS[fundId] ?? [];
}
