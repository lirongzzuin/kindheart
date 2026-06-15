/**
 * 게이미피케이션 — 따뜻한 자연 메타포(씨앗→숲). 순수 함수라 테스트 용이.
 * 후원의 보람을 시각화하되 과하지 않게(기부 맥락 품위 유지).
 */
import { Badge, DonorLevel, ImpactStats } from "./types";

export const LEVELS: DonorLevel[] = [
  { key: "seed", name: "씨앗", icon: "spa", min: 0, message: "나눔의 씨앗을 심으셨어요." },
  { key: "sprout", name: "새싹", icon: "potted_plant", min: 50_000, message: "당신의 마음에 새싹이 돋았어요." },
  { key: "tree", name: "나무", icon: "park", min: 200_000, message: "든든한 나무처럼 이웃을 지켜주고 있어요." },
  { key: "forest", name: "숲", icon: "forest", min: 1_000_000, message: "당신의 나눔이 숲을 이뤘어요." },
];

/** 누적 후원액 → 현재 레벨 + 다음 레벨까지 진행률 */
export function getLevel(totalDonated: number): {
  level: DonorLevel;
  next: DonorLevel | null;
  progressPct: number;
  toNext: number;
} {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalDonated >= LEVELS[i].min) idx = i;
  }
  const level = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;
  if (!next) return { level, next: null, progressPct: 100, toNext: 0 };
  const span = next.min - level.min;
  const done = totalDonated - level.min;
  return {
    level,
    next,
    progressPct: Math.max(0, Math.min(100, Math.round((done / span) * 100))),
    toNext: Math.max(0, next.min - totalDonated),
  };
}

export const BADGE_DEFS: Badge[] = [
  { key: "first", name: "첫 나눔", icon: "favorite", description: "첫 후원을 시작했어요" },
  { key: "recurring", name: "꾸준한 마음", icon: "autorenew", description: "정기후원으로 함께해요" },
  { key: "completed", name: "결실의 증인", icon: "verified", description: "후원한 사연의 완주를 함께했어요" },
  { key: "broad", name: "넓은 마음", icon: "diversity_3", description: "여러 분야의 이웃을 도왔어요" },
  { key: "pillar", name: "든든한 이웃", icon: "shield_with_heart", description: "누적 50만원 이상 나눴어요" },
];

/** 통계 → 획득 배지 목록 */
export function getBadges(stats: ImpactStats): Badge[] {
  const earned: string[] = [];
  if (stats.storiesSupported > 0 || stats.totalDonated > 0) earned.push("first");
  if (stats.activeSubscriptions > 0) earned.push("recurring");
  if (stats.completedStories > 0) earned.push("completed");
  if (stats.categories.length >= 3) earned.push("broad");
  if (stats.totalDonated >= 500_000) earned.push("pillar");
  return BADGE_DEFS.filter((b) => earned.includes(b.key));
}

/** 공유용 한 줄 임팩트 문구 */
export function impactHeadline(stats: ImpactStats): string {
  if (stats.storiesSupported === 0) return "나눔을 시작해보세요";
  const parts: string[] = [`${stats.storiesSupported}개의 사연`];
  if (stats.completedStories > 0) parts.push(`${stats.completedStories}개의 결실`);
  return `나는 ${parts.join(" · ")}과 함께했어요`;
}
