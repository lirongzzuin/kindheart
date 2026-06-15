"use client";
/**
 * 인증 상태 훅 — 단계적 신원확인의 1단계 "로그인(계정 출입증)".
 *  - Supabase 연결 시: 실제 세션 사용.
 *  - 미연결(로컬/데모): localStorage 기반 데모 로그인으로 게이트 흐름을 그대로 테스트 가능.
 * 둘러보기는 비로그인 허용. 등록·후원·개인페이지에서만 이 게이트를 사용한다.
 */
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

export type SimpleUser = { id: string; name: string };
const DEMO_KEY = "kh.demo_auth";

export function isDemoAuth(): boolean {
  return !getBrowserSupabase();
}

export function demoSignIn(name = "데모 후원자") {
  localStorage.setItem(DEMO_KEY, name);
  window.dispatchEvent(new Event("kh-auth"));
}
export function demoSignOut() {
  localStorage.removeItem(DEMO_KEY);
  window.dispatchEvent(new Event("kh-auth"));
}

export function useAuth() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabase();

    if (supabase) {
      let active = true;
      supabase.auth.getUser().then(({ data }) => {
        if (!active) return;
        setUser(data.user ? { id: data.user.id, name: data.user.email ?? "회원" } : null);
        setLoading(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ? { id: session.user.id, name: session.user.email ?? "회원" } : null);
      });
      return () => {
        active = false;
        sub.subscription.unsubscribe();
      };
    }

    // 데모 모드
    const read = () => {
      const v = localStorage.getItem(DEMO_KEY);
      setUser(v ? { id: "demo", name: v } : null);
      setLoading(false);
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("kh-auth", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("kh-auth", read);
    };
  }, []);

  return { user, loading, isDemo: isDemoAuth() };
}
