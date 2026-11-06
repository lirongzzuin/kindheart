# KindHeart — 투명 후원 플랫폼 (프로토타입)

검증된 사연에 후원하고, 후원금이 회차별로 어떻게 쓰였는지 증빙과 함께 공개하는 후원 중개 플랫폼입니다.
사기 차단·개인정보 보호·디지털 취약계층 접근성을 처음부터 코드 규칙으로 강제하도록 설계했습니다.

![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_·_Auth_·_RLS-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-validation-3E67B1)

> **상태: 프로토타입.** 화면 흐름, 도메인 규칙, DB 스키마(RLS·트리거), 본인확인(NICE) 서버 처리까지 구현했습니다.
> 결제(토스페이먼츠)·증빙 검증은 mock 어댑터이고, 후원·사연·커뮤니티 등 대부분의 API 는 DB 저장이 `TODO(DB)` 로 남아 있습니다.
> 실제 후원금을 받는 서비스로 운영되지는 않았습니다.

---

## 무엇을 해결하나

기존 개인 후원·모금에서 반복되는 문제를 구조로 막는 것이 목표였습니다.

| 문제 | 이 프로젝트의 접근 |
|---|---|
| 후원금이 실제로 어디에 쓰였는지 알 수 없다 | 분할 지급 계획 + 회차별 사용 증빙 공개(`/stories/[id]/transparency`) |
| 받고 사라지는 "먹튀"·가짜 사연 | 직전 회차 증빙이 확인되기 전에는 다음 회차 집행 불가, FDS 위험 점수로 자동 보류 |
| 세액공제 오인 분쟁 | 세액공제형 기부(Mode A)와 특정인 지정 후원(Mode B)을 DB·런타임 양쪽에서 배타적으로 분리 |
| 개인정보 유출·플랫폼 밖 직접 송금 유도 | 주민번호 미수집, CI/DI 는 해시만 저장, 게시글의 계좌·연락처·외부 링크 자동 차단 |
| 디지털 취약계층의 이용 장벽 | 글씨 크기 4단계·고대비·"쉬운 말" 설명, 기관 대리 신청과 전화 신청·해지 경로 |

## 아키텍처

```
브라우저 (Next.js App Router, PWA)
   │  공개 페이지: 정적 / ISR(사연 300s, 커뮤니티 60s) → CDN 캐시
   ▼
Next.js Route Handlers (src/app/api/*)
   │  zod 입력 검증 → 레이트리밋 → 도메인 규칙(src/lib/rules.ts) → 어댑터 호출
   ├── src/lib/adapters/
   │     payment.ts       결제(토스페이먼츠) — 현재 mock
   │     identity.ts      본인확인 — mock / NICE 실연동 전환
   │     nice.ts          NICE 체크플러스 표준창 암·복호화
   │     verification.ts  증빙 OCR·진위·표절 검사 — mock
   ├── src/lib/crypto.ts  AES-256-GCM(PII) · HMAC-SHA256(CI/DI) — server-only
   ├── src/lib/pii.ts     게시글 PII·사기 문구 스캔/마스킹
   └── src/lib/fds.ts     이상거래 위험 점수
   ▼
Supabase (Postgres + Auth)
   RLS 정책 · Mode XOR CHECK 제약 · 불변 audit_log 트리거 · 신고 누적 자동 숨김 트리거
```

외부 연동은 모두 어댑터 인터페이스 뒤에 있고 `FEATURE_REAL_*` 플래그로 mock ↔ 실연동을 전환합니다.
환경변수가 하나도 없어도 mock 어댑터와 mock 데이터로 전체 화면 흐름이 동작합니다.

## 기술적으로 집중한 문제

### 1. 법적으로 섞이면 안 되는 두 후원 방식을 코드로 분리
- **문제**: 세액공제가 되는 기부(공익법인 펀드)와 특정인 지정 후원은 법적 성격이 달라, 한 후원이 두 성격을 동시에 가지거나 지정 후원에 영수증이 발급되면 분쟁이 됩니다.
- **해결**: `src/lib/rules.ts` 의 `assertDonationTarget`·`assertNoTaxBenefit`·`assertModeBConsent` 로 런타임에서 막고,
  DB 에도 `donation_mode_target_xor` CHECK 제약(`supabase/migrations/001_initial.sql`)을 걸어 이중으로 강제했습니다.
  Mode B 결제 직전에는 "세액공제 불가" 동의가 없으면 API 가 거부합니다. Mode A 화면은 `FEATURE_MODE_A` 플래그 뒤에 있습니다.

### 2. 본인확인 결과(CI)를 평문으로 남기지 않는 1인 1계정
- **문제**: 다중 계정·자전 후원을 막으려면 동일인 식별이 필요하지만, CI 원문 보관은 유출 시 피해가 큽니다.
- **해결**: NICE 표준창 결과(`enc_data`)를 서버에서 복호화한 뒤 CI/DI 는 **HMAC-SHA256 단방향 해시**로, 이름은 **AES-256-GCM**(`v1:` 버전 프리픽스로 키 교체 대비)으로만 저장합니다.
  다른 계정이 같은 `ci_hash` 를 이미 가지고 있으면 인증을 거부하고, 결과는 `audit_log` 에 기록합니다(`src/app/api/identity/callback/route.ts`).
  표준창 호출에 쓰는 key/iv 는 암호화된 쿠키로만 왕복하며, `crypto.ts` 는 `server-only` 로 클라이언트 번들 유입을 막았습니다.
- 본인확인은 사연 등록·수령 계좌·영수증 발급에서만 요구하고, 후원·둘러보기는 로그인만으로 가능하게 해 진입 장벽을 낮췄습니다.

### 3. 지급 게이트와 위변조 불가 감사 로그
- 직전 회차 사용 증빙이 검증되지 않으면 다음 회차 집행을 거부합니다(`assertDisbursementGate`).
- 수령 계좌 명의는 본인확인 명의와 일치해야 합니다(`assertAccountHolderMatch`).
- `audit_log` 는 UPDATE/DELETE 시 예외를 던지는 트리거로 불변으로 만들었습니다.
- FDS(`src/lib/fds.ts`)는 신호별 가중치를 합산해 임계값(60)을 넘으면 자동 보류 후보로 표시하고, 후원자 CI 해시와 수혜자 CI 해시가 같으면 자전 후원으로 탐지합니다.

### 4. 커뮤니티 악용 차단
- 게시글·댓글 등록 시 계좌번호, 송금 유도 문구, 전화번호·메신저 ID, 주민번호, 외부 URL 을 서버에서 스캔해 차단 또는 마스킹합니다(`src/lib/pii.ts`).
- 신고가 3건 쌓이면 DB 트리거(`auto_hide_on_reports`)가 글을 자동으로 숨깁니다.
- 결제·사연 등록·글·댓글에 IP 단위 레이트리밋을 두었고, Upstash Redis 가 없으면 인메모리로 폴백합니다(`src/lib/ratelimit.ts`).

### 5. 상시 서버 없이 운영비를 트래픽에 비례하게
- 별도 백엔드 서버 없이 Next.js Route Handler + Supabase 로 구성하고, 공개 읽기 페이지는 정적/ISR 로 CDN 에서 응답하게 했습니다.
- 서버리스 환경의 DB 커넥션 폭증을 피하려고 Supavisor 풀러 사용을 전제로 했습니다(`.env.example`).
- 설계 판단은 [`DECISIONS.md`](./DECISIONS.md), [`SCALING_AND_COST.md`](./SCALING_AND_COST.md), [`SECURITY.md`](./SECURITY.md) 에 정리했습니다.

## 화면

| 경로 | 설명 |
|---|---|
| `/`, `/browse` | 홈 / 사연 둘러보기 (카테고리 필터) |
| `/stories/[id]`, `/stories/[id]/transparency` | 사연 상세(분할 지급 계획) / 회차별 집행·증빙 타임라인 |
| `/donate/[storyId]` → `/pay` → `/complete` | 후원 방식 선택, 수수료 고지, 결제(mock) |
| `/donate/fund/*` | 세액공제형 펀드 기부 (Mode A, 플래그) |
| `/apply`, `/apply/write`, `/apply/agency` | 사연 신청 — 직접 / 기관 대리 / 전화 |
| `/community` | 닉네임 기반 커뮤니티 (PII 스캔, 신고) |
| `/me/giving`, `/me/subscriptions`, `/me/receipts` | 내 후원 / 정기후원 해지 / 영수증 |
| `/admin` | 운영자: 사연 심사 · 지급 승인 · 신고 처리 |

## 품질 확인

- 자동화된 테스트 코드는 없습니다.
- `npm run typecheck`, `npm run lint`, `npm run build` 로 타입·린트·빌드를 확인합니다.

## 실행 방법

```bash
npm install
cp .env.example .env.local   # 비워 두면 mock 어댑터·mock 데이터로 동작
npm run dev                  # http://localhost:3000

npm run typecheck
npm run lint
npm run build
```

운영자 화면과 Mode A 화면까지 보려면 `NEXT_PUBLIC_FEATURE_MODE_A=1 npm run dev`.

## 설정

| 구분 | 환경변수 | 비고 |
|---|---|---|
| DB·인증 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | 스키마: `supabase/migrations/001~003` 순서대로 실행 |
| 암호화 | `ENCRYPTION_KEY`(32바이트 base64), `HASH_KEY`(선택) | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| 레이트리밋 | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | 선택 — 없으면 인메모리 |
| 기능 플래그 | `NEXT_PUBLIC_FEATURE_MODE_A`, `FEATURE_REAL_PAYMENT`, `FEATURE_REAL_IDENTITY` 등 | 기본값은 모두 off |
| 본인확인 | `NICE_CLIENT_ID`, `NICE_CLIENT_SECRET`, `NICE_PRODUCT_ID` | 연동 절차: [`IDENTITY_SETUP.md`](./IDENTITY_SETUP.md) |
| 기타 | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_KAKAO_JS_KEY`, `CRON_SECRET` | |

전체 목록과 설명은 [`.env.example`](./.env.example) 에 있습니다. 메일 발송 설정은 [`SMTP_SETUP.md`](./SMTP_SETUP.md), 운영 절차는 [`OPERATIONS.md`](./OPERATIONS.md) 를 참고하세요.

## 개발 방식

Claude Code 와 함께 설계·구현했습니다. 설계 결정과 사람이 확인해야 할 항목은 [`DECISIONS.md`](./DECISIONS.md) 에 기록했습니다.
