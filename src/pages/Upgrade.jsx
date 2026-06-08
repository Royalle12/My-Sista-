/**
 * src/pages/Upgrade.jsx
 * Subscription upgrade / paywall page — placeholder for TASK 001.
 * Full Yoco Checkout integration in TASK 006.
 */

import { Link } from 'react-router-dom';
import { Zap, Check } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../lib/yoco.js';

export default function Upgrade() {
  return (
    <div className="min-h-screen bg-gradient-soft py-[calc(var(--nav-height)+2rem)] px-4">
      <div className="container-app">

        <div className="text-center mb-12 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="section-title mb-2">Upgrade Your Journey</h1>
          <p className="section-subtitle">
            Unlock unlimited content, live sessions, and your Sista community.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
            <div
              key={key}
              className={[
                'card p-8 flex flex-col relative animate-slide-up',
                tier.popular ? 'ring-2 ring-primary shadow-glow' : '',
              ].join(' ')}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-premium px-4 py-1 text-xs">Most Popular</span>
                </div>
              )}
              <h2 className="font-display font-semibold text-dark text-xl mb-1">{tier.name}</h2>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-gradient">R{tier.monthlyZAR}</span>
                <span className="text-mid text-sm">/month</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-dark">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                id={`upgrade-btn-${key}`}
                disabled
                className={tier.popular ? 'btn-primary w-full justify-center' : 'btn-outline w-full justify-center'}
                title="Yoco payment integration — TASK 006"
              >
                Choose {tier.name}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="badge-primary px-4 py-2 text-sm inline-flex">
            TASK 006 — Yoco Checkout Integration — WAITING
          </div>
          <p className="text-mid text-xs mt-3">Annual plans = 2 months free. ZAR pricing. Powered by Yoco.</p>
        </div>

      </div>
    </div>
  );
}
