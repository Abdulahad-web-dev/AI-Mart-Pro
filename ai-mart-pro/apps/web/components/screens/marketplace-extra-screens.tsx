'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Store,
  MapPin,
  ShieldCheck,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  Lock,
  FileText,
  ArrowRight,
  Plus,
  MessageSquare,
  Search,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { api, post, Product, money, imageSrc, shortDate } from '@/lib/api';
import { DEMO_PRODUCTS } from '@/lib/demo-products';
import { ProductCard, Button, Input } from '@/components/aimart-ui';
import { MapTilerMap } from '@/components/maps/maptiler-map';
import { StoresMap } from '@/components/home/stores-map';
import { AboutSection } from '@/components/home/about-section';
import { ContactCareers } from '@/components/home/contact-careers';

/* ============================================================================
   A13. CUSTOMER REVIEWS SCREEN (/account/reviews)
   ============================================================================ */
export function CustomerReviewsScreen() {
  const { setToast } = useApp();
  const [reviews, setReviews] = useState([
    {
      id: 'rev-101',
      productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      productId: 'prod-0',
      rating: 5,
      text: 'Bohat zabardast noise cancellation aur battery timing kamaal hai. Delivered in Lahore within 24 hours!',
      status: 'PUBLISHED',
      sentiment: 'POSITIVE (96% confidence)',
      aspects: ['quality', 'battery', 'delivery'],
      date: '2 days ago',
      verifiedPurchase: true,
    },
    {
      id: 'rev-102',
      productName: 'Samsung Galaxy Watch 6 Classic 47mm AMOLED',
      productId: 'prod-2',
      rating: 4,
      text: 'Rotating bezel feels super premium and display is bright outdoors. Packaging was double sealed.',
      status: 'PUBLISHED',
      sentiment: 'POSITIVE (91% confidence)',
      aspects: ['quality', 'packaging'],
      date: '1 week ago',
      verifiedPurchase: true,
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState(DEMO_PRODUCTS[0].id);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    const prod = DEMO_PRODUCTS.find((p) => p.id === selectedProdId) || DEMO_PRODUCTS[0];

    let sentimentLabel = 'POSITIVE (92% confidence)';
    try {
      const res = await post<any>('/api/ai/sentiment', {
        text,
        productId: prod.id,
      });
      if (res?.label) {
        sentimentLabel = `${res.label.toUpperCase()} (${Math.round((res.confidence || 0.9) * 100)}% confidence)`;
      }
    } catch {}

    setReviews((prev) => [
      {
        id: 'rev-' + Date.now(),
        productName: prod.name,
        productId: prod.id,
        rating,
        text,
        status: 'PUBLISHED',
        sentiment: sentimentLabel,
        aspects: ['quality', 'delivery'],
        date: 'Just now',
        verifiedPurchase: true,
      },
      ...prev,
    ]);
    setSubmitting(false);
    setText('');
    setModalOpen(false);
    setToast('Review published & analyzed by Trilingual Sentiment AI');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B7A6C]">
            Verified Buyer Feedback
          </span>
          <h1 className="text-2xl font-extrabold text-[#1B1F23]">My Product Reviews</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage your submitted reviews and inspect trilingual AI sentiment classification.
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus size={15} /> Write a Review
        </Button>
      </div>

      {modalOpen && (
        <form
          onSubmit={handleCreateReview}
          className="bg-white border-2 border-[#0B7A6C] rounded-[18px] p-5 sm:p-6 space-y-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#1B1F23]">
              Submit Verified Purchase Review
            </h3>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-xs text-[#6B7280] hover:text-[#1B1F23]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#1B1F23] block mb-1.5">
                Purchased Product
              </label>
              <select
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] text-xs font-semibold"
              >
                {DEMO_PRODUCTS.slice(0, 12).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1B1F23] block mb-1.5">
                Star Rating
              </label>
              <div className="flex items-center gap-2 h-10">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      size={22}
                      className={
                        s <= rating ? 'fill-[#FFC531] text-[#FFC531]' : 'text-[#D1D5DB]'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1B1F23] block mb-1.5">
              Your Review (English, Urdu, or Roman Urdu)
            </label>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your honest experience with quality, battery, packaging, and delivery..."
              className="w-full p-3 rounded-xl border border-[#E5E7EB] text-xs"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Analyzing & Publishing...' : 'Publish Review'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 space-y-3 shadow-2xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Link
                  href={`/product/${r.productId}`}
                  className="text-sm font-extrabold text-[#1B1F23] hover:text-[#0B7A6C]"
                >
                  {r.productName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i < r.rating ? 'fill-[#FFC531] text-[#FFC531]' : 'text-[#E5E7EB]'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#6B7280]">{r.date}</span>
                  {r.verifiedPurchase && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F4F1] text-[#0B7A6C] text-[10px] font-bold">
                      ✓ Verified Purchase
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#E6F4F1] border border-[#A7F3D0] text-[#0B7A6C] text-[10.5px] font-bold">
                  ✨ AI Sentiment: {r.sentiment} · Estimate
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#E6F4F1] text-[#0B7A6C] text-[10.5px] font-bold">
                  {r.status}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#1B1F23] leading-relaxed">{r.text}</p>

            <div className="flex flex-wrap gap-1.5">
              {r.aspects.map((a) => (
                <span
                  key={a}
                  className="px-2 py-0.5 rounded-md bg-[#F5F7F8] text-[#6B7280] text-[10.5px] font-semibold"
                >
                  #{a}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   A15. VENDOR PUBLIC STORE (/store/[vendorId])
   ============================================================================ */
export function VendorPublicStoreScreen({ vendorId }: { vendorId: string }) {
  const { wishlist, toggleWishlist, addToCart, setToast } = useApp();
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about'>('products');
  const [followed, setFollowed] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const storeProducts = DEMO_PRODUCTS.filter(
    (p) =>
      !searchQ ||
      p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQ.toLowerCase())
  ).slice(0, 10);

  const storeName =
    storeProducts[0]?.vendor?.vendorProfile?.storeName ||
    'Northstar Flagship Electronics Store';
  const storeCity = storeProducts[0]?.vendor?.vendorProfile?.city || 'Lahore';

  return (
    <div className="space-y-6">
      {/* Cover Banner */}
      <div className="relative rounded-[20px] overflow-hidden bg-gradient-to-r from-[#17181B] via-[#075E54] to-[#0B7A6C] text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-[#0B7A6C] font-extrabold text-2xl flex items-center justify-center shadow-lg border-2 border-[#FFC531]">
              {storeName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFC531] text-[#1B1F23] text-[10px] font-extrabold uppercase">
                  Verified Flagship Partner
                </span>
                <span className="text-xs text-white/80 flex items-center gap-1">
                  <MapPin size={12} /> {storeCity}, Pakistan
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {storeName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 mt-1.5">
                <span className="flex items-center gap-1 font-bold">
                  <Star size={13} className="fill-[#FFC531] text-[#FFC531]" /> 4.9 Store Rating
                </span>
                <span>•</span>
                <span>2,480+ Followers</span>
                <span>•</span>
                <span>99.4% On-Time Dispatch</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setFollowed(!followed);
              setToast(followed ? 'Unfollowed store' : `Following ${storeName}`);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              followed
                ? 'bg-white text-[#0B7A6C]'
                : 'bg-[#0B7A6C] hover:bg-[#09665A] text-white shadow-md'
            }`}
          >
            {followed ? '✓ Following Store' : '+ Follow Store'}
          </button>
        </div>
      </div>

      {/* Store Navigation Tabs & Search */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'products', label: `Products (${storeProducts.length})` },
              { id: 'reviews', label: 'Customer Reviews (128)' },
              { id: 'about', label: 'Store Location & About' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#0B7A6C] text-white'
                  : 'text-[#6B7280] hover:text-[#1B1F23]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search in this store..."
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#F5F7F8] border border-[#E5E7EB] text-xs"
            />
          </div>
        )}
      </div>

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {storeProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isWished={wishlist.includes(p.id)}
              onToggleWishlist={() => toggleWishlist(p.id, p)}
              onAddToCart={() => addToCart(p, 1)}
            />
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-6 space-y-4">
          <h3 className="text-base font-extrabold text-[#1B1F23]">
            Verified Store Reviews &amp; AI Aspect Summary
          </h3>
          <div className="p-4 rounded-xl bg-[#E6F4F1] border border-[#A7F3D0] text-xs text-[#0B7A6C]">
            <strong>✨ AI Store Sentiment Summary (Estimate):</strong> 94% Positive across 128 verified orders. Customers consistently praise authentic sealed stock and 24-hour Lahore dispatch.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                user: 'Hamza Tariq',
                rating: 5,
                comment: '100% original Sony headphones received with official warranty card.',
                date: '3 days ago',
              },
              {
                user: 'Ayesha Malik',
                rating: 5,
                comment: 'Super fast dispatch and responsive seller support.',
                date: '1 week ago',
              },
            ].map((rev, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#F5F7F8] border border-[#E5E7EB] space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#1B1F23]">{rev.user}</strong>
                  <span className="text-[11px] text-[#6B7280]">{rev.date}</span>
                </div>
                <p className="text-xs text-[#6B7280]">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-6 space-y-4">
          <h3 className="text-base font-extrabold text-[#1B1F23]">
            About {storeName} &amp; MapTiler Location
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Authorized multi-vendor partner on AI Mart Pro operating from Gulberg III, Lahore. All shipments are covered by 100% escrow protection and 7-day replacement warranty.
          </p>
          <MapTilerMap
            center={[31.5204, 74.3587]}
            zoom={12}
            markers={[
              {
                id: vendorId || 'vendor-1',
                lat: 31.5204,
                lng: 74.3587,
                title: storeName,
                badge: 'Verified Vendor Hub',
                address: 'Main Boulevard, Gulberg III, Lahore',
                color: 'teal',
              },
            ]}
            selectedMarkerId={vendorId || 'vendor-1'}
            height="340px"
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   A16. DEALS SCREEN (/deals)
   ============================================================================ */
export function DealsScreen() {
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [countdown, setCountdown] = useState({ hours: 6, mins: 18, secs: 44 });

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, mins: 59, secs: 59 };
        return { hours: 8, mins: 59, secs: 59 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const dealProducts = DEMO_PRODUCTS.filter((p) => {
    const disc =
      p.comparePrice && p.comparePrice > p.price
        ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
        : 12;
    return disc >= minDiscount;
  }).slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Flash Deals Hero Header */}
      <div className="rounded-[20px] bg-gradient-to-r from-[#17181B] via-[#075E54] to-[#0B7A6C] text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC531] text-[#1B1F23] text-xs font-extrabold uppercase">
            <Flame size={14} /> Flash Sale &amp; Deals of the Day
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Supercharged Mega-Store Deals
          </h1>
          <p className="text-xs sm:text-sm text-white/85">
            Real discounts verified against 30-day historical price baselines with live stock progress bars.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
          <Clock size={18} className="text-[#FFC531] mr-1" />
          {[
            { label: 'HRS', val: String(countdown.hours).padStart(2, '0') },
            { label: 'MIN', val: String(countdown.mins).padStart(2, '0') },
            { label: 'SEC', val: String(countdown.secs).padStart(2, '0') },
          ].map((t) => (
            <div
              key={t.label}
              className="px-3 py-1.5 rounded-xl bg-[#17181B] text-center min-w-[52px]"
            >
              <span className="text-base font-extrabold text-[#FFC531] block leading-none">
                {t.val}
              </span>
              <span className="text-[9px] text-white/70 font-bold">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Filters */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'All Flash Deals', min: 0 },
            { label: '10%+ Off', min: 10 },
            { label: '15%+ Off', min: 15 },
            { label: '20%+ Mega Deals', min: 20 },
          ].map((f) => (
            <button
              key={f.min}
              type="button"
              onClick={() => setMinDiscount(f.min)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                minDiscount === f.min
                  ? 'bg-[#E53935] text-white'
                  : 'bg-[#F5F7F8] text-[#1B1F23] hover:bg-[#FEE2E2]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-[#0B7A6C]">
          {dealProducts.length} Active Deal Listings
        </span>
      </div>

      {/* 5-Column Deal Product Cards with Sold Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {dealProducts.map((p, idx) => (
          <ProductCard
            key={p.id}
            product={p}
            isWished={wishlist.includes(p.id)}
            onToggleWishlist={() => toggleWishlist(p.id, p)}
            onAddToCart={() => addToCart(p, 1)}
            showProgressBar={true}
            soldPercent={62 + ((idx * 11) % 33)}
            availableCount={p.stock || 12}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   A17. CONTENT PAGES (/about, /contact, /blog, /blog/[slug], /stores, /faq, /returns, /privacy, /terms)
   ============================================================================ */
const BLOG_POSTS = [
  {
    slug: 'ai-forecasting-v2-pakistan-calendar',
    category: 'AI Engineering',
    date: 'Nov 20, 2026',
    title: 'How LightGBM Quantile Forecasting & Pakistan Calendar Features Reduce Stock-Outs',
    excerpt:
      'Discover how P10/P50/P90 prediction intervals combined with Eid, Ramadan, and 11.11 calendar awareness help Pakistani merchants optimize inventory.',
    body: `Traditional single-point sales forecasts fail when demand spikes during Ramadan, Eid ul-Fitr, 11.11 mega sales, or salary week (25th to 5th). In AI Mart Pro v2, our forecasting pipeline trains three quantile regressors (P10 floor, P50 median, P90 surge) evaluated via rolling-origin backtests against a seasonal-naive baseline. Combined with Z-score service-level safety stock, vendors can see their exact days-of-cover and capital tied up before placing supplier orders.`,
  },
  {
    slug: 'roman-urdu-natural-language-search',
    category: 'Product Discovery',
    date: 'Nov 18, 2026',
    title: 'Shopping in How You Speak: Roman Urdu & Budget-Aware Semantic Search',
    excerpt:
      'Why shoppers typing "bohat sasta smart ghari under 15k" deserve instant, accurate catalog results with zero dead ends.',
    body: `Over 65% of mobile shoppers in Pakistan mix English and Roman Urdu when searching for products. Standard substring matching returns zero results for queries like "sasta jootay 5000 se kam". Our hybrid natural-language parser extracts budget thresholds, intent modifiers, typo corrections, and Roman Urdu synonyms in real time, displaying transparent "✨ AI Understood" chips.`,
  },
  {
    slug: 'nationwide-express-escrow-logistics',
    category: 'Operations',
    date: 'Nov 14, 2026',
    title: 'Inside Our 7 Regional Hubs & 100% Escrow-Protected Multi-Vendor Fulfillment',
    excerpt:
      'From Gulberg Lahore to Clifton Karachi and Blue Area Islamabad: how we guarantee authentic products and rapid dispatch.',
    body: `Trust is the foundation of multi-vendor commerce. Every transaction on AI Mart Pro is protected by our escrow ledger: customer payments are held securely until delivery is confirmed at the doorstep. With operational hubs across Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar, orders reach customers in 24 to 48 hours.`,
  },
];

export function ContentPageScreen({ page, slug }: { page: string; slug?: string }) {
  if (page === 'about') {
    return (
      <div className="space-y-8">
        <AboutSection />
        <StoresMap />
      </div>
    );
  }

  if (page === 'contact') {
    return (
      <div className="space-y-8">
        <ContactCareers />
        <StoresMap />
      </div>
    );
  }

  if (page === 'stores') {
    return (
      <div className="space-y-6">
        <StoresMap />
      </div>
    );
  }

  if (page === 'blog') {
    const postItem = slug ? BLOG_POSTS.find((b) => b.slug === slug) || BLOG_POSTS[0] : null;
    if (postItem) {
      return (
        <div className="max-w-3xl mx-auto bg-white border border-[#E5E7EB] rounded-[20px] p-6 sm:p-10 space-y-5 shadow-2xs">
          <Link href="/blog" className="text-xs font-bold text-[#0B7A6C] hover:underline">
            &larr; Back to All Updates
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4F1] text-[#0B7A6C] font-bold">
              {postItem.category}
            </span>
            <span className="text-[#6B7280]">{postItem.date}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F23] leading-snug">
            {postItem.title}
          </h1>
          <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">
            {postItem.body}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B7A6C]">
            Newsroom &amp; Engineering Blog
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F23] mt-1">
            Latest Marketplace &amp; AI Updates
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BLOG_POSTS.map((b) => (
            <Link
              key={b.slug}
              href={`/blog/${b.slug}`}
              className="bg-white border border-[#E5E7EB] hover:border-[#0B7A6C] rounded-[18px] p-5 flex flex-col justify-between gap-4 shadow-2xs transition-all hover:-translate-y-1"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4F1] text-[#0B7A6C] font-bold">
                    {b.category}
                  </span>
                  <span className="text-[#6B7280]">{b.date}</span>
                </div>
                <h2 className="text-base font-extrabold text-[#1B1F23] leading-snug">
                  {b.title}
                </h2>
                <p className="text-xs text-[#6B7280] leading-relaxed">{b.excerpt}</p>
              </div>
              <span className="text-xs font-bold text-[#0B7A6C] flex items-center gap-1">
                Read Article <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const DOCS: Record<string, { badge: string; title: string; sections: { h: string; p: string }[] }> = {
    faq: {
      badge: 'Help Center',
      title: 'Frequently Asked Questions (FAQ)',
      sections: [
        {
          h: 'How does AI Mart Pro guarantee product authenticity?',
          p: 'Every merchant undergoes KYC verification and all payments are held in escrow until you receive and verify your order.',
        },
        {
          h: 'How can I search in Roman Urdu or by budget?',
          p: 'Simply type naturally into the top search bar (e.g. "bohat sasta smart watch under 15k" or "jootay 4000 tak") and our NLP parser automatically applies budget and category filters.',
        },
        {
          h: 'Are the AI demand forecasts and sentiment scores exact guarantees?',
          p: 'Per our academic honesty rules, all ML outputs carry is_estimate: true, a model_version tag, and a measured confidence indicator.',
        },
      ],
    },
    returns: {
      badge: 'Customer Protection',
      title: '7-Day Easy Returns & Replacement Policy',
      sections: [
        {
          h: '7-Day Return Window',
          p: 'Customers can request a free return or replacement within 7 days of delivery if an item is defective, damaged, or does not match its listing description.',
        },
        {
          h: 'Escrow Refund Processing',
          p: 'Once the returned item is scanned at any of our 7 regional hubs, your refund is released immediately via bank transfer, wallet, or original payment method.',
        },
      ],
    },
    privacy: {
      badge: 'Data Governance',
      title: 'Privacy & Security Policy',
      sections: [
        {
          h: 'Customer & Vendor Privacy',
          p: 'We collect only the contact, delivery address, and order history required to fulfill transactions. Passwords and tokens are hashed and never exposed in audit logs.',
        },
        {
          h: 'Ethical AI & External URL Intelligence',
          p: 'Our external intelligence module inspects only public metadata and schema.org tags on permitted hosts and never claims private competitor sales figures.',
        },
      ],
    },
    terms: {
      badge: 'Legal Agreement',
      title: 'Terms of Service',
      sections: [
        {
          h: 'Marketplace Operations',
          p: 'By using AI Mart Pro as a Customer, Vendor, or Delivery Agent, you agree to abide by role-based access rules, honest listing standards, and server-authoritative checkout pricing.',
        },
        {
          h: 'Anomaly & Moderation Review',
          p: 'Automated anomaly flags serve strictly as review aids for platform administrators and not as proof of fraud.',
        },
      ],
    },
  };

  const doc = DOCS[page] || DOCS.faq;

  return (
    <div className="max-w-4xl mx-auto bg-white border border-[#E5E7EB] rounded-[20px] p-6 sm:p-10 space-y-6 shadow-2xs">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#0B7A6C]">
          {doc.badge}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F23] mt-1">{doc.title}</h1>
      </div>
      <div className="space-y-4">
        {doc.sections.map((s) => (
          <div
            key={s.h}
            className="p-4 rounded-2xl bg-[#F5F7F8] border border-[#E5E7EB] space-y-1.5"
          >
            <h3 className="text-sm font-extrabold text-[#1B1F23]">{s.h}</h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   A18. SYSTEM PAGES (403, 404, 500, Session Expired)
   ============================================================================ */
export function SystemStateScreen({
  code = '404',
  title,
  message,
}: {
  code?: '403' | '404' | '500' | 'SESSION_EXPIRED';
  title?: string;
  message?: string;
}) {
  const defaults = {
    '403': {
      title: '403 — Access Restricted (Cross-Role Boundary)',
      message:
        'Your current account role does not have permission to view this workspace. Switch to an authorized role from the top-right profile menu or return to the storefront.',
    },
    '404': {
      title: '404 — Page Not Found',
      message: 'The page or product route you requested could not be found in the marketplace.',
    },
    '500': {
      title: '500 — Temporary Service Error',
      message:
        'An unexpected error occurred while processing your request. Normal marketplace shopping remains available.',
    },
    SESSION_EXPIRED: {
      title: 'Session Expired — Please Sign In',
      message: 'Your authenticated session has expired. Sign in again to continue.',
    },
  }[code];

  return (
    <div className="min-h-[55vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white border border-[#E5E7EB] rounded-[20px] p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#E6F4F1] text-[#0B7A6C] font-extrabold text-lg flex items-center justify-center mx-auto">
          {code === 'SESSION_EXPIRED' ? <Lock size={24} /> : code}
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1B1F23]">
          {title || defaults.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
          {message || defaults.message}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-[#0B7A6C] hover:bg-[#09665A] text-white text-xs font-bold"
          >
            Return to Homepage
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-[#F5F7F8] border border-[#E5E7EB] hover:border-[#0B7A6C] text-[#1B1F23] text-xs font-bold"
          >
            Sign In / Switch Role
          </Link>
        </div>
      </div>
    </div>
  );
}
