# KindHeart — 투명 후원·기부 플랫폼

검증된 사연에 후원자가 **(A) 세액공제형 기부** 또는 **(B) 특정인 지정 후원**을 선택해 후원하고,
후원금 사용 내역을 투명하게 열람하며, 사기를 다층 차단하고, 디지털 취약계층도 동등하게 이용하는 플랫폼.

> Phase 1: **Mode B(지정 후원)** 활성, **Mode A(세액공제 기부)** 는 `FEATURE_MODE_A` 플래그 뒤.

## 기술 스택 (비용 최소화)

- **Next.js 14 (App Router) + TypeScript** 풀스택 — 별도 백엔드 서버 없음
- **Tailwind CSS** — Material 3 teal/orange 디자인 토큰, Atkinson Hyperlegible 폰트(`next/font`)
- **Supabase** (Postgres + Auth + Storage) — 무료 티어, 사용량 기반 과금
- **PWA** — 모바일/데스크탑 설치형
- Vercel 서버리스 배포 가정 → **초기비용 ≈ 0, 트래픽만큼만 과금**

## 실행

```bash
cp .env.example .env.local   # 값 채우기 (없어도 mock 으로 동작)
npm install
npm run dev                  # http://localhost:3000
npm run build                # 프로덕션 빌드 (통과 ✅)
npm run typecheck            # 타입 체크 (통과 ✅)
npm run lint                 # 린트 (0 errors ✅)
```

환경변수(Supabase/PG/본인확인)가 없으면 **mock 어댑터 + mock 데이터**로 전체 플로우가 동작한다.

## 화면

| 경로 | 설명 |
|------|------|
| `/` , `/browse` | 홈 / 사연 둘러보기 (카테고리 필터) |
| `/login` | 소셜 로그인 (카카오·네이버·구글·애플) + 단계적 신원확인 안내 |
| `/stories/[id]` | 사연 상세 (분할 지급 계획, 증빙 "검증됨" 표시) |
| `/stories/[id]/transparency` | 투명 집행 내역 (회차별 타임라인 + 사용 증빙) |
| `/stories/[id]/report` | 이상 사항 제보 |
| `/donate/[storyId]` | 후원 방식 선택 (Mode A/B 시각 분리) |
| `/donate/[storyId]/pay` | 후원 결제 (간편결제 다중 노출, 수수료 투명 고지, Mode B 세액공제 미동의) |
| `/apply` , `/apply/write` , `/apply/agency` | 사연 신청 3채널 (직접·기관대리·전화) + 단계별 작성 |
| `/me/giving` , `/me/subscriptions` | 내 후원 / 정기후원 관리 (원클릭·전화 해지) |

## 핵심 규칙 (코드로 강제 — `src/lib/rules.ts`)

1. Mode A=Fund / Mode B=Story **배타** (DB CHECK + 런타임 assert)
2. Mode B 에 세액공제/영수증 노출·발급 금지, 결제 직전 "세액공제 불가" 필수 동의
3. 수령 계좌 명의 = 본인인증 명의 일치 강제
4. 직전 회차 사용증빙 확인 전 다음 회차 집행 금지
5. 단계적 신원확인 — 후원/둘러보기는 본인확인 불필요, 사연등록·수령계좌·영수증에서만 요구

## 수익 구조

후원자가 운영비를 함께 부담(기본 ON)하면 사연자 100% 수령, 끄면 후원금에서 5% 공제 후 투명 고지.
PG 실비 별도 표기. Mode A 는 공익법인 자금 보관·분배, 운영사는 용역대가로 수익. 상세는 [`DECISIONS.md`](./DECISIONS.md).

## 접근성 (KWCAG 2.1 AA — 법적 의무)

글씨 크기 4단계 / 고대비 토글(localStorage 영속), 시맨틱 HTML·ARIA, 키보드 포커스, 48px 터치 타겟,
"쉬운 말" 설명, 모든 디지털 경로에 **전화 후원·신청·해지** 비디지털 대체수단 상시 노출.

## 외부 연동 (어댑터 패턴, 초기 mock)

`src/lib/adapters/` — payment(토스페이먼츠), identity(PASS CI/DI), verification(OCR·진위·표절).
`FEATURE_REAL_*` 플래그로 실연동 전환.

## 다음 단계

`DECISIONS.md` 의 "사람 확인 필요" 항목 + `TODO(DB)` 주석(실제 INSERT/audit_log) + 세무사·변호사 검토.
