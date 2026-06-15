import { getServerSupabase, hasSupabase } from "./supabase/server";

/**
 * 운영자 접근 확인. 운영(Supabase 연결)에서는 로그인 사용자의 role=admin 을 검증.
 * 데모(Supabase 미연결)에서는 통과시키되, 페이지에 "데모" 배너를 노출한다.
 */
export async function requireAdmin(): Promise<{ ok: boolean; demo: boolean }> {
  if (!hasSupabase()) return { ok: true, demo: true };
  const supabase = getServerSupabase();
  if (!supabase) return { ok: true, demo: true };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, demo: false };
  // TODO(DB): app_user.role 조회. 여기서는 user_metadata.role 예시.
  const role = (data.user.user_metadata as { role?: string } | null)?.role;
  return { ok: role === "admin", demo: false };
}
