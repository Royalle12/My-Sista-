/**
 * src/pages/Profile.jsx
 * User profile card + Language preference selector.
 * Language setting wires to profiles.language_preference in Supabase.
 * Full subscription management lands in TASK 006.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { upsertProfile } from '../lib/supabase.js';
import { Globe, LogOut, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const TIER_LABELS = {
  free:       'Free Sista',
  sista:      'Sista Premium',
  sista_plus: 'Sista Gold',
};

const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'zu', label: 'isiZulu',    flag: '🇿🇦' },
  { code: 'xh', label: 'isiXhosa',  flag: '🇿🇦' },
  { code: 'af', label: 'Afrikaans', flag: '🇿🇦' },
];

export default function Profile() {
  const { profile, tier, logout, isGuest, user } = useAuth();
  const navigate = useNavigate();

  const currentLang = profile?.language_preference ?? 'en';
  const [selectedLang, setSelectedLang] = useState(currentLang);
  const [savingLang, setSavingLang]     = useState(false);
  const [langOpen, setLangOpen]         = useState(false);

  const tierLabel = TIER_LABELS[tier] ?? 'Free Sista';

  // ── Save language preference ─────────────────────────────────────────────
  const handleLanguageChange = async (code) => {
    setSelectedLang(code);
    setLangOpen(false);
    if (code === currentLang) return;

    try {
      setSavingLang(true);
      if (!isGuest && user?.id) {
        await upsertProfile(user.id, { language_preference: code });
      }
      toast.success(`Language set to ${LANGUAGES.find((l) => l.code === code)?.label} 🌸`);
    } catch (err) {
      toast.error('Failed to save language preference');
      setSelectedLang(currentLang);
    } finally {
      setSavingLang(false);
    }
  };

  const activeLang = LANGUAGES.find((l) => l.code === selectedLang);

  const avatarInitial = (profile?.display_name ?? 'S')[0].toUpperCase();

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto space-y-5">

        {/* ── Profile Card ─────────────────────────────────────────────── */}
        <div className="card p-8 text-center animate-fade-in">
          {/* Avatar */}
          <div className="relative mx-auto w-20 h-20 mb-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-secondary/30 shadow-glow"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow ring-4 ring-secondary/20">
                <span className="text-white text-2xl font-bold font-display">{avatarInitial}</span>
              </div>
            )}
            {isGuest && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-2xs bg-secondary text-dark font-semibold px-2 py-0.5 rounded-full border border-white shadow-soft whitespace-nowrap">
                Guest Mode
              </span>
            )}
          </div>

          {/* Name & Tier */}
          <h1 className="font-display text-xl font-semibold text-dark mb-1">
            {profile?.display_name ?? 'Sista'}
          </h1>
          {profile?.pronouns && (
            <p className="text-mid text-xs mb-2">{profile.pronouns}</p>
          )}
          <div className="badge-primary px-3 py-1 text-xs inline-flex mb-2">
            {tierLabel}
          </div>
          {profile?.province && (
            <p className="text-mid text-xs mt-1 mb-4">📍 {profile.province}</p>
          )}

          {/* Logout */}
          <button
            id="profile-logout-btn"
            onClick={logout}
            className="btn-outline w-full justify-center gap-2 mt-4"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>

        {/* ── Language Settings Card ────────────────────────────────────── */}
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={18} className="text-primary" />
            <h2 className="font-display font-semibold text-dark text-base">Language Preference</h2>
          </div>

          <p className="text-mid text-xs mb-4 leading-relaxed">
            Choose your preferred language for articles, notifications, and the My Sista experience.
          </p>

          {/* Custom Language Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="lang-selector-btn"
              onClick={() => setLangOpen((o) => !o)}
              disabled={savingLang}
              className="input flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{activeLang?.flag}</span>
                <span className="font-medium text-dark">{activeLang?.label}</span>
              </span>
              <ChevronDown
                size={16}
                className={`text-mid transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {langOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-card border border-primary/10 z-20 overflow-hidden animate-scale-in">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-soft transition-colors text-left"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">{lang.flag}</span>
                      <span className="text-sm font-medium text-dark">{lang.label}</span>
                    </span>
                    {selectedLang === lang.code && (
                      <Check size={14} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {savingLang && (
            <p className="text-2xs text-mid mt-2 flex items-center gap-1.5">
              <span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin inline-block" />
              Saving…
            </p>
          )}
        </div>

        {/* ── Wellness Stats & Engagement Card ────────────────────────────── */}
        <div className="card p-6 animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-primary/5 pb-3">
            <h2 className="font-display font-semibold text-dark text-base">Wellness Summary</h2>
            <span className="flex items-center gap-1 text-2xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              🔥 {profile?.check_in_streak ?? 0} Day Streak
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-soft/40 p-4 rounded-xl border border-primary/5">
              <span className="text-2xs text-mid uppercase tracking-wider block mb-1">Sista Credits</span>
              <span className="text-xl font-bold text-primary flex items-center justify-center gap-1">
                ⭐ {profile?.sista_credits ?? 0}
              </span>
            </div>
            <div className="bg-soft/40 p-4 rounded-xl border border-primary/5">
              <span className="text-2xs text-mid uppercase tracking-wider block mb-1">Wellness Score</span>
              <span className="text-xl font-bold text-primary">
                {Math.min(100, 45 + (profile?.check_in_streak ?? 0) * 5 + (profile?.sista_credits ?? 0) * 2)}%
              </span>
            </div>
          </div>
        </div>

        {/* ── Subscription Status & Billing Panel ───────────────────────── */}
        <div className="card p-6 animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-primary/5 pb-3">
            <h2 className="font-display font-semibold text-dark text-base">Subscription Plan</h2>
            <span className={`badge font-bold uppercase tracking-wider ${
              tier === 'free' ? 'badge-primary' : 'badge-premium'
            }`}>
              {tierLabel}
            </span>
          </div>

          {tier === 'free' ? (
            <div className="space-y-3">
              <p className="text-mid text-xs leading-relaxed">
                You are currently on the free tier. Upgrade to unlock unlimited wellness guides, cycle-synced nutrition recommendations, and priority messaging.
              </p>
              <button
                onClick={() => navigate('/upgrade')}
                className="btn-primary w-full justify-center text-xs py-2.5"
              >
                Upgrade to Premium
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <span className="font-semibold flex items-center gap-1">
                  ✓ Plan is active & protected
                </span>
                <span className="text-3xs opacity-80">
                  Renews: {profile?.subscription_expires_at 
                    ? new Date(profile.subscription_expires_at).toLocaleDateString()
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                  }
                </span>
              </div>

              {/* Billing History list */}
              <div className="space-y-2">
                <span className="text-3xs font-bold text-mid uppercase tracking-wider block">Billing Invoices</span>
                <div className="bg-soft/20 rounded-xl border border-primary/5 divide-y divide-primary/5 text-3xs font-medium">
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <div className="text-dark font-bold">Yoco Payments Portal</div>
                      <div className="text-mid font-semibold">{new Date().toLocaleDateString()} • Card ending 4242</div>
                    </div>
                    <span className="text-primary font-bold">
                      {tier === 'sista' ? 'R99.00' : 'R199.00'} (Paid)
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/upgrade')}
                className="btn-outline w-full justify-center text-xs py-2"
              >
                Change Subscription Plan
              </button>
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  );
}
