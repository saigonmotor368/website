-- Additive migration: back up the production project before applying.
create extension if not exists pgcrypto;

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('owner','staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  service text not null check (service in ('sang-ten','thu-hoi','dang-ky','khac')),
  vehicle_type text not null check (vehicle_type in ('oto','xe-may','khac')),
  processing_location text not null,
  message text not null default '',
  source_path text not null default '/',
  referrer text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  utm_content text not null default '',
  utm_term text not null default '',
  gclid text not null default '',
  consent_at timestamptz not null,
  ip_hash text,
  status text not null default 'new' check (status in ('new','contacted','qualified','file_received','completed','lost')),
  assigned_to uuid references auth.users(id) on delete set null,
  contacted_at timestamptz,
  qualified_at timestamptz,
  file_received_at timestamptz,
  completed_at timestamptz,
  lost_reason text,
  email_status text not null default 'pending' check (email_status in ('pending','sent','failed')),
  email_last_attempt_at timestamptz
);

create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_phone_idx on public.leads(phone);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_service_idx on public.leads(service);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  event_name text not null check (event_name in ('lead_created','contacted','qualified','file_received','completed','lost')),
  actor_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists lead_events_lead_idx on public.lead_events(lead_id,occurred_at desc);

alter table if exists public.quotes add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table if exists public.quotes add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table if exists public.quotes add column if not exists updated_at timestamptz not null default now();

alter table public.staff_profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
alter table if exists public.quotes enable row level security;

drop policy if exists "Staff can read own profile" on public.staff_profiles;
create policy "Staff can read own profile" on public.staff_profiles for select to authenticated using (user_id = auth.uid() and is_active = true);

drop policy if exists "Active staff can read leads" on public.leads;
create policy "Active staff can read leads" on public.leads for select to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
drop policy if exists "Active staff can update leads" on public.leads;
create policy "Active staff can update leads" on public.leads for update to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true)) with check (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
drop policy if exists "Active staff can read lead events" on public.lead_events;
create policy "Active staff can read lead events" on public.lead_events for select to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));

drop policy if exists "Active staff can read quotes" on public.quotes;
create policy "Active staff can read quotes" on public.quotes for select to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
drop policy if exists "Active staff can insert quotes" on public.quotes;
create policy "Active staff can insert quotes" on public.quotes for insert to authenticated with check (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
drop policy if exists "Active staff can update quotes" on public.quotes;
create policy "Active staff can update quotes" on public.quotes for update to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
drop policy if exists "Owner can delete quotes" on public.quotes;
create policy "Owner can delete quotes" on public.quotes for delete to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true and s.role='owner'));

-- After creating the two Supabase Auth users, add their UUIDs manually:
-- insert into public.staff_profiles(user_id,full_name,role) values
-- ('OWNER_AUTH_UUID','Lương Thế Bằng','owner'),
-- ('STAFF_AUTH_UUID','Nhân viên hồ sơ','staff');
