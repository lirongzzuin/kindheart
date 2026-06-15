import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { BRAND } from "@/lib/config";

// Atkinson Hyperlegible — 난독증/저시력 친화 고가독 폰트. zero-CLS 셀프호스팅.
const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} — 투명 후원·기부 플랫폼`,
  description:
    "검증된 사연에 투명하게 후원하고, 후원금 사용 내역을 끝까지 확인하세요. 누구나 동등하게 이용할 수 있습니다.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#002421",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={atkinson.variable}>
      <head>
        {/* Material Symbols 아이콘 폰트 — head <link> 로 로드(가장 안정적).
            display=block: 로드 전까지 빈 칸 → 'volunteer_activism' 등 코드명 노출 방지. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="font-sans bg-surface text-on-surface">
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  );
}
