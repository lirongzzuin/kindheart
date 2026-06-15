import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getVerificationAdapter } from "@/lib/adapters/verification";
import { NEW_GRADE_GOAL_CAP } from "@/lib/config";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const Body = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  goal: z.string(),
  usage: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // 사연 등록 남용/도배 방어: IP당 1시간 3회
  const rl = await rateLimit(`story:${clientIp(req)}`, 3, 60 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "신청이 너무 잦습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ message: "필수 항목을 확인해 주세요." }, { status: 400 });
  }

  const goal = Number(parsed.goal);
  if (!Number.isFinite(goal) || goal <= 0) {
    return NextResponse.json({ message: "목표 금액이 올바르지 않습니다." }, { status: 400 });
  }
  // 신규 등급 한도
  if (goal > NEW_GRADE_GOAL_CAP) {
    return NextResponse.json(
      { message: `신규 신청자 목표 금액 한도(${NEW_GRADE_GOAL_CAP}원)를 초과했습니다.` },
      { status: 422 }
    );
  }

  // 증빙 검증 파이프라인 (mock): 표절 검사
  const verifier = getVerificationAdapter();
  const plagiarism = await verifier.checkPlagiarism(parsed.content);
  if (plagiarism.score > 0.8) {
    return NextResponse.json({ message: "기존 사연과 매우 유사합니다. 다시 확인해 주세요." }, { status: 422 });
  }

  // TODO(DB): story insert (status=SUBMITTED), evidence 큐 등록, audit_log.
  // 본인확인/수령계좌 명의 일치는 사연 등록 게이트에서 별도 검증.
  const storyId = `story_${Date.now()}`;
  return NextResponse.json({ storyId, status: "SUBMITTED" });
}
