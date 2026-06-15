"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { SUPPORT_PHONE, SHOW_PHONE_SUPPORT } from "@/lib/config";
import { won } from "@/lib/money";

type Sub = { id: string; title: string; amount: number; nextDate: string; icon: string; canceled?: boolean };

const INITIAL: Sub[] = [
  { id: "s1", title: "국내 결식 아동 식사 지원", amount: 30000, nextDate: "2026년 7월 25일", icon: "restaurant" },
  { id: "s2", title: "홀몸 어르신 겨울나기 지원", amount: 50000, nextDate: "2026년 7월 12일", icon: "elderly" },
];

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>(INITIAL);
  const [target, setTarget] = useState<Sub | null>(null);
  const [toast, setToast] = useState(false);

  async function cancel() {
    if (!target) return;
    // 원클릭 해지 — 빌링키 해지 어댑터 호출 (mock)
    await fetch("/api/subscriptions/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: target.id }),
    }).catch(() => {});
    setSubs((list) => list.map((s) => (s.id === target.id ? { ...s, canceled: true } : s)));
    setTarget(null);
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  }

  return (
    <AppShell>
      <AuthGate reason="정기후원 관리">
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <h1 className="font-headline-xl text-primary mb-2">정기후원 관리</h1>
        <p className="font-body-lg text-on-surface-variant mb-stack-md">
          후원 내용을 자유롭게 관리하세요. 해지는 원클릭으로 간편하게 가능합니다.
        </p>

        <div className="flex flex-col gap-stack-md">
          {subs.map((s) => (
            <article
              key={s.id}
              className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-soft relative overflow-hidden ${
                s.canceled ? "opacity-60" : ""
              }`}
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="bg-primary-fixed text-on-primary-fixed-variant px-2 py-1 rounded font-label-sm text-sm inline-block mb-2">
                    {s.canceled ? "해지됨" : "정기 후원 중"}
                  </span>
                  <h2 className="font-headline-lg text-on-surface">{s.title}</h2>
                </div>
                <Icon name={s.icon} className="text-outline" size={36} />
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-surface-container">
                <div>
                  <p className="font-label-sm text-on-surface-variant">매월 후원 금액</p>
                  <p className="font-headline-lg text-primary">{won(s.amount)}</p>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">다음 결제 예정일</p>
                  <p className="font-body-lg font-bold">{s.canceled ? "—" : s.nextDate}</p>
                </div>
              </div>
              {!s.canceled && (
                <div className="flex flex-col gap-3 mt-4">
                  <Button variant="outline" className="w-full">
                    금액 변경
                  </Button>
                  <button
                    onClick={() => setTarget(s)}
                    className="w-full text-secondary font-label-sm underline py-2 min-h-touch-target-min"
                  >
                    후원 해지하기
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* 전화 해지 대체수단 — 콜센터 가동 전 우선 숨김 */}
        {SHOW_PHONE_SUPPORT && (
          <section className="mt-stack-lg p-6 bg-surface-variant rounded-2xl border-2 border-dashed border-outline">
            <div className="flex items-start gap-4">
              <Icon name="support_agent" className="text-secondary" size={44} />
              <div>
                <h3 className="font-headline-lg-mobile text-on-surface mb-2">전화로 해지하기</h3>
                <p className="font-body-md text-on-surface-variant mb-4">
                  온라인 해지가 어려우시면 전화 주시면 상담원이 도와드립니다.
                </p>
                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="inline-flex items-center gap-2 bg-secondary text-white font-button-text px-6 min-h-touch-target-min rounded-xl shadow-md active:scale-95 transition-transform"
                >
                  <Icon name="call" /> {SUPPORT_PHONE} (무료전화)
                </a>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 해지 확인 모달 */}
      {target && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setTarget(null)}
        >
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h3 className="font-headline-lg mb-4">정말 해지하시겠어요?</h3>
            <p className="font-body-lg text-on-surface-variant mb-8">
              <b className="text-primary">{target.title}</b> 후원이 중단되면 도움이 필요한 분께 전달되던 지원이
              멈추게 됩니다.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={cancel}
                className="w-full bg-error text-white font-button-text min-h-touch-target-min py-4 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                네, 해지하겠습니다
              </button>
              <button
                onClick={() => setTarget(null)}
                className="w-full bg-surface-container-high text-on-surface font-button-text min-h-touch-target-min py-4 rounded-xl"
              >
                아니요, 계속 후원할게요
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-4 right-4 max-w-[500px] mx-auto z-[70]" role="status">
          <div className="bg-primary text-white p-6 rounded-2xl shadow-2xl flex items-center gap-4">
            <Icon name="check_circle" fill size={32} />
            <div>
              <p className="font-headline-lg-mobile">해지가 완료되었습니다</p>
              <p className="font-body-md opacity-90">그동안 나눠 주신 따뜻한 마음에 감사드립니다.</p>
            </div>
          </div>
        </div>
      )}
      </AuthGate>
    </AppShell>
  );
}
