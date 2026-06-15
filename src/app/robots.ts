import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kindheart.example.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 개인/거래성 경로는 색인 제외
      disallow: ["/me/", "/donate/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
