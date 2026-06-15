-- 이메일/비밀번호 + 소셜 로그인 공통 — 가입 시 app_user 프로필 자동 생성.
-- Supabase Auth(auth.users)가 계정을 만들고, 우리 프로필 테이블(app_user)은 트리거로 동기화.

-- 가입 경로 구분(선택): 'email' | 'kakao' | 'google' | 'apple' ...
alter table app_user add column if not exists auth_method text;

-- auth.users 에 새 계정이 생기면 app_user 자동 생성.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into app_user (id, email, display_name, auth_method, linked_providers)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      nullif(split_part(coalesce(new.email,''), '@', 1), ''),
      '회원'
    ),
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    case
      when new.raw_app_meta_data->>'provider' is not null
        then array[new.raw_app_meta_data->>'provider']
      else array['email']
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 본인인증(이메일 가입 시) 결과는 app_user.ci_hash / di_hash / name_enc / identity_verified 에
-- 서버 사이드에서 채운다(서비스 롤). RLS 로 본인만 조회.
