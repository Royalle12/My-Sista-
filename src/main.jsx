import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App.jsx';
import { supabase, getProfile } from './lib/supabase.js';
import { useAuthStore } from './store/authStore.js';
import './index.css';

// ACTIVE session check on startup — does not wait for Supabase to emit
const initAuth = async () => {
  const { setUser, setProfile, setInitialized, logout } = useAuthStore.getState();

  // 8 second timeout — if Supabase doesn't respond, fall through to logged-out
  const timeout = new Promise((_, reject) =>
    setTimeout(() => {
      setInitialized();
      reject(new Error('Supabase timeout'));
    }, 8000)
  );

  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      timeout
       const session = result?. ]);

data?.session;

    if (session?.user) {
      setUser(session.user, session);
      try {
        const profile = await getProfile(session.user.id);
        setProfile(profile);
      } catch (err) {
        console.warn('[MySista] Profile fetch failed:', err.message);
      }
    } else {
      logout();
    }
  } catch (err) {
    console.warn('[MySista] Auth init failed or timed out:', err.message);
    logout();
  }
};

// PASSIVE listener — handles sign in/out events after initial load
supabase.auth.onAuthStateChange(async (event, session) => {
  const { setUser, setProfile, logout } = useAuthStore.getState();

  if (event === 'INITIAL_SESSION') return; // handled by initAuth above

  if (session?.user) {
    setUser(session.user, session);
    try {
      const profile = await getProfile(session.user.id);
      setProfile(profile);
    } catch (err) {
      console.warn('[MySista] Profile not found yet:', err.message);
    }
  } else {
   ();
  }
});

// logout Run auth check before rendering
initAuth();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a0a2e',
            color: '#fff',
            border: '1px solid #6B3FA0',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
