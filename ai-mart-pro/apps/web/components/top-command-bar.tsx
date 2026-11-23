'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Heart,
  Bell,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Package,
  Truck,
  Sparkles,
  LogOut,
  Settings,
  LayoutDashboard,
  Mic,
  MicOff,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { AIMartLogo } from '@/components/ai-mart-logo';

export function TopCommandBar() {
  const { user, cartCount, wishlistCount, cartPulse, refresh, setToast, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search autocomplete
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/backend/api/search/suggestions?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setSuggestions(data);
        })
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change or click outside
  useEffect(() => {
    setUserDropdown(false);
    setNotifDropdown(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotifDropdown(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToast('Voice search is not supported in this browser.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onstart = () => {
        setIsListening(true);
        setToast('Listening... Speak search terms.');
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        router.push(`/shop?q=${encodeURIComponent(transcript)}`);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/shop?${params.toString()}`);
  };

  const switchPersona = async (email: string, targetPath: string, label: string) => {
    try {
      await fetch('/backend/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Demo12345!' }),
      });
      await refresh();
      setToast(`Switched active persona to ${label}`);
      router.push(targetPath);
    } catch {
      setToast(`Active persona: ${label}`);
      router.push(targetPath);
    }
  };

  const notifications = [
    {
      id: 'n1',
      title: 'Order Dispatched',
      desc: 'Order #AIM-94821 is out for delivery with Express Fleet.',
      time: '12m ago',
      icon: Truck,
      color: 'text-[#0B7A6C]',
    },
    {
      id: 'n2',
      title: 'Price Drop Alert',
      desc: 'Sony WH-1000XM5 ANC Headphones dropped by 10% in wishlist.',
      time: '1h ago',
      icon: Sparkles,
      color: 'text-[#0B7A6C]',
    },
    {
      id: 'n3',
      title: 'Inventory Telemetry',
      desc: 'Quantile demand predictor generated weekly vendor forecast.',
      time: '3h ago',
      icon: Package,
      color: 'text-[#7C3AED]',
    },
  ];

  return (
    <header className={`am-topbar ${scrolled ? 'scrolled' : ''}`}>
      {/* Brand & Market Status (Exact same layout, Teal/Yellow theme colors) */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-90"
          aria-label="AI Mart Pro Home"
        >
          <AIMartLogo variant="full" size="sm" theme="light" />
        </Link>

        {/* Currency & Geo Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#6B7280] bg-white border border-[#E5E7EB] px-2.5 py-1.5 rounded-xl">
          <MapPin size={13} className="text-[#0B7A6C]" />
          <span>Pakistan</span>
          <span className="text-[#9CA3AF]">•</span>
          <span className="font-semibold text-[#1B1F23]">PKR (Rs.)</span>
        </div>
      </div>

      {/* Product Search Form with Autocomplete & Voice Recognition */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-[620px]">
        <form onSubmit={handleSearch} className="am-search" role="search">
          <Search size={17} className="text-[#6B7280] flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={
              isListening
                ? 'Listening... Speak now...'
                : 'Search in English or Roman Urdu ("ANC under 25k", "sasta watch")...'
            }
            aria-label="Search catalog"
            className={isListening ? 'animate-pulse' : ''}
          />

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            style={{
              background: isListening ? '#E53935' : '#0B7A6C',
            }}
            className="p-1.5 rounded-lg text-white transition-colors flex-shrink-0 cursor-pointer"
            title="Voice Search"
            aria-label="Voice Search"
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="hidden lg:block bg-transparent border-0 border-l border-[#E5E7EB] text-xs text-[#4B5563] pl-2 pr-1 py-1 focus:ring-0 cursor-pointer font-medium"
            aria-label="Filter category"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home-living">Home &amp; Living</option>
            <option value="beauty">Beauty</option>
            <option value="sports">Sports</option>
            <option value="books">Books</option>
          </select>
          <button type="submit" aria-label="Submit Search">
            Search
          </button>
        </form>

        {/* Live Search Autocomplete Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl shadow-xl z-50 p-2 text-xs space-y-1">
            {suggestions.length > 0 ? (
              suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => {
                    setSearchQuery(item);
                    setShowSuggestions(false);
                    router.push(`/shop?q=${encodeURIComponent(item)}`);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#E6F4F1] hover:text-[#0B7A6C] transition-colors"
                >
                  <span className="font-medium text-[#1B1F23]">{item}</span>
                  <span className="text-[10px] text-[#0B7A6C] font-mono">Catalog Match &rarr;</span>
                </button>
              ))
            ) : (
              <div className="p-2 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider block">
                  Quick AI Searches
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'ANC headphones under 25k',
                    'bohat sasta watch',
                    'RGB keyboard',
                    'cotton hoodie under 4k',
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={() => {
                        setSearchQuery(s);
                        setShowSuggestions(false);
                        router.push(`/shop?q=${encodeURIComponent(s)}`);
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#F5F7F8] border border-[#E5E7EB] text-[11px] text-[#4B5563] hover:border-[#0B7A6C] hover:text-[#0B7A6C] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Persona Switcher Quick Bar */}
      <div className="hidden 2xl:flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-2 py-1 rounded-xl text-[11px]">
        <span className="font-bold text-[#6B7280] uppercase text-[10px] tracking-wider px-1">
          Demo:
        </span>
        <button
          type="button"
          onClick={() => switchPersona('customer@aimart.test', '/', 'Customer (Jane)')}
          className={`px-2 py-1 rounded-lg font-semibold transition-all ${
            user?.role === 'CUSTOMER' || !user
              ? 'bg-[#E6F4F1] text-[#0B7A6C] border border-[#0B7A6C]/30'
              : 'text-[#6B7280] hover:text-[#1B1F23]'
          }`}
        >
          Customer
        </button>
        <button
          type="button"
          onClick={() => switchPersona('vendor@aimart.test', '/vendor', 'Vendor (Apex)')}
          className={`px-2 py-1 rounded-lg font-semibold transition-all ${
            user?.role === 'VENDOR'
              ? 'bg-[#E6F4F1] text-[#0B7A6C] border border-[#0B7A6C]/30'
              : 'text-[#6B7280] hover:text-[#1B1F23]'
          }`}
        >
          Vendor
        </button>
        <button
          type="button"
          onClick={() => switchPersona('admin@aimart.test', '/admin', 'Admin')}
          className={`px-2 py-1 rounded-lg font-semibold transition-all ${
            user?.role === 'ADMIN'
              ? 'bg-[#E6F4F1] text-[#0B7A6C] border border-[#0B7A6C]/30'
              : 'text-[#6B7280] hover:text-[#1B1F23]'
          }`}
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => switchPersona('delivery@aimart.test', '/delivery', 'Delivery Rider')}
          className={`px-2 py-1 rounded-lg font-semibold transition-all ${
            user?.role === 'DELIVERY'
              ? 'bg-[#E6F4F1] text-[#0B7A6C] border border-[#0B7A6C]/30'
              : 'text-[#6B7280] hover:text-[#1B1F23]'
          }`}
        >
          Rider
        </button>
      </div>

      {/* Top Right Action Icons & Profile Dropdown */}
      <div className="am-top-actions">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            type="button"
            onClick={() => setNotifDropdown(!notifDropdown)}
            className="am-icon-btn"
            aria-label="Notifications"
            title="Activity Notifications"
          >
            <Bell size={18} />
            <span className="am-count">3</span>
          </button>

          <AnimatePresence>
            {notifDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.18 }}
                className="am-dropdown"
              >
                <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#1B1F23]">Notifications</h4>
                    <span className="text-[11px] text-[#6B7280]">Live orders &amp; price alerts</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0B7A6C] bg-[#E6F4F1] px-2 py-0.5 rounded-full">
                    3 New
                  </span>
                </div>

                <div className="divide-y divide-[#F1F5F9] max-h-72 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className="p-3.5 hover:bg-[#F5F7F8] transition-colors flex items-start gap-3"
                      >
                        <div
                          className={`p-2 rounded-xl bg-[#F5F7F8] border border-[#E5E7EB] ${n.color} flex-shrink-0`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#1B1F23]">{n.title}</span>
                            <span className="text-[10px] text-[#9CA3AF]">{n.time}</span>
                          </div>
                          <p className="text-[11.5px] text-[#4B5563] mt-0.5 leading-snug">
                            {n.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-[#F5F7F8] border-t border-[#E5E7EB] text-center">
                  <Link
                    href="/orders"
                    className="text-xs font-semibold text-[#0B7A6C] hover:underline"
                    onClick={() => setNotifDropdown(false)}
                  >
                    View All Orders &amp; Milestones →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wishlist Shortcut */}
        <Link
          href="/wishlist"
          className="am-icon-btn"
          aria-label="Wishlist"
          title={`Wishlist (${wishlistCount})`}
        >
          <Heart size={18} />
          {wishlistCount > 0 && <span className="am-count">{wishlistCount}</span>}
        </Link>

        {/* Shopping Cart Shortcut */}
        <Link
          href="/cart"
          className="am-icon-btn"
          aria-label="Cart"
          title={`Shopping Cart (${cartCount})`}
        >
          <motion.div
            key={cartPulse}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 0.3 }}
          >
            <ShoppingBag size={18} />
          </motion.div>
          {cartCount > 0 && (
            <motion.span
              key={`top-cart-${cartPulse}`}
              initial={{ scale: 0.6 }}
              animate={{ scale: [1, 1.4, 0.9, 1.15, 1] }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="am-count"
            >
              {cartCount}
            </motion.span>
          )}
        </Link>

        {/* User Account Chip & Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          {user ? (
            <button
              type="button"
              onClick={() => setUserDropdown(!userDropdown)}
              className="am-user-chip"
              aria-label="User Account Menu"
            >
              <div className="am-avatar">{user.name.trim().slice(0, 2).toUpperCase()}</div>
              <div className="text-left am-user-name">
                <span className="text-xs font-bold text-[#1B1F23] block truncate max-w-[90px]">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[10px] font-semibold text-[#0B7A6C] block uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <ChevronDown size={14} className="text-[#6B7280]" />
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0B7A6C] to-[#09665A] text-white text-xs font-bold shadow-[0_6px_18px_rgba(11,122,108,0.35)] hover:from-[#075E54] hover:to-[#0B7A6C] transition-all"
            >
              Sign In
            </Link>
          )}

          <AnimatePresence>
            {userDropdown && user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.18 }}
                className="am-dropdown"
              >
                <div className="p-4 border-b border-[#E5E7EB] bg-[#F5F7F8]">
                  <p className="text-sm font-bold text-[#1B1F23]">{user.name}</p>
                  <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E6F4F1] text-[#0B7A6C] border border-[#0B7A6C]/30">
                    Role: {user.role}
                  </span>
                </div>

                <div className="p-2 space-y-1 text-xs text-[#1B1F23]">
                  {user.role === 'VENDOR' && (
                    <Link
                      href="/vendor"
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F7F8] font-medium"
                    >
                      <LayoutDashboard size={15} className="text-[#0B7A6C]" />
                      <span>Vendor Dashboard</span>
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F7F8] font-medium"
                    >
                      <ShieldCheck size={15} className="text-[#0B7A6C]" />
                      <span>Admin Control Center</span>
                    </Link>
                  )}
                  {user.role === 'DELIVERY' && (
                    <Link
                      href="/delivery"
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F7F8] font-medium"
                    >
                      <Truck size={15} className="text-[#0B7A6C]" />
                      <span>Delivery Agent Tasks</span>
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F7F8] font-medium"
                  >
                    <Package size={15} className="text-[#6B7280]" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/track-order"
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F7F8] font-medium"
                  >
                    <Truck size={15} className="text-[#6B7280]" />
                    <span>Live Order Telemetry</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F5F7F8] font-medium"
                  >
                    <Settings size={15} className="text-[#6B7280]" />
                    <span>Account Settings</span>
                  </Link>
                </div>

                <div className="p-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-[#E53935] hover:bg-[#FEE2E2]/30 transition-colors"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
