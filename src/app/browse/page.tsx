import { AppShell } from "@/components/AppShell";
import { StoryBrowser } from "@/components/StoryBrowser";
import { MOCK_STORIES } from "@/lib/mock-data";

export default function BrowsePage() {
  const stories = MOCK_STORIES.filter((s) => ["FUNDING", "FUNDED", "DISBURSING"].includes(s.status));
  return (
    <AppShell>
      <section className="px-margin-mobile md:px-0 py-stack-md">
        <h1 className="font-headline-xl text-on-surface mb-2">사연 둘러보기</h1>
        <p className="font-body-md text-on-surface-variant">검증을 마친 사연들입니다. 마음이 가는 곳에 후원해 주세요.</p>
      </section>
      <StoryBrowser stories={stories} />
    </AppShell>
  );
}
