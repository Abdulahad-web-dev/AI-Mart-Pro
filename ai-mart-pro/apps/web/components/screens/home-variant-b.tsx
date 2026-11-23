'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Smartphone, Shirt, Armchair, Sparkles, Dumbbell, Gamepad2, BookOpen,
  ShoppingBasket, ArrowRight, MapPin, User, ShoppingBag, Search, Zap
} from 'lucide-react';
import { Button, ProductCard, easeCurve } from '@/components/aimart-ui';
import { useApp } from '@/lib/app-context';
import { DEMO_PRODUCTS } from '@/lib/demo-products';

export function HomeVariantB() {
  const shouldReduceMotion = useReducedMotion();
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const trendingProducts = DEMO_PRODUCTS.slice(4, 8);
  const [slide, setSlide] = useState(0);

  // Live countdown timer: ends in 04:22:59
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 22, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 22, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3 Hero Carousel slides
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setSlide((s) => (s + 1) % 3);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  const heroSlides = [
    {
      titleWhite: 'Next-Gen Tech.',
      titleOrange: 'Unrivaled Performance.',
      desc: 'Discover the pinnacle of modern electronics designed for the intelligent home and workspace.',
      cta: 'Shop The Collection',
      href: '/shop?category=electronics',
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80'
    },
    {
      titleWhite: 'Autonomous Gear.',
      titleOrange: 'Precision Audio.',
      desc: 'Engineered for audiophiles and digital creators demanding spatial clarity and zero compromise.',
      cta: 'Explore Audio Lab',
      href: '/shop?category=electronics',
      img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80'
    },
    {
      titleWhite: 'Smart Living.',
      titleOrange: 'Intelligent Space.',
      desc: 'Elevate your daily environment with adaptive ambient illumination and connected home sensors.',
      cta: 'Browse Smart Home',
      href: '/shop?category=home-living',
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80'
    }
  ];

  const currentSlide = heroSlides[slide];

  const pad = (n: number) => n.toString().padStart(2, '0');
  const countdownStr = `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`;

  // 8 Categories
  const categories = [
    { name: 'Electronics', icon: <Smartphone size={22} />, slug: 'electronics' },
    { name: 'Fashion', icon: <Shirt size={22} />, slug: 'fashion' },
    { name: 'Home', icon: <Armchair size={22} />, slug: 'home-living' },
    { name: 'Beauty', icon: <Sparkles size={22} />, slug: 'beauty' },
    { name: 'Sports', icon: <Dumbbell size={22} />, slug: 'sports' },
    { name: 'Toys', icon: <Gamepad2 size={22} />, slug: 'electronics' },
    { name: 'Books', icon: <BookOpen size={22} />, slug: 'books' },
    { name: 'Grocery', icon: <ShoppingBasket size={22} />, slug: 'home-living' }
  ];

  return (
    <div className="min-h-screen bg-[#E6F4F1] text-[#171717] pb-16 font-sans">
      {/* Top Header for Variant B (with logo mark, location, orange Login) */}
      <header className="sticky top-0 z-40 bg-[#E6F4F1]/90 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between gap-6">
          {/* Logo Mark + AI MART */}
          <Link href="/home-b" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-[8px] bg-[#E6F4F1] border border-[#E5E7EB] flex items-center justify-center font-extrabold text-[#0B7A6C] text-lg shadow-inner">
              <Zap size={22} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-extrabold tracking-[-0.02em] leading-none text-[#171717]">
                AI <span className="text-[#0B7A6C]">MART</span>
              </div>
              <span className="text-[10px] text-[#0B7A6C] uppercase tracking-[0.1em] font-bold">
                Deals Edition
              </span>
            </div>
          </Link>

          {/* Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#525252]">
            <Link href="/shop" className="hover:text-white transition-colors">
              Categories
            </Link>
            <Link href="/shop?sort=best" className="hover:text-white transition-colors">
              Trending
            </Link>
            <Link href="/shop" className="hover:text-white transition-colors">
              Brands
            </Link>
          </nav>

          {/* Wide Search Bar */}
          <div className="flex-1 max-w-md hidden md:flex items-center bg-[#F8FAFC] border border-[#E5E7EB] rounded-[8px] px-3.5 h-10 focus-within:border-[#0B7A6C]">
            <Search size={16} className="text-[#737373] mr-2" />
            <input
              type="text"
              placeholder="Search premium products..."
              className="bg-transparent text-sm text-[#171717] placeholder-[#737373] outline-none w-full"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#525252]">
              <MapPin size={15} className="text-[#0B7A6C]" />
              <span>Lahore, PK</span>
            </div>
            <Link href="/cart" className="relative p-2 text-[#525252] hover:text-white">
              <ShoppingBag size={20} />
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#0B7A6C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </Link>
            <Link href="/login">
              <Button
                variant="primary"
                size="sm"
                className="bg-[#0B7A6C] hover:bg-[#09665A] text-white font-bold px-4"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1200px] mx-auto px-6 pt-8 space-y-12">
        {/* Hero Card with Product image, orange-teal rim streaks, left overlay */}
        <div className="relative rounded-[14px] border border-[#E5E7EB] overflow-hidden min-h-[460px] lg:min-h-[500px] flex items-center p-8 lg:p-14 shadow-2xl">
          {/* Background Crossfading Images */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: easeCurve }}
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${currentSlide.img}')`,
                filter: 'brightness(0.38) contrast(1.1)'
              }}
            />
          </AnimatePresence>

          {/* Orange/Teal Light Streaks & Vignette */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#E6F4F1] via-[#E6F4F1]/75 to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_center,rgba(236,106,5,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Left Overlay Content */}
          <div className="relative z-10 max-w-xl">
            {/* Live Countdown Pill */}
            <div className="inline-flex items-center gap-2 bg-[#0B7A6C] text-white text-xs font-black uppercase px-3 py-1.5 rounded-full tracking-wider shadow-lg mb-6">
              <Zap size={14} fill="currentColor" />
              <span>FLASH SALE ENDS IN</span>
              <span className="font-mono bg-black/25 px-1.5 py-0.5 rounded text-white">
                {countdownStr}
              </span>
            </div>

            {/* H1 Heading */}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4 text-white">
              {currentSlide.titleWhite}{' '}
              <span className="text-[#0B7A6C]">{currentSlide.titleOrange}</span>
            </h1>

            {/* Description */}
            <p className="text-base text-[#525252] leading-relaxed mb-8 max-w-md">
              {currentSlide.desc}
            </p>

            {/* Orange CTA Button */}
            <Link href={currentSlide.href}>
              <Button
                variant="primary"
                size="lg"
                iconRight={<ArrowRight size={18} />}
                className="bg-[#0B7A6C] hover:bg-[#09665A] text-white font-extrabold px-7 shadow-[0_6px_20px_rgba(236,106,5,0.35)]"
              >
                {currentSlide.cta}
              </Button>
            </Link>
          </div>

          {/* Carousel Dashes Bottom Center */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slide ? 'w-8 bg-[#0B7A6C]' : 'w-2 bg-[#737373]/60 hover:bg-[#737373]'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Explore Categories Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#171717] tracking-tight">
              Explore Categories
            </h2>
            <Link
              href="/shop"
              className="text-sm font-semibold text-[#0B7A6C] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {/* 8 Category Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05, ease: easeCurve }}
                whileHover={shouldReduceMotion ? {} : { y: -4 }}
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="flex flex-col items-center justify-center p-5 rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#0B7A6C] hover:shadow-[0_8px_20px_rgba(236,106,5,0.2)] transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-[10px] bg-[#E6F4F1] border border-[#E5E7EB] flex items-center justify-center text-[#0B7A6C] group-hover:scale-110 transition-transform mb-3">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-semibold text-[#171717] group-hover:text-[#0B7A6C] transition-colors">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending Tech & Bestsellers Section */}
        <section className="space-y-6 pt-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#0B7A6C] font-semibold">
                Algorithmic Picks
              </span>
              <h2 className="text-2xl font-bold text-[#171717] tracking-tight mt-0.5">
                Trending Electronics &amp; Essentials
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-[#0B7A6C] hover:underline flex items-center gap-1"
            >
              Explore Full Catalog ({DEMO_PRODUCTS.length} Items) <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                badge={p.featured ? 'Trending' : undefined}
                isWished={wishlist.includes(p.id)}
                onToggleWishlist={() => toggleWishlist(p.id)}
                onAddToCart={() => addToCart(p, 1)}
              />
            ))}
          </div>
        </section>

        {/* Variant B Footer */}
        <footer className="pt-12 mt-16 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-4 gap-10 text-sm text-[#525252]">
          <div>
            <div className="text-xl font-bold text-[#171717] mb-3">AI MART</div>
            <p className="text-xs leading-relaxed mb-4">
              Pioneering intelligent, low-latency e-commerce across Pakistan with automated dispatch and verified merchant quality.
            </p>
            <div className="flex gap-2 text-xs font-bold">
              <span className="bg-[#FFFFFF] px-2 py-1 rounded border border-[#E5E7EB]">VISA</span>
              <span className="bg-[#FFFFFF] px-2 py-1 rounded border border-[#E5E7EB]">MC</span>
              <span className="bg-[#FFFFFF] px-2 py-1 rounded border border-[#E5E7EB]">COD</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider mb-3">Company</h4>
            <div className="flex flex-col gap-2 text-xs">
              <Link href="/about" className="hover:text-[#0B7A6C]">About AI MART</Link>
              <Link href="/about" className="hover:text-[#0B7A6C]">Help Center</Link>
              <Link href="/register?role=VENDOR" className="hover:text-[#0B7A6C]">Partner with Us</Link>
              <Link href="/about" className="hover:text-[#0B7A6C]">Legal &amp; Compliance</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider mb-3">Support</h4>
            <div className="flex flex-col gap-2 text-xs">
              <Link href="/about" className="hover:text-[#0B7A6C]">Contact Us</Link>
              <Link href="/orders" className="hover:text-[#0B7A6C]">Returns &amp; Exchanges</Link>
              <Link href="/track-order" className="hover:text-[#0B7A6C]">Shipping Information</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider mb-3">Stay Connected</h4>
            <p className="text-xs mb-3">Subscribe to get flash sale notifications first.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[6px] px-3 py-2 text-xs text-[#171717] outline-none flex-1"
              />
              <Button
                variant="primary"
                size="sm"
                className="bg-[#0B7A6C] hover:bg-[#09665A] text-white font-bold"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

