-- ============================================================
-- MY SISTA — Supabase / PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ─── PROFILES (extends Supabase auth.users) ───────────────────────────────────
create table if not exists public.profiles (
  id                      uuid references auth.users on delete cascade primary key,
  display_name            text,
  avatar_url              text,
  age_range               text check (age_range in ('25-30','31-35','36-40','41-45')),
  wellness_goals          text[],   -- e.g. ['weight_management','stress','hormonal_health']
  content_preferences     text[],   -- e.g. ['nutrition','fitness','mental_health']
  subscription_tier       text not null default 'free'
                            check (subscription_tier in ('free','sista','sista_plus','sista_pro')),
  subscription_expires_at timestamptz,
  happy_splurge_account_id text,
  sista_credits           integer not null default 0,
  check_in_streak         integer not null default 0,
  last_check_in           date,
  onboarding_complete     boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create a profile row on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Service role can manage all profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');


-- ─── ARTICLES ─────────────────────────────────────────────────────────────────
create table if not exists public.articles (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text unique not null,
  summary           text,
  body              text,          -- markdown
  category          text check (category in (
                      'nutrition','fitness','mental_health','hormonal',
                      'relationships','beauty','spirituality','finance'
                    )),
  tags              text[],
  cover_image_url   text,
  read_time_minutes integer,
  is_premium        boolean not null default false,
  is_published      boolean not null default false,
  author_name       text,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.handle_updated_at();

-- Indexes for common query patterns
create index if not exists articles_category_idx       on public.articles (category) where is_published = true;
create index if not exists articles_published_at_idx   on public.articles (published_at desc) where is_published = true;
create index if not exists articles_is_premium_idx     on public.articles (is_premium) where is_published = true;
create index if not exists articles_slug_idx           on public.articles (slug);

-- RLS — published articles are public; full access requires auth
alter table public.articles enable row level security;

create policy "Published articles are publicly readable"
  on public.articles for select
  using (is_published = true);

create policy "Admins can manage articles"
  on public.articles for all
  using (auth.jwt() ->> 'role' = 'admin' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ─── BOOKMARKS ────────────────────────────────────────────────────────────────
create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles on delete cascade not null,
  article_id  uuid references public.articles on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique(user_id, article_id)
);

create index if not exists bookmarks_user_idx on public.bookmarks (user_id);

alter table public.bookmarks enable row level security;

create policy "Users can manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id);


-- ─── DAILY CHECK-INS ──────────────────────────────────────────────────────────
create table if not exists public.check_ins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles on delete cascade not null,
  date       date not null,
  mood       integer not null check (mood between 1 and 5),
  energy     integer not null check (energy between 1 and 5),
  sleep      integer not null check (sleep between 1 and 5),
  note       text,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

create index if not exists check_ins_user_date_idx on public.check_ins (user_id, date desc);

alter table public.check_ins enable row level security;

create policy "Users can manage own check-ins"
  on public.check_ins for all
  using (auth.uid() = user_id);


-- ─── HAPPY SPLURGE PRODUCTS ───────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  price_zar   numeric(10, 2),
  image_url   text,
  product_url text,
  category    text,
  tags        text[],
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

alter table public.products enable row level security;

create policy "Active products are publicly readable"
  on public.products for select
  using (is_active = true);

create policy "Admins can manage products"
  on public.products for all
  using (auth.jwt() ->> 'role' = 'admin' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ─── ARTICLE ↔ PRODUCT LINKS ─────────────────────────────────────────────────
create table if not exists public.article_products (
  article_id  uuid references public.articles on delete cascade not null,
  product_id  uuid references public.products on delete cascade not null,
  sort_order  integer not null default 0,
  primary key (article_id, product_id)
);

alter table public.article_products enable row level security;

create policy "Article products are publicly readable"
  on public.article_products for select
  using (true);

create policy "Admins can manage article products"
  on public.article_products for all
  using (auth.jwt() ->> 'role' = 'admin' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ─── SUBSCRIPTION EVENTS LOG ──────────────────────────────────────────────────
create table if not exists public.subscription_events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.profiles on delete set null,
  event_type        text not null check (event_type in (
                      'subscribed','upgraded','downgraded','cancelled','renewed','expired'
                    )),
  tier              text,
  amount_zar        numeric(10, 2),
  billing_cycle     text check (billing_cycle in ('monthly','annual')),
  payment_reference text,
  yoco_checkout_id  text,
  created_at        timestamptz not null default now()
);

create index if not exists sub_events_user_idx on public.subscription_events (user_id, created_at desc);

alter table public.subscription_events enable row level security;

create policy "Users can view own subscription events"
  on public.subscription_events for select
  using (auth.uid() = user_id);

create policy "Service role can manage subscription events"
  on public.subscription_events for all
  using (auth.role() = 'service_role');


-- ─── STORAGE BUCKETS ──────────────────────────────────────────────────────────
-- Run separately in Supabase Storage settings or via CLI:
--
-- insert into storage.buckets (id, name, public)
--   values ('article-covers', 'article-covers', true);
-- insert into storage.buckets (id, name, public)
--   values ('avatars', 'avatars', true);
--
-- Storage RLS policies: allow authenticated users to upload to avatars/,
-- allow service role to upload to article-covers/.
