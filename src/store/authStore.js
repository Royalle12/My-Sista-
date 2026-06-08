/**
 * src/store/authStore.js
 * Zustand store — user session, profile, loading state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─── State ─────────────────────────────────────────────────────────────
      user:        null,   // Supabase auth user object
      session:     null,   // Supabase session object
      profile:     null,   // public.profiles row
      loading:     true,   // initial auth check in progress
      initialized: false,  // onAuthStateChange has fired at least once

      // ─── Actions ───────────────────────────────────────────────────────────
      setUser: (user, session) =>
        set({ user, session, loading: false, initialized: true }),

      setProfile: (profile) => set({ profile }),

      setLoading: (loading) => set({ loading }),

      logout: () =>
        set({
          user:    null,
          session: null,
          profile: null,
          loading: false,
        }),

      // ─── Computed helpers ─────────────────────────────────────────────────
      isAuthenticated: () => !!get().user,

      isAdmin: () =>
        get().user?.user_metadata?.role === 'admin' ||
        get().user?.app_metadata?.role  === 'admin',

      tier: () => get().profile?.subscription_tier ?? 'free',

      hasOnboarded: () =>
        !!(get().profile?.display_name && get().profile?.wellness_goals?.length > 0),
    }),
    {
      name:    'mysista-auth',
      // Only persist non-sensitive, non-redundant fields
      partialize: (state) => ({
        profile:     state.profile,
        initialized: state.initialized,
      }),
    }
  )
);
