import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { AccountBar } from "@/components/AccountBar";
import { Icon } from "@/components/Icon";
import { LinkButton } from "@/components/ui";
import { MOCK_STORIES } from "@/lib/mock-data";
import { getDemoImpactStats } from "@/lib/impact-data";
import { getBadges, getLevel, impactHeadline, BADGE_DEFS } from "@/lib/gamification";
import { FEATURES } from "@/lib/config";
import { won } from "@/lib/money";

// 내 나눔 — 임팩트 대시보드(레벨·배지·통계). 보기 전용, 추가 동작 강요 없음.
export default function GivingPage() {
  const stats = getDemoImpactStats();
  const { level, next, progressPct, toNext } = getLevel(stats.totalDonated);
  const earned = getBadges(stats);
  const earnedKeys = new Set(earned.map((b) => b.key));
  const recent = MOCK_STORIES.slice(0, 2);

  return (
    <AppShell>
      <AuthGate reason="내 나눔">
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <h1 className="font-headline-xl text-primary mb-6">내 나눔</h1>
        <AccountBar />

        {/* 레벨 카드 */}
        <section className="bg-primary text-on-primary rounded-3xl p-6 md:p-8 shadow-elevated bg-pattern relative overflow-hidden mb-6">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-fixed/15 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-on-primary/10 flex items-center justify-center shrink-0">
              <Icon name={level.icon} fill size={36} className="text-primary-fixed-dim" />
            </div>
            <div className="min-w-0">
              <p className="font-label-md text-primary-fixed-dim uppercase tracking-widest">나눔 레벨</p>
              <p className="font-headline-md">{level.name}</p>
              <p className="font-body-md text-on-primary/80">{impactHeadline(stats)}</p>
            </div>
          </div>
          {next && (
            <div className="relative mt-5">
              <div className="w-full h-2 bg-on-primary/15 rounded-full overflow-hidden">
                <div className="h-full bg-primary-fixed-dim rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="font-label-md text-on-primary/80 mt-2">
                다음 단계 &lsquo;{next.name}&rsquo;까지 {won(toNext)}
              </p>
            </div>
          )}
        </section>

        {/* 임팩트 통계 */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat icon="volunteer_activism" label="누적 후원" value={won(stats.totalDonated)} />
          <Stat icon="favorite" label="함께한 사연" value={`${stats.storiesSupported}개`} />
          <Stat icon="verified" label="완주한 사연" value={`${stats.completedStories}개`} />
          <Stat icon="mail" label="받은 감사" value={`${stats.thanksReceived}개`} />
        </section>

        {/* 배지 */}
        <section className="mb-6">
          <h2 className="font-headline-lg-mobile text-on-surface mb-3">나눔 배지</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BADGE_DEFS.map((b) => {
              const has = earnedKeys.has(b.key);
              return (
                <div
                  key={b.key}
                  className={`rounded-2xl border p-4 flex flex-col items-center text-center gap-1 ${
                    has ? "bg-primary-fixed/30 border-primary/20" : "bg-surface-container-low border-outline-variant/40 opacity-50"
                  }`}
                >
                  <Icon name={b.icon} fill={has} size={28} className={has ? "text-primary" : "text-on-surface-variant"} />
                  <p className="font-label-md text-on-surface">{b.name}</p>
                  <p className="text-[12px] text-on-surface-variant leading-tight">{b.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 관리 바로가기 */}
        <div className="flex flex-col gap-3 mb-6">
          <LinkButton href="/me/notifications" variant="primary" icon="notifications" className="w-full">
            소식·알림 보기
          </LinkButton>
          <LinkButton href="/me/subscriptions" variant="outline" icon="autorenew" className="w-full">
            정기후원 관리
          </LinkButton>
          {FEATURES.MODE_A && (
            <LinkButton href="/me/receipts" variant="outline" icon="receipt_long" className="w-full">
              기부금영수증 보기
            </LinkButton>
          )}
        </div>

        {/* 후원 중인 사연 */}
        <h2 className="font-headline-lg-mobile text-on-surface mb-3">후원 중인 사연</h2>
        <div className="flex flex-col gap-4">
          {recent.map((s) => (
            <article key={s.id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 shadow-soft flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-surface-variant flex items-center justify-center shrink-0">
                <Icon name="favorite" fill className="text-secondary" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-body-md font-bold truncate">{s.title}</p>
                <p className="font-label-md text-on-surface-variant">소식·집행 내역 확인 가능</p>
              </div>
              <LinkButton href={`/stories/${s.id}`} variant="outline" className="px-4 shrink-0">
                보기
              </LinkButton>
            </article>
          ))}
        </div>
      </div>
      </AuthGate>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 shadow-soft">
      <Icon name={icon} fill className="text-primary" size={22} />
      <p className="font-label-md text-on-surface-variant mt-1">{label}</p>
      <p className="font-headline-md text-on-surface">{value}</p>
    </div>
  );
}
