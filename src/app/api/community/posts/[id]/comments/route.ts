import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scanContent } from "@/lib/pii";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const Body = z.object({ body: z.string().min(1).max(1000) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const rl = await rateLimit(`comment:${clientIp(req)}`, 15, 5 * 60_000);
  if (!rl.ok) return NextResponse.json({ message: "잠시 후 다시 시도해 주세요." }, { status: 429 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ message: "내용을 입력해 주세요." }, { status: 400 });
  }

  const scan = scanContent(parsed.body, true);
  const blocked = scan.findings.filter((f) => f.severity === "block");
  if (blocked.length > 0) {
    return NextResponse.json({ message: blocked[0].message, code: "CONTENT_BLOCKED" }, { status: 422 });
  }

  // TODO(DB): comment insert(postId=params.id, 마스킹 본문, 닉네임만) + commentCount 증가 + audit_log.
  return NextResponse.json({ commentId: `c_${Date.now()}`, postId: params.id, body: scan.masked });
}
