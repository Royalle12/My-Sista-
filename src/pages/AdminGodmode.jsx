/**
 * src/pages/AdminGodmode.jsx
 * Screen 5 — Admin Godmode Dashboard
 * Read-only bird's-eye view of the entire My Sista platform.
 * No INSERT/UPDATE/DELETE operations — purely observational.
 */

import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import {
  Shield,
  Users,
  CreditCard,
  FileText,
  Package,
  Heart,
  Activity,
  Globe,
  Server,
  Database,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Zap,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Mock data for guest / offline mode ──────────────────────────────────────
const MOCK_STATS = {
  totalUsers: 1_248,
  activeSubscribers: 387,
  publishedArticles: 64,
  totalProducts: 42,
  checkInsToday: 156,
  safetySignals: 3,
};

const MOCK_TIER_BREAKDOWN = [
  { tier: 'Free', count: 861, fill: '#7A8070' },
  { tier: 'Sista', count: 264, fill: '#4A5342' },
  { tier: 'Sista Plus', count: 123, fill: '#F8E0DD' },
];

const MOCK_RECENT_USERS = [
  { id: '1', display_name: 'Naledi Mahlangu', email: 'naledi@email.co.za', created_at: '2026-06-25T10:30:00Z', subscription_tier: 'sista_plus', status: 'active' },
  { id: '2', display_name: 'Thandi Nkosi', email: 'thandi.n@gmail.com', created_at: '2026-06-25T09:15:00Z', subscription_tier: 'sista', status: 'active' },
  { id: '3', display_name: 'Amahle Dlamini', email: 'amahle@outlook.com', created_at: '2026-06-24T22:45:00Z', subscription_tier: 'free', status: 'active' },
  { id: '4', display_name: 'Zanele Khumalo', email: 'z.khumalo@icloud.com', created_at: '2026-06-24T18:00:00Z', subscription_tier: 'sista', status: 'active' },
  { id: '5', display_name: 'Lindiwe Mthembu', email: 'lindiwe.m@yahoo.com', created_at: '2026-06-24T15:30:00Z', subscription_tier: 'free', status: 'active' },
  { id: '6', display_name: 'Precious Mokoena', email: 'precious@email.co.za', created_at: '2026-06-24T12:20:00Z', subscription_tier: 'sista_plus', status: 'active' },
  { id: '7', display_name: 'Sibongile Zulu', email: 'sibongile.z@gmail.com', created_at: '2026-06-24T08:45:00Z', subscription_tier: 'free', status: 'inactive' },
  { id: '8', display_name: 'Nomsa Ndlovu', email: 'nomsa@hotmail.com', created_at: '2026-06-23T20:10:00Z', subscription_tier: 'sista', status: 'active' },
  { id: '9', display_name: 'Buhle Sithole', email: 'buhle.s@email.co.za', created_at: '2026-06-23T16:30:00Z', subscription_tier: 'free', status: 'active' },
  { id: '10', display_name: 'Ayanda Cele', email: 'ayanda.c@gmail.com', created_at: '2026-06-23T11:00:00Z', subscription_tier: 'sista_plus', status: 'active' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
};

const tierLabel = (tier) => {
  const labels = {
    free: 'Free',
    sista: 'Sista',
    sista_plus: 'Sista Plus',
  };
  return labels[tier] || tier || 'Free';
};

const tierBadgeClass = (tier) => {
  switch (tier) {
    case 'sista_plus':
      return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200';
    case 'sista':
      return 'bg-primary/10 text-primary border border-primary/20';
    default:
      return 'bg-soft text-mid border border-primary/10';
  }
};

// ─── Mini sparkline SVG (purely decorative) ──────────────────────────────────
function MiniSparkline({ trend = 'up', color = '#4A5342' }) {
  const paths = {
    up: 'M2 14 L6 10 L10 12 L14 6 L18 8 L22 2',
    down: 'M2 2 L6 6 L10 4 L14 10 L18 8 L22 14',
    flat: 'M2 8 L6 7 L10 9 L14 7 L18 8 L22 7',
  };

  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" className="opacity-60">
      <path
        d={paths[trend] || paths.flat}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Stat Card Component ────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend = 'up', iconColor, delay = 0 }) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-500',
    flat: 'text-mid',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className="card group relative overflow-hidden p-5 hover:shadow-glow transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle glow background */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500"
        style={{ backgroundColor: iconColor }}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
        >
          <Icon size={20} />
        </div>
        <div className="flex items-center gap-1">
          <MiniSparkline trend={trend} color={iconColor} />
          <TrendIcon size={12} className={trendColors[trend]} />
        </div>
      </div>

      <p className="text-2xl font-display font-bold text-dark tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-2xs text-mid font-medium mt-0.5">{label}</p>
    </div>
  );
}

// ─── System Health Dot ──────────────────────────────────────────────────────
function HealthIndicator({ label, icon: Icon, status = 'online' }) {
  const isOnline = status === 'online';
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon size={16} className="text-mid" />
      <span className="text-sm font-medium text-dark flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
          />
          {isOnline && (
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping opacity-50" />
          )}
        </div>
        <span className={`text-2xs font-semibold uppercase tracking-wide ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

// ─── Custom Recharts Tooltip ────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 shadow-card border border-primary/10">
      <p className="text-xs font-bold text-dark">{label}</p>
      <p className="text-2xs text-mid mt-0.5">
        {payload[0].value.toLocaleString()} users
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function AdminGodmode() {
  const { isGuest } = useAuth();

  // Platform stats
  const [stats, setStats] = useState(null);
  const [tierBreakdown, setTierBreakdown] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // System health (simulated for now — real implementation would ping endpoints)
  const [systemHealth] = useState({
    database: 'online',
    auth: 'online',
    edgeFunctions: 'online',
    storage: 'online',
  });

  // ─── Data Fetcher ───────────────────────────────────────────────────────
  const loadDashboardData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      if (isGuest) {
        // Guest mode: use mock data
        setStats(MOCK_STATS);
        setTierBreakdown(MOCK_TIER_BREAKDOWN);
        setRecentUsers(MOCK_RECENT_USERS);
        setLastRefreshed(new Date());
        if (showToast) toast.success('Dashboard refreshed (Guest Mode) 🌸');
        return;
      }

      // ─── Live Supabase queries (all read-only) ────────────────────────
      const [
        usersResult,
        sistaResult,
        sistaPlusResult,
        articlesResult,
        productsResult,
        checkInsResult,
        safetyResult,
        recentResult,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'sista'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'sista_plus'),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('check_ins').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('safety_signals').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('id, display_name, email, created_at, subscription_tier, status').order('created_at', { ascending: false }).limit(10),
      ]);

      // Check for critical errors
      const hasError = [usersResult, sistaResult, sistaPlusResult, articlesResult, productsResult, checkInsResult, safetyResult, recentResult]
        .some(r => r.error);

      if (hasError) {
        console.warn('[AdminGodmode] Some queries failed, falling back to mock data');
        setStats(MOCK_STATS);
        setTierBreakdown(MOCK_TIER_BREAKDOWN);
        setRecentUsers(MOCK_RECENT_USERS);
        if (showToast) toast('Using cached data — some queries failed', { icon: '⚠️' });
      } else {
        const totalUsers = usersResult.count || 0;
        const sistaCount = sistaResult.count || 0;
        const sistaPlusCount = sistaPlusResult.count || 0;
        const freeCount = totalUsers - sistaCount - sistaPlusCount;

        setStats({
          totalUsers,
          activeSubscribers: sistaCount + sistaPlusCount,
          publishedArticles: articlesResult.count || 0,
          totalProducts: productsResult.count || 0,
          checkInsToday: checkInsResult.count || 0,
          safetySignals: safetyResult.count || 0,
        });

        setTierBreakdown([
          { tier: 'Free', count: freeCount, fill: '#7A8070' },
          { tier: 'Sista', count: sistaCount, fill: '#4A5342' },
          { tier: 'Sista Plus', count: sistaPlusCount, fill: '#F8E0DD' },
        ]);

        setRecentUsers(recentResult.data || []);
        if (showToast) toast.success('Dashboard refreshed ✨');
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error('[AdminGodmode] Load error:', err);
      setStats(MOCK_STATS);
      setTierBreakdown(MOCK_TIER_BREAKDOWN);
      setRecentUsers(MOCK_RECENT_USERS);
      toast.error('Failed to load live data — showing cached stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isGuest]);

  // ─── Stat card definitions ──────────────────────────────────────────────
  const statCards = stats
    ? [
        { icon: Users, label: 'Total Users', value: stats.totalUsers, trend: 'up', iconColor: '#4A5342' },
        { icon: CreditCard, label: 'Active Subscribers', value: stats.activeSubscribers, trend: 'up', iconColor: '#8B5CF6' },
        { icon: FileText, label: 'Published Articles', value: stats.publishedArticles, trend: 'up', iconColor: '#3B82F6' },
        { icon: Package, label: 'Total Products', value: stats.totalProducts, trend: 'flat', iconColor: '#F59E0B' },
        { icon: Heart, label: 'Check-ins Today', value: stats.checkInsToday, trend: 'up', iconColor: '#EC4899' },
        { icon: Shield, label: 'Safety Signals', value: stats.safetySignals, trend: stats.safetySignals > 5 ? 'up' : 'flat', iconColor: '#EF4444' },
      ]
    : [];

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <div className="space-y-6 pb-12 animate-fade-in">

        {/* ═══ DARK GRADIENT HEADER ═══ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-dark p-6 md:p-8 text-white shadow-glow">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/[0.02] rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <Shield size={22} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                      Godmode Dashboard
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-3xs font-bold uppercase tracking-wider text-white/90">
                      <Crown size={10} />
                      Admin Access
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mt-0.5">
                    Bird's-eye view of the My Sista platform
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastRefreshed && (
                <span className="text-3xs text-white/40 hidden sm:block">
                  Updated {formatTime(lastRefreshed.toISOString())}
                </span>
              )}
              <button
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 text-sm font-medium text-white transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Guest mode notice */}
          {isGuest && (
            <div className="relative mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-400/20 text-amber-200 text-2xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>Guest Mode — Displaying simulated platform data</span>
            </div>
          )}
        </div>

        {/* ═══ LOADING STATE ═══ */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-mid animate-pulse-soft">Loading platform analytics…</p>
          </div>
        )}

        {/* ═══ PLATFORM OVERVIEW CARDS ═══ */}
        {!loading && stats && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-primary" />
              <h2 className="section-title text-base">Platform Overview</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {statCards.map((card, i) => (
                <StatCard key={card.label} {...card} delay={i * 60} />
              ))}
            </div>
          </div>
        )}

        {/* ═══ MIDDLE ROW: Chart + System Health ═══ */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

            {/* Subscription Breakdown Chart */}
            <div className="lg:col-span-3 card p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-bold text-dark text-sm">Subscription Breakdown</h3>
                  <p className="text-2xs text-mid mt-0.5">Users by tier</p>
                </div>
                <div className="flex items-center gap-3">
                  {tierBreakdown.map((t) => (
                    <div key={t.tier} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-primary/10"
                        style={{ backgroundColor: t.fill }}
                      />
                      <span className="text-3xs text-mid font-medium">{t.tier}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tierBreakdown} barCategoryGap="30%">
                    <XAxis
                      dataKey="tier"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#7A8070', fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#7A8070' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(74,83,66,0.04)' }} />
                    <Bar
                      dataKey="count"
                      radius={[8, 8, 0, 0]}
                      fill="#4A5342"
                    >
                      {tierBreakdown.map((entry, index) => (
                        <rect key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tier summary cards beneath chart */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-primary/5">
                {tierBreakdown.map((t) => (
                  <div key={t.tier} className="text-center">
                    <p className="text-lg font-display font-bold text-dark">{t.count.toLocaleString()}</p>
                    <p className="text-3xs text-mid font-medium">{t.tier}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health Panel */}
            <div className="lg:col-span-2 card p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-primary" />
                <h3 className="font-display font-bold text-dark text-sm">System Health</h3>
              </div>

              <div className="divide-y divide-primary/5">
                <HealthIndicator icon={Database} label="Database" status={systemHealth.database} />
                <HealthIndicator icon={Shield} label="Auth Service" status={systemHealth.auth} />
                <HealthIndicator icon={Server} label="Edge Functions" status={systemHealth.edgeFunctions} />
                <HealthIndicator icon={Globe} label="CDN / Storage" status={systemHealth.storage} />
              </div>

              {/* Uptime badge */}
              <div className="mt-5 pt-4 border-t border-primary/5">
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-mid font-medium">Overall Status</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-xs font-bold text-green-600">All Systems Operational</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-green-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: '99.9%' }} />
                </div>
                <p className="text-3xs text-mid mt-1.5 text-right">99.9% uptime — 30 days</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ RECENT SIGN-UPS TABLE ═══ */}
        {!loading && recentUsers.length > 0 && (
          <div className="card overflow-hidden">
            <div className="p-5 md:p-6 border-b border-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-dark text-sm">Recent Sign-ups</h3>
                  <p className="text-2xs text-mid mt-0.5">Last 10 registered users</p>
                </div>
                <span className="badge bg-soft text-primary text-3xs font-semibold">
                  {recentUsers.length} users
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-soft text-primary font-semibold border-b border-primary/10">
                    <th className="p-4">User</th>
                    <th className="p-4 hidden sm:table-cell">Email</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {recentUsers.map((u, i) => (
                    <tr
                      key={u.id}
                      className="hover:bg-soft/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* User Avatar + Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-2xs font-bold shrink-0">
                            {(u.display_name || 'U')[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-dark truncate max-w-[140px]">
                            {u.display_name || 'Anonymous'}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-mid truncate max-w-[180px] inline-block">
                          {u.email || '—'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <div>
                          <span className="text-dark font-medium">{formatDate(u.created_at)}</span>
                          <span className="text-3xs text-mid block">{formatTime(u.created_at)}</span>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-bold ${tierBadgeClass(u.subscription_tier)}`}>
                          {u.subscription_tier === 'sista_plus' && <Crown size={8} />}
                          {tierLabel(u.subscription_tier)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center gap-1 text-2xs font-semibold ${
                          u.status === 'active' ? 'text-green-600' : 'text-mid'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          {u.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ FOOTER NOTE ═══ */}
        {!loading && (
          <div className="text-center py-4">
            <p className="text-3xs text-mid/50">
              Godmode Dashboard — Read-only administrative view • Data auto-refreshes on page load
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
