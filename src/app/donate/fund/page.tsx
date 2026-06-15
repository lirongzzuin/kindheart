import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Badge, LinkButton } from "@/components/ui";
import { ModeAComingSoon } from "@/components/ModeAGate";
import { FEATURES } from "@/lib/config";
import { MOCK_FUNDS } from "@/lib/mock-data";
import { CATEGORY_LABEL } from "@/lib/types";
import { won } from "@/lib/money";

// Mode A — 펀드(불특정 다수) 선택. 특정인 지정 불가(세액공제 성립 요건).
export default function FundListPage() {
  if (!FEATURES.MODE_A) return <ModeAComingSoon />;
  const funds = MOCK_FUNDS.filter((f) => f.active);

  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <div className="flex items-center gap-2 mb-2">
          <Badge tone="verified" icon="receipt_long">
            연말정산 세액공제
          </Badge>
        </div>
        <h1 className="font-headline-xl text-primary mb-2">기부할 펀드를 골라주세요</h1>
        <p className="font-body-md text-on-surface-variant mb-stack-md">
          공익법인이 운영하는 펀드에 기부합니다. 검증된 기관이 <b>가장 필요한 곳에 배분</b>하며, 기부금영수증이
          발행됩니다. (특정 개인을 지정할 수 없습니다 — 세액공제 요건)
        </p>

        <div className="flex flex-col gap-4">
          {funds.map((f) => (
            <article
              key={f.id}
              className="bg-surface-container-lowest border-2 border-primary/20 rounded-2xl p-6 shadow-soft flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-primary-fixed text-on-primary-fixed-variant rounded-xl">
                  <Icon name="diversity_1" fill size={32} />
                </div>
                <Badge tone="neutral">{CATEGORY_LABEL[f.category]}</Badge>
              </div>
              <h2 className="font-headline-lg-mobile text-primary">
                <Link href={`/donate/fund/${f.id}`} className="hover:underline">
                  {f.name}
                </Link>
              </h2>
              <p className="font-body-md text-on-surface-variant">{f.description}</p>
              <p className="font-label-sm text-on-surface-variant">누적 기부 {won(f.totalRaised)}</p>
              <LinkButton href={`/donate/fund/${f.id}`} variant="primary" icon="chevron_right" className="w-full mt-1">
                이 펀드에 기부하기
              </LinkButton>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
