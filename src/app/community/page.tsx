import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Badge, LinkButton } from "@/components/ui";
import { MOCK_POSTS } from "@/lib/community-data";
import { COMMUNITY_CATEGORY_LABEL } from "@/lib/types";

// 공개 목록은 자주 안 바뀌므로 ISR 캐시 → 서버 부하/비용 최소화.
export const revalidate = 60;

export default function CommunityPage() {
  const posts = MOCK_POSTS.filter((p) => p.status === "visible");

  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <div className="flex items-center justify-between mb-stack-md gap-4">
          <div>
            <h1 className="font-headline-xl text-primary mb-1">후원자 라운지</h1>
            <p className="font-body-md text-on-surface-variant">후원 경험과 응원을 나누는 공간입니다.</p>
          </div>
          <LinkButton href="/community/new" variant="secondary" icon="edit" ariaLabel="글쓰기">
            글쓰기
          </LinkButton>
        </div>

        {/* 안전 안내 — 악용 방지 고지 */}
        <div className="mb-stack-md bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-start gap-3">
          <Icon name="shield" className="text-primary mt-0.5" />
          <p className="font-label-sm text-on-surface-variant">
            안전을 위해 계좌번호·전화번호·외부 송금 유도·링크는 자동 차단됩니다. 모든 후원은 검증된 결제로만
            이루어집니다.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <article key={p.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <Badge tone="neutral">{COMMUNITY_CATEGORY_LABEL[p.category]}</Badge>
                {p.verifiedDonor && (
                  <Badge tone="verified" icon="verified">
                    후원자
                  </Badge>
                )}
              </div>
              <h2 className="font-body-lg font-bold mb-1">
                <Link href={`/community/${p.id}`} className="hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="font-body-md text-on-surface-variant line-clamp-2 mb-3">{p.body}</p>
              <div className="flex items-center gap-4 text-on-surface-variant font-label-sm">
                <span>{p.authorNickname}</span>
                <span className="flex items-center gap-1">
                  <Icon name="favorite" size={18} /> {p.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="chat_bubble" size={18} /> {p.commentCount}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
