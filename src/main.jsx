/**
 * src/main.jsx
 * App entry point — Router root, Supabase auth listener, toast provider
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { supabase, getProfile } from './lib/supabase.js';
import { useAuthStore } from './store/authStore.js';
import './index.css';

// ─── Bootstrap auth state before first render ─────────────────────────────────
// Listen for auth changes (login, logout, token refresh, page reload)
// and keep the Zustand store in sync.

supabase.auth.onAuthStateChange(async (event, session) => {
  const { setUser, setProfile, setLoading, logout } = useAuthStore.getState();

  if (session?.user) {
    setUser(session.user, session);

    // Fetch the profile row from public.profiles
    try {
      const profile = await getProfile(session.user.id);
      setProfile(profile);
    } catch (err) {
      // Profile may not exist yet (fresh signup) — that's fine
      console.warn('[MySista] Profile not found yet:', err.message);
    }
  } else {
    // No session — clear store
    logout();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'var(--font-body)',
            background: '#FAFAFA',
            color: '#212121',
            borderRadius: '12px',
            border: '1px solid rgba(107, 63, 160, 0.12)',
            boxShadow: '0 4px 24px rgba(107, 63, 160, 0.12)',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#6B3FA0', secondary: '#F3EEF9' },
          },
          error: {
            iconTheme: { primary: '#C2185B', secondary: '#FCE4EC' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
