import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Sun, Scissors, Brain, Utensils, Moon, Briefcase, Users, Heart, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { label: 'All Hacks', value: null, emoji: null },
  { label: 'Hormones', value: 'hormones', emoji: '✨' },
  { label: 'Nourishment', value: 'nourishment', emoji: '🍲' },
  { label: 'Energy', value: 'energy', emoji: '⚡' },
  { label: 'Rituals', value: 'rituals', emoji: '💆‍♀️' },
  { label: 'Sleep', value: 'sleep', emoji: '🌙' },
  { label: 'Career', value: 'career', emoji: '💼' },
];

const STATIC_HACKS = [
  {
    icon: <Sun className="w-6 h-6 text-primary" />,
    title: 'Sun Protection',
    subtitle: 'Melanin & SPF',
    body: 'Sunscreen is for everyone. Find the perfect cast-free formula to protect every beautiful shade of skin from UV damage.',
    cta: 'Protect Glow',
    category: 'rituals',
    slug: 'sun-protection',
  },
  {
    icon: <Scissors className="w-6 h-6 text-primary" />,
    title: 'Hair Rituals',
    subtitle: 'Diverse Texture Love',
    body: 'From protective braids to silk presses, learn how to honor your crown with ancestral oils and modern hydration.',
    cta: 'Honor Your Crown',
    category: 'rituals',
    slug: 'hair-rituals',
  },
  {
    icon: <Brain className="w-6 h-6 text-primary" />,
    title: 'Mindfulness',
    subtitle: 'Multi-Cultural Zen',
    body: "Explore the 'Ubuntu' philosophy or Japanese 'Ikigai' to find your purpose and inner peace through global perspectives.",
    cta: 'Find Center',
    category: 'hormones',
    slug: 'mindfulness',
  },
  {
    icon: <Utensils className="w-6 h-6 text-primary" />,
    title: 'Global Plates',
    subtitle: 'Ancestral Healing',
    body: 'Discover the anti-inflammatory power of Turmeric, Teff, and Hibiscus used in traditional kitchens for centuries.',
    cta: 'Nourish Self',
    category: 'nourishment',
    slug: 'global-plates',
  },
  {
    icon: <Moon className="w-6 h-6 text-primary" />,
    title: 'Sleep',
    subtitle: 'The Night Silk Hack',
    body: 'The universal importance of silk wraps and pillowcases for hair health and skin hydration during restorative rest.',
    cta: 'Sleep Softly',
    category: 'sleep',
    slug: 'night-silk',
  },
  {
    icon: <Briefcase className="w-6 h-6 text-primary" />,
    title: 'Career',
    subtitle: 'Authentic Voice',
    body: 'Tips on navigating professional spaces while staying true to your cultural identity and setting healthy boundaries.',
    cta: 'Lead Boldly',
    category: 'career',
    slug: 'authentic-voice',
  },
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: 'Collective Care',
    subtitle: 'Circle of Support',
    body: "How 'Village Mentality' can fight loneliness. Build your local tribe and global network of support.",
    cta: 'Join Circle',
    category: 'rituals',
    slug: 'collective-care',
  },
  {
    icon: <Heart className="w-6 h-6 text-primary" />,
    title: 'Wellness',
    subtitle: 'Holistic Healing',
    body: 'Integrate ancient African, Asian, and Indigenous healing practices into your modern everyday routine.',
    cta: 'Explore',
    category: 'hormones',
    slug: 'holistic-healing',
  },
];

export default function DIYHub() {
  const navigate = useNavigate();
  const isGuest = useAuthStore((state) => state.isGuest);
  const [hacks, setHacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    async function fetchHacks() {
      try {
        setLoading(true);
        if (isGuest) {
          setHacks([]);
          return;
        }
        let query = supabase.from('sista_hacks').select('*');
        const { data, error } = await query;
        if (error) throw error;
        setHacks(data || []);
      } catch (err) {
        console.error('[DIYHub] Error loading hacks:', err);
        setHacks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHacks();
  }, [isGuest]);

  const liveItems = activeCategory
    ? hacks.filter((h) => h.category === activeCategory)
    : hacks;

  const staticItems = activeCategory
    ? STATIC_HACKS.filter((h) => h.category === activeCategory)
    : STATIC_HACKS;

  const displayItems = hacks.length > 0 ? liveItems : staticItems;

  return (
    <PageWrapper>
      <main className="pt-8 pb-32 px-margin-mobile max-w-7xl mx-auto min-h-screen">
        {/* Hero */}
        <section className="mb-8 animate-fade-in">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-2">
            Global Sisterhood Hacks
          </h1>
          <p className="text-on-surface-variant font-body-lg max-w-xl mb-6">
            An inclusive sanctuary for curated wellness wisdom from every corner of the globe. Celebrate our diverse rituals and shared strength.
          </p>

          {/* Category Chips */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-label-caps text-label-caps transition-all active:scale-95 ${
                  activeCategory === cat.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary'
                }`}
              >
                {cat.emoji ? `${cat.emoji} ` : ''}{cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Bento Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-6 h-64 animate-pulse bg-surface-variant"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayItems.map((hack, idx) => {
              const isLive = hacks.length > 0;
              const hackId = isLive ? hack.id : hack.slug;
              const icon = isLive ? null : hack.icon;
              return (
                <div
                  key={hackId || idx}
                  className="glass-card rounded-xl p-6 flex flex-col justify-between group hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => navigate(`/diy/${hackId}`)}
                >
                  <div>
                    <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center mb-4 group-hover:bg-primary-container/60 transition-colors">
                      {icon || <Heart className="w-6 h-6 text-primary" />}
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface mb-2">
                      {isLive ? hack.title : hack.title}
                    </h3>
                    <h4 className="text-secondary font-semibold text-sm mb-2">
                      {isLive ? (hack.subtitle || hack.category) : hack.subtitle}
                    </h4>
                    <p className="text-on-surface-variant text-body-sm mb-6">
                      {isLive ? hack.description : hack.body}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/diy/${hackId}`); }}
                    className="w-full bg-secondary hover:brightness-110 text-on-secondary py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-secondary/10 flex items-center justify-center gap-2"
                  >
                    {isLive ? 'Explore Hack' : hack.cta}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </PageWrapper>
  );
}
