/**
 * src/hooks/useFeed.js
 * Feed hook — fetches, paginates and filters articles from Supabase
 */

import { useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { useFeedStore } from '../store/feedStore.js';
import { useAuthStore } from '../store/authStore.js';

const PAGE_SIZE = 12;

export function useFeed() {
  const store    = useFeedStore();
  const authStore = useAuthStore();
  const tier     = authStore.tier?.() ?? 'free';

  const {
    articles, bookmarkedIds, activeCategory,
    loading, loadingMore, error, page, hasMore,
    setArticles, appendArticles, setLoading, setLoadingMore,
    setError, setPage, setHasMore, setBookmarks,
    toggleBookmark: toggleBookmarkStore,
    resetFeed,
  } = store;

  // ─── Fetch articles (initial load for current category) ──────────────────
  const fetchArticles = useCallback(async (category = activeCategory) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('articles')
        .select('id, title, slug, summary, category, tags, cover_image_url, read_time_minutes, is_premium, author_name, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      setArticles(data ?? []);
      setPage(1);
      setHasMore((data?.length ?? 0) === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, setArticles, setError, setHasMore, setLoading, setPage]);

  // ─── Load more (infinite scroll / "Load More") ───────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const from = page * PAGE_SIZE;
      const to   = from + PAGE_SIZE - 1;

      let query = supabase
        .from('articles')
        .select('id, title, slug, summary, category, tags, cover_image_url, read_time_minutes, is_premium, author_name, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(from, to);

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      appendArticles(data ?? []);
      setPage(page + 1);
      setHasMore((data?.length ?? 0) === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [activeCategory, hasMore, loadingMore, page, appendArticles, setError, setHasMore, setLoadingMore, setPage]);

  // ─── Bookmarks ────────────────────────────────────────────────────────────
  const fetchBookmarks = useCallback(async (userId) => {
    if (!userId) return;
    const { data } = await supabase
      .from('bookmarks')
      .select('article_id')
      .eq('user_id', userId);
    setBookmarks((data ?? []).map((b) => b.article_id));
  }, [setBookmarks]);

  const toggleBookmark = useCallback(async (articleId, userId) => {
    if (!userId) return;
    const isCurrentlyBookmarked = bookmarkedIds.has(articleId);

    // Optimistic update
    toggleBookmarkStore(articleId);

    if (isCurrentlyBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId);
    } else {
      // Enforce bookmark limit for free users
      if (tier === 'free' && bookmarkedIds.size >= 10) {
        // Revert optimistic update
        toggleBookmarkStore(articleId);
        return { paywalled: true, reason: 'bookmark_limit' };
      }
      await supabase
        .from('bookmarks')
        .insert({ user_id: userId, article_id: articleId });
    }

    return { paywalled: false };
  }, [bookmarkedIds, tier, toggleBookmarkStore]);

  // ─── Fetch single article ─────────────────────────────────────────────────
  const fetchArticle = useCallback(async (slug) => {
    const { data, error: fetchErr } = await supabase
      .from('articles')
      .select(`
        *,
        article_products (
          products (id, title, description, price_zar, image_url, product_url, category)
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (fetchErr) throw fetchErr;
    return data;
  }, []);

  return {
    articles,
    loading,
    loadingMore,
    error,
    hasMore,
    activeCategory,
    bookmarkedIds,
    fetchArticles,
    loadMore,
    fetchBookmarks,
    toggleBookmark,
    fetchArticle,
    resetFeed,
  };
}
