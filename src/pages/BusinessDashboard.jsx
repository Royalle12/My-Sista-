/**
 * src/pages/BusinessDashboard.jsx
 * Screen 4 — Business Dashboard for B2B business owners
 * Tables: businesses, business_analytics (view)
 * Reads ?payment=success from URL params and shows toast
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import {
  Briefcase, Eye, MousePointer, Banknote, Package,
  TrendingUp, TrendingDown, Activity, ArrowRight,
  Download, CheckCircle, Sparkles, Clock, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';


/* ─── Mock Data ──────────────────────────────────────────────────────── */

const MOCK_BUSINESS = {
  id: 'mock-biz',
  business_name: 'Amara Beauty Co.',
  is_verified: true,
  subscription_tier: 'growth',
  industry: 'Beauty & Skincare',
};

const MOCK_STATS = {
  totalViews: 12_847,
  viewsChange: 14.2,
  clickThroughs: 3_561,
  clicksChange: 8.7,
  revenue: 48_320,
  revenueChange: 22.1,
  activeProducts: 34,
  productsChange: -2.3,
};

const generateViewsData = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
      views: Math.floor(250 + Math.random() * 400 + (30 - i) * 8),
    });
  }
  return data;
};

const MOCK_REVENUE_BY_CATEGORY = [
  { category: 'Skincare', revenue: 18400 },
  { category: 'Haircare', revenue: 12600 },
  { category: 'Wellness', revenue: 9200 },
  { category: 'Fragrance', revenue: 5100 },
  { category: 'Coaching', revenue: 3020 },
];

const MOCK_ACTIVITY = [
  { id: 1, type: 'view',     text: 'Glow Serum Pro received 42 views',         time: '2 min ago',  icon: Eye },
  { id: 2, type: 'click',    text: 'Someone clicked through to your shop link', time: '18 min ago', icon: MousePointer },
  { id: 3, type: 'follower', text: 'New follower: @thando_wellness',            time: '1 hr ago',   icon: UserPlus },
  { id: 4, type: 'view',     text: 'Natural Hair Butter trending in Feed',      time: '2 hrs ago',  icon: TrendingUp },
  { id: 5, type: 'click',    text: '12 link clicks on your latest article',     time: '5 hrs ago',  icon: MousePointer },
  { id: 6, type: 'revenue',  text: 'R1,240 in affiliate revenue today',         time: '8 hrs ago',  icon: Banknote },
];

const TIER_LABELS = {
  starter: { label: 'Starter', color: 'bg-purple-100 text-purple-700' },
  growth:  { label: 'Growth',  color: 'bg-pink-100 text-pink-700' },
  premium: { label: 'Premium', color: 'bg-amber-100 text-amber-700' },
};


/* ─── Animated Counter Hook ──────────────────────────────────────────── */

function useAnimatedCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return value;
}


/* ─── Stat Card Component ────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, change, prefix = '', isCurrency }) {
  const animatedValue = useAnimatedCounter(value);
  const isPositive = change >= 0;

  const displayValue = isCurrency
    ? `${prefix}R${animatedValue.toLocaleString('en-ZA')}`
    : `${prefix}${animatedValue.toLocaleString('en-ZA')}`;

  return (
    <div className="card p-5 space-y-3 group hover:shadow-glow transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
          <Icon size={18} className="text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-1 ${
          isPositive
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-red-50 text-red-500'
        }`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-dark tracking-tight">
          {displayValue}
        </div>
        <div className="text-xs text-mid mt-0.5">{label}</div>
      </div>
    </div>
  );
}


/* ─── Custom Tooltip ─────────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label, isCurrency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-primary/10 rounded-xl shadow-card px-4 py-2.5">
      <p className="text-2xs text-mid font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-display font-bold text-dark">
          {isCurrency ? `R${p.value.toLocaleString('en-ZA')}` : p.value.toLocaleString('en-ZA')}
        </p>
      ))}
    </div>
  );
}


/* ─── Main Component ─────────────────────────────────────────────────── */

export default function BusinessDashboard() {
  const { user, profile, isGuest } = useAuth();
  const [searchParams] = useSearchParams();

  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState(MOCK_STATS);
  const [viewsData, setViewsData] = useState([]);
  const [revenueData, setRevenueData] = useState(MOCK_REVENUE_BY_CATEGORY);
  const [activity, setActivity] = useState(MOCK_ACTIVITY);
  const [loading, setLoading] = useState(true);

  /* ── Payment success toast ─────────────────────────────────────────── */
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast.success('Payment confirmed! Your plan is now active 🎉', {
        duration: 5000,
        icon: '✨',
      });
    }
  }, [searchParams]);

  /* ── Load business & analytics ─────────────────────────────────────── */
  const loadDashboard = useCallback(async () => {
    setViewsData(generateViewsData());

    if (isGuest) {
      const stored = localStorage.getItem('mysista-business-dashboard');
      if (stored) {
        const parsed = JSON.parse(stored);
        setBusiness(parsed.business || MOCK_BUSINESS);
        setStats(parsed.stats || MOCK_STATS);
      } else {
        setBusiness(MOCK_BUSINESS);
      }
      setLoading(false);
      return;
    }

    try {
      // Fetch business profile
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (bizData) {
        setBusiness(bizData);

        // Try to fetch analytics
        try {
          const { data: analyticsData } = await supabase
            .from('business_analytics')
            .select('*')
            .eq('business_id', bizData.id)
            .single();

          if (analyticsData) {
            setStats({
              totalViews: analyticsData.total_views ?? MOCK_STATS.totalViews,
              viewsChange: analyticsData.views_change ?? MOCK_STATS.viewsChange,
              clickThroughs: analyticsData.click_throughs ?? MOCK_STATS.clickThroughs,
              clicksChange: analyticsData.clicks_change ?? MOCK_STATS.clicksChange,
              revenue: analyticsData.revenue ?? MOCK_STATS.revenue,
              revenueChange: analyticsData.revenue_change ?? MOCK_STATS.revenueChange,
              activeProducts: analyticsData.active_products ?? MOCK_STATS.activeProducts,
              productsChange: analyticsData.products_change ?? MOCK_STATS.productsChange,
            });
          }
        } catch {
          // Analytics view may not exist yet — keep mock data
        }
      } else {
        setBusiness(MOCK_BUSINESS);
      }
    } catch {
      setBusiness(MOCK_BUSINESS);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isGuest]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ── Tier info ─────────────────────────────────────────────────────── */
  const tierKey = business?.subscription_tier || 'starter';
  const tier = TIER_LABELS[tierKey] || TIER_LABELS.starter;

  /* ── Loading skeleton ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
          <div className="h-20 rounded-2xl bg-soft animate-pulse-soft" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-soft animate-pulse-soft" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="h-64 rounded-2xl bg-soft animate-pulse-soft" />
            <div className="h-64 rounded-2xl bg-soft animate-pulse-soft" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#4A5342] to-[#2C3228] rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Briefcase size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display font-bold text-xl sm:text-2xl">
                  {business?.business_name || 'Your Business'}
                </h1>
                {business?.is_verified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-200 rounded-full px-2.5 py-0.5 text-3xs font-bold">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-3xs font-bold ${tier.color}`}>
                  <Sparkles size={10} /> {tier.label} Plan
                </span>
                {business?.industry && (
                  <span className="text-white/50 text-2xs">{business.industry}</span>
                )}
              </div>
            </div>
            <Link
              to="/business/upgrade"
              className="btn-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/15 rounded-xl text-xs font-semibold px-4 py-2 transition-all flex items-center gap-1.5 self-start"
            >
              Upgrade <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* ── Stats Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Eye}
            label="Total Views"
            value={stats.totalViews}
            change={stats.viewsChange}
          />
          <StatCard
            icon={MousePointer}
            label="Click-throughs"
            value={stats.clickThroughs}
            change={stats.clicksChange}
          />
          <StatCard
            icon={Banknote}
            label="Revenue This Month"
            value={stats.revenue}
            change={stats.revenueChange}
            isCurrency
          />
          <StatCard
            icon={Package}
            label="Active Products"
            value={stats.activeProducts}
            change={stats.productsChange}
          />
        </div>

        {/* ── Charts Section ────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Views Over Time — Line Chart */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-dark text-sm">Views Over Time</h3>
                <p className="text-2xs text-mid">Last 30 days</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-soft flex items-center justify-center">
                <Eye size={14} className="text-primary" />
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#7A8070' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E8E8E0' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#7A8070' }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#4A5342"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#4A5342', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Category — Bar Chart */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-dark text-sm">Revenue by Category</h3>
                <p className="text-2xs text-mid">This month</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-soft flex items-center justify-center">
                <Banknote size={14} className="text-primary" />
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E0" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: '#7A8070' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E8E8E0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#7A8070' }}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                    tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<ChartTooltip isCurrency />} />
                  <Bar
                    dataKey="revenue"
                    fill="#4A5342"
                    radius={[6, 6, 0, 0]}
                    className="transition-all duration-300"
                  >
                    {revenueData.map((_, index) => {
                      const fills = ['#4A5342', '#F8E0DD', '#A2A89B', '#4A5342', '#F8E0DD'];
                      return (
                        <rect key={`cell-${index}`} fill={fills[index % fills.length]} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Recent Activity Feed ──────────────────────────────────── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              <h3 className="font-display font-bold text-dark text-sm">Recent Activity</h3>
            </div>
            <span className="text-2xs text-mid">Today</span>
          </div>

          <div className="space-y-1">
            {activity.map((item) => {
              const Icon = item.icon;
              const bgMap = {
                view:     'bg-blue-50 text-blue-500',
                click:    'bg-purple-50 text-purple-500',
                follower: 'bg-emerald-50 text-emerald-500',
                revenue:  'bg-amber-50 text-amber-600',
              };
              const colorClass = bgMap[item.type] || 'bg-soft text-mid';

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-soft/60 transition-colors duration-200 group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-dark font-medium truncate">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-1 text-2xs text-mid shrink-0">
                    <Clock size={10} />
                    {item.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            to="/business/products"
            className="card card-hover p-5 flex items-center gap-4 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4A5342] to-[#6B7A5E] flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
              <Package size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-dark text-sm">Manage Products</h4>
              <p className="text-2xs text-mid">Add, edit, organise</p>
            </div>
            <ArrowRight size={14} className="text-mid group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>

          <button
            onClick={() => {
              if (isGuest) {
                toast.success('Export available in full account 🌸');
                return;
              }
              toast.success('Preparing CSV export…');
            }}
            className="card card-hover p-5 flex items-center gap-4 group text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#E91E8C] flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
              <Download size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-dark text-sm">Analytics Export</h4>
              <p className="text-2xs text-mid">Download CSV report</p>
            </div>
            <ArrowRight size={14} className="text-mid group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>

          <Link
            to="/business/upgrade"
            className="card card-hover p-5 flex items-center gap-4 group border-2 border-amber-200/50"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF8F00] to-[#FF6F00] flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-dark text-sm">Upgrade Plan</h4>
              <p className="text-2xs text-mid">Unlock more features</p>
            </div>
            <ArrowRight size={14} className="text-mid group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* ── Guest Mode Banner ─────────────────────────────────────── */}
        {isGuest && (
          <div className="bg-blush rounded-2xl p-5 flex items-start gap-3 border border-secondary/30">
            <Sparkles size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-display font-bold text-dark">You're viewing demo data</p>
              <p className="text-xs text-mid mt-1">
                Create an account and register your business to see real analytics, manage products, and grow your brand with My Sista.
              </p>
              <Link to="/auth" className="btn-primary btn-sm mt-3 inline-flex">
                Create Account <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
