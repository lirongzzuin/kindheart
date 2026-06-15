import Link from "next/link";
import { CATEGORY_LABEL, Story } from "@/lib/types";
import { pct, won } from "@/lib/money";
import { Icon } from "./Icon";
import { ShareButton } from "./ShareButton";
import { LinkButton, ProgressBar } from "./ui";

export function StoryCard({ story }: { story: Story }) {
  const percent = pct(story.raisedAmount, story.goalAmount);
  const verified = story.verificationGrade !== "new";

  return (
    <article className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/30 card-hover">
      <Link href={`/stories/${story.id}`} className="block relative aspect-[16/9] overflow-hidden bg-surface-container-high">
        {story.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
            <Icon name="image" size={56} />
          </div>
        )}
        <span className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md text-on-primary text-[11px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest">
          {CATEGORY_LABEL[story.category]}
        </span>
      </Link>

      <div className="p-6 md:p-8">
        {verified && (
          <div className="flex items-center gap-1.5 mb-3 text-on-tertiary-container">
            <Icon name="verified" fill size={16} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Verified by KindHeart</span>
          </div>
        )}

        <h2 className="font-headline-md text-primary mb-3 leading-tight">
          <Link href={`/stories/${story.id}`} className="hover:underline underline-offset-4">
            {story.title}
          </Link>
        </h2>
        <p className="font-body-md text-on-surface-variant/80 leading-relaxed mb-6 line-clamp-2">{story.summary}</p>

        <div className="flex justify-between items-end mb-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-extrabold text-secondary">{percent}</span>
            <span className="text-base font-bold text-secondary">%</span>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-on-surface-variant/60 uppercase font-bold tracking-tight">목표 금액</p>
            <p className="font-label-md text-primary">{won(story.goalAmount)}</p>
          </div>
        </div>
        <ProgressBar value={percent} size="sm" label={`${story.title} 모금 ${percent}% 달성`} />

        <div className="flex gap-2 mt-6">
          <LinkButton href={`/donate/${story.id}`} variant="primary" className="flex-grow">
            후원하기
          </LinkButton>
          <ShareButton
            title={story.title}
            text={`이 사연 같이 후원해요! 🙌 "${story.title}"`}
            path={`/stories/${story.id}`}
            label="같이 후원해요"
            imageUrl={story.imageUrl}
            description={story.summary}
            iconOnly
          />
        </div>
      </div>
    </article>
  );
}
