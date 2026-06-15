/** 접근성 내장 UI 프리미티브 (KWCAG: 48px 터치타겟, 포커스, 라벨) + 프리미엄 스타일. */
import Link from "next/link";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "outline" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "bg-primary text-on-primary shadow-cta hover:brightness-110",
  secondary: "btn-gradient text-on-secondary shadow-cta hover:brightness-110",
  outline: "border-2 border-primary text-primary hover:bg-primary hover:text-on-primary",
  ghost: "text-on-surface-variant hover:bg-surface-container-low",
};

const BASE =
  "min-h-touch-target-min px-6 rounded-2xl font-button-text flex items-center justify-center gap-2 tap-scale transition-all disabled:opacity-50 disabled:cursor-not-allowed";

export function Button({
  children,
  variant = "secondary",
  className = "",
  icon,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: string }) {
  return (
    <button className={`${BASE} ${VARIANT[variant]} ${className}`} {...props}>
      {icon && <Icon name={icon} size={20} />}
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "secondary",
  className = "",
  icon,
  ariaLabel,
}: {
  children: React.ReactNode;
  href: string;
  variant?: Variant;
  className?: string;
  icon?: string;
  ariaLabel?: string;
}) {
  return (
    <Link href={href} aria-label={ariaLabel} className={`${BASE} ${VARIANT[variant]} ${className}`}>
      {icon && <Icon name={icon} size={20} />}
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "neutral",
  icon,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "verified" | "warning" | "info";
  icon?: string;
}) {
  const tones = {
    neutral: "bg-surface-container-high text-on-surface-variant border border-outline-variant/40",
    verified: "bg-primary-fixed text-on-primary-fixed-variant",
    warning: "bg-error-container text-on-error-container font-bold",
    info: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md ${tones[tone]}`}>
      {icon && <Icon name={icon} fill size={18} />}
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  label,
  tone = "secondary",
  size = "md",
}: {
  value: number;
  label?: string;
  tone?: "secondary" | "primary";
  size?: "sm" | "md";
}) {
  const v = Math.max(0, Math.min(100, value));
  const h = size === "sm" ? "h-2" : "h-3";
  const fill = tone === "primary" ? "bg-primary" : "bg-secondary";
  return (
    <div
      className={`w-full bg-surface-container-high rounded-full ${h} overflow-hidden`}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `진행률 ${v}%`}
    >
      <div className={`${fill} ${h} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${v}%` }} />
    </div>
  );
}
