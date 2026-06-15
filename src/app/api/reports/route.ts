import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  storyId: z.string().min(1),
  reason: z.string().min(1),
  detail: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  // TODO(DB): report insert → 해당 사연 지급 일시정지(disbursement HELD/BLOCKED)
  //           + status=SUSPENDED 재심사 트리거 + audit_log.
  void parsed;
  return NextResponse.json({ ok: true });
}
