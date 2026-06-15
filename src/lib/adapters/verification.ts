/**
 * 증빙 검증 파이프라인 어댑터 — OCR / 기관 진위확인 / 메타데이터·위변조 / 표절 검사.
 * 모두 mock. 실제는 발급기관 전자진위확인 API + OCR 공급자로 교체.
 */

import { EvidenceKind } from "../types";

// ───────── OCR (사연 등록 타이핑 최소화) ─────────
export interface OcrResult {
  ok: boolean;
  fields: Record<string, string>;
  rawText: string;
}

export interface OcrAdapter {
  readonly name: string;
  extract(file: { name: string; type: string }): Promise<OcrResult>;
}

class MockOcrAdapter implements OcrAdapter {
  readonly name = "mock-ocr";
  async extract(): Promise<OcrResult> {
    return {
      ok: true,
      fields: { name: "홍길동", location: "○○시 ○○구", docType: "진단서" },
      rawText: "환자명 홍길동 ... 진단명 ...",
    };
  }
}

// ───────── 증빙 진위/위변조/표절 검증 ─────────
export interface EvidenceCheck {
  /** 발급기관 전자진위확인 결과 */
  authenticityVerified: boolean;
  /** PDF 생성도구/수정이력/폰트 불일치 등 위변조 플래그 */
  tampered: boolean;
  tamperReasons: string[];
  /** 기존 사연/웹 텍스트 표절 유사도 (0~1) */
  plagiarismScore: number;
}

export interface VerificationAdapter {
  readonly name: string;
  checkEvidence(input: { kind: EvidenceKind; storagePath: string | null }): Promise<EvidenceCheck>;
  checkPlagiarism(text: string): Promise<{ score: number; matchedSource: string | null }>;
}

class MockVerificationAdapter implements VerificationAdapter {
  readonly name = "mock-verify";

  async checkEvidence(): Promise<EvidenceCheck> {
    return { authenticityVerified: true, tampered: false, tamperReasons: [], plagiarismScore: 0.04 };
  }

  async checkPlagiarism(): Promise<{ score: number; matchedSource: string | null }> {
    return { score: 0.04, matchedSource: null };
  }
}

export function getOcrAdapter(): OcrAdapter {
  return new MockOcrAdapter();
}
export function getVerificationAdapter(): VerificationAdapter {
  return new MockVerificationAdapter();
}
