import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { StoryShareCard } from "@/components/StoryShareCard";
import { StoryUpdates } from "@/components/StoryUpdates";
import { Badge, LinkButton, ProgressBar } from "@/components/ui";
import { getStoryById } from "@/lib/mock-data";
import { getStoryUpdates } from "@/lib/impact-data";
import { CATEGORY_LABEL, STORY_STATUS_LABEL } from "@/lib/types";
import { pct, won } from "@/lib/money";

// 공개 읽기 페이지 → ISR 캐시(CDN 엣지 제공)로 서버 연산·비용 최소화.
export const revalidate = 300;

// 사연별 OG/트위터 카드 — 카카오톡·SNS 공유 시 제목·이미지 미리보기 노출(홍보 핵심).
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const story = getStoryById(params.id);
  if (!story) return { title: "사연을 찾을 수 없습니다" };
  const title = `${story.title} | KindHeart`;
  const description = story.summary.slice(0, 120);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: story.imageUrl ? [{ url: story.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: story.imageUrl ? [story.imageUrl] : undefined,
    },
  };
}

export default function StoryDetailPage({ params }: { params: { id: string } }) {
  const story = getStoryById(params.id);
  if (!story) notFound();
  const percent = pct(story.raisedAmount, story.goalAmount);

  return (
    <AppShell>
      <article className="px-margin-mobile md:px-0 py-stack-md">
        {story.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.imageUrl} alt="" className="w-full aspect-[16/9] object-cover rounded-3xl mb-stack-md" />
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge tone="neutral">{CATEGORY_LABEL[story.category]}</Badge>
          {story.verificationGrade !== "new" && (
            <Badge tone="verified" icon="verified">
              검증 완료
            </Badge>
          )}
          <Badge tone="info" icon="account_balance">
            기관 보증 등록
          </Badge>
          <Badge tone="neutral">{STORY_STATUS_LABEL[story.status]}</Badge>
        </div>

        <h1 className="font-headline-xl text-on-surface mb-stack-md">{story.title}</h1>

        {/* 모금 현황 */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-soft mb-stack-md">
          <div className="flex justify-between items-end mb-2">
            <span className="font-headline-lg text-secondary font-bold">{percent}%</span>
            <span className="font-body-md text-on-surface-variant">목표 {won(story.goalAmount)}</span>
          </div>
          <ProgressBar value={percent} label={`모금 ${percent}%`} />
          <p className="font-body-md text-on-surface mt-2 font-bold">{won(story.raisedAmount)} 모금</p>
        </section>

        {/* 본문 */}
        <section className="mb-stack-md">
          <h2 className="font-headline-lg-mobile text-on-surface mb-3">사연 내용</h2>
          <p className="font-body-lg text-on-surface-variant whitespace-pre-line">{story.summary}</p>
          <div className="mt-4 bg-surface-container-low rounded-xl p-4 border-l-4 border-primary">
            <p className="font-label-sm text-primary mb-1 flex items-center gap-1">
              <Icon name="record_voice_over" size={20} /> 쉬운 말 설명
            </p>
            <p className="font-body-md text-on-surface-variant">{story.bodyEasyRead}</p>
          </div>
        </section>

        {/* 사연 소식 — 후원이 만든 변화 직접 확인 */}
        <section className="mb-stack-md">
          <h2 className="font-headline-lg-mobile text-on-surface mb-3 flex items-center gap-2">
            <Icon name="campaign" className="text-secondary" /> 사연 소식
          </h2>
          <StoryUpdates updates={getStoryUpdates(story.id)} />
        </section>

        {/* 분할 지급 계획 */}
        <section className="mb-stack-md">
          <h2 className="font-headline-lg-mobile text-on-surface mb-3">분할 지급 계획</h2>
          <p className="font-body-md text-on-surface-variant mb-3">
            후원금은 한 번에 지급되지 않습니다. 회차마다 사용 증빙을 확인한 뒤 다음 회차를 집행합니다.
          </p>
          <ol className="flex flex-col gap-2">
            {story.disbursementPlan.map((d) => (
              <li
                key={d.round}
                className="flex justify-between items-center bg-surface-container-low rounded-lg p-4 border border-outline-variant"
              >
                <span className="font-label-sm text-on-surface">
                  {d.round}회차 · {d.purpose}
                </span>
                <span className="font-body-md font-bold text-on-surface">{won(d.amount)}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 증빙 — 후원자에게는 "검증됨" 표시만, 원본 비공개 */}
        <section className="mb-stack-md bg-surface-container-low rounded-xl p-4 border border-outline-variant">
          <div className="flex items-center gap-2">
            <Icon name="verified" fill className="text-primary" />
            <p className="font-label-sm text-on-surface">증빙 서류가 발급기관을 통해 검증되었습니다.</p>
          </div>
          <p className="font-label-sm text-on-surface-variant mt-1">
            개인정보 보호를 위해 원본 서류는 공개하지 않으며, 검증 결과만 표시됩니다.
          </p>
        </section>

        <div className="flex flex-col md:flex-row gap-3 mb-stack-md">
          <LinkButton href={`/donate/${story.id}`} variant="secondary" icon="favorite" className="flex-1">
            후원하기
          </LinkButton>
          <LinkButton href={`/stories/${story.id}/transparency`} variant="outline" icon="receipt_long" className="flex-1">
            집행 내역 보기
          </LinkButton>
        </div>

        {/* 공유 카드 */}
        <div className="mb-stack-md">
          <StoryShareCard story={story} />
        </div>

        <div className="text-center border-t border-outline-variant/40 pt-stack-md">
          <Link href={`/stories/${story.id}/report`} className="inline-flex items-center gap-2 text-on-surface-variant font-label-md underline py-2">
            <Icon name="report" /> 이상 사항 제보하기
          </Link>
        </div>
      </article>
    </AppShell>
  );
}
