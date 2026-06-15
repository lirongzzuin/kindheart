import { NextRequest, NextResponse } from "next/server";
import { buildNiceRequest, CHECKPLUS_URL, niceConfigured } from "@/lib/adapters/nice";
import { encryptPII } from "@/lib/crypto";
import { getServerSupabase } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/config";

/**
 * 본인확인 시작 — NICE 표준창으로 자동 제출하는 HTML 반환(팝업에서 호출).
 * 복호화에 필요한 key/iv/reqNo 는 암호화하여 httpOnly 쿠키에 저장 → 콜백에서 사용.
 */
export async function GET(req: NextRequest) {
  if (!FEATURES.REAL_IDENTITY || !niceConfigured()) {
    return new NextResponse("본인확인이 구성되지 않았습니다.", { status: 503 });
  }

  const origin = req.nextUrl.origin;
  const gate = req.nextUrl.searchParams.get("gate") ?? "signup";
  const returnUrl = process.env.NICE_RETURN_URL || `${origin}/api/identity/callback`;

  // 로그인 사용자라면 id 를 함께 봉인 → 콜백에서 그 사용자에게 본인확인 결과를 저장.
  // (콜백은 NICE 도메인발 cross-site POST 라 세션 쿠키가 안 실릴 수 있으므로 여기서 잡아둔다)
  let userId: string | null = null;
  try {
    const supabase = getServerSupabase();
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }
  } catch {
    /* 비로그인(예: 회원가입 전) */
  }

  let nice;
  try {
    nice = await buildNiceRequest(returnUrl);
  } catch {
    return new NextResponse("본인확인 요청 생성에 실패했습니다.", { status: 502 });
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>
<form name="niceForm" method="post" action="${CHECKPLUS_URL}">
  <input type="hidden" name="m" value="service"/>
  <input type="hidden" name="token_version_id" value="${nice.tokenVersionId}"/>
  <input type="hidden" name="enc_data" value="${nice.encData}"/>
  <input type="hidden" name="integrity_value" value="${nice.integrityValue}"/>
</form>
<script>document.niceForm.submit();</script>
</body></html>`;

  const res = new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  // key/iv/reqNo/gate 를 암호화하여 단기 쿠키에 저장(콜백에서 복호화에 사용).
  // NICE 도메인 → 우리 콜백으로 cross-site POST 되므로 SameSite=None.
  const sealed = encryptPII(JSON.stringify({ key: nice.key, iv: nice.iv, reqNo: nice.reqNo, gate, userId }));
  res.cookies.set("kh_nice", sealed, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 600,
    path: "/api/identity",
  });
  return res;
}
