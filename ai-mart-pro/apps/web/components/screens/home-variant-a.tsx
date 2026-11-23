'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Star,
  Headphones,
  RotateCcw,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ProductCard } from '@/components/aimart-ui';
import { DEMO_PRODUCTS } from '@/lib/demo-products';
import { api, Product, money, imageSrc } from '@/lib/api';
import { useApp } from '@/lib/app-context';

// Storefront Sections
import { ProductBanner } from '@/components/home/product-banner';
import { SearchSection } from '@/components/home/search-section';
import { StatsGlance } from '@/components/home/stats-glance';
import { AboutSection } from '@/components/home/about-section';
import { VendorsMarquee } from '@/components/home/vendors-marquee';
import { LatestUpdates } from '@/components/home/latest-updates';
import { StoresMap } from '@/components/home/stores-map';
import { ContactCareers } from '@/components/home/contact-careers';

// 12 Horizontal Category Tiles matching the Reference Picture (2 rows x 6 cols)
const PICTURE_CATEGORIES = [
  {
    name: 'Drones & Accessories',
    slug: 'electronics',
    query: 'camera',
    img: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Phones, Tablets & Accessories',
    slug: 'electronics',
    query: 'phone',
    active: true,
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Laptops & Computers',
    slug: 'electronics',
    query: 'keyboard',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Power Banks & Chargers',
    slug: 'electronics',
    query: 'charger',
    img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Apple Products',
    slug: 'electronics',
    query: 'apple',
    img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Wearable, Cameras & Action Cam',
    slug: 'electronics',
    query: 'watch',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Gaming Consoles',
    slug: 'electronics',
    query: 'gaming',
    img: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Home Appliances',
    slug: 'home-living',
    img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Televisions & Home Theater',
    slug: 'electronics',
    query: 'speaker',
    img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Game Controller',
    slug: 'electronics',
    query: 'keyboard',
    img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Storage & Digital Devices',
    slug: 'electronics',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Audio Equipments',
    slug: 'electronics',
    query: 'headphones',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
  },
];

const LIFESTYLE_PROMO_CARDS = [
  {
    badge: 'Enjoy 25% savings',
    title: 'Samsung QLED 4K Smart TV',
    sub: 'Free Shipping on over Rs. 5,000',
    bg: 'bg-[#BBF7D0]',
    img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&q=80',
    href: '/shop?q=tv',
  },
  {
    badge: 'Enjoy 25% savings',
    title: 'Sony Bravia XR Theater',
    sub: 'Free Shipping on over Rs. 5,000',
    bg: 'bg-[#FEF08A]',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
    href: '/shop?q=sony',
  },
  {
    badge: 'Enjoy 25% savings',
    title: 'iPhone 15 Pro Max Plus',
    sub: 'Free Shipping on over Rs. 5,000',
    bg: 'bg-[#FBCFE8]',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80',
    href: '/shop?q=apple',
  },
  {
    badge: 'Enjoy 25% savings',
    title: 'Samsung Smart Workspace',
    sub: 'Free Shipping on over Rs. 5,000',
    bg: 'bg-[#BAE6FD]',
    img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80',
    href: '/shop?q=keyboard',
  },
];

export function HomeVariantA() {
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [heroIdx, setHeroIdx] = useState(0);
  const [stealTab, setStealTab] = useState<'all' | 'phones' | 'camera' | 'headphone'>('all');
  const [countdown, setCountdown] = useState({ days: 29, hours: 27, mins: 27, secs: 51 });

  useEffect(() => {
    void api<{ products: Product[] }>('/api/products?limit=40')
      .then((res) => {
        if (res?.products?.length) setProducts(res.products);
      })
      .catch(() => {});
  }, []);

  // 2-Second Auto-Rotating Hero Product Image Timer (as requested earlier!)
  useEffect(() => {
    const t = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % Math.min(6, products.length || 1));
    }, 2000);
    return () => clearInterval(t);
  }, [products.length]);

  // Live Countdown Timer
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        return { days: 29, hours: 23, mins: 59, secs: 59 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const heroProducts = products.slice(0, 6);
  const activeHeroProd = heroProducts[heroIdx] || DEMO_PRODUCTS[0];

  const limitedSteals = React.useMemo(() => {
    if (stealTab === 'headphone') {
      return products
        .filter((p) => p.name.toLowerCase().includes('headphone') || p.name.toLowerCase().includes('airpod'))
        .concat(products)
        .slice(0, 10);
    }
    if (stealTab === 'camera') {
      return products.slice(2, 12);
    }
    if (stealTab === 'phones') {
      return products.slice(1, 11);
    }
    return products.slice(0, 10);
  }, [products, stealTab]);

  const theaterMiniProducts = products.slice(0, 9);
  const dealsOfTheDay = products.slice(0, 2);

  return (
    <div className="relative min-h-screen text-[#1B1F23] space-y-10 pb-8">
      {/* =====================================================================
          1. HERO BANNER ("Gadgets That Make Life Easier" — Exact Picture Theme)
             with 2-Second Auto-Rotating Product Showcase & Bottom Notch Dots
          ===================================================================== */}
      <section
        style={{
          background: 'linear-gradient(125deg, #4286B1 0%, #68A6CC 52%, #8BC1DF 100%)',
        }}
        className="relative w-full rounded-[24px] overflow-hidden px-6 sm:px-12 py-10 sm:py-14 text-white shadow-md"
      >
        {/* Subtle Ambient Light Rings */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 rounded-full bg-[#0B7A6C]/20 blur-3xl pointer-events-none" />

        {/* Left & Right Carousel Arrows */}
        <button
          type="button"
          onClick={() => setHeroIdx((prev) => (prev - 1 + heroProducts.length) % heroProducts.length)}
          aria-label="Previous hero slide"
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-xs items-center justify-center text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => setHeroIdx((prev) => (prev + 1) % heroProducts.length)}
          aria-label="Next hero slide"
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-xs items-center justify-center text-white transition-colors cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Copy Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/95">
              <span>Exclusive offer</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white text-[11px] font-extrabold">
                -20% Off
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                Auto-rotates every 2s
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.14]">
              Gadgets That <br className="hidden sm:inline" />
              Make Life Easier
            </h1>

            <p className="text-xs sm:text-sm text-white/90 max-w-lg leading-relaxed">
              Find the latest tech, accessories, and smart gadgets in one place — powered by AI Mart Pro&apos;s verified multi-vendor logistics across Pakistan.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2.5 pl-5 pr-2.5 py-2 rounded-full bg-[#FFC531] hover:bg-[#FFD15C] text-[#1B1F23] text-xs font-extrabold shadow-md transition-transform hover:scale-105"
              >
                <span>Shop Now</span>
                <span className="w-6 h-6 rounded-full bg-[#1B1F23] text-white flex items-center justify-center">
                  <ArrowUpRight size={13} />
                </span>
              </Link>

              <Link
                href={`/product/${activeHeroProd.slug || activeHeroProd.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white text-xs font-bold transition-colors"
              >
                <span>Viewing: {activeHeroProd.name.slice(0, 28)}...</span>
                <span className="font-extrabold text-[#FFC531]">{money(activeHeroProd.price)}</span>
              </Link>
            </div>
          </div>

          {/* Right 2-Second Rotating Product Image Stage (5 cols) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-[380px] h-[250px] sm:h-[280px] rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 p-4 flex flex-col justify-between shadow-xl">
              {/* 2-Second Progress Indicator */}
              <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden">
                <motion.div
                  key={heroIdx}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'linear' }}
                  className="h-full bg-[#FFC531]"
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeHeroProd.id}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="flex-1 flex items-center justify-center overflow-hidden py-2"
                >
                  <img
                    src={imageSrc(activeHeroProd)}
                    alt={activeHeroProd.name}
                    className="max-h-[165px] w-auto object-contain rounded-xl drop-shadow-[0_14px_24px_rgba(0,0,0,0.28)]"
                  />
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between gap-2 bg-white/95 text-[#1B1F23] px-3.5 py-2 rounded-xl">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold truncate">{activeHeroProd.name}</p>
                  <span className="text-xs font-extrabold text-[#0B7A6C]">
                    {money(activeHeroProd.price)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(activeHeroProd, 1)}
                  className="px-3 py-1.5 rounded-full bg-[#0B7A6C] hover:bg-[#09665A] text-white text-[11px] font-bold flex-shrink-0 cursor-pointer"
                >
                  + Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Center White Cutout Notch with Pill Dots (Exact Picture Detail) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#F5F7F8] px-5 py-2 rounded-t-2xl flex items-center gap-1.5 z-20">
          {heroProducts.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setHeroIdx(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === heroIdx ? 'w-6 bg-[#0B7A6C]' : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]'
              }`}
            />
          ))}
        </div>
      </section>

      {/* =====================================================================
          2. 12 HORIZONTAL CATEGORY TILES (2 Rows x 6 Cols — Exact Picture Layout)
          ===================================================================== */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {PICTURE_CATEGORIES.map((cat, idx) => {
          const href = cat.query
            ? `/shop?q=${encodeURIComponent(cat.query)}&category=${cat.slug}`
            : `/category/${cat.slug}`;
          return (
            <Link
              key={idx}
              href={href}
              className={`group flex items-center gap-3 p-3 rounded-xl bg-white border transition-all hover:shadow-md ${
                cat.active
                  ? 'border-[#0B7A6C] ring-1 ring-[#0B7A6C]/20'
                  : 'border-[#E5E7EB] hover:border-[#0B7A6C]'
              }`}
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-11 h-11 rounded-lg object-cover bg-[#F8FAFC] flex-shrink-0 group-hover:scale-105 transition-transform"
              />
              <span
                className={`text-xs font-bold leading-snug line-clamp-2 ${
                  cat.active
                    ? 'text-[#0B7A6C]'
                    : 'text-[#1B1F23] group-hover:text-[#0B7A6C]'
                }`}
              >
                {cat.name}
              </span>
            </Link>
          );
        })}
      </section>

      {/* =====================================================================
          3. LIMITED-TIME STEALS (5-Column Product Grid = 10 Cards)
          ===================================================================== */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B1F23]">
              Limited-Time Steals
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Up to 50% discount for limited time 🔥
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Yellow Countdown Pill */}
            <span className="px-3.5 py-1.5 rounded-full bg-[#FEF08A] text-[#1B1F23] text-xs font-extrabold">
              End in {String(countdown.hours).padStart(2, '0')} :{' '}
              {String(countdown.mins).padStart(2, '0')} :{' '}
              {String(countdown.secs).padStart(2, '0')}
            </span>

            {/* Teal View All Pill */}
            <Link
              href="/deals"
              className="px-4 py-1.5 rounded-full bg-[#0B7A6C] hover:bg-[#09665A] text-white text-xs font-bold transition-colors"
            >
              View All
            </Link>

            {/* Category Tab Links */}
            {(
              [
                { id: 'all', label: 'All Steals' },
                { id: 'phones', label: 'Smart Phones' },
                { id: 'camera', label: 'Camera' },
                { id: 'headphone', label: 'Headphone' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setStealTab(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  stealTab === t.id
                    ? 'text-[#0B7A6C] bg-[#E6F4F1]'
                    : 'text-[#6B7280] hover:text-[#1B1F23]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Column Product Grid (2 Rows = 10 Items) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {limitedSteals.map((p, idx) => (
            <ProductCard
              key={`${p.id}-${idx}`}
              product={p}
              isWished={wishlist.includes(p.id)}
              onToggleWishlist={() => toggleWishlist(p.id, p)}
              onAddToCart={() => addToCart(p, 1)}
              showProgressBar={true}
              soldPercent={68 + ((idx * 7) % 28)}
            />
          ))}
        </div>
      </section>

      {/* =====================================================================
          4. "HURRY! LIMITED DEALS" PURPLE GRADIENT BANNER WITH PASTEL BOXES
          ===================================================================== */}
      <section
        style={{
          background: 'linear-gradient(135deg, #6D28D9 0%, #9333EA 50%, #D946EF 100%)',
        }}
        className="relative rounded-[24px] p-6 sm:p-10 overflow-hidden shadow-md flex items-center justify-center"
      >
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        {/* Centered White Deal Card */}
        <div className="relative z-10 bg-white rounded-[22px] p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl space-y-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F23]">
              Hurry! Limited Deals
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Exclusive flash discounts on verified flagship electronics &amp; accessories
            </p>
          </div>

          {/* 4 Pastel Countdown Boxes (Green, Yellow, Pink, Cyan) */}
          <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
            {[
              { val: countdown.days, label: 'Days', bg: 'bg-[#BBF7D0] text-[#14532D]' },
              { val: countdown.hours, label: 'Hours', bg: 'bg-[#FEF08A] text-[#713F12]' },
              { val: countdown.mins, label: 'Mins', bg: 'bg-[#FBCFE8] text-[#831843]' },
              { val: countdown.secs, label: 'Secs', bg: 'bg-[#BAE6FD] text-[#0C4A6E]' },
            ].map((b) => (
              <div key={b.label} className={`rounded-xl py-3 px-2 ${b.bg}`}>
                <span className="text-lg sm:text-xl font-extrabold block leading-none">
                  {String(b.val).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase mt-1 block opacity-80">
                  {b.label}
                </span>
              </div>
            ))}
          </div>

          <div>
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B7A6C] hover:bg-[#09665A] text-white text-xs font-extrabold shadow-md transition-transform hover:scale-105"
            >
              <span>Shop Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. VENDORS WE CARRY MARQUEE
          ===================================================================== */}
      <VendorsMarquee />

      {/* =====================================================================
          6. "BASSBOOST HOME THEATER SYSTEM" (3x3 Horizontal Mini Product Cards)
          ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1B1F23]">
            BassBoost Home Theater &amp; Flagship Audio
          </h2>
          <Link
            href="/shop"
            className="px-4 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#0B7A6C] bg-white text-xs font-bold text-[#1B1F23] hover:text-[#0B7A6C] transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {theaterMiniProducts.map((p) => {
            const disc =
              p.comparePrice && p.comparePrice > p.price
                ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
                : 15;
            return (
              <Link
                key={p.id}
                href={`/product/${p.slug || p.id}`}
                className="group bg-white border border-[#E5E7EB] hover:border-[#0B7A6C] rounded-2xl p-3.5 flex items-center gap-4 shadow-2xs hover:shadow-md transition-all"
              >
                <img
                  src={imageSrc(p)}
                  alt={p.name}
                  className="w-20 h-20 rounded-xl object-cover bg-[#F8FAFC] flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-[#E53935] text-white text-[9.5px] font-extrabold uppercase">
                    {disc}% Off
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1B1F23] group-hover:text-[#0B7A6C] truncate">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} className="fill-[#FFC531] text-[#FFC531]" />
                    ))}
                    <span className="text-[10px] text-[#6B7280]">({p.reviewCount || 120})</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-[#0B7A6C]">
                      {money(p.price)}
                    </span>
                    <s className="text-[11px] text-[#9CA3AF]">
                      {money(p.comparePrice || Math.round(p.price * 1.18))}
                    </s>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          7. FOUR VERTICAL LIFESTYLE PROMOTIONAL CARDS
          ===================================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LIFESTYLE_PROMO_CARDS.map((card, i) => (
          <div
            key={i}
            className="relative h-[300px] rounded-[20px] overflow-hidden border border-[#E5E7EB] group shadow-xs"
          >
            <img
              src={card.img}
              alt={card.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div
              className={`absolute inset-x-3 bottom-3 rounded-2xl p-4 ${card.bg} text-[#1B1F23] text-center space-y-1.5 shadow-lg`}
            >
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/80 text-[10px] font-extrabold">
                {card.badge}
              </span>
              <h3 className="text-sm font-extrabold leading-snug">{card.title}</h3>
              <p className="text-[11px] opacity-80">{card.sub}</p>
              <div className="pt-1">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0B7A6C] hover:bg-[#09665A] text-white text-[11px] font-bold"
                >
                  <span>See More Products</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* =====================================================================
          8. "DEALS OF THE DAY" (2 Large Horizontal Cards with Pink Accent Border)
          ===================================================================== */}
      <section className="space-y-5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B1F23] text-center">
          Deals of the day
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {dealsOfTheDay.map((p) => (
            <div
              key={p.id}
              className="bg-white border-2 border-[#FCA5A5] rounded-[22px] p-5 flex flex-col sm:flex-row items-center gap-6 shadow-xs"
            >
              <Link
                href={`/product/${p.slug || p.id}`}
                className="w-full sm:w-48 h-48 rounded-2xl bg-[#F8FAFC] p-3 flex items-center justify-center flex-shrink-0"
              >
                <img
                  src={imageSrc(p)}
                  alt={p.name}
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              </Link>

              <div className="flex-1 space-y-2.5 text-left">
                <span className="inline-block px-2.5 py-0.5 rounded bg-[#E53935] text-white text-[10px] font-extrabold uppercase">
                  25% Off
                </span>
                <Link
                  href={`/product/${p.slug || p.id}`}
                  className="block text-base font-extrabold text-[#1B1F23] hover:text-[#0B7A6C] line-clamp-1"
                >
                  {p.name}
                </Link>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-[#FFC531] text-[#FFC531]" />
                  ))}
                  <span className="text-xs text-[#6B7280]">({p.reviewCount || 120})</span>
                </div>

                {/* Color Swatch Dots */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {['bg-[#38BDF8]', 'bg-[#F43F5E]', 'bg-[#A855F7]', 'bg-[#10B981]'].map((c) => (
                    <span key={c} className={`w-3.5 h-3.5 rounded-full ${c} ring-1 ring-black/10`} />
                  ))}
                </div>

                {/* 4 Mini Countdown Boxes */}
                <div className="grid grid-cols-4 gap-2 pt-1 max-w-xs">
                  {[
                    { v: countdown.days, l: 'Days' },
                    { v: countdown.hours, l: 'Hours' },
                    { v: countdown.mins, l: 'Mins' },
                    { v: countdown.secs, l: 'Secs' },
                  ].map((b) => (
                    <div
                      key={b.l}
                      className="rounded-lg bg-[#F5F7F8] border border-[#E5E7EB] py-1.5 text-center"
                    >
                      <span className="text-xs font-extrabold text-[#1B1F23] block leading-none">
                        {String(b.v).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-[#6B7280]">{b.l}</span>
                    </div>
                  ))}
                </div>

                {/* Price + Teal Pill Add to Cart */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-base font-extrabold text-[#0B7A6C]">
                      {money(p.price)}
                    </span>
                    <s className="text-xs text-[#9CA3AF] ml-2">
                      {money(p.comparePrice || Math.round(p.price * 1.2))}
                    </s>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(p, 1)}
                    className="px-4 py-2 rounded-full bg-[#0B7A6C] hover:bg-[#09665A] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag size={13} />
                    <span>Add To Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          9. THREE COLORFUL FEATURE PROMO BANNERS (Purple, Coral Red, Amber)
          ===================================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}
          className="rounded-[20px] p-6 text-white flex flex-col justify-between min-h-[210px] relative overflow-hidden shadow-sm"
        >
          <div className="space-y-1.5 relative z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
              Over 2500+ Products
            </span>
            <h3 className="text-xl font-extrabold">Audio Essentials</h3>
            <p className="text-xs text-white/80">Save on our most popular ANC audio gear</p>
          </div>
          <Link
            href="/shop?q=headphones"
            className="w-fit px-4 py-2 rounded-full bg-[#0B7A6C] hover:bg-[#09665A] text-white text-xs font-bold flex items-center gap-1.5 relative z-10"
          >
            <span>Shop Now</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div
          style={{ background: 'linear-gradient(135deg, #E11D48, #F43F5E)' }}
          className="rounded-[20px] p-6 text-white flex flex-col justify-between min-h-[210px] relative overflow-hidden shadow-sm"
        >
          <div className="space-y-1.5 relative z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFC531] text-[#1B1F23] text-[10px] font-extrabold">
              Up to 25% Off
            </span>
            <h3 className="text-xl font-extrabold">New Smart Watch</h3>
            <p className="text-xs text-white/85">Save on flagship AMOLED wearables</p>
          </div>
          <Link
            href="/shop?q=watch"
            className="w-fit px-4 py-2 rounded-full bg-[#0B7A6C] hover:bg-[#09665A] text-white text-xs font-bold flex items-center gap-1.5 relative z-10"
          >
            <span>Shop Now</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div
          style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}
          className="rounded-[20px] p-6 text-white flex flex-col justify-between min-h-[210px] relative overflow-hidden shadow-sm"
        >
          <div className="space-y-1.5 relative z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1B1F23] text-[#FFC531] text-[10px] font-extrabold">
              New Arrivals
            </span>
            <h3 className="text-xl font-extrabold">Smart Mobile Devices</h3>
            <p className="text-xs text-white/90">Save on our most popular smartphones</p>
          </div>
          <Link
            href="/shop"
            className="w-fit px-4 py-2 rounded-full bg-[#0B7A6C] hover:bg-[#09665A] text-white text-xs font-bold flex items-center gap-1.5 relative z-10"
          >
            <span>Shop Now</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* =====================================================================
          10. FEATURED PRODUCT PICTURE BANNER & NL SEARCH BAR
          ===================================================================== */}
      <ProductBanner products={products} />
      <SearchSection />

      {/* =====================================================================
          11. STATS GLANCE, ABOUT, LATEST UPDATES, MAPTILER STORES, CONTACT
          ===================================================================== */}
      <StatsGlance />
      <AboutSection />
      <LatestUpdates />
      <StoresMap />
      <ContactCareers />

      {/* =====================================================================
          12. FOUR PASTEL SERVICE / TRUST CARDS (Exact Bottom Row of Picture)
          ===================================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Truck,
            title: 'Free Shipping',
            desc: 'Enjoy the convenience of free shipping on all orders over Rs. 5,000',
            bg: 'bg-[#A5F3FC]/70 border-[#67E8F9]',
          },
          {
            icon: Headphones,
            title: '24/7 Support',
            desc: 'Reach out to our dedicated AI & human support team anytime',
            bg: 'bg-[#FEF08A]/80 border-[#FDE047]',
          },
          {
            icon: RotateCcw,
            title: '30 Days Return',
            desc: 'Simply return it within 30 days for an instant escrow exchange',
            bg: 'bg-[#FECDD3]/75 border-[#FDA4AF]',
          },
          {
            icon: ShieldCheck,
            title: 'Secure Payment',
            desc: '100% escrow protected multi-vendor payment gateway',
            bg: 'bg-[#BBF7D0]/80 border-[#86EFAC]',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`rounded-[18px] border p-5 text-center flex flex-col items-center gap-2 ${item.bg}`}
            >
              <div className="w-10 h-10 rounded-full bg-white/80 text-[#1B1F23] flex items-center justify-center shadow-2xs">
                <Icon size={20} />
              </div>
              <h3 className="text-sm font-extrabold text-[#1B1F23]">{item.title}</h3>
              <p className="text-xs text-[#1B1F23]/80 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default HomeVariantA;
