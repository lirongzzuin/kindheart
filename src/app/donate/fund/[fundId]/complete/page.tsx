import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { LinkButton } from "@/components/ui";
import { getFundById } from "@/lib/mock-data";

export default function FundCompletePage({
  params,
  searchParams,
}: {
  params: { fundId: string };
  searchParams: { receipt?: string };
}) {
  const fund = getFundById(params.fundId);
  const withReceipt = searchParams.receipt === "1";

  return (
    <AppShell hideChrome>
      <div className="px-margin-mobile md:px-0 py-stack-lg flex flex-col items-center text-center gap-stack-md min-h-[60vh] justify-center">
        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
          <Icon name="check_circle" fill size={48} className="text-white" />
        </div>
        <h1 className="font-headline-xl text-primary">기부가 완료되었습니다</h1>
        <p className="font-body-lg text-on-surface-variant max-w-[480px]">
          {fund ? `'${fund.name}'에 ` : ""}따뜻한 기부 감사합니다. 공익법인이 심사 기준에 따라 가장 필요한 곳에
          투명하게 배분합니다.
        </p>

        {withReceipt && (
          <div className="bg-primary-fixed/40 border-l-4 border-primary rounded-xl p-4 text-left max-w-[480px]">
            <p className="font-label-sm text-on-primary-fixed-variant flex items-center gap-1">
              <Icon name="receipt_long" fill size={20} /> 기부금영수증 발급이 신청되었습니다.
            </p>
            <p className="font-body-md text-on-surface-variant mt-1">
              연말정산 시 세액공제를 받으실 수 있습니다. 발급 내역은 &lsquo;내 후원 &gt; 기부금영수증&rsquo;에서
              확인하세요.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-[360px] mt-2">
          {withReceipt && (
            <LinkButton href="/me/receipts" variant="primary" icon="receipt_long">
              기부금영수증 보기
            </LinkButton>
          )}
          {fund && (
            <LinkButton href={`/donate/fund/${fund.id}`} variant="outline" icon="visibility">
              기금 배분 내역 보기
            </LinkButton>
          )}
          <Link href="/browse" className="text-on-surface-variant font-label-sm underline py-2">
            다른 사연 둘러보기
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
