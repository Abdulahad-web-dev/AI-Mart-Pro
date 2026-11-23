'use client';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BrainCircuit, TrendingUp, Compass, ShieldCheck, ArrowRight } from 'lucide-react';

const ABOUT_CARDS = [
  {
    id: 'vision',
    title: 'Our Vision',
    icon: BrainCircuit,
    description:
      'Pioneering transparent, honest AI for commerce. Providing explainable predictive demand, verified consumer sentiment, and genuine algorithmic integrity without black boxes.',
    tag: 'Honest AI'
  },
  {
    id: 'mission',
    title: 'Our Mission',
    icon: TrendingUp,
    description:
      'Total vendor empowerment. Equipping Pakistani retailers and creators with enterprise-tier demand forecasting, safety-stock optimization, and rapid automated dispatch.',
    tag: 'Vendor Growth'
  },
  {
    id: 'philosophy',
    title: 'Our Philosophy',
    icon: Compass,
    description:
      'Local-first commerce built natively for Pakistan. Seamless support for PKR pricing, Roman Urdu natural search, nationwide COD, and verified merchant escrow.',
    tag: 'Local First'
  },
  {
    id: 'value',
    title: 'Value Statement',
    icon: ShieldCheck,
    description:
      'Uncompromising trust and authenticity. Every vendor is verified, every review is cross-checked against purchase history, and every shipment is escrow-protected.',
    tag: 'Verified Trust'
  }
];

export function AboutSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="about"
      className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 scroll-mt-24"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B7A6C]/10 text-[#0B7A6C] text-xs font-bold uppercase tracking-wider mb-3">
          <span>Enterprise Pillars</span>
        </div>
        <h2 className="font-manrope text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#171717] tracking-tight">
          About AI Mart Pro
        </h2>
        <p className="font-dmsans text-sm sm:text-base text-[#737373] mt-2.5 leading-relaxed">
          The intelligent multi-vendor ecosystem engineered for Pakistan — combining verified merchants, authentic products, and honest predictive AI.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {ABOUT_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{
                duration: 0.45,
                delay: shouldReduceMotion ? 0 : idx * 0.08,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="group relative rounded-2xl bg-white border border-[#E5E7EB] p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(11, 122, 108,0.1)] hover:border-[#A7F3D0]"
            >
              <div>
                {/* Icon Tile with Tilt and Scale on Hover */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E6F4F1] to-[#A7F3D0]/50 border border-[#FDBA74]/40 text-[#0B7A6C] flex items-center justify-center mb-5 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Icon size={22} strokeWidth={2} />
                </div>

                {/* Tag & Heading */}
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-manrope font-extrabold text-base sm:text-lg text-[#171717] tracking-tight">
                    {card.title}
                  </h3>
                  <span className="text-[10px] font-bold text-[#0B7A6C] bg-[#E6F4F1] px-2 py-0.5 rounded-full">
                    {card.tag}
                  </span>
                </div>

                {/* Animated Growing Orange Underline */}
                <div className="w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-[#0B7A6C] to-[#09665A] rounded-full transition-all duration-300 mb-3" />

                {/* Copy */}
                <p className="font-dmsans text-xs sm:text-sm text-[#525252] leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Bottom Subtle Accent */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-[11px] font-semibold text-[#0B7A6C] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn our standards &rarr;</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default AboutSection;
