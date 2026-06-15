"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { BRAND, SUPPORT_PHONE, SHOW_PHONE_SUPPORT } from "@/lib/config";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { demoSignIn } from "@/hooks/useAuth";
import { signInWithEmail } from "@/lib/auth-client";
import { SocialProvider } from "@/lib/types";

// 브랜드 로고(인라인 SVG) — Material Symbols 에는 브랜드 아이콘이 없어 직접 사용.
// (애플은 'apple' 글리프가 없어 글자가 그대로 떠 텍스트 겹침이 발생했었음 → SVG 로 교체)
const KakaoIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.9 5.37 4.76 6.78-.21.77-.76 2.78-.87 3.21-.14.54.2.53.41.39.17-.12 2.65-1.8 3.72-2.53.64.08 1.3.13 1.98.13 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
  </svg>
);
const NaverIcon = (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M2.8 2.8h5.06l4.28 6.36V2.8H17.2v14.4h-5.06L7.86 10.84V17.2H2.8V2.8z" />
  </svg>
);
const GoogleIcon = (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);
const AppleIcon = (
  <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

const SOCIALS: { id: SocialProvider; label: string; cls: string; node: React.ReactNode }[] = [
  { id: "kakao", label: "카카오로 계속하기", cls: "bg-[#FEE500] text-[#191919]", node: KakaoIcon },
  { id: "naver", label: "네이버로 계속하기", cls: "bg-[#03C75A] text-white", node: NaverIcon },
  { id: "google", label: "Google로 계속하기", cls: "bg-white text-on-surface border border-outline-variant", node: GoogleIcon },
  { id: "apple", label: "Apple로 계속하기", cls: "bg-black text-white", node: AppleIcon },
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<SocialProvider | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [nextParam, setNextParam] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  // 쿼리(next/reason)는 클라이언트에서만 읽는다(prerender 시 window 없음 → effect 사용).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setReason(p.get("reason"));
    const n = p.get("next");
    setNextParam(n && n.startsWith("/") ? n : null);
  }, []);

  function nextPath(): string {
    const p = new URLSearchParams(window.location.search);
    const n = p.get("next");
    return n && n.startsWith("/") ? n : "/";
  }

  async function emailLogin() {
    setError(null);
    if (!email || !pw) return setError("이메일과 비밀번호를 입력해 주세요.");
    setEmailBusy(true);
    const r = await signInWithEmail(email, pw);
    if (!r.ok) {
      setError(r.message ?? "로그인에 실패했습니다.");
      setEmailBusy(false);
      return;
    }
    router.push(nextPath());
  }

  const signupHref = nextParam ? `/signup?next=${encodeURIComponent(nextParam)}` : "/signup";

  async function signIn(provider: SocialProvider) {
    setError(null);
    const supabase = getBrowserSupabase();

    // 데모 모드(Supabase 미연결): 즉시 데모 로그인 후 원래 경로로 복귀 — 로컬 테스트 가능.
    if (!supabase) {
      demoSignIn();
      router.push(nextPath());
      return;
    }

    // Supabase 기본 지원: google·apple·kakao. 네이버는 기본 미지원 → 커스텀 OIDC 필요.
    if (provider === "naver") {
      setError("네이버 로그인은 준비 중입니다. 카카오·구글·애플로 이용해 주세요.");
      return;
    }
    setBusy(provider);
    const next = encodeURIComponent(nextPath());
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/api/auth/callback?next=${next}` },
    });
    if (oauthError) {
      setError("로그인을 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.");
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <header className="w-full sticky top-0 z-50 bg-surface shadow-sm border-b border-outline-variant">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-[800px] mx-auto w-full">
          <Link href="/" className="flex items-center gap-2">
            <Icon name="volunteer_activism" fill className="text-primary" />
            <span className="font-headline-lg-mobile text-primary">{BRAND.name}</span>
          </Link>
          <Link href="/" aria-label="닫기" className="p-2 text-on-surface-variant min-h-touch-target-min flex items-center">
            <Icon name="close" />
          </Link>
        </div>
      </header>

      <main className="w-full max-w-[800px] px-margin-mobile md:px-margin-desktop flex flex-col items-center py-stack-lg flex-grow">
        <div className="text-center mb-stack-lg w-full">
          <h1 className="font-headline-xl text-primary mb-stack-sm">간편하게 시작하세요</h1>
          <p className="font-body-lg text-on-surface-variant max-w-[500px] mx-auto">
            복잡한 회원가입 없이 쓰던 소셜 계정으로 바로 시작할 수 있어요.
          </p>
        </div>

        {reason && (
          <div className="w-full bg-primary-fixed/40 border border-primary/20 rounded-2xl p-4 mb-stack-md flex items-start gap-3">
            <Icon name="lock_open" className="text-primary mt-0.5" />
            <p className="font-body-md text-on-surface">
              <b className="text-primary">{reason}</b>은 로그인 후 이용할 수 있어요. 로그인하면 바로 이어서 진행됩니다.
            </p>
          </div>
        )}

        {/* 단계적 신원확인 안내 */}
        <div className="w-full bg-surface-container-low rounded-xl p-6 border border-outline-variant mb-stack-lg flex items-start gap-4">
          <Icon name="info" fill className="text-primary mt-1" />
          <div>
            <p className="font-label-sm text-primary mb-1">나중에 하셔도 괜찮아요</p>
            <p className="font-body-md text-on-surface-variant">
              사연 둘러보기와 일시 후원은 본인인증 없이도 가능합니다. 사연 등록·후원금 수령처럼 꼭 필요한
              순간에만 본인인증을 요청합니다.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="w-full mb-4 px-4 py-3 rounded-xl bg-error-container text-on-error-container font-label-sm">
            {error}
          </p>
        )}

        <div className="w-full flex flex-col gap-4 mb-stack-lg">
          {SOCIALS.map((s) => (
            <button
              key={s.id}
              onClick={() => signIn(s.id)}
              disabled={busy !== null}
              aria-busy={busy === s.id}
              className={`w-full min-h-[60px] rounded-xl flex items-center justify-center px-6 relative shadow-sm font-button-text active:scale-[0.98] transition-transform disabled:opacity-60 ${s.cls}`}
            >
              <span className="absolute left-6">{s.node}</span>
              {busy === s.id ? "연결 중..." : s.label}
            </button>
          ))}
        </div>

        {/* 이메일/비밀번호 로그인 */}
        <div className="w-full flex items-center gap-4 mb-stack-md text-outline">
          <div className="h-px bg-outline-variant flex-grow" />
          <span className="font-label-sm">또는 이메일로</span>
          <div className="h-px bg-outline-variant flex-grow" />
        </div>

        <div className="w-full flex flex-col gap-3 mb-stack-md">
          <label htmlFor="login-email" className="sr-only">
            이메일
          </label>
          <input
            id="login-email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full h-14 px-4 rounded-2xl border border-outline-variant focus:border-2 focus:border-primary outline-none font-body-md bg-surface-container-lowest transition-all"
          />
          <label htmlFor="login-pw" className="sr-only">
            비밀번호
          </label>
          <input
            id="login-pw"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && emailLogin()}
            placeholder="비밀번호"
            className="w-full h-14 px-4 rounded-2xl border border-outline-variant focus:border-2 focus:border-primary outline-none font-body-md bg-surface-container-lowest transition-all"
          />
          <button
            onClick={emailLogin}
            disabled={emailBusy}
            className="w-full min-h-[56px] bg-primary text-on-primary rounded-2xl font-button-text tap-scale shadow-cta disabled:opacity-60"
          >
            {emailBusy ? "로그인 중..." : "이메일로 로그인"}
          </button>
          <Link href={signupHref} className="text-center font-body-md text-on-surface-variant py-2">
            아직 회원이 아니신가요? <span className="text-primary font-bold underline">이메일로 회원가입</span>
          </Link>
        </div>

        {SHOW_PHONE_SUPPORT && (
          <>
            <div className="w-full flex items-center gap-4 mb-stack-lg text-outline">
              <div className="h-px bg-outline-variant flex-grow" />
              <span className="font-label-sm">또는</span>
              <div className="h-px bg-outline-variant flex-grow" />
            </div>

            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="w-full flex items-center justify-center gap-3 min-h-touch-target-min py-4 rounded-xl border-2 border-secondary text-secondary font-button-text hover:bg-secondary/5 transition-colors"
            >
              <Icon name="call" />
              전화로 후원하기 (상담 연결)
            </a>
          </>
        )}

        <footer className="mt-auto pt-stack-lg text-center">
          <p className="font-label-sm text-on-surface-variant opacity-70">
            로그인 시 {BRAND.name}의 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </footer>
      </main>
    </div>
  );
}
