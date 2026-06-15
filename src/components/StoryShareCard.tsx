import { Story, CATEGORY_LABEL } from "@/lib/types";
import { pct, won } from "@/lib/money";
import { Icon } from "./Icon";
import { ShareButton } from "./ShareButton";

/** 사연 공유 카드 — 깔끔한 미니 프리뷰 + 공유 버튼. 한 사연의 확산이 곧 새 후원자. */
export function StoryShareCard({ story }: { story: Story }) {
  const percent = pct(story.raisedAmount, story.goalAmount);
  return (
    <section className="bg-surface-container-low rounded-3xl border border-outline-variant/40 p-5 md:p-6">
      <p className="font-headline-md text-on-surface mb-1 flex items-center gap-2">
        <Icon name="group_add" className="text-secondary" /> 같이 후원할 친구를 불러요
      </p>
      <p className="font-body-md text-on-surface-variant mb-4 leading-relaxed">
        혼자보다 함께면 더 빨리 도울 수 있어요. 친구에게 사연을 보내 같이 후원해요. (후원 전에도 공유할 수 있어요)
      </p>

      {/* 미니 프리뷰 카드 */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 overflow-hidden shadow-soft mb-4">
        <div className="flex items-stretch gap-3">
          <div className="w-24 shrink-0 bg-surface-container-high relative">
            {story.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                <Icon name="image" />
              </div>
            )}
          </div>
          <div className="py-3 pr-3 min-w-0 flex-grow">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
              {CATEGORY_LABEL[story.category]}
            </span>
            <p className="font-label-md text-on-surface font-bold line-clamp-2 leading-snug">{story.title}</p>
            <p className="font-label-md text-on-surface-variant mt-1">
              <span className="text-secondary font-bold">{percent}%</span> · 목표 {won(story.goalAmount)}
            </p>
          </div>
        </div>
      </div>

      <ShareButton
        title={story.title}
        text={`이 사연 같이 후원해요! 🙌 "${story.title}"`}
        path={`/stories/${story.id}`}
        variant="outline"
        label="같이 후원해요"
        imageUrl={story.imageUrl}
        description={story.summary}
        className="w-full"
      />
    </section>
  );
}
