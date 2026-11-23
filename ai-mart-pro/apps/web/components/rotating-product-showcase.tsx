'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Zap, Sparkles, ArrowRight, ShieldCheck, Flame, Check } from 'lucide-react';
import { Button } from '@/components/aimart-ui';
import { useApp } from '@/lib/app-context';
import { Product } from '@/lib/api';

export interface RotatingProductShowcaseProps {
  products: Product[];
  intervalMs?: number;
  className?: string;
}

export function RotatingProductShowcase({
  products,
  intervalMs = 2000,
  className = ''
}: RotatingProductShowcaseProps) {
  const { addToCart, setToast } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Safety list check
  const list = products && products.length > 0 ? products.slice(0, 8) : [];
  const currentProduct = list[currentIndex] || list[0];

  // 2-Second Auto-Rotation Timer
  useEffect(() => {
    if (list.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [list.length, intervalMs, isPaused]);

  if (!currentProduct) return null;

  const currentImage =
    currentProduct.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

  const discountPct =
    currentProduct.comparePrice && currentProduct.comparePrice > currentProduct.price
      ? Math.round(((currentProduct.comparePrice - currentProduct.price) / currentProduct.comparePrice) * 100)
      : null;

  const handleAddToCart = () => {
    addToCart(currentProduct, 1);
    setToast(`Added to cart: ${currentProduct.name}`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto text-left ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic 2-Second Linear Progress Bar */}
      <div className="w-full h-1.5 bg-[#0B7A6C]/15 rounded-full overflow-hidden mb-3 relative shadow-inner">
        <motion.div
          key={`${currentIndex}-${isPaused}`}
          initial={{ width: '0%' }}
          animate={{ width: isPaused ? undefined : '100%' }}
          transition={{
            duration: isPaused ? 0 : intervalMs / 1000,
            ease: 'linear'
          }}
          className="h-full bg-gradient-to-r from-[#0B7A6C] via-[#09665A] to-[#f59e0b] rounded-full shadow-[0_0_10px_#0B7A6C]"
        />
      </div>

      {/* Main Glassmorphic Showcase Stage */}
      <div className="relative rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#A7F3D0] shadow-[0_20px_60px_-15px_rgba(11, 122, 108,0.22)] p-4 sm:p-6 md:p-7 overflow-hidden transition-all duration-300 hover:shadow-[0_28px_70px_-12px_rgba(11, 122, 108,0.32)] hover:border-[#0B7A6C]">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-gradient-to-br from-[#0B7A6C]/20 to-[#09665A]/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-80 h-80 rounded-full bg-gradient-to-tr from-[#f59e0b]/20 to-[#0B7A6C]/5 blur-3xl pointer-events-none" />

        {/* Top Header Row of the Showcase Card */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#A7F3D0] text-[#0B7A6C] text-[11px] font-bold tracking-wide uppercase shadow-sm">
              <Flame size={13} className="text-[#0B7A6C] animate-pulse" />
              <span>Live Flagship Spotlight</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#525252] font-semibold bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#e5e7eb]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]" />
              </span>
              Auto-changes every 2s {isPaused ? '(Paused)' : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#525252] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#e5e7eb]">
            <span className="text-[#0B7A6C] font-bold text-sm font-manrope">{currentIndex + 1}</span>
            <span className="text-[#a3a3a3]">/</span>
            <span className="font-manrope">{list.length}</span>
          </div>
        </div>

        {/* Content Grid: Left Image with Animated Transitions & Right Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Column: Rotating Product Image (6 cols) */}
          <div className="md:col-span-6 relative flex items-center justify-center min-h-[240px] sm:min-h-[280px] rounded-2xl bg-gradient-to-b from-[#f8fafc] via-[#ffffff] to-[#E6F4F1]/60 p-4 border border-[#A7F3D0]/70 overflow-hidden group">
            {/* Soft Ambient Inner Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-[#E6F4F1]/50 to-transparent pointer-events-none" />

            {/* Framer Motion Crossfade Image Transition */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.06, y: -12 }}
                transition={{
                  duration: 0.38,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="relative z-10 w-full h-[200px] sm:h-[240px] flex items-center justify-center"
              >
                <img
                  src={currentImage}
                  alt={currentProduct.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_16px_28px_rgba(0,0,0,0.14)] group-hover:scale-105 transition-transform duration-500 select-none"
                  loading="eager"
                />
              </motion.div>
            </AnimatePresence>

            {/* Floating Top-Left Tag: Category */}
            <div className="absolute top-3 left-3 z-20">
              <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-[#A7F3D0] text-[10px] font-bold uppercase tracking-wider text-[#171717] shadow-sm font-manrope">
                {currentProduct.category?.name || 'Electronics'}
              </span>
            </div>

            {/* Floating Bottom-Right Tag: Discount */}
            {discountPct && (
              <div className="absolute bottom-3 right-3 z-20">
                <span className="px-2.5 py-1 rounded-lg bg-[#0B7A6C] text-white text-[11px] font-extrabold tracking-wider shadow-md flex items-center gap-1 font-manrope">
                  <Zap size={11} fill="currentColor" /> {discountPct}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Product Meta & Fast Actions (6 cols) */}
          <div className="md:col-span-6 flex flex-col justify-between h-full space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-2.5"
              >
                {/* Rating & Stock Status */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[#f59e0b] text-xs font-bold bg-[#fef3c7] px-2.5 py-0.5 rounded-md">
                    <Star size={13} fill="currentColor" />
                    <span>{currentProduct.rating || 4.9}</span>
                    <span className="text-[#92400e] font-normal">({currentProduct.reviewCount || 42})</span>
                  </div>
                  <span className="text-xs text-[#16a34a] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" /> In Stock ({currentProduct.stock} left)
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#171717] tracking-tight leading-snug line-clamp-2 font-manrope">
                  {currentProduct.name}
                </h3>

                {/* Description Snippet */}
                <p className="text-xs sm:text-sm text-[#525252] leading-relaxed line-clamp-2 font-dmsans">
                  {currentProduct.description}
                </p>

                {/* Price Display in PKR */}
                <div className="pt-1 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0B7A6C] tracking-tight font-manrope">
                    Rs. {Number(currentProduct.price).toLocaleString()}
                  </span>
                  {currentProduct.comparePrice && currentProduct.comparePrice > currentProduct.price && (
                    <span className="text-xs sm:text-sm text-[#737373] line-through font-normal font-dmsans">
                      Rs. {Number(currentProduct.comparePrice).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Vendor & Escrow Verification */}
                <div className="flex items-center gap-2 pt-0.5 text-xs text-[#525252] font-dmsans">
                  <ShieldCheck size={14} className="text-[#16a34a]" />
                  <span>
                    Sold by{' '}
                    <strong className="text-[#171717]">
                      {currentProduct.vendor?.vendorProfile?.storeName || currentProduct.vendor?.name || 'Verified Partner'}
                    </strong>
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons Row */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={justAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                onClick={handleAddToCart}
                className="font-bold flex-1 shadow-[0_8px_22px_-6px_rgba(11, 122, 108,0.55)] hover:shadow-[0_12px_26px_-4px_rgba(11, 122, 108,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all bg-[#0B7A6C]"
              >
                {justAdded ? 'Added to Cart!' : 'Add to Cart'}
              </Button>
              <Link href={`/product/${currentProduct.slug || currentProduct.id}`} className="flex-1">
                <Button
                  variant="outline"
                  size="md"
                  iconRight={<ArrowRight size={15} />}
                  className="w-full font-semibold border-[#A7F3D0] hover:border-[#0B7A6C] hover:bg-[#E6F4F1] text-[#171717]"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Thumbnail Strip with 2-Second Active Highlight Ring */}
        <div className="mt-5 pt-3 border-t border-[#A7F3D0]/60 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-3">
            {list.map((prod, idx) => {
              const isActive = idx === currentIndex;
              const imgUrl = prod.images?.[0]?.url;
              return (
                <button
                  key={prod.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsPaused(false);
                  }}
                  className={`relative flex items-center gap-2 p-1 rounded-xl border transition-all text-left flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-[#0B7A6C] bg-[#E6F4F1] shadow-[0_4px_14px_rgba(11, 122, 108,0.25)] scale-105 ring-1 ring-[#0B7A6C]'
                      : 'border-[#e5e7eb] bg-white/80 hover:border-[#A7F3D0] hover:bg-[#f8fafc]'
                  }`}
                  aria-label={`View ${prod.name}`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden bg-white border border-[#e5e7eb] flex items-center justify-center p-0.5 flex-shrink-0">
                    <img
                      src={imgUrl}
                      alt={prod.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="hidden sm:block text-left pr-2 max-w-[90px]">
                    <span className={`text-[10px] font-bold block truncate font-manrope ${isActive ? 'text-[#0B7A6C]' : 'text-[#171717]'}`}>
                      {prod.name.split(' ')[0]} {prod.name.split(' ')[1]}
                    </span>
                    <span className="text-[9px] text-[#737373] block font-dmsans">
                      Rs. {(prod.price / 1000).toFixed(0)}k
                    </span>
                  </div>
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#0B7A6C] ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#737373] pl-3 border-l border-[#A7F3D0]/60 flex-shrink-0 font-medium font-dmsans">
            <Sparkles size={13} className="text-[#0B7A6C] animate-pulse" />
            <span>2s Auto-Cycle</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RotatingProductShowcase;
