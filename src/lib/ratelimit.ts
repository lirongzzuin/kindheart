/**
 * 레이트 리밋 — 악용(스팸/사기)과 "비용 폭증" 동시 방어.
 * 비용 최소화: 별도 인프라 없이 동작.
 *  - 운영(분산): Upstash Redis REST (서버리스 친화, 무료 티어) 가 설정돼 있으면 사용.
 *  - 미설정(개발/단일 인스턴스): 인메모리 슬라이딩 윈도우 폴백.
 *
 * 서버리스 환경에서 인메모리는 인스턴스별이라 완벽하진 않지만, 폭주 1차 방어로 충분.
 * 정밀 분산 제한이 필요하면 Upstash 키만 넣으면 자동 전환된다.
 */

type Result = { ok: boolean; remaining: number; resetMs: number };

const memory = new Map<string, number[]>();

function memoryLimit(key: string, limit: number, windowMs: number): Result {
  const now = Date.now();
  const arr = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    return { ok: false, remaining: 0, resetMs: windowMs - (now - arr[0]) };
  }
  arr.push(now);
  memory.set(key, arr);
  // 메모리 누수 방지: 가끔 정리
  if (memory.size > 5000) memory.clear();
  return { ok: true, remaining: limit - arr.length, resetMs: windowMs };
}

async function upstashLimit(key: string, limit: number, windowMs: number): Promise<Result> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const windowSec = Math.ceil(windowMs / 1000);
  // INCR + EXPIRE(NX) 파이프라인
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", `rl:${key}`],
      ["EXPIRE", `rl:${key}`, windowSec, "NX"],
    ]),
    cache: "no-store",
  });
  if (!res.ok) return { ok: true, remaining: limit, resetMs: windowMs }; // 장애 시 통과(가용성 우선)
  const data = (await res.json()) as { result: number }[];
  const count = data[0]?.result ?? 1;
  return { ok: count <= limit, remaining: Math.max(0, limit - count), resetMs: windowMs };
}

/**
 * @param key  식별자(예: `donate:${ip}`). IP+행위 조합 권장.
 * @param limit  허용 횟수
 * @param windowMs  윈도우(ms)
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<Result> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      return await upstashLimit(key, limit, windowMs);
    } catch {
      return memoryLimit(key, limit, windowMs);
    }
  }
  return memoryLimit(key, limit, windowMs);
}

/** 요청에서 클라이언트 IP 추정 (Vercel/프록시 헤더 우선). */
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
