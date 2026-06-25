-- ============================================================
-- Migration 019: Batch 5 Tables
-- My Sista — Happy Splurge (Pty) Ltd
-- Commander: Royalle
-- Purpose: Safety signals, trusted contacts, coach sessions,
--          coach config, businesses, business subscriptions,
--          ghost profiles, audit log
-- ============================================================

-- ─── SAFETY SIGNALS ───────────────────────────────────────────────────────────
create table if not exists public.safety_signals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles on delete cascade not null,
  latitude     numeric(10, 7),
  longitude    numeric(10, 7),
  address      text,
  note         text,
  resolved     boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists safety_signals_user_idx on public.safety_signals (user_id, created_at desc);
alter table public.safety_signals enable row level security;
create policy "Users manage own safety signals"
  on public.safety_signals for all using (auth.uid() = user_id);
create policy "Admins read all safety signals"
  on public.safety_signals for select
  using ((auth.jwt() ->> 'role' = 'admin') or (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'));

-- ─── TRUSTED CONTACTS ─────────────────────────────────────────────────────────
create table if not exists public.trusted_contacts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles on delete cascade not null,
  name         text not null,
  phone        text,
  email        text,
  relationship text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists trusted_contacts_user_idx on public.trusted_contacts (user_id);
alter table public.trusted_contacts enable row level security;
create policy "Users manage own trusted contacts"
  on public.trusted_contacts for all using (auth.uid() = user_id);

-- ─── COACH SESSIONS ───────────────────────────────────────────────────────────
create table if not exists public.coach_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles on delete cascade not null,
  context_tag  text,          -- e.g. 'second_spring', 'general', 'nutrition'
  messages     jsonb not null default '[]'::jsonb,  -- [{role, content, timestamp}]
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists coach_sessions_user_idx on public.coach_sessions (user_id, updated_at desc);
alter table public.coach_sessions enable row level security;
create policy "Users manage own coach sessions"
  on public.coach_sessions for all using (auth.uid() = user_id);

-- ─── COACH CONFIG (admin-write only) ──────────────────────────────────────────
create table if not exists public.coach_config (
  id                uuid primary key default gen_random_uuid(),
  config_key        text unique not null,  -- e.g. 'system_prompt', 'tone', 'restricted_topics'
  config_value      text,
  description       text,
  updated_by        uuid references public.profiles(id),
  updated_at        timestamptz not null default now()
);
alter table public.coach_config enable row level security;
create policy "Admins manage coach config"
  on public.coach_config for all
  using ((auth.jwt() ->> 'role' = 'admin') or (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'));
create policy "Authenticated users read coach config"
  on public.coach_config for select using (auth.role() = 'authenticated');

-- Seed default config rows
insert into public.coach_config (config_key, config_value, description)
values
  ('system_prompt', 'You are Coach Amara — a warm, knowledgeable, and inclusive wellness coach for My Sista. You serve women aged 25-55 across all cycle stages, including perimenopause and menopause (called Second Spring). Speak with warmth, empathy, and cultural sensitivity. Never diagnose. Always encourage professional consultation for medical concerns. Keep responses under 200 words unless the user asks for detail.', 'Coach Amara base system prompt'),
  ('tone', 'warm, inclusive, empowering, evidence-based', 'Tone descriptor injected into every session'),
  ('restricted_topics', 'illegal activities, specific medication dosages, self-harm, graphic violence', 'Comma-separated list of restricted topics')
on conflict (config_key) do nothing;

-- ─── BUSINESSES ───────────────────────────────────────────────────────────────
create table if not exists public.businesses (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid references public.profiles on delete cascade not null,
  business_name       text not null,
  business_type       text,
  industry            text,
  website_url         text,
  logo_url            text,
  subscription_tier   text not null default 'starter'
                        check (subscription_tier in ('starter', 'growth', 'premium')),
  subscription_expires_at timestamptz,
  is_verified         boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists businesses_owner_idx on public.businesses (owner_id);
alter table public.businesses enable row level security;
create policy "Business owners manage own business"
  on public.businesses for all using (auth.uid() = owner_id);
create policy "Admins manage all businesses"
  on public.businesses for all
  using ((auth.jwt() ->> 'role' = 'admin') or (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'));

-- ─── BUSINESS SUBSCRIPTIONS ───────────────────────────────────────────────────
create table if not exists public.business_subscriptions (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid references public.businesses on delete cascade not null,
  tier              text not null,
  billing_cycle     text check (billing_cycle in ('monthly', 'annual')),
  amount_zar        numeric(10, 2),
  payment_reference text,
  yoco_checkout_id  text,
  status            text not null default 'active'
                      check (status in ('active', 'cancelled', 'expired', 'pending')),
  starts_at         timestamptz not null default now(),
  expires_at        timestamptz,
  created_at        timestamptz not null default now()
);
create index if not exists biz_sub_business_idx on public.business_subscriptions (business_id, created_at desc);
alter table public.business_subscriptions enable row level security;
create policy "Business owners view own subscriptions"
  on public.business_subscriptions for select
  using (
    auth.uid() = (select owner_id from public.businesses where id = business_id)
  );
create policy "Admins manage all business subscriptions"
  on public.business_subscriptions for all
  using ((auth.jwt() ->> 'role' = 'admin') or (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'));

-- ─── BUSINESS ANALYTICS VIEW ──────────────────────────────────────────────────
create or replace view public.business_analytics as
  select
    b.id                  as business_id,
    b.owner_id,
    b.business_name,
    b.subscription_tier,
    b.is_verified,
    count(distinct bs.id) as total_subscriptions,
    max(bs.created_at)    as last_subscription_at,
    b.created_at          as joined_at
  from public.businesses b
  left join public.business_subscriptions bs on bs.business_id = b.id
  group by b.id, b.owner_id, b.business_name, b.subscription_tier, b.is_verified, b.created_at;

-- RLS on view: owners see only their own row
-- Views inherit RLS from underlying tables automatically.

-- ─── GHOST PROFILES ───────────────────────────────────────────────────────────
create table if not exists public.ghost_profiles (
  id              uuid primary key default gen_random_uuid(),
  original_user_id uuid,            -- NULL if user was fully deleted
  anonymised_data jsonb,            -- retained metadata stripped of PII
  reason          text,             -- 'account_deleted', 'banned', 'suspended'
  admin_notes     text,
  created_at      timestamptz not null default now()
);
alter table public.ghost_profiles enable row level security;
create policy "Admins manage ghost profiles"
  on public.ghost_profiles for all
  using ((auth.jwt() ->> 'role' = 'admin') or (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'));

-- ─── AUDIT LOG ────────────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.profiles(id),
  action        text not null,      -- e.g. 'ban_user', 'verify_user', 'view_ghost_profile'
  target_type   text,               -- e.g. 'profile', 'ghost_profile', 'coach_config'
  target_id     text,               -- stringified UUID of target record
  metadata      jsonb,              -- additional context (old_value, new_value, etc.)
  created_at    timestamptz not null default now()
);
create index if not exists audit_log_admin_idx on public.audit_log (admin_user_id, created_at desc);
create index if not exists audit_log_action_idx on public.audit_log (action, created_at desc);
alter table public.audit_log enable row level security;
create policy "Admins read and write audit log"
  on public.audit_log for all
  using ((auth.jwt() ->> 'role' = 'admin') or (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'));

-- ─── AUTO-UPDATE TRIGGERS ─────────────────────────────────────────────────────
create trigger trusted_contacts_updated_at
  before update on public.trusted_contacts
  for each row execute function public.handle_updated_at();

create trigger coach_sessions_updated_at
  before update on public.coach_sessions
  for each row execute function public.handle_updated_at();

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function public.handle_updated_at();
