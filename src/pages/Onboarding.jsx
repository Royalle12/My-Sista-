/**
 * src/pages/Onboarding.jsx
 * 5-step wellness profile wizard — placeholder for TASK 001.
 * Full implementation in TASK 003.
 */

import PageWrapper from '../components/layout/PageWrapper.jsx';

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
      <div className="card p-10 max-w-lg w-full text-center animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-soft flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🌱</span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-dark mb-2">
          Let's build your wellness profile
        </h1>
        <p className="text-mid text-sm mb-6">
          5-step onboarding wizard — TASK 003 implementation coming next.
        </p>
        <div className="badge-primary px-4 py-2 text-sm">
          TASK 003 — Onboarding Wizard — WAITING
        </div>
      </div>
    </div>
  );
}
