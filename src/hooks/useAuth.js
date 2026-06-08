/**
 * src/hooks/useAuth.js
 * Auth hook — wraps authStore, exposes login/register/logout/googleAuth actions
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase, getProfile, upsertProfile } from '../lib/supabase.js';
import { useAuthStore } from '../store/authStore.js';

export function useAuth() {
  const navigate  = useNavigate();
  const store     = useAuthStore();
  const { user, session, profile, loading, setUser, setProfile, logout: clearStore } = store;

  // ─── Register with email + password ─────────────────────────────────────
  const register = useCallback(async ({ email, password, displayName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Create initial profile row
      await upsertProfile(data.user.id, { display_name: displayName });
      toast.success('Account created! Welcome to My Sista 🌸');
    }

    return data;
  }, []);

  // ─── Login with email + password ────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  // ─── Google OAuth ────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw error;
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    clearStore();
    navigate('/');
    toast.success('Signed out. See you soon! 👋');
  }, [clearStore, navigate]);

  // ─── Refresh profile from DB ──────────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const prof = await getProfile(user.id);
      setProfile(prof);
      return prof;
    } catch (err) {
      console.error('[useAuth] refreshProfile error:', err);
    }
  }, [user?.id, setProfile]);

  // ─── Post-auth routing ────────────────────────────────────────────────────
  const routeAfterAuth = useCallback((userProfile) => {
    const hasOnboarded =
      userProfile?.display_name && userProfile?.wellness_goals?.length > 0;
    navigate(hasOnboarded ? '/feed' : '/onboarding', { replace: true });
  }, [navigate]);

  return {
    // State
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: store.isAdmin?.(),
    tier: store.tier?.(),

    // Actions
    register,
    login,
    loginWithGoogle,
    logout,
    refreshProfile,
    routeAfterAuth,
  };
}
