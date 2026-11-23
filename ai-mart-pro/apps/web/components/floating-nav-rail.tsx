'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  LayoutGrid,
  Zap,
  BrainCircuit,
  ShoppingBag,
  Heart,
  Truck,
  Package,
  User,
  LayoutDashboard,
  Boxes,
  MessageSquare,
  Link2,
  Users,
  Flag,
  History,
  Settings,
  Navigation,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { AIMartLogo } from '@/components/ai-mart-logo';

export interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export function FloatingNavRail() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { user, cartCount, wishlistCount, cartPulse, logout, refresh, setToast } = useApp();
  const [hoveredTip, setHoveredTip] = useState<string | null>(null);

  // Dynamic role-based navigation configuration
  const role = user?.role || 'CUSTOMER';

  let items: NavItem[] = [];

  if (role === 'VENDOR') {
    items = [
      { id: 'v-home', href: '/vendor', label: 'Vendor Overview', icon: LayoutDashboard },
      { id: 'v-prods', href: '/vendor/products', label: 'My Products', icon: Package },
      { id: 'v-orders', href: '/vendor/orders', label: 'Orders & Fulfilment', icon: ShoppingBag },
      { id: 'v-ai', href: '/vendor/insights', label: 'AI Demand Forecast', icon: BrainCircuit },
      { id: 'v-revs', href: '/vendor/reviews', label: 'Review Sentiment Analysis', icon: MessageSquare },
      { id: 'v-intel', href: '/vendor/intelligence', label: 'External Intelligence', icon: Link2 },
      { id: 'v-store', href: '/shop', label: 'Browse Marketplace', icon: Store },
      { id: 'v-prof', href: '/profile', label: 'Store Profile', icon: Settings }
    ];
  } else if (role === 'ADMIN') {
    items = [
      { id: 'a-home', href: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
      { id: 'a-users', href: '/admin/users', label: 'Manage Users & Roles', icon: Users },
      { id: 'a-orders', href: '/admin/orders', label: 'Orders & Delivery Dispatch', icon: Truck },
      { id: 'a-reports', href: '/admin/reports', label: 'Moderation Queue', icon: Flag },
      { id: 'a-cats', href: '/admin/categories', label: 'Product Categories', icon: Boxes },
      { id: 'a-audit', href: '/admin/audit', label: 'System Audit Log', icon: History },
      { id: 'a-store', href: '/shop', label: 'Customer Storefront', icon: Store },
      { id: 'a-prof', href: '/profile', label: 'Admin Settings', icon: Settings }
    ];
  } else if (role === 'DELIVERY') {
    items = [
      { id: 'd-home', href: '/delivery', label: 'Assigned Delivery Jobs', icon: Truck },
      { id: 'd-track', href: '/track-order', label: 'GPS Vector Simulator', icon: Navigation },
      { id: 'd-store', href: '/shop', label: 'Browse Marketplace', icon: Store },
      { id: 'd-prof', href: '/profile', label: 'Rider Profile', icon: Settings }
    ];
  } else {
    // Customer & Guest
    items = [
      { id: 'c-home', href: '/', label: 'Home Marketplace', icon: Store },
      { id: 'c-shop', href: '/shop', label: 'Explore All Products', icon: LayoutGrid },
      { id: 'c-deals', href: '/deals', label: 'Flash Sale Deals', icon: Zap },
      { id: 'c-ai', href: '/ai-studio', label: 'AI Predictions Studio', icon: BrainCircuit },
      { id: 'c-cart', href: '/cart', label: 'Shopping Cart', icon: ShoppingBag, badge: cartCount > 0 ? cartCount : undefined },
      { id: 'c-wish', href: '/wishlist', label: 'My Wishlist', icon: Heart, badge: wishlistCount > 0 ? wishlistCount : undefined },
      { id: 'c-track', href: '/track-order', label: 'Live Order Tracking', icon: Truck },
      { id: 'c-orders', href: '/orders', label: 'Order History', icon: Package },
      { id: 'c-prof', href: user ? '/profile' : '/login', label: user ? 'My Profile' : 'Sign In', icon: User }
    ];
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* DESKTOP FIXED FLOATING RAIL */}
      <aside
        className="am-rail-wrap"
        role="navigation"
        aria-label="Sidebar Rail Navigation"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="am-rail"
        >
          {/* Top Brand Monogram */}
          <Link
            href="/"
            className="flex items-center justify-center mb-1.5 group transition-transform hover:scale-105 active:scale-95"
            title="AI MART PRO"
            aria-label="AI Mart Pro Home"
          >
            <AIMartLogo variant="mark" size={42} />
          </Link>

          <div className="am-rail-sep" />

          {/* Navigation Item Icons */}
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredTip(item.id)}
                onMouseLeave={() => setHoveredTip(null)}
              >
                <Link
                  href={item.href}
                  className={`am-rail-btn ${active ? 'active' : ''}`}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && (
                    <motion.div
                      layoutId="rail-active-pill"
                      className="am-rail-active"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.75}
                    className="relative z-10"
                  />

                  {/* Badge with Pop Animation */}
                  {item.badge !== undefined && (
                    <motion.span
                      key={item.id === 'c-cart' ? `cart-${cartPulse}` : `badge-${item.badge}`}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: [1, 1.35, 0.9, 1.1, 1], opacity: 1 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="am-rail-badge"
                    >
                      {item.badge}
                    </motion.span>
                  )}

                  {/* Floating Tooltip */}
                  <span className="am-tip" role="tooltip">
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          })}

          <div className="am-rail-sep" />

          {/* Role Status Indicator or Logout */}
          {user ? (
            <button
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              className="am-rail-btn text-[#DC2626] hover:bg-[#FEE2E2]/20 hover:text-[#DC2626]"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={18} />
              <span className="am-tip" role="tooltip">
                Sign Out ({user.name.split(' ')[0]})
              </span>
            </button>
          ) : (
            <Link
              href="/login"
              className="am-rail-btn text-[#0B7A6C] hover:text-[#09665A]"
              title="Sign In"
              aria-label="Sign In"
            >
              <User size={18} />
              <span className="am-tip" role="tooltip">
                Customer Sign In
              </span>
            </Link>
          )}
        </motion.div>
      </aside>

      {/* MOBILE COMPACT FLOATING BOTTOM RAIL */}
      <nav className="am-mobile-nav" aria-label="Mobile Navigation">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`am-rail-btn ${active ? 'active' : ''}`}
              aria-label={item.label}
            >
              {active && (
                <motion.div
                  layoutId="mobile-active-pill"
                  className="am-rail-active"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon size={19} strokeWidth={active ? 2.2 : 1.75} />
              {item.badge !== undefined && (
                <span className="am-rail-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

