'use client';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, Tag, Truck, Calendar } from 'lucide-react';

export interface UpdatePost {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  icon: string;
  gradient: string;
  tagColor: string;
  imageUrl?: string;
}

const DEFAULT_POSTS: UpdatePost[] = [
  {
    id: 'ai-v2',
    category: 'AI Engine',
    date: 'Nov 20, 2026',
    title: 'Demand Forecasting Engine v2.0 Live',
    excerpt:
      'Introducing quantile prediction intervals (P10–P90), Pakistan calendar event awareness, and service-level safety stock buffers for all verified vendors.',
    icon: '🧠',
    gradient: 'from-[#0B7A6C] via-[#09665A] to-[#9333ea]',
    tagColor: 'bg-[#E6F4F1] text-[#0B7A6C] border-[#A7F3D0]',
    imageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'tech-gala',
    category: 'Exclusive Deals',
    date: 'Active Campaign',
    title: 'Grand Multi-Vendor Tech Gala',
    excerpt:
      'Save up to 35% on flagship ANC headphones, AMOLED smartwatches, and custom mechanical keyboards backed by verified merchant escrow.',
    icon: '⚡',
    gradient: 'from-[#f59e0b] via-[#0B7A6C] to-[#dc2626]',
    tagColor: 'bg-[#FEF3C7] text-[#b45309] border-[#FDE68A]',
    imageUrl:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'express-logistics',
    category: 'Logistics Fleet',
    date: 'Network Expansion',
    title: '24–48h Express Dispatch in 12 Cities',
    excerpt:
      'Guaranteed same-day and next-day route-optimized fleet operations expanded to Lahore, Karachi, Rawalpindi, and Islamabad with live SMS telemetry.',
    icon: '🚚',
    gradient: 'from-[#0284c7] via-[#0ea5e9] to-[#10b981]',
    tagColor: 'bg-[#E0F2FE] text-[#0369a1] border-[#BAE6FD]',
    imageUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
  }
];

export function LatestUpdates({
  posts = DEFAULT_POSTS,
  className = ''
}: {
  posts?: UpdatePost[];
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className={`relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <span className="text-xs font-bold text-[#0B7A6C] uppercase tracking-wider block mb-1">
            Platform News &amp; Milestones
          </span>
          <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Latest Updates
          </h2>
        </div>
        <span className="text-xs text-[#737373]">
          Grounded insights and real-time announcements
        </span>
      </div>

      {/* 3 Post Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post, idx) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{
              duration: 0.45,
              delay: shouldReduceMotion ? 0 : idx * 0.1,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="group rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(11, 122, 108,0.1)] hover:border-[#A7F3D0]"
          >
            <div>
              {/* Card Image Header with Zoom on Hover */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${post.gradient} opacity-50 mix-blend-multiply group-hover:opacity-40 transition-opacity`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Emoji & Category Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-base shadow-sm">
                    {post.icon}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-white/95 text-[#171717] shadow-sm`}
                  >
                    {post.category}
                  </span>
                </div>

                {/* Bottom Date in Header */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-[11px] text-white/90 font-medium">
                  <Calendar size={12} />
                  <span>{post.date}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <h3 className="font-manrope font-extrabold text-base text-[#171717] group-hover:text-[#0B7A6C] transition-colors leading-snug mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="font-dmsans text-xs sm:text-sm text-[#525252] leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            </div>

            {/* Read More Footer */}
            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-bold text-[#0B7A6C]">
              <span>Read milestone story</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default LatestUpdates;
