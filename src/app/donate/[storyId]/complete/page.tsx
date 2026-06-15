import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { ImpactCard } from "@/components/ImpactCard";
import { LinkButton } from "@/components/ui";
import { getStoryById } from "@/lib/mock-data";

export default function CompletePage({ params }: { params: { storyId: string } }) {
  const story = getStoryById(params.storyId);

  return (
    <AppShell hideChrome>
      <div className="px-margin-mobile md:px-0 py-stack-lg flex flex-col items-center text-center gap-6 justify-center">
        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
          <Icon name="check_circle" fill size={48} className="text-white" />
        </div>
        <h1 className="font-headline-xl text-primary">후원이 완료되었습니다</h1>
        <p className="font-body-lg text-on-surface-variant max-w-[480px]">
          따뜻한 마음 감사합니다. 후원금은 분할 지급되며, 진행 소식과 사용 내역을 끝까지 확인하실 수 있어요.
        </p>

        {story && (
          <ImpactCard
            title={story.title}
            sharePath={`/stories/${story.id}`}
            imageUrl={story.imageUrl}
            description={story.summary}
          />
        )}

        <div className="flex flex-col gap-3 w-full max-w-[360px] mt-2">
          {story && (
            <LinkButton href={`/stories/${story.id}/transparency`} variant="primary" icon="receipt_long">
              집행 내역 보기
            </LinkButton>
          )}
          <LinkButton href="/me/giving" variant="outline" icon="emoji_events">
            내 나눔 임팩트 보기
          </LinkButton>
          <Link href="/browse" className="text-on-surface-variant font-label-md underline py-2">
            다른 사연 둘러보기
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
