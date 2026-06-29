/**
 * src/App.jsx
 * Router root — all routes defined here.
 * Auth-guarded routes use <ProtectedRoute> and <AdminRoute> wrappers.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';

// ─── Pages ────────────────────────────────────────────────────────────────────
import Landing            from './pages/Landing.jsx';
import Auth               from './pages/Auth.jsx';
import Verify             from './pages/Verify.jsx';
import Onboarding         from './pages/Onboarding.jsx';
import Feed               from './pages/Feed.jsx';
import Article            from './pages/Article.jsx';
import CheckIn            from './pages/CheckIn.jsx';
import Profile            from './pages/Profile.jsx';
import Upgrade            from './pages/Upgrade.jsx';
import Admin              from './pages/Admin.jsx';
import Safety             from './pages/Safety.jsx';
import SistaCoach         from './pages/SistaCoach.jsx';
import BusinessTiers      from './pages/BusinessTiers.jsx';
import BusinessDashboard  from './pages/BusinessDashboard.jsx';
import AdminGodmode       from './pages/AdminGodmode.jsx';
import AdminSistas        from './pages/AdminSistas.jsx';
import AdminGhostProfiles from './pages/AdminGhostProfiles.jsx';
import AdminCoachConfig   from './pages/AdminCoachConfig.jsx';
import WellnessHub        from './pages/WellnessHub.jsx';
import ConditionDetail    from './pages/ConditionDetail.jsx';
import Recipes            from './pages/Recipes.jsx';
import RecipeDetail       from './pages/RecipeDetail.jsx';
import LocalDirectory     from './pages/LocalDirectory.jsx';
import BusinessDetail     from './pages/BusinessDetail.jsx';
import DIYHub             from './pages/DIYHub.jsx';
import DIYDetail          from './pages/DIYDetail.jsx';
import AnonQuestions      from './pages/AnonQuestions.jsx';
import Discover           from './pages/Discover.jsx';
import CreatorPage        from './pages/CreatorPage.jsx';
import CreateYourPage     from './pages/CreateYourPage.jsx';
import AnonQuestionDetail from './pages/AnonQuestionDetail.jsx';
import WeeklyReport       from './pages/WeeklyReport.jsx';
import CreatorVerification from './pages/CreatorVerification.jsx';
import CreatorAnalytics   from './pages/CreatorAnalytics.jsx';
import NotificationSettings from './pages/NotificationSettings.jsx';
import AffiliateDashboard from './pages/AffiliateDashboard.jsx';
import WellnessPlans      from './pages/WellnessPlans.jsx';
import ActivePlan         from './pages/ActivePlan.jsx';

// ─── Route Guards ─────────────────────────────────────────────────────────────

/**
 * Redirects unauthenticated users to /auth.
 * Shows nothing while the initial auth check is in progress.
 */
function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuthStore();

  // Still doing the initial session check — show branded splash screen
  if (!initialized && loading) return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#1a0a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: '#6B3FA0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold'
      }}>MS</div>
      <div style={{
        width: 40,
        height: 4,
        borderRadius: 2,
        background: '#6B3FA0',
        animation: 'pulse 1.2s ease-in-out infinite'
      }}/>
      <style>{`@keyframes pulse { 0%,100%{opacity:.3}50%{opacity:1} }`}</style>
    </div>
  );

  if (!user) return <Navigate to="/auth" replace />;

  return children;
}

/**
 * Redirects non-admin users to /feed.
 */
function AdminRoute({ children }) {
  const { user, loading, initialized } = useAuthStore();
  const isAdmin = useAuthStore.getState().isAdmin?.();

  if (!initialized && loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/feed" replace />;

  return children;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────────────────────── */}
      <Route path="/"    element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/verify" element={<Verify />} />

      {/* ── Auth callback (Google OAuth redirect) ───────────────────────── */}
      <Route path="/auth/callback" element={<Navigate to="/feed" replace />} />

      {/* ── Onboarding (protected — new users only) ─────────────────────── */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* ── Core App ────────────────────────────────────────────────────── */}
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/article/:slug"
        element={
          <ProtectedRoute>
            <Article />
          </ProtectedRoute>
        }
      />
      <Route
        path="/check-in"
        element={
          <ProtectedRoute>
            <CheckIn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/safety"
        element={
          <ProtectedRoute>
            <Safety />
          </ProtectedRoute>
        }
      />
      <Route
        path="/safety-discreet-mode"
        element={
          <ProtectedRoute>
            <Safety />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coach"
        element={
          <ProtectedRoute>
            <SistaCoach />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wellness"
        element={
          <ProtectedRoute>
            <WellnessHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wellness/:slug"
        element={
          <ProtectedRoute>
            <ConditionDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <Recipes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes/:id"
        element={
          <ProtectedRoute>
            <RecipeDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/directory"
        element={
          <ProtectedRoute>
            <LocalDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/directory/:id"
        element={
          <ProtectedRoute>
            <BusinessDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diy"
        element={
          <ProtectedRoute>
            <DIYHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diy/:id"
        element={
          <ProtectedRoute>
            <DIYDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community/anon"
        element={
          <ProtectedRoute>
            <AnonQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community/anon/:id"
        element={
          <ProtectedRoute>
            <AnonQuestionDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <Discover />
          </ProtectedRoute>
        }
      />
      <Route
        path="/c/:page_name"
        element={
          <ProtectedRoute>
            <CreatorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-your-page"
        element={
          <ProtectedRoute>
            <CreateYourPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <WeeklyReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/verify"
        element={
          <ProtectedRoute>
            <CreatorVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/analytics"
        element={
          <ProtectedRoute>
            <CreatorAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/notifications"
        element={
          <ProtectedRoute>
            <NotificationSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/affiliate"
        element={
          <ProtectedRoute>
            <AffiliateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wellness-plans"
        element={
          <ProtectedRoute>
            <WellnessPlans />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wellness-plans/:id"
        element={
          <ProtectedRoute>
            <ActivePlan />
          </ProtectedRoute>
        }
      />

      {/* ── Upgrade / Paywall ───────────────────────────────────────────── */}
      <Route path="/upgrade" element={<Upgrade />} />

      {/* ── Business B2B Platform ───────────────────────────────────────── */}
      <Route
        path="/business/tiers"
        element={
          <ProtectedRoute>
            <BusinessTiers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/upgrade"
        element={
          <ProtectedRoute>
            <BusinessTiers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/dashboard"
        element={
          <ProtectedRoute>
            <BusinessDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Admin CMS ───────────────────────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/godmode"
        element={
          <AdminRoute>
            <AdminGodmode />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/sistas"
        element={
          <AdminRoute>
            <AdminSistas />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/ghosts"
        element={
          <AdminRoute>
            <AdminGhostProfiles />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/coach-config"
        element={
          <AdminRoute>
            <AdminCoachConfig />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      {/* ── 404 fallback ────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
