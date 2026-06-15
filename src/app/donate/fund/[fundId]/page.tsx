import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Badge, LinkButton } from "@/components/ui";
import { ModeAComingSoon } from "@/components/ModeAGate";
import { FEATURES } from "@/lib/config";
import { getFundAllocations, getFundById } from "@/lib/mock-data";
import { CATEGORY_LABEL } from "@/lib/types";
import { won } from "@/lib/money";

export default function FundDetailPage({ params }: { params: { fundId: string } }) {
  if (!FEATURES.MODE_A) return <ModeAComingSoon />;
  const fund = getFundById(params.fundId);
  if (!fund) notFound();
  const allocations = getFundAllocations(fund.id);

  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge tone="verified" icon="verified">
            공익법인 운영
          </Badge>
          <Badge tone="verified" icon="receipt_long">
            세액공제 가능
          </Badge>
          <Badge tone="neutral">{CATEGORY_LABEL[fund.category]}</Badge>
        </div>

        <h1 className="font-headline-xl text-primary mb-stack-md">{fund.name}</h1>
        <p className="font-body-lg text-on-surface-variant mb-stack-md">{fund.description}</p>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-soft mb-stack-md">
          <span className="font-label-sm text-on-surface-variant">누적 기부금</span>
          <p className="font-headline-lg text-primary mt-1">{won(fund.totalRaised)}</p>
        </section>

        {/* 배분 투명성 — 특정인 지정이 아님을 증명 */}
        <section className="mb-stack-md">
          <h2 className="font-headline-lg-mobile text-on-surface mb-2">기금 배분 내역</h2>
          <p className="font-body-md text-on-surface-variant mb-3">
            공익법인이 심사 기준에 따라 불특정 다수에게 배분한 기록입니다. 기부자가 특정인을 지정하지 않으며,
            가장 도움이 필요한 곳에 투명하게 전달됩니다.
          </p>
          <div className="flex flex-col gap-3">
            {allocations.length === 0 ? (
              <p className="text-on-surface-variant font-body-md">아직 배분 내역이 없습니다.</p>
            ) : (
              allocations.map((a) => (
                <div key={a.id} className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-label-sm text-on-surface-variant">{a.period}</span>
                      <p className="font-body-md font-bold">{a.note}</p>
                      <p className="font-label-sm text-on-surface-variant">
                        수혜 {a.beneficiaryCount}명 · {CATEGORY_LABEL[a.category]}
                      </p>
                    </div>
                    <span className="font-body-lg font-bold text-primary whitespace-nowrap">{won(a.amount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 세액공제 안내 */}
        <section className="mb-stack-md bg-primary-fixed/40 rounded-xl p-4 border-l-4 border-primary">
          <p className="font-label-sm text-on-primary-fixed-variant flex items-center gap-1">
            <Icon name="info" fill size={20} /> 기부금영수증이 발행되어 연말정산 세액공제를 받을 수 있습니다.
          </p>
        </section>

        <LinkButton href={`/donate/fund/${fund.id}/pay`} variant="primary" icon="favorite" className="w-full">
          이 펀드에 기부하기
        </LinkButton>
      </div>
    </AppShell>
  );
}
