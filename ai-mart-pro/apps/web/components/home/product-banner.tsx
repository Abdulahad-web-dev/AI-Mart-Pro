'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Tag } from 'lucide-react';
import { Product, money } from '@/lib/api';
import { DEMO_PRODUCTS } from '@/lib/demo-products';

export interface ProductBannerProps {
  products?: Product[];
  className?: string;
}

export function ProductBanner({ products, className = '' }: ProductBannerProps) {
  const shouldReduceMotion = useReducedMotion();

  // Curate 5-8 featured flagship products
  const bannerProducts = React.useMemo(() => {
    if (products && products.length > 0) {
      return products.slice(0, 8);
    }
    const featured = DEMO_PRODUCTS.filter((p) => p.featured || p.rating >= 4.7);
    return featured.length >= 5 ? featured.slice(0, 7) : DEMO_PRODUCTS.slice(0, 7);
  }, [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = bannerProducts.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // 3.5s Auto-cycle with pause on hover/focus
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => clearInterval(timer);
  }, [total, isPaused, nextSlide]);

  if (total === 0) return null;

  const current = bannerProducts[currentIndex];
  const imageUrl =
    current.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85';

  return (
    <section
      aria-label="Featured Product Showcase"
      className={`relative w-full max-w-6xl mx-auto px-4 sm:px-6 my-6 md:my-10 ${className}`}
    >
      <div
        className="group relative w-full h-[240px] md:h-[380px] rounded-3xl overflow-hidden bg-[#171a20] shadow-[0_16px_45px_rgba(24,31,42,0.12)] border border-[#171a20]/10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') nextSlide();
          if (e.key === 'ArrowLeft') prevSlide();
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured products banner"
      >
        {/* Dynamic Image Slides with Ken Burns Zoom & Cross-Fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.3 : 1.0,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 w-full h-full"
          >
            <motion.div
              animate={shouldReduceMotion ? {} : { scale: [1, 1.1] }}
              transition={{
                duration: 7,
                ease: 'linear'
              }}
              className="relative w-full h-full"
            >
              <img
                src={imageUrl}
                alt={current.name}
                className="w-full h-full object-cover object-center select-none"
                loading={currentIndex === 0 ? 'eager' : 'lazy'}
              />
              {/* Subtle Gradient Overlays for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Clickable Full Link Overlay */}
        <Link
          href={`/product/${current.slug || current.id}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${current.name}`}
        />

        {/* Small Glass Label Bottom-Left */}
        <motion.div
          key={`label-${current.id}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 pointer-events-none max-w-[calc(100%-120px)] sm:max-w-md"
        >
          <div className="backdrop-blur-xl bg-white/90 border border-white/60 rounded-2xl p-3 sm:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.18)] text-[#171717]">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0B7A6C]/15 text-[#0B7A6C] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <Sparkles size={11} className="animate-pulse" />
                Featured Flagship
              </span>
              <span className="text-[11px] text-[#737373] hidden sm:inline">
                {current.category?.name || 'Electronics'}
              </span>
            </div>
            <h3 className="font-manrope font-extrabold text-sm sm:text-base text-[#171717] leading-snug line-clamp-1">
              {current.name}
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-manrope font-extrabold text-base sm:text-lg text-[#0B7A6C]">
                {money(current.price)}
              </span>
              {current.comparePrice && current.comparePrice > current.price && (
                <span className="text-xs text-[#737373] line-through font-normal">
                  {money(current.comparePrice)}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Round Prev / Next Navigation Arrows (Appear on Hover) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-[#0B7A6C] text-white backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300 shadow-md cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-[#0B7A6C] text-white backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300 shadow-md cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronRight size={20} />
        </button>

        {/* Clickable Dots Bottom-Right (Active dot stretches into pill) */}
        <div
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-1.5 backdrop-blur-md bg-black/35 px-3 py-1.5 rounded-full border border-white/15"
          role="tablist"
          aria-label="Slide indicators"
        >
          {bannerProducts.map((p, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${idx + 1}: ${p.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-6 sm:w-7 bg-gradient-to-r from-[#0B7A6C] to-[#09665A] shadow-sm'
                    : 'w-2 bg-white/50 hover:bg-white'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProductBanner;
