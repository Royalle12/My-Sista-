/**
 * src/App.jsx
 * Router root — all routes defined here.
 * Auth-guarded routes use <ProtectedRoute> and <AdminRoute> wrappers.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';

// ─── Pages ────────────────────────────────────────────────────────────────────
import Landing    from './pages/Landing.jsx';
import Auth       from './pages/Auth.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Feed       from './pages/Feed.jsx';
import Article    from './pages/Article.jsx';
import CheckIn    from './pages/CheckIn.jsx';
import Profile    from './pages/Profile.jsx';
import Upgrade    from './pages/Upgrade.jsx';
import Admin      from './pages/Admin.jsx';

// ─── Route Guards ─────────────────────────────────────────────────────────────

/**
 * Redirects unauthenticated users to /auth.
 * Shows nothing while the initial auth check is in progress.
 */
function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuthStore();

  // Still doing the initial session check — render nothing (avoids flash)
  if (!initialized && loading) return null;

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

      {/* ── Upgrade / Paywall ───────────────────────────────────────────── */}
      <Route path="/upgrade" element={<Upgrade />} />

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
