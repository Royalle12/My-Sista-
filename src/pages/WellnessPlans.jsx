import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Calendar, Compass, ShieldCheck, Flame, BookOpen, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Cycle Syncing', 'Second Spring', 'Mindfulness', 'Nutrition'];

const MOCK_PLANS = [
  {
    id: '1',
    title: '7-Day Cycle Realignment',
    description: 'Sync your diet, exercise, and productivity with the four distinct phases of your monthly rhythm.',
    duration_days: 7,
    category: 'Cycle Syncing',
    difficulty: 'Easy',
    is_active: true,
    progress: 42,
    tasks_per_day: 3
  },
  {
    id: '2',
    title: 'Second Spring Comfort',
    description: 'Grounding rituals and dietary adjustments designed to ease perimenopause hot flashes and mood fluctuations.',
    duration_days: 14,
    category: 'Second Spring',
    difficulty: 'Medium',
    is_active: false,
    progress: 0,
    tasks_per_day: 2
  },
  {
    id: '3',
    title: 'Mindful Breathing Sanctuary',
    description: 'Ancestral breathing techniques and silent reflections to calm cortisol and realign inner peace.',
    duration_days: 5,
    category: 'Mindfulness',
    difficulty: 'Beginner',
    is_active: false,
    progress: 0,
    tasks_per_day: 1
  }
];

export default function WellnessPlans() {
  const isGuest = useAuthStore((state) => state.isGuest);
  const [plans, setPlans] = useState(MOCK_PLANS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        if (isGuest) {
          setPlans(MOCK_PLANS);
          return;
        }

        const { data, error } = await supabase
          .from('wellness_plans')
          .select('*');

        if (error) {
          console.warn('[WellnessPlans] Database fetch failed. Using mock plans.');
          setPlans(MOCK_PLANS);
        } else {
          // Merge real DB items with progress metrics
          const mapped = data && data.length > 0 ? data.map((plan, idx) => ({
            ...plan,
            progress: idx === 0 ? 42 : 0, // Mock active progress for first plan
            is_active: idx === 0
          })) : MOCK_PLANS;
          setPlans(mapped);
        }
      } catch (err) {
        console.error('[WellnessPlans] Load exception:', err);
        setPlans(MOCK_PLANS);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, [isGuest]);

  const filteredPlans = plans.filter(
    (plan) => selectedCategory === 'All' || plan.category === selectedCategory
  );

  return (
    <PageWrapper>
      <div className="pt-8 pb-24 px-margin-mobile max-w-4xl mx-auto space-y-8 min-h-screen">
        {/* Header */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-primary/10 text-primary">
              <Compass className="w-4 h-4" />
            </span>
            <span className="font-label-caps text-label-caps text-[#D4827A] tracking-wider uppercase">Wellness Plans</span>
          </div>
          <h2 className="font-display-lg text-headline-lg text-primary">Wellness & Cycle Pathways</h2>
          <p className="text-on-surface-variant font-body-sm">
            Curated daily steps, lifestyle modifications, and nutrition rituals mapped to support your body's wisdom.
          </p>
        </section>

        {/* Categories Chip Filters */}
        <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <Filter className="w-4 h-4 text-outline-variant flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-caps text-label-caps transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Plans Browser */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
            <p className="text-on-surface-variant text-body-sm font-label-caps">Loading wellness pathways...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="glass-card rounded-2xl p-6 border border-outline/10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-label-caps bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/25">
                      {plan.category}
                    </span>
                    <span className="text-[10px] font-label-caps text-on-surface-variant">
                      • {plan.duration_days} Days
                    </span>
                  </div>

                  <h3 className="font-title-md text-on-surface group-hover:text-primary transition-colors">{plan.title}</h3>
                  <p className="text-on-surface-variant text-body-sm max-w-xl leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Progress Indicator */}
                  {plan.is_active && (
                    <div className="space-y-1 pt-1.5 max-w-sm">
                      <div className="flex justify-between text-[10px] font-label-caps text-on-surface-variant">
                        <span>Current Progress</span>
                        <span>{plan.progress}%</span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                        <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${plan.progress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to={`/wellness-plans/${plan.id}`}
                  className={`px-6 py-2.5 rounded-xl font-label-caps text-xs text-center font-bold tracking-wide transition-all active:scale-95 flex-shrink-0 self-stretch md:self-auto flex items-center justify-center ${
                    plan.is_active
                      ? 'bg-secondary text-on-secondary hover:brightness-110 shadow-lg shadow-secondary/10'
                      : 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary'
                  }`}
                >
                  {plan.is_active ? 'Resume Plan' : 'Explore Plan'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
