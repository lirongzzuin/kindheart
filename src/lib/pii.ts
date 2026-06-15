/**
 * 콘텐츠 안전 스캐너 — 후원 플랫폼 악용 방지 + 개인정보 노출 차단.
 *
 * 위험 시나리오:
 *  - 게시판에 "○○은행 123-456 계좌로 직접 보내주세요" → 플랫폼 우회 사기 모금.
 *  - 전화번호/카톡ID 노출 → 사적 접촉·피싱·doxxing.
 *  - 주민번호 등 민감정보 게시 → 개인정보 유출.
 *  - 외부 URL 유도 → 피싱/스캠 링크.
 *
 * 정책: 자동 차단(block) 또는 마스킹(mask). 서버·클라이언트 공용(순수 함수, PII 비저장).
 */

export type ScanSeverity = "block" | "warn";

export interface ScanFinding {
  kind:
    | "account_number" // 계좌번호
    | "phone" // 전화번호
    | "rrn" // 주민등록번호
    | "external_payment" // 외부 송금/계좌 유도 문구
    | "url" // 외부 링크
    | "messenger_id" // 카톡/텔레그램 ID 유도
    | "profanity"; // 욕설/비속어
  severity: ScanSeverity;
  message: string;
}

export interface ScanResult {
  ok: boolean; // block 항목 없으면 true
  findings: ScanFinding[];
  masked: string; // 마스킹 적용된 안전 텍스트
}

// ── 패턴 ──
const RE_RRN = /\b\d{6}[-\s]?[1-4]\d{6}\b/g; // 주민번호
const RE_PHONE = /\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/g; // 휴대폰
const RE_ACCOUNT = /\b\d{2,6}[-\s]\d{2,6}[-\s]\d{2,7}(?:[-\s]\d{1,7})?\b/g; // 계좌형 숫자열
const RE_URL = /\b(?:https?:\/\/|www\.)[^\s]+/gi;
const RE_PAYMENT_WORDS =
  /(계좌|입금|송금|이체|보내\s?주세요|보내주시면|직거래|현금|카톡으?로?\s?연락|텔레그램|개인\s?후원\s?계좌)/g;
const RE_MESSENGER = /(카카오톡|카톡|오픈채팅|텔레그램|텔레|라인)\s*(아이디|ID|:|＠|@)?\s*[\w.-]*/gi;
const PROFANITY = ["씨발", "시발", "개새끼", "병신", "좆", "지랄", "썅"]; // 최소 시드 — 운영 시 외부 사전

function mask(len: number): string {
  return "■".repeat(Math.max(3, Math.min(len, 8)));
}

/**
 * 텍스트를 스캔해 위험 요소를 찾고, 마스킹된 안전본을 반환.
 * @param strict true 면 외부송금 유도·URL·메신저ID도 block (게시판 본문 기본값).
 */
export function scanContent(text: string, strict = true): ScanResult {
  const findings: ScanFinding[] = [];
  let masked = text;

  if (RE_RRN.test(text)) {
    findings.push({ kind: "rrn", severity: "block", message: "주민등록번호로 보이는 정보는 입력할 수 없습니다." });
  }
  masked = masked.replace(RE_RRN, (m) => mask(m.length));

  if (RE_ACCOUNT.test(text)) {
    findings.push({
      kind: "account_number",
      severity: "block",
      message: "계좌번호는 게시할 수 없습니다. 플랫폼 밖 직접 송금은 사기 위험이 큽니다.",
    });
  }
  masked = masked.replace(RE_ACCOUNT, (m) => mask(m.length));

  if (RE_PHONE.test(text)) {
    findings.push({
      kind: "phone",
      severity: strict ? "block" : "warn",
      message: "전화번호는 공개 게시할 수 없습니다(개인정보 보호).",
    });
  }
  masked = masked.replace(RE_PHONE, (m) => mask(m.length));

  if (RE_PAYMENT_WORDS.test(text)) {
    findings.push({
      kind: "external_payment",
      severity: strict ? "block" : "warn",
      message: "플랫폼 밖 직접 송금/계좌 유도는 금지됩니다. 모든 후원은 검증된 결제로만 가능합니다.",
    });
  }

  if (RE_MESSENGER.test(text)) {
    findings.push({
      kind: "messenger_id",
      severity: strict ? "block" : "warn",
      message: "메신저 아이디로 사적 접촉을 유도할 수 없습니다.",
    });
  }
  masked = masked.replace(RE_MESSENGER, (m) => m.replace(/[\w.-]+$/, (id) => (id ? mask(id.length) : id)));

  if (RE_URL.test(text)) {
    findings.push({ kind: "url", severity: strict ? "block" : "warn", message: "외부 링크는 게시할 수 없습니다." });
  }
  masked = masked.replace(RE_URL, "[링크 차단됨]");

  const lower = text.toLowerCase();
  if (PROFANITY.some((w) => lower.includes(w))) {
    findings.push({ kind: "profanity", severity: "warn", message: "부적절한 표현이 포함되어 있습니다." });
    for (const w of PROFANITY) masked = masked.split(w).join(mask(w.length));
  }

  // 정규식 lastIndex 리셋 (g 플래그 재사용 안전)
  [RE_RRN, RE_PHONE, RE_ACCOUNT, RE_URL, RE_PAYMENT_WORDS, RE_MESSENGER].forEach((r) => (r.lastIndex = 0));

  const ok = !findings.some((f) => f.severity === "block");
  return { ok, findings, masked };
}

/** 게시판 등에 표시할 때 PII 한 번 더 마스킹(방어적 출력). */
export function sanitizeForDisplay(text: string): string {
  return scanContent(text, false).masked;
}
