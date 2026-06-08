/**
 * src/pages/Profile.jsx
 * User profile + subscription settings — placeholder for TASK 001.
 * Full implementation in TASK 006.
 */

import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { User } from 'lucide-react';

export default function Profile() {
  const { profile, tier, logout } = useAuth();

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto">
        {/* Basic profile card */}
        <div className="card p-8 text-center mb-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-white text-2xl font-bold font-display">
              {(profile?.display_name ?? 'S')[0].toUpperCase()}
            </span>
          </div>
          <h1 className="font-display text-xl font-semibold text-dark mb-1">
            {profile?.display_name ?? 'Sista'}
          </h1>
          <div className="badge-primary px-3 py-1 text-xs inline-flex mb-4">
            {tier ?? 'Free'} Plan
          </div>
          <p className="text-mid text-sm mb-6">
            Full profile settings, wellness score, and subscription management — TASK 006.
          </p>
          <button
            id="profile-logout-btn"
            onClick={logout}
            className="btn-outline w-full justify-center"
          >
            Sign Out
          </button>
        </div>
        <div className="text-center">
          <div className="badge-secondary px-4 py-2 text-sm inline-flex">
            TASK 006 — Subscription & Paywall — WAITING
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
