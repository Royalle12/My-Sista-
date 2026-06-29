-- ============================================================
-- MIGRATION: 001_initial_schema.sql
-- ============================================================

-- Users (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  avatar_url text,
  birth_year int,
  cycle_length int default 28,
  period_length int default 5,
  loyalty_points int default 0,
  created_at timestamptz default now()
);

-- Cycle tracking
create table cycle_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  period_start date,
  period_end date,
  flow_level text,  -- light / medium / heavy
  symptoms text[],
  mood text,
  notes text,
  created_at timestamptz default now()
);

-- Symptoms library
create table symptoms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,  -- hormonal / digestive / mood / skin / etc
  description text,
  phase text,  -- follicular / ovulation / luteal / menstrual
  food_recommendations text[],
  severity_scale int default 3
);

-- AI chat sessions
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text,
  created_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id),
  role text check (role in ('user', 'assistant')),
  content text,
  created_at timestamptz default now()
);

-- Marketplace products
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents int,
  image_url text,
  category text,
  in_stock boolean default true,
  loyalty_points_reward int default 0
);

-- Row Level Security
alter table profiles enable row level security;
alter table cycle_logs enable row level security;
alter table symptoms enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table products enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Cycle logs: users can CRUD their own
create policy "Users can view own cycle logs"
  on cycle_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own cycle logs"
  on cycle_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cycle logs"
  on cycle_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own cycle logs"
  on cycle_logs for delete
  using (auth.uid() = user_id);

-- Symptoms: public read
create policy "Anyone can view symptoms"
  on symptoms for select
  to authenticated
  using (true);

-- Chat sessions: users can CRUD their own
create policy "Users can view own chat sessions"
  on chat_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat sessions"
  on chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own chat sessions"
  on chat_sessions for delete
  using (auth.uid() = user_id);

-- Chat messages: users can view/insert their own session messages
create policy "Users can view own chat messages"
  on chat_messages for select
  using (
    exists (
      select 1 from chat_sessions
      where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert own chat messages"
  on chat_messages for insert
  with check (
    exists (
      select 1 from chat_sessions
      where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
    )
  );

-- Products: public read
create policy "Anyone can view products"
  on products for select
  to authenticated
  using (true);

-- ============================================================
-- MIGRATION: 002_seed_symptoms.sql
-- ============================================================

-- Seed common symptoms
insert into symptoms (name, category, description, phase, food_recommendations, severity_scale) values
('Bloating', 'digestive', 'Abdominal swelling and discomfort often related to fluid retention', 'luteal', '{"Bananas", "Ginger tea", "Fennel seeds", "Cucumber"}', 3),
('Cramps', 'hormonal', 'Menstrual cramps caused by uterine contractions', 'menstrual', '{"Dark chocolate", "Ginger", "Turmeric milk", "Leafy greens"}', 4),
('Fatigue', 'hormonal', 'Feeling of tiredness and low energy levels', 'luteal', '{"Oats", "Sweet potatoes", "Spinach", "Eggs"}', 3),
('Mood swings', 'mood', 'Emotional fluctuations and irritability', 'luteal', '{"Dark chocolate", "Avocado", "Salmon", "Berries"}', 3),
('Headache', 'hormonal', 'Tension headaches or migraines related to hormone changes', 'menstrual', '{"Ginger", "Magnesium-rich foods", "Watermelon", "Leafy greens"}', 3),
('Acne', 'skin', 'Hormonal breakouts often along jawline and chin', 'luteal', '{"Zinc-rich foods", "Green tea", "Berries", "Leafy greens"}', 2),
('Breast tenderness', 'hormonal', 'Soreness and swelling in breast tissue', 'luteal', '{"Flaxseeds", "Vitamin E foods", "Leafy greens", "Nuts"}', 3),
('Insomnia', 'mood', 'Difficulty falling or staying asleep', 'menstrual', '{"Bananas", "Warm milk", "Almonds", "Oatmeal"}', 3),
('Nausea', 'digestive', 'Feeling of sickness or queasiness', 'menstrual', '{"Ginger", "Peppermint tea", "Crackers", "Lemon"}', 2),
('Back pain', 'hormonal', 'Lower back pain associated with menstrual cycle', 'menstrual', '{"Anti-inflammatory foods", "Turmeric", "Ginger", "Cherries"}', 3),
('Food cravings', 'digestive', 'Intense cravings for sweet or salty foods', 'luteal', '{"Dark chocolate", "Fruit", "Nuts", "Yoghurt"}', 2),
('Anxiety', 'mood', 'Feeling of worry or nervousness', 'luteal', '{"Chamomile tea", "Avocado", "Dark chocolate", "Complex carbs"}', 3);

-- ============================================================
-- MIGRATION: 003_community.sql
-- ============================================================

-- Community groups
create table community_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,  -- emoji or icon name
  member_count int default 0,
  created_at timestamptz default now()
);

-- Community posts
create table community_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references community_groups(id),
  author_id uuid references profiles(id),
  title text not null,
  body text,
  like_count int default 0,
  reply_count int default 0,
  is_pinned boolean default false,
  created_at timestamptz default now()
);

-- Community replies
create table community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id),
  author_id uuid references profiles(id),
  body text not null,
  like_count int default 0,
  created_at timestamptz default now()
);

-- Seed 5 starter groups
insert into community_groups (name, description, icon) values
  ('Cycle Support', 'Track, share, and support each other through every phase', '🌙'),
  ('Hormone Health', 'Perimenopause, PCOS, endometriosis — you are not alone', '💛'),
  ('Nourish', 'Food, recipes, and nutrition for hormonal balance', '🥗'),
  ('Mind & Mood', 'Mental wellness, anxiety, and emotional health', '🧘'),
  ('Sista Wins', 'Celebrate your wins — big and small', '✨');

-- RLS policies
alter table community_groups enable row level security;
alter table community_posts enable row level security;
alter table community_replies enable row level security;

-- Groups: anyone authenticated can read
create policy "Anyone can view groups"
  on community_groups for select
  to authenticated
  using (true);

-- Posts: anyone authenticated can read; author can update/delete
create policy "Anyone can view posts"
  on community_posts for select
  to authenticated
  using (true);

create policy "Users can insert posts"
  on community_posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can update own posts"
  on community_posts for update
  using (auth.uid() = author_id);

create policy "Users can delete own posts"
  on community_posts for delete
  using (auth.uid() = author_id);

-- Replies: anyone authenticated can read; author can update/delete
create policy "Anyone can view replies"
  on community_replies for select
  to authenticated
  using (true);

create policy "Users can insert replies"
  on community_replies for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can update own replies"
  on community_replies for update
  using (auth.uid() = author_id);

create policy "Users can delete own replies"
  on community_replies for delete
  using (auth.uid() = author_id);

-- ============================================================
-- MIGRATION: 004_marketplace.sql
-- ============================================================

-- Seed 6 starter products (Happy Splurge range)
insert into products (name, description, price_cents, category, image_url, loyalty_points_reward) values
  ('Hormone Balance Tea', 'A warming blend of raspberry leaf, spearmint, and ashwagandha to support hormonal harmony.', 18900, 'Wellness Teas', null, 50),
  ('Cycle Tracking Journal', 'Beautiful guided journal for tracking your cycle, moods, and monthly reflections.', 24900, 'Journals', null, 70),
  ('Magnesium Sleep Spray', 'Topical magnesium spray to support deep sleep and reduce muscle tension.', 22900, 'Supplements', null, 60),
  ('PMS Relief Roller', 'Essential oil roller blend — clary sage, lavender, and geranium for cramp relief.', 16900, 'Aromatherapy', null, 45),
  ('Nourish Supplement Pack', '30-day supply: Vitex, Omega-3, and Vitamin D3 for full-cycle hormonal support.', 54900, 'Supplements', null, 150),
  ('Sista Self-Care Kit', 'Curated box: tea, journal, roller, and bath salts — the complete reset.', 89900, 'Gift Sets', null, 250);

-- ============================================================
-- MIGRATION: 005_admin.sql
-- ============================================================

-- Admin role on profiles table
alter table profiles add column if not exists role text default 'user' 
  check (role in ('user', 'admin', 'persona'));

-- Persona profiles table (extends profiles concept)
create table personas (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  display_name text not null,
  avatar_emoji text default '👩',
  bio text,
  age_range text,
  interests text[],
  personality text,
  created_by uuid references profiles(id),
  is_active boolean default true,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

-- Activity log — tracks everything real users do
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  event_type text not null,
  event_data jsonb,
  session_id text,
  created_at timestamptz default now()
);

-- Index for fast admin queries
create index activity_log_user_idx on activity_log(user_id, created_at desc);
create index activity_log_event_idx on activity_log(event_type, created_at desc);

-- Admin action log (audit trail of admin/persona actions)
create table admin_action_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id),
  persona_id uuid references personas(id),
  action_type text,
  target_id uuid,
  notes text,
  created_at timestamptz default now()
);

-- RLS: only admins can read these tables
alter table activity_log enable row level security;
alter table personas enable row level security;
alter table admin_action_log enable row level security;

create policy "admin_only_activity" on activity_log
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_only_personas" on personas
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_only_admin_logs" on admin_action_log
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- MIGRATION: 006_ecosystem.sql
-- ============================================================

-- ============================================================
-- MY SISTA PHASE 3 — ECOSYSTEM EXPANSION
-- ============================================================

-- ============================================================
-- WELLNESS HUB
-- ============================================================

create table wellness_conditions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  category text not null,
  icon text,
  cover_color text,
  description text,
  age_ranges text[],
  is_featured boolean default false,
  sort_order int default 0
);

create table condition_remedies (
  id uuid primary key default gen_random_uuid(),
  condition_id uuid references wellness_conditions(id),
  title text not null,
  remedy_type text,
  description text,
  evidence_level text,
  source_note text,
  sort_order int default 0
);

-- ============================================================
-- RECIPE LIBRARY
-- ============================================================

create table recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id),
  title text not null,
  description text,
  category text,
  condition_tags text[],
  prep_time_mins int,
  cook_time_mins int,
  servings int,
  difficulty text,
  ingredients jsonb,
  steps jsonb,
  nutrition_notes text,
  benefit_tags text[],
  cover_image_url text,
  is_community boolean default true,
  is_featured boolean default false,
  save_count int default 0,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  created_at timestamptz default now()
);

create table recipe_saves (
  user_id uuid references profiles(id),
  recipe_id uuid references recipes(id),
  primary key (user_id, recipe_id),
  created_at timestamptz default now()
);

create table recipe_ratings (
  user_id uuid references profiles(id),
  recipe_id uuid references recipes(id),
  rating int check (rating between 1 and 5),
  comment text,
  primary key (user_id, recipe_id),
  created_at timestamptz default now()
);

-- ============================================================
-- DIY & LIFE HACKS
-- ============================================================

create table diy_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id),
  title text not null,
  description text,
  category text,
  media_urls text[],
  steps jsonb,
  tags text[],
  upvote_count int default 0,
  save_count int default 0,
  is_featured boolean default false,
  created_at timestamptz default now()
);

create table diy_upvotes (
  user_id uuid references profiles(id),
  diy_id uuid references diy_posts(id),
  primary key (user_id, diy_id),
  created_at timestamptz default now()
);

create table diy_saves (
  user_id uuid references profiles(id),
  diy_id uuid references diy_posts(id),
  primary key (user_id, diy_id),
  created_at timestamptz default now()
);

-- ============================================================
-- CREATOR PAGES
-- ============================================================

create table creator_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) unique,
  page_name text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  cover_image_url text,
  category text,
  follower_count int default 0,
  post_count int default 0,
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table creator_follows (
  follower_id uuid references profiles(id),
  creator_id uuid references creator_pages(id),
  primary key (follower_id, creator_id),
  created_at timestamptz default now()
);

create table creator_posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creator_pages(id),
  post_type text,
  title text,
  body text,
  media_urls text[],
  linked_recipe_id uuid references recipes(id),
  linked_diy_id uuid references diy_posts(id),
  like_count int default 0,
  comment_count int default 0,
  save_count int default 0,
  created_at timestamptz default now()
);

create table creator_post_likes (
  user_id uuid references profiles(id),
  post_id uuid references creator_posts(id),
  primary key (user_id, post_id)
);

-- ============================================================
-- ANONYMOUS QUESTIONS
-- ============================================================

create table anon_questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id),
  body text not null,
  category text,
  condition_tag text,
  upvote_count int default 0,
  answer_count int default 0,
  is_flagged boolean default false,
  created_at timestamptz default now()
);

create table anon_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references anon_questions(id),
  author_id uuid references profiles(id),
  is_anon_answer boolean default false,
  body text not null,
  upvote_count int default 0,
  is_expert boolean default false,
  created_at timestamptz default now()
);

create table anon_upvotes (
  user_id uuid references profiles(id),
  question_id uuid references anon_questions(id),
  primary key (user_id, question_id)
);

-- ============================================================
-- LOCAL BUSINESS DIRECTORY
-- ============================================================

create table local_businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  city text,
  province text,
  country text default 'South Africa',
  phone text,
  email text,
  website_url text,
  instagram_url text,
  google_maps_url text,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  is_verified boolean default false,
  is_active boolean default true,
  submitted_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table business_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references local_businesses(id),
  author_id uuid references profiles(id),
  rating int check (rating between 1 and 5),
  review_text text,
  created_at timestamptz default now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

alter table recipes enable row level security;
alter table diy_posts enable row level security;
alter table creator_pages enable row level security;
alter table creator_posts enable row level security;
alter table anon_questions enable row level security;
alter table anon_answers enable row level security;
alter table local_businesses enable row level security;

-- Recipes: authenticated read, own-row write
create policy "Recipes are publicly readable" on recipes for select using (true);
create policy "Authenticated users can create recipes" on recipes for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own recipes" on recipes for update using (auth.uid() = author_id);

-- DIY posts: authenticated read, own-row write
create policy "DIY posts are publicly readable" on diy_posts for select using (true);
create policy "Authenticated users can create DIY posts" on diy_posts for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own DIY posts" on diy_posts for update using (auth.uid() = author_id);

-- Creator pages: authenticated read, own-row write
create policy "Creator pages are publicly readable" on creator_pages for select using (true);
create policy "Users can create their own creator page" on creator_pages for insert with check (auth.uid() = owner_id);
create policy "Users can update their own creator page" on creator_pages for update using (auth.uid() = owner_id);

-- Creator posts: authenticated read, own-row write
create policy "Creator posts are publicly readable" on creator_posts for select using (true);
create policy "Owners can create posts on their page" on creator_posts for insert with check (exists (select 1 from creator_pages where id = creator_id and owner_id = auth.uid()));
create policy "Owners can update their posts" on creator_posts for update using (exists (select 1 from creator_pages where id = creator_id and owner_id = auth.uid()));

-- Anon questions: authenticated read of public view only, own-row write
create policy "Users can insert their own anon questions" on anon_questions for insert with check (auth.uid() = author_id);

-- Anon answers: authenticated read, own-row write
create policy "Anon answers are publicly readable" on anon_answers for select using (true);
create policy "Authenticated users can answer" on anon_answers for insert with check (auth.role() = 'authenticated');

-- Local businesses: authenticated read, admin write
create policy "Businesses are publicly readable (active only)" on local_businesses for select using (is_active = true or auth.uid() in (select id from profiles where role = 'admin'));
create policy "Authenticated users can submit businesses" on local_businesses for insert with check (auth.role() = 'authenticated');

-- Anon questions: author_id is NEVER exposed via API
create view public_anon_questions as
  select id, body, category, condition_tag, upvote_count, answer_count, created_at
  from anon_questions where is_flagged = false;

-- ============================================================
-- MIGRATION: 007_seed_ecosystem.sql
-- ============================================================

-- ============================================================
-- SEED DATA — WELLNESS CONDITIONS
-- ============================================================

insert into wellness_conditions (slug, name, tagline, category, icon, cover_color, age_ranges, is_featured, sort_order) values
('menstrual-health',   'Menstrual Health',       'Every cycle tells a story.',                           'reproductive', '🌙', '#7B3F6E', ARRAY['teens','20s','30s','40s'], true, 1),
('pcos',               'PCOS Support',           'You are not broken. You are not alone.',               'hormonal',     '🌿', '#4A5342', ARRAY['teens','20s','30s','40s'], true, 2),
('endometriosis',      'Endometriosis',          'Your pain is real. Your strength is real.',            'reproductive', '🔴', '#8B2635', ARRAY['20s','30s','40s'], true, 3),
('perimenopause',      'Perimenopause',          'The transition is a beginning, not an ending.',        'life-stage',   '🌅', '#C4622D', ARRAY['40s','50s+'], true, 4),
('menopause',          'Menopause',              'Wisdom, freedom, and a new chapter.',                  'life-stage',   '🌸', '#D4826A', ARRAY['40s','50s+'], true, 5),
('pregnancy',          'Pregnancy',              'Growing life, growing strength.',                      'life-stage',   '👶', '#7AADBC', ARRAY['20s','30s','40s'], true, 6),
('postpartum',         'Postpartum Recovery',    'You just did the hardest thing. Be gentle with yourself.', 'life-stage','💛', '#C9A84C', ARRAY['20s','30s','40s'], true, 7),
('hormonal-health',    'Hormonal Health',        'Hormones affect everything. Let''s get them in balance.', 'hormonal',  '⚡', '#5B6FA6', ARRAY['teens','20s','30s','40s','50s+'], true, 8),
('hair-loss',          'Hair Loss',              'Hair is more than beauty — it''s identity.',           'physical',     '💆', '#8B7355', ARRAY['20s','30s','40s','50s+'], false, 9),
('skin-concerns',      'Skin & Acne',            'Hormonal skin is common. Clear skin is possible.',    'physical',     '✨', '#D4A0A0', ARRAY['teens','20s','30s','40s'], false, 10),
('sleep',              'Sleep Health',           'Rest is not a luxury. It is medicine.',                'mental',       '🌙', '#3D4F7C', ARRAY['teens','20s','30s','40s','50s+'], false, 11),
('stress-anxiety',     'Stress & Anxiety',       'Your nervous system deserves care too.',               'mental',       '🧘', '#6B8F71', ARRAY['teens','20s','30s','40s','50s+'], true, 12),
('fertility',          'Fertility Support',      'Your journey to parenthood matters.',                  'reproductive', '🌱', '#7BA05B', ARRAY['20s','30s','40s'], false, 13),
('fibroids',           'Uterine Fibroids',       'Common, manageable, and worth understanding.',         'reproductive', '🔵', '#4A7BA0', ARRAY['30s','40s','50s+'], false, 14),
('weight-management',  'Weight & Metabolism',    'Not about size. About feeling good in your body.',     'physical',     '💪', '#8B6914', ARRAY['teens','20s','30s','40s','50s+'], false, 15),
('fitness',            'Fitness & Movement',     'Move for joy, not punishment.',                        'physical',     '🏃', '#2D7D5A', ARRAY['teens','20s','30s','40s','50s+'], false, 16),
('thyroid',            'Thyroid Health',         'The butterfly gland that runs everything.',            'hormonal',     '🦋', '#7B9EA6', ARRAY['20s','30s','40s','50s+'], false, 17),
('gut-health',         'Gut Health',             'Heal the gut, heal the hormones.',                     'physical',     '🌿', '#6B8C5A', ARRAY['teens','20s','30s','40s','50s+'], false, 18),
('mental-wellness',    'Mental Wellness',        'Mind health is health. Full stop.',                    'mental',       '💜', '#7B5EA6', ARRAY['teens','20s','30s','40s','50s+'], true, 19),
('bone-health',        'Bone & Joint Health',    'Strong bones, strong foundation.',                     'physical',     '🦴', '#A09070', ARRAY['30s','40s','50s+'], false, 20);

-- ============================================================
-- SEED DATA — REMEDIES
-- ============================================================

-- Menstrual Health remedies
insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Heat Therapy', 'lifestyle', 'Apply a heating pad or hot water bottle to your lower abdomen to relax contracting muscles and reduce cramping pain.', 'research-backed', 1
from wellness_conditions where slug = 'menstrual-health';

insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Iron-Rich Foods', 'dietary', 'Increase intake of spinach, lentils, red meat, and fortified cereals during and after your period to replenish iron stores.', 'medical-consensus', 2
from wellness_conditions where slug = 'menstrual-health';

insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Magnesium Supplement', 'natural', 'Magnesium helps reduce PMS symptoms including cramps, bloating, and mood swings. Take 200-400mg daily.', 'research-backed', 3
from wellness_conditions where slug = 'menstrual-health';

-- PCOS remedies
insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Balanced Blood Sugar Diet', 'dietary', 'Focus on low-GI foods, complex carbs, and protein at every meal to help manage insulin resistance common in PCOS.', 'medical-consensus', 1
from wellness_conditions where slug = 'pcos';

insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Spearmint Tea', 'natural', 'Drinking two cups of spearmint tea daily may help reduce free testosterone levels and improve hirsutism.', 'research-backed', 2
from wellness_conditions where slug = 'pcos';

insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Inositol Supplement', 'natural', 'Myo-inositol and D-chiro-inositol (40:1 ratio) can improve insulin sensitivity and ovarian function in PCOS.', 'research-backed', 3
from wellness_conditions where slug = 'pcos';

-- Endometriosis remedies
insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Anti-Inflammatory Diet', 'dietary', 'Reduce red meat, dairy, and gluten while increasing omega-3s, leafy greens, and antioxidant-rich fruits.', 'research-backed', 1
from wellness_conditions where slug = 'endometriosis';

insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Pelvic Floor Physiotherapy', 'medical', 'A pelvic floor physiotherapist can help manage pain, improve mobility, and reduce muscle tension.', 'medical-consensus', 2
from wellness_conditions where slug = 'endometriosis';

-- Perimenopause remedies
insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Strength Training', 'lifestyle', 'Resistance training 2-3 times per week helps maintain bone density, muscle mass, and metabolic health.', 'medical-consensus', 1
from wellness_conditions where slug = 'perimenopause';

insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Cooling Sleep Habits', 'lifestyle', 'Keep bedroom cool, use breathable bedding, and try layered clothing to manage night sweats.', 'anecdotal', 2
from wellness_conditions where slug = 'perimenopause';

-- Pregnancy remedies
insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Ginger for Nausea', 'natural', 'Fresh ginger tea, ginger chews, or ginger capsules can significantly reduce pregnancy-related nausea.', 'research-backed', 1
from wellness_conditions where slug = 'pregnancy';

insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Prenatal Vitamins', 'medical', 'Folate (400-800mcg), iron, calcium, vitamin D, and DHA are essential. Start before conception if possible.', 'medical-consensus', 2
from wellness_conditions where slug = 'pregnancy';

-- Stress & Anxiety remedies
insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Box Breathing', 'mindset', 'Inhale 4 sec, hold 4 sec, exhale 4 sec, hold 4 sec. Repeat 5 times to activate the parasympathetic nervous system.', 'research-backed', 1
from wellness_conditions where slug = 'stress-anxiety';

insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Ashwagandha', 'natural', 'This adaptogenic herb may reduce cortisol levels and improve stress resilience. Consult your doctor before taking.', 'research-backed', 2
from wellness_conditions where slug = 'stress-anxiety';

insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Morning Sunlight', 'lifestyle', '10-15 minutes of morning sunlight within 30 minutes of waking helps regulate circadian rhythm and mood.', 'research-backed', 3
from wellness_conditions where slug = 'stress-anxiety';

-- Mental Wellness remedies
insert into condition_remedies (condition_id, title, remedy_type, description, evidence_level, sort_order)
select id, 'Daily Gratitude Practice', 'mindset', 'Write three things you are grateful for each day. This rewires the brain for positivity over 21 days.', 'research-backed', 1
from wellness_conditions where slug = 'mental-wellness';

-- ============================================================
-- SEED DATA — RECIPES (30)
-- ============================================================

insert into recipes (title, category, condition_tags, prep_time_mins, cook_time_mins, servings, difficulty, ingredients, steps, nutrition_notes, benefit_tags, is_community, is_featured) values

-- PERIOD SUPPORT
('Warming Iron-Rich Lentil Soup',
 'period-support', ARRAY['menstrual-health','endometriosis'],
 10, 30, 4, 'easy',
 '[{"amount":"1 cup","item":"red lentils"},{"amount":"1","item":"large onion, diced"},{"amount":"3 cloves","item":"garlic"},{"amount":"2 tsp","item":"cumin"},{"amount":"1 tsp","item":"turmeric"},{"amount":"400ml","item":"coconut milk"},{"amount":"4 cups","item":"vegetable stock"},{"amount":"2 cups","item":"baby spinach"},{"amount":"1 tbsp","item":"olive oil"},{"amount":"to taste","item":"salt and pepper"}]',
 '[{"step":1,"instruction":"Heat olive oil in a large pot, sauté onion 5 mins until soft."},{"step":2,"instruction":"Add garlic, cumin, turmeric — stir 1 min until fragrant."},{"step":3,"instruction":"Add lentils, stock and coconut milk. Bring to boil."},{"step":4,"instruction":"Simmer 20 mins until lentils are soft."},{"step":5,"instruction":"Stir in spinach until wilted. Season and serve."}]',
 'High in iron, folate, and anti-inflammatory turmeric. Supports blood replenishment during menstruation.',
 ARRAY['iron-boost','anti-inflammatory','cramp-relief'], false, true),

('Ginger Turmeric Anti-Cramp Tea Latte',
 'period-support', ARRAY['menstrual-health','endometriosis'],
 5, 10, 2, 'easy',
 '[{"amount":"2 cups","item":"oat milk"},{"amount":"1 tsp","item":"fresh ginger, grated"},{"amount":"1 tsp","item":"turmeric powder"},{"amount":"1/2 tsp","item":"cinnamon"},{"amount":"1 tbsp","item":"honey"},{"amount":"pinch","item":"black pepper"}]',
 '[{"step":1,"instruction":"Warm oat milk in a saucepan — do not boil."},{"step":2,"instruction":"Whisk in ginger, turmeric, cinnamon, and black pepper."},{"step":3,"instruction":"Sweeten with honey. Pour into mugs and serve warm."}]',
 'Ginger reduces prostaglandins linked to menstrual cramps. Turmeric is a natural anti-inflammatory.',
 ARRAY['cramp-relief','warming','anti-inflammatory'], false, true),

('Dark Chocolate Magnesium Bliss Balls',
 'period-support', ARRAY['menstrual-health','pcos'],
 15, 0, 12, 'easy',
 '[{"amount":"1 cup","item":"medjool dates, pitted"},{"amount":"1 cup","item":"almonds"},{"amount":"3 tbsp","item":"raw cacao powder"},{"amount":"2 tbsp","item":"pumpkin seeds"},{"amount":"1 tbsp","item":"chia seeds"},{"amount":"pinch","item":"sea salt"}]',
 '[{"step":1,"instruction":"Blend almonds in food processor until coarsely ground."},{"step":2,"instruction":"Add dates, cacao, seeds and salt. Blend until sticky dough forms."},{"step":3,"instruction":"Roll into 12 balls. Refrigerate 30 mins before serving."}]',
 'Magnesium from almonds, cacao and pumpkin seeds helps reduce PMS symptoms and chocolate cravings.',
 ARRAY['pms-relief','magnesium-rich','mood-boost'], false, true),

-- HORMONAL BALANCE
('Seed Cycling Smoothie Bowl',
 'hormonal-balance', ARRAY['pcos','hormonal-health','fertility'],
 10, 0, 1, 'easy',
 '[{"amount":"1","item":"frozen banana"},{"amount":"1/2 cup","item":"frozen mango"},{"amount":"1 cup","item":"spinach"},{"amount":"1/2 cup","item":"oat milk"},{"amount":"1 tbsp","item":"flaxseeds"},{"amount":"1 tbsp","item":"sunflower seeds"},{"amount":"toppings","item":"berries, granola, sliced banana"}]',
 '[{"step":1,"instruction":"Blend banana, mango, spinach, and oat milk until smooth."},{"step":2,"instruction":"Pour into bowl. Top with seeds and toppings."},{"step":3,"instruction":"Follicular phase (day 1–14): flax + pumpkin seeds. Luteal phase (day 15–28): sunflower + sesame seeds."}]',
 'Seed cycling supports natural hormone regulation.',
 ARRAY['hormone-balance','seed-cycling','fertility-support'], false, true),

('Salmon and Avocado Power Bowl',
 'hormonal-balance', ARRAY['pcos','hormonal-health','hair-loss'],
 10, 12, 2, 'easy',
 '[{"amount":"2 fillets","item":"salmon"},{"amount":"1","item":"avocado, sliced"},{"amount":"1 cup","item":"brown rice, cooked"},{"amount":"1 cup","item":"edamame"},{"amount":"1","item":"cucumber, sliced"},{"amount":"2 tbsp","item":"tamari soy sauce"},{"amount":"1 tsp","item":"sesame oil"},{"amount":"1 tsp","item":"sesame seeds"},{"amount":"1 tbsp","item":"pickled ginger"}]',
 '[{"step":1,"instruction":"Pan-fry or bake salmon 12 mins until cooked through."},{"step":2,"instruction":"Assemble bowl: rice base, then salmon, avocado, edamame, cucumber."},{"step":3,"instruction":"Drizzle with tamari and sesame oil. Top with sesame seeds and ginger."}]',
 'Omega-3 from salmon supports hormone production. Avocado provides healthy fats for hormonal communication.',
 ARRAY['omega-3','hormone-balance','hair-growth'], false, true),

('Hormone-Balancing Golden Rice',
 'hormonal-balance', ARRAY['pcos','perimenopause'],
 5, 20, 4, 'easy',
 '[{"amount":"1.5 cups","item":"basmati rice"},{"amount":"1 tsp","item":"turmeric"},{"amount":"1/2 tsp","item":"cumin"},{"amount":"3 cups","item":"vegetable stock"},{"amount":"1","item":"onion, diced"},{"amount":"3 cloves","item":"garlic"},{"amount":"1 cup","item":"frozen peas"},{"amount":"2 tbsp","item":"olive oil"},{"amount":"handful","item":"fresh coriander"}]',
 '[{"step":1,"instruction":"Sauté onion and garlic in olive oil 5 mins."},{"step":2,"instruction":"Add turmeric and cumin, stir 1 min."},{"step":3,"instruction":"Add rice and stock. Bring to boil then simmer 15 mins covered."},{"step":4,"instruction":"Stir in peas for final 3 mins. Finish with fresh coriander."}]',
 'Turmeric supports liver health and oestrogen metabolism.',
 ARRAY['anti-inflammatory','hormone-balance','budget-friendly'], false, false),

-- HAIR & SKIN
('Biotin Breakfast Scramble',
 'hair-skin', ARRAY['hair-loss','skin-concerns'],
 5, 8, 2, 'easy',
 '[{"amount":"4","item":"free-range eggs"},{"amount":"1/4 cup","item":"walnuts, chopped"},{"amount":"1 cup","item":"baby spinach"},{"amount":"1/2","item":"red pepper, diced"},{"amount":"1 tbsp","item":"olive oil"},{"amount":"1/4 tsp","item":"black pepper"},{"amount":"handful","item":"fresh parsley"}]',
 '[{"step":1,"instruction":"Heat olive oil in pan. Sauté red pepper 3 mins."},{"step":2,"instruction":"Add spinach, wilt 1 min."},{"step":3,"instruction":"Whisk eggs with pepper. Pour into pan and scramble gently."},{"step":4,"instruction":"Top with walnuts and fresh parsley."}]',
 'Eggs are one of the richest natural sources of biotin. Walnuts provide omega-3 for scalp and skin health.',
 ARRAY['biotin-rich','hair-growth','skin-glow'], false, true),

('Sweet Potato and Lentil Glow Bowl',
 'hair-skin', ARRAY['skin-concerns','hormonal-health'],
 10, 25, 2, 'medium',
 '[{"amount":"2 medium","item":"sweet potatoes, cubed"},{"amount":"1 cup","item":"green lentils, cooked"},{"amount":"3 cups","item":"kale, chopped"},{"amount":"2 cloves","item":"garlic"},{"amount":"1 tsp","item":"smoked paprika"},{"amount":"2 tbsp","item":"tahini"},{"amount":"1","item":"lemon, juiced"},{"amount":"2 tbsp","item":"olive oil"}]',
 '[{"step":1,"instruction":"Roast sweet potato cubes at 200°C with olive oil and paprika, 20 mins."},{"step":2,"instruction":"Massage kale with olive oil and lemon juice until softened."},{"step":3,"instruction":"Make tahini dressing: whisk tahini, lemon juice, garlic, and 2 tbsp water."},{"step":4,"instruction":"Assemble: kale base, lentils, sweet potato. Drizzle with dressing."}]',
 'Beta-carotene in sweet potato converts to vitamin A for skin cell renewal. Zinc in lentils supports collagen production.',
 ARRAY['collagen-support','skin-glow','vitamin-a'], false, false),

-- PREGNANCY
('Nausea-Soothing Ginger Oat Porridge',
 'pregnancy', ARRAY['pregnancy'],
 3, 8, 1, 'easy',
 '[{"amount":"1 cup","item":"rolled oats"},{"amount":"2 cups","item":"water or oat milk"},{"amount":"1 tsp","item":"fresh ginger, grated"},{"amount":"1 tbsp","item":"honey"},{"amount":"1/4 tsp","item":"cinnamon"},{"amount":"1 tbsp","item":"nut butter"},{"amount":"toppings","item":"banana slices"}]',
 '[{"step":1,"instruction":"Cook oats in liquid on medium heat 5 mins, stirring."},{"step":2,"instruction":"Stir in ginger and cinnamon."},{"step":3,"instruction":"Top with honey, nut butter, and banana."}]',
 'Ginger is well-researched for reducing pregnancy nausea.',
 ARRAY['nausea-relief','pregnancy-safe','gentle-energy'], false, true),

('Folate-Rich Green Goddess Pasta',
 'pregnancy', ARRAY['pregnancy','fertility'],
 10, 15, 3, 'easy',
 '[{"amount":"300g","item":"pasta of choice"},{"amount":"2 cups","item":"baby spinach"},{"amount":"1 cup","item":"frozen peas"},{"amount":"1","item":"avocado"},{"amount":"2 cloves","item":"garlic"},{"amount":"1/2 cup","item":"fresh basil"},{"amount":"2 tbsp","item":"olive oil"},{"amount":"1","item":"lemon, juiced"}]',
 '[{"step":1,"instruction":"Cook pasta as per packet directions."},{"step":2,"instruction":"Blend spinach, peas, avocado, basil, garlic, olive oil, and lemon into a smooth sauce."},{"step":3,"instruction":"Toss hot pasta with green sauce. Season generously."}]',
 'Spinach, peas and avocado are excellent sources of folate for neural tube development.',
 ARRAY['folate-rich','pregnancy-safe','easy-prep'], false, false),

-- MENOPAUSE
('Calcium-Rich Sardine Toast',
 'menopause', ARRAY['menopause','perimenopause','bone-health'],
 5, 0, 1, 'easy',
 '[{"amount":"2 slices","item":"sourdough bread, toasted"},{"amount":"1 tin","item":"sardines in olive oil"},{"amount":"1/2","item":"avocado, mashed"},{"amount":"1 tsp","item":"lemon juice"},{"amount":"handful","item":"rocket leaves"}]',
 '[{"step":1,"instruction":"Mash avocado with lemon juice, salt, and pepper."},{"step":2,"instruction":"Spread avocado on toast. Top with sardines and rocket."}]',
 'Sardines with soft bones are one of the highest dietary sources of calcium.',
 ARRAY['calcium-rich','bone-health','omega-3'], false, false),

('Phytoestrogen Edamame Stir Fry',
 'menopause', ARRAY['menopause','perimenopause','hormonal-health'],
 10, 12, 2, 'easy',
 '[{"amount":"2 cups","item":"edamame, shelled"},{"amount":"1 cup","item":"broccoli florets"},{"amount":"1","item":"red pepper, sliced"},{"amount":"3 cloves","item":"garlic"},{"amount":"1 tsp","item":"fresh ginger"},{"amount":"3 tbsp","item":"tamari"},{"amount":"1 tsp","item":"sesame oil"},{"amount":"1 tbsp","item":"coconut oil"},{"amount":"1 tsp","item":"sesame seeds"},{"amount":"2 cups","item":"brown rice, to serve"}]',
 '[{"step":1,"instruction":"Heat coconut oil in wok or large pan on high."},{"step":2,"instruction":"Stir fry broccoli and pepper 4 mins."},{"step":3,"instruction":"Add edamame, garlic, ginger — stir fry 3 mins more."},{"step":4,"instruction":"Add tamari and sesame oil. Toss to coat."},{"step":5,"instruction":"Serve over rice, topped with sesame seeds."}]',
 'Edamame and soy are rich in phytoestrogens that may support oestrogen levels during menopause.',
 ARRAY['phytoestrogens','hot-flash-support','bone-health'], false, true),

-- GENERAL COMFORT
('One-Pot Hug-in-a-Bowl Chicken Soup',
 'period-support', ARRAY['menstrual-health','stress-anxiety','postpartum'],
 15, 40, 6, 'easy',
 '[{"amount":"1 kg","item":"chicken pieces"},{"amount":"3","item":"carrots, chopped"},{"amount":"3 stalks","item":"celery"},{"amount":"1 large","item":"onion"},{"amount":"4 cloves","item":"garlic"},{"amount":"1 cup","item":"basmati rice or egg noodles"},{"amount":"1 tsp","item":"dried thyme"},{"amount":"6 cups","item":"water"},{"amount":"2 tsp","item":"salt"},{"amount":"fresh parsley","item":"to serve"}]',
 '[{"step":1,"instruction":"Place chicken, onion, garlic, carrots, celery, thyme, and water in large pot."},{"step":2,"instruction":"Bring to boil, then simmer covered for 30 mins."},{"step":3,"instruction":"Remove chicken, shred meat, discard bones. Return meat to pot."},{"step":4,"instruction":"Add rice or noodles. Cook 10 more mins. Season."}]',
 'Bone broth supports gut health, collagen, and the immune system.',
 ARRAY['comfort-food','immune-boost','collagen','postpartum-recovery'], false, true),

-- More recipes to reach 30
('Cramp-Calming Chamomile Overnight Oats',
 'period-support', ARRAY['menstrual-health','endometriosis'],
 10, 0, 1, 'easy',
 '[{"amount":"1/2 cup","item":"rolled oats"},{"amount":"1/2 cup","item":"chamomile tea, brewed"},{"amount":"1/4 cup","item":"yogurt"},{"amount":"1 tbsp","item":"honey"},{"amount":"1 tbsp","item":"chia seeds"},{"amount":"1/4 cup","item":"raspberries"}]',
 '[{"step":1,"instruction":"Brew chamomile tea and let cool slightly."},{"step":2,"instruction":"Mix oats, tea, yogurt, honey, and chia seeds in a jar."},{"step":3,"instruction":"Refrigerate overnight. Top with raspberries in the morning."}]',
 'Chamomile has anti-inflammatory and antispasmodic properties.',
 ARRAY['cramp-relief','anti-inflammatory','overnight-prep'], false, false),

('Iron-Boosting Beetroot Salad',
 'period-support', ARRAY['menstrual-health'],
 15, 30, 2, 'easy',
 '[{"amount":"2 medium","item":"beetroot, roasted"},{"amount":"1 cup","item":"rocket"},{"amount":"1/4 cup","item":"walnuts"},{"amount":"1/4 cup","item":"feta cheese"},{"amount":"1 tbsp","item":"balsamic vinegar"},{"amount":"2 tbsp","item":"olive oil"}]',
 '[{"step":1,"instruction":"Roast beetroot at 200°C for 30 mins until tender."},{"step":2,"instruction":"Slice beetroot and arrange on rocket."},{"step":3,"instruction":"Top with walnuts and feta. Drizzle with balsamic and olive oil."}]',
 'Beetroot is rich in iron, folate, and nitrates that improve blood flow.',
 ARRAY['iron-boost','blood-support','antioxidant'], false, false),

('PCOS-Friendly Chickpea Buddha Bowl',
 'hormonal-balance', ARRAY['pcos'],
 10, 20, 2, 'easy',
 '[{"amount":"1 can","item":"chickpeas, drained"},{"amount":"1 cup","item":"quinoa, cooked"},{"amount":"1","item":"avocado"},{"amount":"1 cup","item":"kale, chopped"},{"amount":"1/2","item":"lemon, juiced"},{"amount":"1 tsp","item":"cumin"},{"amount":"1 tsp","item":"paprika"},{"amount":"2 tbsp","item":"tahini"}]',
 '[{"step":1,"instruction":"Roast chickpeas with cumin, paprika and olive oil at 200°C for 20 mins."},{"step":2,"instruction":"Massage kale with lemon juice."},{"step":3,"instruction":"Assemble bowl: quinoa, kale, avocado, roasted chickpeas. Drizzle with tahini."}]',
 'Chickpeas have a low GI to support stable blood sugar levels.',
 ARRAY['low-gi','blood-sugar-balance','plant-protein'], false, false),

('Anti-Inflammatory Berry Smoothie',
 'hormonal-balance', ARRAY['hormonal-health','skin-concerns'],
 5, 0, 1, 'easy',
 '[{"amount":"1 cup","item":"mixed berries, frozen"},{"amount":"1","item":"banana"},{"amount":"1 cup","item":"unsweetened almond milk"},{"amount":"1 tbsp","item":"chia seeds"},{"amount":"1 tbsp","item":"hemp seeds"},{"amount":"1 tsp","item":"turmeric"}]',
 '[{"step":1,"instruction":"Blend all ingredients until smooth."},{"step":2,"instruction":"Pour into glass and enjoy immediately."}]',
 'Berries are packed with antioxidants. Turmeric and chia seeds add anti-inflammatory benefits.',
 ARRAY['antioxidant','anti-inflammatory','skin-support'], false, false),

('Magnesium-Rich Pumpkin Seed Pesto Pasta',
 'period-support', ARRAY['menstrual-health','pcos'],
 10, 12, 2, 'easy',
 '[{"amount":"200g","item":"whole wheat pasta"},{"amount":"1/2 cup","item":"pumpkin seeds"},{"amount":"2 cups","item":"fresh basil"},{"amount":"2 cloves","item":"garlic"},{"amount":"1/3 cup","item":"olive oil"},{"amount":"1/4 cup","item":"nutritional yeast"}]',
 '[{"step":1,"instruction":"Cook pasta according to package directions."},{"step":2,"instruction":"Blend pumpkin seeds, basil, garlic, olive oil, and nutritional yeast until smooth."},{"step":3,"instruction":"Toss pasta with pesto and serve."}]',
 'Pumpkin seeds are one of the richest sources of magnesium.',
 ARRAY['magnesium-rich','cramp-relief','plant-protein'], false, false),

('Sleep-Supporting Tart Cherry Smoothie',
 'hormonal-balance', ARRAY['sleep','stress-anxiety'],
 5, 0, 1, 'easy',
 '[{"amount":"1 cup","item":"tart cherry juice"},{"amount":"1","item":"banana, frozen"},{"amount":"1/4 cup","item":"plain yogurt"},{"amount":"1 tbsp","item":"almond butter"},{"amount":"pinch","item":"cinnamon"}]',
 '[{"step":1,"instruction":"Blend all ingredients until smooth and creamy."},{"step":2,"instruction":"Drink 1 hour before bedtime for best results."}]',
 'Tart cherry juice is a natural source of melatonin that can improve sleep quality.',
 ARRAY['sleep-support','melatonin','calming'], false, false),

('Energy-Boosting Green Power Juice',
 'hormonal-balance', ARRAY['hormonal-health','fertility'],
 10, 0, 1, 'easy',
 '[{"amount":"2","item":"green apples"},{"amount":"2 stalks","item":"celery"},{"amount":"1 cup","item":"spinach"},{"amount":"1/2","item":"cucumber"},{"amount":"1 inch","item":"ginger"},{"amount":"1/2","item":"lemon"}]',
 '[{"step":1,"instruction":"Wash all ingredients thoroughly."},{"step":2,"instruction":"Juice or blend everything together. If blending, strain through a nut milk bag."},{"step":3,"instruction":"Serve immediately over ice."}]',
 'Packed with chlorophyll, vitamin C, and enzymes to alkalize and energize.',
 ARRAY['energy-boost','alkalizing','vitamin-c'], false, false),

('Collagen-Boosting Bone Broth',
 'general', ARRAY['skin-concerns','gut-health','bone-health'],
 10, 180, 6, 'medium',
 '[{"amount":"1 kg","item":"beef or chicken bones"},{"amount":"2","item":"carrots"},{"amount":"2 stalks","item":"celery"},{"amount":"1","item":"onion"},{"amount":"3 cloves","item":"garlic"},{"amount":"2 tbsp","item":"apple cider vinegar"},{"amount":"handful","item":"fresh parsley"}]',
 '[{"step":1,"instruction":"Roast bones at 200°C for 30 mins for deeper flavour."},{"step":2,"instruction":"Place bones, vegetables, garlic, and vinegar in a large pot."},{"step":3,"instruction":"Cover with water and simmer for 3 hours (or 24 hours for beef bones)."},{"step":4,"instruction":"Strain, season, and drink warm or use as soup base."}]',
 'Bone broth is rich in collagen, gelatin, and minerals that support skin, gut, and joint health.',
 ARRAY['collagen','gut-healing','joint-support'], false, false),

('Quick Overnight Chia Pudding',
 'general', ARRAY['gut-health','hormonal-health'],
 10, 0, 2, 'easy',
 '[{"amount":"1/4 cup","item":"chia seeds"},{"amount":"1 cup","item":"coconut milk"},{"amount":"1 tbsp","item":"maple syrup"},{"amount":"1/2 tsp","item":"vanilla extract"},{"amount":"toppings","item":"fresh fruit, nuts"}]',
 '[{"step":1,"instruction":"Whisk chia seeds, coconut milk, maple syrup, and vanilla together."},{"step":2,"instruction":"Pour into jars and refrigerate overnight."},{"step":3,"instruction":"Top with fresh fruit and nuts before serving."}]',
 'Chia seeds are loaded with omega-3s, fibre, and protein for hormone balance.',
 ARRAY['omega-3','fibre-rich','easy-prep'], false, true),

('Mood-Boosting Turmeric Golden Milk',
 'general', ARRAY['stress-anxiety','mental-wellness'],
 5, 10, 1, 'easy',
 '[{"amount":"1 cup","item":"warm milk (any kind)"},{"amount":"1 tsp","item":"turmeric"},{"amount":"1/4 tsp","item":"cinnamon"},{"amount":"pinch","item":"black pepper"},{"amount":"1 tsp","item":"honey"},{"amount":"1/2 tsp","item":"ginger powder"}]',
 '[{"step":1,"instruction":"Warm milk in a small saucepan."},{"step":2,"instruction":"Whisk in turmeric, cinnamon, ginger, black pepper, and honey."},{"step":3,"instruction":"Pour into mug and enjoy warm."}]',
 'Curcumin in turmeric can cross the blood-brain barrier and support brain health and mood.',
 ARRAY['mood-boost','anti-inflammatory','calming'], false, false),

('Simple Salmon Sushi Bowl',
 'general', ARRAY['hormonal-health','skin-concerns'],
 15, 0, 1, 'easy',
 '[{"amount":"200g","item":"fresh salmon, cubed"},{"amount":"1 cup","item":"sushi rice, cooked"},{"amount":"1","item":"avocado, sliced"},{"amount":"1","item":"cucumber, sliced"},{"amount":"1 sheet","item":"nori, torn"},{"amount":"2 tbsp","item":"soy sauce"},{"amount":"1 tsp","item":"sesame oil"},{"amount":"1/2 tsp","item":"chilli flakes"}]',
 '[{"step":1,"instruction":"Mix cubed salmon with soy sauce, sesame oil, and chilli flakes."},{"step":2,"instruction":"Assemble bowl: rice, salmon, avocado, cucumber, nori."},{"step":3,"instruction":"Serve immediately."}]',
 'Salmon provides astaxanthin for skin health and EPA/DHA for hormone balance.',
 ARRAY['omega-3','skin-glow','quick-meal'], false, false);

-- ============================================================
-- MIGRATION: 008_monetisation.sql
-- ============================================================

-- ============================================================
-- PHASE 4: MONETISATION & GROWTH ENGINE
-- ============================================================

-- ============================================================
-- SUBSCRIPTION TIERS
-- ============================================================

create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price_cents int default 0,
  billing_period text default 'monthly',
  features jsonb,
  is_active boolean default true,
  sort_order int default 0
);

insert into subscription_plans (name, slug, price_cents, billing_period, features, sort_order) values
('Sista Free',    'free',    0,     'monthly',
 '["cycle_tracking","symptom_guide","community_read","ai_chat_5_per_day","recipes_browse","diy_browse"]', 1),
('Sista Premium', 'premium', 9900,  'monthly',
 '["cycle_tracking","symptom_guide","community_full","ai_chat_unlimited","recipes_browse","recipes_save_unlimited","diy_browse","diy_upload","creator_page","wellness_hub_full","anon_questions","weekly_report","priority_support"]', 2),
('Sista Gold',    'gold',    19900, 'monthly',
 '["everything_in_premium","creator_verified_badge","featured_directory_listing","early_access","personal_wellness_coach_ai","business_listing_1_free"]', 3);

insert into subscription_plans (name, slug, price_cents, billing_period, features, sort_order) values
('Sista Premium Yearly', 'premium_yearly', 99000, 'yearly',
 '["cycle_tracking","symptom_guide","community_full","ai_chat_unlimited","recipes_browse","recipes_save_unlimited","diy_browse","diy_upload","creator_page","wellness_hub_full","anon_questions","weekly_report","priority_support"]', 4),
('Sista Gold Yearly',    'gold_yearly',    199000, 'yearly',
 '["everything_in_premium","creator_verified_badge","featured_directory_listing","early_access","personal_wellness_coach_ai","business_listing_1_free"]', 5);

-- User subscriptions
create table user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  plan_id uuid references subscription_plans(id),
  status text default 'active' check (status in ('active','cancelled','expired','pending')),
  started_at timestamptz default now(),
  expires_at timestamptz,
  yoco_payment_id text,
  yoco_subscription_token text,
  cancel_reason text,
  created_at timestamptz default now()
);

alter table profiles add column if not exists
  subscription_plan text default 'free' references subscription_plans(slug);

alter table profiles add column if not exists
  subscription_expires_at timestamptz;

-- ============================================================
-- STREAK SYSTEM
-- ============================================================

alter table profiles add column if not exists current_streak int default 0;
alter table profiles add column if not exists longest_streak int default 0;
alter table profiles add column if not exists last_active_date date;
alter table profiles add column if not exists total_active_days int default 0;

create table streak_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  date date not null,
  activities text[],
  unique(user_id, date)
);

-- ============================================================
-- WEEKLY WELLNESS REPORTS
-- ============================================================

create table wellness_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  week_start date not null,
  week_end date not null,
  cycle_phase text,
  avg_mood text,
  symptoms_logged text[],
  top_recipes_viewed text[],
  ai_chat_count int default 0,
  community_posts int default 0,
  report_html text,
  generated_at timestamptz default now(),
  unique(user_id, week_start)
);

-- ============================================================
-- VERIFIED CREATOR PROGRAMME
-- ============================================================

create table creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  creator_page_id uuid references creator_pages(id),
  follower_count_at_apply int,
  post_count_at_apply int,
  motivation text,
  social_links jsonb,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references profiles(id),
  review_notes text,
  applied_at timestamptz default now(),
  reviewed_at timestamptz
);

-- ============================================================
-- FEATURED BUSINESS LISTINGS
-- ============================================================

alter table local_businesses add column if not exists
  listing_tier text default 'free' check (listing_tier in ('free','featured','premium'));

alter table local_businesses add column if not exists
  featured_until date;

alter table local_businesses add column if not exists
  listing_price_paid_cents int default 0;

-- ============================================================
-- PUSH NOTIFICATIONS
-- ============================================================

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  endpoint text not null,
  p256dh text,
  auth_key text,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

create table notification_preferences (
  user_id uuid references profiles(id) primary key,
  period_reminder boolean default true,
  period_days_before int default 2,
  weekly_report boolean default true,
  community_replies boolean default true,
  new_followers boolean default true,
  product_promotions boolean default false,
  streak_reminders boolean default true
);

-- ============================================================
-- BUSINESS LISTING TIER PRICING
-- ============================================================

create table listing_pricing (
  id uuid primary key default gen_random_uuid(),
  tier text unique not null,     -- 'free' / 'featured' / 'premium'
  name text not null,            -- 'Free' / 'Featured' / 'Premium'
  price_cents int default 0,     -- R0 / R29900 / R69900
  benefits jsonb,                -- description of what each tier includes
  is_active boolean default true,
  sort_order int default 0
);

insert into listing_pricing (tier, name, price_cents, benefits, sort_order) values
('free',     'Free',     0,     '["Basic listing","Community reviews"]', 1),
('featured', 'Featured', 29900, '["Top of category","Highlighted card","Bold border"]', 2),
('premium',  'Premium',  69900, '["Featured placement","Homepage placement","Sista Approved badge"]', 3);

-- ============================================================
-- RLS
-- ============================================================

alter table user_subscriptions enable row level security;
alter table streak_log enable row level security;
alter table wellness_reports enable row level security;
alter table push_subscriptions enable row level security;
alter table notification_preferences enable row level security;
alter table listing_pricing enable row level security;


-- ============================================================
-- MIGRATION: 009_growth.sql
-- ============================================================

-- ============================================================
-- PHASE 5: THE GROWTH MACHINE
-- ============================================================

-- ============================================================
-- AI WELLNESS COACH
-- ============================================================

create table wellness_profiles (
  user_id uuid references profiles(id) primary key,
  primary_goals text[],
  health_conditions text[],
  dietary_preferences text[],
  fitness_level text,
  stress_level text,
  sleep_quality text,
  age_range text,
  life_stage text,
  coach_name text default 'Sista',
  coach_tone text default 'warm',
  daily_checkin_time time,
  updated_at timestamptz default now()
);

create table coach_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  checkin_date date not null,
  mood_score int check (mood_score between 1 and 5),
  energy_score int check (energy_score between 1 and 5),
  sleep_hours numeric(4,1),
  water_glasses int,
  exercise_done boolean default false,
  symptoms_today text[],
  notes text,
  coach_message text,
  coach_tips text[],
  generated_at timestamptz,
  unique(user_id, checkin_date)
);

create table coach_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  plan_type text,
  title text,
  description text,
  duration_days int,
  start_date date,
  end_date date,
  plan_content jsonb,
  progress_percent int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- AFFILIATE MARKETING SYSTEM
-- ============================================================

create table affiliate_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  slug text unique not null,
  link_type text default 'general',
  target_product_id uuid references products(id),
  click_count int default 0,
  conversion_count int default 0,
  total_commission_cents int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_link_id uuid references affiliate_links(id),
  referrer_user_id uuid references profiles(id),
  converted_user_id uuid references profiles(id),
  conversion_type text,
  order_value_cents int default 0,
  commission_cents int default 0,
  commission_rate numeric(5,4),
  status text default 'pending' check (status in ('pending','confirmed','paid','reversed')),
  confirmed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Admin-editable affiliate commission rates
create table affiliate_commission_rates (
  id uuid primary key default gen_random_uuid(),
  conversion_type text unique not null,
  display_name text not null,
  rate_type text not null check (rate_type in ('fixed_cents','percentage')),
  fixed_cents int default 0,
  percentage numeric(5,4) default 0,
  is_active boolean default true,
  updated_at timestamptz default now()
);

insert into affiliate_commission_rates (conversion_type, display_name, rate_type, fixed_cents, percentage) values
('signup', 'New User Signup', 'fixed_cents', 500, 0),
('subscription', 'Premium/Gold Subscription', 'percentage', 0, 0.1500),
('product_purchase', 'Marketplace Product Purchase', 'percentage', 0, 0.1000),
('business_listing', 'Business Directory Listing', 'fixed_cents', 5000, 0);

-- ============================================================
-- BRAND PARTNERSHIPS
-- ============================================================

create table brand_partners (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  brand_logo_url text,
  contact_name text,
  contact_email text,
  website_url text,
  category text,
  partnership_tier text default 'standard',
  monthly_fee_cents int default 0,
  contract_start date,
  contract_end date,
  is_active boolean default true,
  notes text,
  created_at timestamptz default now()
);

create table brand_campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brand_partners(id),
  campaign_name text,
  campaign_type text,
  target_conditions text[],
  target_age_ranges text[],
  content_html text,
  placement text,
  start_date date,
  end_date date,
  impression_count int default 0,
  click_count int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- CREATOR EARNINGS
-- ============================================================

create table creator_earnings (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creator_pages(id),
  month date,
  affiliate_referrals int default 0,
  affiliate_earnings_cents int default 0,
  brand_collab_earnings_cents int default 0,
  gross_earnings_cents int default 0,
  platform_fee_cents int default 0,
  net_earnings_cents int default 0,
  payout_status text default 'pending' check (payout_status in ('pending','processing','paid')),
  payout_date date,
  created_at timestamptz default now(),
  unique(creator_id, month)
);

-- ============================================================
-- ONBOARDING FUNNEL
-- ============================================================

create table onboarding_progress (
  user_id uuid references profiles(id) primary key,
  step_completed int default 0,
  steps_done text[],
  completed_at timestamptz,
  skip_count int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- SA CITY LOCALISATION
-- ============================================================

create table local_content (
  id uuid primary key default gen_random_uuid(),
  city text,
  province text,
  content_type text,
  title text,
  description text,
  url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table profiles add column if not exists city text;
alter table profiles add column if not exists province text;
alter table community_groups add column if not exists city_tag text;

insert into community_groups (name, description, icon, city_tag) values
('Cape Town Sistas', 'Connect with women in Cape Town and surrounds', '🏔️', 'Cape Town'),
('Joburg Sistas', 'Your wellness community in the City of Gold', '🌆', 'Johannesburg'),
('Durban Sistas', 'Connecting women on the KZN coast', '🌊', 'Durban'),
('Pretoria Sistas', 'Wellness in Tshwane', '🌸', 'Pretoria'),
('Gqeberha Sistas', 'Eastern Cape women supporting each other', '🌿', 'Gqeberha');

-- ============================================================
-- RLS
-- ============================================================

alter table wellness_profiles enable row level security;
alter table coach_checkins enable row level security;
alter table coach_plans enable row level security;
alter table affiliate_links enable row level security;
alter table affiliate_conversions enable row level security;
alter table affiliate_commission_rates enable row level security;
alter table brand_campaigns enable row level security;
alter table creator_earnings enable row level security;
alter table local_content enable row level security;

-- ============================================================
-- CREATE ADMIN USER
-- ============================================================

UPDATE profiles SET role = 'admin' WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'enricoh06@gmail.com'
);

-- If user doesn't have a profile yet:
INSERT INTO profiles (id, display_name, role, loyalty_points)
SELECT id, 'Enrico', 'admin', 0 FROM auth.users
WHERE email = 'enricoh06@gmail.com'
AND id NOT IN (SELECT id FROM profiles);
