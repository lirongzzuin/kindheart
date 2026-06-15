import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { PENDING_DISBURSEMENTS } from "@/lib/admin-data";

const Body = z.object({
  kind: z.enum(["review", "disbursement", "content"]),
  id: z.string().min(1),
  action: z.enum(["approve", "reject", "suspend", "release", "hide", "restore"]),
  note: z.string().max(500).optional(),
});

// 운영자 단일 액션 엔드포인트 — 간단 관리. 모든 액션은 감사로그 기록.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ message: "운영자 권한이 필요합니다." }, { status: 403 });

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  // 핵심 규칙: 분할 지급은 직전 회차 사용증빙이 검증돼야만 집행 가능 (먹튀 방지).
  if (parsed.kind === "disbursement" && parsed.action === "release") {
    const d = PENDING_DISBURSEMENTS.find((x) => x.id === parsed.id);
    if (!d) return NextResponse.json({ message: "지급 건을 찾을 수 없습니다." }, { status: 404 });
    if (d.prevRound !== null && !d.prevUsageVerified) {
      return NextResponse.json(
        { message: `${d.prevRound}회차 사용 증빙이 확인되지 않아 집행할 수 없습니다.`, code: "USAGE_REPORT_REQUIRED" },
        { status: 422 }
      );
    }
    // TODO(DB): disbursement status=PAID, PG 지급 트랜잭션, audit_log.
    return NextResponse.json({ ok: true, message: `${d.round}회차 ${d.amount.toLocaleString()}원 집행 완료` });
  }

  // TODO(DB): kind/action 별 상태 전이 + audit_log(actor=admin, demo 여부).
  //  review:approve→APPROVED, reject→REJECTED, suspend→SUSPENDED
  //  content:hide→hidden, restore→visible
  return NextResponse.json({ ok: true, kind: parsed.kind, id: parsed.id, action: parsed.action });
}
