import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scanContent } from "@/lib/pii";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { MOCK_POSTS } from "@/lib/community-data";

const Body = z.object({
  category: z.enum(["thanks", "story_share", "question", "free"]),
  title: z.string().min(2).max(100),
  body: z.string().min(2).max(2000),
});

export async function GET() {
  // 공개 목록 — 노출 상태만. (캐시는 라우트 레벨에서 처리)
  return NextResponse.json({ posts: MOCK_POSTS.filter((p) => p.status === "visible") });
}

export async function POST(req: NextRequest) {
  // 스팸/비용 폭증 방어: IP당 5분에 5건
  const rl = await rateLimit(`post:${clientIp(req)}`, 5, 5 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "잠시 후 다시 시도해 주세요. (작성 제한)" }, { status: 429 });
  }

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ message: "제목/내용을 확인해 주세요." }, { status: 400 });
  }

  // 악용 차단: 계좌·연락처·외부송금 유도·URL 등 스캔
  const titleScan = scanContent(parsed.title, true);
  const bodyScan = scanContent(parsed.body, true);
  const blocked = [...titleScan.findings, ...bodyScan.findings].filter((f) => f.severity === "block");
  if (blocked.length > 0) {
    return NextResponse.json(
      { message: blocked[0].message, code: "CONTENT_BLOCKED", findings: blocked },
      { status: 422 }
    );
  }

  // TODO(DB): 인증 사용자 확인 → post insert(authorNickname 만, PII 비저장) + audit_log.
  // 저장 본문은 마스킹된 안전본을 사용(이중 방어).
  const postId = `post_${Date.now()}`;
  return NextResponse.json({
    postId,
    title: titleScan.masked,
    body: bodyScan.masked,
    status: "visible",
  });
}
