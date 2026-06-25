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
      isGuest:     false,  // Flag for mock guest session

      // ─── Actions ───────────────────────────────────────────────────────────
      setUser: (user, session) =>
        set({ user, session, loading: false, initialized: true, isGuest: false }),

      setProfile: (profile) => set({ profile }),

      setLoading: (loading) => set({ loading }),

      setGuestSession: () =>
        set({
          user: {
            id: 'guest-sista',
            email: 'guest@mysista.co.za',
            user_metadata: { display_name: 'Guest Sista' },
          },
          session: { access_token: 'mock-guest-token' },
          profile: {
            id: 'guest-sista',
            display_name: 'Guest Sista',
            subscription_tier: 'free',
            wellness_goals: ['general'],
            onboarding_complete: true,
            language_preference: 'en',
          },
          loading: false,
          initialized: true,
          isGuest: true,
        }),

      logout: () =>
        set({
          user:    null,
          session: null,
          profile: null,
          loading: false,
          isGuest: false,
        }),

      // ─── Computed helpers ─────────────────────────────────────────────────
      isAuthenticated: () => !!get().user,

      isAdmin: () =>
        !get().isGuest &&
        (get().user?.user_metadata?.role === 'admin' ||
         get().user?.app_metadata?.role  === 'admin'),

      tier: () => get().profile?.subscription_tier ?? 'free',

      hasOnboarded: () =>
        get().isGuest ||
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
