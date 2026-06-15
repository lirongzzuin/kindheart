import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { getStoryById, MOCK_DISBURSEMENTS, MOCK_USAGE_REPORTS } from "@/lib/mock-data";
import { wonSymbol } from "@/lib/money";
import { Disbursement } from "@/lib/types";

export const revalidate = 300; // ISR — 집행 내역도 CDN 캐시(비용 최소화)

const STATUS_BADGE: Record<Disbursement["status"], { label: string; cls: string }> = {
  PAID: { label: "지급 완료", cls: "bg-primary text-on-primary" },
  HELD: { label: "검토 중", cls: "bg-surface-variant text-on-surface-variant" },
  PENDING: { label: "예정", cls: "bg-surface-variant text-on-surface-variant" },
  BLOCKED: { label: "증빙 대기로 보류", cls: "bg-error-container text-on-error-container" },
};

export default function TransparencyPage({ params }: { params: { id: string } }) {
  const story = getStoryById(params.id);
  if (!story) notFound();

  const disbursements = MOCK_DISBURSEMENTS[story.id] ?? [];
  const reports = MOCK_USAGE_REPORTS[story.id] ?? [];
  const disbursed = disbursements.filter((d) => d.status === "PAID").reduce((s, d) => s + d.amount, 0);
  const remaining = Math.max(0, story.raisedAmount - disbursed);
  const reportByRound = new Map(reports.map((r) => [r.disbursementRound, r]));

  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <Link href={`/stories/${story.id}`} className="flex items-center gap-2 mb-stack-md text-primary font-label-sm">
          <Icon name="arrow_back" /> 사연으로 돌아가기
        </Link>

        <section className="mb-stack-lg">
          <h1 className="font-headline-xl mb-2">투명한 후원금 집행 내역</h1>
          <p className="font-body-md text-on-surface-variant">
            후원자님의 마음이 어떻게 전달되고 있는지 투명하게 공개합니다. (개인정보는 비식별 처리됩니다)
          </p>
        </section>

        {/* 재무 요약 */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-elevated mb-stack-lg">
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">총 후원금액</span>
          <p className="font-headline-lg text-primary mt-1">{wonSymbol(story.raisedAmount)}</p>
          <div className="grid grid-cols-2 gap-4 border-t border-outline-variant pt-6 mt-6">
            <div>
              <span className="font-label-sm text-on-surface-variant">집행 완료</span>
              <p className="font-body-lg font-bold">{wonSymbol(disbursed)}</p>
            </div>
            <div>
              <span className="font-label-sm text-on-surface-variant">잔액</span>
              <p className="font-body-lg font-bold text-secondary">{wonSymbol(remaining)}</p>
            </div>
          </div>
        </section>

        {/* 회차별 타임라인 */}
        <section className="mb-stack-lg">
          <h2 className="font-headline-lg-mobile mb-stack-md">회차별 집행 상세</h2>
          <ol className="flex flex-col gap-6 relative before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-outline-variant">
            {disbursements.length === 0 && (
              <p className="text-on-surface-variant font-body-md">아직 집행 내역이 없습니다.</p>
            )}
            {disbursements
              .slice()
              .reverse()
              .map((d) => {
                const paid = d.status === "PAID";
                const report = reportByRound.get(d.round);
                const badge = STATUS_BADGE[d.status];
                return (
                  <li key={d.id} className="relative pl-16">
                    <div
                      className={`absolute left-0 top-1 w-12 h-12 rounded-full flex items-center justify-center z-10 border-2 ${
                        paid ? "bg-primary-container border-primary-container" : "bg-surface-container border-outline"
                      }`}
                    >
                      <Icon
                        name={paid ? "check_circle" : "schedule"}
                        fill={paid}
                        className={paid ? "text-white" : "text-outline"}
                      />
                    </div>
                    <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div>
                          <span className="font-label-sm text-on-surface-variant">{d.scheduledDate}</span>
                          <h3 className="font-body-lg font-bold">
                            {d.round}회차: {story.disbursementPlan.find((p) => p.round === d.round)?.purpose}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-4 gap-2 flex-wrap">
                        <span className="font-headline-lg-mobile font-bold">{wonSymbol(d.amount)}</span>
                        {report?.verified && (
                          <span className="flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1.5 rounded-lg">
                            <Icon name="verified" size={18} />
                            <span className="text-sm font-bold">사용 증빙 검증됨</span>
                          </span>
                        )}
                      </div>
                      {report && (
                        <p className="font-label-sm text-on-surface-variant mt-3 border-t border-outline-variant pt-3">
                          <b>{report.category}</b> · {report.publicNote}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
          </ol>
        </section>

        <section className="border-t border-outline-variant pt-8 text-center">
          <p className="font-body-md text-on-surface-variant mb-4">이상한 점을 발견하셨나요?</p>
          <Link
            href={`/stories/${story.id}/report`}
            className="inline-flex items-center gap-2 text-primary font-bold underline py-2 px-4"
          >
            <Icon name="report" /> 이상 사항 제보하기
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
