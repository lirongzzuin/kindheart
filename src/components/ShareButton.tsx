"use client";
/**
 * 공유하기 — 플랫폼별 공유 시트.
 *  - 카카오톡: 공식 JS SDK 피드 템플릿(이미지·제목·설명·버튼). NEXT_PUBLIC_KAKAO_JS_KEY 필요, 없으면 링크복사 폴백.
 *  - 링크 복사 / 문자(SMS) / X / 페이스북 / 네이버 밴드 / 시스템 공유(Web Share)
 * "같이 후원하자" 모으기/확산용.
 */
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

declare global {
  interface Window {
    Kakao?: any;
  }
}

// 플랫폼 브랜드 로고 (인라인 SVG)
const KakaoLogo = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.9 5.37 4.76 6.78-.21.77-.76 2.78-.87 3.21-.14.54.2.53.41.39.17-.12 2.65-1.8 3.72-2.53.64.08 1.3.13 1.98.13 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
  </svg>
);
const XLogo = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FacebookLogo = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.49 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const KAKAO_SDK = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

function absUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return path.startsWith("http") ? path : `${window.location.origin}${path}`;
}

async function ensureKakao(): Promise<any | null> {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!key || typeof window === "undefined") return null;
  if (!window.Kakao) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = KAKAO_SDK;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("kakao sdk load fail"));
      document.head.appendChild(s);
    }).catch(() => null);
  }
  if (window.Kakao && !window.Kakao.isInitialized?.()) {
    try {
      window.Kakao.init(key);
    } catch {
      /* already */
    }
  }
  return window.Kakao ?? null;
}

export function ShareButton({
  title,
  text,
  path,
  variant = "outline",
  label = "공유하기",
  iconOnly = false,
  className = "",
  imageUrl,
  description,
}: {
  title: string;
  text?: string;
  path: string;
  variant?: "outline" | "ghost" | "primary";
  label?: string;
  iconOnly?: boolean;
  className?: string;
  imageUrl?: string | null;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    if (open) closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const url = absUrl(path);
  const shareText = text ?? title;
  const desc = description ?? "투명하게 후원하고 끝까지 확인하는 KindHeart";

  function openExternal(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  async function shareKakao() {
    const Kakao = await ensureKakao();
    if (!Kakao?.Share) {
      await copyLink(); // 폴백: 링크 복사
      return;
    }
    // 카카오 피드는 유효한 imageUrl 이 필요. 사연 이미지가 있으면 사용, 없으면 기본 OG 이미지.
    const ogImage = imageUrl || `${window.location.origin}/og-default.png`;
    Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description: desc,
        imageUrl: ogImage,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [{ title: "사연 보고 같이 후원하기", link: { mobileWebUrl: url, webUrl: url } }],
    });
    setOpen(false);
  }

  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
      } catch {
        /* canceled */
      }
    }
    setOpen(false);
  }

  const OPTIONS: { key: string; label: string; bg: string; fg: string; glyph: React.ReactNode; onClick: () => void }[] = [
    {
      key: "kakao",
      label: "카카오톡",
      bg: "bg-[#FEE500]",
      fg: "text-[#191919]",
      glyph: KakaoLogo,
      onClick: shareKakao,
    },
    { key: "copy", label: copied ? "복사됨" : "링크 복사", bg: "bg-surface-container-high", fg: "text-on-surface", glyph: <Icon name={copied ? "check" : "link"} />, onClick: copyLink },
    { key: "sms", label: "문자", bg: "bg-[#34C759]", fg: "text-white", glyph: <Icon name="sms" fill />, onClick: () => openExternal(`sms:?&body=${encodeURIComponent(`${shareText} ${url}`)}`) },
    { key: "x", label: "X", bg: "bg-black", fg: "text-white", glyph: XLogo, onClick: () => openExternal(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`) },
    { key: "fb", label: "페이스북", bg: "bg-[#1877F2]", fg: "text-white", glyph: FacebookLogo, onClick: () => openExternal(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`) },
  ];

  // 버튼 스타일
  const styles = {
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-on-primary",
    ghost: "text-on-surface-variant hover:bg-surface-container-low",
    primary: "bg-primary text-on-primary hover:brightness-110",
  };

  return (
    <>
      {iconOnly ? (
        <button
          onClick={() => setOpen(true)}
          aria-label={`공유하기 — ${label}`}
          className={`shrink-0 w-12 h-12 rounded-2xl border-2 border-outline-variant/60 text-on-surface-variant flex items-center justify-center tap-scale hover:bg-surface-container-low transition-colors ${className}`}
        >
          <Icon name="ios_share" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label={`공유하기 — ${label}`}
          className={`min-h-touch-target-min px-6 rounded-2xl font-button-text flex items-center justify-center gap-2 tap-scale transition-all ${styles[variant]} ${className}`}
        >
          <Icon name="ios_share" />
          {label}
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/40 flex items-end sm:items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="공유 방법 선택"
        >
          <div className="bg-surface-container-lowest w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-5 sm:hidden" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-headline-md text-on-surface">같이 후원해요</h2>
              <button ref={closeRef} onClick={() => setOpen(false)} aria-label="닫기" className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low">
                <Icon name="close" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {OPTIONS.map((o) => (
                <button key={o.key} onClick={o.onClick} className="flex flex-col items-center gap-1.5 tap-scale">
                  <span className={`w-14 h-14 rounded-2xl flex items-center justify-center ${o.bg} ${o.fg}`}>{o.glyph}</span>
                  <span className="font-label-md text-[12px] text-on-surface-variant">{o.label}</span>
                </button>
              ))}
              {hasNativeShare && (
                <button onClick={shareNative} className="flex flex-col items-center gap-1.5 tap-scale">
                  <span className="w-14 h-14 rounded-2xl flex items-center justify-center bg-surface-container-high text-on-surface">
                    <Icon name="more_horiz" />
                  </span>
                  <span className="font-label-md text-[12px] text-on-surface-variant">더보기</span>
                </button>
              )}
            </div>

            {!process.env.NEXT_PUBLIC_KAKAO_JS_KEY && (
              <p className="mt-4 font-label-md text-[12px] text-on-surface-variant/70 text-center">
                카카오톡 공유는 키 설정 후 활성화돼요. 지금은 링크 복사로 공유할 수 있어요.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
