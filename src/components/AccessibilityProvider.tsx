"use client";
/**
 * 접근성 전역 상태 (법적 의무 — KWCAG 2.1 AA).
 * 글씨 크기 배율 / 고대비 / 단순 모드를 제공하고 localStorage 에 영속.
 * 모든 페이지에서 토글 가능하며 새로고침 후에도 유지된다.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type A11yState = {
  fontScale: number;
  fontLabel: string;
  highContrast: boolean;
  cycleFontScale: () => void;
  toggleHighContrast: () => void;
};

// 작게(IT 친화 젊은 세대) ~ 아주 크게(고령자). 기본은 '보통'(1).
const FONT_STEPS = [0.875, 1, 1.15, 1.3];
const FONT_LABELS = ["작게", "보통", "크게", "아주 크게"];
const A11yContext = createContext<A11yState | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);

  // 초기 로드: 저장값 복원
  useEffect(() => {
    const fs = Number(localStorage.getItem("kh.fontScale"));
    const hc = localStorage.getItem("kh.highContrast") === "1";
    if (FONT_STEPS.includes(fs)) setFontScale(fs);
    setHighContrast(hc);
  }, []);

  const fontLabel = FONT_LABELS[Math.max(0, FONT_STEPS.indexOf(fontScale))] ?? "보통";

  // 반영
  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
    localStorage.setItem("kh.fontScale", String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.classList.toggle("hc", highContrast);
    localStorage.setItem("kh.highContrast", highContrast ? "1" : "0");
  }, [highContrast]);

  const cycleFontScale = useCallback(() => {
    setFontScale((cur) => {
      const i = FONT_STEPS.indexOf(cur);
      return FONT_STEPS[(i + 1) % FONT_STEPS.length];
    });
  }, []);

  const toggleHighContrast = useCallback(() => setHighContrast((v) => !v), []);

  return (
    <A11yContext.Provider value={{ fontScale, fontLabel, highContrast, cycleFontScale, toggleHighContrast }}>
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y(): A11yState {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used within AccessibilityProvider");
  return ctx;
}
