/**
 * src/store/feedStore.js
 * Zustand store — content feed state, filters, bookmarks
 */

import { create } from 'zustand';

// Article categories matching the DB schema
export const CATEGORIES = [
  { id: 'all',            label: 'All',             emoji: '✨' },
  { id: 'nutrition',      label: 'Nutrition',        emoji: '🥗' },
  { id: 'fitness',        label: 'Fitness',          emoji: '💪' },
  { id: 'mental_health',  label: 'Mental Health',    emoji: '🧠' },
  { id: 'hormonal',       label: 'Hormonal Health',  emoji: '🌸' },
  { id: 'relationships',  label: 'Relationships',    emoji: '💛' },
  { id: 'beauty',         label: 'Beauty',           emoji: '💄' },
  { id: 'spirituality',   label: 'Spirituality',     emoji: '🕊️' },
  { id: 'finance',        label: 'Finance',          emoji: '💸' },
];

export const useFeedStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────────────────────
  articles:       [],
  bookmarkedIds:  new Set(),
  activeCategory: 'all',
  loading:        false,
  loadingMore:    false,
  error:          null,
  page:           0,
  hasMore:        true,
  monthlyReadCount: 0,   // for free tier paywall (also tracked in localStorage)

  // ─── Actions ─────────────────────────────────────────────────────────────
  setArticles: (articles) => set({ articles }),

  appendArticles: (newArticles) =>
    set((state) => ({
      articles: [
        ...state.articles,
        ...newArticles.filter(
          (a) => !state.articles.find((x) => x.id === a.id)
        ),
      ],
    })),

  setCategory: (category) =>
    set({ activeCategory: category, articles: [], page: 0, hasMore: true }),

  setLoading:     (loading)     => set({ loading }),
  setLoadingMore: (loadingMore) => set({ loadingMore }),
  setError:       (error)       => set({ error }),
  setPage:        (page)        => set({ page }),
  setHasMore:     (hasMore)     => set({ hasMore }),

  setBookmarks: (ids) => set({ bookmarkedIds: new Set(ids) }),

  toggleBookmark: (articleId) =>
    set((state) => {
      const next = new Set(state.bookmarkedIds);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return { bookmarkedIds: next };
    }),

  isBookmarked: (articleId) => get().bookmarkedIds.has(articleId),

  incrementReadCount: () => {
    const count = get().monthlyReadCount + 1;
    set({ monthlyReadCount: count });
    // Persist to localStorage for cross-session tracking (free tier)
    try {
      const key   = `mysista-reads-${new Date().getFullYear()}-${new Date().getMonth()}`;
      const stored = parseInt(localStorage.getItem(key) ?? '0', 10);
      localStorage.setItem(key, stored + 1);
    } catch { /* ignore */ }
    return count;
  },

  getMonthlyReadCount: () => {
    try {
      const key = `mysista-reads-${new Date().getFullYear()}-${new Date().getMonth()}`;
      return parseInt(localStorage.getItem(key) ?? '0', 10);
    } catch {
      return get().monthlyReadCount;
    }
  },

  resetFeed: () =>
    set({ articles: [], page: 0, hasMore: true, error: null }),
}));
