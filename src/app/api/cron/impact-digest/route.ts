import { NextRequest, NextResponse } from "next/server";
import { MOCK_STORY_UPDATES } from "@/lib/impact-data";

/**
 * 자동화: 임팩트 다이제스트 — 후원한 사연에 새 소식/집행이 생기면 후원자에게 자동 알림.
 * 운영자는 손대지 않는다(Vercel Cron 이 매일 호출). 운영 자동화·간소화의 핵심.
 *
 * 보안: CRON_SECRET 으로 보호(Vercel Cron 은 Authorization 헤더 자동 첨부).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }
  }

  // TODO(DB): 어제 이후 생성된 story_update / disbursement 를 조회 →
  //   해당 사연 후원자에게 in-app notification insert + 알림톡/이메일 발송(어댑터).
  // 여기서는 mock 집계만 수행.
  const updates = Object.values(MOCK_STORY_UPDATES).flat();
  const planned = updates.map((u) => ({
    storyId: u.storyId,
    channel: "alimtalk+inapp",
    title: "후원한 사연에 새 소식",
    preview: u.title,
  }));

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    notificationsPlanned: planned.length,
    sample: planned.slice(0, 3),
  });
}
