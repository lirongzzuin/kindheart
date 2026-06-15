/** 커뮤니티 mock 저장소. 닉네임만 노출(PII 비저장). 실제는 DB. */
import { CommunityComment, CommunityPost } from "./types";

export const MOCK_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    authorId: "u-1",
    authorNickname: "따뜻한오후",
    category: "thanks",
    title: "김어르신 사연에 후원했어요",
    body: "집행 내역이 회차별로 다 공개되니까 믿고 후원했습니다. 작은 금액이지만 보람이 크네요.",
    status: "visible",
    likeCount: 24,
    commentCount: 2,
    verifiedDonor: true,
    createdAt: "2026-06-12T09:00:00Z",
  },
  {
    id: "post-2",
    authorId: "u-2",
    authorNickname: "민들레씨",
    category: "story_share",
    title: "정기후원 시작했습니다 :)",
    body: "매달 3만원씩 자립준비청년 사연을 응원하기로 했어요. 다음 회차 사용내역이 기대됩니다.",
    status: "visible",
    likeCount: 11,
    commentCount: 1,
    verifiedDonor: true,
    createdAt: "2026-06-13T14:20:00Z",
  },
  {
    id: "post-3",
    authorId: "u-3",
    authorNickname: "궁금이",
    category: "question",
    title: "세액공제 기부는 언제 열리나요?",
    body: "특정인 후원은 세액공제가 안 된다고 해서요. 불특정 다수 기부는 언제 가능한가요?",
    status: "visible",
    likeCount: 3,
    commentCount: 0,
    verifiedDonor: false,
    createdAt: "2026-06-14T08:00:00Z",
  },
];

export const MOCK_COMMENTS: Record<string, CommunityComment[]> = {
  "post-1": [
    { id: "c-1", postId: "post-1", authorId: "u-9", authorNickname: "햇살가득", body: "저도 같은 사연 후원했어요! 함께해요.", status: "visible", createdAt: "2026-06-12T10:00:00Z" },
    { id: "c-2", postId: "post-1", authorId: "u-8", authorNickname: "나눔러", body: "투명하게 공개되는 게 정말 좋네요.", status: "visible", createdAt: "2026-06-12T11:30:00Z" },
  ],
  "post-2": [
    { id: "c-3", postId: "post-2", authorId: "u-7", authorNickname: "응원단", body: "멋져요! 정기후원 동참합니다.", status: "visible", createdAt: "2026-06-13T15:00:00Z" },
  ],
};

export function getPostById(id: string): CommunityPost | undefined {
  return MOCK_POSTS.find((p) => p.id === id);
}
export function getComments(postId: string): CommunityComment[] {
  return MOCK_COMMENTS[postId] ?? [];
}
