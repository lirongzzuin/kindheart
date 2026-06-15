import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { DonationCheckoutA } from "@/components/DonationCheckoutA";
import { ModeAComingSoon } from "@/components/ModeAGate";
import { FEATURES } from "@/lib/config";
import { getFundById } from "@/lib/mock-data";

export default function FundPayPage({ params }: { params: { fundId: string } }) {
  if (!FEATURES.MODE_A) return <ModeAComingSoon />;
  const fund = getFundById(params.fundId);
  if (!fund) notFound();

  return (
    <AppShell hideChrome>
      <AuthGate reason="기부 결제">
        <div className="px-margin-mobile md:px-0 pt-stack-md">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-primary mb-stack-md">기부 결제</h1>
        </div>
        <DonationCheckoutA fundId={fund.id} fundName={fund.name} />
      </AuthGate>
    </AppShell>
  );
}
