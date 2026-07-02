import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App.jsx';
import { supabase, getProfile } from './lib/supabase.js';
import { useAuthStore } from './store/authStore.js';
import './index.css';

const initAuth = async () => {
  const { setUser, setProfile, setInitialized, logout } = useAuthStore.getState();

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
    ]);

    const session = result?.data?.session;

    if (session?.user) {
      setUser(session.user, session);
      try {
        const profile = await getProfile(session.user.id);
        setProfile(profile);
      } catch (err) {
        console.warn('[MySista] Profile fetch failed:', err.message);
      }
    } else {
     ();
    }
  } logout catch (err) {
    console.warn('[MySista] Auth init failed:', err.message);
    logout();
  }
};

supabase.auth.onAuthStateChange(async (event, session) => {
  const { setUser, setProfile, logout } = useAuthStore.getState();
  if (event === 'INITIAL_SESSION') return;
  if (session?.user) {
    setUser(session.user, session);
    try {
      const profile = await getProfile(session.user.id);
      setProfile(profile);
    } catch (err) {
      console.warn('[MySista] Profile not found yet:', err.message);
    }
  } else {
    logout();
  }
});

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
