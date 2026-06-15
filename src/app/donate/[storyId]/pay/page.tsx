import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { DonationCheckout } from "@/components/DonationCheckout";
import { getStoryById } from "@/lib/mock-data";
import { assertStoryFundable } from "@/lib/rules";

export default function PayPage({ params }: { params: { storyId: string } }) {
  const story = getStoryById(params.storyId);
  if (!story) notFound();
  // 후원 가능 상태 검증 (서버에서 1차 차단)
  try {
    assertStoryFundable(story);
  } catch {
    notFound();
  }

  return (
    <AppShell hideChrome>
      <AuthGate reason="후원 결제">
        <div className="px-margin-mobile md:px-0 pt-stack-md">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-primary mb-stack-md">후원 결제</h1>
        </div>
        <DonationCheckout storyId={story.id} storyTitle={story.title} />
      </AuthGate>
    </AppShell>
  );
}
