/**
 * src/pages/Feed.jsx
 * Personalised content feed with search and category filters.
 * Integrates cycle phase tracking and Claude-based feed personalisation.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import { MOCK_ARTICLES } from '../lib/mockArticles.js';
import { personaliseFeed } from '../lib/claude.js';
import { Search, Compass, Sparkles, Lock, Flame } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'mental_health', label: 'Mental Health' },
  { id: 'hormonal', label: 'Hormonal' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'spirituality', label: 'Spirituality' },
  { id: 'finance', label: 'Finance' },
];

const PHASE_DETAILS = {
  menstruation: { name: 'Menstruation', emoji: '🩸', slogan: "A time of rest, reflection, and inner wisdom.", season: "Inner Winter" },
  follicular: { name: 'Follicular Phase', emoji: '🌿', slogan: "New beginnings, high energy, and planning.", season: "Inner Spring" },
  ovulatory: { name: 'Ovulatory Phase', emoji: '✨', slogan: "Radiant communication, confidence, and connection.", season: "Inner Summer" },
  luteal: { name: 'Luteal Phase', emoji: '🍂', slogan: "Nesting, boundary-setting, and detail-focus.", season: "Inner Autumn" },
  second_spring: { name: 'Second Spring', emoji: '🌸', slogan: "Your sacred autumn. A powerful transition into self-sovereignty.", season: "Menopause & Beyond" },
};

export default function Feed() {
  const { profile, isGuest, tier } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load cycle info from LocalStorage (from onboarding flow)
  const cyclePhase = localStorage.getItem('mysista-cycle-phase') || 'ovulatory';
  const cycleDay = localStorage.getItem('mysista-cycle-day') || '14';
  const activePhase = PHASE_DETAILS[cyclePhase];

  useEffect(() => {
    async function fetchFeed() {
      try {
        setLoading(true);
        let fetched = [];

        if (isGuest) {
          // Fallback directly to mock data for guest mode
          fetched = [...MOCK_ARTICLES];
        } else {
          // Fetch published articles from Supabase
          const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('is_published', true)
            .order('published_at', { ascending: false });

          if (error) throw error;
          fetched = data && data.length > 0 ? data : [...MOCK_ARTICLES];
        }

        // Apply Claude Personalisation if user profile exists
        if (profile && fetched.length > 0) {
          try {
            const userProfile = {
              age_range: profile.age_range || '25-30',
              wellness_goals: profile.wellness_goals || ['general'],
              content_preferences: profile.content_preferences || ['nutrition'],
            };
            const orderedIds = await personaliseFeed(userProfile, fetched);
            
            if (orderedIds && Array.isArray(orderedIds)) {
              // Sort fetched articles according to Claude's recommendation order
              fetched.sort((a, b) => {
                const idxA = orderedIds.indexOf(a.id);
                const idxB = orderedIds.indexOf(b.id);
                if (idxA === -1 && idxB === -1) return 0;
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
              });
            }
          } catch (curationError) {
            console.warn('[Feed] Personalisation failed, falling back to raw date ordering:', curationError);
          }
        }

        setArticles(fetched);
      } catch (err) {
        console.error('[Feed] Error loading feed articles:', err);
        setArticles([...MOCK_ARTICLES]);
        toast.error('Using fallback offline content 🌸');
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, [profile, isGuest]);

  // Client-side search and category filtering
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === 'all' || article.category === selectedCategory;
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.summary && article.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (article.body && article.body.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <PageWrapper>
      <div className="space-y-8 animate-fade-in">
        
        {/* Cycle Phase Indicator & Slogan Banner */}
        {activePhase && (
          <div className="card p-6 bg-gradient-to-r from-[#F8E0DD]/40 via-[#F0F0E8]/60 to-[#F8E0DD]/30 border border-[#4A5342]/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/3 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="text-4xl p-2.5 bg-white rounded-2xl shadow-sm select-none">
                {activePhase.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display font-bold text-lg text-dark">
                    {activePhase.name}
                  </h2>
                  <span className="badge-primary px-2 py-0.5 text-3xs">
                    {activePhase.season}
                  </span>
                  {cyclePhase !== 'second_spring' && (
                    <span className="flex items-center gap-0.5 text-2xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      <Flame size={10} className="fill-orange-600" />
                      Day {cycleDay}
                    </span>
                  )}
                </div>
                <p className="text-xs text-mid leading-relaxed">
                  {activePhase.slogan}
                </p>
              </div>
            </div>
            
            <Link to="/profile" className="btn-outline btn-sm shrink-0 justify-center">
              Adjust Rhythm
            </Link>
          </div>
        )}

        {/* Title area & Search / Filters controls */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="section-title text-gradient">Sanctuary Feed</h1>
              <p className="section-subtitle">Articles aligned to your body's wisdom.</p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-mid">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search articles, guides, recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Horizontal Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={[
                  'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200',
                  selectedCategory === cat.id
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-soft text-mid hover:text-primary hover:bg-primary/5',
                ].join(' ')}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Feed list */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card p-4 space-y-4 animate-pulse">
                <div className="w-full h-48 bg-soft rounded-xl" />
                <div className="h-6 bg-soft rounded w-3/4" />
                <div className="h-4 bg-soft rounded w-5/6" />
                <div className="h-4 bg-soft rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-soft/30 rounded-2xl border border-primary/5">
            <Compass size={40} className="text-mid mx-auto mb-3" />
            <h3 className="font-display font-semibold text-lg text-dark mb-1">No articles found</h3>
            <p className="text-mid text-sm">Try modifying your search queries or clearing the filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const isLocked = article.is_premium && tier === 'free';
              return (
                <article
                  key={article.id}
                  className="card-hover overflow-hidden flex flex-col h-full bg-white group"
                >
                  {/* Cover Image Wrapper */}
                  <div className="relative h-48 w-full overflow-hidden bg-soft">
                    {article.cover_image_url ? (
                      <img
                        src={article.cover_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-brand/10 flex items-center justify-center">
                        <Sparkles className="text-primary/30" size={32} />
                      </div>
                    )}
                    
                    {/* Category Overlay Badge */}
                    <span className="absolute top-3 left-3 badge-secondary px-2.5 py-1 text-3xs font-semibold shadow-sm uppercase tracking-wider">
                      {article.category}
                    </span>

                    {/* Premium / Lock Status indicator overlay */}
                    {article.is_premium && (
                      <span className="absolute top-3 right-3 badge-premium px-2.5 py-1 text-3xs font-semibold flex items-center gap-1 shadow-sm">
                        {isLocked ? <Lock size={10} /> : <Sparkles size={10} />}
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-dark text-base leading-snug group-hover:text-primary transition-colors">
                        <Link to={`/article/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-mid line-clamp-3">
                        {article.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-primary/5 mt-4 flex items-center justify-between text-3xs font-semibold text-mid">
                      <span>By {article.author_name || 'Sista Wellness'}</span>
                      <span>{article.read_time_minutes} min read</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
