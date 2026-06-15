import "server-only";
/**
 * Supabase 서비스 롤 클라이언트 (RLS 우회) — 서버 전용.
 * 본인확인 결과(ci_hash 등) 저장처럼 사용자 컨텍스트 밖에서 안전하게 써야 하는 작업에만 사용.
 * 절대 클라이언트로 노출 금지.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getAdminSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
