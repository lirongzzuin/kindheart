import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentAdapter } from "@/lib/adapters/payment";

const Body = z.object({ subscriptionId: z.string().min(1) });

// 정기후원 원클릭 해지 — 접근성·분쟁예방. 빌링키 해지.
export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  // TODO(DB): subscription 조회 → billing_key_ref 로 PG 해지 → status=CANCELED → audit_log.
  const pg = getPaymentAdapter();
  await pg.cancelBillingKey(`bk_${parsed.subscriptionId}`);
  return NextResponse.json({ ok: true });
}
