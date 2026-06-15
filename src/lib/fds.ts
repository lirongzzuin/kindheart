/**
 * 이상거래 탐지(FDS) — 신호 집계 → RiskScore. 임계 초과 시 자동 보류·플래그.
 * mock 규칙 기반. 실제는 행위 로그/그래프 분석으로 확장.
 */

import { FraudSignal } from "./types";

export const RISK_THRESHOLD = 60; // 초과 시 자동 보류(SUSPENDED 후보)

const WEIGHTS: Record<FraudSignal["type"], number> = {
  multi_story_short_period: 25,
  same_ip_multi_account: 30,
  duplicate_text: 20,
  self_dealing: 35, // 자전 후원(후원자=수혜 관계)
  abnormal_payment: 15,
};

export function scoreRisk(signals: FraudSignal[]): number {
  const raw = signals.reduce((sum, s) => sum + (WEIGHTS[s.type] ?? s.weight), 0);
  return Math.min(100, raw);
}

export function shouldAutoSuspend(score: number): boolean {
  return score >= RISK_THRESHOLD;
}

/** 자전 후원 감지: 후원자 CI == 사연자 CI 또는 동일 기기/IP 군집 */
export function detectSelfDealing(donorCi: string | null, beneficiaryCi: string | null): boolean {
  return !!donorCi && !!beneficiaryCi && donorCi === beneficiaryCi;
}
