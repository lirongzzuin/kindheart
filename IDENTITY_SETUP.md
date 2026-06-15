# 본인확인(NICE) 연동 가이드

> 한국 본인확인은 본인확인기관과의 계약이 필요합니다. 이 프로젝트는 **NICE 디지털 본인확인(체크플러스 표준창)**
> 방식으로 어댑터·시작/콜백 라우트·팝업 플로우를 구현해 두었습니다. 키를 넣고 테스트베드로 검증하면 동작합니다.

## 구현 구조 (이미 완료)
- `src/lib/adapters/nice.ts` — 토큰 발급 → 암호화 토큰 → AES-128-CBC 암호화 + HMAC 무결성 → 결과 복호화
- `src/app/api/identity/start` — 표준창 자동제출 HTML 반환 + key/iv 암호화 쿠키 저장(팝업에서 호출)
- `src/app/api/identity/callback` — NICE 결과(enc_data) 복호화 → CI/DI 해시·이름 암호화 저장(TODO DB) → 팝업 postMessage
- `src/lib/identity-client.ts` — `verifyIdentity(gate)`: 실연동 시 NICE 팝업, 미연동 시 mock. 회원가입/사연등록/영수증이 공통 사용.

## 당신이 할 일 (순서)

### 1. NICE 본인확인 서비스 신청
1. https://www.niceid.co.kr 또는 NICE평가정보 영업 문의 → **디지털 본인확인(체크플러스)** 서비스 계약.
2. 사업자등록증 필요(개인사업자 가능). 심사 후 이용 승인.
3. 승인되면 **client_id, client_secret, product_id(서비스ID)** 발급.

### 2. 환경변수 설정 (Vercel / `.env.local`)
```
NEXT_PUBLIC_FEATURE_REAL_IDENTITY=1
FEATURE_REAL_IDENTITY=1
NICE_CLIENT_ID=발급받은_클라이언트ID
NICE_CLIENT_SECRET=발급받은_시크릿
NICE_PRODUCT_ID=발급받은_상품ID
NICE_RETURN_URL=https://배포주소/api/identity/callback   # 선택(미설정 시 자동)
ENCRYPTION_KEY=...   # 콜백 쿠키 암호화에 필요(이미 사용 중)
```

### 3. NICE 콘솔에 콜백/도메인 등록
- 결과 수신(returnUrl): `https://배포주소/api/identity/callback`
- 서비스 도메인 등록.

### 4. 테스트베드 검증
- NICE 테스트용 키로 표준창이 뜨고, 콜백에서 CI/DI/이름이 정상 복호화되는지 확인.
- 결과 필드명/엔드포인트는 NICE가 제공하는 최신 연동 매뉴얼과 대조(버전에 따라 상이할 수 있음).

### 5. 운영 전환
- 운영 키로 교체 → `NEXT_PUBLIC_FEATURE_REAL_IDENTITY=1` 유지 → 끝.
- 비활성(`=false`)이면 자동으로 mock(데모) 본인확인으로 폴백됩니다.

## 동작 방식 (사용자 관점)
회원가입/사연등록/영수증 발급에서 "인증하기" → **NICE 표준창 팝업** → 휴대폰/카드 본인확인 →
팝업이 결과를 부모창에 전달하고 닫힘 → 다음 단계 자동 진행. (미연동 시엔 즉시 통과하는 데모)

> ⚠️ CI는 평문 저장 금지 — 해시(HMAC)만, 이름·계좌는 AES-256-GCM 암호화(`src/lib/crypto.ts`). 이미 적용됨.
> 대안 공급자(토스 본인인증, KCB, 드림시큐리티 등)도 동일 어댑터 패턴으로 교체 가능합니다.
