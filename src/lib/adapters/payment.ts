/**
 * 결제/정산 어댑터 — 공급자 교체 가능(토스페이먼츠 기본). 초기엔 mock.
 * 자금은 PG 에스크로/공익법인 계좌를 경유하며 플랫폼 계좌에 머물지 않는다(전자금융업 규제 회피).
 */

import { PaymentMethod, PaymentType } from "../types";
import { FEATURES } from "../config";

export interface PaymentRequest {
  amount: number; // 실제 청구액(수수료 포함 가능)
  method: PaymentMethod;
  type: PaymentType;
  orderName: string;
  customerKey?: string;
  /** 정기결제 시 빌링키 발급 여부 */
  issueBillingKey?: boolean;
}

export interface PaymentResult {
  ok: boolean;
  paymentKey: string;
  status: "PAID" | "READY" | "FAILED" | "CANCELED";
  billingKeyRef?: string; // 정기결제용 (실제 빌링키는 KMS 암호화 후 참조만)
  receiptUrl?: string;
  message?: string;
}

export interface PaymentAdapter {
  readonly name: string;
  /** 결제 승인 (에스크로 경유 가정) */
  charge(req: PaymentRequest): Promise<PaymentResult>;
  /** 빌링키 기반 정기결제 청구 */
  chargeWithBillingKey(billingKeyRef: string, amount: number, orderName: string): Promise<PaymentResult>;
  /** 정기결제 해지 (전화 한 통/원클릭 보장 — 접근성) */
  cancelBillingKey(billingKeyRef: string): Promise<{ ok: boolean }>;
  /** 환불/재배분 */
  refund(paymentKey: string, amount: number, reason: string): Promise<{ ok: boolean }>;
}

class MockPaymentAdapter implements PaymentAdapter {
  readonly name = "mock-pg";

  async charge(req: PaymentRequest): Promise<PaymentResult> {
    const paymentKey = `mock_${req.method}_${Date.now()}`;
    // 카드/계좌이체 일부 실패 시뮬레이션 가능하지만 기본 성공
    return {
      ok: true,
      paymentKey,
      status: "PAID",
      billingKeyRef: req.issueBillingKey ? `bk_${req.customerKey ?? "anon"}_${Date.now()}` : undefined,
      receiptUrl: `https://mock-pg.local/receipt/${paymentKey}`,
    };
  }

  async chargeWithBillingKey(billingKeyRef: string, amount: number, orderName: string): Promise<PaymentResult> {
    return {
      ok: true,
      paymentKey: `mock_recur_${Date.now()}`,
      status: "PAID",
      billingKeyRef,
      receiptUrl: `https://mock-pg.local/receipt/recur`,
      message: `${orderName} ${amount}원 정기결제 승인(mock)`,
    };
  }

  async cancelBillingKey(): Promise<{ ok: boolean }> {
    return { ok: true };
  }

  async refund(): Promise<{ ok: boolean }> {
    return { ok: true };
  }
}

/** TODO: 실제 토스페이먼츠 어댑터 — FEATURE_REAL_PAYMENT 활성 시 주입 */
export function getPaymentAdapter(): PaymentAdapter {
  if (FEATURES.REAL_PAYMENT) {
    // return new TossPaymentsAdapter(...)
    throw new Error("실 PG 어댑터 미구현 — FEATURE_REAL_PAYMENT 비활성 필요");
  }
  return new MockPaymentAdapter();
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "kakaopay", label: "카카오페이", icon: "account_balance_wallet" },
  { id: "naverpay", label: "네이버페이", icon: "payments" },
  { id: "tosspay", label: "토스페이", icon: "send_money" },
  { id: "card", label: "카드 결제", icon: "credit_card" },
  { id: "transfer", label: "계좌 이체", icon: "account_balance" },
];
