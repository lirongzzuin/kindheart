import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { Icon } from "@/components/Icon";
import { getNotifications } from "@/lib/impact-data";
import { NotificationType } from "@/lib/types";

const ICON: Record<NotificationType, { name: string; tone: string }> = {
  story_update: { name: "campaign", tone: "text-secondary" },
  disbursement: { name: "receipt_long", tone: "text-primary" },
  goal_reached: { name: "flag", tone: "text-primary" },
  completed: { name: "verified", tone: "text-primary" },
  thanks: { name: "mail", tone: "text-secondary" },
  badge: { name: "emoji_events", tone: "text-on-tertiary-container" },
};

// 알림 — 후원한 사연의 소식·집행·완주·감사. 보기 전용(읽음 강요 없음).
export default function NotificationsPage() {
  const items = getNotifications();

  return (
    <AppShell>
      <AuthGate reason="소식·알림">
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <h1 className="font-headline-xl text-primary mb-2">소식·알림</h1>
        <p className="font-body-md text-on-surface-variant mb-stack-md">
          내가 후원한 사연의 진행 소식과 변화를 모아서 보여드려요.
        </p>

        {items.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/40 p-8 text-center">
            <Icon name="notifications_off" className="text-on-surface-variant/50" size={32} />
            <p className="font-body-md text-on-surface-variant mt-2">아직 새 소식이 없어요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((n) => {
              const ic = ICON[n.type];
              const inner = (
                <div
                  className={`flex gap-4 p-4 rounded-2xl border transition-colors ${
                    n.read ? "bg-surface-container-lowest border-outline-variant/40" : "bg-primary-fixed/20 border-primary/20"
                  } ${n.href ? "hover:bg-surface-container-low" : ""}`}
                >
                  <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
                    <Icon name={ic.name} fill className={ic.tone} />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-secondary shrink-0" aria-label="안 읽음" />}
                      <p className="font-label-md text-on-surface font-bold truncate">{n.title}</p>
                    </div>
                    <p className="font-body-md text-on-surface-variant leading-snug mt-0.5">{n.body}</p>
                    <p className="text-[12px] text-on-surface-variant/60 mt-1">
                      {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  {n.href && <Icon name="chevron_right" className="text-outline-variant self-center shrink-0" />}
                </div>
              );
              return n.href ? (
                <Link key={n.id} href={n.href}>
                  {inner}
                </Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>
      </AuthGate>
    </AppShell>
  );
}
