/**
 * Supabase 서버 클라이언트 (lazy). 환경변수 없으면 null 반환 → mock 데이터 폴백.
 * 비용 최소화: Supabase 무료 티어. 민감정보 컬럼은 앱 레벨 암호화 후 저장.
 */
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function hasSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getServerSupabase() {
  if (!hasSupabase()) return null;
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* Server Component 에서 호출 시 무시 */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            /* noop */
          }
        },
      },
    }
  );
}
