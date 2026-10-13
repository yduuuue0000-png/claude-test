-- Supabase 대시보드 > SQL Editor 에서 이 파일 내용을 실행하세요.

create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null,
  phone       text not null,
  email       text,
  group_name  text,
  memo        text,
  favorite    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists contacts_user_id_idx on public.contacts(user_id);

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

-- Row Level Security: 로그인한 사용자는 자기 연락처만 볼 수 있음
alter table public.contacts enable row level security;

drop policy if exists "select own contacts" on public.contacts;
create policy "select own contacts" on public.contacts
  for select using (auth.uid() = user_id);

drop policy if exists "insert own contacts" on public.contacts;
create policy "insert own contacts" on public.contacts
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own contacts" on public.contacts;
create policy "update own contacts" on public.contacts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own contacts" on public.contacts;
create policy "delete own contacts" on public.contacts
  for delete using (auth.uid() = user_id);
