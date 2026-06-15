"use client";
/**
 * 반응형 셸 — 모든 화면 크기/OS 대응.
 *  - 상단: fixed + backdrop-blur 내비 (h-16). main 은 pt-20 으로 가림 방지.
 *  - 접근성(글자크기/고대비) 컨트롤은 "고정 바"가 아니라 본문 흐름 안 상단에 둔다
 *    → 고정요소 겹침(overlap) 원천 차단.
 *  - 하단(모바일): fixed 탭바 (h-20 + safe-area). main 은 pb 로 가림 방지.
 *  - FAB: 모바일 원형 / 데스크탑 라벨 포함.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { A11yControls } from "./A11yControls";
import { useAuth } from "@/hooks/useAuth";
import { BRAND, SUPPORT_PHONE, SHOW_PHONE_SUPPORT } from "@/lib/config";

const NAV = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/browse", label: "둘러보기", icon: "explore" },
  { href: "/community", label: "라운지", icon: "forum" },
  { href: "/me/giving", label: "내후원", icon: "favorite" },
  { href: "/apply", label: "신청", icon: "edit_note" },
];

export function AppShell({ children, hideChrome = false }: { children: React.ReactNode; hideChrome?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* 건너뛰기 링크 — 오직 '키보드 Tab'(focus-visible)일 때만 노출.
          마우스 클릭·터치·프로그램적 포커스(페이지 전환 등)로는 절대 보이지 않음. */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[100] focus-visible:flex focus-visible:items-center focus-visible:gap-1.5 focus-visible:bg-primary focus-visible:text-on-primary focus-visible:px-5 focus-visible:h-12 focus-visible:rounded-xl focus-visible:shadow-elevated font-label-md"
      >
        <Icon name="keyboard_double_arrow_down" size={20} />
        메뉴 건너뛰고 본문 보기
      </a>

      {/* 상단 내비 (fixed + blur, h-16) */}
      <header className="fixed top-0 inset-x-0 z-50 blur-nav border-b border-primary/10">
        <div className="flex justify-between items-center gap-3 h-16 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0" aria-label={`${BRAND.name} 홈`}>
            <Icon name="volunteer_activism" fill className="text-primary shrink-0" size={28} />
            <span className="font-headline-md text-primary tracking-tight truncate">{BRAND.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="주요 메뉴">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(n.href) ? "page" : undefined}
                className={`flex items-center gap-1.5 px-3.5 h-10 rounded-full font-label-md transition-colors ${
                  isActive(n.href)
                    ? "bg-primary/5 text-primary font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                }`}
              >
                <Icon name={n.icon} fill={isActive(n.href)} size={20} />
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            {user ? (
              <Link
                href="/me/giving"
                aria-label="내 정보"
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low tap-scale"
              >
                <Icon name="account_circle" fill />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 sm:px-4 h-10 rounded-full text-primary font-label-md hover:bg-surface-container-low tap-scale whitespace-nowrap"
              >
                <Icon name="person" size={20} />
                로그인
              </Link>
            )}
            <Link
              href="/browse"
              className="btn-gradient text-on-secondary font-label-md px-4 sm:px-5 h-10 flex items-center rounded-full shadow-soft tap-scale whitespace-nowrap"
            >
              후원하기
            </Link>
          </div>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="max-w-container-max mx-auto w-full pt-16 scroll-mt-20 outline-none pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-stack-lg"
      >
        {/* 접근성 컨트롤 — 본문 흐름(고정 아님) */}
        {!hideChrome && (
          <div className="px-margin-mobile md:px-margin-desktop pt-4 flex justify-end">
            <A11yControls />
          </div>
        )}
        {children}
      </main>

      {/* 전화 후원 FAB — 모바일 원형 / 데스크탑 라벨. (콜센터 가동 전 우선 숨김) */}
      {!hideChrome && SHOW_PHONE_SUPPORT && (
        <div className="fixed right-5 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] md:bottom-8 z-40">
          <a
            href={`tel:${SUPPORT_PHONE}`}
            aria-label={`전화로 후원하기 ${SUPPORT_PHONE}`}
            className="btn-gradient text-on-secondary rounded-full shadow-elevated flex items-center justify-center tap-scale w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-4 md:gap-2"
          >
            <Icon name="call" />
            <span className="hidden md:inline font-button-text">전화로 후원하기</span>
          </a>
        </div>
      )}

      {/* 하단 탭바 (모바일) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 blur-nav border-t border-primary/10" aria-label="하단 메뉴">
        <div className="flex justify-around items-stretch h-20 px-1 pb-safe max-w-container-max mx-auto">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 rounded-2xl transition-colors ${
                  active ? "text-primary" : "text-on-surface-variant/70 hover:text-primary"
                }`}
              >
                <Icon name={n.icon} fill={active} size={24} />
                <span className="text-[11px] font-bold leading-none whitespace-nowrap">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
