import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, hasSupabase } from "@/lib/supabase/server";

// 소셜 로그인 OAuth 콜백 — code 교환 후 세션 쿠키 설정. 계정 연결은 동일 이메일 기준 후속 처리.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code && hasSupabase()) {
    const supabase = getServerSupabase();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
      // TODO: app_user upsert + linked_providers 갱신(account linking).
    }
  }
  return NextResponse.redirect(`${origin}${next}`);
}
