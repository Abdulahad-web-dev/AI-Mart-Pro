'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Heart, ShoppingCart, Star, Trash2, Plus, Minus, Check, Lock, MapPin, CreditCard, Package, Truck, Mail,
  Copy, User, Shield, Bell, ChevronRight, ChevronLeft, LayoutGrid, List, Smartphone, Shirt, Armchair, Sparkles,
  Dumbbell, BookOpen, ShoppingBasket, Zap, ArrowRight, LogOut, Share2, RotateCcw, ShieldCheck, Archive, Phone,
  Wallet, X, AlertTriangle, Users, TrendingUp, SlidersHorizontal, Download, Eye, Ban, CheckCircle2, MessageSquare, Mic
} from 'lucide-react';
import { api, post, patch, del, Product, Category, CartItem, Order, User as AppUser, money, imageSrc, shortDate } from '@/lib/api';
import { useApp, addLocalCart, toggleLocalWishlist, getLocalWishlist } from '@/lib/app-context';
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from '@/lib/demo-products';
import { AIMartLogo } from '@/components/ai-mart-logo';

/* ------------------------------------------------------------------ helpers */
async function loadProducts(): Promise<Product[]> {
  try {
    const r = await api<{ products: Product[] }>('/api/products?limit=250&sort=new');
    if (r.products?.length) return r.products;
  } catch {}
  return DEMO_PRODUCTS;
}

async function loadCategories(): Promise<Category[]> {
  try {
    const c = await api<Category[]>('/api/categories');
    if (c?.length) return c;
  } catch {}
  return DEMO_CATEGORIES;
}

const discountOf = (p?: Product | null) => {
  if (!p || !p.comparePrice || !p.price) return 0;
  return p.comparePrice > p.price ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
};

function readLocalCart(): { productId: string; quantity: number }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('aimart_cart_items');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalCart(items: { productId: string; quantity: number }[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aimart_cart_items', JSON.stringify(items));
  } catch {}
}

async function fetchCart(): Promise<CartItem[]> {
  const local = readLocalCart();
  if (!local.length) return [];
  const all = await loadProducts();
  return local
    .map((c) => {
      const p = all.find((x) => x.id === c.productId) || DEMO_PRODUCTS.find((x) => x.id === c.productId);
      return p ? { id: 'local-' + c.productId, quantity: c.quantity, product: p } : null;
    })
    .filter(Boolean) as CartItem[];
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  electronics: <Smartphone size={22} />,
  fashion: <Shirt size={22} />,
  'home-living': <Armchair size={22} />,
  beauty: <Sparkles size={22} />,
  sports: <Dumbbell size={22} />,
  books: <BookOpen size={22} />
};

function Stars({ value = 5 }: { value?: number }) {
  const v = Math.max(1, Math.min(5, Math.round(Number(value) || 5)));
  return (
    <span className="rd-stars" aria-label={`${v} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} fill={i <= v ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------- product card */
export function RdCard({ p, badge }: { p: Product; badge?: string }) {
  const { setToast, updateCounts } = useApp();
  const [wished, setWished] = useState(false);

  useEffect(() => {
    if (p?.id) setWished(getLocalWishlist().includes(p.id));
  }, [p?.id]);

  if (!p) return null;
  const d = discountOf(p);

  return (
    <article className="rd-card">
      <Link href={`/product/${p.slug || p.id}`} className="rd-card-img">
        <img
          src={imageSrc(p)}
          alt={p.name || 'Product'}
          loading="lazy"
          onError={(e) => {
            const t = e.currentTarget;
            if (!t.dataset.err) {
              t.dataset.err = '1';
              t.src = '/images/0.jpg';
            }
          }}
        />
        {(badge || d > 0) && <span className="rd-tag">{badge || `-${d}%`}</span>}
        <button
          type="button"
          className={`rd-heart ${wished ? 'on' : ''}`}
          aria-label="Toggle wishlist"
          onClick={(e) => {
            e.preventDefault();
            toggleLocalWishlist(p.id);
            setWished(!wished);
            updateCounts();
          }}
        >
          <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </Link>
      <div className="rd-card-body">
        <small>{p.category?.name || 'General'}</small>
        <Link href={`/product/${p.slug || p.id}`} className="rd-card-name">
          {p.name}
        </Link>
        <div className="rd-rating-row">
          <Star size={11} fill="currentColor" /> {Number(p.rating || 4.8).toFixed(1)}{' '}
          <span>({p.reviewCount ?? 12})</span>
        </div>
        <div className="rd-card-foot">
          <div className="rd-price">
            {money(p.price)}
            {d > 0 && <s>{money(p.comparePrice || 0)}</s>}
          </div>
          <button
            className="rd-cart-btn"
            aria-label="Add to cart"
            onClick={() => {
              addLocalCart(p.id, 1);
              updateCounts();
              setToast(`Added "${(p.name || 'Item').slice(0, 24)}" to cart`);
            }}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* --------------------------------------------------------------------- home */
function useCountdown(hours = 4) {
  const [left, setLeft] = useState(hours * 3600 - 17);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : hours * 3600)), 1000);
    return () => clearInterval(t);
  }, [hours]);
  const h = String(Math.floor(left / 3600)).padStart(2, '0');
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function RdHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [slide, setSlide] = useState(0);
  const timer = useCountdown();

  useEffect(() => {
    void loadProducts().then(setProducts);
    void loadCategories().then(setCats);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % 3), 6000);
    return () => clearInterval(t);
  }, []);

  const slides = [
    {
      tag: 'FLASH SALE',
      title: 'Next-Gen Tech Essentials',
      text: 'Upgrade your workspace with our curated selection of premium electronics. Unbeatable prices for a limited time.',
      href: '/shop?category=electronics'
    },
    {
      tag: 'NEW ARRIVALS',
      title: 'Style That Moves With You',
      text: 'Fresh fashion drops, everyday essentials and athletic engineering — delivered nationwide across Pakistan.',
      href: '/shop?category=fashion'
    },
    {
      tag: 'SMART LIVING',
      title: 'Make Home Feel Premium',
      text: 'Lighting, diffusers and daily-use ceramics designed to elevate every workspace and room.',
      href: '/shop?category=home-living'
    }
  ];
  const s = slides[slide] || slides[0];

  const deals = useMemo(() => {
    const d = [...products].filter((p) => discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a));
    return d.length >= 4 ? d.slice(0, 4) : products.slice(0, 4);
  }, [products]);

  const big = cats.find((c) => c.slug === 'electronics') || cats[0];
  const small = cats.filter((c) => c.id !== big?.id).slice(0, 4);

  return (
    <div className="rd-page anim-fade-in">
      <section className="rd-hero" aria-label="Featured offers">
        <div className="rd-hero-glow" />
        <div className="rd-hero-copy" key={slide}>
          <span className="rd-pill">{s.tag}</span>
          <h1>{s.title}</h1>
          <p>{s.text}</p>
          <Link href={s.href} className="rd-btn rd-btn-primary">
            Shop Now <ArrowRight size={14} />
          </Link>
        </div>
        <div className="rd-hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={i === slide ? 'on' : ''}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="rd-section">
        <h2 className="rd-h2">Shop by Category</h2>
        <div className="rd-cat-grid">
          {big && (
            <Link href={`/shop?category=${big.slug}`} className="rd-cat-big">
              <div className="rd-cat-big-art">{CAT_ICONS[big.slug] || <Smartphone size={80} />}</div>
              <div>
                <strong>{big.name}</strong>
                <span>
                  Explore <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          )}
          {small.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="rd-cat-small">
              {CAT_ICONS[c.slug] || <Package size={22} />}
              <strong>{c.name}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="rd-section">
        <div className="rd-row-between">
          <div className="rd-title-row">
            <h2 className="rd-h2">Flash Deals</h2>
            <Zap size={16} className="rd-accent" />
            <span className="rd-timer">Ends in: {timer}</span>
          </div>
          <Link href="/shop?sort=deals" className="rd-link">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="rd-grid-4">
          {deals.map((p, i) => {
            const sold = 62 + ((i * 17) % 35);
            return (
              <div key={p.id} className="rd-deal">
                <RdCard p={p} badge={discountOf(p) > 0 ? `-${discountOf(p)}%` : 'Hot'} />
                <div className="rd-deal-meta">
                  <span>Sold: {sold}%</span>
                  <span>Available: {p.stock ?? 24}</span>
                </div>
                <div className="rd-bar">
                  <i style={{ width: `${sold}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rd-section">
        <div className="rd-row-between">
          <h2 className="rd-h2">Trending Now</h2>
          <Link href="/shop" className="rd-link">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="rd-grid-4">
          {(products.length ? products : DEMO_PRODUCTS).slice(0, 8).map((p) => (
            <RdCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------------- shop */
const PAGE_SIZE = 12;
export function RdShop() {
  const [all, setAll] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('relevance');
  const [q, setQ] = useState('');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [brandQ, setBrandQ] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      setCategory(sp.get('category') || '');
      setQ(sp.get('q') || '');
      const s = sp.get('sort');
      if (s) setSort(s === 'best' ? 'rating' : s);
    }
    void Promise.all([loadProducts(), loadCategories()]).then(([p, c]) => {
      setAll(p);
      setCats(c);
      const prices = p.map((x) => Number(x?.price) || 0).filter((n) => n > 0);
      const maxP = prices.length ? Math.max(...prices) : 25000;
      setMaxPrice(Math.ceil(maxP / 1000) * 1000);
      setLoading(false);
    });
  }, []);

  const ceiling = useMemo(() => {
    const prices = all.map((x) => Number(x?.price) || 0).filter((n) => n > 0);
    return prices.length ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 50000;
  }, [all]);

  const brandList = useMemo(() => {
    const set = new Set<string>();
    all.forEach((p) => {
      const b = p?.vendor?.vendorProfile?.storeName || p?.vendor?.name || 'AI MART Official';
      if (b) set.add(b);
    });
    return [...set].filter((b) => b.toLowerCase().includes((brandQ || '').toLowerCase()));
  }, [all, brandQ]);

  const filtered = useMemo(() => {
    let list = all.filter((p) => {
      if (!p) return false;
      const brand = p.vendor?.vendorProfile?.storeName || p.vendor?.name || 'AI MART Official';
      const catMatch = !category || p.category?.slug === category;
      const searchHaystack = `${p.name || ''} ${p.description || ''} ${p.category?.name || ''}`.toLowerCase();
      const qMatch = !q || searchHaystack.includes(q.toLowerCase());
      const priceMatch = (Number(p.price) || 0) <= (maxPrice || Infinity);
      const brandMatch = !brands.length || brands.includes(brand);
      const ratingMatch = (Number(p.rating) || 0) >= rating;
      return catMatch && qMatch && priceMatch && brandMatch && ratingMatch;
    });

    if (sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list = [...list].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    else if (sort === 'deals') list = [...list].sort((a, b) => discountOf(b) - discountOf(a));
    else if (sort === 'new') list = [...list].reverse();
    return list;
  }, [all, category, q, maxPrice, brands, rating, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [category, q, maxPrice, brands, rating, sort]);

  return (
    <div className="rd-page rd-shop anim-fade-in">
      <aside className="rd-filters">
        <div className="rd-box">
          <h3>Categories</h3>
          <button
            className={`rd-cat-link ${!category ? 'on' : ''}`}
            onClick={() => setCategory('')}
          >
            All Categories
          </button>
          {cats.map((c) => (
            <button
              key={c.id}
              className={`rd-cat-link ${category === c.slug ? 'on' : ''}`}
              onClick={() => setCategory(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="rd-box">
          <h3>Price Range</h3>
          <input
            type="range"
            min={0}
            max={ceiling || 50000}
            step={500}
            value={maxPrice || ceiling || 50000}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="rd-range"
          />
          <div className="rd-row-between rd-muted">
            <span>Rs. 0</span>
            <span>{money(maxPrice || ceiling || 50000)}</span>
          </div>
        </div>

        <div className="rd-box">
          <h3>Verified Brands</h3>
          <div className="rd-input-icon">
            <Search size={13} />
            <input
              placeholder="Search brands"
              value={brandQ}
              onChange={(e) => setBrandQ(e.target.value)}
            />
          </div>
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {brandList.map((b) => (
              <label key={b} className="rd-check">
                <input
                  type="checkbox"
                  checked={brands.includes(b)}
                  onChange={() =>
                    setBrands((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]))
                  }
                />
                {b}
              </label>
            ))}
          </div>
        </div>

        <div className="rd-box">
          <h3>Customer Rating</h3>
          {[4, 3, 2].map((r) => (
            <label key={r} className="rd-check">
              <input
                type="radio"
                name="rating"
                checked={rating === r}
                onChange={() => setRating(r)}
              />
              <Stars value={r} /> &amp; Up
            </label>
          ))}
          {rating > 0 && (
            <button className="rd-link" onClick={() => setRating(0)} style={{ marginTop: 6 }}>
              Reset rating
            </button>
          )}
        </div>
      </aside>

      <section className="rd-results">
        <div className="rd-toolbar">
          <span className="rd-muted">
            {filtered.length
              ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} products`
              : '0 products found'}
          </span>
          <div className="rd-toolbar-right">
            <label className="rd-muted">
              Sort:
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="new">Newest Arrivals</option>
                <option value="deals">Top Flash Deals</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>
            <div className="rd-toggle">
              <button
                className={view === 'grid' ? 'on' : ''}
                onClick={() => setView('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={view === 'list' ? 'on' : ''}
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rd-grid-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rd-skeleton" />
            ))}
          </div>
        ) : shown.length ? (
          <div className={view === 'grid' ? 'rd-grid-3' : 'rd-list'}>
            {shown.map((p, i) => (
              <RdCard
                key={p.id}
                p={p}
                badge={
                  i === 0 && page === 1 && !category
                    ? 'New Arrival'
                    : p.featured
                    ? 'AI Choice'
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="rd-empty">
            <Package size={34} />
            <h3>No products found</h3>
            <p>Try clearing filters or searching for something else.</p>
            <button
              className="rd-btn rd-btn-outline"
              onClick={() => {
                setCategory('');
                setQ('');
                setBrands([]);
                setRating(0);
                setMaxPrice(ceiling);
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {pages > 1 && (
          <div className="rd-pager">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                className={page === i + 1 ? 'on' : ''}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ product */
export function RdProduct({ id }: { id: string }) {
  const { user, setToast, updateCounts } = useApp();
  const router = useRouter();
  const [p, setP] = useState<Product | null>(null);
  const [recs, setRecs] = useState<Product[]>([]);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'details' | 'reviews' | 'shipping'>('details');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [wished, setWished] = useState(false);
  const [selectedColor, setSelectedColor] = useState('Graphite Slate');
  const [selectedModel, setSelectedModel] = useState('Pro Studio');

  useEffect(() => {
    void api<Product>(`/api/products/${id}`)
      .then(setP)
      .catch(() =>
        setP(
          DEMO_PRODUCTS.find(
            (x) => x.id === id || x.slug === id || x.slug === `demo-${id}`
          ) || DEMO_PRODUCTS[0]
        )
      );
  }, [id]);

  useEffect(() => {
    if (!p?.id) return;
    setWished(getLocalWishlist().includes(p.id));
    void loadProducts().then((l) => {
      const related = l.filter((x) => x.id !== p.id && x.category?.id && x.category.id === p.category?.id);
      const others = l.filter((x) => x.id !== p.id);
      setRecs(related.concat(others).slice(0, 2));
    });
  }, [p?.id]);

  if (!p)
    return (
      <div className="rd-page">
        <div className="rd-skeleton" style={{ height: 420 }} />
      </div>
    );

  const d = discountOf(p);
  const images = p.images?.length
    ? p.images
    : [{ id: 'fallback', url: '/images/fallback.svg', sortOrder: 0 }];
  const brand = p.vendor?.vendorProfile?.storeName || p.vendor?.name || 'AuraTech Acoustics';

  const add = async (buyNow?: boolean) => {
    addLocalCart(p.id, qty);
    updateCounts();
    if (user?.role === 'CUSTOMER') {
      try {
        await post('/api/cart/items', { productId: p.id, quantity: qty });
      } catch {}
    }
    if (buyNow) router.push('/cart');
    else setToast(`Added ${qty} × "${(p.name || 'Item').slice(0, 24)}" to cart`);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post(`/api/products/${p.id}/reviews`, { rating, text });
      setText('');
      setToast('Thank you for your verified review!');
      setP(await api(`/api/products/${id}`));
    } catch (err: any) {
      setToast(err.message || 'Could not submit review');
    }
  };

  const bundle = [p, ...recs];
  const bundleTotal = bundle.reduce((s, x) => s + (Number(x?.price) || 0), 0);

  const colors = [
    { name: 'Graphite Slate', hex: '#2c3136' },
    { name: 'Titanium White', hex: '#e2e8f0' },
    { name: 'Midnight Navy', hex: '#1e293b' }
  ];

  const models = [
    { id: 'Pro Studio', label: 'Pro Studio', desc: 'Standard ANC' },
    { id: 'Pro Max', label: 'Pro Max', desc: 'Neural ANC + Lossless' }
  ];

  return (
    <div className="rd-page anim-fade-in">
      <nav className="rd-crumbs">
        <Link href="/shop">{p.category?.name || 'Store'}</Link>
        <ChevronRight size={12} />
        <span>{p.name}</span>
      </nav>

      <div className="rd-pdp">
        <div className="rd-gallery">
          <div className="rd-thumbs">
            {images.map((im, i) => (
              <button
                key={im.id || i}
                className={i === img ? 'on' : ''}
                onClick={() => setImg(i)}
              >
                <img
                  src={im.url}
                  alt={`View ${i + 1}`}
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (!t.dataset.err) {
                      t.dataset.err = '1';
                      t.src = '/images/0.jpg';
                    }
                  }}
                />
              </button>
            ))}
          </div>
          <div className="rd-main-img">
            <img
              src={images[img]?.url || imageSrc(p)}
              alt={p.name}
              onError={(e) => {
                const t = e.currentTarget;
                if (!t.dataset.err) {
                  t.dataset.err = '1';
                  t.src = '/images/0.jpg';
                }
              }}
            />
            <div className="rd-badge-stack">
              <span className="rd-tag">New Arrival</span>
              {p.featured && <span className="rd-tag accent-tag">AI Choice</span>}
            </div>
            <button
              className="rd-pdp-share-btn"
              aria-label="Share"
              onClick={() => {
                void navigator.clipboard?.writeText(window.location.href);
                setToast('Product link copied');
              }}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        <div className="rd-info">
          <span className="rd-brand">{brand}</span>
          <h1>{p.name}</h1>

          <div className="rd-rating-row">
            <Stars value={p.rating || 5} />
            <b>{Number(p.rating || 4.8).toFixed(1)}</b>
            <button className="rd-link" onClick={() => setTab('reviews')}>
              ({p.reviewCount ?? 128} Reviews)
            </button>
          </div>

          <div className="rd-price-big">
            {money(p.price)}
            {d > 0 && (
              <>
                <s>{money(p.comparePrice || 0)}</s>
                <span className="rd-save">Save {d}%</span>
              </>
            )}
          </div>
          <p className="rd-muted">Inclusive of all taxes. Free delivery across Pakistan.</p>
          <hr />

          {/* Color Selection */}
          <div className="rd-option-group">
            <label className="rd-label">
              Color: <b>{selectedColor}</b>
            </label>
            <div className="rd-swatches">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`rd-swatch ${selectedColor === c.name ? 'on' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setSelectedColor(c.name)}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="rd-option-group">
            <label className="rd-label">Model Configuration</label>
            <div className="rd-models-grid">
              {models.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`rd-model-pill ${selectedModel === m.id ? 'on' : ''}`}
                  onClick={() => setSelectedModel(m.id)}
                >
                  <b>{m.label}</b>
                  <small>{m.desc}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="rd-buy-row">
            <div className="rd-qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">
                <Minus size={14} />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock || 99, qty + 1))} aria-label="Increase">
                <Plus size={14} />
              </button>
            </div>
            <span className="rd-stock-note">
              {p.stock > 0 ? `In Stock (Ships in 24h)` : 'Low Stock'}
            </span>
          </div>

          <div className="rd-buy-actions">
            <button className="rd-btn rd-btn-outline" onClick={() => void add(false)}>
              <ShoppingCart size={15} /> Add to Cart
            </button>
            <button className="rd-btn rd-btn-primary" onClick={() => void add(true)}>
              <Zap size={15} /> Buy Now
            </button>
          </div>

          <button
            className="rd-wish-link"
            onClick={() => {
              toggleLocalWishlist(p.id);
              setWished(!wished);
              updateCounts();
            }}
          >
            <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
            {wished ? 'Saved in Wishlist' : 'Add to Wishlist'}
          </button>

          <div className="rd-trust">
            <div>
              <Truck size={18} />
              <b>Free Delivery</b>
              <small>Nationwide Express</small>
            </div>
            <div>
              <RotateCcw size={18} />
              <b>30 Days</b>
              <small>Easy Return</small>
            </div>
            <div>
              <ShieldCheck size={18} />
              <b>2 Year Warranty</b>
              <small>Verified authentic</small>
            </div>
          </div>
        </div>
      </div>

      <div className="rd-tabs-box">
        <div className="rd-tabs">
          <button className={tab === 'details' ? 'on' : ''} onClick={() => setTab('details')}>
            Product Details
          </button>
          <button className={tab === 'reviews' ? 'on' : ''} onClick={() => setTab('reviews')}>
            Reviews ({p.reviewCount ?? p.reviews?.length ?? 12})
          </button>
          <button className={tab === 'shipping' ? 'on' : ''} onClick={() => setTab('shipping')}>
            Shipping &amp; Returns
          </button>
        </div>
        <div className="rd-tab-body">
          {tab === 'details' && (
            <div className="rd-details">
              <div>
                <h3>Immersive Engineering Architecture</h3>
                <p className="rd-muted">{p.description}</p>
                <ul className="rd-checks">
                  <li>
                    <Check size={14} /> Adaptive Neural Active Noise Cancellation
                  </li>
                  <li>
                    <Check size={14} /> Hi-Res Audio certified with Studio Drivers
                  </li>
                  <li>
                    <Check size={14} /> 50-hour fast-charge battery life
                  </li>
                  <li>
                    <Check size={14} /> Multi-point Bluetooth 5.3 connection
                  </li>
                </ul>
              </div>
              <div className="rd-specs">
                <h4>Technical Specifications</h4>
                {[
                  ['Category', p.category?.name || 'Electronics'],
                  ['Driver Size', '40mm Custom Titanium'],
                  ['Frequency', '4Hz - 40,000Hz'],
                  ['Weight', '254g'],
                  ['Connection', 'Bluetooth 5.3 LE Audio'],
                  ['Sold By', brand],
                  ['Stock Available', String(p.stock ?? 24)],
                  ['SKU Reference', (p.slug || p.id || 'PROD').slice(0, 20).toUpperCase()]
                ].map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'reviews' && (
            <div>
              {(p.reviews || []).length ? (
                (p.reviews || []).map((r) => (
                  <div key={r.id} className="rd-review">
                    <div className="rd-row-between">
                      <b>{r.user?.name || 'Customer'}</b>
                      <small>{shortDate(r.createdAt)}</small>
                    </div>
                    <Stars value={r.rating} />
                    <p className="rd-muted">{r.text}</p>
                  </div>
                ))
              ) : (
                <p className="rd-muted">No verified reviews yet. Be the first to review!</p>
              )}
              {user?.role === 'CUSTOMER' && (
                <form onSubmit={submitReview} className="rd-review-form">
                  <label className="rd-label">Rate this product</label>
                  <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} Stars
                      </option>
                    ))}
                  </select>
                  <textarea
                    required
                    minLength={5}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your experience with this product..."
                  />
                  <button className="rd-btn rd-btn-primary" type="submit">
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          )}
          {tab === 'shipping' && (
            <div className="rd-muted" style={{ lineHeight: 1.8 }}>
              <p>
                <b>Express Dispatch:</b> All orders are packed within 24 hours. Delivery across Lahore,
                Karachi and Islamabad takes 1–3 business days.
              </p>
              <p>
                <b>Doorstep Inspection:</b> Open and inspect your package at your doorstep before paying
                cash to courier.
              </p>
              <p>
                <b>Hassle-Free Returns:</b> 30-day money-back guarantee on all authentic items.
              </p>
            </div>
          )}
        </div>
      </div>

      {recs.length > 0 && (
        <section className="rd-section">
          <h2 className="rd-h2">Frequently Bought Together</h2>
          <div className="rd-bundle">
            {bundle.map((x, i) => (
              <React.Fragment key={x?.id || i}>
                {i > 0 && (
                  <span className="rd-plus">
                    <Plus size={16} />
                  </span>
                )}
                <Link href={`/product/${x?.slug || x?.id}`} className={`rd-bundle-item ${i === 0 ? 'this' : ''}`}>
                  {i === 0 && <em>THIS ITEM</em>}
                  <img src={imageSrc(x)} alt={x?.name || ''} />
                  <b>{x?.name}</b>
                  <span>{money(x?.price || 0)}</span>
                </Link>
              </React.Fragment>
            ))}
            <div className="rd-bundle-total">
              <small>Total price ({bundle.length} items)</small>
              <strong>{money(bundleTotal)}</strong>
              <button
                className="rd-btn rd-btn-outline"
                onClick={() => {
                  bundle.forEach((x) => addLocalCart(x.id, 1));
                  updateCounts();
                  setToast('All bundle items added to cart');
                }}
              >
                Add All to Cart
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- cart */
export function RdCart() {
  const { setToast, updateCounts } = useApp();
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [promo, setPromo] = useState('');
  const [applied, setApplied] = useState(0);

  const reload = () => {
    void fetchCart().then((c) => {
      setItems(c);
      setCheckedIds(c.map((i) => i.product.id));
      setLoading(false);
    });
  };

  useEffect(reload, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApplied(Number(sessionStorage.getItem('aimart_promo') || 0));
    }
  }, []);

  const change = (i: CartItem, quantity: number) => {
    const local = readLocalCart();
    const next =
      quantity <= 0
        ? local.filter((x) => x.productId !== i.product.id)
        : local.map((x) =>
            x.productId === i.product.id
              ? { ...x, quantity: Math.min(quantity, i.product.stock || 99) }
              : x
          );
    writeLocalCart(next);
    updateCounts();
    reload();
  };

  const later = (i: CartItem) => {
    if (!getLocalWishlist().includes(i.product.id)) toggleLocalWishlist(i.product.id);
    change(i, 0);
    setToast('Item saved to your wishlist');
  };

  const selectedItems = items.filter((i) => checkedIds.includes(i.product.id));
  const subtotal = selectedItems.reduce((s, i) => s + (i.product.price || 0) * i.quantity, 0);
  const discount = Math.round(subtotal * applied);
  const tax = Math.round(subtotal * 0.05); // 5% standard GST
  const total = subtotal - discount + (subtotal > 0 ? tax : 0);

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === 'SAVE10') {
      if (typeof window !== 'undefined') sessionStorage.setItem('aimart_promo', '0.1');
      setApplied(0.1);
      setToast('Promo code applied: 10% discount');
    } else {
      setToast('Invalid promo code. Try SAVE10');
    }
  };

  return (
    <div className="rd-page anim-fade-in">
      <h1 className="rd-h1">Your Cart</h1>
      {loading ? (
        <div className="rd-skeleton" style={{ height: 240 }} />
      ) : items.length === 0 ? (
        <div className="rd-empty">
          <ShoppingCart size={36} />
          <h3>Your shopping cart is empty</h3>
          <p>Discover handpicked electronics, fashion and smart living essentials.</p>
          <Link href="/shop" className="rd-btn rd-btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="rd-cart">
          <div className="rd-cart-list">
            {items.map((i) => {
              const isChecked = checkedIds.includes(i.product.id);
              return (
                <div className="rd-cart-row" key={i.id}>
                  <input
                    type="checkbox"
                    className="rd-cart-item-check"
                    checked={isChecked}
                    onChange={(e) =>
                      setCheckedIds((cur) =>
                        e.target.checked
                          ? [...cur, i.product.id]
                          : cur.filter((x) => x !== i.product.id)
                      )
                    }
                    aria-label="Select item for checkout"
                  />
                  <img src={imageSrc(i.product)} alt={i.product.name} />
                  <div className="rd-cart-info">
                    <Link href={`/product/${i.product.slug || i.product.id}`}>{i.product.name}</Link>
                    <small>
                      {i.product.category?.name || 'General'} · In Stock
                    </small>
                    <div className="rd-qty sm">
                      <button onClick={() => change(i, i.quantity - 1)} aria-label="Decrease">
                        <Minus size={13} />
                      </button>
                      <span>{i.quantity}</span>
                      <button onClick={() => change(i, i.quantity + 1)} aria-label="Increase">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="rd-cart-right">
                    <strong>{money(i.product.price * i.quantity)}</strong>
                    <div>
                      <button onClick={() => later(i)}>Save for Later</button>
                      <button className="danger" onClick={() => change(i, 0)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="rd-summary">
            <h3>Order Summary</h3>
            <div className="rd-line">
              <span>Subtotal ({selectedItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <b>{money(subtotal)}</b>
            </div>
            {discount > 0 && (
              <div className="rd-line">
                <span>Discount</span>
                <b className="rd-accent">-{money(discount)}</b>
              </div>
            )}
            <div className="rd-line">
              <span>Shipping</span>
              <span className="rd-accent font-bold">Free</span>
            </div>
            <div className="rd-line">
              <span>Estimated Tax (5%)</span>
              <span>{money(tax)}</span>
            </div>
            <div className="rd-line total">
              <span>Total</span>
              <b>{money(total)}</b>
            </div>

            <label className="rd-label">Promo Code</label>
            <div className="rd-promo">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Enter promo (e.g. SAVE10)"
              />
              <button className="rd-btn rd-btn-outline" onClick={applyPromo}>
                Apply
              </button>
            </div>

            <Link
              href={selectedItems.length ? '/checkout' : '#'}
              className={`rd-btn rd-btn-primary block ${!selectedItems.length ? 'dim' : ''}`}
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- checkout */
type Addr = { id: string; label: string; name: string; lines: string; phone: string };

export function RdCheckout() {
  const { user, setToast, updateCounts } = useApp();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState(1);
  const [addrs, setAddrs] = useState<Addr[]>([
    {
      id: 'home',
      label: 'Home',
      name: 'John Doe',
      lines: '123 Corporate Blvd, Suite 400, Gulberg III, Lahore',
      phone: '+92 (300) 123-4567'
    },
    {
      id: 'office',
      label: 'Office',
      name: 'John Doe',
      lines: '89 Tech Park Way, Floor 12, Sector I-9, Islamabad',
      phone: '+92 (321) 987-6543'
    }
  ]);
  const [sel, setSel] = useState('home');
  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [street, setStreet] = useState('');
  const [pay, setPay] = useState('cod');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    void fetchCart().then(setItems);
  }, []);

  useEffect(() => {
    if (user?.name) {
      setAddrs((prev) => [
        {
          id: 'primary',
          label: 'Saved Address',
          name: user.name,
          lines: user.address || 'Suite 402, Al-Hafeez Heights, Gulberg III, Lahore, Pakistan',
          phone: user.phone || '+92 300 1234567'
        },
        ...prev.filter((a) => a.id !== 'primary')
      ]);
      setSel('primary');
    }
  }, [user?.id]);

  const subtotal = items.reduce((s, i) => s + (i.product.price || 0) * i.quantity, 0);
  const promo = Number(typeof window !== 'undefined' ? sessionStorage.getItem('aimart_promo') || 0 : 0);
  const discount = Math.round(subtotal * promo);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal - discount + (subtotal > 0 ? tax : 0);
  const addr = addrs.find((a) => a.id === sel) || addrs[0];

  const addAddress = () => {
    if (!fn || !street) return setErr('Please enter both your name and complete street address.');
    const a: Addr = {
      id: 'custom-' + Date.now(),
      label: 'New',
      name: `${fn} ${ln}`.trim(),
      lines: street,
      phone: user?.phone || '0300-1234567'
    };
    setAddrs([...addrs, a]);
    setSel(a.id);
    setFn('');
    setLn('');
    setStreet('');
    setErr('');
    setToast('Address saved');
  };

  const methods = [
    ['card', 'Credit / Debit Card', 'Visa, Mastercard, Amex'],
    ['jazz', 'JazzCash', 'Instant mobile wallet transfer'],
    ['easy', 'EasyPaisa', 'Instant mobile wallet transfer'],
    ['cod', 'Cash on Delivery', 'Pay in cash when you receive goods']
  ];

  const next = () => {
    setErr('');
    setStep(step + 1);
  };

  const place = async () => {
    if (!addr) return;
    setBusy(true);
    setErr('');

    const snapshot = {
      id: 'AI-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(100 + Math.random() * 900),
      items: items.map((i) => ({
        name: i.product?.name || 'Item',
        price: i.product?.price || 0,
        qty: i.quantity,
        img: imageSrc(i.product),
        cat: i.product?.category?.name || 'General'
      })),
      subtotal,
      discount,
      tax,
      total,
      address: addr,
      pay: methods.find((m) => m[0] === pay)?.[1] || 'Cash on Delivery'
    };

    try {
      if (user?.role === 'CUSTOMER') {
        const o = await post<Order>('/api/orders', {
          address: addr.lines.length >= 8 ? addr.lines : addr.lines + ', Pakistan',
          phone: addr.phone,
          paymentMethod: pay === 'cod' ? 'COD' : 'BANK_TRANSFER'
        });
        if (o?.id) {
          snapshot.id = o.id.slice(-10).toUpperCase();
        }
      }
    } catch (e: any) {
      // Offline fallback order placement
      console.warn('API order sync error:', e);
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aimart_last_order', JSON.stringify(snapshot));
      sessionStorage.removeItem('aimart_promo');
    }
    writeLocalCart([]);
    updateCounts();
    setToast('Order confirmed! Tracking details generated.');
    router.push('/order-confirmed');
  };

  if (!items.length)
    return (
      <div className="rd-page anim-fade-in">
        <div className="rd-empty">
          <ShoppingCart size={36} />
          <h3>Your cart is empty</h3>
          <Link href="/shop" className="rd-btn rd-btn-primary">
            Discover Products
          </Link>
        </div>
      </div>
    );

  return (
    <div className="rd-page rd-checkout anim-fade-in">
      <div className="rd-secure">
        <Lock size={14} /> Secure Checkout
      </div>

      <div className="rd-stepper">
        {['Delivery', 'Payment', 'Review'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`rd-step ${step > i + 1 ? 'done' : step === i + 1 ? 'on' : ''}`}>
              <i>{step > i + 1 ? <Check size={13} /> : i + 1}</i>
              {s}
            </div>
            {i < 2 && <span className="rd-step-line" />}
          </React.Fragment>
        ))}
      </div>

      <div className="rd-co-grid">
        <div>
          <h2 className={`rd-h2 ${step < 1 ? 'dim' : ''}`}>1. Delivery Address</h2>
          {step === 1 ? (
            <>
              <div className="rd-addr-grid">
                {addrs.map((a) => (
                  <button
                    key={a.id}
                    className={`rd-addr ${sel === a.id ? 'on' : ''}`}
                    onClick={() => setSel(a.id)}
                  >
                    {sel === a.id && <Check size={16} className="rd-addr-check" />}
                    <b>{a.label}</b>
                    <span>{a.name}</span>
                    <span>{a.lines}</span>
                    <span className="rd-muted">{a.phone}</span>
                  </button>
                ))}
              </div>

              <div className="rd-box rd-add-addr">
                <div className="rd-add-title">
                  <Plus size={14} /> Add New Address
                </div>
                <div className="rd-two">
                  <div>
                    <label className="rd-label">First Name</label>
                    <input
                      value={fn}
                      onChange={(e) => setFn(e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="rd-label">Last Name</label>
                    <input
                      value={ln}
                      onChange={(e) => setLn(e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <label className="rd-label">Street Address</label>
                <input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="House, street, area, city in Pakistan"
                />
                <button
                  className="rd-btn rd-btn-outline"
                  onClick={addAddress}
                  style={{ marginTop: 12 }}
                >
                  Save Address
                </button>
              </div>
            </>
          ) : (
            addr && (
              <div className="rd-box rd-summary-mini">
                <b>{addr.label}</b> — {addr.name}
                <br />
                {addr.lines} · {addr.phone}{' '}
                <button className="rd-link" onClick={() => setStep(1)}>
                  Edit
                </button>
              </div>
            )
          )}

          <h2 className={`rd-h2 ${step < 2 ? 'dim' : ''}`} style={{ marginTop: 28 }}>
            2. Payment Method
          </h2>
          {step >= 2 ? (
            step === 2 ? (
              <div className="rd-pay-grid">
                {methods.map(([k, t, s]) => (
                  <button
                    key={k}
                    className={`rd-pay ${pay === k ? 'on' : ''}`}
                    onClick={() => setPay(k)}
                  >
                    <i />
                    <div>
                      <b>{t}</b>
                      {s && <small>{s}</small>}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rd-box rd-summary-mini">
                {methods.find((m) => m[0] === pay)?.[1]}{' '}
                <button className="rd-link" onClick={() => setStep(2)}>
                  Change
                </button>
              </div>
            )
          ) : (
            <div className="rd-pay-grid dim">
              {methods.map(([k, t, s]) => (
                <div key={k} className="rd-pay">
                  <i />
                  <div>
                    <b>{t}</b>
                    {s && <small>{s}</small>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className={`rd-h2 ${step < 3 ? 'dim' : ''}`} style={{ marginTop: 28 }}>
            3. Order Review
          </h2>
          {step < 3 ? (
            <p className="rd-muted">Complete previous steps to review your order details.</p>
          ) : (
            <div className="rd-box">
              {items.map((i) => (
                <div key={i.id} className="rd-line">
                  <span>
                    {i.product.name} × {i.quantity}
                  </span>
                  <b>{money(i.product.price * i.quantity)}</b>
                </div>
              ))}
            </div>
          )}
          {err && <p className="rd-error">{err}</p>}
        </div>

        <aside className="rd-summary">
          <h3>Order Summary</h3>
          {items.map((i) => (
            <div key={i.id} className="rd-mini-item">
              <img src={imageSrc(i.product)} alt="" />
              <div>
                <b>{i.product.name}</b>
                <small>Qty: {i.quantity}</small>
              </div>
              <span>{money(i.product.price * i.quantity)}</span>
            </div>
          ))}
          <hr />
          <div className="rd-line">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="rd-line">
              <span>Discount</span>
              <span className="rd-accent">-{money(discount)}</span>
            </div>
          )}
          <div className="rd-line">
            <span>Estimated Tax</span>
            <span>{money(tax)}</span>
          </div>
          <div className="rd-line">
            <span>Shipping</span>
            <span className="rd-accent">Free</span>
          </div>
          <div className="rd-line total">
            <span>Total</span>
            <b>{money(total)}</b>
          </div>

          {step === 1 && (
            <button className="rd-btn rd-btn-primary block" onClick={next}>
              Continue to Payment
            </button>
          )}
          {step === 2 && (
            <button className="rd-btn rd-btn-primary block" onClick={next}>
              Review Order
            </button>
          )}
          {step === 3 && (
            <button
              className="rd-btn rd-btn-primary block"
              disabled={busy}
              onClick={() => void place()}
            >
              {busy ? 'Placing order…' : 'Place Order'}
            </button>
          )}
          <p className="rd-secure-note">
            <Lock size={11} /> Payments are secure and encrypted.
          </p>
        </aside>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- order confirmed */
export function RdConfirmed() {
  const [o, setO] = useState<any>(null);
  const { setToast } = useApp();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('aimart_last_order');
        setO(raw ? JSON.parse(raw) : null);
      } catch {}
    }
  }, []);

  if (!o) {
    return (
      <div className="rd-page anim-fade-in">
        <div className="rd-empty">
          <Package size={36} />
          <h3>No recent order found</h3>
          <p>Check your order history or return to shop.</p>
          <Link href="/orders" className="rd-btn rd-btn-primary">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    ['Confirmed', Check],
    ['Preparing', Archive],
    ['Shipped', Truck],
    ['Delivered', Mail]
  ] as const;

  const addrName = typeof o.address === 'object' ? o.address?.name : 'Customer';
  const addrLines = typeof o.address === 'object' ? o.address?.lines : String(o.address || '');

  return (
    <div className="rd-page rd-confirmed anim-fade-in">
      <div className="rd-confirm-icon">
        <Check size={32} />
      </div>
      <h1>Order Confirmed</h1>
      <p className="rd-muted center">
        Thank you for your purchase. We&apos;ve received your order and are currently processing it.
      </p>

      <div className="rd-order-no">
        ORDER # <b>{o.id || 'AI-8472-991'}</b>
        <button
          onClick={() => {
            void navigator.clipboard?.writeText(o.id || '');
            setToast('Order number copied');
          }}
          aria-label="Copy order number"
        >
          <Copy size={14} />
        </button>
      </div>

      <div className="rd-track">
        {steps.map(([t, Icon], i) => (
          <React.Fragment key={t}>
            <div className={`rd-track-step ${i === 0 ? 'on' : ''}`}>
              <i>
                <Icon size={14} />
              </i>
              <span>{t}</span>
            </div>
            {i < 3 && <span className={`rd-track-line ${i === 0 ? 'on' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="rd-co-grid" style={{ marginTop: 36 }}>
        <div>
          <h2 className="rd-h2">Items in this order</h2>
          {(o.items || []).map((i: any, k: number) => (
            <div key={k} className="rd-conf-item">
              <img src={i.img || '/images/0.jpg'} alt="" />
              <div>
                <small>{(i.cat || 'ELECTRONICS').toUpperCase()}</small>
                <b>{i.name}</b>
                <span className="rd-muted">Qty: {i.qty}</span>
              </div>
              <strong>{money((Number(i.price) || 0) * (Number(i.qty) || 1))}</strong>
            </div>
          ))}
        </div>

        <div>
          <div className="rd-summary">
            <h3>Order Summary</h3>
            <div className="rd-line">
              <span>Subtotal</span>
              <span>{money(o.subtotal || 0)}</span>
            </div>
            {o.discount > 0 && (
              <div className="rd-line">
                <span>Discount</span>
                <span className="rd-accent">-{money(o.discount)}</span>
              </div>
            )}
            <div className="rd-line">
              <span>Shipping</span>
              <span className="rd-accent font-bold">Free</span>
            </div>
            <div className="rd-line">
              <span>Tax</span>
              <span>{money(o.tax || 0)}</span>
            </div>
            <div className="rd-line total">
              <span>Total</span>
              <b>{money(o.total || 0)}</b>
            </div>
          </div>

          <div className="rd-two" style={{ marginTop: 14 }}>
            <div className="rd-box">
              <h4>
                <MapPin size={13} /> Delivery
              </h4>
              <p className="rd-muted">
                {addrName}
                <br />
                {addrLines}
              </p>
            </div>
            <div className="rd-box">
              <h4>
                <CreditCard size={13} /> Payment
              </h4>
              <p className="rd-muted">{o.pay || 'Cash on Delivery'}</p>
            </div>
          </div>

          <div className="rd-box" style={{ marginTop: 14 }}>
            <h4>What Happens Next?</h4>
            <p className="rd-muted">
              We will send you an SMS and email confirmation. Once dispatched, your courier tracking link
              will become live.
            </p>
          </div>
        </div>
      </div>

      <div className="rd-actions-center">
        <Link href="/orders" className="rd-btn rd-btn-primary">
          Track Order <ArrowRight size={14} />
        </Link>
        <Link href="/shop" className="rd-btn rd-btn-outline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ account shell */
function AccountNav({ active }: { active: string }) {
  const { logout } = useApp();
  const router = useRouter();
  const links: [string, string, React.ReactNode][] = [
    ['/profile', 'Profile', <User key="u" size={15} />],
    ['/orders', 'Order History', <Archive key="a" size={15} />],
    ['/profile?tab=payment', 'Payment Methods', <Wallet key="w" size={15} />],
    ['/profile?tab=addresses', 'Addresses', <MapPin key="m" size={15} />],
    ['/profile?tab=notifications', 'Notifications', <Bell key="b" size={15} />]
  ];
  return (
    <aside className="rd-acc-nav">
      <h3>My Account</h3>
      {links.map(([href, label, icon]) => (
        <Link key={label} href={href} className={active === label ? 'on' : ''}>
          {icon}
          {label}
        </Link>
      ))}
      <button
        onClick={async () => {
          await logout();
          router.push('/');
        }}
      >
        <LogOut size={15} /> Sign Out
      </button>
    </aside>
  );
}

/* ------------------------------------------------------------------- orders */
const statusLabel = (s: string) =>
  ({
    PLACED: 'Order placed',
    CONFIRMED: 'Confirmed',
    PACKED: 'Packed',
    SHIPPED: 'Arriving soon',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
  }[s] || s);

export function RdOrders() {
  const { user, setToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api<Order[]>('/api/orders/my')
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoaded(true));
  }, [user?.id]);

  const list = orders.filter((o) => {
    if (!o) return false;
    const tabMatch =
      tab === 'all'
        ? true
        : tab === 'delivered'
        ? o.status === 'DELIVERED'
        : tab === 'cancelled'
        ? o.status === 'CANCELLED'
        : !['DELIVERED', 'CANCELLED'].includes(o.status);

    const itemsText = (o.items || []).map((i) => i.nameSnapshot || '').join(' ');
    const qMatch = !q || `${o.id || ''} ${itemsText}`.toLowerCase().includes(q.toLowerCase());
    return tabMatch && qMatch;
  });

  return (
    <div className="rd-page rd-account anim-fade-in">
      <AccountNav active="Order History" />
      <section>
        <div className="rd-row-between">
          <div>
            <h1 className="rd-h1">Order History</h1>
            <p className="rd-muted">Track shipments, return items or order again.</p>
          </div>
          <div className="rd-input-icon big">
            <Search size={15} />
            <input
              placeholder="Search orders..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="rd-tabs flat">
          {['all', 'active', 'delivered', 'cancelled'].map((t) => (
            <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
              {t === 'all' ? 'All Orders' : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {!user && loaded ? (
          <div className="rd-empty">
            <User size={34} />
            <h3>Sign in to see your orders</h3>
            <Link href="/login" className="rd-btn rd-btn-primary">
              Sign In
            </Link>
          </div>
        ) : list.length === 0 && loaded ? (
          <div className="rd-empty">
            <Archive size={34} />
            <h3>No orders found</h3>
            <Link href="/shop" className="rd-btn rd-btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          list.map((o) => {
            const first = (o.items || [])[0];
            const addressFirst = (o.address || 'Pakistan').split(',')[0];
            return (
              <div className="rd-order" key={o.id}>
                <div className="rd-order-head">
                  <div>
                    <small>ORDER PLACED</small>
                    <b>{shortDate(o.createdAt)}</b>
                  </div>
                  <div>
                    <small>TOTAL</small>
                    <b>{money(o.total)}</b>
                  </div>
                  <div>
                    <small>SHIP TO</small>
                    <b className="rd-accent">{addressFirst}</b>
                  </div>
                  <div className="right">
                    <small>ORDER # {(o.id || '').slice(-10).toUpperCase()}</small>
                  </div>
                </div>

                <div className="rd-order-body">
                  <div className="rd-order-thumb">
                    {first?.product?.images?.[0]?.url ? (
                      <img src={first.product.images[0].url} alt="" />
                    ) : (
                      <Package size={26} />
                    )}
                  </div>
                  <div className="rd-order-main">
                    <span className={`rd-status ${o.status}`}>
                      {o.status === 'SHIPPED' ? (
                        <Truck size={11} />
                      ) : o.status === 'DELIVERED' ? (
                        <Check size={11} />
                      ) : null}{' '}
                      {statusLabel(o.status)}
                    </span>
                    <b>
                      {first?.nameSnapshot || 'Ordered Item'}
                      {(o.items || []).length > 1 ? ` + ${(o.items || []).length - 1} more` : ''}
                    </b>
                    <small className="rd-muted">
                      {(o.items || []).length} item(s) · {o.paymentMethod || 'COD'}
                    </small>
                  </div>

                  <div className="rd-order-actions">
                    {o.status === 'DELIVERED' ? (
                      <>
                        <Link href="/shop" className="rd-btn rd-btn-outline">
                          <ShoppingCart size={13} /> Buy Again
                        </Link>
                        {first?.productId && (
                          <Link href={`/product/${first.productId}`} className="rd-btn rd-btn-outline">
                            Leave Review
                          </Link>
                        )}
                      </>
                    ) : o.status === 'CANCELLED' ? (
                      <Link href="/shop" className="rd-btn rd-btn-outline">
                        Browse Shop
                      </Link>
                    ) : (
                      <button
                        className="rd-btn rd-btn-primary"
                        onClick={() =>
                          setToast(
                            `Delivery Status: ${statusLabel(o.status)} · Courier tracking active`
                          )
                        }
                      >
                        Track Package
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

/* ----------------------------------------------------------------- wishlist */
export function RdWishlist() {
  const { setToast, updateCounts } = useApp();
  const [all, setAll] = useState<Product[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [tab, setTab] = useState('all');

  const load = () => {
    setIds(getLocalWishlist());
  };

  useEffect(() => {
    load();
    void loadProducts().then(setAll);
  }, []);

  const items = all.filter((p) => ids.includes(p.id));
  const cats = [...new Set(items.map((p) => p.category?.name).filter(Boolean))];
  const shown = tab === 'all' ? items : items.filter((p) => p.category?.name === tab);
  const recs = all.filter((p) => !ids.includes(p.id)).slice(0, 4);

  const removeMany = (targetIds: string[]) => {
    targetIds.forEach((id) => {
      if (getLocalWishlist().includes(id)) toggleLocalWishlist(id);
    });
    setSel([]);
    load();
    updateCounts();
    setToast('Removed from wishlist');
  };

  const addMany = (targetIds: string[]) => {
    targetIds.forEach((id) => addLocalCart(id, 1));
    updateCounts();
    setToast('Added selected items to cart');
  };

  return (
    <div className="rd-page anim-fade-in">
      <div className="rd-row-between">
        <div>
          <h1 className="rd-h1">My Wishlist</h1>
          <p className="rd-muted">{items.length} items saved for later</p>
        </div>
        <button
          className="rd-btn rd-btn-outline"
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href);
            setToast('Wishlist link copied to clipboard');
          }}
        >
          <Share2 size={14} /> Share List
        </button>
      </div>

      {/* Price Drop Alert banner matching Screenshot 10 */}
      <div className="rd-alert-banner">
        <Bell size={18} className="rd-accent" />
        <div>
          <strong>Price Drop Alert!</strong> 2 items in your wishlist have dropped in price since you saved them.
        </div>
        <button
          className="rd-link"
          onClick={() => setToast('Showing items with active discounts')}
        >
          View Items
        </button>
      </div>

      <div className="rd-tabs flat">
        <button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>
          All Items ({items.length})
        </button>
        {cats.map((c) => (
          <button key={c} className={tab === c ? 'on' : ''} onClick={() => setTab(c)}>
            {c} ({items.filter((p) => p.category?.name === c).length})
          </button>
        ))}
      </div>

      {items.length ? (
        <>
          <div className="rd-bulk">
            <label className="rd-check">
              <input
                type="checkbox"
                checked={sel.length === shown.length && shown.length > 0}
                onChange={(e) => setSel(e.target.checked ? shown.map((p) => p.id) : [])}
              />
              Select All
            </label>
            <div>
              <button
                className="rd-btn rd-btn-outline"
                disabled={!sel.length}
                onClick={() => addMany(sel)}
              >
                Add Selected to Cart
              </button>
              <button
                className="rd-btn rd-btn-outline danger"
                disabled={!sel.length}
                onClick={() => removeMany(sel)}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>

          <div className="rd-grid-4">
            {shown.map((p) => (
              <div key={p.id} className="rd-wish">
                <input
                  type="checkbox"
                  className="rd-wish-check"
                  checked={sel.includes(p.id)}
                  onChange={() =>
                    setSel((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))
                  }
                  aria-label="Select item"
                />
                <Link href={`/product/${p.slug || p.id}`} className="rd-card-img">
                  <img src={imageSrc(p)} alt={p.name} />
                  {discountOf(p) > 0 && (
                    <span className="rd-tag">Price Dropped {discountOf(p)}%</span>
                  )}
                </Link>
                <div className="rd-card-body">
                  <Link href={`/product/${p.slug || p.id}`} className="rd-card-name">
                    {p.name}
                  </Link>
                  <div className="rd-price">
                    {money(p.price)}
                    {discountOf(p) > 0 && <s>{money(p.comparePrice || 0)}</s>}
                  </div>
                  <button
                    className="rd-btn rd-btn-primary block"
                    onClick={() => addMany([p.id])}
                  >
                    <ShoppingCart size={13} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rd-empty">
          <Heart size={34} />
          <h3>Your wishlist is empty</h3>
          <Link href="/shop" className="rd-btn rd-btn-primary">
            Discover Products
          </Link>
        </div>
      )}

      {recs.length > 0 && (
        <section className="rd-section">
          <h2 className="rd-h2">Based on your wishlist</h2>
          <div className="rd-grid-4">
            {recs.map((p) => (
              <RdCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ profile */
export function RdProfile() {
  const { user, refresh, setToast } = useApp();
  const [tab, setTab] = useState('personal');
  const [first, setFirst] = useState('Jane');
  const [last, setLast] = useState('Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [phone, setPhone] = useState('+1 (555) 012-3456');
  const [address, setAddress] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = new URLSearchParams(window.location.search).get('tab');
      if (t) setTab(t);
    }
  }, []);

  useEffect(() => {
    if (user?.name) {
      const parts = (user.name || '').trim().split(/\s+/);
      setFirst(parts[0] || 'Jane');
      setLast(parts.slice(1).join(' ') || 'Doe');
      setEmail(user.email || 'jane.doe@example.com');
      setPhone(user.phone || '+1 (555) 012-3456');
      setAddress(user.address || '');
    }
  }, [user?.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await patch('/api/profile', {
        name: `${first} ${last}`.trim(),
        phone,
        address
      });
      await refresh();
      setToast('Profile updated successfully');
    } catch (x: any) {
      setErr(x.message || 'Could not update profile');
    }
  };

  const tabs: [string, string, React.ReactNode][] = [
    ['personal', 'Personal Info', <User key="a" size={15} />],
    ['security', 'Security', <Shield key="b" size={15} />],
    ['addresses', 'Addresses', <MapPin key="c" size={15} />],
    ['payment', 'Payment', <CreditCard key="d" size={15} />],
    ['notifications', 'Notifications', <Bell key="e" size={15} />]
  ];

  return (
    <div className="rd-page rd-profile anim-fade-in">
      <aside className="rd-side-tabs">
        {tabs.map(([k, l, icon]) => (
          <button
            key={k}
            className={tab === k ? 'on' : ''}
            onClick={() => setTab(k)}
          >
            {icon}
            {l}
          </button>
        ))}
      </aside>

      <section>
        <h1 className="rd-h1">
          {tab === 'personal'
            ? 'Personal Information'
            : tabs.find((t) => t[0] === tab)?.[1]}
        </h1>

        <div className="rd-box big">
          {(tab === 'personal' || tab === 'addresses') && (
            <form onSubmit={save}>
              {tab === 'personal' && (
                <div className="rd-avatar-row">
                  <div className="rd-avatar">
                    <User size={34} />
                  </div>
                  <div>
                    <button
                      type="button"
                      className="rd-btn rd-btn-outline"
                      onClick={() => setToast('Photo upload coming in next release')}
                    >
                      Change Avatar
                    </button>
                    <small className="rd-muted block">JPG, GIF or PNG. Max size of 800K</small>
                  </div>
                </div>
              )}

              {tab === 'personal' ? (
                <>
                  <div className="rd-two">
                    <div>
                      <label className="rd-label">First Name</label>
                      <input
                        value={first}
                        onChange={(e) => setFirst(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="rd-label">Last Name</label>
                      <input
                        value={last}
                        onChange={(e) => setLast(e.target.value)}
                      />
                    </div>
                  </div>
                  <label className="rd-label">Email Address</label>
                  <input value={email} readOnly />

                  <label className="rd-label">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                  />
                </>
              ) : (
                <>
                  <label className="rd-label">Default Delivery Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter house, street, area, city in Pakistan"
                  />
                </>
              )}

              {err && <p className="rd-error">{err}</p>}

              <div className="rd-form-actions">
                <button
                  type="button"
                  className="rd-btn rd-btn-outline"
                  onClick={() => {
                    if (user?.name) {
                      const parts = (user.name || '').trim().split(/\s+/);
                      setFirst(parts[0] || 'Jane');
                      setLast(parts.slice(1).join(' ') || 'Doe');
                    }
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="rd-btn rd-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {tab === 'security' && (
            <p className="rd-muted" style={{ lineHeight: 1.8 }}>
              Your account is authenticated via enterprise JWT tokens with encrypted password hashing.
              Two-factor biometric login will be introduced soon.
            </p>
          )}
          {tab === 'payment' && (
            <p className="rd-muted" style={{ lineHeight: 1.8 }}>
              Cash on Delivery (COD), JazzCash, and EasyPaisa are available across all checkout flows.
            </p>
          )}
          {tab === 'notifications' && (
            <p className="rd-muted" style={{ lineHeight: 1.8 }}>
              Order receipts and delivery SMS dispatch notices are sent to <b>{email}</b>.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------------- auth */
export function RdAuth({ register }: { register: boolean }) {
  const router = useRouter();
  const { refresh, setToast } = useApp();
  const [step, setStep] = useState(1);
  const [first, setFirst] = useState('Jane');
  const [last, setLast] = useState('Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [phone, setPhone] = useState('+1 (555) 000-0000');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [store, setStore] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (register && typeof window !== 'undefined') {
      if (new URLSearchParams(window.location.search).get('role') === 'VENDOR') {
        setRole('VENDOR');
      }
    }
  }, [register]);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const u = register
        ? await post<AppUser>('/api/auth/register', {
            name: `${first} ${last}`.trim(),
            email,
            password: password || 'Demo12345!',
            role,
            ...(role === 'VENDOR' ? { storeName: store || `${first}'s Store` } : {})
          })
        : await post<AppUser>('/api/auth/login', { email, password: password || 'Demo12345!' });

      await refresh();
      setToast(register ? 'Welcome to AI MART!' : 'Welcome back!');
      router.push(
        u.role === 'VENDOR'
          ? '/vendor'
          : u.role === 'ADMIN'
          ? '/admin'
          : u.role === 'DELIVERY'
          ? '/delivery'
          : '/'
      );
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (register && step < 3) {
      setStep(step + 1);
      return;
    }
    void submit();
  };

  const titles = ['Personal Info', 'Account Details', 'Review & Confirm'];

  return (
    <div className="rd-auth anim-fade-in">
      <div className="rd-auth-left">
        <Link href="/" className="inline-flex items-center mb-6">
          <AIMartLogo variant="full" size="lg" theme="dark" />
        </Link>
        <h2>The modern era of intelligent commerce.</h2>
        <p>
          Experience a marketplace powered by advanced algorithms, designed for seamless transactions and
          unparalleled discovery.
        </p>
        <div className="rd-auth-stats">
          <div>
            <b>4.8M+</b>
            <span>ACTIVE USERS</span>
          </div>
          <div>
            <b>$2B+</b>
            <span>PROCESSED</span>
          </div>
          <div>
            <b>0.2s</b>
            <span>AVG RESPONSE</span>
          </div>
          <div>
            <b>99.9%</b>
            <span>UPTIME</span>
          </div>
        </div>
      </div>

      <div className="rd-auth-right">
        <form className="rd-auth-form" onSubmit={onSubmit}>
          {register && (
            <>
              <div className="rd-row-between rd-step-label">
                <b>STEP {step} OF 3</b>
                <span>{titles[step - 1]}</span>
              </div>
              <div className="rd-progress">
                {[1, 2, 3].map((n) => (
                  <i key={n} className={n <= step ? 'on' : ''} />
                ))}
              </div>
            </>
          )}

          <h1>{register ? 'Create Account' : 'Welcome back'}</h1>
          <p className="rd-muted">
            {register
              ? 'Enter your details to begin your journey.'
              : 'Sign in to access your orders and wishlist.'}
          </p>

          {register && step === 1 && (
            <>
              <div className="rd-two">
                <div>
                  <label className="rd-label">First Name</label>
                  <input
                    required
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="rd-label">Last Name</label>
                  <input
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <label className="rd-label">Email Address</label>
              <div className="rd-input-icon big">
                <Mail size={15} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
              <label className="rd-label">
                Phone Number <span className="rd-muted">(Optional)</span>
              </label>
              <div className="rd-input-icon big">
                <Phone size={15} />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </>
          )}

          {register && step === 2 && (
            <>
              <label className="rd-label">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
              <label className="rd-label">Account Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="CUSTOMER">Shop as a Customer</option>
                <option value="VENDOR">Sell as a Merchant</option>
              </select>
              {role === 'VENDOR' && (
                <>
                  <label className="rd-label">Store Name</label>
                  <input
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    placeholder="e.g. Lahore Tech Store"
                  />
                </>
              )}
            </>
          )}

          {register && step === 3 && (
            <div className="rd-box">
              <div className="rd-line">
                <span>Full Name</span>
                <b>
                  {first} {last}
                </b>
              </div>
              <div className="rd-line">
                <span>Email</span>
                <b>{email}</b>
              </div>
              <div className="rd-line">
                <span>Role</span>
                <b>{role === 'VENDOR' ? 'Merchant' : 'Customer'}</b>
              </div>
            </div>
          )}

          {!register && (
            <>
              <label className="rd-label">Email Address</label>
              <div className="rd-input-icon big">
                <Mail size={15} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
              <label className="rd-label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </>
          )}

          {error && <p className="rd-error">{error}</p>}

          <button className="rd-btn rd-btn-primary block big" disabled={busy} type="submit">
            {busy
              ? 'Please wait…'
              : register
              ? step < 3
                ? (
                  <>
                    Continue to Next Step <ArrowRight size={15} />
                  </>
                )
                : 'Create Account'
              : (
                <>
                  Sign In <ArrowRight size={15} />
                </>
              )}
          </button>

          {register && step > 1 && (
            <button
              type="button"
              className="rd-link center"
              onClick={() => setStep(step - 1)}
              style={{ marginTop: 12 }}
            >
              Back to previous step
            </button>
          )}

          <hr />
          <p className="rd-switch">
            {register ? 'Already have an account?' : 'New to AI MART?'}{' '}
            <Link href={register ? '/login' : '/register'}>
              {register ? 'Log in here' : 'Create an account'}
            </Link>
          </p>
          {!register && (
            <p className="rd-demo">Demo account: customer@aimart.test / Demo12345!</p>
          )}
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- admin overview */
export function RdAdminOverview() {
  const { setToast } = useApp();
  const [activeNav, setActiveNav] = useState('Dashboard');

  const navItems = [
    { label: 'Dashboard', icon: <LayoutGrid size={17} /> },
    { label: 'User Management', icon: <Users size={17} /> },
    { label: 'Vendor Queue', icon: <Archive size={17} /> },
    { label: 'Product Mods', icon: <Package size={17} /> },
    { label: 'Fraud Alerts', icon: <AlertTriangle size={17} />, badge: 12 },
    { label: 'Reports', icon: <BarChartIcon size={17} /> },
    { label: 'Settings', icon: <SlidersHorizontal size={17} /> }
  ];

  return (
    <div className="rd-admin-layout anim-fade-in">
      <aside className="rd-admin-sidebar">
        <div className="rd-admin-brand">
          <Link href="/" className="inline-flex items-center">
            <AIMartLogo variant="full" size="sm" theme="dark" />
          </Link>
        </div>

        <nav className="rd-admin-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`rd-admin-nav-item ${activeNav === item.label ? 'on' : ''}`}
              onClick={() => setActiveNav(item.label)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && <span className="rd-nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="rd-admin-user-card">
          <div className="rd-admin-user-avatar">
            <Shield size={16} />
          </div>
          <div>
            <b>Super Admin</b>
            <small>admin@aimart.com</small>
          </div>
        </div>
      </aside>

      <main className="rd-admin-main">
        <header className="rd-admin-header">
          <h1>Platform Overview</h1>
          <div className="rd-admin-header-right">
            <div className="rd-input-icon">
              <Search size={14} />
              <input placeholder="Search users, orders..." />
            </div>
            <button className="rd-icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="rd-badge">3</span>
            </button>
          </div>
        </header>

        {/* 4 Metric Cards matching Screenshot 2 */}
        <div className="rd-admin-metrics">
          <div className="rd-stat-card">
            <div className="rd-row-between">
              <small>TOTAL USERS</small>
              <span className="rd-stat-icon">
                <Users size={16} />
              </span>
            </div>
            <strong>2.4M</strong>
            <span className="rd-stat-trend positive">↗ +12.5% vs last month</span>
          </div>

          <div className="rd-stat-card">
            <div className="rd-row-between">
              <small>MRR</small>
              <span className="rd-stat-icon">
                <CreditCard size={16} />
              </span>
            </div>
            <strong>$8.2M</strong>
            <span className="rd-stat-trend positive">↗ +4.2% vs last month</span>
          </div>

          <div className="rd-stat-card">
            <div className="rd-row-between">
              <small>ACTIVE ORDERS</small>
              <span className="rd-stat-icon">
                <Truck size={16} />
              </span>
            </div>
            <strong>45.2K</strong>
            <span className="rd-stat-trend neutral">→ 0.0% vs last month</span>
          </div>

          <div className="rd-stat-card alert-stat-card">
            <div className="rd-row-between">
              <small>FRAUD ALERTS</small>
              <span className="rd-stat-icon alert-icon">
                <AlertTriangle size={16} />
              </span>
            </div>
            <strong>124</strong>
            <span className="rd-stat-trend alert">↗ +18% requires action</span>
          </div>
        </div>

        {/* Chart and Fraud Alerts Grid */}
        <div className="rd-admin-body-grid">
          <div className="rd-admin-chart-box">
            <div className="rd-row-between" style={{ marginBottom: 20 }}>
              <h3>Revenue &amp; Volume (12 Mo)</h3>
              <button
                className="rd-btn rd-btn-outline"
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => setToast('Report exported to CSV')}
              >
                <Download size={13} /> Export
              </button>
            </div>

            {/* SVG Visual Revenue Chart */}
            <div className="rd-svg-chart-container">
              <svg viewBox="0 0 700 320" className="rd-svg-chart">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#09665A" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#09665A" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="40" y1="20" x2="680" y2="20" stroke="#2d3236" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="680" y2="100" stroke="#2d3236" strokeDasharray="3 3" />
                <line x1="40" y1="180" x2="680" y2="180" stroke="#2d3236" strokeDasharray="3 3" />
                <line x1="40" y1="260" x2="680" y2="260" stroke="#2d3236" />

                <text x="5" y="24" fill="#6b7279" fontSize="10">10M</text>
                <text x="5" y="104" fill="#6b7279" fontSize="10">7.5M</text>
                <text x="5" y="184" fill="#6b7279" fontSize="10">5M</text>
                <text x="5" y="264" fill="#6b7279" fontSize="10">2.5M</text>

                {/* Smooth Area & Path */}
                <path
                  d="M 60 250 L 120 230 L 180 180 L 240 200 L 300 130 L 360 170 L 420 120 L 480 90 L 540 130 L 600 80 L 660 30 L 660 260 L 60 260 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M 60 250 L 120 230 L 180 180 L 240 200 L 300 130 L 360 170 L 420 120 L 480 90 L 540 130 L 600 80 L 660 30"
                  fill="none"
                  stroke="#09665A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle cx="660" cy="30" r="4" fill="#09665A" />
              </svg>
              <div className="rd-chart-axis-x">
                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Sep</span>
                <span>Nov</span>
              </div>
            </div>
          </div>

          {/* Fraud Alerts Side Box matching Screenshot 2 */}
          <aside className="rd-admin-alerts-box">
            <div className="rd-row-between" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} className="rd-accent" />
                <h3 style={{ margin: 0, fontSize: 16 }}>Fraud Alerts</h3>
              </div>
              <span className="rd-pill" style={{ background: '#ef4444', color: '#fff' }}>
                12 New
              </span>
            </div>

            <div className="rd-alerts-stack">
              <div className="rd-alert-card critical">
                <div className="rd-row-between">
                  <span className="rd-alert-tag critical">CRITICAL</span>
                  <small className="rd-muted">2m ago</small>
                </div>
                <p>Multiple high-value orders from same IP (192.168.1.4)</p>
                <div className="rd-alert-actions">
                  <button
                    className="rd-btn rd-btn-outline"
                    onClick={() => setToast('Opening IP telemetry log')}
                  >
                    Review
                  </button>
                  <button
                    className="rd-btn"
                    style={{ background: '#ef4444', color: '#fff' }}
                    onClick={() => setToast('IP 192.168.1.4 blocked')}
                  >
                    Block IP
                  </button>
                </div>
              </div>

              <div className="rd-alert-card high">
                <div className="rd-row-between">
                  <span className="rd-alert-tag high">HIGH</span>
                  <small className="rd-muted">15m ago</small>
                </div>
                <p>Vendor &apos;TechHub&apos; sudden price drops across entire catalog.</p>
                <div className="rd-alert-actions">
                  <button
                    className="rd-btn rd-btn-outline"
                    onClick={() => setToast('Opening merchant catalog auditor')}
                  >
                    Review
                  </button>
                </div>
              </div>

              <div className="rd-alert-card med">
                <div className="rd-row-between">
                  <span className="rd-alert-tag med">MED</span>
                  <small className="rd-muted">1h ago</small>
                </div>
                <p>Unusual refund request rate for Product ID #8842.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function BarChartIcon(props: any) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
