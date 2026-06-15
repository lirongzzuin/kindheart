import type { MetadataRoute } from "next";
import { MOCK_STORIES } from "@/lib/mock-data";

// 검색 노출(무료 유입). 실제론 공개 상태 사연을 DB 에서 조회.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kindheart.example.com";
  const staticPaths = ["", "/browse", "/apply", "/login"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const storyPaths = MOCK_STORIES.filter((s) =>
    ["FUNDING", "FUNDED", "DISBURSING"].includes(s.status)
  ).map((s) => ({
    url: `${base}/stories/${s.id}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));
  return [...staticPaths, ...storyPaths];
}
