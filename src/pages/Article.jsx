/**
 * src/pages/Article.jsx
 * Article Detail page with content restriction gating and Happy Splurge product integration.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import { MOCK_ARTICLES } from '../lib/mockArticles.js';
import { MOCK_PRODUCTS } from '../lib/mockProducts.js';
import { ArrowLeft, Sparkles, Lock, ShoppingBag, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Article() {
  const { slug } = useParams();
  const { isGuest, tier } = useAuth();

  const [article, setArticle] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Parse custom block-level and inline markdown helpers
  const renderInlineMarkdown = (text) => {
    if (!text) return '';
    const parts = text.split(/\*\*(.*?)\*\*/);
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold text-primary">{part}</strong> : part));
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      // Headers (###)
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={index} className="font-display font-bold text-xl text-dark mt-6 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      
      // Subheaders (####)
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={index} className="font-display font-semibold text-lg text-dark mt-4 mb-2">
            {trimmed.replace('#### ', '')}
          </h4>
        );
      }

      // Blockquotes (> )
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={index} className="border-l-4 border-primary pl-4 py-1 my-5 italic text-mid bg-soft/30 pr-2 rounded-r-md">
            {renderInlineMarkdown(trimmed.replace(/>\s*/, ''))}
          </blockquote>
        );
      }

      // Bullet lists
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const items = trimmed.split(/\n[\*\-]\s+/);
        return (
          <ul key={index} className="list-disc pl-5 my-4 space-y-2 text-sm text-dark/90">
            {items.map((item, idx) => (
              <li key={idx}>
                {renderInlineMarkdown(item.replace(/^[\*\-]\s+/, ''))}
              </li>
            ))}
          </ul>
        );
      }

      // Standard text paragraph
      return (
        <p key={index} className="text-sm text-dark/90 leading-relaxed mb-4">
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    });
  };

  useEffect(() => {
    async function loadArticleData() {
      try {
        setLoading(true);
        let currentArticle = null;

        if (isGuest) {
          // Fallback to mock data directly
          currentArticle = MOCK_ARTICLES.find((a) => a.slug === slug);
        } else {
          // Fetch from Supabase
          const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('slug', slug)
            .single();

          if (error) {
            console.warn('[Article] DB fetch failed, using fallback mock matching:', error.message);
            currentArticle = MOCK_ARTICLES.find((a) => a.slug === slug);
          } else {
            currentArticle = data;
          }
        }

        if (!currentArticle) {
          setArticle(null);
          return;
        }

        setArticle(currentArticle);

        // Fetch connected products
        let linkedProducts = [];
        if (!isGuest) {
          try {
            const { data, error } = await supabase
              .from('article_products')
              .select(`
                sort_order,
                products (
                  id, title, description, price_zar, image_url, product_url, category, tags, is_active
                )
              `)
              .eq('article_id', currentArticle.id);

            if (error) throw error;

            if (data && data.length > 0) {
              // Extract product records and filter active ones
              linkedProducts = data
                .map((row) => row.products)
                .filter((p) => p && p.is_active)
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            }
          } catch (productsError) {
            console.warn('[Article] Linked products query failed:', productsError);
          }
        }

        // If no products retrieved from Supabase, select fallback products based on article tags/category
        if (linkedProducts.length === 0) {
          const matched = MOCK_PRODUCTS.filter((prod) => {
            const isSameCategory = prod.category === currentArticle.category;
            const hasCommonTags = prod.tags?.some((t) => currentArticle.tags?.includes(t));
            return isSameCategory || hasCommonTags;
          });
          linkedProducts = matched.length > 0 ? matched : MOCK_PRODUCTS.slice(0, 3);
        }

        setProducts(linkedProducts);
      } catch (err) {
        console.error('[Article] Failed to load data:', err);
        toast.error('Unable to fetch article details offline 🌸');
      } finally {
        setLoading(false);
      }
    }

    loadArticleData();
  }, [slug, isGuest]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto space-y-6 py-10 animate-pulse">
          <div className="h-4 bg-soft rounded w-20" />
          <div className="h-10 bg-soft rounded w-3/4" />
          <div className="h-64 bg-soft rounded-2xl w-full" />
          <div className="space-y-3">
            <div className="h-4 bg-soft rounded w-full" />
            <div className="h-4 bg-soft rounded w-5/6" />
            <div className="h-4 bg-soft rounded w-2/3" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!article) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="section-title mb-2">Article Not Found</h1>
          <p className="section-subtitle mb-6">The wellness guide you requested could not be located.</p>
          <Link to="/feed" className="btn-primary">
            Return to Feed
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const isLocked = article.is_premium && tier === 'free';

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-4 space-y-8 animate-fade-in">
        
        {/* Back Link */}
        <Link to="/feed" className="inline-flex items-center gap-1.5 text-xs font-semibold text-mid hover:text-primary transition-colors">
          <ArrowLeft size={14} />
          Back to Feed
        </Link>

        {/* Article Metadata Head */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="badge-secondary px-3 py-1 text-3xs font-semibold uppercase tracking-wider">
              {article.category}
            </span>
            {article.is_premium && (
              <span className="badge-premium px-3 py-1 text-3xs font-semibold flex items-center gap-1 shadow-sm">
                <Sparkles size={10} />
                Premium Sanctuary Guide
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-dark leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-2xs font-semibold text-mid">
            <span>By {article.author_name || 'Dr. Thandi Khumalo'}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
            <span>{article.read_time_minutes} min read</span>
          </div>
        </div>

        {/* Cover Photo */}
        {article.cover_image_url && (
          <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden bg-soft shadow-soft border border-primary/5">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article content block */}
        <div className="prose prose-sm max-w-none">
          {isLocked ? (
            /* Teaser preview block for restricted visitors */
            <div className="space-y-6 relative">
              <p className="text-sm text-dark/95 leading-relaxed font-semibold">
                {article.summary}
              </p>
              
              {/* Blurred teaser body */}
              <div className="select-none pointer-events-none opacity-45 blur-[3px] space-y-4">
                <p className="text-sm">
                  Progesterone encourages deep sleep cycle tracking, which regulates core circadian body heat. Under free plan rules, the bio-individual details remain encrypted. In order to read the full scientific data and guidelines for this cycle step, upgrading to the premium tiers enables instant access.
                </p>
                <p className="text-sm">
                  Incorporating wild yam extract and evening primrose oil has been clinically proven to alleviate cramping during the luteal phase transition. In South Africa, these ingredients can be sourced organically on Happy Splurge...
                </p>
              </div>

              {/* Paywall Overlay */}
              <div className="absolute inset-x-0 bottom-0 top-12 bg-gradient-to-t from-surface via-surface/90 to-transparent flex flex-col items-center justify-end text-center p-6 pt-20">
                <div className="card p-8 max-w-md bg-white border border-[#F8E0DD] shadow-glow flex flex-col items-center gap-4 animate-scale-in">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-soft">
                    <Lock size={20} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-dark">
                    Unlock Premium Sanctuary
                  </h3>
                  <p className="text-xs text-mid leading-relaxed">
                    This detailed guide is reserved for **Sista Premium** and **Sista Gold** members. Upgrade to unlock full phase sync articles, live classes, and custom trackers.
                  </p>
                  <Link to="/upgrade" id="paywall-upgrade-btn" className="btn-primary w-full justify-center gap-1.5 py-3">
                    Unlock Premium (R99/m)
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Full article content rendered */
            <div className="article-body">
              {renderMarkdown(article.body)}
            </div>
          )}
        </div>

        {/* Happy Splurge Product Recommendation Widget */}
        {products.length > 0 && (
          <div className="pt-8 border-t border-primary/10 space-y-6">
            <div>
              <h2 className="font-display font-semibold text-xl text-dark flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                Happy Splurge Recommendations
              </h2>
              <p className="text-xs text-mid mt-1">
                Curated organic essentials to nurture your body during this cycle phase.
              </p>
            </div>

            {/* Products grid list */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="card bg-white p-4 flex flex-col justify-between hover:shadow-card transition-shadow border border-primary/5"
                >
                  <div className="space-y-3">
                    {/* Thumbnail */}
                    {product.image_url && (
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-soft relative">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <h4 className="font-display font-semibold text-sm text-dark leading-tight line-clamp-1">
                        {product.title}
                      </h4>
                      <p className="text-mid text-3xs line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-primary/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      R{product.price_zar.toFixed(2)}
                    </span>
                    
                    <a
                      href={product.product_url || 'https://happysplurge.co.za'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-2xs font-bold text-primary hover:text-dark transition-colors"
                    >
                      Shop
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
