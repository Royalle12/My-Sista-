-- ============================================================
-- Migration 020: Creator Profiles, Affiliate Links,
--                Wellness Plans & User Plan Tracking
-- My Sista — Happy Splurge (Pty) Ltd
-- Commander: Royalle
-- Purpose: Create four tables required by the Batch 5 screens:
--   - Discover.jsx / CreatorPage.jsx / CreateYourPage.jsx  → creator_profiles
--   - AffiliateDashboard.jsx                               → affiliate_links
--   - WellnessPlans.jsx                                    → wellness_plans
--   - ActivePlan.jsx                                       → user_wellness_plans
-- ============================================================

-- ─── HELPER FUNCTION ──────────────────────────────────────────────────────────
-- Auto-update updated_at field when rows are modified
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── CREATOR PROFILES ─────────────────────────────────────────────────────────
-- Stores public practitioner / wellness expert pages.
-- Seeded with 3 mock creators matching the hardcoded MOCK_CREATORS arrays in
-- Discover.jsx and CreatorPage.jsx so live data is shown immediately.
create table if not exists public.creator_profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade,
  name             text not null,
  page_name        text unique not null,           -- slug used in /c/:page_name route
  category         text not null,                  -- e.g. 'Hormonal Health', 'Doula & Birth'
  specialty        text,                           -- short professional title
  bio              text,
  location         text,
  image_url        text,
  certifications   text[],                         -- array of credential strings
  verified         boolean not null default false,
  rating           numeric(3, 1) default 5.0,      -- 0.0 – 5.0
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists creator_profiles_page_name_idx
  on public.creator_profiles (page_name);
create index if not exists creator_profiles_verified_idx
  on public.creator_profiles (verified) where verified = true;
create index if not exists creator_profiles_category_idx
  on public.creator_profiles (category);

create trigger creator_profiles_updated_at
  before update on public.creator_profiles
  for each row execute function public.handle_updated_at();

alter table public.creator_profiles enable row level security;

-- All users can browse verified creator pages
create policy "Verified creators are publicly readable"
  on public.creator_profiles for select
  using (verified = true);

-- Authenticated users can also see their own unverified profile
create policy "Creator can view own profile"
  on public.creator_profiles for select
  using (auth.uid() = user_id);

-- Creators can insert their own profile
create policy "Creator can create own profile"
  on public.creator_profiles for insert
  with check (auth.uid() = user_id);

-- Creators can update their own profile
create policy "Creator can update own profile"
  on public.creator_profiles for update
  using (auth.uid() = user_id);

-- Admins can manage all creator profiles
create policy "Admins manage all creator profiles"
  on public.creator_profiles for all
  using (
    (auth.jwt() ->> 'role' = 'admin') or
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );

-- ─── SEED: Mock Creator Profiles ──────────────────────────────────────────────
-- These rows match the MOCK_CREATORS constants in Discover.jsx / CreatorPage.jsx
-- so live authenticated users see real data immediately without manual data entry.
insert into public.creator_profiles
  (name, page_name, category, specialty, bio, location, image_url, certifications, verified, rating)
values
  (
    'Dr. Amara Somal',
    'dr-amara',
    'Hormonal Health',
    'Endocrinology & Perimenopause Specialist',
    'Dedicated to helping sisters navigate their hormonal journeys and the Second Spring phase with grace, scientific evidence, and natural alignment. Over 15 years of clinical practice in women endocrinology.',
    'Cape Town, WC',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuATHaePK1_3UErBcvgZsTzLyCBywZc9MH_x2nKa6vy8ie8sBSu3mfWFgKVJn-B7Q8xPdi-MecJOzvvkVTFvbOeWdxthnh4zDFpadLmvEcIwcTIF-6nXl0nf6hkvAmxEcJ__FdhzcA2-w19U0l1-1lTRAAa3XYbSGczlV9q_DpBtMdbTcEXSLs5_pUZaKzpI_uasnfGq7x7_Qap7l9MZjan3ELuOqzEQAaQ5rCYPB8BiTD9mkczt9V498LUn2KIaZIiK_4yHP9H22LQ',
    ARRAY['MBChB (UCT)', 'FCP(SA) Endocrinology', 'Member of North American Menopause Society (NAMS)'],
    true,
    4.9
  ),
  (
    'Doula Zola Ncube',
    'doula-zola',
    'Doula & Birth',
    'Holistic Birth Doula & Lactation Consultant',
    'Providing warm physical, emotional, and informational support to mothers before, during, and shortly after childbirth in the indigenous Zulu tradition. Believer in collective care and traditional womb healing.',
    'Johannesburg, GP',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAKElaPjUVKx2P99LiCyzkkcqlYZ8JCAYdXiV20LQpEOe_joGfpZHo8YZejZBQW--CRIBbYCsKoVGlhra7zSRpNgspgG9pWByLgoP9BekPNbrActzbLMNZyWpJSZnrvKuWc3jOdVAC6x1Jknm_oEFYg9dR3aHykphU3J8bndoDCQOwInD50CBxlQSOtSenX_17RnXDnL2rwbXwaNbuVS9n7kvA7gx_ukI3IstmQjPlmQbVy5OgBiCPVfurKeIQRCiMePl9pEkktHtc',
    ARRAY['DONA Certified Birth Doula', 'Certified Womb Healing Practitioner', 'IBCLC Lactation Consultant'],
    true,
    4.8
  ),
  (
    'Lerato Malebo',
    'lerato-nutrition',
    'Nutrition & Diet',
    'Clinical Nutritionist & Cycle Sync Expert',
    'Helping women realign their energy and mood through tailored, nutrient-dense local South African comfort ingredients. Focus on anti-inflammatory gut health and hormone syncing.',
    'Durban, KZN',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCevMV_xx0Ogcy3mcJWghVUH6EOC3RTPI_AkRkJFEOddHF5exq0eD77Li0fVAFjAFdpCzv9QiY6ppDeXgRsIDdTsEJmd3aHRmR6g5s54YWwFag5FqSonXPkpJ3-armFHb6hN9oi__5JPU0tYSFRkk8Nz37syQuDWKb9UlVFcUNRq_6-AAYpE-E0qqoOlgf4eOVh8IudaAoxFX4jQMWGh2zEv5htFeNa38NUR7YEWh1sosXIf8t8tiTX8me7MSnZmSUOHMfk3BXlGIM',
    ARRAY['BSc Dietetics (UKZN)', 'Functional Nutrition Certification', 'Cycle Syncing Specialist Course'],
    true,
    4.7
  )
on conflict (page_name) do nothing;


-- ─── AFFILIATE LINKS / REFERRAL TRACKING ──────────────────────────────────────
-- Stores referral invitations sent by Sista members. Each row represents one
-- referral event. AffiliateDashboard.jsx queries this table filtered by user_id.
create table if not exists public.affiliate_links (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  referred_email text,          -- anonymised display, e.g. 'thandi***@gmail.com'
  status        text not null default 'pending'
                  check (status in ('pending', 'Pending', 'Completed', 'Expired')),
  reward        integer not null default 0,   -- Sista Credits awarded on completion
  date          date not null default current_date,
  created_at    timestamptz not null default now()
);

create index if not exists affiliate_links_user_idx
  on public.affiliate_links (user_id, created_at desc);

alter table public.affiliate_links enable row level security;

-- Users can only see their own referral history
create policy "Users view own affiliate links"
  on public.affiliate_links for select
  using (auth.uid() = user_id);

-- Users can create their own referral entries
create policy "Users insert own affiliate links"
  on public.affiliate_links for insert
  with check (auth.uid() = user_id);

-- Service role / admins manage all affiliate records
create policy "Admins manage all affiliate links"
  on public.affiliate_links for all
  using (
    (auth.jwt() ->> 'role' = 'admin') or
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') or
    auth.role() = 'service_role'
  );


-- ─── WELLNESS PLANS (plan catalogue) ─────────────────────────────────────────
-- Central catalogue of curated wellness pathways. WellnessPlans.jsx fetches
-- the full list; ActivePlan.jsx reads a single plan's task definitions.
create table if not exists public.wellness_plans (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  category        text not null
                    check (category in (
                      'Cycle Syncing', 'Second Spring',
                      'Mindfulness', 'Nutrition', 'Fitness'
                    )),
  difficulty      text not null default 'Medium'
                    check (difficulty in ('Beginner', 'Easy', 'Medium', 'Advanced')),
  duration_days   integer not null default 7,
  tasks_per_day   integer not null default 2,
  tasks           jsonb not null default '[]'::jsonb,
  -- Each task element: { id, title, desc }
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists wellness_plans_category_idx
  on public.wellness_plans (category) where is_published = true;

create trigger wellness_plans_updated_at
  before update on public.wellness_plans
  for each row execute function public.handle_updated_at();

alter table public.wellness_plans enable row level security;

-- Published plans are publicly readable
create policy "Published wellness plans are publicly readable"
  on public.wellness_plans for select
  using (is_published = true);

-- Admins manage the catalogue
create policy "Admins manage wellness plans"
  on public.wellness_plans for all
  using (
    (auth.jwt() ->> 'role' = 'admin') or
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );

-- ─── SEED: Wellness Plans ─────────────────────────────────────────────────────
-- Mirror the MOCK_PLANS arrays in WellnessPlans.jsx and ActivePlan.jsx so
-- authenticated users see real data immediately.
insert into public.wellness_plans
  (title, description, category, difficulty, duration_days, tasks_per_day, tasks)
values
  (
    '7-Day Cycle Realignment',
    'Sync your diet, exercise, and productivity with the four distinct phases of your monthly rhythm.',
    'Cycle Syncing',
    'Easy',
    7,
    3,
    '[
      {"id":"t1","title":"Seed Rotation Morning Infusion","desc":"Mix 1 tbsp flaxseeds with raw honey and warm hot water. Grounding support for estrogen pathways."},
      {"id":"t2","title":"15-Minute Dynamic Flow Yoga","desc":"Gentle core stretching focused on blood flow to the pelvic region. Clear cortisol buildup."},
      {"id":"t3","title":"Write down 3 gratitude points","desc":"Settle down before sleep. Reflect on your daily wins in your notebook."}
    ]'::jsonb
  ),
  (
    'Second Spring Comfort',
    'Grounding rituals and dietary adjustments designed to ease perimenopause hot flashes and mood fluctuations.',
    'Second Spring',
    'Medium',
    14,
    2,
    '[
      {"id":"t4","title":"Cooling Sage Infusion","desc":"Brew loose sage leaves for 5 minutes. Best taken iced in the afternoon."},
      {"id":"t5","title":"Vagus Nerve Reset Exercise","desc":"Deep breathing with prolonged exhalation to relax your nervous system."}
    ]'::jsonb
  ),
  (
    'Mindful Breathing Sanctuary',
    'Ancestral breathing techniques and silent reflections to calm cortisol and realign inner peace.',
    'Mindfulness',
    'Beginner',
    5,
    1,
    '[
      {"id":"t6","title":"4-7-8 Breathing Ritual","desc":"Inhale for 4 counts, hold for 7, exhale slowly for 8. Repeat 4 cycles at sunrise."},
      {"id":"t7","title":"5-Minute Stillness Journaling","desc":"Write one thing you are grateful for and one intention you carry into your day."}
    ]'::jsonb
  )
on conflict do nothing;


-- ─── USER WELLNESS PLANS (progress tracking) ──────────────────────────────────
-- Tracks which tasks each user has completed on a given wellness plan.
-- ActivePlan.jsx upserts rows here using onConflict: 'user_id,plan_id'.
create table if not exists public.user_wellness_plans (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade not null,
  plan_id          uuid references public.wellness_plans(id) on delete cascade not null,
  completed_tasks  text[] not null default '{}',   -- array of task id strings
  started_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, plan_id)                         -- enforces upsert conflict target
);

create index if not exists user_wellness_plans_user_idx
  on public.user_wellness_plans (user_id);

create trigger user_wellness_plans_updated_at
  before update on public.user_wellness_plans
  for each row execute function public.handle_updated_at();

alter table public.user_wellness_plans enable row level security;

-- Users can only see and manage their own plan progress
create policy "Users manage own wellness plan progress"
  on public.user_wellness_plans for all
  using (auth.uid() = user_id);

-- Admins can read all user progress for analytics
create policy "Admins read all user wellness plans"
  on public.user_wellness_plans for select
  using (
    (auth.jwt() ->> 'role' = 'admin') or
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );
