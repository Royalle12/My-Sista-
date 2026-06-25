/**
 * src/pages/Landing.jsx
 * Public brand entry & landing — Dark Sanctuary splash, hero, features, pricing, CTA.
 */

import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Flame, ShoppingBag, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Personalised Content',
    desc: 'Articles curated to your wellness goals — nutrition, hormonal health, mental wellness, and more.',
  },
  {
    icon: Flame,
    title: 'Daily Check-In',
    desc: 'Track your mood, energy, and sleep every day. Build streaks. Watch your wellness score grow.',
  },
  {
    icon: Sparkles,
    title: 'Sista AI Companion',
    desc: 'Get instant, evidence-based wellness guidance from Lilitha, an AI that speaks your language.',
  },
  {
    icon: ShoppingBag,
    title: 'Happy Splurge',
    desc: 'Discover curated wellness products recommended in context — right inside the articles you love.',
  },
];

const TIERS = [
  {
    name: 'Free Sista',
    price: 'R0',
    period: '/month',
    perks: ['10 articles/month', 'Daily check-in', 'Wellness tracking'],
    cta: 'Start Free',
    to: '/auth',
    highlighted: false,
  },
  {
    name: 'Sista Premium',
    price: 'R99',
    period: '/month',
    perks: ['Unlimited content', 'Unlimited bookmarks', 'Wellness Score tracking', 'Community Access'],
    cta: 'Join Premium',
    to: '/auth',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Sista Gold',
    price: 'R199',
    period: '/month',
    perks: ['Everything in Premium', 'Exclusive premium content', 'Live wellness sessions', 'Direct Messaging'],
    cta: 'Go Gold',
    to: '/auth',
    highlighted: false,
  },
];

export default function Landing() {
  const { isAuthenticated, loginAsGuest } = useAuth();

  return (
    <div className="min-h-screen bg-surface font-body overflow-x-hidden relative">
      
      {/* CSS Floating Particles for Dark Sanctuary Splash */}
      <style>{`
        @keyframes float-particle {
          0% { transform: translateY(100vh) translateX(0px) scale(0.5); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-10vh) translateX(100px) scale(1.2); opacity: 0; }
        }
        .particle {
          position: absolute;
          bottom: 0;
          width: 6px;
          height: 6px;
          background-color: rgba(248, 224, 221, 0.4);
          border-radius: 50%;
          pointer-events: none;
        }
        .p1 { left: 10%; animation: float-particle 12s infinite linear; }
        .p2 { left: 30%; animation: float-particle 15s infinite linear; animation-delay: 2s; }
        .p3 { left: 55%; animation: float-particle 10s infinite linear; animation-delay: 5s; }
        .p4 { left: 75%; animation: float-particle 18s infinite linear; animation-delay: 1s; }
        .p5 { left: 90%; animation: float-particle 14s infinite linear; animation-delay: 4s; }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-50 h-[var(--nav-height)] border-b border-white/5 bg-transparent">
        <div className="container-app h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-soft ring-1 ring-white/20">
              <img src="/my_sista_logo.jpg" alt="S" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-semibold text-lg text-white">
              My <span className="text-secondary-200">Sista</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/feed" className="btn-primary btn-sm">Enter Feed</Link>
            ) : (
              <>
                <Link to="/auth" id="landing-signin" className="text-white/80 hover:text-white transition-colors text-sm font-medium px-3 py-1.5">
                  Sign In
                </Link>
                <Link to="/auth" id="landing-cta-nav" className="btn-primary btn-sm">
                  Join Us
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Brand Entrance / Splash Hero ────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#2D2322] via-[#1E1615] to-[#241A19] relative px-4 text-center overflow-hidden">
        {/* Dynamic decorative warm rose gradient blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[32rem] h-[32rem] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating background particles */}
        <div className="particle p1" />
        <div className="particle p2" />
        <div className="particle p3" />
        <div className="particle p4" />
        <div className="particle p5" />

        <div className="max-w-2xl z-10 flex flex-col items-center animate-fade-in">
          {/* Pulsing circular container for official logo */}
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-[#F5ECE8] p-1 shadow-glow hover:shadow-card transition-all duration-500 scale-[1.02] hover:scale-105 animate-pulse-soft mb-8 border border-secondary/20 flex items-center justify-center overflow-hidden">
            <img 
              src="/my_sista_logo.jpg" 
              alt="My Sista Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Rise, Sista.<br />
            Your cycle is your <span className="text-secondary">power.</span>
          </h1>

          <p className="text-secondary-200/80 text-base md:text-lg max-w-lg mb-10 leading-relaxed font-light">
            A sanctuary built for women. Connect with your rhythm, harness your hormones, and thrive alongside your sisters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
            <Link 
              to="/auth" 
              id="hero-cta-primary" 
              className="w-full sm:w-auto btn-primary btn-lg flex items-center justify-center gap-2 bg-gradient-brand text-white border border-transparent shadow-card hover:bg-none hover:bg-secondary hover:text-dark"
            >
              Enter the Circle
              <ArrowRight size={18} />
            </Link>
            
            <button 
              onClick={loginAsGuest} 
              id="hero-cta-guest" 
              className="w-full sm:w-auto px-8 py-3.5 text-base font-medium rounded-2xl text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              Explore as Guest
            </button>
          </div>

          <a 
            href="#features" 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/80 transition-colors flex flex-col items-center gap-1 animate-bounce"
          >
            <span className="text-2xs uppercase tracking-widest font-medium">Discover More</span>
            <ChevronDown size={18} />
          </a>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-surface relative border-t border-primary/5">
        <div className="container-app">
          <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold text-primary mb-4">
              <Sparkles size={12} className="text-primary" />
              <span>Designed For You</span>
            </div>
            <h2 className="section-title text-dark">Everything you need to thrive</h2>
            <p className="section-subtitle max-w-xl mx-auto text-mid">
              My Sista brings together cycle tracking, hormone-based wellness insights, supportive sister circles, and curated products.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover p-8 bg-white border border-primary/5 rounded-2xl transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-dark mb-2">{title}</h3>
                <p className="text-mid text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gradient-soft relative">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="section-title text-dark">Simple, honest pricing</h2>
            <p className="section-subtitle text-mid">Choose the path that fits your journey. Upgrades support the sisterhood.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TIERS.map(({ name, price, period, perks, cta, to, highlighted, badge }) => (
              <div
                key={name}
                className={[
                  'card p-8 bg-white/80 backdrop-blur-sm relative flex flex-col',
                  highlighted ? 'ring-2 ring-primary shadow-glow bg-white' : '',
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
                <ul className="space-y-3.5 mb-8 flex-1">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-dark">
                      <Check size={16} className="text-primary mt-0.5 shrink-0" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={to}
                  id={`pricing-cta-${name.toLowerCase().replace(/\s+/g, '-')}`}
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
      <footer className="py-12 bg-[#2C3228] text-mid relative">
        <div className="container-app flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-white/10">
              <img src="/my_sista_logo.jpg" alt="S" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-medium">My Sista</span>
          </div>
          <p className="text-center text-white/50">© 2026 My Sista · Supporting you, every step · Made with 🌸 in South Africa</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white/80 transition-colors text-white/60">Privacy Policy</a>
            <a href="#" className="hover:text-white/80 transition-colors text-white/60">Terms of Use</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
