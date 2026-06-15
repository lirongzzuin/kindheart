import { NextRequest, NextResponse } from "next/server";
import { decodeNiceResult } from "@/lib/adapters/nice";
import { decryptPII, encryptPII, hashIdentifier } from "@/lib/crypto";
import { getAdminSupabase } from "@/lib/supabase/admin";

/**
 * NICE 표준창 결과 콜백 — NICE 가 enc_data 를 POST. 복호화하여 CI/DI/이름 취득 →
 * 해시·암호화하여 저장(TODO DB) → 팝업을 연 창에 결과를 postMessage 하고 닫는다.
 */
function resultHtml(origin: string, ok: boolean, name: string): NextResponse {
  const payload = JSON.stringify({ type: "nice-identity", ok, name });
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>
<script>
  try { window.opener && window.opener.postMessage(${payload}, ${JSON.stringify(origin)}); } catch(e){}
  window.close();
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:40px">${ok ? "본인확인이 완료되었습니다. 이 창은 곧 닫힙니다." : "본인확인에 실패했습니다. 창을 닫고 다시 시도해 주세요."}</p>
</body></html>`;
  const res = new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  res.cookies.delete("kh_nice");
  return res;
}

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  try {
    const form = await req.formData();
    const encData = String(form.get("enc_data") ?? "");
    const sealed = req.cookies.get("kh_nice")?.value;
    if (!encData || !sealed) return resultHtml(origin, false, "");

    const { key, iv, userId } = JSON.parse(decryptPII(sealed)) as {
      key: string;
      iv: string;
      gate: string;
      userId: string | null;
    };
    const result = decodeNiceResult(encData, key, iv);

    if (result.resultcode !== "0000" || !result.ci) {
      return resultHtml(origin, false, "");
    }

    // ── PII 처리 (서버 사이드) ──
    // CI/DI: 단방향 해시(1인1계정 식별). 이름: 암호화. 평문 미보관.
    const ciHash = hashIdentifier(result.ci);
    const diHash = result.di ? hashIdentifier(result.di) : null;
    const nameEnc = result.name ? encryptPII(result.name) : null;

    // 로그인 사용자면 app_user 에 저장(서비스 롤). ci_hash 유니크 위반 = 동일인 다중계정 → 차단.
    const admin = getAdminSupabase();
    if (userId && admin) {
      const { data: dup } = await admin
        .from("app_user")
        .select("id")
        .eq("ci_hash", ciHash)
        .neq("id", userId)
        .maybeSingle();
      if (dup) {
        // 이미 다른 계정이 이 CI 로 인증됨 → 다중계정 차단
        return resultHtml(origin, false, "");
      }
      await admin
        .from("app_user")
        .update({
          ci_hash: ciHash,
          di_hash: diHash,
          name_enc: nameEnc,
          identity_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq("id", userId);
      await admin.from("audit_log").insert({
        actor_id: userId,
        action: "identity_verify",
        entity: "app_user",
        entity_id: userId,
        meta: { method: "nice" },
      });
    }
    // userId 가 없으면(회원가입 전 본인인증) 결과만 반환 → 가입 완료 시 연결(후속).

    return resultHtml(origin, true, result.name ?? "");
  } catch {
    return resultHtml(origin, false, "");
  }
}
