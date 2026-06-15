"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Button } from "./ui";
import { PAYMENT_METHODS } from "@/lib/adapters/payment";
import { calcFee } from "@/lib/fees";
import { FEATURES } from "@/lib/config";
import { verifyIdentity as identityVerify } from "@/lib/identity-client";
import { DonationMode, PaymentMethod, PaymentType } from "@/lib/types";
import { won } from "@/lib/money";

const PRESETS = [10000, 30000, 50000, 100000];

/** Mode A 기부 결제 — "기부/세액공제/기부금영수증" 용어 전용. 특정인 지정 없음(펀드 대상). */
export function DonationCheckoutA({ fundId, fundName }: { fundId: string; fundName: string }) {
  const router = useRouter();
  const [paymentType, setPaymentType] = useState<PaymentType>("ONE_TIME");
  const [amount, setAmount] = useState(30000);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("kakaopay");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [wantReceipt, setWantReceipt] = useState(true);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fee = useMemo(() => calcFee(amount, DonationMode.A_TAX_DEDUCTIBLE, false), [amount]);
  // 영수증을 받으려면 본인확인 필요(단계적 신원확인 게이트). 미발급이면 본인확인 불필요.
  const ready = amount > 0 && agreePrivacy && (!wantReceipt || identityVerified) && !submitting;

  function pickPreset(v: number) {
    setAmount(v);
    setCustom("");
  }
  function onCustom(v: string) {
    const n = Number(v.replace(/[^0-9]/g, ""));
    setCustom(v.replace(/[^0-9]/g, ""));
    setAmount(Number.isFinite(n) ? n : 0);
  }

  async function verifyIdentity() {
    // 본인확인 — 실연동 시 NICE 표준창, 미연동 시 mock. 기부금영수증 발급 게이트.
    const r = await identityVerify("tax_receipt");
    if (r.ok) {
      setIdentityVerified(true);
      setShowGate(false);
      // 본인확인 직후 자동 결제 진행 — 다시 버튼 누를 필요 없음.
      await doSubmit(true);
    } else {
      setError("본인확인에 실패했거나 취소되었습니다. 다시 시도해 주세요.");
    }
  }

  /** 실제 결제 요청. verified 를 명시 전달(상태 갱신 비동기 대비). */
  async function doSubmit(verified: boolean) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "A",
          fundId,
          amount,
          method,
          paymentType,
          coversFee: false,
          agreePrivacy,
          requestReceipt: wantReceipt,
          identityVerified: verified,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "기부 처리에 실패했습니다.");
      router.push(`/donate/fund/${fundId}/complete?donation=${data.donationId}&receipt=${wantReceipt ? 1 : 0}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  async function submit() {
    setError(null);
    if (wantReceipt && !identityVerified) return setShowGate(true);
    await doSubmit(identityVerified);
  }

  return (
    <div className="px-margin-mobile md:px-0 pb-40">
      {/* 요약 */}
      <section className="bg-surface-container-lowest rounded-xl shadow-soft p-4 mb-stack-md border border-outline-variant">
        <p className="font-label-sm text-primary">공익 펀드에 기부</p>
        <p className="font-body-lg font-bold">{fundName}</p>
        <p className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-sm">
          <Icon name="receipt_long" size={16} /> 세액공제 가능
        </p>
      </section>

      {/* 일시/정기 */}
      <div className="flex bg-surface-container rounded-xl p-1 mb-stack-md h-14" role="tablist" aria-label="기부 주기">
        {([["ONE_TIME", "한 번 기부"], ["SUBSCRIPTION", "매달 정기 기부"]] as const).map(([key, label]) => (
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
      <section className="mb-stack-md">
        <h2 className="font-label-sm mb-3 text-on-surface">기부 금액 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {PRESETS.map((v) => (
            <button
              key={v}
              onClick={() => pickPreset(v)}
              aria-pressed={amount === v && custom === ""}
              className={`h-16 border-2 rounded-xl text-xl font-bold transition-all tap-scale ${
                amount === v && custom === ""
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline-variant text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {v.toLocaleString()}원
            </button>
          ))}
        </div>
        <div className="relative">
          <label htmlFor="amtA" className="sr-only">
            직접 입력 (원)
          </label>
          <input
            id="amtA"
            inputMode="numeric"
            value={custom}
            onChange={(e) => onCustom(e.target.value)}
            placeholder="직접 입력"
            className="w-full h-[56px] border-2 border-outline-variant rounded-xl px-4 pr-10 font-body-md bg-surface-container-lowest focus:border-tertiary focus:border-[3px] outline-none"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-sm">원</span>
        </div>
      </section>

      {/* 결제 수단 */}
      <section className="mb-stack-md">
        <h2 className="font-label-sm mb-3 text-on-surface">결제 방법</h2>
        <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="결제 수단">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={method === m.id}
              onClick={() => setMethod(m.id)}
              className={`flex items-center justify-between px-4 h-[64px] border-2 rounded-xl bg-surface-container-lowest transition-all ${
                method === m.id ? "border-primary border-[3px] bg-surface-container-low" : "border-outline-variant"
              }`}
            >
              <span className="font-button-text text-on-surface">{m.label}</span>
              <Icon name={m.icon} className="text-on-surface-variant" />
            </button>
          ))}
        </div>
      </section>

      {/* 기부금영수증 / 세액공제 안내 */}
      <section className="mb-stack-md bg-surface-container-low rounded-xl border border-outline-variant p-4">
        <h2 className="font-label-sm text-on-surface mb-3 flex items-center gap-2">
          <Icon name="receipt_long" size={20} className="text-primary" /> 기부금영수증
        </h2>
        <label className="flex items-start gap-3 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={wantReceipt}
            onChange={(e) => setWantReceipt(e.target.checked)}
            className="w-6 h-6 rounded border-2 border-primary text-primary mt-0.5"
          />
          <span className="font-body-md text-on-surface-variant leading-tight">
            <b className="text-primary">기부금영수증을 발급</b>받아 연말정산 세액공제를 받겠습니다
            {wantReceipt && <span className="block font-label-sm mt-1">발급을 위해 1회 본인확인이 필요합니다.</span>}
          </span>
        </label>
        <dl className="text-on-surface-variant font-label-md space-y-1.5 border-t border-outline-variant pt-3">
          <div className="flex justify-between">
            <dt className="text-on-surface font-bold">기부 금액 (세액공제 대상)</dt>
            <dd className="text-primary font-bold">{won(fee.donation)}</dd>
          </div>
          <p className="font-label-md text-on-surface-variant leading-relaxed">
            기부금 전액이 공익법인을 통해 검증된 곳에 전달됩니다. 검증·투명 관리 등 운영은 별도 재원으로 충당하며,
            기부금에서 차감하지 않습니다.
          </p>
        </dl>
        <p className="mt-2 font-label-sm text-on-surface-variant">{fee.label}</p>
        {!FEATURES.TAX_RECEIPT && wantReceipt && (
          <p className="mt-2 font-label-sm text-on-surface-variant bg-surface-container rounded-lg p-2">
            국세청 연동 발급은 준비 중입니다. 발급 신청은 접수되며 가능 시점에 발행됩니다.
          </p>
        )}
      </section>

      {/* 개인정보 동의 (Mode A 는 '세액공제 불가' 동의가 없음 — 반대로 영수증 발급) */}
      <section className="mb-stack-md p-4 bg-surface-container-low rounded-xl border border-outline-variant">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
            className="w-6 h-6 rounded border-2 border-primary text-primary mt-0.5"
          />
          <span className="font-body-md text-on-surface-variant leading-tight">
            개인정보 수집·이용 및 공익법인 제공에 동의하며 기부를 신청합니다. (필수)
          </span>
        </label>
      </section>

      {identityVerified && (
        <p className="mb-4 flex items-center gap-2 text-primary font-label-sm">
          <Icon name="check_circle" fill /> 본인확인 완료 — 영수증 발급 가능
        </p>
      )}

      {error && (
        <p role="alert" className="mb-4 px-4 py-3 rounded-xl bg-error-container text-on-error-container font-label-sm">
          {error}
        </p>
      )}

      {/* 고정 결제 버튼 */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest px-4 py-4 md:px-margin-desktop border-t border-outline-variant z-40">
        <div className="max-w-[800px] mx-auto">
          <button
            disabled={!ready}
            onClick={submit}
            className="w-full min-h-[60px] bg-primary text-on-primary rounded-xl font-headline-lg-mobile font-bold shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "처리 중..." : `${won(fee.charge)} ${paymentType === "SUBSCRIPTION" ? "매달 " : ""}기부하기`}
          </button>
        </div>
      </div>

      {/* 본인확인 게이트 (영수증 발급용) */}
      {showGate && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-4">
              <Icon name="badge" fill className="text-white" size={28} />
            </div>
            <h2 className="font-headline-lg-mobile mb-2">본인확인이 필요해요</h2>
            <p className="font-body-md text-on-surface-variant mb-6">
              기부금영수증은 본인 명의로 발급되어야 세액공제를 받을 수 있습니다. 한 번만 본인확인을 진행합니다.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={verifyIdentity} icon="badge">
                본인확인 진행 (PASS)
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setWantReceipt(false);
                  setShowGate(false);
                }}
              >
                영수증 없이 기부할게요
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
