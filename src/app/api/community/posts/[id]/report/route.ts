import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const Body = z.object({ reason: z.string().min(1).max(300) });

// 게시글/댓글 신고 → 임계 누적 시 자동 숨김(under_review) 후 운영자 검토.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const rl = await rateLimit(`creport:${clientIp(req)}`, 20, 60 * 60_000);
  if (!rl.ok) return NextResponse.json({ message: "신고가 너무 많습니다." }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ message: "신고 사유를 입력해 주세요." }, { status: 400 });
  }

  // TODO(DB): content_report insert(postId=params.id) + 신고수 임계(예: 3) 초과 시 status=under_review + audit_log.
  void parsed;
  return NextResponse.json({ ok: true });
}
