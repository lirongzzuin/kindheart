import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import { FEATURES } from "@/lib/config";
import { won } from "@/lib/money";

// 기부금영수증 관리 (Mode A). FEATURE_TAX_RECEIPT 활성 시 발행, 아니면 신청 접수 상태.
const MOCK_RECEIPTS = [
  { id: "r1", fund: "긴급의료지원 펀드", amount: 50000, date: "2026-06-10", issued: true },
  { id: "r2", fund: "자립준비청년 응원 펀드", amount: 30000, date: "2026-06-12", issued: false },
];

export default function ReceiptsPage() {
  return (
    <AppShell>
      <AuthGate reason="기부금영수증">
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <h1 className="font-headline-xl text-primary mb-2">기부금영수증</h1>
        <p className="font-body-md text-on-surface-variant mb-stack-md">
          연말정산 세액공제용 기부금영수증입니다. 공익법인 명의로 발행되며 국세청에 연동됩니다.
        </p>

        {!FEATURES.TAX_RECEIPT && (
          <div className="mb-stack-md bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-start gap-3">
            <Icon name="info" className="text-primary mt-0.5" />
            <p className="font-body-md text-on-surface-variant">
              국세청 연동 자동 발급은 준비 중입니다. 신청하신 영수증은 접수되어 발급 가능 시점에 발행됩니다.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {MOCK_RECEIPTS.map((r) => (
            <article
              key={r.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-soft flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0">
                <Icon name="receipt_long" className="text-primary" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-body-md font-bold truncate">{r.fund}</p>
                <p className="font-label-sm text-on-surface-variant">
                  {r.date} · {won(r.amount)}
                </p>
              </div>
              {r.issued ? (
                <Badge tone="verified" icon="verified">
                  발급 완료
                </Badge>
              ) : (
                <Badge tone="neutral" icon="schedule">
                  발급 예정
                </Badge>
              )}
            </article>
          ))}
        </div>
      </div>
      </AuthGate>
    </AppShell>
  );
}
