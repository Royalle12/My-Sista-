/**
 * src/pages/Landing.jsx
 * Public landing page — hero, features, tier pricing preview, CTA.
 * Task 001 scaffold version — full brand treatment.
 */

import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Flame, ShoppingBag, ArrowRight, Check } from 'lucide-react';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Personalised Content',
    desc:  'Articles curated to your wellness goals — nutrition, hormonal health, mental wellness, and more.',
  },
  {
    icon: Flame,
    title: 'Daily Check-In',
    desc:  'Track your mood, energy, and sleep every day. Build streaks. Watch your wellness score grow.',
  },
  {
    icon: Sparkles,
    title: 'Sista AI Companion',
    desc:  'Get instant, evidence-based wellness guidance from an AI that speaks your language.',
  },
  {
    icon: ShoppingBag,
    title: 'Happy Splurge',
    desc:  'Discover curated wellness products recommended in context — right inside the articles you love.',
  },
];

const TIERS = [
  {
    name: 'Free',
    price: 'R0',
    period: '/month',
    perks: ['10 articles/month', '10 bookmarks', 'Daily check-in'],
    cta: 'Start Free',
    to: '/auth',
    highlighted: false,
  },
  {
    name: 'Sista',
    price: 'R99',
    period: '/month',
    perks: ['Unlimited content', 'Unlimited bookmarks', 'Wellness Score', 'Community (coming soon)'],
    cta: 'Join Sista',
    to: '/auth',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Sista+',
    price: 'R199',
    period: '/month',
    perks: ['Everything in Sista', 'Premium content', 'Live sessions', 'Direct messaging'],
    cta: 'Go Plus',
    to: '/auth',
    highlighted: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface font-body">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[var(--nav-height)] bg-surface/80 backdrop-blur-md border-b border-primary/8">
        <div className="container-app h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-soft">
              <span className="text-white text-sm font-bold font-display">S</span>
            </div>
            <span className="font-display font-semibold text-lg text-dark">
              My <span className="text-gradient">Sista</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" id="landing-signin" className="btn-ghost btn-sm hidden sm:flex">Sign In</Link>
            <Link to="/auth" id="landing-cta-nav" className="btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-[var(--nav-height)] min-h-screen flex items-center bg-gradient-soft relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-app py-20 relative z-10">
          <div className="max-w-2xl animate-fade-in">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/15 shadow-soft mb-6">
              <Sparkles size={14} className="text-secondary" />
              <span className="text-xs font-medium text-mid">Wellness. Community. Growth.</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-dark leading-tight mb-6">
              Your wellness<br />
              journey starts<br />
              <span className="text-gradient">here, Sista.</span>
            </h1>

            <p className="text-mid text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Personalised content, daily check-ins, and a community built for women aged 25–45 who are doing the work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth" id="hero-cta-primary" className="btn-primary btn-lg">
                Start for Free
                <ArrowRight size={18} />
              </Link>
              <Link to="#features" id="hero-cta-secondary" className="btn-outline btn-lg">
                See How It Works
              </Link>
            </div>

            <p className="mt-6 text-sm text-mid">
              No credit card required · Free plan always available · ZAR pricing
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-surface">
        <div className="container-app">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="section-title">Everything you need to thrive</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              My Sista brings together personalised content, wellness tracking, and smart product recommendations in one beautiful space.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover p-6 group">
                <div className="w-12 h-12 rounded-2xl bg-soft flex items-center justify-center mb-4 group-hover:bg-gradient-brand transition-all duration-300">
                  <Icon size={22} className="text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-display font-semibold text-dark mb-2">{title}</h3>
                <p className="text-mid text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gradient-soft">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="section-title">Simple, honest pricing</h2>
            <p className="section-subtitle">Annual plans include 2 months free.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TIERS.map(({ name, price, period, perks, cta, to, highlighted, badge }) => (
              <div
                key={name}
                className={[
                  'card p-8 relative flex flex-col',
                  highlighted ? 'ring-2 ring-primary shadow-glow' : '',
                ].join(' ')}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-premium px-4 py-1 text-xs">{badge}</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display font-semibold text-dark text-xl mb-1">{name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gradient">{price}</span>
                    <span className="text-mid text-sm">{period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-dark">
                      <Check size={16} className="text-primary mt-0.5 shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  to={to}
                  id={`pricing-cta-${name.toLowerCase().replace('+', 'plus')}`}
                  className={highlighted ? 'btn-primary w-full justify-center' : 'btn-outline w-full justify-center'}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-12 bg-dark text-mid">
        <div className="container-app flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white text-xs font-bold font-display">S</span>
            </div>
            <span className="text-surface font-medium">My Sista</span>
          </div>
          <p className="text-center">© 2026 My Sista · Made with 🌸 in South Africa</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-surface transition-colors">Privacy</a>
            <a href="#" className="hover:text-surface transition-colors">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
