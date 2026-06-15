-- KindHeart 초기 스키마 — CLAUDE.md §5 도메인 모델.
-- 핵심: Mode A(기부/세액공제, Fund 대상) ↔ Mode B(지정후원, Story 대상) 절대 분리.
-- 민감정보는 앱 레벨 KMS 암호화 후 저장(CI/DI/빌링키는 해시·참조만).

create extension if not exists pgcrypto;

-- ───────────────────────── enum ─────────────────────────
create type user_role         as enum ('donor','beneficiary','agency','reviewer','admin');
create type story_status       as enum ('DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','FUNDING','FUNDED','DISBURSING','COMPLETED','REJECTED','SUSPENDED');
create type story_channel      as enum ('self','agency','offline');
create type story_category     as enum ('medical','emergency','independence','living','education','housing');
create type donation_mode      as enum ('A','B');         -- A=세액공제 기부, B=지정 후원
create type payment_type       as enum ('ONE_TIME','SUBSCRIPTION');
create type payment_method     as enum ('kakaopay','naverpay','tosspay','card','transfer');
create type donation_status    as enum ('PENDING','PAID','FAILED','CANCELED','REFUNDED');
create type subscription_status as enum ('ACTIVE','PAUSED','CANCELED','FAILED');
create type disbursement_status as enum ('PENDING','HELD','PAID','BLOCKED');
create type evidence_kind      as enum ('medical','public','income','identity','other');
create type evidence_result    as enum ('verified','flagged','pending','rejected');
create type verification_grade as enum ('new','basic','trusted');
create type legal_entity_type  as enum ('operator','foundation');

-- ───────────────────────── 법인 ─────────────────────────
create table legal_entity (
  id uuid primary key default gen_random_uuid(),
  type legal_entity_type not null,
  name text not null,
  registration_no text,
  created_at timestamptz not null default now()
);

-- ───────────────────────── 사용자 ─────────────────────────
create table app_user (
  id uuid primary key default gen_random_uuid(),  -- auth.users.id 와 1:1
  role user_role not null default 'donor',
  display_name text not null,
  email text,
  linked_providers text[] not null default '{}',
  identity_verified boolean not null default false,
  ci_hash text,                 -- 연계정보(CI) 해시. 평문 CI 미보관. 1인1계정 식별키
  di_hash text,
  verified_at timestamptz,
  -- 접근성 선호
  acc_font_scale numeric not null default 1,
  acc_high_contrast boolean not null default false,
  acc_screen_reader boolean not null default false,
  acc_simple_mode boolean not null default false,
  preferred_channel text not null default 'alimtalk',
  last_payment_method payment_method,
  created_at timestamptz not null default now()
);
create unique index app_user_ci_unique on app_user (ci_hash) where ci_hash is not null;

-- ───────────────────────── 기관 ─────────────────────────
create table agency (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  verified boolean not null default false,  -- 기관 자격확인 완료
  contact_user_id uuid references app_user(id),
  created_at timestamptz not null default now()
);

-- ───────────────────────── 펀드 (Mode A 전용) ─────────────────────────
create table fund (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  category story_category not null,
  foundation_id uuid not null references legal_entity(id),
  total_raised bigint not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ───────────────────────── 사연 ─────────────────────────
create table story (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references app_user(id),
  channel story_channel not null,
  agency_id uuid references agency(id),
  category story_category not null,
  title text not null,
  summary text not null,            -- 후원자 공개용 (비식별)
  body_easy_read text not null,
  image_url text,
  status story_status not null default 'DRAFT',
  goal_amount bigint not null check (goal_amount > 0),
  raised_amount bigint not null default 0,
  verification_grade verification_grade not null default 'new',
  risk_score int not null default 0,
  payout_account_verified boolean not null default false,
  payout_holder_name_enc text,      -- 수령계좌 명의(암호화). 본인인증 명의와 일치 강제
  created_at timestamptz not null default now(),
  funded_at timestamptz
);
create index story_status_idx on story(status);
create index story_category_idx on story(category);

create table disbursement_plan (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references story(id) on delete cascade,
  round int not null,
  amount bigint not null,
  scheduled_date date not null,
  purpose text not null,
  unique (story_id, round)
);

-- ───────────────────────── 증빙 ─────────────────────────
create table evidence (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references story(id) on delete cascade,
  kind evidence_kind not null,
  verify_method text not null,
  result evidence_result not null default 'pending',
  tampered boolean not null default false,
  public_summary text not null,     -- 후원자 비식별 요약
  storage_path text,                -- 원본: 심사자 전용
  created_at timestamptz not null default now()
);

-- ───────────────────────── 후원/기부 ─────────────────────────
create table subscription (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references app_user(id),
  mode donation_mode not null,
  amount bigint not null check (amount > 0),
  method payment_method not null,
  billing_key_ref text not null,    -- 빌링키 참조(평문 미보관)
  status subscription_status not null default 'ACTIVE',
  next_charge_date date not null,
  fund_id uuid references fund(id),
  story_id uuid references story(id),
  created_at timestamptz not null default now(),
  -- 절대원칙 #1: Mode A→fund, Mode B→story (배타)
  constraint mode_target_xor check (
    (mode = 'A' and fund_id is not null and story_id is null) or
    (mode = 'B' and story_id is not null and fund_id is null)
  )
);

create table donation (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references app_user(id),
  mode donation_mode not null,
  payment_type payment_type not null,
  method payment_method not null,
  amount bigint not null check (amount > 0),
  covers_fee boolean not null default false,
  fee_amount bigint not null default 0,
  pg_fee_amount bigint not null default 0,
  net_to_beneficiary bigint not null default 0,
  status donation_status not null default 'PENDING',
  fund_id uuid references fund(id),
  story_id uuid references story(id),
  tax_receipt_id uuid,
  subscription_id uuid references subscription(id),
  payment_key text,
  created_at timestamptz not null default now(),
  -- 절대원칙 #1 + #2: Mode A는 fund+영수증 가능/Mode B는 story·영수증 금지
  constraint donation_mode_target_xor check (
    (mode = 'A' and fund_id is not null and story_id is null) or
    (mode = 'B' and story_id is not null and fund_id is null and tax_receipt_id is null)
  )
);
create index donation_donor_idx on donation(donor_id);
create index donation_story_idx on donation(story_id);

-- ───────────────────────── 지급 + 사용증빙 ─────────────────────────
create table usage_report (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references story(id) on delete cascade,
  disbursement_round int not null,
  category text not null,           -- 비식별 카테고리
  amount_used bigint not null,
  verified boolean not null default false,
  public_note text not null default '',
  created_at timestamptz not null default now()
);

create table disbursement (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references story(id) on delete cascade,
  round int not null,
  amount bigint not null,
  scheduled_date date not null,
  status disbursement_status not null default 'PENDING',
  usage_report_id uuid references usage_report(id),  -- 직전 회차 증빙 게이트
  paid_at timestamptz,
  unique (story_id, round)
);

-- ───────────────────────── 영수증 (Mode A, Phase 2) ─────────────────────────
create table receipt (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references donation(id),
  foundation_id uuid not null references legal_entity(id),
  amount bigint not null,
  issued_at timestamptz not null default now(),
  nts_reported boolean not null default false
);

-- ───────────────────────── FDS / 제보 / 감사 ─────────────────────────
create table fraud_signal (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  subject_id uuid not null,
  weight int not null,
  detail text,
  created_at timestamptz not null default now()
);

create table report (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references story(id),
  reporter_id uuid references app_user(id),
  reason text not null,
  created_at timestamptz not null default now()
);

-- 불변 감사 로그: 모든 자금이동/상태변경/민감조회
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);
-- update/delete 금지 트리거(불변성)
create or replace function prevent_audit_mutation() returns trigger as $$
begin
  raise exception 'audit_log 는 불변입니다';
end; $$ language plpgsql;
create trigger audit_no_update before update or delete on audit_log
  for each row execute function prevent_audit_mutation();

-- ───────────────────────── RLS ─────────────────────────
alter table app_user enable row level security;
alter table story enable row level security;
alter table evidence enable row level security;
alter table donation enable row level security;
alter table subscription enable row level security;
alter table usage_report enable row level security;
alter table disbursement enable row level security;

-- 본인 레코드만 조회
create policy app_user_self on app_user for select using (id = auth.uid());
create policy app_user_self_upd on app_user for update using (id = auth.uid());

-- 사연: 공개 가능 상태는 누구나 열람, 작성자는 본인 것 전부
create policy story_public_read on story for select
  using (status in ('FUNDING','FUNDED','DISBURSING','COMPLETED') or author_id = auth.uid());

-- 증빙: 원본은 일반 후원자 비공개. 심사자/관리자만. (public_summary 노출은 뷰로 분리 권장)
create policy evidence_reviewer_only on evidence for select
  using (exists (select 1 from app_user u where u.id = auth.uid() and u.role in ('reviewer','admin')));

-- 후원 내역: 본인 것만
create policy donation_self on donation for select using (donor_id = auth.uid());
create policy subscription_self on subscription for select using (donor_id = auth.uid());
create policy subscription_self_upd on subscription for update using (donor_id = auth.uid());

-- 사용증빙/지급: 공개 상태 사연이면 비식별 열람 허용
create policy usage_report_public on usage_report for select
  using (exists (select 1 from story s where s.id = story_id
                 and s.status in ('FUNDING','FUNDED','DISBURSING','COMPLETED')));
create policy disbursement_public on disbursement for select
  using (exists (select 1 from story s where s.id = story_id
                 and s.status in ('FUNDING','FUNDED','DISBURSING','COMPLETED')));
