'use client';
import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Store, Package, MapPin, Users, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { AnimatedCounter } from '@/components/animated-counter';

interface StatsData {
  vendors: number;
  products: number;
  cities: number;
  customers: number;
  isSample: boolean;
}

export function StatsGlance({ className = '' }: { className?: string }) {
  const [stats, setStats] = useState<StatsData>({
    vendors: 1250,
    products: 45000,
    cities: 120,
    customers: 250000,
    isSample: true
  });

  useEffect(() => {
    let isMounted = true;
    api<StatsData>('/api/stats')
      .then((data) => {
        if (isMounted && data) {
          setStats({
            vendors: data.vendors > 0 ? data.vendors : 1250,
            products: data.products > 0 ? data.products : 45000,
            cities: data.cities || 120,
            customers: data.customers > 0 ? data.customers : 250000,
            isSample: data.isSample ?? true
          });
        }
      })
      .catch(() => {
        // Fallback to sample figures gracefully
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const items = [
    {
      id: 'vendors',
      label: 'Verified Vendors',
      value: `${stats.vendors.toLocaleString()}+`,
      icon: Store,
      caption: 'Active merchant stores'
    },
    {
      id: 'products',
      label: 'Curated Products',
      value: `${stats.products >= 1000 ? (stats.products / 1000).toFixed(0) + 'K+' : stats.products + '+'}`,
      icon: Package,
      caption: 'In stock with escrow guarantee'
    },
    {
      id: 'cities',
      label: 'Cities Covered',
      value: `${stats.cities}+`,
      icon: MapPin,
      caption: 'Express dispatch nationwide'
    },
    {
      id: 'customers',
      label: 'Happy Customers',
      value: `${stats.customers >= 1000 ? (stats.customers / 1000).toFixed(0) + 'K+' : stats.customers + '+'}`,
      icon: Users,
      caption: '5-star fulfillment rating'
    }
  ];

  return (
    <section className={`relative max-w-6xl mx-auto px-4 sm:px-6 my-10 sm:my-14 ${className}`}>
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#171a20] via-[#201c1c] to-[#2b1b12] text-white p-6 sm:p-10 md:p-12 shadow-[0_20px_50px_rgba(23,26,32,0.35)] border border-white/10">
        {/* Subtle Ambient Radial Light */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#0B7A6C]/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#09665A]/10 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 relative z-10">
          <span className="text-[#0B7A6C] font-manrope font-extrabold text-xs sm:text-sm tracking-widest uppercase block mb-2">
            AI Mart Pro at a Glance
          </span>
          <h2 className="font-manrope text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Pakistan’s Fastest-Growing Intelligent Commerce Network
          </h2>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
          {items.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:border-[#0B7A6C]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#0B7A6C] flex items-center justify-center mb-3">
                  <Icon size={20} />
                </div>
                <div className="font-manrope text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
                  <AnimatedCounter value={stat.value} duration={1.5} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#0B7A6C] uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className="text-[11px] text-white/50 mt-1 hidden sm:block">
                  {stat.caption}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Small Note If Mock / Sample Figures */}
        {stats.isSample && (
          <div className="mt-8 text-center text-[10px] text-white/40 tracking-wide relative z-10">
            * Sample platform figures shown during catalog seeding and model calibration.
          </div>
        )}
      </div>
    </section>
  );
}

export default StatsGlance;
