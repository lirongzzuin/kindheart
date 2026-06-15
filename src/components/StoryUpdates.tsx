import { Icon } from "./Icon";
import { Badge } from "./ui";
import { StoryUpdate } from "@/lib/types";

/** 사연 소식(후기) — 후원자가 "내 후원이 만든 변화"를 직접 확인. 보기 전용(추가 동작 없음). */
export function StoryUpdates({ updates }: { updates: StoryUpdate[] }) {
  if (updates.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-2xl border border-outline-variant/40 p-6 text-center">
        <Icon name="photo_camera" className="text-on-surface-variant/50" size={28} />
        <p className="font-body-md text-on-surface-variant mt-2">아직 소식이 없어요. 후원하시면 진행 소식을 받아보실 수 있어요.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {updates.map((u) => (
        <article key={u.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-5 shadow-soft">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-label-md text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString("ko-KR")}</span>
            {u.verified && (
              <Badge tone="verified" icon="verified">
                확인된 소식
              </Badge>
            )}
          </div>
          <h3 className="font-headline-md text-on-surface mb-2">{u.title}</h3>
          {u.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.imageUrl} alt="" className="w-full aspect-[16/9] object-cover rounded-xl mb-3" />
          )}
          <p className="font-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">{u.body}</p>
          {u.disbursementRound != null && (
            <p className="font-label-md text-primary mt-3 flex items-center gap-1">
              <Icon name="receipt_long" size={18} /> {u.disbursementRound}회차 집행과 연결된 소식
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
