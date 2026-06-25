/**
 * src/pages/Upgrade.jsx
 * Premium Subscription Upgrade / Paywall page.
 * Integrates Yoco Checkout API with automated checkout simulator fallback.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthStore } from '../store/authStore.js';
import { SUBSCRIPTION_TIERS, initiateCheckout } from '../lib/yoco.js';
import { upsertProfile } from '../lib/supabase.js';
import { Zap, Check, CreditCard, Lock, Sparkles, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Upgrade() {
  const navigate = useNavigate();
  const { user, profile, isGuest, refreshProfile } = useAuth();
  const setProfile = useAuthStore((s) => s.setProfile);

  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [loading, setLoading] = useState(false);

  // Simulator Modal states
  const [showSimulator, setShowSimulator] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const handleSelectTier = async (tierKey) => {
    setLoading(true);
    setCheckoutTier(tierKey);

    try {
      if (isGuest) {
        // Trigger local simulator for guest sessions
        setShowSimulator(true);
      } else {
        // Real user: try to call Yoco Edge Function
        await initiateCheckout(tierKey, billingCycle);
      }
    } catch (err) {
      console.warn('[Upgrade] Edge function failed, opening developer simulator fallback:', err.message);
      // Fallback: Open simulator modal for local dev testing
      setShowSimulator(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedPayment = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      toast.error('Please fill in all card details');
      return;
    }

    setPaymentProcessing(true);

    try {
      // Simulate gateway delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (isGuest) {
        // Upgrading guest profile in local store
        const updatedProfile = {
          ...profile,
          subscription_tier: checkoutTier,
        };
        setProfile(updatedProfile);
      } else {
        // Upgrading authenticated user profile directly in DB for testing
        const updates = {
          subscription_tier: checkoutTier,
        };
        await upsertProfile(user.id, updates);
        await refreshProfile();
      }

      toast.success(`Welcome to ${checkoutTier === 'sista' ? 'Sista Premium' : 'Sista Gold'}! 🌸`);
      setShowSimulator(false);
      navigate('/profile?payment=success');
    } catch (err) {
      console.error('[Upgrade] Mock upgrade failed:', err);
      toast.error('Simulation payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen py-6 px-4 relative">
        <div className="container-app">
          
          {/* Header area */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Zap size={24} className="text-white" />
            </div>
            <h1 className="section-title mb-2">Upgrade Your Journey</h1>
            <p className="section-subtitle">
              Unlock unlimited content, live sessions, and sync deep with your sisterhood.
            </p>

            {/* Toggle Billing Cycle */}
            <div className="inline-flex items-center gap-1.5 p-1 bg-soft rounded-2xl border border-primary/5 mt-6 shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={[
                  'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                  billingCycle === 'monthly'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-mid hover:text-primary',
                ].join(' ')}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={[
                  'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                  billingCycle === 'annual'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-mid hover:text-primary',
                ].join(' ')}
              >
                Annual <span className="text-3xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full ml-1 font-bold">2 Months Free</span>
              </button>
            </div>
          </div>

          {/* Pricing cards grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
            {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
              const price = billingCycle === 'annual' ? tier.annualZAR : tier.monthlyZAR;
              const isPopular = tier.popular;

              return (
                <div
                  key={key}
                  className={[
                    'card p-8 flex flex-col relative animate-slide-up bg-white',
                    isPopular ? 'ring-2 ring-primary shadow-glow bg-gradient-to-b from-white to-secondary-50/5' : '',
                  ].join(' ')}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="badge-premium px-4 py-1 text-xs">Most Popular</span>
                    </div>
                  )}

                  <h2 className="font-display font-semibold text-dark text-xl mb-1">
                    {tier.name}
                  </h2>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-gradient">R{price}</span>
                    <span className="text-mid text-sm">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-3 flex-1 mb-8">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-dark">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Action button */}
                  <button
                    id={`upgrade-btn-${key}`}
                    disabled={loading}
                    onClick={() => handleSelectTier(key)}
                    className={[
                      isPopular ? 'btn-primary w-full justify-center py-3' : 'btn-outline w-full justify-center py-3',
                    ].join(' ')}
                  >
                    Choose {tier.name}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-mid text-xs">
              Annual plans save up to R398. Powered by **Yoco Payments** for card security.
            </p>
          </div>

          {/* Checkout Simulator Modal */}
          {showSimulator && checkoutTier && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="card max-w-md w-full bg-white p-6 relative shadow-glow border border-[#F8E0DD] animate-scale-in">
                
                {/* Close Button */}
                <button
                  onClick={() => setShowSimulator(false)}
                  className="absolute top-4 right-4 text-mid hover:text-dark transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Brand Header */}
                <div className="text-center mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center mx-auto mb-2 text-white font-bold">
                    S
                  </div>
                  <h3 className="font-display font-bold text-lg text-dark">
                    Yoco Checkout Portal
                  </h3>
                  <span className="badge-primary px-3 py-0.5 text-3xs font-bold mt-1.5 inline-flex items-center gap-1">
                    <ShieldCheck size={10} />
                    Developer Test Mode
                  </span>
                </div>

                {/* Price Display */}
                <div className="bg-soft/40 border border-primary/5 rounded-xl p-4 mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-mid">Subscribing to</p>
                    <p className="text-sm font-bold text-dark">
                      {SUBSCRIPTION_TIERS[checkoutTier].name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-mid">{billingCycle === 'annual' ? 'Annual Plan' : 'Monthly Plan'}</p>
                    <p className="text-base font-bold text-primary">
                      R{billingCycle === 'annual' ? SUBSCRIPTION_TIERS[checkoutTier].annualZAR : SUBSCRIPTION_TIERS[checkoutTier].monthlyZAR}
                    </p>
                  </div>
                </div>

                {/* Card input Form */}
                <form onSubmit={handleSimulatedPayment} className="space-y-4">
                  <div>
                    <label className="text-3xs font-bold text-mid uppercase tracking-wider block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Thandi Khumalo"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="input py-2 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-3xs font-bold text-mid uppercase tracking-wider block mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-mid">
                        <CreditCard size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="input pl-9 py-2 px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-3xs font-bold text-mid uppercase tracking-wider block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="input py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-bold text-mid uppercase tracking-wider block mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="123"
                        maxLength="3"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="input py-2 px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-center text-mid text-3xs flex items-center justify-center gap-1.5">
                    <Lock size={10} className="text-emerald-500" />
                    Payments are encrypted. No actual charge will occur.
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={paymentProcessing}
                    className="btn-primary w-full justify-center py-3 mt-4 text-xs font-bold"
                  >
                    {paymentProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Authorizing Checkout...
                      </span>
                    ) : (
                      `Pay R${billingCycle === 'annual' ? SUBSCRIPTION_TIERS[checkoutTier].annualZAR : SUBSCRIPTION_TIERS[checkoutTier].monthlyZAR}`
                    )}
                  </button>
                </form>

              </div>
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}
