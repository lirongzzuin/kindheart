import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import { AdminAction } from "@/components/AdminAction";
import { requireAdmin } from "@/lib/admin-auth";
import {
  ADMIN_METRICS,
  PENDING_DISBURSEMENTS,
  REPORTED_ITEMS,
  REVIEW_QUEUE,
} from "@/lib/admin-data";
import { won } from "@/lib/money";

export const dynamic = "force-dynamic"; // 운영 데이터는 항상 최신

// 운영자 대시보드 — 비기술자가 한 화면에서 심사·지급·신고를 처리.
export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/login");

  return (
    <AppShell hideChrome>
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <h1 className="font-headline-xl text-primary mb-1">운영 관리</h1>
        <p className="font-body-md text-on-surface-variant mb-stack-md">
          하루 한 번, 이 화면만 확인하시면 됩니다. ① 사연 심사 → ② 지급 승인 → ③ 신고 처리 순서로 보세요.
        </p>

        {admin.demo && (
          <div className="mb-stack-md bg-error-container/40 border border-error rounded-xl p-3 font-label-sm text-on-error-container">
            데모 모드입니다. 실제 운영에서는 운영자(admin) 로그인 사용자만 접근할 수 있습니다.
          </div>
        )}

        {/* 핵심 지표 */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-stack-lg">
          <Metric icon="fact_check" label="심사 대기" value={`${ADMIN_METRICS.reviewPending}건`} highlight />
          <Metric icon="payments" label="지급 대기" value={`${ADMIN_METRICS.disbursementPending}건`} highlight />
          <Metric icon="flag" label="신고 대기" value={`${ADMIN_METRICS.reportsPending}건`} highlight />
          <Metric icon="volunteer_activism" label="오늘 후원" value={won(ADMIN_METRICS.todayDonationAmount)} />
          <Metric icon="receipt" label="오늘 건수" value={`${ADMIN_METRICS.todayDonationCount}건`} />
          <Metric icon="autorenew" label="정기후원" value={`${ADMIN_METRICS.activeSubscriptions}명`} />
        </section>

        {/* ① 사연 심사 */}
        <Section title="① 사연 심사" hint="증빙·위험점수를 보고 승인 또는 반려하세요. 빨간 항목은 주의가 필요합니다.">
          {REVIEW_QUEUE.map((r) => {
            const risky = r.riskScore >= 40 || !r.evidenceVerified || r.plagiarismScore > 0.3;
            return (
              <div
                key={r.id}
                className={`bg-surface-container-lowest border rounded-xl p-5 ${risky ? "border-error" : "border-outline-variant"}`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-body-lg font-bold">{r.title}</h3>
                  {risky && <Badge tone="warning" icon="warning">주의</Badge>}
                </div>
                <div className="flex flex-wrap gap-2 mb-3 font-label-sm text-on-surface-variant">
                  <span>{r.applicant}</span>·<span>목표 {won(r.goalAmount)}</span>·
                  <span className={r.riskScore >= 40 ? "text-error font-bold" : ""}>위험 {r.riskScore}</span>·
                  <span className={r.evidenceVerified ? "text-primary" : "text-error font-bold"}>
                    증빙 {r.evidenceVerified ? "검증됨" : "미검증"}
                  </span>
                  ·
                  <span className={r.plagiarismScore > 0.3 ? "text-error font-bold" : ""}>
                    유사도 {(r.plagiarismScore * 100).toFixed(0)}%
                  </span>
                </div>
                {r.needsDualReview && (
                  <p className="mb-3 font-label-sm text-secondary flex items-center gap-1">
                    <Icon name="groups" size={18} /> 금액이 커서 2인 교차심사 + 화상 인터뷰가 필요합니다.
                  </p>
                )}
                <AdminAction
                  kind="review"
                  id={r.id}
                  actions={[
                    { action: "approve", label: "승인", tone: "primary" },
                    { action: "reject", label: "반려", tone: "danger" },
                  ]}
                />
              </div>
            );
          })}
        </Section>

        {/* ② 지급 승인 */}
        <Section title="② 지급 승인" hint="직전 회차 사용 증빙이 확인된 건만 집행할 수 있습니다(먹튀 방지).">
          {PENDING_DISBURSEMENTS.map((d) => {
            const blocked = d.prevRound !== null && !d.prevUsageVerified;
            return (
              <div key={d.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-body-lg font-bold">{d.storyTitle}</h3>
                    <p className="font-label-sm text-on-surface-variant">
                      {d.round}회차 · {won(d.amount)} · 예정 {d.scheduledDate}
                    </p>
                  </div>
                  {blocked ? (
                    <Badge tone="warning" icon="block">증빙 대기</Badge>
                  ) : (
                    <Badge tone="verified" icon="verified">집행 가능</Badge>
                  )}
                </div>
                {blocked ? (
                  <p className="font-label-sm text-error">
                    {d.prevRound}회차 사용 증빙이 제출·검증되어야 집행할 수 있습니다.
                  </p>
                ) : (
                  <AdminAction
                    kind="disbursement"
                    id={d.id}
                    actions={[{ action: "release", label: "집행 승인", tone: "primary" }]}
                  />
                )}
              </div>
            );
          })}
        </Section>

        {/* ③ 신고 처리 */}
        <Section title="③ 신고 처리" hint="신고 3건 이상이면 자동으로 숨겨집니다. 확인 후 숨김/복원하세요.">
          {REPORTED_ITEMS.length === 0 ? (
            <p className="text-on-surface-variant font-body-md">처리할 신고가 없습니다. 👍</p>
          ) : (
            REPORTED_ITEMS.map((it) => (
              <div key={it.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone="neutral">{it.type}</Badge>
                  <Badge tone="warning">신고 {it.reportCount}</Badge>
                </div>
                <p className="font-body-md mb-1">{it.preview}</p>
                <p className="font-label-sm text-on-surface-variant mb-3">사유: {it.reason}</p>
                <AdminAction
                  kind="content"
                  id={it.id}
                  actions={[
                    { action: "hide", label: "숨김", tone: "danger" },
                    { action: "restore", label: "복원", tone: "neutral" },
                  ]}
                />
              </div>
            ))
          )}
        </Section>
      </div>
    </AppShell>
  );
}

function Metric({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "bg-primary-fixed/40 border-primary/30" : "bg-surface-container-lowest border-outline-variant"}`}>
      <Icon name={icon} className="text-primary" />
      <p className="font-label-sm text-on-surface-variant mt-1">{label}</p>
      <p className="font-headline-lg-mobile text-on-surface">{value}</p>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="mb-stack-lg">
      <h2 className="font-headline-lg-mobile text-on-surface mb-1">{title}</h2>
      <p className="font-label-sm text-on-surface-variant mb-3">{hint}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
