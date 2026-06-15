import { Icon } from "./Icon";
import { ShareButton } from "./ShareButton";

/** 후원 완료 후 보여주는 공유용 임팩트 카드. 추가 동작 강요 없음(보고, 원하면 공유). */
export function ImpactCard({
  title,
  sharePath,
  message,
  imageUrl,
  description,
}: {
  title: string;
  sharePath: string;
  message?: string;
  imageUrl?: string | null;
  description?: string;
}) {
  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="relative bg-primary text-on-primary rounded-3xl p-8 shadow-elevated overflow-hidden bg-pattern">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-fixed/15 rounded-full blur-2xl" />
        <div className="relative">
          <Icon name="favorite" fill size={40} className="text-primary-fixed-dim" />
          <p className="font-label-md text-primary-fixed-dim mt-4 uppercase tracking-widest">My Impact</p>
          <p className="font-headline-md leading-snug mt-1">{message ?? "당신의 마음이 이웃에게 닿았어요"}</p>
          <p className="font-body-md text-on-primary/80 mt-3 leading-relaxed">
            &ldquo;{title}&rdquo; 사연과 함께합니다. 진행 소식과 사용 내역을 끝까지 확인하실 수 있어요.
          </p>
          <div className="mt-6 pt-5 border-t border-on-primary/15 flex items-center gap-2 text-primary-fixed-dim">
            <Icon name="volunteer_activism" fill size={20} />
            <span className="font-label-md">KindHeart</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <ShareButton
          title={title}
          text={`저는 방금 이 사연을 후원했어요. 같이 후원해요! 🙌 "${title}"`}
          path={sharePath}
          variant="outline"
          label="같이 후원하자고 공유"
          imageUrl={imageUrl}
          description={description}
        />
      </div>
    </div>
  );
}
