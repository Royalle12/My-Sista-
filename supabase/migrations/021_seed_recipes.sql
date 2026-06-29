-- ============================================================
-- Migration 021: Seed Recipes
-- My Sista — Happy Splurge (Pty) Ltd
-- Purpose: Create public.recipes if not exists, add new fields,
--          and seed 50 unique recipes (IDs 51-100).
-- ============================================================

-- ─── CREATE TABLE IF NOT EXISTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recipes (
  id          INTEGER PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT,
  description TEXT,
  prep_time   INTEGER,
  cook_time   INTEGER,
  servings    INTEGER,
  ingredients TEXT[] DEFAULT '{}',
  instructions TEXT[] DEFAULT '{}',
  sista_tip   TEXT DEFAULT NULL
);

-- Enable RLS on recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Recipes are publicly readable'
  ) THEN
    CREATE POLICY "Recipes are publicly readable" ON public.recipes FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'Admins manage recipes'
  ) THEN
    CREATE POLICY "Admins manage recipes" ON public.recipes FOR ALL USING (
      (auth.jwt() ->> 'role' = 'admin') OR
      (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
    );
  END IF;
END
$$;

-- ─── ALTER TABLE TO ADD ALL COLUMNS ──────────────────────────────────────────
ALTER TABLE public.recipes 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS prep_time INTEGER,
  ADD COLUMN IF NOT EXISTS cook_time INTEGER,
  ADD COLUMN IF NOT EXISTS servings INTEGER,
  ADD COLUMN IF NOT EXISTS ingredients TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS instructions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sista_tip TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS image_prompt TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS calories INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS protein INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS carbs INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fat INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Easy',
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- ─── SEED DATA ────────────────────────────────────────────────────────────────
INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  51,
  'Iron Boosting Beef & Lentil Winter Stew',
  'Periods',
  'Rich in iron and protein to support energy levels during menstruation.',
  15,
  90,
  4,
  ARRAY['500g lean beef cubes', '1 cup brown lentils', '2 carrots diced', '1 onion chopped', '2 cloves garlic', '4 cups beef stock', '1 tsp paprika', 'Salt and pepper']::TEXT[],
  ARRAY['Brown beef in a pot.', 'Add onions and garlic and sauté.', 'Add remaining ingredients.', 'Simmer for 90 minutes.', 'Serve hot.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  52,
  'Warm Cinnamon Oat & Berry Breakfast Bowl',
  'Hormonal Balance',
  'Supports blood sugar stability and hormone health.',
  5,
  10,
  2,
  ARRAY['1 cup oats', '2 cups almond milk', '1 tsp cinnamon', '1 cup mixed berries', '1 tbsp flaxseed']::TEXT[],
  ARRAY['Cook oats with almond milk.', 'Add cinnamon.', 'Top with berries and flaxseed.', 'Serve warm.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  53,
  'Collagen Chicken Bone Broth Soup',
  'Skin & Hair',
  'Nourishing broth rich in collagen-supporting nutrients.',
  20,
  180,
  6,
  ARRAY['1 whole chicken carcass', '2 carrots', '2 celery stalks', '1 onion', '3 litres water', 'Parsley']::TEXT[],
  ARRAY['Combine all ingredients.', 'Simmer for 3 hours.', 'Strain broth.', 'Serve warm.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  54,
  'Creamy Pumpkin Sage Soup',
  'Stress Relief',
  'Comforting winter soup rich in magnesium and antioxidants.',
  15,
  40,
  4,
  ARRAY['500g pumpkin', '1 onion', '2 cups vegetable stock', '1 tsp sage', '100ml cream']::TEXT[],
  ARRAY['Cook pumpkin and onion.', 'Add stock and simmer.', 'Blend smooth.', 'Stir in cream and sage.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  55,
  'Turmeric Salmon with Roasted Vegetables',
  'Perimenopause',
  'Omega-3 rich meal supporting hormonal transitions.',
  15,
  25,
  2,
  ARRAY['2 salmon fillets', '1 tsp turmeric', '1 zucchini', '1 carrot', '1 sweet potato', 'Olive oil']::TEXT[],
  ARRAY['Season salmon with turmeric.', 'Roast vegetables.', 'Bake salmon for 15 minutes.', 'Serve together.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  56,
  'Phytoestrogen Lentil Shepherd''s Pie',
  'Menopause',
  'Plant-based comfort food rich in fibre.',
  20,
  50,
  6,
  ARRAY['2 cups cooked lentils', '1 onion', '2 carrots', '4 potatoes', 'Vegetable stock']::TEXT[],
  ARRAY['Cook vegetables and lentils.', 'Prepare mashed potatoes.', 'Layer in baking dish.', 'Bake until golden.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  57,
  'Winter Wellness Chicken & Ginger Noodle Soup',
  'Wellbeing',
  'Immune-supportive soup perfect for cold days.',
  15,
  35,
  4,
  ARRAY['2 chicken breasts', '1 thumb ginger', '100g noodles', '1 litre stock', 'Spring onions']::TEXT[],
  ARRAY['Cook chicken in stock.', 'Add ginger and noodles.', 'Simmer until noodles are tender.', 'Garnish and serve.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  58,
  'Low Carb Cauliflower & Chicken Bake',
  'Weight Loss',
  'High protein and low carbohydrate winter dinner.',
  15,
  35,
  4,
  ARRAY['1 cauliflower', '2 chicken breasts', '100g Greek yogurt', '1 tsp garlic powder', 'Cheese sprinkle']::TEXT[],
  ARRAY['Steam cauliflower.', 'Cook chicken and shred.', 'Mix ingredients.', 'Bake until golden.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  59,
  'Mood Supporting Sweet Potato & Black Bean Chili',
  'Recovery & Depression Support',
  'Rich in fibre, complex carbs and plant protein.',
  15,
  45,
  6,
  ARRAY['2 sweet potatoes', '2 cans black beans', '1 onion', '2 tomatoes', 'Chili spices']::TEXT[],
  ARRAY['Cook onion and spices.', 'Add vegetables and beans.', 'Simmer 45 minutes.', 'Serve warm.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  60,
  'Dark Chocolate Walnut Energy Porridge',
  'Recovery & Depression Support',
  'Comforting breakfast rich in magnesium and healthy fats.',
  5,
  10,
  2,
  ARRAY['1 cup oats', '2 cups milk', '20g dark chocolate', '2 tbsp walnuts', '1 tsp honey']::TEXT[],
  ARRAY['Cook oats.', 'Stir in chocolate.', 'Top with walnuts and honey.', 'Serve warm.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  61,
  'Spinach & Chickpea Iron Power Curry',
  'Periods',
  'Iron-rich vegetarian curry to support healthy energy levels.',
  15,
  35,
  4,
  ARRAY['2 cans chickpeas', '4 cups spinach', '1 onion', '2 tomatoes', '1 tbsp curry powder', '1 cup coconut milk']::TEXT[],
  ARRAY['Sauté onion until soft.', 'Add curry powder and tomatoes.', 'Stir in chickpeas and coconut milk.', 'Simmer 20 minutes.', 'Add spinach and cook until wilted.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  62,
  'Roasted Beetroot & Quinoa Nourish Bowl',
  'Hormonal Balance',
  'Balanced meal rich in fibre and plant nutrients.',
  15,
  35,
  4,
  ARRAY['2 beetroot', '1 cup quinoa', '1 avocado', 'Rocket leaves', 'Olive oil', 'Lemon juice']::TEXT[],
  ARRAY['Roast beetroot until tender.', 'Cook quinoa.', 'Assemble ingredients in bowls.', 'Dress with olive oil and lemon.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  63,
  'Avocado Egg & Pumpkin Seed Breakfast Toast',
  'Skin & Hair',
  'Healthy fats and zinc support skin and hair health.',
  10,
  8,
  2,
  ARRAY['2 slices wholegrain bread', '1 avocado', '2 eggs', '2 tbsp pumpkin seeds', 'Black pepper']::TEXT[],
  ARRAY['Toast bread.', 'Cook eggs to preference.', 'Mash avocado onto toast.', 'Top with eggs and seeds.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  64,
  'Chamomile Pear Crumble',
  'Stress Relief',
  'Warm dessert inspired by calming herbal tea.',
  20,
  35,
  6,
  ARRAY['4 pears', '1 cup oats', '2 tbsp honey', '1 chamomile tea bag', '2 tbsp butter']::TEXT[],
  ARRAY['Slice pears into baking dish.', 'Infuse tea and drizzle over pears.', 'Combine oats, butter and honey.', 'Bake until golden.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  65,
  'Mackerel & Sweet Potato Winter Tray Bake',
  'Perimenopause',
  'Omega-3 rich meal supporting overall wellbeing.',
  15,
  40,
  4,
  ARRAY['4 mackerel fillets', '2 sweet potatoes', '1 red onion', 'Olive oil', 'Rosemary']::TEXT[],
  ARRAY['Slice vegetables.', 'Arrange on tray.', 'Roast 25 minutes.', 'Add fish and cook 15 minutes more.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  66,
  'Soy & Sesame Vegetable Stir Fry',
  'Menopause',
  'Plant-based meal containing natural phytoestrogens.',
  15,
  15,
  4,
  ARRAY['Broccoli florets', 'Carrot strips', 'Snow peas', '2 tbsp soy sauce', '1 tbsp sesame seeds', 'Tofu cubes']::TEXT[],
  ARRAY['Stir fry vegetables.', 'Add tofu and soy sauce.', 'Cook until heated through.', 'Sprinkle with sesame seeds.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  67,
  'Garlic Chicken & Barley Winter Pot',
  'Wellbeing',
  'Hearty one-pot meal for cold evenings.',
  15,
  60,
  6,
  ARRAY['500g chicken thighs', '1 cup pearl barley', '1 onion', '2 carrots', '4 cups chicken stock']::TEXT[],
  ARRAY['Brown chicken.', 'Add vegetables.', 'Add barley and stock.', 'Simmer until barley is tender.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  68,
  'Lemon Herb Turkey Meatballs',
  'Weight Loss',
  'Lean protein meal packed with flavour.',
  20,
  25,
  4,
  ARRAY['500g turkey mince', '1 egg', 'Parsley', 'Lemon zest', 'Garlic']::TEXT[],
  ARRAY['Combine ingredients.', 'Form meatballs.', 'Bake until cooked through.', 'Serve with vegetables.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  69,
  'Banana Walnut Mood Muffins',
  'Recovery & Depression Support',
  'Wholesome snack rich in fibre and healthy fats.',
  15,
  22,
  12,
  ARRAY['2 ripe bananas', '2 eggs', '1 cup oat flour', '1/2 cup walnuts', '1 tsp cinnamon']::TEXT[],
  ARRAY['Mash bananas.', 'Mix all ingredients.', 'Fill muffin tray.', 'Bake until golden.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  70,
  'Turkey & Vegetable Recovery Soup',
  'Recovery & Depression Support',
  'Protein-rich soup with comforting winter vegetables.',
  15,
  50,
  6,
  ARRAY['400g turkey breast', '2 carrots', '2 celery stalks', '1 onion', '1 litre stock']::TEXT[],
  ARRAY['Cook turkey in stock.', 'Add vegetables.', 'Simmer until tender.', 'Shred turkey and serve.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  71,
  'Moroccan Lamb & Apricot Tagine',
  'Periods',
  'Iron-rich lamb slow-cooked with warming spices and dried apricots.',
  20,
  120,
  6,
  ARRAY['700g lamb cubes', '1 onion', '1 cup dried apricots', '2 carrots', '1 tsp cinnamon', '1 tsp cumin', '2 cups stock']::TEXT[],
  ARRAY['Brown lamb and onions.', 'Add spices and vegetables.', 'Pour in stock.', 'Simmer for 2 hours.', 'Add apricots during the final 30 minutes.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  72,
  'Apple Cinnamon Chia Breakfast Pudding',
  'Hormonal Balance',
  'Fibre-rich breakfast supporting stable energy and hormone balance.',
  10,
  0,
  2,
  ARRAY['4 tbsp chia seeds', '1 cup almond milk', '1 apple diced', '1 tsp cinnamon', '1 tsp honey']::TEXT[],
  ARRAY['Mix chia seeds and milk.', 'Refrigerate overnight.', 'Top with apple, cinnamon and honey before serving.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  73,
  'Rainbow Vegetable Frittata',
  'Skin & Hair',
  'Packed with vitamins and protein for healthy skin and hair.',
  15,
  25,
  4,
  ARRAY['6 eggs', '1 red pepper', '1 zucchini', '1 cup spinach', '1 onion', '50g feta']::TEXT[],
  ARRAY['Sauté vegetables.', 'Whisk eggs and pour over vegetables.', 'Top with feta.', 'Bake until set.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  74,
  'Lavender Honey Baked Oats',
  'Stress Relief',
  'A comforting breakfast with calming floral notes.',
  10,
  30,
  6,
  ARRAY['2 cups oats', '2 cups milk', '2 tbsp honey', '1 tsp culinary lavender', '2 eggs']::TEXT[],
  ARRAY['Mix all ingredients.', 'Pour into baking dish.', 'Bake until golden.', 'Serve warm.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  75,
  'Roasted Sardine & Vegetable Medley',
  'Perimenopause',
  'Rich in calcium, omega-3 fats and winter vegetables.',
  15,
  30,
  4,
  ARRAY['8 sardines', '1 butternut', '1 red onion', '1 zucchini', 'Olive oil', 'Lemon']::TEXT[],
  ARRAY['Roast vegetables.', 'Add sardines during final 12 minutes.', 'Finish with fresh lemon.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  76,
  'Edamame & Brown Rice Buddha Bowl',
  'Menopause',
  'Plant-based bowl rich in fibre and phytoestrogens.',
  20,
  30,
  4,
  ARRAY['1 cup brown rice', '1 cup edamame beans', '1 carrot', '1 cucumber', 'Sesame dressing']::TEXT[],
  ARRAY['Cook rice.', 'Prepare vegetables.', 'Assemble bowls.', 'Drizzle with dressing.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  77,
  'Slow Cooker Beef & Root Vegetable Pot',
  'Wellbeing',
  'Traditional winter comfort food packed with flavour.',
  20,
  480,
  6,
  ARRAY['700g stewing beef', '2 carrots', '2 parsnips', '2 potatoes', '1 onion', '500ml stock']::TEXT[],
  ARRAY['Place ingredients into slow cooker.', 'Cook on low for 8 hours.', 'Season and serve.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  78,
  'Mediterranean Stuffed Peppers',
  'Weight Loss',
  'Low-calorie meal filled with lean protein and vegetables.',
  20,
  35,
  4,
  ARRAY['4 bell peppers', '300g lean turkey mince', '1 tomato', '1 onion', 'Parsley']::TEXT[],
  ARRAY['Cook filling ingredients.', 'Stuff peppers.', 'Bake until peppers soften.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  79,
  'Cocoa Almond Recovery Smoothie Bowl',
  'Recovery & Depression Support',
  'Magnesium-rich breakfast supporting mood and recovery.',
  10,
  0,
  2,
  ARRAY['1 banana', '1 tbsp cocoa', '1 cup yogurt', '2 tbsp almonds', '1 tsp honey']::TEXT[],
  ARRAY['Blend banana, cocoa and yogurt.', 'Pour into bowls.', 'Top with almonds and honey.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  80,
  'Baked Sweet Potato & Tahini Comfort Bowl',
  'Recovery & Depression Support',
  'A nourishing meal rich in complex carbohydrates and healthy fats.',
  15,
  45,
  4,
  ARRAY['4 sweet potatoes', '2 tbsp tahini', '1 can chickpeas', 'Parsley', 'Lemon juice']::TEXT[],
  ARRAY['Bake sweet potatoes until tender.', 'Warm chickpeas.', 'Mix tahini and lemon.', 'Serve topped with chickpeas and dressing.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  81,
  'Golden Turmeric Chicken Soup',
  'Wellbeing',
  'Immune-supporting winter soup packed with warming spices.',
  15,
  50,
  6,
  ARRAY['2 chicken breasts', '1 onion', '2 carrots', '1 tsp turmeric', '1 litre chicken stock', 'Fresh parsley']::TEXT[],
  ARRAY['Cook onion and carrots.', 'Add stock and turmeric.', 'Add chicken and simmer.', 'Shred chicken.', 'Garnish with parsley.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  82,
  'Warm Quinoa Berry Breakfast Bake',
  'Hormonal Balance',
  'Protein-rich breakfast supporting stable energy levels.',
  15,
  35,
  6,
  ARRAY['1 cup quinoa', '1 cup berries', '2 eggs', '1 cup milk', '1 tsp vanilla']::TEXT[],
  ARRAY['Cook quinoa.', 'Mix with remaining ingredients.', 'Bake until set.', 'Serve warm.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  83,
  'Rosemary Beef & Mushroom Casserole',
  'Periods',
  'Iron-rich comfort food ideal for colder months.',
  20,
  120,
  6,
  ARRAY['700g beef cubes', '250g mushrooms', '1 onion', '2 tsp rosemary', '500ml beef stock']::TEXT[],
  ARRAY['Brown beef.', 'Add vegetables and stock.', 'Bake covered for 2 hours.', 'Serve hot.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  84,
  'Coconut Pumpkin Recovery Curry',
  'Recovery & Depression Support',
  'Comforting curry rich in fibre and warming flavours.',
  15,
  40,
  4,
  ARRAY['500g pumpkin', '1 onion', '1 can coconut milk', '1 tbsp curry powder', 'Fresh coriander']::TEXT[],
  ARRAY['Cook onion and spices.', 'Add pumpkin and coconut milk.', 'Simmer until tender.', 'Finish with coriander.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  85,
  'Broccoli & Walnut Hair Health Pasta',
  'Skin & Hair',
  'Nutrient-rich meal supporting healthy hair growth.',
  15,
  20,
  4,
  ARRAY['300g wholewheat pasta', '1 broccoli', '1/2 cup walnuts', 'Olive oil', 'Parmesan']::TEXT[],
  ARRAY['Cook pasta.', 'Steam broccoli.', 'Combine with walnuts and olive oil.', 'Top with parmesan.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  86,
  'Warm Vanilla Rooibos Rice Pudding',
  'Stress Relief',
  'Comforting South African inspired winter dessert.',
  10,
  45,
  6,
  ARRAY['1 cup rice', '3 cups rooibos tea', '1 cup milk', '1 tsp vanilla', 'Honey']::TEXT[],
  ARRAY['Cook rice in rooibos tea.', 'Add milk and vanilla.', 'Simmer until creamy.', 'Sweeten with honey.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  87,
  'Sesame Ginger Salmon Bowl',
  'Perimenopause',
  'Omega-3 rich meal supporting hormonal wellbeing.',
  15,
  25,
  4,
  ARRAY['4 salmon fillets', '1 tbsp sesame seeds', '1 tsp ginger', 'Brown rice', 'Cucumber']::TEXT[],
  ARRAY['Bake salmon.', 'Cook rice.', 'Assemble bowls.', 'Top with sesame and ginger.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  88,
  'Tofu & Miso Winter Broth',
  'Menopause',
  'Plant-based soup rich in minerals and phytoestrogens.',
  10,
  20,
  4,
  ARRAY['200g tofu', '2 tbsp miso paste', 'Spring onions', 'Mushrooms', '1 litre water']::TEXT[],
  ARRAY['Bring water to simmer.', 'Add miso and mushrooms.', 'Add tofu.', 'Serve with spring onions.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  89,
  'Spiced Turkey & Cauliflower Skillet',
  'Weight Loss',
  'Low-carb meal packed with lean protein.',
  15,
  25,
  4,
  ARRAY['500g turkey mince', '1 cauliflower', '1 onion', 'Paprika', 'Garlic']::TEXT[],
  ARRAY['Cook turkey.', 'Add cauliflower and spices.', 'Cook until tender.', 'Serve immediately.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  90,
  'Dark Chocolate Cherry Wellness Muffins',
  'Wellbeing',
  'A wholesome winter snack rich in antioxidants.',
  15,
  25,
  12,
  ARRAY['1 cup wholewheat flour', '1/2 cup cherries', '50g dark chocolate', '2 eggs', '1 tsp baking powder']::TEXT[],
  ARRAY['Mix ingredients.', 'Fill muffin tray.', 'Bake until cooked through.', 'Cool before serving.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  91,
  'Red Lentil & Spinach Nourish Soup',
  'Periods',
  'Iron-rich vegetarian soup designed to support energy and wellbeing during menstruation.',
  15,
  40,
  6,
  ARRAY['1 cup red lentils', '4 cups spinach', '1 onion', '2 carrots', '1 litre vegetable stock', '1 tsp cumin']::TEXT[],
  ARRAY['Sauté onion and carrots.', 'Add lentils, stock and cumin.', 'Simmer until lentils soften.', 'Stir in spinach.', 'Blend partially and serve.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  92,
  'Maple Pecan Protein Overnight Oats',
  'Hormonal Balance',
  'Balanced breakfast combining fibre, healthy fats and protein.',
  10,
  0,
  2,
  ARRAY['1 cup oats', '1 cup Greek yogurt', '1 tbsp maple syrup', '2 tbsp pecans', '1 tbsp chia seeds']::TEXT[],
  ARRAY['Combine all ingredients.', 'Mix thoroughly.', 'Refrigerate overnight.', 'Serve chilled.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  93,
  'Roasted Red Pepper & Egg Shakshuka',
  'Skin & Hair',
  'Protein and antioxidant-rich breakfast supporting healthy skin.',
  15,
  25,
  4,
  ARRAY['6 eggs', '2 roasted red peppers', '1 onion', '2 tomatoes', 'Paprika', 'Parsley']::TEXT[],
  ARRAY['Cook onion and tomatoes.', 'Add peppers and spices.', 'Create wells and crack in eggs.', 'Cover until eggs are set.', 'Garnish with parsley.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  94,
  'Creamy Mushroom & Thyme Pot Pie',
  'Stress Relief',
  'A comforting winter meal with earthy flavours and a golden crust.',
  25,
  45,
  6,
  ARRAY['400g mushrooms', '1 onion', '2 tsp thyme', '200ml cream', '1 sheet puff pastry']::TEXT[],
  ARRAY['Cook mushrooms and onion.', 'Add cream and thyme.', 'Transfer to baking dish.', 'Cover with pastry.', 'Bake until golden.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  95,
  'Baked Trout with Lemon Herb Vegetables',
  'Perimenopause',
  'Omega-3 rich fish meal paired with seasonal vegetables.',
  15,
  30,
  4,
  ARRAY['4 trout fillets', '1 zucchini', '2 carrots', '1 lemon', 'Fresh dill', 'Olive oil']::TEXT[],
  ARRAY['Arrange vegetables on tray.', 'Add trout fillets.', 'Season with lemon and dill.', 'Bake until fish flakes easily.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  96,
  'Warm Tofu Peanut Noodle Bowl',
  'Menopause',
  'Plant-based meal rich in protein and natural phytoestrogens.',
  20,
  20,
  4,
  ARRAY['250g tofu', '200g rice noodles', '2 tbsp peanut butter', '1 carrot', 'Spring onions', 'Soy sauce']::TEXT[],
  ARRAY['Cook noodles.', 'Brown tofu.', 'Mix peanut butter and soy sauce.', 'Combine all ingredients.', 'Serve warm.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  97,
  'Winter Vegetable Minestrone',
  'Wellbeing',
  'A nourishing Italian-inspired soup packed with vegetables.',
  20,
  50,
  6,
  ARRAY['1 onion', '2 carrots', '2 celery stalks', '1 can beans', '1 can tomatoes', '1 litre vegetable stock', '100g pasta']::TEXT[],
  ARRAY['Cook vegetables until softened.', 'Add tomatoes and stock.', 'Add beans and pasta.', 'Simmer until pasta is tender.', 'Serve hot.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  98,
  'Chicken Zucchini Meatball Soup',
  'Weight Loss',
  'Light but filling soup packed with lean protein.',
  20,
  35,
  4,
  ARRAY['500g chicken mince', '1 zucchini grated', '1 egg', '1 litre chicken stock', 'Parsley']::TEXT[],
  ARRAY['Mix chicken, zucchini and egg.', 'Form small meatballs.', 'Simmer in stock until cooked.', 'Garnish with parsley.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  99,
  'Orange Almond Mood Cake',
  'Recovery & Depression Support',
  'A naturally sweet cake rich in healthy fats and citrus flavour.',
  20,
  40,
  10,
  ARRAY['2 oranges', '2 cups almond flour', '3 eggs', '2 tbsp honey', '1 tsp baking powder']::TEXT[],
  ARRAY['Blend cooked oranges.', 'Mix with remaining ingredients.', 'Pour into cake tin.', 'Bake until set.', 'Cool before slicing.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

INSERT INTO public.recipes (
  id, title, category, description, prep_time, cook_time, servings, ingredients, instructions,
  image_url, thumbnail_url, image_prompt, calories, protein, carbs, fat, tags, difficulty, featured
) VALUES (
  100,
  'Turkey & Sweet Potato Cottage Pie',
  'Recovery & Depression Support',
  'A hearty winter comfort meal rich in protein and complex carbohydrates.',
  25,
  50,
  6,
  ARRAY['500g turkey mince', '4 sweet potatoes', '1 onion', '2 carrots', '250ml stock']::TEXT[],
  ARRAY['Cook turkey and vegetables.', 'Prepare sweet potato mash.', 'Layer filling and mash.', 'Bake until golden.', 'Serve warm.']::TEXT[],
  NULL,
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '{}'::TEXT[],
  'Easy',
  FALSE
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  prep_time = EXCLUDED.prep_time,
  cook_time = EXCLUDED.cook_time,
  servings = EXCLUDED.servings,
  ingredients = EXCLUDED.ingredients,
  instructions = EXCLUDED.instructions;

