-- Supabase 대시보드 > SQL Editor 에서 이 파일 내용을 실행하세요.
-- 로그인 없이 사용하는 버전입니다. 기존(로그인 버전) 테이블에 다시 실행해도 됩니다.

create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text,
  group_name  text,
  memo        text,
  favorite    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 기존 로그인 버전에서 넘어오는 경우: 사용자별 정책과 user_id 컬럼 제거
drop policy if exists "select own contacts" on public.contacts;
drop policy if exists "insert own contacts" on public.contacts;
drop policy if exists "update own contacts" on public.contacts;
drop policy if exists "delete own contacts" on public.contacts;
alter table public.contacts drop column if exists user_id;

-- 수정 시 updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- Row Level Security: 로그인 없이 누구나 조회·추가·수정·삭제 가능
-- (주의: 앱 주소를 아는 사람은 모두 연락처를 보고 바꿀 수 있습니다)
alter table public.contacts enable row level security;

drop policy if exists "public access" on public.contacts;
create policy "public access" on public.contacts
  for all to anon, authenticated using (true) with check (true);
