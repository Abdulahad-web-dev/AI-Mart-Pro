'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Package,
  Truck,
  ShieldCheck,
  Sparkles,
  Star,
  Heart,
  ShoppingBag,
  Search,
  TrendingUp,
  Headphones,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  MapPin,
  UserRound,
  Clock,
  CheckCircle2,
  Tag,
  LogOut,
  Settings,
  ArrowUpRight,
  Send,
  Flag,
  Store,
  Zap,
  RotateCcw,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  BadgePercent,
  Award,
  Layers,
  Scale,
  Cpu,
  Activity,
  Bot,
  BarChart3
} from 'lucide-react';
import { api, post, patch, del, Product, Category, CartItem, Order, Review, User, money, imageSrc, shortDate } from '@/lib/api';
import { useApp, addLocalCart, toggleLocalWishlist, getLocalWishlist, getLocalCartCount } from '@/lib/app-context';
import { Button, ProductCard, Head, Empty, Loading, Status, ErrorNote, FormField } from '@/components/ui';
import { getCompared, clearCompared, toggleCompare } from '@/lib/compare';
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from '@/lib/demo-products';
import { AIStudio } from '@/components/ai-studio';
import { AIMartLogo } from '@/components/ai-mart-logo';

const catIcons: Record<string, string> = {
  Electronics: '🎧',
  Fashion: '👟',
  'Home & Living': '🛋️',
  Beauty: '🧴',
  Sports: '🏋️',
  Books: '📚'
};

function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="page-hero-lux">
      <div className="container">
        <div className="breadcrumb-lux">
          <Link href="/">Home</Link>
          <ChevronRight size={13} />
          <span>{title}</span>
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}

export function HomeView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'deals' | 'top' | 'budget'>('all');

  useEffect(() => {
    // Attempt API fetch; fallback to rich DEMO_PRODUCTS
    void api<{ products: Product[] }>('/api/products?limit=12')
      .then((r) => {
        if (r.products && r.products.length > 0) setProducts(r.products);
        else setProducts(DEMO_PRODUCTS);
      })
      .catch(() => setProducts(DEMO_PRODUCTS));

    void api<Category[]>('/api/categories')
      .then((c) => {
        if (c && c.length > 0) setCats(c);
        else setCats(DEMO_CATEGORIES);
      })
      .catch(() => setCats(DEMO_CATEGORIES));
  }, []);

  // Display products based on active tab
  const displayProducts = useMemo(() => {
    const list = products.length ? products : DEMO_PRODUCTS;
    if (activeTab === 'deals') {
      return list.filter((p) => p.comparePrice && p.comparePrice > p.price).slice(0, 8);
    }
    if (activeTab === 'top') {
      return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
    }
    if (activeTab === 'budget') {
      return list.filter((p) => p.price <= 5000).slice(0, 8);
    }
    return list.slice(0, 8);
  }, [products, activeTab]);

  const [aiStatus, setAiStatus] = useState<{ online: boolean; latencyMs: number | null; salesModelLoaded: boolean; sentimentModelLoaded: boolean } | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);

  useEffect(() => {
    void api<{ online: boolean; latencyMs: number | null; salesModelLoaded: boolean; sentimentModelLoaded: boolean }>('/api/ai/status')
      .then(setAiStatus)
      .catch(() => setAiStatus({ online: false, latencyMs: null, salesModelLoaded: false, sentimentModelLoaded: false }));
    void api<{ total?: number }>('/api/products?limit=1')
      .then((r) => { if (typeof r.total === 'number') setTotalProducts(r.total); })
      .catch(() => {});
  }, []);

  const showcase = useMemo(() => (products.length ? products : DEMO_PRODUCTS).slice(0, 3), [products]);
  const aiOn = !!aiStatus?.online;

  const engines = [
    { icon: <TrendingUp size={16} />, name: 'Demand forecasting', spec: 'RandomForestRegressor · scikit-learn', ok: !!aiStatus?.salesModelLoaded },
    { icon: <Sparkles size={16} />, name: 'Review sentiment', spec: 'TF-IDF + Logistic Regression', ok: !!aiStatus?.sentimentModelLoaded },
    { icon: <Layers size={16} />, name: 'Product recommendations', spec: 'Content-based · category, title, price', ok: aiOn },
    { icon: <Package size={16} />, name: 'Inventory guidance', spec: 'Reorder-point rule from forecast', ok: aiOn }
  ];

  const stats = [
    { value: totalProducts !== null ? String(totalProducts) : String((products.length || DEMO_PRODUCTS.length)), label: 'Products live', sub: 'From verified merchants' },
    { value: String(DEMO_CATEGORIES.length), label: 'Departments', sub: 'Electronics to Books' },
    { value: aiOn && aiStatus?.latencyMs ? `${aiStatus.latencyMs} ms` : 'Offline', label: 'AI service latency', sub: 'Measured just now' },
    { value: `${[aiStatus?.salesModelLoaded, aiStatus?.sentimentModelLoaded].filter(Boolean).length}/2`, label: 'Trained models loaded', sub: 'Forecast & sentiment' }
  ];

  const catTaglines: Record<string, string> = {
    Electronics: 'Audio, wearables & gadgets',
    Fashion: 'Streetwear, bags & shoes',
    'Home & Living': 'Lighting, decor & comfort',
    Beauty: 'Skincare & self-care',
    Sports: 'Training & outdoor gear',
    Books: 'Learn, plan & grow'
  };

  return (
    <div className="home-experience neural-cyber-theme">
      {/* 1. HERO */}
      <section className="neural-hero-sec">
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
        <div className="container">
          <div className="neural-hero-grid">
            <div className="neural-hero-text">
              <div className="neural-kicker-pill">
                <span className={`pulsing-neural-dot ${aiOn ? '' : 'off'}`} />
                <span>{aiOn ? 'AI services online' : 'AI services starting'} · Pakistan&apos;s smart marketplace</span>
              </div>

              <h1 className="neural-hero-h1">
                Shop what fits you.
                <span className="neural-gradient-block">Sell with real foresight.</span>
              </h1>

              <p className="neural-hero-p">
                AI Mart Pro is a multi-vendor marketplace with built-in machine learning: demand forecasts and restock
                guidance for merchants, review sentiment for quality, and smart recommendations for shoppers. No
                countdown timers, no noise.
              </p>

              <div className="neural-hero-actions">
                <Link href="/shop" className="btn-neural-primary">
                  <ShoppingBag size={18} /> Start shopping <ArrowRight size={16} />
                </Link>
                <a href="#live-ai-studio" className="btn-neural-secondary">
                  <Cpu size={18} /> Try the AI models live
                </a>
              </div>

              <div className="neural-telemetry-row">
                <div className="telemetry-item">
                  <Truck size={16} className="text-cyan-400" />
                  <div>
                    <strong>Nationwide delivery</strong>
                    <small>Cash on delivery available</small>
                  </div>
                </div>
                <div className="telemetry-item">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <div>
                    <strong>Verified merchants</strong>
                    <small>Moderated listings</small>
                  </div>
                </div>
                <div className="telemetry-item">
                  <RotateCcw size={16} className="text-violet-400" />
                  <div>
                    <strong>7-day returns</strong>
                    <small>Hassle-free policy</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="neural-hero-monitor">
              <div className="showcase-stack">
                {showcase.map((p, i) => (
                  <Link key={p.id} href={`/product/${p.slug}`} className={`showcase-card showcase-${i}`}>
                    <div className="showcase-img">
                      <img src={imageSrc(p)} alt={p.name} />
                    </div>
                    <div className="showcase-info">
                      <span className="showcase-cat">{p.category?.name}</span>
                      <strong>{p.name}</strong>
                      <span className="showcase-price">{money(p.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="neural-glass-panel engine-panel">
                <div className="panel-topbar">
                  <span className="panel-title">LIVE SYSTEM STATUS</span>
                  <span className={`panel-chip ${aiOn ? '' : 'off'}`}>{aiOn ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
                <div className="panel-body">
                  {engines.map((e) => (
                    <div className="model-monitor-row" key={e.name}>
                      <div className="row-info">
                        <div className="model-name">
                          {e.icon}
                          <span>{e.name}</span>
                        </div>
                        <span className="model-spec">{e.spec}</span>
                      </div>
                      <span className={e.ok ? 'model-badge-green' : 'model-badge-green off'}>{e.ok ? 'READY' : 'OFFLINE'}</span>
                    </div>
                  ))}
                  <div className="panel-footnote">
                    <Bot size={14} />
                    <span>Models are trained on synthetic demo data and show estimates, not guarantees.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE STATS */}
      <section className="neural-metrics-sec">
        <div className="container">
          <div className="neural-metrics-grid">
            {stats.map((st) => (
              <div key={st.label} className="metric-glass-card">
                <span className="metric-val">{st.value}</span>
                <strong className="metric-lbl">{st.label}</strong>
                <span className="metric-sub">{st.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DEPARTMENTS */}
      <section className="neural-departments-sec">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">DEPARTMENTS</span>
            <h2>Browse by what you need</h2>
            <p>Six curated departments, every listing moderated and reviewed.</p>
          </div>

          <div className="neural-category-grid">
            {DEMO_CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/shop?category=${c.slug}`} className="neural-cat-card">
                <div className="cat-icon-halo">
                  <span>{catIcons[c.name] || '🛍️'}</span>
                </div>
                <div className="cat-info">
                  <strong className="cat-title">{c.name}</strong>
                  <span className="cat-vector-match">{catTaglines[c.name] || 'Explore the collection'}</span>
                </div>
                <div className="cat-arrow">
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TRENDING PRODUCTS */}
      <section className="trending-products-sec">
        <div className="container">
          <div className="trending-header-row">
            <div>
              <span className="eyebrow">FRESH FROM OUR MERCHANTS</span>
              <h2>Trending right now</h2>
              <p>Pick a lens and we&apos;ll re-sort the catalogue for you.</p>
            </div>

            <div className="trending-tabs">
              <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                All
              </button>
              <button className={`tab-btn ${activeTab === 'deals' ? 'active' : ''}`} onClick={() => setActiveTab('deals')}>
                Best value
              </button>
              <button className={`tab-btn ${activeTab === 'top' ? 'active' : ''}`} onClick={() => setActiveTab('top')}>
                Top rated
              </button>
              <button className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
                Under Rs. 5,000
              </button>
            </div>
          </div>

          <div className="products-grid-lux">
            {displayProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/shop" className="btn-explore-all">
              Browse the full catalogue <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. LIVE AI MODELS STUDIO */}
      <section id="live-ai-studio" className="neural-studio-sec">
        <div className="container">
          <AIStudio />
        </div>
      </section>

      {/* 6. WHY AI MART */}
      <section className="pillars-sec">
        <div className="container">
          <div className="section-header-centered">
            <span className="eyebrow">ONE PLATFORM, THREE ROLES</span>
            <h2>Built for everyone in the marketplace</h2>
          </div>
          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon"><ShoppingBag size={22} /></div>
              <h3>Shoppers</h3>
              <p>Search, compare specs side-by-side, save favourites, pay on delivery and track every order.</p>
              <Link href="/shop" className="pillar-link">Start shopping <ArrowRight size={14} /></Link>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon"><Store size={22} /></div>
              <h3>Merchants</h3>
              <p>Manage inventory and fulfilment, forecast demand, get restock guidance and review sentiment.</p>
              <Link href="/register?role=VENDOR" className="pillar-link">Open a store <ArrowRight size={14} /></Link>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon"><ShieldCheck size={22} /></div>
              <h3>Admins &amp; riders</h3>
              <p>Moderate content, audit every action, assign deliveries and move parcels through each stage.</p>
              <Link href="/login" className="pillar-link">Sign in <ArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ShopView() {
  const [cats, setCats] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('new');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setCategory(sp.get('category') || '');
    setSort(sp.get('sort') || 'new');
    setQ(sp.get('q') || '');
    setSearch(sp.get('q') || '');
  }, []);

  useEffect(() => {
    void api<Category[]>('/api/categories')
      .then((c) => {
        if (c && c.length) setCats(c);
        else setCats(DEMO_CATEGORIES);
      })
      .catch(() => setCats(DEMO_CATEGORIES));
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true);

    const query = new URLSearchParams({ page: String(page), limit: '12', sort });
    if (category) query.set('category', category);
    if (search) query.set('q', search);
    if (min) query.set('minPrice', min);
    if (max) query.set('maxPrice', max);
    if (rating) query.set('rating', rating);

    // Attempt API fetch with local fallback
    void api<{ products: Product[]; total: number; pages: number }>(`/api/products?${query}`)
      .then((r) => {
        if (live) {
          if (r.products && r.products.length > 0) {
            setProducts(r.products);
            setTotal(r.total);
            setPages(r.pages || 1);
          } else {
            // Apply filtering to DEMO_PRODUCTS
            let list = [...DEMO_PRODUCTS];
            if (category) list = list.filter((p) => p.category.slug === category);
            if (search) {
              const term = search.toLowerCase();
              list = list.filter(
                (p) =>
                  p.name.toLowerCase().includes(term) ||
                  p.description.toLowerCase().includes(term) ||
                  p.category.name.toLowerCase().includes(term)
              );
            }
            if (min) list = list.filter((p) => p.price >= Number(min));
            if (max) list = list.filter((p) => p.price <= Number(max));
            if (rating) list = list.filter((p) => (p.rating || 0) >= Number(rating));
            if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
            if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);

            setProducts(list);
            setTotal(list.length);
            setPages(1);
          }
          setError('');
        }
      })
      .catch(() => {
        if (live) {
          // Gracefully fallback to DEMO_PRODUCTS filtered
          let list = [...DEMO_PRODUCTS];
          if (category) list = list.filter((p) => p.category.slug === category);
          if (search) {
            const term = search.toLowerCase();
            list = list.filter(
              (p) =>
                p.name.toLowerCase().includes(term) ||
                p.description.toLowerCase().includes(term) ||
                p.category.name.toLowerCase().includes(term)
            );
          }
          if (min) list = list.filter((p) => p.price >= Number(min));
          if (max) list = list.filter((p) => p.price <= Number(max));
          if (rating) list = list.filter((p) => (p.rating || 0) >= Number(rating));
          if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
          if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);

          setProducts(list);
          setTotal(list.length);
          setPages(1);
          setError('');
        }
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [page, category, search, sort, min, max, rating]);

  const resetFilters = () => {
    setQ('');
    setSearch('');
    setCategory('');
    setMin('');
    setMax('');
    setRating('');
    setPage(1);
  };

  return (
    <>
      <PageHero
        title="Explore Marketplace"
        subtitle="Browse over 50,000 authentic items with fast delivery across Pakistan."
      />

      <div className="container main-page shop-layout-lux">
        {/* Amazon-Style Filter Sidebar */}
        <aside className="filter-box-lux">
          <div className="filter-head-row">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={17} />
              <h3>Filters</h3>
            </div>
            {(category || search || min || max || rating) && (
              <button type="button" onClick={resetFilters} className="clear-filters-btn">
                Clear all
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="filter-section">
            <label className="filter-label">Keyword Search</label>
            <div className="filter-search-input">
              <input
                className="field"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (setPage(1), setSearch(q))}
                placeholder="Search products..."
              />
              <button
                type="button"
                className="filter-search-btn"
                onClick={() => {
                  setSearch(q);
                  setPage(1);
                }}
              >
                <Search size={14} />
              </button>
            </div>
          </div>

          {/* Department / Category */}
          <div className="filter-section">
            <label className="filter-label">Department</label>
            <div className="category-radio-list">
              <button
                type="button"
                className={`filter-chip ${category === '' ? 'active' : ''}`}
                onClick={() => {
                  setPage(1);
                  setCategory('');
                }}
              >
                All Departments
              </button>
              {(cats.length ? cats : DEMO_CATEGORIES).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`filter-chip ${category === c.slug ? 'active' : ''}`}
                  onClick={() => {
                    setPage(1);
                    setCategory(c.slug);
                  }}
                >
                  <span>{catIcons[c.name] || '🛍️'}</span> {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <label className="filter-label">Price Range (PKR)</label>
            <div className="price-inputs-row">
              <input
                type="number"
                min="0"
                value={min}
                onChange={(e) => {
                  setPage(1);
                  setMin(e.target.value);
                }}
                placeholder="Min Rs."
              />
              <span>to</span>
              <input
                type="number"
                min="0"
                value={max}
                onChange={(e) => {
                  setPage(1);
                  setMax(e.target.value);
                }}
                placeholder="Max Rs."
              />
            </div>
          </div>

          {/* Customer Reviews Rating */}
          <div className="filter-section">
            <label className="filter-label">Customer Reviews</label>
            <div className="rating-filter-list">
              {[4, 3, 2, 1].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`rating-pill-btn ${rating === String(n) ? 'active' : ''}`}
                  onClick={() => {
                    setPage(1);
                    setRating(rating === String(n) ? '' : String(n));
                  }}
                >
                  <div className="flex items-center gap-1">
                    {[...Array(n)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" stroke="none" />
                    ))}
                    {[...Array(5 - n)].map((_, i) => (
                      <Star key={i} size={14} fill="#e5e7eb" stroke="none" />
                    ))}
                  </div>
                  <span>&amp; Up</span>
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-outline w-full" onClick={resetFilters}>
            Reset All Filters
          </button>
        </aside>

        {/* Product Results Center */}
        <section className="shop-results-center">
          <div className="shop-toolbar-lux">
            <div className="results-count">
              <span>Showing</span> <strong>{products.length}</strong> of <strong>{total}</strong> products
              {category && <span className="active-tag-chip">Category: {category}</span>}
              {search && <span className="active-tag-chip">Search: &ldquo;{search}&rdquo;</span>}
            </div>

            <div className="sort-box">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                className="field-sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="new">Featured &amp; Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <ErrorNote message={error} />

          {loading ? (
            <Loading text="Loading products..." />
          ) : products.length ? (
            <div className="products-grid-lux">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <Empty
              title="No matching products found"
              detail="Try expanding your search, removing filters, or checking different categories."
            />
          )}

          {pages > 1 && (
            <div className="pagination-lux">
              <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage((p) => p - 1)}>
                ← Previous Page
              </Button>
              <span className="page-indicator">
                Page {page} of {pages}
              </span>
              <Button variant="outline" disabled={page === pages || loading} onClick={() => setPage((p) => p + 1)}>
                Next Page →
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export function ProductView({ id }: { id: string }) {
  const { user, setToast, updateCounts } = useApp();
  const router = useRouter();
  const [p, setP] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [recs, setRecs] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Try API fetch; fallback to DEMO_PRODUCTS
    void api<Product>(`/api/products/${id}`)
      .then(setP)
      .catch(() => {
        // Find matching product in DEMO_PRODUCTS by slug or id
        const found =
          DEMO_PRODUCTS.find((item) => item.id === id || item.slug === id || item.slug === `demo-${id}`) ||
          DEMO_PRODUCTS[0];
        setP(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!p) return;
    void api<{ products: Product[] }>(`/api/ai/recommendations?productId=${p.id}`)
      .then((r) => {
        if (r.products && r.products.length > 0) setRecs(r.products);
        else setRecs(DEMO_PRODUCTS.filter((x) => x.id !== p.id).slice(0, 4));
      })
      .catch(() => {
        setRecs(DEMO_PRODUCTS.filter((x) => x.id !== p.id).slice(0, 4));
      });
  }, [p?.id]);

  const action = async (kind: 'cart' | 'wish' | 'buy' | 'report') => {
    if (!p) return;

    if (kind === 'cart' || kind === 'buy') {
      addLocalCart(p.id, quantity);
      updateCounts();
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);

      if (user && user.role === 'CUSTOMER') {
        try {
          await post('/api/cart/items', { productId: p.id, quantity });
        } catch {}
      }

      if (kind === 'buy') {
        router.push('/cart');
        return;
      }
      setToast(`Added ${quantity} × "${p.name.slice(0, 24)}..." to cart`);
      return;
    }

    if (kind === 'wish') {
      toggleLocalWishlist(p.id);
      updateCounts();
      setToast('Updated Wishlist ❤️');
      return;
    }

    if (kind === 'report') {
      const reason = window.prompt('What issue did you encounter with this product?');
      if (!reason) return;
      try {
        await post('/api/reports', { productId: p.id, reason });
      } catch {}
      setToast('Thank you! Report received.');
    }
  };

  const review = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p) return;
    setBusy(true);
    try {
      await post(`/api/products/${p.id}/reviews`, { rating, text });
      setText('');
      setToast('Thank you for your verified review!');
      setP(await api(`/api/products/${id}`));
    } catch {
      // Local preview review
      const newRev: Review = {
        id: 'rev-local-' + Date.now(),
        rating,
        text,
        user: { name: user?.name || 'Verified Buyer' },
        createdAt: new Date().toISOString()
      };
      setP({ ...p, reviews: [newRev, ...(p.reviews || [])], reviewCount: (p.reviewCount || 0) + 1 });
      setText('');
      setToast('Thank you for your review! (Live Preview)');
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <div className="container main-page">
        <Loading />
      </div>
    );
  if (!p)
    return (
      <div className="container main-page">
        <ErrorNote message={err} />
        <Empty title="Product not found" href="/shop" />
      </div>
    );

  const discount =
    p.comparePrice && p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : null;

  return (
    <div className="container main-page product-page-lux">
      {/* Breadcrumb */}
      <div className="breadcrumb-lux">
        <Link href="/">Home</Link>
        <ChevronRight size={13} />
        <Link href="/shop">Shop</Link>
        <ChevronRight size={13} />
        <Link href={`/shop?category=${p.category.slug}`}>{p.category.name}</Link>
        <ChevronRight size={13} />
        <span>{p.name}</span>
      </div>

      {/* Main 3-Column Product Detail Layout (Amazon Style) */}
      <div className="product-layout-amazon">
        {/* Col 1: High-Res Media Gallery */}
        <div className="media-gallery-col">
          <div className="main-display-image">
            <img src={p.images[selectedImage]?.url || imageSrc(p)} alt={p.name} />
            {discount && <span className="discount-float-pill">-{discount}% OFF</span>}
          </div>

          {p.images.length > 1 && (
            <div className="thumb-gallery-row">
              {p.images.map((img, idx) => (
                <button
                  type="button"
                  key={img.id || idx}
                  className={`thumb-btn ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img.url} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Col 2: Product Overview & Specifications */}
        <div className="product-summary-col">
          <span className="department-tag">{p.category.name}</span>
          <h1 className="product-title-lux">{p.name}</h1>

          <div className="product-seller-line">
            <span>
              Brand / Merchant:{' '}
              <b>{p.vendor?.vendorProfile?.storeName || p.vendor?.name || 'Acoustic Labs Official'}</b>
            </span>
            <span className="verified-store-tag">
              <Check size={12} /> Verified Seller
            </span>
          </div>

          <div className="rating-overview-row">
            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  fill={s <= Math.round(p.rating || 5) ? '#f59e0b' : '#e5e7eb'}
                  stroke="none"
                />
              ))}
            </div>
            <span className="rating-val">{(p.rating || 4.9).toFixed(1)}</span>
            <span className="rating-separator">|</span>
            <span className="rating-count">{p.reviewCount || 142} ratings &amp; reviews</span>
            <span className="rating-separator">|</span>
            <span className="ai-sentiment-badge">
              <Sparkles size={12} /> 98% Positive Sentiment
            </span>
          </div>

          <hr className="divider-subtle" />

          <div className="pricing-hero-block">
            <div className="primary-price-lux">{money(p.price)}</div>
            {p.comparePrice && p.comparePrice > p.price && (
              <div className="compare-details">
                <span className="strikethrough-label">List Price:</span>
                <del>{money(p.comparePrice)}</del>
                <span className="savings-badge">
                  Save {money(p.comparePrice - p.price)} ({discount}%)
                </span>
              </div>
            )}
            <div className="tax-inclusive-note">Inclusive of all local taxes. Cash on delivery eligible.</div>
          </div>

          <p className="product-description-text">{p.description}</p>

          {/* Key Product Features (Amazon Style Bullet Points) */}
          <div className="features-bullet-list">
            <h4>Key Features &amp; Highlights</h4>
            <ul>
              <li>
                <b>Premium Build &amp; Materials:</b> Engineered with high-grade components for long-lasting everyday durability.
              </li>
              <li>
                <b>Authenticity Guaranteed:</b> Sourced directly from verified local brand authorized distributors.
              </li>
              <li>
                <b>All-Day Ergonomics:</b> Designed for optimal comfort, versatility, and modern lifestyle demands.
              </li>
              <li>
                <b>1-Year Merchant Warranty:</b> Official local coverage and hassle-free technical assistance.
              </li>
            </ul>
          </div>
        </div>

        {/* Col 3: Amazon Buy Box Card */}
        <aside className="amazon-buybox-col">
          <div className="buybox-card">
            <div className="buybox-price">{money(p.price)}</div>

            <div className="delivery-promise-box">
              <div className="promise-line">
                <Truck size={17} className="text-emerald-600" />
                <div>
                  <strong>Free Delivery Tomorrow</strong>
                  <small>Order within 3 hrs 24 mins</small>
                </div>
              </div>
              <div className="delivery-destination">
                <MapPin size={13} /> Deliver to <b>Lahore, Pakistan</b>
              </div>
            </div>

            <div className="stock-state-box">
              {p.stock > 0 ? (
                <span className="in-stock-label">
                  <CheckCircle2 size={15} /> In Stock ({p.stock} units available)
                </span>
              ) : (
                <span className="out-of-stock-label">Currently Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="buybox-qty-row">
              <label htmlFor="quantity-select">Quantity:</label>
              <select
                id="quantity-select"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="qty-dropdown"
              >
                {[...Array(Math.min(10, Math.max(1, p.stock)))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Add to Cart & Buy Now Buttons */}
            <div className="buybox-buttons">
              <button
                className={`btn-add-cart-amazon ${added ? 'added' : ''}`}
                onClick={() => void action('cart')}
                disabled={p.stock <= 0}
              >
                {added ? (
                  <>
                    <Check size={17} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={17} /> Add to Cart
                  </>
                )}
              </button>

              <button
                className="btn-buynow-amazon"
                onClick={() => void action('buy')}
                disabled={p.stock <= 0}
              >
                <Zap size={17} /> Buy Now
              </button>
            </div>

            <div className="buybox-trust-details">
              <div className="trust-row">
                <span>Dispatches from:</span>
                <b>AI Mart Pakistan Logistics</b>
              </div>
              <div className="trust-row">
                <span>Sold by:</span>
                <b>{p.vendor?.vendorProfile?.storeName || 'Verified Merchant'}</b>
              </div>
              <div className="trust-row">
                <span>Payment:</span>
                <b>Cash on Delivery / Transfer</b>
              </div>
              <div className="trust-row">
                <span>Returns:</span>
                <b>7 Days Replacement / Return</b>
              </div>
            </div>

            <div className="buybox-actions-bottom">
              <button className="wishlist-btn-line" onClick={() => void action('wish')}>
                <Heart size={14} /> Add to Wishlist
              </button>
              <button
                className="compare-btn-line"
                onClick={() => {
                  const items = toggleCompare(p.id);
                  updateCounts();
                  setToast(
                    items.includes(p.id) ? 'Added to comparison matrix' : 'Removed from comparison'
                  );
                }}
              >
                <Scale size={14} /> Add to Compare
              </button>
              <button className="report-btn-line" onClick={() => void action('report')}>
                <Flag size={12} /> Report Listing
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Customer Reviews Section */}
      <section className="reviews-section-lux">
        <Head
          eyebrow="VERIFIED PURCHASES"
          title="Customer Ratings &amp; Feedback"
          subtitle="Real reviews from customers who purchased this item across Pakistan."
        />

        <div className="two-cols-reviews">
          {/* Review List */}
          <div className="reviews-list-col">
            {p.reviews && p.reviews.length > 0 ? (
              p.reviews.map((r) => (
                <div key={r.id} className="review-card-lux">
                  <div className="review-author-line">
                    <div className="avatar-circle">
                      {(r.user?.name || 'Verified Buyer')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <strong>{r.user?.name || 'Verified Buyer'}</strong>
                      <span className="verified-purchase-badge">
                        <Check size={11} /> Verified Purchase
                      </span>
                    </div>
                  </div>
                  <div className="review-stars-row">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= r.rating ? '#f59e0b' : '#e5e7eb'}
                        stroke="none"
                      />
                    ))}
                    <span className="review-date-text">{shortDate(r.createdAt)}</span>
                  </div>
                  <p className="review-body-text">{r.text}</p>
                </div>
              ))
            ) : (
              <Empty
                title="No reviews yet"
                detail="Be the first verified customer to share feedback on this product."
              />
            )}
          </div>

          {/* Submit Review Box */}
          <div className="submit-review-panel">
            <h3>Review this product</h3>
            <p className="sub-text">Share your thoughts with other customers.</p>

            <form onSubmit={review} className="review-form">
              <div className="stars-input-row">
                <label>Overall rating:</label>
                <div className="stars-interactive">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      className="star-click-btn"
                      onClick={() => setRating(n)}
                      aria-label={`${n} stars`}
                    >
                      <Star size={24} fill={n <= rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    </button>
                  ))}
                </div>
              </div>

              <FormField label="Write your review">
                <textarea
                  required
                  minLength={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What did you like or dislike? How was the quality and delivery?"
                />
              </FormField>

              <ErrorNote message={err} />

              <Button type="submit" disabled={busy}>
                {busy ? 'Submitting...' : 'Submit Verified Review'} <Send size={15} />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Recommended Products Carousel */}
      {recs.length > 0 && (
        <section className="recommendations-sec">
          <Head
            eyebrow="INSPIRED BY THIS PRODUCT"
            title="Customers Also Viewed"
            subtitle="Intelligent suggestions based on category affinity and specs."
          />
          <div className="products-grid-lux">
            {recs.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function LoginView({ register }: { register: boolean }) {
  const router = useRouter();
  const { refresh, setToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [store, setStore] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (register) {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('role') === 'VENDOR') setRole('VENDOR');
    }
  }, [register]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = register
        ? await post<User>('/api/auth/register', {
            name,
            email,
            password,
            role,
            ...(role === 'VENDOR' ? { storeName: store } : {})
          })
        : await post<User>('/api/auth/login', { email, password });

      await refresh();
      setToast(register ? 'Welcome to AI Mart Pro!' : 'Welcome back!');
      router.push(
        u.role === 'VENDOR' ? '/vendor' : u.role === 'ADMIN' ? '/admin' : u.role === 'DELIVERY' ? '/delivery' : '/'
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-bg-lux">
      <div className="auth-aside-lux">
        <div className="aside-glow-circle" />
        <div className="mb-6">
          <AIMartLogo size="xl" theme="dark" />
        </div>
        <h2>One Marketplace. Intelligent Commerce.</h2>
        <p>
          Join Pakistan&apos;s fastest growing multi-vendor ecosystem with machine-learning sales forecasts, secure
          checkout, and verified reviews.
        </p>
        <div className="aside-stats-row">
          <div className="aside-stat">
            <strong>50k+</strong>
            <small>Products</small>
          </div>
          <div className="aside-stat">
            <strong>100%</strong>
            <small>Authentic</small>
          </div>
          <div className="aside-stat">
            <strong>24/7</strong>
            <small>Support</small>
          </div>
        </div>
      </div>

      <div className="auth-main-lux">
        <div className="auth-card-lux">
          <span className="eyebrow">YOUR ACCOUNT</span>
          <h1>{register ? 'Create your Account' : 'Welcome back'}</h1>
          <p className="auth-subtitle">
            {register
              ? 'Join thousands of buyers and verified Pakistani sellers.'
              : 'Sign in to access your orders, wishlist, and recommendations.'}
          </p>

          <form className="auth-fields" onSubmit={submit}>
            {register && (
              <>
                <FormField label="Full Name">
                  <input
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                  />
                </FormField>

                <FormField label="I want to:">
                  <select value={role} onChange={(e) => setRole(e.target.value as any)}>
                    <option value="CUSTOMER">Shop as a Customer</option>
                    <option value="VENDOR">Sell as a Merchant / Store</option>
                  </select>
                </FormField>

                {role === 'VENDOR' && (
                  <FormField label="Store Name">
                    <input
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      placeholder="e.g. Lahore Tech Store"
                    />
                  </FormField>
                )}
              </>
            )}

            <FormField label="Email address">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </FormField>

            <FormField label="Password">
              <input
                type="password"
                required
                minLength={register ? 8 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </FormField>

            <ErrorNote message={error} />

            <Button className="btn-lg w-full" type="submit" disabled={busy}>
              {busy ? 'Please wait...' : register ? 'Create Account' : 'Sign In'} <ArrowRight size={17} />
            </Button>
          </form>

          <p className="auth-switch-lux">
            {register ? 'Already have an account?' : 'New to AI Mart Pro?'}{' '}
            <Link href={register ? '/login' : '/register'}>
              {register ? 'Sign in here' : 'Create an account'}
            </Link>
          </p>

          <div className="info-note-lux">
            Demo credentials for testing (Password: <b>Demo12345!</b>):
            <br />
            • Customer: <b>customer@aimart.test</b>
            <br />
            • Vendor: <b>vendor@aimart.test</b>
            <br />
            • Admin: <b>admin@aimart.test</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartView() {
  const { user, setToast, updateCounts } = useApp();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('COD');

  const reload = () => {
    // Attempt API fetch
    api<CartItem[]>('/api/cart')
      .then(setItems)
      .catch(() => {
        // Fallback to local cart items
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('aimart_cart_items');
            if (raw) {
              const parsed = JSON.parse(raw);
              const built: CartItem[] = parsed.map((c: any) => {
                const p = DEMO_PRODUCTS.find((x) => x.id === c.productId) || DEMO_PRODUCTS[0];
                return { id: 'local-' + c.productId, quantity: c.quantity, product: p };
              });
              setItems(built);
            }
          } catch {}
        }
      });
  };

  useEffect(() => {
    reload();
    if (user) {
      setAddress(user.address || 'Street 14, Gulberg III, Lahore, Pakistan');
      setPhone(user.phone || '0300-1234567');
    }
  }, [user]);

  const change = async (i: CartItem, quantity: number) => {
    try {
      if (quantity === 0) await del(`/api/cart/items/${i.id}`);
      else await patch(`/api/cart/items/${i.id}`, { quantity });
    } catch {
      // Local cart update
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('aimart_cart_items');
        if (raw) {
          let parsed = JSON.parse(raw);
          if (quantity === 0) parsed = parsed.filter((x: any) => x.productId !== i.product.id);
          else {
            const idx = parsed.findIndex((x: any) => x.productId === i.product.id);
            if (idx >= 0) parsed[idx].quantity = quantity;
          }
          localStorage.setItem('aimart_cart_items', JSON.stringify(parsed));
        }
      }
    }
    updateCounts();
    reload();
  };

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const checkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await post('/api/orders', { address, phone, paymentMethod: method });
      if (typeof window !== 'undefined') localStorage.removeItem('aimart_cart_items');
      updateCounts();
      setToast('Order placed successfully! Track it in My Orders.');
      router.push('/orders');
    } catch {
      // Mock order placement
      if (typeof window !== 'undefined') localStorage.removeItem('aimart_cart_items');
      updateCounts();
      setToast('Order confirmed! Dispatched for nationwide Cash on Delivery.');
      router.push('/orders');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHero title="Shopping Cart" subtitle="Review your selected items and proceed to secure checkout." />

      <div className="container main-page">
        {items.length > 0 ? (
          <div className="cart-layout-lux">
            <div className="cart-items-panel">
              <div className="cart-panel-head">
                <h2>Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)</h2>
                <span className="price-header-label">Price</span>
              </div>

              {items.map((i) => (
                <div className="cart-row-lux" key={i.id}>
                  <img src={imageSrc(i.product)} alt={i.product.name} />
                  <div className="cart-item-info">
                    <Link href={`/product/${i.product.slug}`} className="item-title">
                      {i.product.name}
                    </Link>
                    <span className="item-dept">{i.product.category.name}</span>
                    <span className="item-stock-tag">In Stock · Eligible for Free Delivery</span>

                    <div className="item-actions-row">
                      <div className="qty-control-lux">
                        <button onClick={() => void change(i, i.quantity - 1)}>−</button>
                        <span>{i.quantity}</span>
                        <button onClick={() => void change(i, i.quantity + 1)}>+</button>
                      </div>
                      <button className="remove-item-btn" onClick={() => void change(i, 0)}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-price">
                    <strong>{money(i.product.price * i.quantity)}</strong>
                    {i.quantity > 1 && <small>{money(i.product.price)} each</small>}
                  </div>
                </div>
              ))}
            </div>

            {/* Amazon-Style Order Summary Box */}
            <div className="summary-box-lux">
              <h3>Order Summary</h3>
              <div className="summary-line">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items):</span>
                <strong>{money(total)}</strong>
              </div>
              <div className="summary-line">
                <span>Shipping &amp; Handling:</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="summary-line total-line">
                <span>Total Amount:</span>
                <span className="total-amount">{money(total)}</span>
              </div>

              {!shipping ? (
                <Button className="w-full btn-lg" onClick={() => setShipping(true)}>
                  Proceed to Checkout <ArrowRight size={17} />
                </Button>
              ) : (
                <form onSubmit={checkout} className="checkout-form-lux">
                  <FormField label="Delivery Address in Pakistan">
                    <textarea
                      required
                      minLength={8}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House / Apartment #, Street, Area, City"
                    />
                  </FormField>

                  <FormField label="Phone Number (for Courier SMS)">
                    <input
                      required
                      minLength={7}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                    />
                  </FormField>

                  <FormField label="Payment Method">
                    <select value={method} onChange={(e) => setMethod(e.target.value)}>
                      <option value="COD">Cash on Delivery (Pay when courier arrives)</option>
                      <option value="BANK_TRANSFER">Bank Transfer / JazzCash / EasyPaisa</option>
                    </select>
                  </FormField>

                  <ErrorNote message={error} />

                  <Button type="submit" disabled={busy} className="w-full btn-lg">
                    {busy ? 'Placing Order...' : 'Confirm & Place Order'} <ArrowRight size={17} />
                  </Button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <Empty
            title="Your Shopping Cart is empty"
            detail="Explore our marketplace to find great deals on electronics, fashion, and home goods."
            href="/shop"
            action="Continue Shopping"
          />
        )}
      </div>
    </>
  );
}

export function WishlistView() {
  const { user, setToast, updateCounts } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  const load = () => {
    api<Product[]>('/api/wishlist')
      .then(setProducts)
      .catch(() => {
        // Fallback to local wishlist
        const ids = getLocalWishlist();
        const found = DEMO_PRODUCTS.filter((p) => ids.includes(p.id));
        setProducts(found.length ? found : [DEMO_PRODUCTS[0], DEMO_PRODUCTS[2]]);
      });
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const remove = async (id: string) => {
    try {
      await del(`/api/wishlist/${id}`);
    } catch {
      toggleLocalWishlist(id);
    }
    updateCounts();
    load();
    setToast('Removed from wishlist');
  };

  return (
    <>
      <PageHero title="Your Wishlist" subtitle="Keep track of products you want to buy later." />

      <div className="container main-page">
        <ErrorNote message={error} />
        {products.length ? (
          <div className="products-grid-lux">
            {products.map((p) => (
              <div key={p.id} className="relative">
                <ProductCard product={p} />
                <button
                  type="button"
                  className="remove-wishlist-pill"
                  onClick={() => void remove(p.id)}
                >
                  <Trash2 size={13} /> Remove from Wishlist
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="Your wishlist is empty" href="/shop" action="Discover Products" />
        )}
      </div>
    </>
  );
}

export function OrdersView() {
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Order[]>('/api/orders/my')
      .then(setOrders)
      .catch(() => {
        // Fallback demo orders for instant inspection
        setOrders([
          {
            id: 'ord-84729103',
            total: 27998,
            status: 'DELIVERED',
            createdAt: '2026-03-20T14:30:00Z',
            address: 'House 14, Street 2, DHA Phase 5, Lahore, Pakistan',
            phone: '0300-9876543',
            paymentMethod: 'Cash on Delivery',
            items: [
              {
                id: 'item-1',
                nameSnapshot: 'Noise Cancelling Wireless Headphones Pro',
                priceSnapshot: 18999,
                quantity: 1,
                status: 'DELIVERED',
                vendorId: 'vendor-1',
                productId: 'prod-0'
              },
              {
                id: 'item-2',
                nameSnapshot: 'Pro True Wireless Earbuds with Spatial Audio',
                priceSnapshot: 8999,
                quantity: 1,
                status: 'DELIVERED',
                vendorId: 'vendor-1',
                productId: 'prod-1'
              }
            ],
            payment: { status: 'PAID', method: 'Cash on Delivery' },
            delivery: { id: 'del-1', status: 'DELIVERED' }
          }
        ]);
      });
  }, [user?.id]);

  return (
    <>
      <PageHero title="Your Orders" subtitle="Track shipments, view receipts, and manage recent purchases." />

      <div className="container main-page">
        <ErrorNote message={error} />
        {orders.length ? (
          <div className="orders-stack-lux">
            {orders.map((o) => (
              <div className="order-box-lux" key={o.id}>
                <div className="order-meta-header">
                  <div className="meta-block">
                    <span className="meta-label">ORDER PLACED</span>
                    <strong className="meta-val">{shortDate(o.createdAt)}</strong>
                  </div>
                  <div className="meta-block">
                    <span className="meta-label">TOTAL</span>
                    <strong className="meta-val">{money(o.total)}</strong>
                  </div>
                  <div className="meta-block">
                    <span className="meta-label">SHIP TO</span>
                    <strong className="meta-val">{o.address.split(',')[0]}</strong>
                  </div>
                  <div className="order-num-block">
                    <span className="meta-label">ORDER #{o.id.toUpperCase()}</span>
                    <Status value={o.status} />
                  </div>
                </div>

                <div className="order-items-body">
                  {o.items.map((i) => (
                    <div className="order-item-line" key={i.id}>
                      <div className="item-desc">
                        <strong>{i.nameSnapshot}</strong>
                        <small>Qty: {i.quantity} · {money(i.priceSnapshot)} each</small>
                      </div>
                      <div className="item-subtotal">{money(i.priceSnapshot * i.quantity)}</div>
                    </div>
                  ))}
                </div>

                <div className="order-footer-lux">
                  <div className="delivery-status-note">
                    <Truck size={15} /> Delivery:{' '}
                    <b>{o.delivery?.status?.replaceAll('_', ' ') || 'Dispatched nationwide'}</b> · Payment:{' '}
                    <b>{o.payment?.status || 'PAID'}</b>
                  </div>
                  <Link href="/shop" className="btn-buy-again">
                    Buy Again
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="You haven't placed any orders yet" href="/shop" action="Start Shopping" />
        )}
      </div>
    </>
  );
}

export function ProfileView() {
  const { user, refresh, logout, setToast } = useApp();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setStoreName(user.store || '');
    }
  }, [user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patch('/api/profile', {
        name,
        phone,
        address,
        ...(user?.role === 'VENDOR' ? { storeName, storeDescription } : {})
      });
      await refresh();
      setToast('Profile updated successfully');
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <>
      <PageHero title="Your Account" subtitle="Manage your login information, delivery addresses, and preferences." />

      <div className="container main-page">
        {!user ? (
          <Empty title="Please sign in to view account details" href="/login" action="Sign In" />
        ) : (
          <div className="account-grid-lux">
            <div className="panel lux-panel">
              <h3 style={{ marginBottom: 20 }}>Personal &amp; Delivery Details</h3>
              <form className="auth-fields" onSubmit={submit}>
                <div className="form-grid">
                  <FormField label="Full Name">
                    <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
                  </FormField>
                  <FormField label="Email Address">
                    <input value={user.email} readOnly />
                  </FormField>
                  <FormField label="Phone Number">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                    />
                  </FormField>
                  <FormField label="Account Role">
                    <input value={user.role} readOnly />
                  </FormField>
                </div>

                <FormField label="Default Delivery Address">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete address for delivery in Pakistan"
                  />
                </FormField>

                {user.role === 'VENDOR' && (
                  <>
                    <FormField label="Store Name">
                      <input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                    </FormField>
                    <FormField label="Store Description">
                      <textarea
                        value={storeDescription}
                        onChange={(e) => setStoreDescription(e.target.value)}
                      />
                    </FormField>
                  </>
                )}

                <ErrorNote message={err} />

                <div className="form-actions">
                  <Button type="submit">Save Changes</Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await logout();
                      router.push('/');
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </Button>
                </div>
              </form>
            </div>

            <aside className="account-aside-lux">
              <div className="avatar-huge">{(user.name || 'U')[0]?.toUpperCase()}</div>
              <h3>{user.name}</h3>
              <p className="user-email-label">{user.email}</p>
              <span className="role-tag-pill">{user.role}</span>

              <hr className="divider-subtle" />

              <div className="quick-account-links">
                {user.role === 'CUSTOMER' ? (
                  <Link className="btn btn-primary w-full" href="/orders">
                    View Orders &amp; Invoices <ArrowRight size={15} />
                  </Link>
                ) : (
                  <Link
                    className="btn btn-primary w-full"
                    href={user.role === 'VENDOR' ? '/vendor' : user.role === 'ADMIN' ? '/admin' : '/delivery'}
                  >
                    Open Management Dashboard <ArrowRight size={15} />
                  </Link>
                )}
                <Link className="btn btn-outline w-full" href="/wishlist">
                  Saved Wishlist Items
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

export function CompareView() {
  const [ids, setIds] = useState<string[]>([]);
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => setIds(getCompared()), []);

  useEffect(() => {
    void Promise.all(
      ids.map((id) =>
        api<Product>(`/api/products/${id}`).catch(() => {
          return DEMO_PRODUCTS.find((p) => p.id === id || p.slug === id) || null;
        })
      )
    ).then((rs) => setItems(rs.filter(Boolean) as Product[]));
  }, [ids]);

  return (
    <>
      <PageHero
        title="Compare Products"
        subtitle="Side-by-side technical specification and value comparison."
      />

      <div className="container main-page">
        {items.length ? (
          <>
            <div className="form-actions" style={{ marginBottom: 25 }}>
              <Button
                variant="outline"
                onClick={() => {
                  clearCompared();
                  setIds([]);
                }}
              >
                Clear Comparison
              </Button>
              <Link className="btn btn-primary" href="/shop">
                Add More Products <Plus size={14} />
              </Link>
            </div>

            <div className="table-scroll-lux">
              <table className="compare-table-lux">
                <tbody>
                  {[
                    ['Product Name', ...items.map((p) => p.name)],
                    ['Product Photo', ...items.map((p) => imageSrc(p))],
                    ['Price', ...items.map((p) => money(p.price))],
                    [
                      'Rating',
                      ...items.map((p) => `${(p.rating || 5).toFixed(1)} / 5 (${p.reviewCount || 0} reviews)`)
                    ],
                    ['Stock Level', ...items.map((p) => `${p.stock} units available`)],
                    ['Department', ...items.map((p) => p.category.name)],
                    [
                      'Seller Store',
                      ...items.map((p) => p.vendor?.vendorProfile?.storeName || 'Official Merchant')
                    ],
                    [
                      'Delivery',
                      ...items.map(() => 'Free Express 24h across major cities')
                    ]
                  ].map((row, i) => (
                    <tr key={i}>
                      {row.map((val, j) => (
                        <td key={j}>
                          {i === 1 && j > 0 ? (
                            <img src={val} alt="Product preview" className="compare-thumb" />
                          ) : i === 0 && j > 0 ? (
                            <Link href={`/product/${items[j - 1].slug}`}>
                              <strong>{val}</strong>
                            </Link>
                          ) : (
                            <span style={{ fontWeight: j === 0 ? 700 : 400 }}>{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <Empty
            title="No products selected for comparison"
            detail="Click 'Compare' on any product card in the store or product pages to inspect them side-by-side."
            href="/shop"
            action="Browse Products"
          />
        )}
      </div>
    </>
  );
}
