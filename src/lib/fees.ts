/**
 * 수익 구조 (CLAUDE.md §3) — 사용자가 납득 가능한 보수적 설계.
 *
 * 핵심 철학:
 *  1. 사연자가 받는 돈을 함부로 떼지 않는다. 기본적으로 후원자에게
 *     "운영비를 더해 전액이 전달되도록" 선택지를 먼저 제공한다(opt-in, 기본 ON).
 *     → 후원자가 운영비를 부담하면 사연자는 후원금 100% 수령.
 *  2. 후원자가 운영비 부담을 끄면, 그때만 플랫폼이 후원금에서 운영 수수료를
 *     공제(default 5%)하고 그 내역을 결제 직전 투명하게 고지한다.
 *  3. PG 결제대행 수수료는 실비로 별도 표기(플랫폼 마진 아님).
 *  4. Mode A(기부): 공익법인이 자금을 보관/분배하고, 영리 운영사는
 *     공익법인에 제공하는 시스템·운영 용역의 정상대가로 수익을 얻는다(후원금 직접 차감 아님).
 *     화면에는 운영비 비율을 고지만 한다.
 *
 * 모든 비율은 환경변수로 조정 가능(런칭 후 정책 변경 대응).
 */

import { DonationMode } from "./types";

function num(name: string, fallback: number): number {
  const v = process.env[name];
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const FEE_CONFIG = {
  /** Mode B 플랫폼 운영 수수료율 (후원자가 운영비 부담을 끈 경우에만 후원금에서 공제) */
  platformRateB: num("FEE_PLATFORM_RATE_B", 0.05),
  /** Mode A 운영비 고지용 비율 (공익법인 용역대가 기준, 후원금 직접차감 아님 — 표시 전용) */
  platformRateA: num("FEE_PLATFORM_RATE_A", 0.05),
  /** PG 결제대행 실비 추정율 (간편결제/카드 평균) — 정산 시 실제값으로 대체 */
  pgRate: num("FEE_PG_RATE", 0.018),
  /** PG 건당 고정 실비(원) */
  pgFixed: num("FEE_PG_FIXED", 0),
} as const;

export interface FeeBreakdown {
  /** 후원자가 실제 결제하는 총액 */
  charge: number;
  /** 후원 명목 금액(후원자가 선택한 금액) */
  donation: number;
  /** 플랫폼 운영 수수료 */
  platformFee: number;
  /** PG 결제대행 실비 */
  pgFee: number;
  /** 사연자/펀드에 실제 전달되는 금액 */
  netToBeneficiary: number;
  /** 후원자가 운영비를 추가 부담했는지 */
  coversFee: boolean;
  /** 표시용 안내 라벨 */
  label: string;
}

/**
 * 수수료 계산.
 * @param amount 후원자가 선택한 후원/기부 금액(원)
 * @param mode A | B
 * @param coversFee 후원자가 운영비를 추가 부담하는가(전액 전달 옵션, 기본 true 권장)
 */
export function calcFee(amount: number, mode: DonationMode, coversFee: boolean): FeeBreakdown {
  const rate = mode === DonationMode.A_TAX_DEDUCTIBLE ? FEE_CONFIG.platformRateA : FEE_CONFIG.platformRateB;
  const platformFee = Math.round(amount * rate);
  const pgBase = coversFee ? amount + platformFee : amount;
  const pgFee = Math.round(pgBase * FEE_CONFIG.pgRate) + FEE_CONFIG.pgFixed;

  if (mode === DonationMode.A_TAX_DEDUCTIBLE) {
    // Mode A: 후원자 결제액 전체가 공익법인으로. 운영비는 용역대가로 별도 처리.
    // 세액공제 기준금액은 결제액(= 기부금) 전체.
    return {
      charge: amount,
      donation: amount,
      platformFee, // 표시 전용(고지용)
      pgFee,
      netToBeneficiary: amount, // 공익법인 분배 기준
      coversFee: false,
      label: "기부금 전액이 공익법인을 통해 검증된 곳에 투명하게 전달됩니다.",
    };
  }

  // Mode B
  if (coversFee) {
    // 후원자가 운영분을 더해 결제 → 사연자는 100% 수령
    return {
      charge: amount + platformFee,
      donation: amount,
      platformFee,
      pgFee,
      netToBeneficiary: amount,
      coversFee: true,
      label: "후원금 100%가 사연 주인공에게 그대로 전달됩니다. 검증·안전 결제·투명 관리도 함께 응원해 주셔서 감사합니다.",
    };
  }
  // 후원자가 운영분을 더하지 않음 → 후원금 일부가 안전 운영에 사용
  return {
    charge: amount,
    donation: amount,
    platformFee,
    pgFee,
    netToBeneficiary: amount - platformFee,
    coversFee: false,
    label: `후원금의 약 ${(FEE_CONFIG.platformRateB * 100).toFixed(0)}%는 사연 검증·안전한 결제·투명한 집행 관리에 사용되고, 나머지가 주인공에게 전달됩니다.`,
  };
}
