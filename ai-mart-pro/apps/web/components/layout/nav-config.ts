import React from 'react';
import {
  Home,
  LayoutGrid,
  Zap,
  Sparkles,
  Package,
  Heart,
  Truck,
  ShoppingBag,
  User,
  LayoutDashboard,
  Boxes,
  TrendingUp,
  MessageSquare,
  Globe,
  BarChart3,
  Store,
  Settings,
  Users,
  ShieldAlert,
  FileText,
  AlertTriangle,
  Cpu,
  History,
} from 'lucide-react';
import { Role } from '@/lib/api';

export type BadgeKey =
  | 'cart'
  | 'wishlist'
  | 'orders'
  | 'notifications'
  | 'criticalInventory'
  | 'pendingReports'
  | 'assignedDeliveries';

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  action?: 'mega-menu' | 'nova';
  badgeKey?: BadgeKey;
  mobilePrimary?: boolean;
}

export const CUSTOMER_NAV: NavItemConfig[] = [
  { id: 'c-home', label: 'Home', href: '/', icon: Home, mobilePrimary: true },
  {
    id: 'c-categories',
    label: 'Categories',
    href: '#categories',
    icon: LayoutGrid,
    action: 'mega-menu',
    mobilePrimary: true,
  },
  { id: 'c-deals', label: 'Deals', href: '/deals', icon: Zap },
  {
    id: 'c-ai',
    label: 'AI Assistant',
    href: '/ai-studio',
    icon: Sparkles,
    mobilePrimary: true,
  },
  {
    id: 'c-orders',
    label: 'Orders',
    href: '/account/orders',
    icon: Package,
    badgeKey: 'orders',
  },
  {
    id: 'c-wishlist',
    label: 'Wishlist',
    href: '/account/wishlist',
    icon: Heart,
    badgeKey: 'wishlist',
  },
  {
    id: 'c-track',
    label: 'Track Delivery',
    href: '/account/orders',
    icon: Truck,
  },
  {
    id: 'c-shop',
    label: 'Shop',
    href: '/shop',
    icon: ShoppingBag,
    badgeKey: 'cart',
    mobilePrimary: true,
  },
  {
    id: 'c-account',
    label: 'Account',
    href: '/account/profile',
    icon: User,
    mobilePrimary: true,
  },
];

export const VENDOR_NAV: NavItemConfig[] = [
  { id: 'v-dashboard', label: 'Dashboard', href: '/vendor', icon: LayoutDashboard, mobilePrimary: true },
  { id: 'v-products', label: 'Products', href: '/vendor/products', icon: Package, mobilePrimary: true },
  {
    id: 'v-inventory',
    label: 'Inventory',
    href: '/vendor/inventory',
    icon: Boxes,
    badgeKey: 'criticalInventory',
  },
  {
    id: 'v-orders',
    label: 'Orders',
    href: '/vendor/orders',
    icon: ShoppingBag,
    badgeKey: 'orders',
    mobilePrimary: true,
  },
  { id: 'v-insights', label: 'Insights', href: '/vendor/insights', icon: TrendingUp, mobilePrimary: true },
  { id: 'v-reviews', label: 'Reviews', href: '/vendor/reviews', icon: MessageSquare },
  { id: 'v-intelligence', label: 'Intelligence', href: '/vendor/intelligence', icon: Globe },
  { id: 'v-analytics', label: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
  { id: 'v-store', label: 'Store', href: '/vendor/store', icon: Store },
  { id: 'v-settings', label: 'Settings', href: '/vendor/settings', icon: Settings },
  { id: 'v-account', label: 'Account', href: '/account/profile', icon: User, mobilePrimary: true },
];

export const ADMIN_NAV: NavItemConfig[] = [
  { id: 'a-dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard, mobilePrimary: true },
  { id: 'a-users', label: 'Users', href: '/admin/users', icon: Users, mobilePrimary: true },
  { id: 'a-vendors', label: 'Vendors', href: '/admin/vendors', icon: Store },
  { id: 'a-categories', label: 'Categories', href: '/admin/categories', icon: LayoutGrid },
  {
    id: 'a-moderation',
    label: 'Moderation',
    href: '/admin/moderation',
    icon: ShieldAlert,
    badgeKey: 'pendingReports',
    mobilePrimary: true,
  },
  { id: 'a-orders', label: 'Orders', href: '/admin/orders', icon: ShoppingBag, badgeKey: 'orders' },
  { id: 'a-analytics', label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { id: 'a-audit', label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
  { id: 'a-anomalies', label: 'Anomalies', href: '/admin/anomalies', icon: AlertTriangle },
  { id: 'a-models', label: 'AI Models', href: '/admin/ai-models', icon: Cpu, mobilePrimary: true },
  { id: 'a-account', label: 'Account', href: '/account/profile', icon: User, mobilePrimary: true },
];

export const DELIVERY_NAV: NavItemConfig[] = [
  {
    id: 'd-deliveries',
    label: 'Deliveries',
    href: '/delivery',
    icon: Truck,
    badgeKey: 'assignedDeliveries',
    mobilePrimary: true,
  },
  { id: 'd-history', label: 'History', href: '/delivery/history', icon: History, mobilePrimary: true },
  { id: 'd-profile', label: 'Profile', href: '/delivery/profile', icon: User, mobilePrimary: true },
];

export function getNavForRole(role?: Role | null, isSignedIn = false): NavItemConfig[] {
  if (role === 'VENDOR') return VENDOR_NAV;
  if (role === 'ADMIN') return ADMIN_NAV;
  if (role === 'DELIVERY') return DELIVERY_NAV;

  return CUSTOMER_NAV.map((item) => {
    if (item.id === 'c-account' && !isSignedIn) {
      return { ...item, href: '/login', label: 'Account' };
    }
    return item;
  });
}
