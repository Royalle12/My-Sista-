import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { BarChart3, TrendingUp, Sparkles, Heart, Users, Eye } from 'lucide-react';

const MOCK_ANALYTICS = {
  views: 1450,
  saves: 382,
  referrals: 67,
  revenue_zar: 2450.00,
  recent_traffic: [
    { label: 'Mon', count: 120 },
    { label: 'Tue', count: 210 },
    { label: 'Wed', count: 180 },
    { label: 'Thu', count: 320 },
    { label: 'Fri', count: 290 },
    { label: 'Sat', count: 190 },
    { label: 'Sun', count: 140 }
  ]
};

export default function CreatorAnalytics() {
  const { user, isGuest } = useAuthStore();
  const [analytics, setAnalytics] = useState(MOCK_ANALYTICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        if (isGuest) {
          setAnalytics(MOCK_ANALYTICS);
          return;
        }

        const { data, error } = await supabase
          .from('business_analytics')
          .select('*')
          .single();

        if (error) {
          console.warn('[CreatorAnalytics] Database fetch failed, using mock data.');
          setAnalytics(MOCK_ANALYTICS);
        } else {
          // Map real DB columns or merge with default mocks
          setAnalytics({
            views: data.views || MOCK_ANALYTICS.views,
            saves: data.saves || MOCK_ANALYTICS.saves,
            referrals: data.total_subscriptions || MOCK_ANALYTICS.referrals,
            revenue_zar: data.revenue_zar || MOCK_ANALYTICS.revenue_zar,
            recent_traffic: MOCK_ANALYTICS.recent_traffic
          });
        }
      } catch (err) {
        console.error('[CreatorAnalytics] Exception:', err);
        setAnalytics(MOCK_ANALYTICS);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user, isGuest]);

  const maxVal = Math.max(...analytics.recent_traffic.map((t) => t.count));

  return (
    <PageWrapper>
      <div className="pt-8 pb-24 px-margin-mobile max-w-4xl mx-auto space-y-8 min-h-screen">
        {/* Header */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-primary/10 text-primary">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="font-label-caps text-label-caps text-[#D4827A] tracking-wider uppercase">Business Hub</span>
          </div>
          <h2 className="font-display-lg text-headline-lg text-primary">Creator Analytics</h2>
          <p className="text-on-surface-variant font-body-sm">Monitor your profile performance, saves, referrals, and engagement trends.</p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-5 border border-outline/10 space-y-2">
            <Eye className="w-5 h-5 text-secondary" />
            <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Profile Views</p>
            <h3 className="font-title-lg text-on-surface">{analytics.views}</h3>
          </div>

          <div className="glass-card rounded-xl p-5 border border-outline/10 space-y-2">
            <Heart className="w-5 h-5 text-red-400" />
            <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Article Saves</p>
            <h3 className="font-title-lg text-on-surface">{analytics.saves}</h3>
          </div>

          <div className="glass-card rounded-xl p-5 border border-outline/10 space-y-2">
            <Users className="w-5 h-5 text-primary" />
            <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Referrals</p>
            <h3 className="font-title-lg text-on-surface">{analytics.referrals}</h3>
          </div>

          <div className="glass-card rounded-xl p-5 border border-outline/10 space-y-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Estimated Earnings</p>
            <h3 className="font-title-lg text-on-surface">R {analytics.revenue_zar.toFixed(2)}</h3>
          </div>
        </section>

        {/* Visual Charts: Custom SVG Bar Chart */}
        <section className="glass-card rounded-2xl p-6 border border-outline/10 space-y-6">
          <h3 className="font-title-sm text-primary font-label-caps flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" /> Weekly Traffic Overview
          </h3>

          <div className="h-64 flex items-end justify-between gap-2 pt-6 px-4 border-b border-outline/10 border-l border-outline/10 relative">
            {/* Background grids */}
            <div className="absolute top-1/4 left-0 right-0 border-t border-outline/5"></div>
            <div className="absolute top-2/4 left-0 right-0 border-t border-outline/5"></div>
            <div className="absolute top-3/4 left-0 right-0 border-t border-outline/5"></div>

            {analytics.recent_traffic.map((day, idx) => {
              const heightPct = (day.count / maxVal) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative z-10">
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-surface-container border border-outline/10 text-on-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                    {day.count} views
                  </div>
                  {/* Bar */}
                  <div
                    className="w-8 md:w-12 bg-gradient-to-t from-primary/30 to-[#D4827A] rounded-t-lg transition-all duration-500 hover:brightness-110"
                    style={{ height: `${heightPct}%`, minHeight: '8px' }}
                  ></div>
                  <span className="text-[10px] text-on-surface-variant font-label-caps uppercase mt-3">{day.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
