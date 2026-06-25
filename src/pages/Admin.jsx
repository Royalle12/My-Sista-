/**
 * src/pages/Admin.jsx
 * Admin CMS & Dashboard
 * Provides full control over article publishing, product catalog, and article-product mappings.
 */

import { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import { MOCK_ARTICLES } from '../lib/mockArticles.js';
import { MOCK_PRODUCTS } from '../lib/mockProducts.js';
import {
  Plus,
  Edit2,
  Trash2,
  Link,
  BookOpen,
  ShoppingBag,
  Eye,
  EyeOff,
  Check,
  X,
  Search,
  Sparkles,
  Lock,
  Settings,
  AlertCircle,
  FileText,
  DollarSign,
  Tag,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

// Categories matching database schema
const CATEGORIES = [
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'mental_health', label: 'Mental Health' },
  { id: 'hormonal', label: 'Hormonal' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'spirituality', label: 'Spirituality' },
  { id: 'finance', label: 'Finance' },
];

export default function Admin() {
  const { isGuest } = useAuth();
  
  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'products' | 'links'

  // Feed/Data states
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]);
  const [links, setLinks] = useState([]); // Array of { article_id, product_id, sort_order }
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [articleSearch, setArticleSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form modals state
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null); // null means "new", otherwise article object
  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    summary: '',
    body: '',
    category: 'nutrition',
    tags: '',
    cover_image_url: '',
    read_time_minutes: 5,
    is_premium: false,
    is_published: false,
    author_name: ''
  });

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means "new", otherwise product object
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price_zar: 0,
    image_url: '',
    product_url: '',
    category: 'nutrition',
    tags: '',
    is_active: true,
    shopify_product_id: ''
  });

  // Linking interface states
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [linkSearch, setLinkSearch] = useState('');

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Synchronized data loaders
  const loadData = async () => {
    try {
      setLoading(true);
      let localArticles = [];
      let localProducts = [];
      let localLinks = [];

      // Check LocalStorage seeds
      const storedArticles = localStorage.getItem('mysista-admin-articles');
      const storedProducts = localStorage.getItem('mysista-admin-products');
      const storedLinks = localStorage.getItem('mysista-admin-links');

      if (storedArticles) {
        localArticles = JSON.parse(storedArticles);
      } else {
        localArticles = [...MOCK_ARTICLES];
        localStorage.setItem('mysista-admin-articles', JSON.stringify(localArticles));
      }

      if (storedProducts) {
        localProducts = JSON.parse(storedProducts);
      } else {
        localProducts = [...MOCK_PRODUCTS];
        localStorage.setItem('mysista-admin-products', JSON.stringify(localProducts));
      }

      if (storedLinks) {
        localLinks = JSON.parse(storedLinks);
      } else {
        // Pre-populate some connections
        localLinks = [
          { article_id: 'art-001', product_id: 'prod-001', sort_order: 0 },
          { article_id: 'art-001', product_id: 'prod-004', sort_order: 1 },
          { article_id: 'art-002', product_id: 'prod-002', sort_order: 0 },
          { article_id: 'art-003', product_id: 'prod-003', sort_order: 0 },
          { article_id: 'art-005', product_id: 'prod-005', sort_order: 0 }
        ];
        localStorage.setItem('mysista-admin-links', JSON.stringify(localLinks));
      }

      if (isGuest) {
        setArticles(localArticles);
        setProducts(localProducts);
        setLinks(localLinks);
        if (localArticles.length > 0) setSelectedArticleId(localArticles[0].id);
      } else {
        // Fetch from Supabase
        const { data: dbArticles, error: artError } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: dbProducts, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: dbLinks, error: linkError } = await supabase
          .from('article_products')
          .select('*');

        if (artError || prodError || linkError) {
          console.warn('[Admin] Failed to fetch live DB data, using LocalStorage fallback.');
          setArticles(localArticles);
          setProducts(localProducts);
          setLinks(localLinks);
          if (localArticles.length > 0) setSelectedArticleId(localArticles[0].id);
        } else {
          setArticles(dbArticles || []);
          setProducts(dbProducts || []);
          setLinks(dbLinks || []);
          if (dbArticles && dbArticles.length > 0) {
            setSelectedArticleId(dbArticles[0].id);
          } else if (localArticles.length > 0) {
            setSelectedArticleId(localArticles[0].id);
          }
          
          // FLAG 1: Clear sandbox LocalStorage keys on successful DB connection to prevent bleed
          localStorage.removeItem('mysista-admin-articles');
          localStorage.removeItem('mysista-admin-products');
          localStorage.removeItem('mysista-admin-links');
        }
      }
    } catch (err) {
      console.error('[Admin] Load data error:', err);
      toast.error('Error loading data modules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isGuest]);

  // Form handler helpers
  const openArticleForm = (art = null) => {
    if (art) {
      setEditingArticle(art);
      setArticleForm({
        title: art.title || '',
        slug: art.slug || '',
        summary: art.summary || '',
        body: art.body || '',
        category: art.category || 'nutrition',
        tags: art.tags ? art.tags.join(', ') : '',
        cover_image_url: art.cover_image_url || '',
        read_time_minutes: art.read_time_minutes || 5,
        is_premium: art.is_premium ?? false,
        is_published: art.is_published ?? false,
        author_name: art.author_name || ''
      });
    } else {
      setEditingArticle(null);
      setArticleForm({
        title: '',
        slug: '',
        summary: '',
        body: '',
        category: 'nutrition',
        tags: '',
        cover_image_url: '',
        read_time_minutes: 5,
        is_premium: false,
        is_published: false,
        author_name: ''
      });
    }
    setShowArticleForm(true);
  };

  const handleArticleTitleChange = (e) => {
    const val = e.target.value;
    setArticleForm(prev => ({
      ...prev,
      title: val,
      slug: prev.slug === generateSlug(prev.title) || !prev.slug ? generateSlug(val) : prev.slug
    }));
  };

  const saveArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.slug) {
      toast.error('Title and Slug are required.');
      return;
    }

    // FLAG 3: Slug collision check
    const isSlugDuplicate = articles.some(
      a => a.slug === articleForm.slug && a.id !== editingArticle?.id
    );
    if (isSlugDuplicate) {
      toast.error(`The URL slug "${articleForm.slug}" is already in use. Please use a unique title or slug.`);
      return;
    }

    const payload = {
      title: articleForm.title,
      slug: articleForm.slug,
      summary: articleForm.summary,
      body: articleForm.body,
      category: articleForm.category,
      tags: articleForm.tags ? articleForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      cover_image_url: articleForm.cover_image_url,
      read_time_minutes: parseInt(articleForm.read_time_minutes, 10) || 5,
      is_premium: articleForm.is_premium,
      is_published: articleForm.is_published,
      author_name: articleForm.author_name || 'Admin',
      updated_at: new Date().toISOString()
    };

    try {
      if (isGuest) {
        let updatedList = [...articles];
        if (editingArticle) {
          updatedList = updatedList.map(a => a.id === editingArticle.id ? { ...a, ...payload } : a);
          toast.success('Article updated in LocalStorage (Guest Mode) 🌸');
        } else {
          const newArt = {
            id: 'art-' + Date.now(),
            ...payload,
            created_at: new Date().toISOString(),
            published_at: payload.is_published ? new Date().toISOString() : null
          };
          updatedList.unshift(newArt);
          toast.success('New article created in LocalStorage (Guest Mode) 🌸');
        }
        setArticles(updatedList);
        localStorage.setItem('mysista-admin-articles', JSON.stringify(updatedList));
      } else {
        if (editingArticle) {
          const { error } = await supabase
            .from('articles')
            .update({
              ...payload,
              published_at: payload.is_published && !editingArticle.is_published ? new Date().toISOString() : editingArticle.published_at
            })
            .eq('id', editingArticle.id);
          if (error) throw error;
          toast.success('Article updated successfully ✨');
        } else {
          const { error } = await supabase
            .from('articles')
            .insert([{
              ...payload,
              published_at: payload.is_published ? new Date().toISOString() : null
            }]);
          if (error) throw error;
          toast.success('Article published successfully ✨');
        }
        await loadData();
      }
      setShowArticleForm(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save article.');
    }
  };

  const deleteArticle = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      if (isGuest) {
        const filtered = articles.filter(a => a.id !== id);
        setArticles(filtered);
        localStorage.setItem('mysista-admin-articles', JSON.stringify(filtered));
        
        // Remove orphan links
        const filteredLinks = links.filter(l => l.article_id !== id);
        setLinks(filteredLinks);
        localStorage.setItem('mysista-admin-links', JSON.stringify(filteredLinks));

        toast.success('Article removed from LocalStorage (Guest Mode) 🌸');
      } else {
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) throw error;
        toast.success('Article deleted successfully.');
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete article.');
    }
  };

  const togglePublishStatus = async (art) => {
    const nextStatus = !art.is_published;
    try {
      if (isGuest) {
        const updated = articles.map(a => a.id === art.id ? {
          ...a,
          is_published: nextStatus,
          published_at: nextStatus ? new Date().toISOString() : null
        } : a);
        setArticles(updated);
        localStorage.setItem('mysista-admin-articles', JSON.stringify(updated));
        toast.success(`Article set to ${nextStatus ? 'Published' : 'Draft'} 🌸`);
      } else {
        const { error } = await supabase
          .from('articles')
          .update({
            is_published: nextStatus,
            published_at: nextStatus ? new Date().toISOString() : null
          })
          .eq('id', art.id);
        if (error) throw error;
        toast.success(`Article set to ${nextStatus ? 'Published' : 'Draft'}`);
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle status.');
    }
  };

  // Product Form helpers
  const openProductForm = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        title: prod.title || '',
        description: prod.description || '',
        price_zar: prod.price_zar || 0,
        image_url: prod.image_url || '',
        product_url: prod.product_url || '',
        category: prod.category || 'nutrition',
        tags: prod.tags ? prod.tags.join(', ') : '',
        is_active: prod.is_active ?? true,
        shopify_product_id: prod.shopify_product_id || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        title: '',
        description: '',
        price_zar: 0,
        image_url: '',
        product_url: '',
        category: 'nutrition',
        tags: '',
        is_active: true,
        shopify_product_id: ''
      });
    }
    setShowProductForm(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title) {
      toast.error('Product title is required.');
      return;
    }

    const payload = {
      title: productForm.title,
      description: productForm.description,
      price_zar: parseFloat(productForm.price_zar) || 0,
      image_url: productForm.image_url,
      product_url: productForm.product_url,
      category: productForm.category,
      tags: productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      is_active: productForm.is_active,
      shopify_product_id: productForm.shopify_product_id || null,
      updated_at: new Date().toISOString()
    };

    try {
      if (isGuest) {
        let updatedList = [...products];
        if (editingProduct) {
          updatedList = updatedList.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p);
          toast.success('Product updated in LocalStorage (Guest Mode) 🌸');
        } else {
          const newProd = {
            id: 'prod-' + Date.now(),
            ...payload,
            created_at: new Date().toISOString()
          };
          updatedList.unshift(newProd);
          toast.success('Product created in LocalStorage (Guest Mode) 🌸');
        }
        setProducts(updatedList);
        localStorage.setItem('mysista-admin-products', JSON.stringify(updatedList));
      } else {
        if (editingProduct) {
          const { error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', editingProduct.id);
          if (error) throw error;
          toast.success('Product updated successfully ✨');
        } else {
          const { error } = await supabase
            .from('products')
            .insert([payload]);
          if (error) throw error;
          toast.success('Product added successfully ✨');
        }
        await loadData();
      }
      setShowProductForm(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product.');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      if (isGuest) {
        const filtered = products.filter(p => p.id !== id);
        setProducts(filtered);
        localStorage.setItem('mysista-admin-products', JSON.stringify(filtered));

        // Remove mapping links
        const filteredLinks = links.filter(l => l.product_id !== id);
        setLinks(filteredLinks);
        localStorage.setItem('mysista-admin-links', JSON.stringify(filteredLinks));

        toast.success('Product deleted from LocalStorage (Guest Mode) 🌸');
      } else {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        toast.success('Product deleted successfully.');
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product.');
    }
  };

  const toggleProductActive = async (prod) => {
    const nextStatus = !prod.is_active;
    try {
      if (isGuest) {
        const updated = products.map(p => p.id === prod.id ? { ...p, is_active: nextStatus } : p);
        setProducts(updated);
        localStorage.setItem('mysista-admin-products', JSON.stringify(updated));
        toast.success(`Product set to ${nextStatus ? 'Active' : 'Inactive'} 🌸`);
      } else {
        const { error } = await supabase
          .from('products')
          .update({ is_active: nextStatus })
          .eq('id', prod.id);
        if (error) throw error;
        toast.success(`Product set to ${nextStatus ? 'Active' : 'Inactive'}`);
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle active status.');
    }
  };

  // Article-Product mapping handlers
  const handleLinkProduct = async (prodId) => {
    if (!selectedArticleId) return;
    try {
      // Check if already linked
      const exists = links.some(l => l.article_id === selectedArticleId && l.product_id === prodId);
      if (exists) {
        toast.error('This product is already linked to the article.');
        return;
      }

      const newLink = {
        article_id: selectedArticleId,
        product_id: prodId,
        sort_order: links.filter(l => l.article_id === selectedArticleId).length
      };

      if (isGuest) {
        const updatedLinks = [...links, newLink];
        setLinks(updatedLinks);
        localStorage.setItem('mysista-admin-links', JSON.stringify(updatedLinks));
        toast.success('Product linked successfully in LocalStorage (Guest Mode) 🌸');
      } else {
        const { error } = await supabase.from('article_products').insert([newLink]);
        if (error) throw error;
        toast.success('Product linked successfully ✨');
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to link product.');
    }
  };

  const handleUnlinkProduct = async (prodId) => {
    if (!selectedArticleId) return;
    try {
      if (isGuest) {
        const updatedLinks = links.filter(l => !(l.article_id === selectedArticleId && l.product_id === prodId));
        setLinks(updatedLinks);
        localStorage.setItem('mysista-admin-links', JSON.stringify(updatedLinks));
        toast.success('Product unlinked successfully in LocalStorage (Guest Mode) 🌸');
      } else {
        const { error } = await supabase
          .from('article_products')
          .delete()
          .eq('article_id', selectedArticleId)
          .eq('product_id', prodId);
        if (error) throw error;
        toast.success('Product unlinked successfully.');
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to unlink product.');
    }
  };

  // Computed data calculations
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchSearch = art.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
                          art.summary?.toLowerCase().includes(articleSearch.toLowerCase()) ||
                          art.author_name?.toLowerCase().includes(articleSearch.toLowerCase());
      const matchCat = categoryFilter === 'all' || art.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [articles, articleSearch, categoryFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter(prod => {
      const matchSearch = prod.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                          prod.description?.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = categoryFilter === 'all' || prod.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, categoryFilter]);

  const selectedArticle = useMemo(() => {
    return articles.find(a => a.id === selectedArticleId);
  }, [articles, selectedArticleId]);

  const linkedProductsForSelected = useMemo(() => {
    if (!selectedArticleId) return [];
    const prodIds = links
      .filter(l => l.article_id === selectedArticleId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(l => l.product_id);
    return products.filter(p => prodIds.includes(p.id));
  }, [links, selectedArticleId, products]);

  const unlinkedProductsForSelected = useMemo(() => {
    if (!selectedArticleId) return products;
    const linkedIds = new Set(links.filter(l => l.article_id === selectedArticleId).map(l => l.product_id));
    return products.filter(p => !linkedIds.has(p.id) && p.title.toLowerCase().includes(linkSearch.toLowerCase()));
  }, [products, links, selectedArticleId, linkSearch]);

  return (
    <PageWrapper>
      <div className="space-y-6 pb-12 animate-fade-in">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="section-title text-gradient">Admin CMS Panel</h1>
              <span className="badge-primary px-2.5 py-0.5 text-3xs font-semibold uppercase">
                {isGuest ? 'Guest Simulation' : 'Production Database'}
              </span>
            </div>
            <p className="section-subtitle">
              Nurture the sanctuary. Manage wellness literature, Happy Splurge products, and context links.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => openArticleForm()}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <Plus size={14} />
              New Article
            </button>
            <button
              onClick={() => openProductForm()}
              className="btn-outline btn-sm flex items-center gap-1.5"
            >
              <Plus size={14} />
              New Product
            </button>
          </div>
        </div>

        {/* System Warnings if Guest */}
        {isGuest && (
          <div className="card bg-orange-50 border border-orange-200/50 p-4 flex gap-3 text-orange-800 text-xs">
            <AlertCircle size={18} className="shrink-0 text-orange-600" />
            <div>
              <span className="font-bold">Guest Mode Sandbox:</span> Changes are saved to your browser's local storage and will fallback seamlessly. Sign in to an administrator account to write updates directly to the Supabase Postgres database.
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-primary/5 pb-0.5 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2.5 border-b-2 text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'articles'
                ? 'border-primary text-primary'
                : 'border-transparent text-mid hover:text-primary'
            }`}
          >
            <BookOpen size={16} />
            Wellness Articles ({articles.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 border-b-2 text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-primary text-primary'
                : 'border-transparent text-mid hover:text-primary'
            }`}
          >
            <ShoppingBag size={16} />
            Happy Splurge Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2.5 border-b-2 text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'links'
                ? 'border-primary text-primary'
                : 'border-transparent text-mid hover:text-primary'
            }`}
          >
            <Link size={16} />
            Article-Product Linker ({links.length})
          </button>
        </div>

        {/* Search controls */}
        {activeTab !== 'links' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mid" />
              <input
                type="text"
                placeholder={activeTab === 'articles' ? 'Search by title, author...' : 'Search by product name, description...'}
                value={activeTab === 'articles' ? articleSearch : productSearch}
                onChange={(e) => activeTab === 'articles' ? setArticleSearch(e.target.value) : setProductSearch(e.target.value)}
                className="input pl-10 py-2 text-xs"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input sm:max-w-[200px] py-2 text-xs"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tab 1: Articles Table */}
        {activeTab === 'articles' && (
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-sm text-mid animate-pulse">Loading article repository...</div>
            ) : filteredArticles.length === 0 ? (
              <div className="p-12 text-center text-sm text-mid">No articles found in this selection.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-soft text-primary font-semibold border-b border-primary/10">
                      <th className="p-4">Cover</th>
                      <th className="p-4">Title & Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Author</th>
                      <th className="p-4">Access Status</th>
                      <th className="p-4">Pub Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {filteredArticles.map(art => (
                      <tr key={art.id} className="hover:bg-soft/20 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-lg bg-soft overflow-hidden border border-primary/10 shrink-0">
                            {art.cover_image_url ? (
                              <img src={art.cover_image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary/30"><BookOpen size={18} /></div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="font-bold text-dark truncate">{art.title}</div>
                          <div className="text-3xs text-mid truncate font-semibold">slug: {art.slug} • {art.read_time_minutes}m read</div>
                        </td>
                        <td className="p-4">
                          <span className="badge bg-soft text-primary capitalize font-semibold">{art.category}</span>
                        </td>
                        <td className="p-4 font-medium text-dark">{art.author_name || 'Admin'}</td>
                        <td className="p-4">
                          {art.is_premium ? (
                            <span className="badge-premium px-2 py-0.5 text-3xs font-semibold flex items-center gap-0.5 w-fit">
                              <Sparkles size={8} /> Premium
                            </span>
                          ) : (
                            <span className="badge-primary px-2 py-0.5 text-3xs font-semibold w-fit">Free</span>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => togglePublishStatus(art)}
                            className={`badge font-semibold cursor-pointer select-none transition-colors ${
                              art.is_published 
                                ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' 
                                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                            }`}
                          >
                            {art.is_published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openArticleForm(art)}
                              className="p-1.5 text-mid hover:text-primary hover:bg-soft rounded-lg transition-colors"
                              title="Edit Article"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteArticle(art.id)}
                              className="p-1.5 text-mid hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Article"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Products Table */}
        {activeTab === 'products' && (
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-sm text-mid animate-pulse">Loading products database...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-sm text-mid">No products found in this selection.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-soft text-primary font-semibold border-b border-primary/10">
                      <th className="p-4">Image</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price (ZAR)</th>
                      <th className="p-4">Availability</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {filteredProducts.map(prod => (
                      <tr key={prod.id} className="hover:bg-soft/20 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-lg bg-soft overflow-hidden border border-primary/10 shrink-0">
                            {prod.image_url ? (
                              <img src={prod.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary/30"><ShoppingBag size={18} /></div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="font-bold text-dark">{prod.title}</div>
                          <div className="text-3xs text-mid line-clamp-1 leading-normal">{prod.description}</div>
                        </td>
                        <td className="p-4">
                          <span className="badge bg-soft text-primary capitalize font-semibold">{prod.category}</span>
                        </td>
                        <td className="p-4 font-bold text-primary">R{prod.price_zar ? prod.price_zar.toFixed(2) : '0.00'}</td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleProductActive(prod)}
                            className={`badge font-semibold cursor-pointer select-none transition-colors ${
                              prod.is_active 
                                ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' 
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            {prod.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {prod.product_url && (
                              <a
                                href={prod.product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-mid hover:text-primary hover:bg-soft rounded-lg transition-colors inline-flex items-center"
                                title="View on Shop"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                            <button
                              onClick={() => openProductForm(prod)}
                              className="p-1.5 text-mid hover:text-primary hover:bg-soft rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteProduct(prod.id)}
                              className="p-1.5 text-mid hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Article ↔ Product Linker */}
        {activeTab === 'links' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sidebar list of articles */}
            <div className="card p-4 space-y-3 md:col-span-1">
              <h3 className="font-display font-semibold text-sm text-dark border-b border-primary/5 pb-2">Select Article</h3>
              <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
                {articles.map(art => (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArticleId(art.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all text-xs font-medium border flex items-center justify-between ${
                      selectedArticleId === art.id
                        ? 'bg-primary text-white border-primary shadow-soft'
                        : 'bg-white border-primary/5 text-dark hover:bg-soft/30'
                    }`}
                  >
                    <span className="truncate pr-2">{art.title}</span>
                    <span className={`badge shrink-0 font-bold ${
                      selectedArticleId === art.id ? 'bg-white/20 text-white' : 'bg-soft text-primary'
                    }`}>
                      {links.filter(l => l.article_id === art.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Link detail panels */}
            <div className="md:col-span-2 space-y-6">
              {selectedArticle ? (
                <>
                  {/* Linked Products for Selected Article */}
                  <div className="card p-5 space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-base text-dark">
                        Linked Products for: <span className="text-primary italic">"{selectedArticle.title}"</span>
                      </h3>
                      <p className="text-3xs text-mid mt-0.5">
                        These items display inside the bottom Happy Splurge widget of this article page.
                      </p>
                    </div>

                    {linkedProductsForSelected.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-primary/10 rounded-xl text-xs text-mid">
                        No products are currently linked to this article. Add recommendations below.
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {linkedProductsForSelected.map(prod => (
                          <div key={prod.id} className="card bg-white p-3 border border-primary/5 flex items-center justify-between gap-3 hover:shadow-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-10 h-10 rounded bg-soft overflow-hidden shrink-0">
                                {prod.image_url && <img src={prod.image_url} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="overflow-hidden">
                                <div className="text-xs font-bold text-dark truncate">{prod.title}</div>
                                <div className="text-3xs text-primary font-semibold">R{prod.price_zar ? prod.price_zar.toFixed(2) : '0.00'}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnlinkProduct(prod.id)}
                              className="btn-ghost p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              title="Unlink Product"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add recommendations search list */}
                  <div className="card p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-primary/5 pb-3">
                      <div>
                        <h4 className="font-display font-semibold text-sm text-dark">Add Recommendations</h4>
                        <p className="text-3xs text-mid mt-0.5">Search catalog products and link them.</p>
                      </div>
                      
                      <div className="relative max-w-xs w-full">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mid" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={linkSearch}
                          onChange={(e) => setLinkSearch(e.target.value)}
                          className="input pl-8 py-1.5 text-3xs"
                        />
                      </div>
                    </div>

                    {unlinkedProductsForSelected.length === 0 ? (
                      <div className="text-center py-6 text-xs text-mid">No products matching filters.</div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                        {unlinkedProductsForSelected.map(prod => (
                          <div key={prod.id} className="card bg-white p-3 border border-primary/5 flex items-center justify-between gap-3 hover:bg-soft/10">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-10 h-10 rounded bg-soft overflow-hidden shrink-0">
                                {prod.image_url && <img src={prod.image_url} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="overflow-hidden">
                                <div className="text-xs font-semibold text-dark truncate">{prod.title}</div>
                                <div className="text-3xs text-mid capitalize">{prod.category} • R{prod.price_zar}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleLinkProduct(prod.id)}
                              className="btn-outline p-1.5 hover:bg-primary text-primary hover:text-white rounded-lg"
                              title="Link Product"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="card p-8 text-center text-xs text-mid">
                  Select an article from the left sidebar to manage its product recommendations.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Article Editor Form Modal */}
        {showArticleForm && (
          <div className="fixed inset-0 bg-dark/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="card bg-white w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-glow animate-scale-in">
              <div className="flex justify-between items-center border-b border-primary/10 pb-3">
                <h3 className="font-display font-bold text-base text-dark flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  {editingArticle ? 'Edit Wellness Article' : 'Compose New Article'}
                </h3>
                <button
                  onClick={() => setShowArticleForm(false)}
                  className="p-1 text-mid hover:text-dark hover:bg-soft rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={saveArticle} className="space-y-4 text-xs">
                
                {/* Title */}
                <div>
                  <label className="label">Article Title</label>
                  <input
                    type="text"
                    required
                    value={articleForm.title}
                    onChange={handleArticleTitleChange}
                    placeholder="e.g. Navigating Menstruation: Iron-Rich Meals"
                    className="input py-2 text-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Slug */}
                  <div>
                    <label className="label">Url Slug</label>
                    <input
                      type="text"
                      required
                      value={articleForm.slug}
                      onChange={(e) => setArticleForm(p => ({ ...p, slug: e.target.value }))}
                      placeholder="e.g. navigating-menstruation-meals"
                      className="input py-2 text-xs"
                    />
                  </div>

                  {/* Author Name */}
                  <div>
                    <label className="label">Author Name</label>
                    <input
                      type="text"
                      value={articleForm.author_name}
                      onChange={(e) => setArticleForm(p => ({ ...p, author_name: e.target.value }))}
                      placeholder="e.g. Dr. Nomsa Ndlovu"
                      className="input py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="label">Category</label>
                    <select
                      value={articleForm.category}
                      onChange={(e) => setArticleForm(p => ({ ...p, category: e.target.value }))}
                      className="input py-2 text-xs capitalize"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Read Time */}
                  <div>
                    <label className="label">Read Time (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={articleForm.read_time_minutes}
                      onChange={(e) => setArticleForm(p => ({ ...p, read_time_minutes: e.target.value }))}
                      className="input py-2 text-xs"
                    />
                  </div>

                  {/* Cover Image URL */}
                  <div>
                    <label className="label">Cover Image URL</label>
                    <input
                      type="text"
                      value={articleForm.cover_image_url}
                      onChange={(e) => setArticleForm(p => ({ ...p, cover_image_url: e.target.value }))}
                      placeholder="https://unsplash.com/..."
                      className="input py-2 text-xs"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="label">Summary / Teaser</label>
                  <textarea
                    rows="2"
                    value={articleForm.summary}
                    onChange={(e) => setArticleForm(p => ({ ...p, summary: e.target.value }))}
                    placeholder="Short description summarizing the article for card cards."
                    className="input py-2 text-xs"
                  />
                </div>

                {/* Body Markdown Content */}
                <div>
                  <label className="label">Body Content (Supports simple Markdown like ###, *, & **)</label>
                  <textarea
                    rows="8"
                    required
                    value={articleForm.body}
                    onChange={(e) => setArticleForm(p => ({ ...p, body: e.target.value }))}
                    placeholder="### Heading&#10;&#10;Use asterisks for lists:&#10;* Item one&#10;* Item two&#10;&#10;Use double asterisks for **bold text**."
                    className="input py-2 text-xs font-mono"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={articleForm.tags}
                    onChange={(e) => setArticleForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="e.g. menstruation, iron, nutrition, recipe"
                    className="input py-2 text-xs"
                  />
                </div>

                {/* Toggles */}
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-dark">
                    <input
                      type="checkbox"
                      checked={articleForm.is_premium}
                      onChange={(e) => setArticleForm(p => ({ ...p, is_premium: e.target.checked }))}
                      className="rounded border-primary/30 text-primary focus:ring-primary/20 w-4 h-4"
                    />
                    <span>Premium Gated Article</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-dark">
                    <input
                      type="checkbox"
                      checked={articleForm.is_published}
                      onChange={(e) => setArticleForm(p => ({ ...p, is_published: e.target.checked }))}
                      className="rounded border-primary/30 text-primary focus:ring-primary/20 w-4 h-4"
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-primary/5">
                  <button
                    type="button"
                    onClick={() => setShowArticleForm(false)}
                    className="btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary btn-sm"
                  >
                    {editingArticle ? 'Save Changes' : 'Publish Article'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Product Editor Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-dark/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="card bg-white w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-glow animate-scale-in">
              <div className="flex justify-between items-center border-b border-primary/10 pb-3">
                <h3 className="font-display font-bold text-base text-dark flex items-center gap-2">
                  <ShoppingBag size={18} className="text-primary" />
                  {editingProduct ? 'Edit Product Catalog' : 'Add New Happy Splurge Product'}
                </h3>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="p-1 text-mid hover:text-dark hover:bg-soft rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={saveProduct} className="space-y-4 text-xs">
                
                {/* Title */}
                <div>
                  <label className="label">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Organic Sleep Chamomile Tea"
                    className="input py-2 text-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className="label">Price (ZAR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mid font-semibold">R</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={productForm.price_zar}
                        onChange={(e) => setProductForm(p => ({ ...p, price_zar: e.target.value }))}
                        className="input pl-7 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="label">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm(p => ({ ...p, category: e.target.value }))}
                      className="input py-2 text-xs capitalize"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Image URL */}
                  <div>
                    <label className="label">Image URL</label>
                    <input
                      type="text"
                      value={productForm.image_url}
                      onChange={(e) => setProductForm(p => ({ ...p, image_url: e.target.value }))}
                      placeholder="https://unsplash.com/..."
                      className="input py-2 text-xs"
                    />
                  </div>

                  {/* Shopify ID / Affiliate URL */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Shopify Product ID</label>
                      <input
                        type="text"
                        value={productForm.shopify_product_id}
                        onChange={(e) => setProductForm(p => ({ ...p, shopify_product_id: e.target.value }))}
                        placeholder="e.g. shp_9281"
                        className="input py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="label">Shop URL / Affiliate Link</label>
                      <input
                        type="text"
                        value={productForm.product_url}
                        onChange={(e) => setProductForm(p => ({ ...p, product_url: e.target.value }))}
                        placeholder="https://happysplurge.co.za/..."
                        className="input py-2 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="label">Description</label>
                  <textarea
                    rows="3"
                    value={productForm.description}
                    onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe product highlights, wellness benefits, or cycle application."
                    className="input py-2 text-xs"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="e.g. cramps, sleep, tea, bath, magnesium"
                    className="input py-2 text-xs"
                  />
                </div>

                {/* Status Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-dark">
                    <input
                      type="checkbox"
                      checked={productForm.is_active}
                      onChange={(e) => setProductForm(p => ({ ...p, is_active: e.target.checked }))}
                      className="rounded border-primary/30 text-primary focus:ring-primary/20 w-4 h-4"
                    />
                    <span>Active and Available in Shop widget recommendations</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-primary/5">
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary btn-sm"
                  >
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
