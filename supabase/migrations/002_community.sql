-- 커뮤니티(후원자 라운지) + 콘텐츠 신고/모더레이션.
-- 원칙: 닉네임만 저장·노출. 실명/이메일/CI 등 PII 는 app_user(암호화) 외 어디에도 두지 않는다.
-- 본문은 PII 스캔·마스킹 통과본만 저장.

create type community_category as enum ('thanks','story_share','question','free');
create type content_status     as enum ('visible','hidden','under_review');

create table community_post (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references app_user(id) on delete cascade,
  author_nickname text not null,         -- 닉네임만(비식별)
  category community_category not null default 'free',
  title text not null check (char_length(title) between 2 and 100),
  body text not null check (char_length(body) between 2 and 2000),
  status content_status not null default 'visible',
  like_count int not null default 0,
  comment_count int not null default 0,
  verified_donor boolean not null default false,  -- 실제 후원 이력 보유자 배지
  report_count int not null default 0,
  created_at timestamptz not null default now()
);
create index community_post_status_idx on community_post(status, created_at desc);

create table community_comment (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_post(id) on delete cascade,
  author_id uuid not null references app_user(id) on delete cascade,
  author_nickname text not null,
  body text not null check (char_length(body) between 1 and 1000),
  status content_status not null default 'visible',
  report_count int not null default 0,
  created_at timestamptz not null default now()
);
create index community_comment_post_idx on community_comment(post_id, created_at);

create table content_report (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,             -- 'post' | 'comment'
  target_id uuid not null,
  reporter_id uuid references app_user(id),
  reason text not null,
  created_at timestamptz not null default now()
);

-- 신고 누적 임계(3건) 시 자동 숨김 → 운영자 검토.
create or replace function auto_hide_on_reports() returns trigger as $$
begin
  if new.target_type = 'post' then
    update community_post
      set report_count = report_count + 1,
          status = case when report_count + 1 >= 3 then 'under_review'::content_status else status end
      where id = new.target_id;
  elsif new.target_type = 'comment' then
    update community_comment
      set report_count = report_count + 1,
          status = case when report_count + 1 >= 3 then 'under_review'::content_status else status end
      where id = new.target_id;
  end if;
  return new;
end; $$ language plpgsql;
create trigger trg_auto_hide after insert on content_report
  for each row execute function auto_hide_on_reports();

-- RLS
alter table community_post enable row level security;
alter table community_comment enable row level security;
alter table content_report enable row level security;

-- 공개글만 열람, 작성자는 본인 것 전부
create policy post_read on community_post for select
  using (status = 'visible' or author_id = auth.uid());
create policy post_insert on community_post for insert
  with check (author_id = auth.uid());
create policy post_update_own on community_post for update using (author_id = auth.uid());

create policy comment_read on community_comment for select
  using (status = 'visible' or author_id = auth.uid());
create policy comment_insert on community_comment for insert
  with check (author_id = auth.uid());

create policy report_insert on content_report for insert with check (true);

-- ── PII 컬럼 보강(app_user): 이름 암호화 컬럼 (001 의 ci_hash/di_hash 와 함께) ──
alter table app_user add column if not exists name_enc text;     -- AES-256-GCM 암호문
alter table app_user add column if not exists di_hash text;      -- 중복식별정보 해시
-- 닉네임은 PII 아님(공개용). 실명/연락처는 평문 컬럼을 두지 않는다.
