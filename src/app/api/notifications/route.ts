import { NextResponse } from "next/server";
import { getNotifications } from "@/lib/impact-data";

// 후원자 알림 조회. TODO(DB): auth.uid() 기준 본인 알림만.
export async function GET() {
  const items = getNotifications();
  return NextResponse.json({
    items,
    unread: items.filter((n) => !n.read).length,
  });
}
