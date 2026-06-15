import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/config";

// PWA — 모바일/데스크탑 설치형 대응. 비용 0(정적 생성).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — 투명 후원·기부`,
    short_name: BRAND.name,
    description: "검증된 사연에 투명하게 후원하는 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f9f9",
    theme_color: "#002421",
    lang: "ko",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
