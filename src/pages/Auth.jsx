/**
 * src/pages/Auth.jsx
 * Login + Register page — placeholder for TASK 001.
 * Full implementation in TASK 002.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Auth() {
  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" id="auth-back-link" className="inline-flex items-center gap-2 text-mid text-sm mb-8 hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="card p-8 animate-scale-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-soft">
              <span className="text-white font-bold font-display">S</span>
            </div>
            <div>
              <h1 className="font-display font-semibold text-dark text-xl">My Sista</h1>
              <p className="text-mid text-xs">Your wellness companion</p>
            </div>
          </div>

          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-soft flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌸</span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-dark mb-2">
              Welcome back, Sista
            </h2>
            <p className="text-mid text-sm mb-6">
              Auth system is being built in TASK 002.
            </p>
            <div className="badge-primary px-4 py-2 text-sm">
              TASK 002 — Auth System — NEXT UP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
