"use client";
/**
 * 이메일/비밀번호 인증 (소셜 OAuth 외 추가 경로).
 *  - Supabase 연결 시: 실제 signUp / signInWithPassword.
 *  - 미연결(로컬/데모): 데모 로그인으로 흐름을 그대로 테스트 가능.
 * 회원가입은 본인인증(CI/DI) 완료를 전제로 호출한다(호출 측에서 게이트).
 */
import { getBrowserSupabase } from "./supabase/client";
import { demoSignIn } from "@/hooks/useAuth";

export type AuthResult = { ok: boolean; message?: string; needsEmailConfirm?: boolean };

export function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "영문과 숫자를 모두 포함해야 합니다.";
  return null;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** 이메일 회원가입. 본인인증은 호출 전에 완료되어 있어야 함(verifiedName 전달). */
export async function signUpWithEmail(email: string, password: string, verifiedName?: string): Promise<AuthResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    // 데모: 즉시 가입+로그인 처리
    demoSignIn(verifiedName || email);
    return { ok: true };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${location.origin}/api/auth/callback`,
      data: { display_name: verifiedName || email.split("@")[0] },
    },
  });
  if (error) return { ok: false, message: humanize(error.message) };
  // 이메일 확인이 켜져 있으면 session 이 없고 확인 메일이 발송됨
  const needsEmailConfirm = !data.session;
  return { ok: true, needsEmailConfirm };
}

/** 이메일 로그인 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    demoSignIn(email);
    return { ok: true };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: humanize(error.message) };
  return { ok: true };
}

function humanize(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (m.includes("already registered") || m.includes("already exists")) return "이미 가입된 이메일입니다. 로그인해 주세요.";
  if (m.includes("email not confirmed")) return "이메일 인증이 필요합니다. 메일함을 확인해 주세요.";
  return "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
