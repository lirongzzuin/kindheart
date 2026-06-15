import { AppShell } from "@/components/AppShell";
import { StoryBrowser } from "@/components/StoryBrowser";
import { LinkButton } from "@/components/ui";
import { MOCK_STORIES } from "@/lib/mock-data";

// 홈 — 사연 둘러보기. 공개 가능한 상태의 사연만 노출.
export default function HomePage() {
  const stories = MOCK_STORIES.filter((s) =>
    ["FUNDING", "FUNDED", "DISBURSING"].includes(s.status)
  );

  return (
    <AppShell>
      {/* Hero */}
      <section className="px-margin-mobile md:px-0 pt-8 pb-12 md:pt-12 md:pb-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-[11px] font-bold tracking-widest uppercase">지금 후원 진행 중</span>
        </div>
        <h1 className="font-headline-xl text-primary leading-[1.1] mb-5">
          당신의 마음이
          <br />
          세상을 <span className="text-secondary">움직입니다</span>
        </h1>
        <p className="font-body-lg text-on-surface-variant/80 max-w-[520px] mb-8 leading-relaxed">
          검증된 사연에 안전하게 후원하고, 후원금이 어떻게 쓰이는지 끝까지 확인하세요. 누구나 동등하게 이용할 수
          있습니다.
        </p>
        <LinkButton href="/browse" variant="secondary" icon="volunteer_activism" className="w-full sm:w-auto px-10">
          후원 시작하기
        </LinkButton>
        <p className="font-label-md text-on-surface-variant/70 mt-5">
          로그인 없이 둘러보기 가능 · 본인인증은 꼭 필요할 때만
        </p>
      </section>

      <StoryBrowser stories={stories} />
    </AppShell>
  );
}
