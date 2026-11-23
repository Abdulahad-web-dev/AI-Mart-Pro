'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, MoreHorizontal, X, LogOut, Store } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { api } from '@/lib/api';
import { getNavForRole, NavItemConfig, BadgeKey } from './nav-config';

export function LogoTile({ size = 42 }: { size?: number }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <Link
      href="/"
      aria-label="AI Mart Pro Homepage"
      className="relative flex items-center justify-center flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7A6C]"
    >
      <motion.div
        whileHover={shouldReduceMotion ? {} : { rotate: -8, scale: 1.06 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #0B7A6C, #09665A)',
          boxShadow: '0 8px 20px rgba(11, 122, 108, 0.45)',
        }}
        className="relative flex items-center justify-center text-white select-none"
      >
        <span className="font-extrabold text-[19px] leading-none tracking-tight">A</span>
        <Sparkles
          size={10}
          strokeWidth={2.4}
          className="absolute top-1.5 right-1.5 text-[#FFC531]"
        />
      </motion.div>
    </Link>
  );
}

export function RailBadge({ count, pulseKey }: { count?: number; pulseKey?: number }) {
  if (!count || count <= 0) return null;
  const display = count > 99 ? '99+' : String(count);

  return (
    <motion.span
      key={pulseKey ? `badge-${pulseKey}-${count}` : `badge-${count}`}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      style={{
        backgroundColor: '#FFC531',
        color: '#1B1F23',
        boxShadow: '0 0 0 2px #17181B',
      }}
      className="absolute top-0.5 right-0.5 z-20 min-w-[17px] h-[17px] px-1 rounded-full text-[#1B1F23] text-[10px] font-extrabold flex items-center justify-center leading-none pointer-events-none"
    >
      {display}
    </motion.span>
  );
}

export function RailTooltip({ label, visible }: { label: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="tooltip"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.15, delay: 0.08 }}
          className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-[110] pointer-events-none whitespace-nowrap bg-[#17181B] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg shadow-[0_10px_24px_rgba(0,0,0,0.4)] border border-white/10"
        >
          <span
            className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#17181B] rotate-45 border-l border-b border-white/10"
            aria-hidden="true"
          />
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface RailItemProps {
  item: NavItemConfig;
  isActive: boolean;
  badgeCount?: number;
  pulseKey?: number;
  onAction?: (action: 'mega-menu' | 'nova') => void;
  layoutGroupId?: string;
}

export function RailItem({
  item,
  isActive,
  badgeCount,
  pulseKey,
  onAction,
  layoutGroupId = 'desktop-rail-active',
}: RailItemProps) {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const Icon = item.icon;

  const content = (
    <>
      {isActive && (
        <motion.div
          layoutId={layoutGroupId}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 380, damping: 30, duration: 0.28 }
          }
          style={{
            background: 'linear-gradient(135deg, #0B7A6C, #09665A)',
            boxShadow: '0 8px 20px -4px rgba(11, 122, 108, 0.65)',
          }}
          className="absolute inset-0 rounded-[14px] z-0"
        />
      )}
      <Icon
        size={20}
        strokeWidth={1.75}
        className={`relative z-10 transition-colors duration-150 ${
          isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-white'
        }`}
      />
      <RailBadge count={badgeCount} pulseKey={pulseKey} />
      <RailTooltip label={item.label} visible={hovered} />
    </>
  );

  const sharedClasses =
    'group relative w-[42px] h-[42px] rounded-[14px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7A6C] cursor-pointer flex-shrink-0 overflow-visible';

  if (item.action) {
    return (
      <button
        type="button"
        data-mega-trigger={item.action === 'mega-menu' ? 'true' : undefined}
        onClick={() => onAction?.(item.action!)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={item.label}
        aria-expanded={isActive}
        className={`${sharedClasses} ${!isActive ? 'hover:bg-white/[0.07]' : ''}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      className={`${sharedClasses} ${!isActive ? 'hover:bg-white/[0.07]' : ''}`}
    >
      {content}
    </Link>
  );
}

interface RailNavProps {
  utilityStripVisible?: boolean;
  megaMenuOpen: boolean;
  onToggleMegaMenu: () => void;
  onOpenNova?: () => void;
}

export function RailNav({
  megaMenuOpen,
  onToggleMegaMenu,
  onOpenNova,
}: RailNavProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { user, cartCount, wishlistCount, cartPulse, logout } = useApp();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [liveBadges, setLiveBadges] = useState<Partial<Record<BadgeKey, number>>>({});

  useEffect(() => {
    let mounted = true;

    async function fetchRoleCounts() {
      try {
        if (!user) return;
        if (user.role === 'CUSTOMER') {
          const orders = await api<any[]>('/api/orders').catch(() => []);
          if (mounted && Array.isArray(orders)) {
            const activeOrders = orders.filter(
              (o) => !['DELIVERED', 'CANCELLED'].includes(o.status)
            ).length;
            setLiveBadges((prev) => ({ ...prev, orders: activeOrders }));
          }
        } else if (user.role === 'VENDOR') {
          const [analytics, orders] = await Promise.all([
            api<any>('/api/vendor/analytics').catch(() => null),
            api<any[]>('/api/vendor/orders').catch(() => []),
          ]);
          if (mounted) {
            setLiveBadges((prev) => ({
              ...prev,
              criticalInventory: analytics?.lowStock?.length || 0,
              orders: Array.isArray(orders)
                ? orders.filter((o) => o.status !== 'DELIVERED').length
                : 0,
            }));
          }
        } else if (user.role === 'ADMIN') {
          const overview = await api<any>('/api/admin/overview').catch(() => null);
          if (mounted && overview) {
            setLiveBadges((prev) => ({
              ...prev,
              pendingReports: overview.reports || 0,
              orders: overview.orders || 0,
            }));
          }
        } else if (user.role === 'DELIVERY') {
          const jobs = await api<any[]>('/api/delivery/jobs').catch(() => []);
          if (mounted && Array.isArray(jobs)) {
            const active = jobs.filter(
              (j) => !['DELIVERED', 'FAILED'].includes(j.status)
            ).length;
            setLiveBadges((prev) => ({ ...prev, assignedDeliveries: active }));
          }
        }
      } catch {}
    }

    void fetchRoleCounts();
    return () => {
      mounted = false;
    };
  }, [user, pathname]);

  const navItems = getNavForRole(user?.role, !!user);

  const resolveBadge = (key?: BadgeKey): number | undefined => {
    if (!key) return undefined;
    if (key === 'cart') return cartCount;
    if (key === 'wishlist') return wishlistCount;
    return liveBadges[key];
  };

  const checkIsActive = (item: NavItemConfig): boolean => {
    if (item.action === 'mega-menu') return megaMenuOpen;
    if (item.href === '/') return pathname === '/';
    if (item.href === '/vendor') return pathname === '/vendor';
    if (item.href === '/admin') return pathname === '/admin';
    if (item.href === '/delivery') return pathname === '/delivery';
    if (item.id === 'c-track') return pathname === '/track-order';
    if (item.id === 'c-orders') {
      return pathname.startsWith('/account/orders') || pathname === '/orders';
    }
    if (item.id === 'c-wishlist') {
      return pathname === '/account/wishlist' || pathname === '/wishlist';
    }
    if (item.id.endsWith('-account')) {
      return pathname === '/account/profile' || pathname === '/profile' || pathname === '/login';
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const handleAction = (action: 'mega-menu' | 'nova') => {
    if (action === 'mega-menu') {
      onToggleMegaMenu();
    } else if (action === 'nova') {
      onOpenNova?.();
    }
  };

  const mobilePrimaryItems = navItems.filter((i) => i.mobilePrimary).slice(0, 4);
  const mobileOverflowItems = navItems.filter(
    (i) => !mobilePrimaryItems.some((p) => p.id === i.id)
  );

  return (
    <>
      {/* =====================================================================
          1. DESKTOP & TABLET FLOATING VERTICAL RAIL (Zero Scrollbars!)
          ===================================================================== */}
      <aside
        aria-label="Primary Floating Navigation"
        style={{
          background: 'linear-gradient(180deg, #1E2024, #141518)',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.28)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
        className="hidden md:flex fixed left-[16px] lg:left-[20px] top-1/2 -translate-y-1/2 w-[60px] lg:w-[66px] rounded-[33px] py-3 px-2.5 flex-col items-center justify-between gap-1 z-[70] overflow-visible"
      >
        {/* Top Section: Logo + Divider + Items (overflow-visible so NO scrollbars ever appear) */}
        <div className="flex flex-col items-center w-full gap-1 overflow-visible">
          <LogoTile size={42} />

          {/* Thin Divider Below Logo */}
          <div className="w-6 h-[1px] bg-white/10 my-1 flex-shrink-0" />

          {/* Role-Specific Navigation Icons */}
          <nav
            aria-label="Main Navigation Links"
            className="flex flex-col items-center gap-1 w-full overflow-visible"
          >
            {navItems.map((item) => (
              <RailItem
                key={item.id}
                item={item}
                isActive={checkIsActive(item)}
                badgeCount={resolveBadge(item.badgeKey)}
                pulseKey={item.badgeKey === 'cart' ? cartPulse : undefined}
                onAction={handleAction}
                layoutGroupId="desktop-rail-active"
              />
            ))}
          </nav>
        </div>

        {/* Bottom Section: Storefront Switcher or Logout */}
        {user && (
          <div className="flex flex-col items-center gap-1 pt-1.5 mt-1 border-t border-white/10 w-full flex-shrink-0 overflow-visible">
            {user.role !== 'CUSTOMER' && (
              <RailItem
                item={{
                  id: 'switch-storefront',
                  label: 'Public Storefront',
                  href: '/shop',
                  icon: Store,
                }}
                isActive={false}
                layoutGroupId="desktop-rail-footer"
              />
            )}
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              title={`Sign Out (${user.name})`}
              aria-label="Sign Out"
              className="w-[40px] h-[40px] rounded-[14px] flex items-center justify-center text-[#9CA3AF] hover:text-[#E53935] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <LogOut size={18} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </aside>

      {/* =====================================================================
          2. MOBILE FLOATING HORIZONTAL BOTTOM DOCK (< 768px)
          ===================================================================== */}
      <nav
        aria-label="Mobile Bottom Navigation Dock"
        style={{
          bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(180deg, #1E2024, #141518)',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.32)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
        className="md:hidden fixed left-[12px] right-[12px] h-[64px] rounded-[32px] px-3 flex items-center justify-around z-[70]"
      >
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          const active = checkIsActive(item);
          const badge = resolveBadge(item.badgeKey);

          const inner = (
            <>
              {active && (
                <motion.div
                  layoutId="mobile-dock-active"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    background: 'linear-gradient(135deg, #0B7A6C, #09665A)',
                    boxShadow: '0 6px 16px -4px rgba(11, 122, 108, 0.65)',
                  }}
                  className="absolute inset-0 rounded-[16px] z-0"
                />
              )}
              <Icon
                size={21}
                strokeWidth={1.75}
                className={`relative z-10 ${active ? 'text-white' : 'text-[#9CA3AF]'}`}
              />
              <RailBadge count={badge} />
            </>
          );

          if (item.action) {
            return (
              <button
                key={item.id}
                type="button"
                data-mega-trigger={item.action === 'mega-menu' ? 'true' : undefined}
                onClick={() => handleAction(item.action!)}
                aria-label={item.label}
                className="relative w-[46px] h-[46px] rounded-[16px] flex items-center justify-center"
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className="relative w-[46px] h-[46px] rounded-[16px] flex items-center justify-center"
            >
              {inner}
            </Link>
          );
        })}

        {mobileOverflowItems.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreSheetOpen(true)}
            aria-label="More navigation options"
            className="relative w-[46px] h-[46px] rounded-[16px] flex items-center justify-center text-[#9CA3AF] hover:text-white"
          >
            <MoreHorizontal size={22} />
          </button>
        )}
      </nav>

      {/* Mobile "More" Bottom Sheet */}
      <AnimatePresence>
        {moreSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-[85]"
              onClick={() => setMoreSheetOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              className="md:hidden fixed left-0 right-0 bottom-0 bg-white rounded-t-[24px] p-5 z-[90] shadow-2xl border-t border-[#E5E7EB] max-h-[75vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E7EB]">
                <span className="text-sm font-bold text-[#1B1F23]">
                  More Navigation ({user?.role || 'Customer'})
                </span>
                <button
                  type="button"
                  onClick={() => setMoreSheetOpen(false)}
                  className="p-1.5 rounded-lg bg-[#F5F7F8] text-[#6B7280]"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pb-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = checkIsActive(item);
                  const badge = resolveBadge(item.badgeKey);
                  return (
                    <Link
                      key={item.id}
                      href={item.action ? '#' : item.href}
                      onClick={(e) => {
                        setMoreSheetOpen(false);
                        if (item.action) {
                          e.preventDefault();
                          handleAction(item.action);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        active
                          ? 'bg-[#E6F4F1] border-[#0B7A6C]/30 text-[#0B7A6C]'
                          : 'bg-[#F5F7F8] border-[#E5E7EB] text-[#1B1F23]'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="truncate flex-1">{item.label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#FFC531] text-[#1B1F23] text-[10px] font-bold">
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
