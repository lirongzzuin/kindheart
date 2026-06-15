/** 임팩트 루프 mock 데이터. 실제는 DB(후원 내역·소식·알림) 조회. */
import { AppNotification, ImpactStats, StoryUpdate } from "./types";

/** 데모 후원자 누적 임팩트 (실제는 donation 집계). */
export function getDemoImpactStats(): ImpactStats {
  return {
    totalDonated: 180_000,
    storiesSupported: 4,
    completedStories: 1,
    activeSubscriptions: 2,
    categories: ["medical", "independence", "living"],
    thanksReceived: 3,
  };
}

/** 사연별 소식(후기). 후원자가 "내 덕분의 변화"를 직접 확인. */
export const MOCK_STORY_UPDATES: Record<string, StoryUpdate[]> = {
  "story-surgery-child": [
    {
      id: "su-1",
      storyId: "story-surgery-child",
      title: "수술을 무사히 마쳤어요 🙏",
      body: "여러분의 후원으로 1차 수술을 잘 받았습니다. 아이가 회복실에서 처음으로 웃었어요. 정말 감사합니다.",
      imageUrl: null,
      verified: true,
      disbursementRound: 1,
      createdAt: "2026-03-22T00:00:00Z",
    },
    {
      id: "su-2",
      storyId: "story-surgery-child",
      title: "재활 치료를 시작했습니다",
      body: "2차 후원금으로 재활 치료를 시작했어요. 조금씩 걷는 연습을 하고 있습니다. 집행 내역은 투명하게 공개돼 있어요.",
      imageUrl: null,
      verified: true,
      disbursementRound: 2,
      createdAt: "2026-04-26T00:00:00Z",
    },
  ],
  "story-winter-kim": [
    {
      id: "su-3",
      storyId: "story-winter-kim",
      title: "따뜻한 겨울을 보내고 있어요",
      body: "난방비 지원 덕분에 올겨울은 따뜻하게 지내고 있습니다. 어르신이 직접 감사 인사를 전해달라 하셨어요.",
      imageUrl: null,
      verified: true,
      disbursementRound: 1,
      createdAt: "2026-06-10T00:00:00Z",
    },
  ],
};

export function getStoryUpdates(storyId: string): StoryUpdate[] {
  return MOCK_STORY_UPDATES[storyId] ?? [];
}

/** 데모 후원자 알림 피드. */
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1",
    userId: "me",
    type: "story_update",
    title: "후원한 사연에 새 소식",
    body: "'수술이 필요한 아이에게 희망을' — 재활 치료를 시작했어요.",
    href: "/stories/story-surgery-child",
    read: false,
    createdAt: "2026-04-26T00:10:00Z",
  },
  {
    id: "n-2",
    userId: "me",
    type: "disbursement",
    title: "후원금이 집행되었어요",
    body: "2회차 의료비가 사용 증빙 확인 후 집행되었습니다. 내역을 확인해보세요.",
    href: "/stories/story-surgery-child/transparency",
    read: false,
    createdAt: "2026-04-10T00:00:00Z",
  },
  {
    id: "n-3",
    userId: "me",
    type: "thanks",
    title: "감사 인사가 도착했어요 💌",
    body: "'혼자 사시는 김어르신' — 따뜻한 겨울을 보내고 있다는 소식을 전해왔어요.",
    href: "/stories/story-winter-kim",
    read: true,
    createdAt: "2026-06-10T00:00:00Z",
  },
  {
    id: "n-4",
    userId: "me",
    type: "badge",
    title: "새 배지 획득: 결실의 증인",
    body: "후원한 사연이 완주했어요. 당신이 만든 변화예요.",
    href: "/me/giving",
    read: true,
    createdAt: "2026-05-20T00:00:00Z",
  },
];

export function getNotifications(): AppNotification[] {
  return MOCK_NOTIFICATIONS;
}
