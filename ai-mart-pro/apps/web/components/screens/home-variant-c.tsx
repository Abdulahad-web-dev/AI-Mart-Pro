'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Smartphone, Shirt, ShoppingBasket, Home, Gamepad2, ArrowRight, Zap,
  Heart, ShoppingBag, Star, Clock
} from 'lucide-react';
import { Button, ProductCard, easeCurve } from '@/components/aimart-ui';
import { Product, money } from '@/lib/api';
import { DEMO_PRODUCTS } from '@/lib/demo-products';
import { useApp } from '@/lib/app-context';

export function HomeVariantC() {
  const shouldReduceMotion = useReducedMotion();
  const { addToCart, toggleWishlist, wishlist } = useApp();

  // Countdown timer for Flash Deals: 04:23:15
  const [secondsLeft, setSecondsLeft] = useState(4 * 3600 + 23 * 60 + 15);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 4 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = () => {
    const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
    const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
    const s = String(secondsLeft % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // 4 Top Flash Deals Products
  const flashProducts = DEMO_PRODUCTS.slice(0, 4);
  const flashDiscounts = [45, 30, 25, 60];
  const soldPercentages = [85, 92, 64, 40];
  const availableUnits = [15, 6, 28, 45];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] pb-16 font-sans">
      <main className="max-w-[1200px] mx-auto px-6 pt-6 space-y-12">
        {/* Hero Banner with FLASH SALE tag */}
        <section className="relative rounded-[14px] border border-[#E5E7EB] overflow-hidden min-h-[380px] flex items-center p-8 lg:p-14 bg-gradient-to-r from-[#FFFFFF] via-[#E6F4F1] to-[#A7F3D0]/30">
          {/* Subtle Ambient Glow */}
          <div className="absolute right-12 top-10 w-72 h-72 rounded-full bg-[#0B7A6C]/10 blur-[90px] pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            {/* Orange Tag */}
            <div className="inline-block bg-[#0B7A6C] text-white text-[11px] font-black uppercase px-3 py-1 rounded tracking-wider mb-4 shadow-md">
              FLASH SALE
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171717] tracking-tight mb-3">
              Next-Gen Tech Essentials
            </h1>

            <p className="text-sm sm:text-base text-[#525252] leading-relaxed mb-6 font-normal">
              Upgrade your workspace with our curated selection of premium electronics. Unbeatable prices for a limited time.
            </p>

            <Link href="/shop?category=electronics">
              <Button
                variant="outline"
                size="md"
                iconRight={<ArrowRight size={16} />}
                className="border-[#0B7A6C] text-[#0B7A6C] hover:bg-[#0B7A6C] hover:text-[#FFFFFF] font-bold"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Shop by Category (Bento Grid) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#171717] tracking-tight">
            Shop by Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Large Electronics Tile (Spans 2 columns) */}
            <Link
              href="/shop?category=electronics"
              className="md:col-span-2 relative min-h-[220px] rounded-[12px] border border-[#E5E7EB] overflow-hidden p-6 flex flex-col justify-end group bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(15,18,20,0.9), rgba(15,18,20,0.3)), url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80')`
              }}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#0B7A6C] transition-colors">
                    Electronics
                  </h3>
                  <span className="text-xs text-[#0B7A6C] font-semibold flex items-center gap-1">
                    Explore &rsaquo;
                  </span>
                </div>
                <div className="w-12 h-12 rounded-[10px] bg-[#FFFFFF]/80 backdrop-blur-md flex items-center justify-center text-[#0B7A6C]">
                  <Smartphone size={24} />
                </div>
              </div>
            </Link>

            {/* Small Tile 1: Fashion */}
            <Link
              href="/shop?category=fashion"
              className="relative min-h-[140px] rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] p-5 flex flex-col justify-between hover:border-[#0B7A6C] transition-all group"
            >
              <div className="w-10 h-10 rounded-[8px] bg-[#F1F5F9] flex items-center justify-center text-[#0B7A6C]">
                <Shirt size={20} />
              </div>
              <span className="text-sm font-bold text-[#171717] group-hover:text-[#0B7A6C] transition-colors">
                Fashion
              </span>
            </Link>

            {/* Small Tile 2: Grocery / Home */}
            <Link
              href="/shop?category=home-living"
              className="relative min-h-[140px] rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] p-5 flex flex-col justify-between hover:border-[#0B7A6C] transition-all group"
            >
              <div className="w-10 h-10 rounded-[8px] bg-[#F1F5F9] flex items-center justify-center text-[#0B7A6C]">
                <ShoppingBasket size={20} />
              </div>
              <span className="text-sm font-bold text-[#171717] group-hover:text-[#0B7A6C] transition-colors">
                Grocery & Home
              </span>
            </Link>

            {/* Small Tile 3: Smart Home */}
            <Link
              href="/shop?category=home-living"
              className="relative min-h-[140px] rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] p-5 flex flex-col justify-between hover:border-[#0B7A6C] transition-all group"
            >
              <div className="w-10 h-10 rounded-[8px] bg-[#F1F5F9] flex items-center justify-center text-[#0B7A6C]">
                <Home size={20} />
              </div>
              <span className="text-sm font-bold text-[#171717] group-hover:text-[#0B7A6C] transition-colors">
                Smart Home
              </span>
            </Link>

            {/* Small Tile 4: Gaming */}
            <Link
              href="/shop?category=electronics"
              className="relative min-h-[140px] rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] p-5 flex flex-col justify-between hover:border-[#0B7A6C] transition-all group"
            >
              <div className="w-10 h-10 rounded-[8px] bg-[#F1F5F9] flex items-center justify-center text-[#0B7A6C]">
                <Gamepad2 size={20} />
              </div>
              <span className="text-sm font-bold text-[#171717] group-hover:text-[#0B7A6C] transition-colors">
                Gaming
              </span>
            </Link>
          </div>
        </section>

        {/* Flash Deals Section with Countdown & 4 ProductCards */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-[#171717] tracking-tight flex items-center gap-2">
                Flash Deals <Zap size={22} className="text-[#0B7A6C]" fill="currentColor" />
              </h2>
              <div className="flex items-center gap-1.5 bg-[#F1F5F9] border border-[#E5E7EB] px-3 py-1 rounded-[6px] text-xs font-mono text-[#171717]">
                <Clock size={13} className="text-[#0B7A6C]" />
                <span>Ends in: {formatTimer()}</span>
              </div>
            </div>
            <Link
              href="/shop?sort=deals"
              className="text-sm font-semibold text-[#0B7A6C] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {/* 4 Cards Grid with Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flashProducts.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={{
                  ...p,
                  comparePrice: p.price * 1.45
                }}
                badge={`-${flashDiscounts[idx]}%`}
                isWished={wishlist.includes(p.id)}
                onToggleWishlist={() => toggleWishlist(p.id)}
                onAddToCart={() => addToCart(p, 1)}
                showProgressBar
                soldPercent={soldPercentages[idx]}
                availableCount={availableUnits[idx]}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
