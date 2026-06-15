"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Button } from "./ui";
import { NEW_GRADE_GOAL_CAP } from "@/lib/config";
import { verifyIdentity as identityVerify } from "@/lib/identity-client";
import { won } from "@/lib/money";

type Form = {
  name: string;
  location: string;
  title: string;
  content: string;
  goal: string;
  usage: string;
};

const USAGE = [
  { v: "medical", l: "의료비 및 수술비" },
  { v: "living", l: "긴급 생계비" },
  { v: "education", l: "교육비 및 학용품" },
  { v: "housing", l: "주거 환경 개선" },
  { v: "other", l: "기타" },
];

export function StoryWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>({ name: "", location: "", title: "", content: "", goal: "", usage: "" });
  const [attachedName, setAttachedName] = useState<string | null>(null);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = 3;
  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const goalNum = Number(form.goal || 0);

  // 서류 사진 첨부 (심사용 참고자료). 자동 인식/자동기입은 하지 않으며, 값은 직접 입력한다.
  function onAttach(file: File | undefined) {
    if (!file) return;
    setAttachedName(file.name);
    // 실제 업로드는 제출 시 객체스토리지로 전송(추후 연동). 지금은 첨부 표시만.
  }

  function next() {
    setError(null);
    if (step === 1 && !form.name.trim()) return setError("성함(또는 별칭)을 입력해 주세요.");
    if (step === 2 && (!form.title.trim() || !form.content.trim())) return setError("제목과 내용을 입력해 주세요.");
    setStep((s) => Math.min(total, s + 1));
  }

  async function verifyIdentity() {
    // 본인확인 — 실연동 시 NICE 표준창, 미연동 시 mock. 사연 등록 시점 게이트.
    const r = await identityVerify("story_register");
    if (r.ok) {
      setIdentityVerified(true);
      setShowGate(false);
      // 본인확인 직후 자동으로 제출 — 사용자가 '작성 완료'를 다시 누를 필요 없음.
      await doSubmit();
    } else {
      setError("본인확인에 실패했거나 취소되었습니다. 다시 시도해 주세요.");
    }
  }

  /** 실제 제출(검증 통과 후 호출). identityVerified 상태에 의존하지 않음. */
  async function doSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/apply/submitted");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "제출에 실패했습니다. 다시 시도해 주세요.");
        setSubmitting(false);
      }
    } catch {
      setError("네트워크 오류로 제출하지 못했습니다. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  async function submit() {
    setError(null);
    if (goalNum <= 0) return setError("희망 후원 금액을 입력해 주세요.");
    if (goalNum > NEW_GRADE_GOAL_CAP)
      return setError(`신규 신청자는 목표 금액이 ${won(NEW_GRADE_GOAL_CAP)}을 넘을 수 없습니다. 기관 대리신청을 이용해 주세요.`);
    if (!form.usage) return setError("후원금 사용처를 선택해 주세요.");
    if (!identityVerified) return setShowGate(true); // 단계적 신원확인 게이트 → 확인 후 자동 제출
    await doSubmit();
  }

  const progress = (step / total) * 100;

  return (
    <div className="px-margin-mobile md:px-0 py-stack-md pb-40">
      {/* 진행 */}
      <div className="mb-stack-lg">
        <div className="flex justify-between items-end mb-2">
          <span className="font-label-sm text-primary font-bold">
            {total}단계 중 {step}단계
          </span>
          <span className="font-label-sm text-on-surface-variant">진행률 {Math.round(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
          <div className="h-full bg-primary-container transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 1 && (
        <section>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2">
            도움이 필요한 분을 알려주세요
          </h1>
          <p className="font-body-md text-on-surface-variant mb-stack-md">
            아래 정보를 입력해 주세요. 관련 서류 사진은 첨부하시면 심사에 참고됩니다.
          </p>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full mb-stack-md p-stack-md border-2 border-dashed border-primary/30 rounded-xl bg-primary-container/5 flex flex-col items-center text-center hover:bg-primary-container/10 transition-colors"
          >
            <span className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-3">
              <Icon name={attachedName ? "check_circle" : "attach_file"} fill size={32} />
            </span>
            <span className="font-label-sm text-primary">
              {attachedName ? "서류 사진 첨부됨" : "서류 사진 첨부 (선택)"}
            </span>
            <span className="font-body-md text-on-surface-variant break-all">
              {attachedName ?? "진단서·증명서 등을 첨부하면 심사에 도움이 됩니다"}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onAttach(e.target.files?.[0])}
          />

          <Field label="성함 (또는 별칭)" id="name" value={form.name} onChange={(v) => set("name", v)} placeholder="예: 김사랑 님" />
          <Field label="거주 지역" id="loc" value={form.location} onChange={(v) => set("location", v)} placeholder="예: 서울시 중구" />
        </section>
      )}

      {step === 2 && (
        <section>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2">어떤 어려움이 있으신가요?</h1>
          <p className="font-body-md text-on-surface-variant mb-stack-md">
            상황을 솔직하게 적어주세요. 쉬운 말로 적으셔도 괜찮습니다.
          </p>
          <Field label="사연 제목" id="title" value={form.title} onChange={(v) => set("title", v)} placeholder="마음을 전하는 한 줄 제목" />
          <div className="flex flex-col gap-2 mb-stack-md">
            <label htmlFor="content" className="font-label-sm text-on-surface">
              상세 내용
            </label>
            <textarea
              id="content"
              rows={6}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              className="w-full p-4 rounded-xl border border-outline focus:border-[3px] focus:border-primary outline-none font-body-md bg-surface-container-lowest"
              placeholder="도움이 필요한 구체적인 이유를 적어주세요."
            />
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2">목표 금액과 사용 계획</h1>
          <p className="font-body-md text-on-surface-variant mb-stack-md">
            투명한 후원을 위해 정확한 금액과 용도를 적어주세요. 후원금은 분할 지급됩니다.
          </p>
          <div className="flex flex-col gap-2 mb-stack-md">
            <label htmlFor="goal" className="font-label-sm text-on-surface">
              희망 후원 금액
            </label>
            <div className="relative">
              <input
                id="goal"
                inputMode="numeric"
                value={form.goal}
                onChange={(e) => set("goal", e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full h-[56px] pl-4 pr-12 rounded-xl border border-outline focus:border-[3px] focus:border-primary outline-none font-body-md bg-surface-container-lowest text-right"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">원</span>
            </div>
            <p className="font-label-sm text-on-surface-variant">
              신규 신청자 한도: {won(NEW_GRADE_GOAL_CAP)} (검증 이력이 쌓이면 한도가 올라갑니다)
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="usage" className="font-label-sm text-on-surface">
              후원금 사용처
            </label>
            <select
              id="usage"
              value={form.usage}
              onChange={(e) => set("usage", e.target.value)}
              className="w-full h-[56px] px-4 rounded-xl border border-outline focus:border-[3px] focus:border-primary outline-none font-body-md bg-surface-container-lowest"
            >
              <option value="">용도를 선택해주세요</option>
              {USAGE.map((u) => (
                <option key={u.v} value={u.v}>
                  {u.l}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {error && (
        <p role="alert" className="mt-4 px-4 py-3 rounded-xl bg-error-container text-on-error-container font-label-sm">
          {error}
        </p>
      )}

      {/* 하단 내비 */}
      <div className="fixed bottom-0 left-0 w-full bg-surface px-margin-mobile py-4 border-t border-outline-variant z-40">
        <div className="max-w-[800px] mx-auto flex gap-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} icon="arrow_back" className="flex-1">
              이전
            </Button>
          )}
          {step < total ? (
            <Button variant="secondary" onClick={next} className="flex-[2]">
              다음 <Icon name="arrow_forward" />
            </Button>
          ) : (
            <Button variant="secondary" onClick={submit} disabled={submitting} className="flex-[2]">
              {submitting ? "제출 중..." : "작성 완료"}
            </Button>
          )}
        </div>
      </div>

      {/* 단계적 신원확인 게이트 */}
      {showGate && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-4">
              <Icon name="verified_user" fill className="text-white" size={28} />
            </div>
            <h2 className="font-headline-lg-mobile mb-2">본인확인이 필요해요</h2>
            <p className="font-body-md text-on-surface-variant mb-6">
              사연 등록과 후원금 수령을 위해 이 단계에서 한 번만 본인확인을 진행합니다. 수령 계좌는 반드시 본인
              명의여야 합니다.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={verifyIdentity} icon="badge">
                본인확인 진행 (PASS)
              </Button>
              <Button variant="ghost" onClick={() => setShowGate(false)}>
                나중에 하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {identityVerified && (
        <p className="mt-4 flex items-center gap-2 text-primary font-label-sm">
          <Icon name="check_circle" fill /> 본인확인 완료
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2 mb-stack-md">
      <label htmlFor={id} className="font-label-sm text-on-surface">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[56px] px-4 rounded-xl border border-outline focus:border-[3px] focus:border-primary outline-none font-body-md bg-surface-container-lowest"
      />
    </div>
  );
}
