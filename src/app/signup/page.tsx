"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { BRAND } from "@/lib/config";
import { signUpWithEmail, validateEmail, validatePassword } from "@/lib/auth-client";
import { verifyIdentity } from "@/lib/identity-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [agree, setAgree] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"confirm" | null>(null);

  async function verify() {
    setError(null);
    // 본인인증 — 실연동 시 NICE 표준창, 미연동 시 mock. 회원가입은 본인인증 완료가 전제.
    const r = await verifyIdentity("signup");
    if (r.ok) {
      setVerified(true);
      setVerifiedName(r.name ?? "");
    } else {
      setError("본인인증에 실패했거나 취소되었습니다. 다시 시도해 주세요.");
    }
  }

  function nextPath(): string {
    const n = new URLSearchParams(window.location.search).get("next");
    return n && n.startsWith("/") ? n : "/";
  }

  async function submit() {
    setError(null);
    if (!validateEmail(email)) return setError("올바른 이메일을 입력해 주세요.");
    const pwErr = validatePassword(pw);
    if (pwErr) return setError(pwErr);
    if (pw !== pw2) return setError("비밀번호가 일치하지 않습니다.");
    if (!verified) return setError("회원가입을 위해 본인인증을 완료해 주세요.");
    if (!agree) return setError("약관에 동의해 주세요.");

    setBusy(true);
    const r = await signUpWithEmail(email, pw, verifiedName);
    if (!r.ok) {
      setError(r.message ?? "가입에 실패했습니다.");
      setBusy(false);
      return;
    }
    if (r.needsEmailConfirm) {
      setDone("confirm");
      setBusy(false);
      return;
    }
    router.push(nextPath());
  }

  const inputCls =
    "w-full h-14 px-4 rounded-2xl border border-outline-variant focus:border-2 focus:border-primary outline-none font-body-md bg-surface-container-lowest transition-all";

  if (done === "confirm") {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center gap-4 py-10">
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center">
            <Icon name="mark_email_read" fill size={36} className="text-primary" />
          </div>
          <h1 className="font-headline-lg text-primary">메일함을 확인해 주세요</h1>
          <p className="font-body-md text-on-surface-variant max-w-[420px]">
            <b>{email}</b> 으로 인증 메일을 보냈습니다. 메일의 링크를 누르면 가입이 완료됩니다.
          </p>
          <Link href="/login" className="text-primary font-label-md underline mt-2">
            로그인으로 가기
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-stack-md text-center">
        <h1 className="font-headline-xl text-primary mb-2">이메일로 회원가입</h1>
        <p className="font-body-md text-on-surface-variant">
          본인인증을 거쳐 아이디(이메일)와 비밀번호로 가입합니다.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="font-label-md text-on-surface block mb-1.5">
            이메일
          </label>
          <input id="email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
        </div>
        <div>
          <label htmlFor="pw" className="font-label-md text-on-surface block mb-1.5">
            비밀번호
          </label>
          <input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="영문+숫자 8자 이상" className={inputCls} />
        </div>
        <div>
          <label htmlFor="pw2" className="font-label-md text-on-surface block mb-1.5">
            비밀번호 확인
          </label>
          <input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="비밀번호 재입력" className={inputCls} />
        </div>

        {/* 본인인증 */}
        <div className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${verified ? "bg-primary-fixed/30 border-primary/20" : "bg-surface-container-low border-outline-variant"}`}>
          <div className="min-w-0">
            <p className="font-label-md text-on-surface flex items-center gap-1.5">
              <Icon name={verified ? "verified_user" : "badge"} fill={verified} className={verified ? "text-primary" : "text-on-surface-variant"} size={20} />
              {verified ? "본인인증 완료" : "본인인증 (필수)"}
            </p>
            <p className="font-label-md text-on-surface-variant mt-0.5">
              {verified ? `${verifiedName}님 인증됨` : "안전한 가입을 위해 본인인증이 필요합니다."}
            </p>
          </div>
          {!verified && (
            <Button variant="outline" onClick={verify} className="shrink-0 !min-h-[44px] px-4">
              인증하기
            </Button>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-6 h-6 rounded border-2 border-primary text-primary mt-0.5 shrink-0" />
          <span className="font-body-md text-on-surface-variant leading-tight">
            {BRAND.name} 이용약관 및 개인정보 처리방침에 동의합니다. (필수)
          </span>
        </label>

        {error && (
          <p role="alert" className="px-4 py-3 rounded-xl bg-error-container text-on-error-container font-label-md">
            {error}
          </p>
        )}

        <Button variant="primary" onClick={submit} disabled={busy} className="w-full h-14 mt-1">
          {busy ? "가입 중..." : "가입하기"}
        </Button>

        <p className="text-center font-body-md text-on-surface-variant mt-2">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-primary font-bold underline">
            로그인
          </Link>
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <header className="w-full sticky top-0 z-50 blur-nav border-b border-outline-variant/40">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 max-w-[800px] mx-auto w-full">
          <Link href="/" className="flex items-center gap-2">
            <Icon name="volunteer_activism" fill className="text-primary" />
            <span className="font-headline-md text-primary">{BRAND.name}</span>
          </Link>
          <Link href="/" aria-label="닫기" className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
            <Icon name="close" />
          </Link>
        </div>
      </header>
      <main className="w-full max-w-[460px] px-margin-mobile py-stack-lg flex-grow">{children}</main>
    </div>
  );
}
