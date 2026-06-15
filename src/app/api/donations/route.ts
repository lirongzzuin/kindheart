import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DonationMode } from "@/lib/types";
import {
  assertDonationTarget,
  assertModeBConsent,
  assertStoryFundable,
  RuleViolation,
} from "@/lib/rules";
import { calcFee } from "@/lib/fees";
import { getPaymentAdapter } from "@/lib/adapters/payment";
import { getStoryById } from "@/lib/mock-data";
import { FEATURES } from "@/lib/config";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const Body = z.object({
  mode: z.enum(["A", "B"]),
  storyId: z.string().nullable().optional(),
  fundId: z.string().nullable().optional(),
  amount: z.number().int().positive().max(100_000_000),
  method: z.enum(["kakaopay", "naverpay", "tosspay", "card", "transfer"]),
  paymentType: z.enum(["ONE_TIME", "SUBSCRIPTION"]),
  coversFee: z.boolean(),
  agreePrivacy: z.boolean(),
  agreeNoTax: z.boolean().optional(),
  requestReceipt: z.boolean().optional(), // Mode A 기부금영수증 발급 신청
  identityVerified: z.boolean().optional(), // 영수증 발급 위한 본인확인 완료 여부
});

export async function POST(req: NextRequest) {
  // 비용 폭증/카딩(부정결제 시도) 방어: IP당 10분 10회
  const rl = await rateLimit(`donate:${clientIp(req)}`, 10, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ message: "결제 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  const mode = parsed.mode === "A" ? DonationMode.A_TAX_DEDUCTIBLE : DonationMode.B_DIRECT_SUPPORT;

  // 피처 플래그: Mode A 비활성 시 거부
  if (mode === DonationMode.A_TAX_DEDUCTIBLE && !FEATURES.MODE_A) {
    return NextResponse.json({ message: "세액공제 기부는 현재 준비 중입니다." }, { status: 403 });
  }

  if (!parsed.agreePrivacy) {
    return NextResponse.json({ message: "개인정보 수집·이용 동의가 필요합니다." }, { status: 400 });
  }

  try {
    // 절대원칙 #1·#2: 대상/모드 일치 + Mode B 세액공제 미동의 차단
    assertDonationTarget({
      mode,
      fundId: parsed.fundId ?? null,
      storyId: parsed.storyId ?? null,
    });
    assertModeBConsent(mode, parsed.agreeNoTax ?? false);

    // Mode B: 사연 후원 가능 상태 검증
    if (mode === DonationMode.B_DIRECT_SUPPORT) {
      const story = getStoryById(parsed.storyId!);
      if (!story) return NextResponse.json({ message: "사연을 찾을 수 없습니다." }, { status: 404 });
      assertStoryFundable(story);
    }

    // Mode A: 기부금영수증 발급은 본인확인(CI/DI)이 선행되어야 함 (단계적 신원확인 게이트 ⓒ)
    const wantReceipt = mode === DonationMode.A_TAX_DEDUCTIBLE && (parsed.requestReceipt ?? false);
    if (wantReceipt && !parsed.identityVerified) {
      return NextResponse.json(
        { message: "기부금영수증 발급을 위해 본인확인이 필요합니다." },
        { status: 401 }
      );
    }

    const fee = calcFee(parsed.amount, mode, parsed.coversFee);
    const pg = getPaymentAdapter();
    const result = await pg.charge({
      amount: fee.charge,
      method: parsed.method,
      type: parsed.paymentType,
      orderName: mode === DonationMode.B_DIRECT_SUPPORT ? "사연 지정 후원" : "공익 펀드 기부",
      issueBillingKey: parsed.paymentType === "SUBSCRIPTION",
    });

    if (!result.ok || result.status !== "PAID") {
      return NextResponse.json({ message: "결제 승인에 실패했습니다." }, { status: 402 });
    }

    // TODO(DB): donation insert + audit_log + (정기면) subscription insert.
    // 자금은 PG 에스크로/공익법인 계좌 경유 — 플랫폼 운영사 계좌 미보관.
    const donationId = `don_${Date.now()}`;

    // Mode A 영수증: FEATURE_TAX_RECEIPT 활성이면 즉시 발행, 아니면 발급 신청만 접수.
    let receiptId: string | null = null;
    let receiptStatus: "issued" | "requested" | null = null;
    if (wantReceipt) {
      receiptId = `rcpt_${Date.now()}`;
      receiptStatus = FEATURES.TAX_RECEIPT ? "issued" : "requested";
      // TODO(DB): receipt insert(foundation_id, amount) + (TAX_RECEIPT 면) 국세청 연동 보고.
    }

    return NextResponse.json({
      donationId,
      paymentKey: result.paymentKey,
      breakdown: fee,
      receiptUrl: result.receiptUrl,
      receiptId,
      receiptStatus,
    });
  } catch (e) {
    if (e instanceof RuleViolation) {
      return NextResponse.json({ message: e.message, code: e.code }, { status: 422 });
    }
    return NextResponse.json({ message: "처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
