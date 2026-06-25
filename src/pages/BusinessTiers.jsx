/**
 * src/pages/BusinessTiers.jsx
 * Screen 3 — Grow Your Business: Choose a Tier
 * Tables: businesses, business_subscriptions
 * Payment: reuses Yoco Edge Function pattern
 */

import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import {
  Briefcase, Check, Zap, Star, Crown,
  BarChart2, Globe, Users, ShieldCheck, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const BUSINESS_TIERS = {
  starter: {
    name: 'Sista Starter',
    icon: Briefcase,
    monthlyZAR: 299,
    annualZAR: 2990,
    monthlyAmountCents: 29900,
    annualAmountCents: 299000,
    color: 'from-[#6B3FA0] to-[#8B5EC6]',
    badge: null,
    features: [
      'Business profile listing',
      'Up to 5 product listings',
      'Basic analytics dashboard',
      'My Sista community visibility',
      'Email support',
    ]
  },
  growth: {
    name: 'Sista Growth',
    icon: Star,
    monthlyZAR: 599,
    annualZAR: 5990,
    monthlyAmountCents: 59900,
    annualAmountCents: 599000,
    color: 'from-[#C2185B] to-[#E91E8C]',
    badge: 'Most Popular',
    features: [
      'Everything in Starter',
      'Up to 50 product listings',
      'Featured placement in Feed',
      'Article sponsorship slots',
      'Advanced analytics + CSV export',
      'Priority support',
    ]
  },
  premium: {
    name: 'Sista Premium Brand',
    icon: Crown,
    monthlyZAR: 1299,
    annualZAR: 12990,
    monthlyAmountCents: 129900,
    annualAmountCents: 1299000,
    color: 'from-[#FF8F00] to-[#FF6F00]',
    badge: 'Enterprise',
    features: [
      'Everything in Growth',
      'Unlimited product listings',
      'Co-branded wellness content',
      'Dedicated account manager',
      'Early access to new features',
      'Direct partnership with My Sista',
    ]
  }
};

export default function BusinessTiers() {
  const { user, profile, isGuest } = useAuth();
  const [billing, setBilling] = useState('monthly');
  const [myBusiness, setMyBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    business_type: '',
    industry: '',
    website_url: '',
  });

  useEffect(() => {
    if (user?.id) loadMyBusiness();
  }, [user?.id]);

  const loadMyBusiness = async () => {
    if (isGuest) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      setMyBusiness(data || null);
    } catch {
      setMyBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterBusiness = async (e) => {
    e.preventDefault();
    if (!businessForm.business_name) {
      toast.error('Business name is required.');
      return;
    }
    try {
      if (isGuest) {
        setMyBusiness({ id: 'guest-biz', owner_id: 'guest-sista', ...businessForm, subscription_tier: 'starter' });
        setShowRegisterForm(false);
        toast.success('Business registered (Guest Mode) 🌸');
        return;
      }
      const { data, error } = await supabase
        .from('businesses')
        .insert([{ owner_id: user.id, ...businessForm }])
        .select()
        .single();
      if (error) throw error;
      setMyBusiness(data);
      setShowRegisterForm(false);
      toast.success('Business registered! 🎉 Choose your tier to go live.');
    } catch (err) {
      console.error('[BusinessTiers] register:', err);
      toast.error('Failed to register business. Please try again.');
    }
  };

  const handleSelectTier = async (tierKey) => {
    if (!myBusiness) {
      setShowRegisterForm(true);
      return;
    }
    if (isGuest) {
      toast.success(`Redirecting to Yoco checkout for ${BUSINESS_TIERS[tierKey].name} (Guest Mode)`);
      return;
    }

    setCheckoutLoading(tierKey);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const tier = BUSINESS_TIERS[tierKey];
      const amountCents = billing === 'annual' ? tier.annualAmountCents : tier.monthlyAmountCents;
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-yoco-checkout`;

      const res = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession?.access_token}`,
        },
        body: JSON.stringify({
          tier: `business_${tierKey}`,
          billingCycle: billing,
          amountCents,
          currency: 'ZAR',
          businessId: myBusiness.id,
          successUrl: `${import.meta.env.VITE_APP_URL}/business/dashboard?payment=success`,
          cancelUrl: `${import.meta.env.VITE_APP_URL}/business/upgrade?payment=cancelled`,
        }),
      });

      if (!res.ok) throw new Error(`Checkout failed: ${res.statusText}`);
      const { redirectUrl } = await res.json();
      if (redirectUrl) window.location.href = redirectUrl;
    } catch (err) {
      console.error('[BusinessTiers] checkout:', err);
      toast.error('Checkout unavailable. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const currentTier = myBusiness?.subscription_tier;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

        {/* Header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 bg-soft border border-primary/15 rounded-full px-4 py-1.5 text-xs text-primary font-semibold mb-4">
            <Briefcase size={12} /> Business Partner Programme
          </div>
          <h1 className="section-title text-3xl">Grow With My Sista</h1>
          <p className="section-subtitle max-w-lg mx-auto">
            Reach thousands of women across South Africa who are actively investing in their wellness, beauty, and financial empowerment.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center">
          <div className="bg-soft rounded-2xl p-1 flex gap-1 border border-primary/10">
            {['monthly', 'annual'].map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  billing === b
                    ? 'bg-white text-primary shadow-soft'
                    : 'text-mid hover:text-primary'
                }`}
              >
                {b === 'monthly' ? 'Monthly' : 'Annual'}
                {b === 'annual' && <span className="ml-1 text-3xs text-secondary font-bold">Save 2 months</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Current business badge */}
        {myBusiness && (
          <div className="bg-gradient-to-r from-[#F3EEF9] to-white border border-primary/15 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-dark text-sm">{myBusiness.business_name}</div>
              <div className="text-xs text-mid capitalize">
                Current plan: <span className="text-primary font-bold">{myBusiness.subscription_tier}</span>
                {myBusiness.is_verified && <span className="ml-2 text-green-600 font-bold">✓ Verified</span>}
              </div>
            </div>
          </div>
        )}

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {Object.entries(BUSINESS_TIERS).map(([tierKey, tier]) => {
            const Icon = tier.icon;
            const isCurrent = currentTier === tierKey;
            const price = billing === 'annual' ? tier.annualZAR : tier.monthlyZAR;

            return (
              <div
                key={tierKey}
                className={`card p-6 space-y-5 flex flex-col relative ${
                  tier.badge === 'Most Popular' ? 'ring-2 ring-secondary/40 shadow-glow' : ''
                }`}
              >
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-3xs font-bold text-white px-3 py-1 rounded-full bg-gradient-to-r ${tier.color} whitespace-nowrap`}>
                    {tier.badge}
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-soft`}>
                  <Icon size={20} className="text-white" />
                </div>

                <div>
                  <h3 className="font-display font-bold text-dark text-base">{tier.name}</h3>
                  <div className="mt-1">
                    <span className="text-3xl font-display font-bold text-dark">R{price.toLocaleString('en-ZA')}</span>
                    <span className="text-mid text-xs">/{billing === 'annual' ? 'year' : 'month'}</span>
                  </div>
                  {billing === 'annual' && (
                    <div className="text-3xs text-secondary font-bold mt-0.5">
                      R{Math.round(price / 12).toLocaleString('en-ZA')}/month billed annually
                    </div>
                  )}
                </div>

                <ul className="space-y-2 flex-1">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-mid">
                      <Check size={13} className="text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectTier(tierKey)}
                  disabled={isCurrent || checkoutLoading === tierKey}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-soft text-primary border border-primary/20 cursor-default'
                      : `bg-gradient-to-r ${tier.color} text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`
                  }`}
                >
                  {checkoutLoading === tierKey
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : isCurrent
                    ? '✓ Current Plan'
                    : <>Get Started <ArrowRight size={14} /></>
                  }
                </button>
              </div>
            );
          })}
        </div>

        {/* Register business CTA */}
        {!myBusiness && !showRegisterForm && (
          <div className="text-center">
            <p className="text-xs text-mid mb-3">Don't have a business profile yet?</p>
            <button
              onClick={() => setShowRegisterForm(true)}
              className="btn-primary"
            >
              Register Your Business First
            </button>
          </div>
        )}

        {/* Register Business Form */}
        {showRegisterForm && (
          <div className="card p-6 border-2 border-primary/15 space-y-5">
            <h3 className="font-display font-bold text-dark flex items-center gap-2">
              <Briefcase size={16} className="text-primary" /> Register Your Business
            </h3>
            <form onSubmit={handleRegisterBusiness} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Business Name *</label>
                <input required value={businessForm.business_name}
                  onChange={e => setBusinessForm(p => ({ ...p, business_name: e.target.value }))}
                  placeholder="e.g. Amara Beauty Co." className="input" />
              </div>
              <div>
                <label className="label">Business Type</label>
                <select value={businessForm.business_type}
                  onChange={e => setBusinessForm(p => ({ ...p, business_type: e.target.value }))}
                  className="input">
                  <option value="">Select type</option>
                  <option>Sole Proprietor</option>
                  <option>Pty Ltd</option>
                  <option>CC</option>
                  <option>NPO</option>
                  <option>Informal</option>
                </select>
              </div>
              <div>
                <label className="label">Industry</label>
                <select value={businessForm.industry}
                  onChange={e => setBusinessForm(p => ({ ...p, industry: e.target.value }))}
                  className="input">
                  <option value="">Select industry</option>
                  <option>Beauty & Skincare</option>
                  <option>Wellness & Health</option>
                  <option>Fashion & Clothing</option>
                  <option>Food & Nutrition</option>
                  <option>Professional Services</option>
                  <option>Education & Coaching</option>
                  <option>Technology</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Website URL</label>
                <input value={businessForm.website_url}
                  onChange={e => setBusinessForm(p => ({ ...p, website_url: e.target.value }))}
                  placeholder="https://yourbusiness.co.za" className="input" type="url" />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="button" onClick={() => setShowRegisterForm(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Register & Choose a Plan</button>
              </div>
            </form>
          </div>
        )}

        {/* Trust indicators */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-primary/10">
          {[
            { icon: ShieldCheck, label: 'Verified partners', desc: 'Vetted & trusted' },
            { icon: Users, label: '10K+ Sistas', desc: 'Active monthly users' },
            { icon: Globe, label: 'Pan-SA reach', desc: '9 provinces' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="text-center">
              <Icon size={20} className="text-primary mx-auto mb-2" />
              <div className="text-xs font-bold text-dark">{label}</div>
              <div className="text-3xs text-mid">{desc}</div>
            </div>
          ))}
        </div>

      </div>
    </PageWrapper>
  );
}
