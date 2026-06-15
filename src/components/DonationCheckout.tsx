"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { PAYMENT_METHODS } from "@/lib/adapters/payment";
import { calcFee } from "@/lib/fees";
import { DonationMode, PaymentMethod, PaymentType } from "@/lib/types";
import { won } from "@/lib/money";

const PRESETS = [10000, 30000, 50000, 100000];

export function DonationCheckout({
  storyId,
  storyTitle,
}: {
  storyId: string;
  storyTitle: string;
}) {
  const router = useRouter();
  const [paymentType, setPaymentType] = useState<PaymentType>("ONE_TIME");
  const [amount, setAmount] = useState<number>(30000);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("kakaopay");
  const [coversFee, setCoversFee] = useState(true); // 전액 전달 옵션 기본 ON
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeNoTax, setAgreeNoTax] = useState(false); // Mode B 필수 동의
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fee = useMemo(() => calcFee(amount, DonationMode.B_DIRECT_SUPPORT, coversFee), [amount, coversFee]);
  const canSubmit = amount > 0 && agreePrivacy && agreeNoTax && !submitting;

  function pickPreset(v: number) {
    setAmount(v);
    setCustom("");
  }
  function onCustom(v: string) {
    const n = Number(v.replace(/[^0-9]/g, ""));
    setCustom(v.replace(/[^0-9]/g, ""));
    setAmount(Number.isFinite(n) ? n : 0);
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "B",
          storyId,
          amount,
          method,
          paymentType,
          coversFee,
          agreePrivacy,
          agreeNoTax,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "결제에 실패했습니다.");
      router.push(`/donate/${storyId}/complete?donation=${data.donationId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <div className="px-margin-mobile md:px-0 pb-40">
      {/* 요약 */}
      <section className="bg-surface-container-lowest rounded-xl shadow-soft p-4 mb-stack-md border border-outline-variant">
        <p className="font-label-sm text-secondary">이 사연을 직접 후원</p>
        <p className="font-body-lg font-bold">{storyTitle}</p>
        <p className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-sm">
          <Icon name="info" size={16} /> 세액공제 불가
        </p>
      </section>

      {/* 일시/정기 */}
      <div className="flex bg-surface-container rounded-xl p-1 mb-stack-md h-14" role="tablist" aria-label="후원 주기">
        {([["ONE_TIME", "한 번 후원"], ["SUBSCRIPTION", "매달 정기 후원"]] as const).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={paymentType === key}
            onClick={() => setPaymentType(key)}
            className={`flex-1 rounded-lg font-label-sm transition-all ${
              paymentType === key ? "bg-surface-container-lowest text-primary shadow-sm font-bold" : "text-on-surface-variant"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 금액 */}
      <section className="mb-8">
        <h2 className="font-label-md mb-4 text-on-surface font-bold">얼마를 후원할까요?</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {PRESETS.map((v) => (
            <button
              key={v}
              onClick={() => pickPreset(v)}
              aria-pressed={amount === v && custom === ""}
              className={`h-16 border rounded-2xl font-headline-md transition-all tap-scale ${
                amount === v && custom === ""
                  ? "bg-primary text-on-primary border-primary shadow-cta scale-[1.02]"
                  : "border-outline-variant text-on-surface bg-surface-container-lowest hover:bg-surface-container-low"
              }`}
            >
              {(v / 10000).toLocaleString()}만
            </button>
          ))}
        </div>
        <div className="relative">
          <label htmlFor="custom-amount" className="sr-only">
            직접 입력 (원)
          </label>
          <input
            id="custom-amount"
            inputMode="numeric"
            value={custom}
            onChange={(e) => onCustom(e.target.value)}
            placeholder="직접 입력"
            className="w-full h-16 border border-outline-variant rounded-2xl px-5 pr-10 font-body-lg bg-surface-container-lowest focus:border-2 focus:border-primary outline-none transition-all"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface font-bold">원</span>
        </div>
      </section>

      {/* 결제 수단 */}
      <section className="mb-8">
        <h2 className="font-label-md mb-4 text-on-surface font-bold">어떻게 후원할까요?</h2>
        <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="결제 수단">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={method === m.id}
              onClick={() => setMethod(m.id)}
              className={`flex items-center justify-between px-5 h-[72px] border rounded-2xl bg-surface-container-lowest transition-all tap-scale ${
                method === m.id
                  ? "border-2 border-primary shadow-soft -translate-y-0.5"
                  : "border-outline-variant"
              }`}
            >
              <span className="flex items-center gap-4">
                <span className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center">
                  <Icon name={m.icon} fill className="text-primary" />
                </span>
                <span className="font-headline-md text-[1.0625rem] text-on-surface">{m.label}</span>
              </span>
              <Icon name={method === m.id ? "check_circle" : "chevron_right"} fill={method === m.id} className={method === m.id ? "text-primary" : "text-outline-variant"} />
            </button>
          ))}
        </div>
      </section>

      {/* 전액 전달 안내 (가치 중심, 거부감 최소화) */}
      <section className="mb-stack-md bg-primary-fixed/30 rounded-2xl border border-primary/15 p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={coversFee}
            onChange={(e) => setCoversFee(e.target.checked)}
            className="w-6 h-6 rounded border-2 border-primary text-primary mt-0.5 shrink-0"
          />
          <span className="font-body-md text-on-surface leading-snug">
            <b className="text-primary">후원금 100%를 주인공에게 전액 전달할게요</b>
            <span className="block font-label-md text-on-surface-variant mt-1">
              사연 검증·안전한 결제·투명한 집행 관리에 드는 비용을 제가 조금 더 보태요 (+{won(fee.platformFee)})
            </span>
          </span>
        </label>
        <dl className="text-on-surface-variant font-label-md space-y-1.5 border-t border-primary/10 pt-3 mt-4">
          <div className="flex justify-between">
            <dt>내 후원금</dt>
            <dd className="text-on-surface font-bold">{won(fee.donation)}</dd>
          </div>
          <div className="flex justify-between items-center border-t border-primary/10 pt-2 mt-1">
            <dt className="text-primary font-bold flex items-center gap-1">
              <Icon name="favorite" fill size={18} /> 주인공에게 전달
            </dt>
            <dd className="text-primary font-bold text-headline-md">{won(fee.netToBeneficiary)}</dd>
          </div>
        </dl>
        <p className="mt-3 font-label-md text-on-surface-variant leading-relaxed">{fee.label}</p>
      </section>

      {/* 동의 */}
      <section className="mb-stack-md p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
            className="w-6 h-6 rounded border-2 border-primary text-primary mt-0.5"
          />
          <span className="font-body-md text-on-surface-variant leading-tight">
            개인정보 수집·이용에 동의하며 후원을 신청합니다. (필수)
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeNoTax}
            onChange={(e) => setAgreeNoTax(e.target.checked)}
            className="w-6 h-6 rounded border-2 border-secondary text-secondary mt-0.5"
          />
          <span className="font-body-md text-secondary font-bold leading-tight">
            세액공제가 되지 않음을 확인했습니다. (필수)
          </span>
        </label>
      </section>

      {error && (
        <p role="alert" className="mb-4 px-4 py-3 rounded-xl bg-error-container text-on-error-container font-label-sm">
          {error}
        </p>
      )}

      {/* 고정 결제 바 */}
      <div className="fixed bottom-0 left-0 w-full blur-nav px-margin-mobile pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] md:px-margin-desktop border-t border-outline-variant/30 z-40">
        <div className="max-w-[640px] mx-auto">
          <div className="flex justify-between items-end mb-3 px-1">
            <span className="text-on-surface-variant font-label-md">
              최종 후원 금액{paymentType === "SUBSCRIPTION" ? " (매월)" : ""}
            </span>
            <span className="text-secondary font-headline-md">{won(fee.charge)}</span>
          </div>
          <button
            disabled={!canSubmit}
            onClick={submit}
            className="w-full h-16 btn-gradient text-on-secondary rounded-2xl font-headline-md shadow-cta tap-scale transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "처리 중..." : "후원 결제하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
