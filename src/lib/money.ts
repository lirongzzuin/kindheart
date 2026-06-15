/** 금액 포맷 유틸 (KRW). */
export function won(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export function wonSymbol(n: number): string {
  return `₩${Math.round(n).toLocaleString("ko-KR")}`;
}

export function pct(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}
