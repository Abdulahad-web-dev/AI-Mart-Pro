'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { RailNav } from './rail-nav';
import { TopCommandBar } from '@/components/top-command-bar';
import { MegaMenu } from './mega-menu';
import { AICopilot } from '@/components/ai-copilot';
import { ScrollMotionControls } from '@/components/scroll-motion-controls';
import { AIMartLogo } from '@/components/ai-mart-logo';

function StorefrontFooter() {
  return (
    <footer className="am-footer">
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <AIMartLogo variant="full" size="md" theme="dark" />
          </Link>
          <p className="text-xs text-[#9CA3AF] leading-relaxed max-w-sm">
            Pakistan&apos;s flagship AI-powered multi-vendor marketplace. Featuring LightGBM quantile demand forecasting, service-level inventory optimization, trilingual sentiment analysis, and nationwide express dispatch.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-white">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">Cash on Delivery</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">Bank Transfer</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">JazzCash / EasyPaisa</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">Visa / Mastercard</span>
          </div>
        </div>

        <div>
          <h4>Marketplace</h4>
          <div className="flex flex-col gap-2 text-xs">
            <Link href="/shop">Explore Catalog</Link>
            <Link href="/deals">Flash Deals of the Day</Link>
            <Link href="/compare">Compare Products</Link>
            <Link href="/account/orders">Track Your Order</Link>
            <Link href="/account/wishlist">Saved Wishlist</Link>
            <Link href="/stores">Stores &amp; Operational Hubs</Link>
          </div>
        </div>

        <div>
          <h4>Company &amp; Help</h4>
          <div className="flex flex-col gap-2 text-xs">
            <Link href="/about">About AI Mart Pro</Link>
            <Link href="/contact">Contact &amp; Careers</Link>
            <Link href="/blog">Latest Updates &amp; Blog</Link>
            <Link href="/faq">Frequently Asked Questions</Link>
            <Link href="/returns">Returns &amp; Refunds Policy</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>

        <div>
          <h4>Portals &amp; AI</h4>
          <div className="flex flex-col gap-2 text-xs">
            <Link href="/ai-studio" className="text-[#FFC531] font-semibold">
              ✨ AI Predictions Studio
            </Link>
            <Link href="/vendor">Vendor Operations Hub</Link>
            <Link href="/admin">Admin Control Center</Link>
            <Link href="/delivery">Delivery Agent Portal</Link>
            <Link href="/register?role=VENDOR">Become a Verified Seller</Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9CA3AF] gap-4">
        <span>
          &copy; {new Date().getFullYear()} AI Mart Pro. Built with Next.js, Express, Prisma &amp; FastAPI ML.
        </span>
        <span className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1 text-[#0B7A6C] font-semibold">
            <ShieldCheck size={14} /> 100% Verified Escrow
          </span>
          <span className="inline-flex items-center gap-1 text-[#FFC531] font-semibold">
            <MapPin size={14} /> Lahore · Karachi · Islamabad
          </span>
        </span>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const { toast } = useApp();
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <div className="am-shell text-[#1B1F23] min-h-screen">
      {/* Global Scroll Progress Bar & Back-to-Top */}
      <ScrollMotionControls />

      {/* 1. UNIFIED FLOATING LEFT NAVIGATION RAIL (Desktop/Tablet) & BOTTOM DOCK (Mobile) */}
      <RailNav
        utilityStripVisible={false}
        megaMenuOpen={megaMenuOpen}
        onToggleMegaMenu={() => setMegaMenuOpen((prev) => !prev)}
      />

      {/* 2. INTERACTIVE CATEGORIES MEGA-MENU FLYOUT */}
      <MegaMenu
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
        topOffset={76}
      />

      {/* 3. MAIN CONTENT AREA OFFSET FROM FLOATING RAIL */}
      <div className="am-main">
        {/* Original TopCommandBar Header Layout with Teal & Yellow Theme Colors */}
        {!isAuthPage && <TopCommandBar />}

        <main className={`am-page ${isAuthPage ? 'flush' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {!isAuthPage && <StorefrontFooter />}
      </div>

      {/* 4. NOVA AI ASSISTANT */}
      <AICopilot />

      {/* 5. GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="am-toast"
            role="status"
          >
            <div className="am-toast-icon">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
