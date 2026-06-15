"use client";
/** 글씨 크기(작게~아주크게) / 고대비 토글. 현재 단계를 라벨로 표시. */
import { Icon } from "./Icon";
import { useA11y } from "./AccessibilityProvider";

export function A11yControls({ compact = false }: { compact?: boolean }) {
  const { cycleFontScale, toggleHighContrast, highContrast, fontLabel } = useA11y();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={cycleFontScale}
        aria-label={`글자 크기 조절 (현재: ${fontLabel}). 누르면 다음 크기로 바뀝니다.`}
        className="flex items-center gap-1.5 px-3 min-h-touch-target-min rounded-full border border-outline/30 text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors tap-scale"
      >
        <Icon name="text_fields" size={20} />
        <span>{compact ? fontLabel : `글자 ${fontLabel}`}</span>
      </button>
      <button
        onClick={toggleHighContrast}
        aria-pressed={highContrast}
        aria-label="고대비 모드 전환"
        className={`flex items-center gap-1.5 px-3 min-h-touch-target-min rounded-full border font-label-md transition-colors tap-scale ${
          highContrast
            ? "bg-primary text-on-primary border-primary"
            : "border-outline/30 text-on-surface-variant hover:bg-surface-container-low"
        }`}
      >
        <Icon name="contrast" size={20} />
        {!compact && <span>고대비</span>}
      </button>
    </div>
  );
}
