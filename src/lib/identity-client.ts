"use client";
/**
 * 본인확인 클라이언트 헬퍼 — 호출부(회원가입/사연등록/영수증)는 이것만 쓴다.
 *  - 실연동(FEATURE_REAL_IDENTITY + NICE 키): NICE 표준창 팝업 → 콜백 postMessage 수신.
 *  - 그 외(데모/로컬): 기존 mock 엔드포인트로 즉시 통과.
 */
import { FEATURES } from "./config";
import { IdentityGate } from "./types";

export async function verifyIdentity(gate: IdentityGate): Promise<{ ok: boolean; name?: string }> {
  // 데모/미연동: mock
  if (!FEATURES.REAL_IDENTITY) {
    const res = await fetch("/api/identity/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gate }),
    });
    if (!res.ok) return { ok: false };
    const d = await res.json();
    return { ok: true, name: d.verifiedName };
  }

  // 실연동: NICE 표준창 팝업
  return new Promise((resolve) => {
    const w = 480;
    const h = 640;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(
      `/api/identity/start?gate=${encodeURIComponent(gate)}`,
      "nice_identity",
      `width=${w},height=${h},left=${left},top=${top}`
    );
    if (!popup) {
      resolve({ ok: false });
      return;
    }
    let settled = false;
    function finish(r: { ok: boolean; name?: string }) {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", onMsg);
      clearInterval(timer);
      resolve(r);
    }
    function onMsg(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "nice-identity") finish({ ok: !!e.data.ok, name: e.data.name });
    }
    window.addEventListener("message", onMsg);
    // 사용자가 팝업을 그냥 닫은 경우
    const timer = setInterval(() => {
      if (popup.closed) finish({ ok: false });
    }, 700);
  });
}
