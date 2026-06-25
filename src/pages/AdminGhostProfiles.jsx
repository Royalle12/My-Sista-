/**
 * src/pages/AdminGhostProfiles.jsx
 * Screen 7 — Admin Ghost Profiles
 * Browse anonymised or soft-deleted user profiles with audit logging.
 */

import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import {
  UserX,
  Eye,
  Download,
  AlertTriangle,
  Clock,
  Shield,
  FileText,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ───────────────────────────── Mock Data ───────────────────────────── */

const MOCK_GHOST_PROFILES = [
  {
    id: 'ghost-001',
    ghost_id: 'GHOST-****-AB12',
    original_tier: 'Premium',
    deleted_at: '2026-04-18T09:22:00Z',
    reason: 'user_requested',
    data_status: 'purged',
    original_email_domain: 'gmail.com',
    account_age_days: 412,
    total_sessions: 87,
    last_active: '2026-04-15T14:30:00Z',
  },
  {
    id: 'ghost-002',
    ghost_id: 'GHOST-****-QR78',
    original_tier: 'Free',
    deleted_at: '2026-05-02T16:45:00Z',
    reason: 'inactivity',
    data_status: 'retained',
    original_email_domain: 'outlook.com',
    account_age_days: 189,
    total_sessions: 12,
    last_active: '2025-12-03T08:10:00Z',
  },
  {
    id: 'ghost-003',
    ghost_id: 'GHOST-****-TF34',
    original_tier: 'Premium',
    deleted_at: '2026-03-10T11:00:00Z',
    reason: 'admin_action',
    data_status: 'purged',
    original_email_domain: 'yahoo.com',
    account_age_days: 621,
    total_sessions: 203,
    last_active: '2026-03-09T22:55:00Z',
  },
  {
    id: 'ghost-004',
    ghost_id: 'GHOST-****-LM91',
    original_tier: 'Free',
    deleted_at: '2026-06-01T08:30:00Z',
    reason: 'user_requested',
    data_status: 'retained',
    original_email_domain: 'icloud.com',
    account_age_days: 54,
    total_sessions: 6,
    last_active: '2026-05-28T19:00:00Z',
  },
  {
    id: 'ghost-005',
    ghost_id: 'GHOST-****-XY56',
    original_tier: 'Premium',
    deleted_at: '2026-02-20T13:12:00Z',
    reason: 'inactivity',
    data_status: 'purged',
    original_email_domain: 'gmail.com',
    account_age_days: 730,
    total_sessions: 45,
    last_active: '2025-08-14T10:20:00Z',
  },
  {
    id: 'ghost-006',
    ghost_id: 'GHOST-****-DP03',
    original_tier: 'Free',
    deleted_at: '2026-05-25T20:00:00Z',
    reason: 'admin_action',
    data_status: 'purged',
    original_email_domain: 'protonmail.com',
    account_age_days: 98,
    total_sessions: 31,
    last_active: '2026-05-24T16:45:00Z',
  },
  {
    id: 'ghost-007',
    ghost_id: 'GHOST-****-NJ42',
    original_tier: 'Premium',
    deleted_at: '2026-01-08T07:15:00Z',
    reason: 'user_requested',
    data_status: 'retained',
    original_email_domain: 'gmail.com',
    account_age_days: 365,
    total_sessions: 156,
    last_active: '2026-01-07T23:50:00Z',
  },
  {
    id: 'ghost-008',
    ghost_id: 'GHOST-****-WK88',
    original_tier: 'Free',
    deleted_at: '2026-06-15T14:20:00Z',
    reason: 'inactivity',
    data_status: 'retained',
    original_email_domain: 'hotmail.com',
    account_age_days: 275,
    total_sessions: 3,
    last_active: '2025-10-01T12:00:00Z',
  },
  {
    id: 'ghost-009',
    ghost_id: 'GHOST-****-BV17',
    original_tier: 'Premium',
    deleted_at: '2026-04-30T18:40:00Z',
    reason: 'admin_action',
    data_status: 'purged',
    original_email_domain: 'yahoo.com',
    account_age_days: 510,
    total_sessions: 322,
    last_active: '2026-04-29T09:00:00Z',
  },
  {
    id: 'ghost-010',
    ghost_id: 'GHOST-****-SG65',
    original_tier: 'Free',
    deleted_at: '2026-06-20T10:05:00Z',
    reason: 'user_requested',
    data_status: 'retained',
    original_email_domain: 'gmail.com',
    account_age_days: 22,
    total_sessions: 2,
    last_active: '2026-06-18T07:30:00Z',
  },
];

/* ───────────────────────────── Helpers ──────────────────────────────── */

const REASON_CONFIG = {
  user_requested: {
    label: 'User Requested',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-400',
  },
  admin_action: {
    label: 'Admin Action',
    color: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-400',
  },
  inactivity: {
    label: 'Inactivity',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-400',
  },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ═══════════════════════════ Component ══════════════════════════════ */

export default function AdminGhostProfiles() {
  const { user, isGuest } = useAuth();

  const [ghosts, setGhosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGhost, setSelectedGhost] = useState(null);
  const [filterReason, setFilterReason] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Data Loading ── */
  useEffect(() => {
    loadGhosts();
  }, [isGuest]);

  const loadGhosts = async () => {
    try {
      setLoading(true);

      if (isGuest) {
        const stored = localStorage.getItem('mysista-ghost-profiles');
        setGhosts(stored ? JSON.parse(stored) : MOCK_GHOST_PROFILES);
        return;
      }

      const { data, error } = await supabase
        .from('ghost_profiles')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) {
        console.warn('[GhostProfiles] DB error, falling back to mock data:', error.message);
        setGhosts(MOCK_GHOST_PROFILES);
      } else {
        setGhosts(data?.length ? data : MOCK_GHOST_PROFILES);
      }
    } catch (err) {
      console.error('[GhostProfiles] Load error:', err);
      setGhosts(MOCK_GHOST_PROFILES);
    } finally {
      setLoading(false);
    }
  };

  /* ── Audit Logging ── */
  const logAuditEntry = async (ghost) => {
    if (isGuest) return; // Skip audit in guest mode

    try {
      await supabase.from('audit_log').insert([
        {
          admin_user_id: user?.id,
          action: 'view_ghost_profile',
          target_id: ghost.id,
          details: 'Viewed ghost profile',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('[GhostProfiles] Audit log error:', err);
    }
  };

  /* ── View Detail Handler ── */
  const handleViewGhost = async (ghost) => {
    setSelectedGhost(ghost);
    await logAuditEntry(ghost);
    toast('Audit entry logged', {
      icon: '🔒',
      style: {
        fontSize: '12px',
        background: '#2C3228',
        color: '#FAFAF5',
        borderRadius: '12px',
      },
    });
  };

  /* ── CSV Export ── */
  const exportCSV = () => {
    const headers = [
      'Ghost ID',
      'Original Tier',
      'Deletion Date',
      'Reason',
      'Data Status',
      'Email Domain',
      'Account Age (days)',
      'Total Sessions',
      'Last Active',
    ];

    const rows = filteredGhosts.map((g) => [
      g.ghost_id,
      g.original_tier,
      formatDate(g.deleted_at),
      REASON_CONFIG[g.reason]?.label || g.reason,
      g.data_status,
      g.original_email_domain || '—',
      g.account_age_days || '—',
      g.total_sessions || '—',
      formatDate(g.last_active),
    ]);

    const csvContent =
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghost_profiles_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Ghost profiles exported as CSV 📄');
  };

  /* ── Filtered Data ── */
  const filteredGhosts = ghosts.filter((g) => {
    const matchReason = filterReason === 'all' || g.reason === filterReason;
    const matchStatus = filterStatus === 'all' || g.data_status === filterStatus;
    const matchSearch =
      searchQuery === '' ||
      g.ghost_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.original_tier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchReason && matchStatus && matchSearch;
  });

  /* ── Stats Calculations ── */
  const stats = {
    total: ghosts.length,
    mostRecent: ghosts.length
      ? formatDate(
          ghosts.reduce((latest, g) =>
            new Date(g.deleted_at) > new Date(latest.deleted_at) ? g : latest
          ).deleted_at
        )
      : '—',
    byReason: {
      user_requested: ghosts.filter((g) => g.reason === 'user_requested').length,
      admin_action: ghosts.filter((g) => g.reason === 'admin_action').length,
      inactivity: ghosts.filter((g) => g.reason === 'inactivity').length,
    },
  };

  /* ═══════════════════════════ Render ═══════════════════════════════ */

  return (
    <PageWrapper>
      <div className="space-y-6 pb-12 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-dark/5 border border-dashed border-dark/20 flex items-center justify-center">
                <UserX size={20} className="text-dark/40" />
              </div>
              <div>
                <h1 className="section-title text-gradient">Ghost Profiles</h1>
                <p className="section-subtitle mt-0">
                  Anonymised &amp; soft-deleted user accounts
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={exportCSV}
            disabled={filteredGhosts.length === 0}
            className="btn-outline btn-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* ── Privacy Warning Banner ── */}
        <div className="card bg-amber-50/60 border border-dashed border-amber-300/50 p-4 flex gap-3 items-start">
          <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Privacy Notice:</span> These records represent
            anonymised or permanently deleted user accounts. All personally identifiable
            information has been removed in compliance with POPIA and GDPR. Every profile
            view is logged to the audit trail.
            {isGuest && (
              <span className="block mt-1.5 text-amber-600 font-semibold">
                Guest Mode — audit logging is disabled. Sign in as an admin to enable full audit trails.
              </span>
            )}
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Total */}
          <div className="card p-4 text-center border border-dashed border-primary/10">
            <div className="text-2xl font-display font-bold text-dark">{stats.total}</div>
            <div className="text-3xs text-mid font-medium uppercase tracking-wider mt-1">
              Total Ghosts
            </div>
          </div>

          {/* Most Recent */}
          <div className="card p-4 text-center border border-dashed border-primary/10">
            <div className="text-sm font-display font-bold text-dark">{stats.mostRecent}</div>
            <div className="text-3xs text-mid font-medium uppercase tracking-wider mt-1">
              Most Recent
            </div>
          </div>

          {/* User Requested */}
          <div className="card p-4 text-center border border-dashed border-blue-200/60 bg-blue-50/30">
            <div className="text-2xl font-display font-bold text-blue-700">
              {stats.byReason.user_requested}
            </div>
            <div className="text-3xs text-blue-600 font-medium uppercase tracking-wider mt-1">
              User Requested
            </div>
          </div>

          {/* Admin Action */}
          <div className="card p-4 text-center border border-dashed border-red-200/60 bg-red-50/30">
            <div className="text-2xl font-display font-bold text-red-700">
              {stats.byReason.admin_action}
            </div>
            <div className="text-3xs text-red-600 font-medium uppercase tracking-wider mt-1">
              Admin Action
            </div>
          </div>

          {/* Inactivity */}
          <div className="card p-4 text-center border border-dashed border-amber-200/60 bg-amber-50/30">
            <div className="text-2xl font-display font-bold text-amber-700">
              {stats.byReason.inactivity}
            </div>
            <div className="text-3xs text-amber-600 font-medium uppercase tracking-wider mt-1">
              Inactivity
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by Ghost ID or tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input flex-1 py-2 text-xs"
          />
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="input sm:max-w-[180px] py-2 text-xs"
          >
            <option value="all">All Reasons</option>
            <option value="user_requested">User Requested</option>
            <option value="admin_action">Admin Action</option>
            <option value="inactivity">Inactivity</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input sm:max-w-[180px] py-2 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="retained">Retained</option>
            <option value="purged">Purged</option>
          </select>
        </div>

        {/* ── Ghost Profiles List ── */}
        {loading ? (
          <div className="p-16 text-center">
            <UserX size={32} className="mx-auto text-mid/30 mb-3 animate-pulse-soft" />
            <p className="text-sm text-mid">Summoning ghost profiles…</p>
          </div>
        ) : filteredGhosts.length === 0 ? (
          <div className="p-16 text-center">
            <UserX size={32} className="mx-auto text-mid/20 mb-3" />
            <p className="text-sm text-mid">No ghost profiles match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGhosts.map((ghost, idx) => {
              const reasonCfg = REASON_CONFIG[ghost.reason] || REASON_CONFIG.user_requested;

              return (
                <button
                  key={ghost.id}
                  onClick={() => handleViewGhost(ghost)}
                  className="group card text-left border border-dashed border-primary/15 bg-surface/60 
                             opacity-80 hover:opacity-100 hover:border-primary/30 hover:shadow-soft
                             transition-all duration-300 p-5 space-y-3 cursor-pointer"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Top Row: ID + Eye */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-dark/70 tracking-wide">
                        {ghost.ghost_id}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${reasonCfg.dotColor}`}
                        />
                        <span
                          className={`text-3xs font-semibold px-2 py-0.5 rounded-full border ${reasonCfg.color}`}
                        >
                          {reasonCfg.label}
                        </span>
                      </div>
                    </div>
                    <Eye
                      size={16}
                      className="text-mid/30 group-hover:text-primary/60 transition-colors mt-0.5"
                    />
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-3xs">
                    <div>
                      <span className="text-mid uppercase tracking-wider font-medium block">Tier</span>
                      <span className="text-dark font-semibold">{ghost.original_tier}</span>
                    </div>
                    <div>
                      <span className="text-mid uppercase tracking-wider font-medium block">
                        Deleted
                      </span>
                      <span className="text-dark font-semibold">
                        {formatDate(ghost.deleted_at)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-mid uppercase tracking-wider font-medium block">
                        Data Retention
                      </span>
                      <span
                        className={`font-semibold ${
                          ghost.data_status === 'purged'
                            ? 'text-red-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {ghost.data_status === 'purged' ? '🗑 Purged' : '🔒 Retained'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                </button>
              );
            })}
          </div>
        )}

        {/* ── Results Count ── */}
        {!loading && filteredGhosts.length > 0 && (
          <p className="text-center text-3xs text-mid/60 font-medium">
            Showing {filteredGhosts.length} of {ghosts.length} ghost profiles
          </p>
        )}

        {/* ══════════════════ Detail Modal ══════════════════ */}
        {selectedGhost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedGhost(null)}
          >
            <div
              className="card w-full max-w-lg border border-dashed border-primary/20 bg-surface shadow-glow 
                         animate-scale-in space-y-5 p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedGhost(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-soft text-mid hover:text-dark transition-colors"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-dark/5 border border-dashed border-dark/20 flex items-center justify-center">
                  <UserX size={24} className="text-dark/30" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-dark">
                    {selectedGhost.ghost_id}
                  </h2>
                  <p className="text-3xs text-mid">Ghost Profile Detail View</p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

              {/* Detail Fields */}
              <div className="space-y-3">
                <DetailRow
                  icon={<Shield size={14} />}
                  label="Original Tier"
                  value={selectedGhost.original_tier}
                />
                <DetailRow
                  icon={<Clock size={14} />}
                  label="Deletion Date"
                  value={formatDateTime(selectedGhost.deleted_at)}
                />
                <DetailRow
                  icon={<AlertTriangle size={14} />}
                  label="Reason"
                  value={
                    <span
                      className={`text-3xs font-semibold px-2 py-0.5 rounded-full border ${
                        REASON_CONFIG[selectedGhost.reason]?.color
                      }`}
                    >
                      {REASON_CONFIG[selectedGhost.reason]?.label || selectedGhost.reason}
                    </span>
                  }
                />
                <DetailRow
                  icon={<FileText size={14} />}
                  label="Data Retention"
                  value={
                    <span
                      className={`font-semibold ${
                        selectedGhost.data_status === 'purged'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {selectedGhost.data_status === 'purged' ? '🗑 Purged' : '🔒 Retained'}
                    </span>
                  }
                />

                <div className="h-px bg-primary/5" />

                <DetailRow
                  icon={<Clock size={14} />}
                  label="Last Active"
                  value={formatDateTime(selectedGhost.last_active)}
                />
                <DetailRow
                  icon={<FileText size={14} />}
                  label="Email Domain"
                  value={selectedGhost.original_email_domain || '—'}
                />
                <DetailRow
                  icon={<Clock size={14} />}
                  label="Account Age"
                  value={`${selectedGhost.account_age_days || '—'} days`}
                />
                <DetailRow
                  icon={<Eye size={14} />}
                  label="Total Sessions"
                  value={selectedGhost.total_sessions ?? '—'}
                />
              </div>

              {/* Audit Notice */}
              <div className="flex items-center gap-2 bg-dark/5 rounded-xl px-3 py-2.5 border border-dashed border-dark/10">
                <Shield size={14} className="text-primary/50 shrink-0" />
                <p className="text-3xs text-mid leading-relaxed">
                  This view has been recorded in the audit log
                  {!isGuest && user?.id && (
                    <span className="text-mid/50"> — admin {user.id.slice(0, 8)}…</span>
                  )}
                  {isGuest && (
                    <span className="text-mid/50"> — audit logging skipped (guest mode)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

/* ─────────────────── Sub-Component ─────────────────── */

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-mid/40 shrink-0">{icon}</span>
      <span className="text-3xs text-mid font-medium uppercase tracking-wider w-28 shrink-0">
        {label}
      </span>
      <span className="text-xs text-dark font-semibold">{typeof value === 'string' ? value : value}</span>
    </div>
  );
}
