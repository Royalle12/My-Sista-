# Conversation Handover Log — My Sista Wellness App

This file is a living document that tracks completed work, technical decisions, and pending tasks so that any incoming agent can immediately resume implementation.

> **Note for incoming agents**: Set your active workspace to `C:\Users\User\.gemini\antigravity\scratch\my-sista` and read this file before starting any work.

---

## 🌸 Completed Features (Batch 1: Authentication & Onboarding)

1. **Database Schema (`supabase/schema.sql`)**:
   - Added `pronouns`, `province`, and `language_preference` fields to the `profiles` table.
   - Updated CHECK constraints to allow `'free'`, `'sista'`, and `'sista_plus'` tiers (removing `'sista_pro'`).
2. **Subscription Tier Mapping (`src/lib/yoco.js`)**:
   - Renamed internally: `sista` ➔ **Sista Premium**, `sista_plus` ➔ **Sista Gold**.
   - Completely deleted legacy `sista_pro` tiers.
3. **Guest Session Mock (`src/store/authStore.js` / `src/hooks/useAuth.js`)**:
   - Added `isGuest` state and `loginAsGuest()` hook action.
   - Bypasses onboarding for guests and blocks all writes to Supabase database.
4. **Theme & CSS Tokens (`src/index.css`)**:
   - Palette: `#4A5342` (Rosemary Green), `#F8E0DD` (Blush Pink).
   - Added helper utilities: `text-3xs`, `bg-soft`, `bg-blush`.
5. **Brand Entrance Splash (`src/pages/Landing.jsx`)**:
   - Dark Sanctuary theme, floating particles, guest login bypass path, official `my_sista_logo.jpg` asset.
6. **Authentication Panel (`src/pages/Auth.jsx`)**:
   - Premium tabbed Login / Signup card with a password strength meter and Forgot Password utility.
7. **OTP Verification Gate (`src/pages/Verify.jsx`)**:
   - 6-digit numeric input with auto-jumping boxes, 60s resend timer, and mock verification bypass.
8. **Onboarding Questionnaire (`src/pages/Onboarding.jsx`)**:
   - 2-step onboarding wizard gathering nickname, pronouns, age, province, and menstrual cycle phase with custom phase slogans. Persists progress to LocalStorage and saves to Supabase profiles on completion.
9. **Language Preference (`src/pages/Profile.jsx`)**:
   - Language selector (EN, ZU, XH, AF) saving directly to profile preferences.

---

## 🌸 Completed Features (Batch 2: TASK 004, 005, 006)

1. **Personalised Content Feed (`src/pages/Feed.jsx`)**:
   - Displays custom cycle phase banner containing corresponding phase slogans and day of the cycle.
   - Implements search input for filtering articles by keywords (title/content).
   - Category filtering bar containing horizontal-scrolling tabs ('All', 'Nutrition', 'Fitness', 'Mental Health', etc.).
   - Pulls articles from Supabase, personalising the list using the Claude curators (`personaliseFeed`).
   - Falls back safely to offline mock articles for guest users or during connection drops.
   - Restricts and displays lock icons for premium articles on Free tier accounts.
2. **Article Reader & Paywall Gating (`src/pages/Article.jsx`)**:
   - Implements robust inline/block markdown rendering support.
   - Restricted preview blur gate with a premium CTA lock box for Free users attempting to read premium articles.
   - Integrated Happy Splurge recommendation cards pulling dynamically from the database (via `article_products`) or falling back to themed mock products.
3. **Daily Wellness Check-In (`src/pages/CheckIn.jsx`)**:
   - Beautiful grid mood selector (😢 to 😄) and slider rating scales for energy levels and sleep quality.
   - Optional text area note reflection logger.
   - Dynamic streak calculation checking local dates (`YYYY-MM-DD` strings): increments on consecutive days, keeps count if updated on the same day, and resets to 1 if broken.
   - Saves to Supabase `check_ins` and updates profile parameters, falling back seamlessly to LocalStorage array lists and guest profiles in guest mode.
   - Interactive reflection timeline displaying a list of the past 7 days check-in inputs.
4. **Subscription Upgrade & Yoco Checkout (`src/pages/Upgrade.jsx`)**:
   - Monthly / Annual billing cycle toggle updating all pricing labels.
   - Enabled pricing tier cards for Sista Premium (R99/m, R990/yr) and Sista Gold (R199/m, R1990/yr).
   - Calls `initiateCheckout()` from `src/lib/yoco.js` to invoke the real Supabase Edge Function.
   - **Yoco Checkout Simulator Modal** as a graceful fallback (for guest sessions and local dev without a live Edge Function):
     - Displays branded portal with tier name and price.
     - Card number, expiry, CVV, and cardholder name inputs.
     - Simulated 2-second "processing" spinner on submission.
     - On success: upgrades `subscription_tier` in Supabase (authenticated users) or Zustand store (guest users) and redirects to `/profile?payment=success`.
5. **Mock Data Modules**:
   - Created `src/lib/mockArticles.js` and `src/lib/mockProducts.js` to ensure the app is fully hydrated and interactive out of the box in guest and offline environments.

---

## 🌸 Completed Features (Batch 3: Screens 4–8 & Route Wiring)

1. **Business Dashboard (`src/pages/BusinessDashboard.jsx`)**:
   - B2B platform analytics for business owners with views, clicks, products, and ZAR revenue metrics.
   - Line and Bar charts built with Recharts using the rosemary brand color scheme.
   - Toast trigger handles URL `?payment=success` dynamically.
2. **Admin Godmode Overview (`src/pages/AdminGodmode.jsx`)**:
   - High-level platform stats monitor (users, subscribers, articles, wellness check-ins, safety signals).
   - System health service indicators with visual status logs.
3. **Sista User Management (`src/pages/AdminSistas.jsx`)**:
   - Searchable, paginated registry of user profiles.
   - Moderator detail card supporting verify, suspend, ban, and reactivate prompts.
   - Automatically posts administrative audit trail events to `audit_log`.
4. **Ghost Profiles Privacy Audit (`src/pages/AdminGhostProfiles.jsx`)**:
   - Privacy-compliant viewer for anonymised and deleted accounts.
   - Automated audit tracing upon viewing ghost credentials.
   - Client-side export features for CSV reporting.
5. **AI Coach Configurator (`src/pages/AdminCoachConfig.jsx`)**:
   - Personality, system prompt, and safety prompt boundary controls for Coach Amara.
   - Dynamic perimenopause (Second Spring Mode) toggle parameters.
   - Settings for model versions and length outputs backed by upserts.
6. **Route Architecture Integration (`src/App.jsx`)**:
   - Integrated routing gates for the 5 dashboard components.
   - Wired existing but unlinked pages: `Safety` (Discreet Mode), `SistaCoach` (Coach Amara Chat), and `BusinessTiers` (Enterprise upgrades).
   - All modules secured via standard `ProtectedRoute` and `AdminRoute` wrappers.
7. **Production Verification**:
   - Verified that the complete SPA bundle compiles successfully via production assets build commands.

---

## 📅 Remaining Tasks Checklist

- [x] **TASK 007**: Admin CMS & Dashboard (`Admin.jsx`)
  - Admin article publishing (create/edit/publish articles)
  - Happy Splurge product management (create/edit products)
  - Article ↔ Product linking manager
  - Admin-role gated route (already in `App.jsx` via `AdminRoute`)
- [x] **Screens 4–8**: Implementation of Business Dashboard and Admin Pages
- [x] **Route Wiring**: App.jsx integration of Safety, Coach, Business Upgrade, and Admin tools
- [x] **Build Verification**: Production bundler health check (passes successfully)

---

## ⚙️ Technical Notes for Next Agent

- **Build**: Run `cmd /c npm run build` from the project directory. PowerShell's `npm run build` is blocked by execution policy — use `cmd /c` prefix.
- **Vite Warnings**: The "supabase.js dynamically imported but also statically imported" and "chunk size > 500kB" warnings are cosmetic and non-breaking. They appear in every build.
- **Guest Mode**: Guests have `isGuest: true` in Zustand store. All pages must check `isGuest` and fall back to LocalStorage operations instead of Supabase writes.
- **Cycle phase + day**: Stored in `localStorage` under `mysista-cycle-phase` and `mysista-cycle-day` after Onboarding. Feed.jsx reads these directly.
