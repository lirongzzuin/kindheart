# 커스텀 SMTP 연결 가이드 (Supabase Auth 메일)

> Supabase 기본 메일은 시간당 발송량이 매우 적어(개발용) 운영에 부적합합니다.
> 가입 확인·비밀번호 재설정 메일을 안정적으로 보내려면 커스텀 SMTP를 연결합니다.
> 두 가지 추천: **Resend**(가장 쉬움) / **Amazon SES**(대량·저렴).

---

## 옵션 A. Resend (권장 — 가장 간단)

### 1. Resend 가입 & 도메인 인증
1. https://resend.com 가입.
2. **Domains → Add Domain** → 보낼 도메인 입력(예: `kindheart.co.kr` 또는 `mail.kindheart.co.kr`).
3. Resend가 보여주는 **DNS 레코드(SPF·DKIM, 보통 TXT·CNAME 3개)** 를 도메인 DNS에 등록.
   - 가비아/후이즈/Cloudflare 등 도메인 관리 콘솔 → DNS → 해당 TXT/CNAME 추가.
4. Resend에서 **Verified** 표시될 때까지 대기(보통 수분~수십분).
5. **API Keys → Create API Key** → 키 복사(한 번만 보임).

### 2. Resend SMTP 정보
| 항목 | 값 |
|------|-----|
| Host | `smtp.resend.com` |
| Port | `465` (SSL) 또는 `587` (TLS) |
| Username | `resend` |
| Password | 발급받은 **API Key** |
| Sender | `noreply@당신도메인` (인증한 도메인) |

### 3. Supabase에 연결
Supabase 대시보드 → **Project Settings → Authentication → SMTP Settings** → **Enable Custom SMTP**:
- Sender email: `noreply@당신도메인`
- Sender name: `KindHeart`
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: `(Resend API Key)`
- **Save**

### 4. 발송 테스트
Authentication → Users → 테스트 계정으로 회원가입 → 확인 메일 수신 확인.
Authentication → Email Templates 에서 메일 문구(한국어)로 수정 권장.

---

## 옵션 B. Amazon SES (대량 발송·저비용)

### 1. SES 설정
1. AWS 콘솔 → **SES** → 리전 선택(서울 `ap-northeast-2` 권장).
2. **Verified identities → Create identity → Domain** → 도메인 입력 → 표시되는 **DKIM CNAME 3개**를 DNS에 등록.
3. (선택) **Custom MAIL FROM** 설정으로 SPF 정렬 강화.
4. **Production access 요청**: 기본은 샌드박스(인증된 주소로만 발송) → "Request production access"로 일반 발송 허용 받기(승인 수시간~1일).

### 2. SMTP 자격증명 발급
1. SES → **SMTP settings → Create SMTP credentials** → IAM 사용자 생성 → **SMTP Username/Password** 다운로드(한 번만).
2. SMTP 엔드포인트 확인: `email-smtp.ap-northeast-2.amazonaws.com`

### 3. Supabase에 연결
Authentication → SMTP Settings → Enable Custom SMTP:
- Host: `email-smtp.ap-northeast-2.amazonaws.com`
- Port: `465`(SSL) 또는 `587`(STARTTLS)
- Username: `(SES SMTP Username)`
- Password: `(SES SMTP Password)`
- Sender email: 인증한 도메인의 주소
- **Save**

---

## 공통 체크리스트
- [ ] 도메인 DNS에 SPF·DKIM 등록 완료(미등록 시 스팸 처리됨)
- [ ] Sender 주소가 인증한 도메인과 일치
- [ ] Supabase Authentication → URL Configuration 의 **Site URL / Redirect URLs** 에 배포 주소 등록
- [ ] Email Templates 한국어화(가입 확인/비밀번호 재설정)
- [ ] 첫 발송 후 스팸함 확인, 도착률 점검

> 참고: 본인인증(PASS/NICE)을 가입 단계에 쓰면 "이메일 확인"을 꺼도 신원은 보장됩니다.
> 다만 비밀번호 재설정 메일을 위해 SMTP는 어차피 연결해두는 것을 권장합니다.
