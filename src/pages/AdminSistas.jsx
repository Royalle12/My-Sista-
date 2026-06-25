/**
 * src/pages/AdminSistas.jsx
 * Screen 6 — Admin User Management
 * Browse and manage all platform users with search, filters, detail panels,
 * and admin actions (verify, suspend, ban, reactivate).
 */

import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  Eye,
  Mail,
  MapPin,
  Calendar,
  X,
  AlertCircle,
  Flame,
  Coins,
  Globe,
  Heart,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// ─── Constants ──────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

const TIER_OPTIONS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'free', label: 'Free' },
  { value: 'sista', label: 'Sista' },
  { value: 'sista_plus', label: 'Sista Plus' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
];

// Mock data for guest mode
const MOCK_USERS = [
  {
    id: 'usr-001',
    display_name: 'Amahle Dlamini',
    email: 'amahle@example.com',
    pronouns: 'she/her',
    province: 'Gauteng',
    age_range: '25-34',
    language_preference: 'English',
    subscription_tier: 'sista_plus',
    status: 'active',
    verified: true,
    checkin_streak: 14,
    credits: 250,
    renewal_date: '2026-07-15',
    created_at: '2025-11-20T08:30:00Z',
    avatar_url: null,
  },
  {
    id: 'usr-002',
    display_name: 'Naledi Mokoena',
    email: 'naledi.m@example.com',
    pronouns: 'she/her',
    province: 'Western Cape',
    age_range: '18-24',
    language_preference: 'Afrikaans',
    subscription_tier: 'sista',
    status: 'active',
    verified: true,
    checkin_streak: 7,
    credits: 120,
    renewal_date: '2026-07-01',
    created_at: '2026-01-05T14:22:00Z',
    avatar_url: null,
  },
  {
    id: 'usr-003',
    display_name: 'Thandiwe Nkosi',
    email: 'thandiwe.nk@example.com',
    pronouns: 'she/they',
    province: 'KwaZulu-Natal',
    age_range: '35-44',
    language_preference: 'isiZulu',
    subscription_tier: 'free',
    status: 'active',
    verified: false,
    checkin_streak: 0,
    credits: 30,
    renewal_date: null,
    created_at: '2026-03-12T09:15:00Z',
    avatar_url: null,
  },
  {
    id: 'usr-004',
    display_name: 'Lerato Khumalo',
    email: 'lerato.k@example.com',
    pronouns: 'she/her',
    province: 'Free State',
    age_range: '25-34',
    language_preference: 'Sesotho',
    subscription_tier: 'sista',
    status: 'suspended',
    verified: true,
    checkin_streak: 0,
    credits: 80,
    renewal_date: '2026-08-20',
    created_at: '2025-09-28T11:00:00Z',
    avatar_url: null,
  },
  {
    id: 'usr-005',
    display_name: 'Zanele Mthembu',
    email: 'zanele@example.com',
    pronouns: 'she/her',
    province: 'Mpumalanga',
    age_range: '18-24',
    language_preference: 'English',
    subscription_tier: 'free',
    status: 'banned',
    verified: false,
    checkin_streak: 0,
    credits: 0,
    renewal_date: null,
    created_at: '2026-02-14T16:45:00Z',
    avatar_url: null,
  },
  {
    id: 'usr-006',
    display_name: 'Nomvula Zulu',
    email: 'nomvula.z@example.com',
    pronouns: 'she/her',
    province: 'Eastern Cape',
    age_range: '45-54',
    language_preference: 'isiXhosa',
    subscription_tier: 'sista_plus',
    status: 'active',
    verified: true,
    checkin_streak: 32,
    credits: 500,
    renewal_date: '2026-09-01',
    created_at: '2025-06-01T07:30:00Z',
    avatar_url: null,
  },
  {
    id: 'usr-007',
    display_name: 'Palesa Motaung',
    email: 'palesa.mo@example.com',
    pronouns: 'she/her',
    province: 'Limpopo',
    age_range: '25-34',
    language_preference: 'Sepedi',
    subscription_tier: 'free',
    status: 'active',
    verified: false,
    checkin_streak: 3,
    credits: 15,
    renewal_date: null,
    created_at: '2026-05-22T10:10:00Z',
    avatar_url: null,
  },
  {
    id: 'usr-008',
    display_name: 'Refilwe Sithole',
    email: 'refilwe.s@example.com',
    pronouns: 'they/them',
    province: 'North West',
    age_range: '18-24',
    language_preference: 'Setswana',
    subscription_tier: 'sista',
    status: 'active',
    verified: true,
    checkin_streak: 21,
    credits: 175,
    renewal_date: '2026-07-28',
    created_at: '2026-04-10T13:25:00Z',
    avatar_url: null,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Return Tailwind classes for status badges */
function getStatusStyle(status) {
  switch (status) {
    case 'active':
      return 'bg-green-50 text-green-700 border border-green-200';
    case 'suspended':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'banned':
      return 'bg-red-50 text-red-700 border border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border border-gray-200';
  }
}

/** Return Tailwind classes for subscription tier badges */
function getTierStyle(tier) {
  switch (tier) {
    case 'sista_plus':
      return 'bg-gradient-to-r from-primary/90 to-primary text-white';
    case 'sista':
      return 'bg-secondary text-primary';
    case 'free':
    default:
      return 'bg-soft text-mid';
  }
}

/** Format tier label for display */
function tierLabel(tier) {
  switch (tier) {
    case 'sista_plus':
      return 'Sista Plus';
    case 'sista':
      return 'Sista';
    case 'free':
    default:
      return 'Free';
  }
}

/** Get initials from display_name */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

/** Format date nicely */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminSistas() {
  const { user, isGuest } = useAuth();

  // Data
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [page, setPage] = useState(0);

  // Selection
  const [selectedUser, setSelectedUser] = useState(null);

  // Action loading (prevent double-clicks)
  const [actionLoading, setActionLoading] = useState(false);

  // ─── Data Loader ────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      if (isGuest) {
        // Guest mode: use localStorage mock data
        const stored = localStorage.getItem('mysista-admin-users');
        let allUsers = stored ? JSON.parse(stored) : [...MOCK_USERS];

        // Persist mock data if first load
        if (!stored) {
          localStorage.setItem('mysista-admin-users', JSON.stringify(allUsers));
        }

        // Apply filters client-side
        let filtered = allUsers;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.display_name?.toLowerCase().includes(q) ||
              u.email?.toLowerCase().includes(q)
          );
        }

        if (tierFilter !== 'all') {
          filtered = filtered.filter(
            (u) => u.subscription_tier === tierFilter
          );
        }

        if (statusFilter !== 'all') {
          filtered = filtered.filter((u) => u.status === statusFilter);
        }

        setTotalCount(filtered.length);
        const start = page * PAGE_SIZE;
        setUsers(filtered.slice(start, start + PAGE_SIZE));
        return;
      }

      // Production: query Supabase profiles
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (searchQuery.trim()) {
        const q = `%${searchQuery.trim()}%`;
        query = query.or(`display_name.ilike.${q},email.ilike.${q}`);
      }

      if (tierFilter !== 'all') {
        query = query.eq('subscription_tier', tierFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      setUsers(data || []);
      setTotalCount(count ?? 0);
    } catch (err) {
      console.error('[AdminSistas] loadUsers error:', err);
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [isGuest, searchQuery, tierFilter, statusFilter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, tierFilter, statusFilter]);

  // Close detail panel if selected user is no longer visible
  useEffect(() => {
    if (selectedUser && !users.find((u) => u.id === selectedUser.id)) {
      setSelectedUser(null);
    }
  }, [users, selectedUser]);

  // ─── Admin Actions ──────────────────────────────────────────────────────

  const performAction = useCallback(
    async (action, label, updates, auditDetails) => {
      if (!selectedUser) return;

      const confirmMsg = `Are you sure you want to ${label.toLowerCase()} "${selectedUser.display_name}"?`;
      if (!window.confirm(confirmMsg)) return;

      try {
        setActionLoading(true);

        if (isGuest) {
          // Guest mode: update localStorage
          const stored = localStorage.getItem('mysista-admin-users');
          let allUsers = stored ? JSON.parse(stored) : [...MOCK_USERS];
          allUsers = allUsers.map((u) =>
            u.id === selectedUser.id ? { ...u, ...updates } : u
          );
          localStorage.setItem(
            'mysista-admin-users',
            JSON.stringify(allUsers)
          );

          // Update local state
          const updatedUser = { ...selectedUser, ...updates };
          setSelectedUser(updatedUser);
          setUsers((prev) =>
            prev.map((u) => (u.id === selectedUser.id ? updatedUser : u))
          );

          toast.success(`${label} completed (Guest Mode) 🌸`);
          return;
        }

        // Production: write to profiles + audit_log
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', selectedUser.id);

        if (profileError) throw profileError;

        const { error: auditError } = await supabase
          .from('audit_log')
          .insert({
            admin_user_id: user.id,
            action,
            target_id: selectedUser.id,
            details: auditDetails,
          });

        if (auditError) {
          console.warn('[AdminSistas] audit_log insert failed:', auditError);
        }

        toast.success(`${label} completed successfully ✨`);
        await loadUsers();

        // Refresh selected user
        const { data: refreshed } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', selectedUser.id)
          .single();

        if (refreshed) setSelectedUser(refreshed);
      } catch (err) {
        console.error(`[AdminSistas] ${action} error:`, err);
        toast.error(`Failed to ${label.toLowerCase()}.`);
      } finally {
        setActionLoading(false);
      }
    },
    [selectedUser, isGuest, user, loadUsers]
  );

  const verifyUser = () =>
    performAction(
      'verify_user',
      'Verify User',
      { verified: true },
      `Verified by admin (${user?.email || 'guest'})`
    );

  const suspendUser = () =>
    performAction(
      'suspend_user',
      'Suspend User',
      { status: 'suspended' },
      `Suspended by admin (${user?.email || 'guest'})`
    );

  const banUser = () =>
    performAction(
      'ban_user',
      'Ban User',
      { status: 'banned' },
      `Banned by admin (${user?.email || 'guest'})`
    );

  const reactivateUser = () =>
    performAction(
      'reactivate_user',
      'Reactivate User',
      { status: 'active' },
      `Reactivated by admin (${user?.email || 'guest'})`
    );

  // ─── Pagination helpers ─────────────────────────────────────────────────
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;

  // ─── Filtered count for display ─────────────────────────────────────────
  const resultCountLabel =
    totalCount === 1 ? '1 sista found' : `${totalCount} sistas found`;

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <div className="space-y-6 pb-12 animate-fade-in">
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-soft">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1 className="section-title text-gradient">
                  Sista Management
                </h1>
                <p className="section-subtitle mt-0">
                  Browse, review, and manage all platform sistas.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-primary px-2.5 py-0.5 text-3xs font-semibold uppercase">
              {isGuest ? 'Guest Simulation' : 'Live Database'}
            </span>
          </div>
        </div>

        {/* ─── Guest Warning ───────────────────────────────────────────── */}
        {isGuest && (
          <div className="card bg-orange-50 border border-orange-200/50 p-4 flex gap-3 text-orange-800 text-xs">
            <AlertCircle
              size={18}
              className="shrink-0 text-orange-600 mt-0.5"
            />
            <div>
              <span className="font-bold">Guest Mode Sandbox:</span> Actions
              are saved to your browser's local storage. Sign in as an admin to
              write changes directly to the production database.
            </div>
          </div>
        )}

        {/* ─── Search & Filter Bar ─────────────────────────────────────── */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mid"
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 py-2.5 text-xs w-full"
              />
            </div>

            {/* Tier Filter */}
            <div className="relative">
              <Filter
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-mid pointer-events-none"
              />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="input pl-9 pr-8 py-2.5 text-xs min-w-[140px] appearance-none"
              >
                {TIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Shield
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-mid pointer-events-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-9 pr-8 py-2.5 text-xs min-w-[140px] appearance-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Count */}
          <div className="mt-3 flex items-center justify-between text-2xs text-mid">
            <span>{loading ? 'Searching...' : resultCountLabel}</span>
            <span>
              Page {page + 1} of {totalPages}
            </span>
          </div>
        </div>

        {/* ─── Main Content: Users Grid + Detail Panel ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Users List (left / full width) ────────────────────────── */}
          <div
            className={`${
              selectedUser ? 'lg:col-span-2' : 'lg:col-span-3'
            } space-y-2`}
          >
            {loading ? (
              <div className="card p-12 text-center">
                <div className="animate-pulse-soft text-sm text-mid">
                  Loading sistas...
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="card p-12 text-center">
                <Users size={32} className="mx-auto text-mid/30 mb-3" />
                <p className="text-sm text-mid">
                  No users match your current filters.
                </p>
              </div>
            ) : (
              users.map((u) => (
                <button
                  key={u.id}
                  onClick={() =>
                    setSelectedUser(
                      selectedUser?.id === u.id ? null : u
                    )
                  }
                  className={`card w-full text-left p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-card group ${
                    selectedUser?.id === u.id
                      ? 'ring-2 ring-primary/30 bg-soft/50 shadow-card'
                      : 'hover:bg-soft/20'
                  }`}
                >
                  {/* Avatar Initial */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-transform group-hover:scale-105 ${
                      u.status === 'banned'
                        ? 'bg-red-100 text-red-600'
                        : u.status === 'suspended'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-secondary text-primary'
                    }`}
                  >
                    {getInitials(u.display_name)}
                  </div>

                  {/* Name & Email */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-dark truncate">
                        {u.display_name || 'Unnamed'}
                      </span>
                      {u.verified && (
                        <ShieldCheck
                          size={14}
                          className="text-green-600 shrink-0"
                        />
                      )}
                    </div>
                    <div className="text-2xs text-mid truncate">
                      {u.email || '—'}
                    </div>
                  </div>

                  {/* Tier Badge */}
                  <span
                    className={`badge px-2.5 py-1 text-3xs font-semibold shrink-0 ${getTierStyle(
                      u.subscription_tier
                    )}`}
                  >
                    {tierLabel(u.subscription_tier)}
                  </span>

                  {/* Joined Date */}
                  <span className="hidden md:block text-2xs text-mid shrink-0">
                    {formatDate(u.created_at)}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`badge px-2.5 py-1 text-3xs font-semibold capitalize shrink-0 ${getStatusStyle(
                      u.status
                    )}`}
                  >
                    {u.status || 'active'}
                  </span>
                </button>
              ))
            )}

            {/* ─── Pagination Controls ───────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={!canGoPrev}
                  className={`btn-ghost btn-sm flex items-center gap-1 ${
                    !canGoPrev ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="text-xs font-semibold text-primary">
                  {page + 1} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={!canGoNext}
                  className={`btn-ghost btn-sm flex items-center gap-1 ${
                    !canGoNext ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* ─── User Detail Panel (right sidebar) ─────────────────────── */}
          {selectedUser && (
            <div className="lg:col-span-1 animate-slide-up">
              <div className="card p-0 overflow-hidden sticky top-24">
                {/* Detail Header */}
                <div className="bg-gradient-brand p-5 text-white relative">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                    aria-label="Close panel"
                  >
                    <X size={14} />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                      {getInitials(selectedUser.display_name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base truncate">
                        {selectedUser.display_name || 'Unnamed'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-white/70 text-2xs">
                        <Mail size={11} />
                        <span className="truncate">
                          {selectedUser.email || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status + Tier Chips */}
                  <div className="flex gap-2 mt-3">
                    <span
                      className={`badge px-2 py-0.5 text-3xs font-semibold capitalize ${getStatusStyle(
                        selectedUser.status
                      )}`}
                    >
                      {selectedUser.status || 'active'}
                    </span>
                    <span
                      className={`badge px-2 py-0.5 text-3xs font-semibold ${getTierStyle(
                        selectedUser.subscription_tier
                      )}`}
                    >
                      {tierLabel(selectedUser.subscription_tier)}
                    </span>
                    {selectedUser.verified && (
                      <span className="badge bg-green-100 text-green-700 px-2 py-0.5 text-3xs font-semibold flex items-center gap-0.5">
                        <ShieldCheck size={10} />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-3xs uppercase tracking-wider text-mid font-semibold mb-2">
                      Profile Details
                    </h4>
                    <div className="space-y-2.5">
                      <DetailRow
                        icon={<Heart size={13} />}
                        label="Pronouns"
                        value={selectedUser.pronouns}
                      />
                      <DetailRow
                        icon={<MapPin size={13} />}
                        label="Province"
                        value={selectedUser.province}
                      />
                      <DetailRow
                        icon={<Calendar size={13} />}
                        label="Age Range"
                        value={selectedUser.age_range}
                      />
                      <DetailRow
                        icon={<Globe size={13} />}
                        label="Language"
                        value={selectedUser.language_preference}
                      />
                      <DetailRow
                        icon={<Calendar size={13} />}
                        label="Joined"
                        value={formatDate(selectedUser.created_at)}
                      />
                    </div>
                  </div>

                  {/* Subscription */}
                  <div className="border-t border-primary/5 pt-4">
                    <h4 className="text-3xs uppercase tracking-wider text-mid font-semibold mb-2">
                      Subscription
                    </h4>
                    <div className="space-y-2.5">
                      <DetailRow
                        icon={<Shield size={13} />}
                        label="Tier"
                        value={tierLabel(selectedUser.subscription_tier)}
                      />
                      <DetailRow
                        icon={<Calendar size={13} />}
                        label="Renewal"
                        value={
                          selectedUser.renewal_date
                            ? formatDate(selectedUser.renewal_date)
                            : 'N/A'
                        }
                      />
                    </div>
                  </div>

                  {/* Wellness Stats */}
                  <div className="border-t border-primary/5 pt-4">
                    <h4 className="text-3xs uppercase tracking-wider text-mid font-semibold mb-2">
                      Wellness Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-soft rounded-xl p-3 text-center">
                        <Flame
                          size={18}
                          className="mx-auto text-orange-500 mb-1"
                        />
                        <div className="text-lg font-bold text-dark">
                          {selectedUser.checkin_streak ?? 0}
                        </div>
                        <div className="text-3xs text-mid">
                          Day Streak
                        </div>
                      </div>
                      <div className="bg-soft rounded-xl p-3 text-center">
                        <Coins
                          size={18}
                          className="mx-auto text-amber-500 mb-1"
                        />
                        <div className="text-lg font-bold text-dark">
                          {selectedUser.credits ?? 0}
                        </div>
                        <div className="text-3xs text-mid">Credits</div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Action Buttons ──────────────────────────────────── */}
                  <div className="border-t border-primary/5 pt-4 space-y-2">
                    <h4 className="text-3xs uppercase tracking-wider text-mid font-semibold mb-2">
                      Admin Actions
                    </h4>

                    {/* Verify */}
                    {!selectedUser.verified && (
                      <button
                        onClick={verifyUser}
                        disabled={actionLoading}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold
                          bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserCheck size={15} />
                        ✓ Verify User
                      </button>
                    )}

                    {/* Suspend — only if active */}
                    {selectedUser.status === 'active' && (
                      <button
                        onClick={suspendUser}
                        disabled={actionLoading}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold
                          bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShieldAlert size={15} />
                        ⚠ Suspend User
                      </button>
                    )}

                    {/* Ban — only if not already banned */}
                    {selectedUser.status !== 'banned' && (
                      <button
                        onClick={banUser}
                        disabled={actionLoading}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold
                          bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShieldBan size={15} />
                        🚫 Ban User
                      </button>
                    )}

                    {/* Reactivate — only if suspended or banned */}
                    {(selectedUser.status === 'suspended' ||
                      selectedUser.status === 'banned') && (
                      <button
                        onClick={reactivateUser}
                        disabled={actionLoading}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold
                          bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShieldCheck size={15} />
                        🔓 Reactivate User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className="text-mid/60">{icon}</span>
      <span className="text-mid w-20 shrink-0">{label}</span>
      <span className="text-dark font-medium truncate">
        {value || '—'}
      </span>
    </div>
  );
}
