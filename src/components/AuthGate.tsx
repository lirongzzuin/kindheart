"use client";
/**
 * 로그인 게이트 — 등록·후원·개인페이지에서만 사용.
 * 비로그인 시 /login?next=현재경로 로 보내고, 로그인 후 원래 자리로 복귀.
 * (둘러보기/사연 열람에는 절대 쓰지 않는다 — 누구나 접근)
 */
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "./Icon";

export function AuthGate({ children, reason }: { children: React.ReactNode; reason?: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname);
      const r = reason ? `&reason=${encodeURIComponent(reason)}` : "";
      router.replace(`/login?next=${next}${r}`);
    }
  }, [loading, user, pathname, router, reason]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
        <Icon name="progress_activity" className="animate-spin" size={32} />
        <p className="font-label-md">확인 중...</p>
      </div>
    );
  }
  if (!user) {
    // 리다이렉트 진행 중 — 짧은 안내
    return (
      <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3 text-center px-margin-mobile">
        <Icon name="lock" size={32} className="text-primary" />
        <p className="font-body-md">로그인이 필요한 기능이에요. 로그인 화면으로 이동합니다…</p>
      </div>
    );
  }
  return <>{children}</>;
}
