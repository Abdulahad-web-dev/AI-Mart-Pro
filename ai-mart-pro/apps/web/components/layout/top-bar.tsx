'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Bell,
  ChevronDown,
  User,
  ShieldCheck,
  Package,
  Truck,
  Sparkles,
  LogOut,
  Settings,
  LayoutDashboard,
  X,
  Mic,
  MicOff,
  Phone,
  Globe,
  Clock,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { money } from '@/lib/api';

interface TopBarProps {
  utilityStripVisible: boolean;
  onDismissUtilityStrip: () => void;
}

const PROMO_MESSAGES = [
  '⚡ Free Nationwide Express Delivery on orders over Rs. 5,000',
  '✨ AI Demand Engine & Roman Urdu Natural-Language Search Live',
  '🛡️ 100% Escrow Protected Multi-Vendor Marketplace in Pakistan',
];

export function TopBar({ utilityStripVisible, onDismissUtilityStrip }: TopBarProps) {
  const { user, cart, cartCount, wishlistCount, cartPulse, refresh, setToast, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname() || '/';

  const [scrolled, setScrolled] = useState(false);
  const [promoIdx, setPromoIdx] = useState(0);
  const [language, setLanguage] = useState<'EN' | 'UR'>('EN');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [understoodChips, setUnderstoodChips] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'ANC headphones under 25k',
    'bohat sasta smart watch',
    'mechanical keyboard',
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Calculate live cart total in PKR
  const cartTotalPkr = cart.reduce(
    (sum, item) => sum + (Number(item.product?.price) || 0) * item.quantity,
    0
  );

  // Rotate utility strip promotional message every 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIdx((prev) => (prev + 1) % PROMO_MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Scroll listener (> 8px per Section 5)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse live AI understood chips as user types
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setUnderstoodChips([]);
      return;
    }

    const chips: string[] = [];
    const lower = q.toLowerCase();
    const underMatch = lower.match(/(?:under|below|less than|se kam|tak)\s*(\d+)\s*(k)?/i);
    if (underMatch) {
      const val = Number(underMatch[1]) * (underMatch[2] ? 1000 : 1);
      chips.push(`Budget ≤ Rs. ${val.toLocaleString()}`);
    }
    if (lower.includes('sasta') || lower.includes('cheap') || lower.includes('budget')) {
      chips.push('Intent: Value / Low Price');
    }
    if (lower.includes('best') || lower.includes('top') || lower.includes('acha')) {
      chips.push('Sort: Highest Rated');
    }
    if (lower.includes('ghari') || lower.includes('watch')) {
      chips.push('Category: Smart Watches');
    }
    if (lower.includes('jootay') || lower.includes('shoes')) {
      chips.push('Category: Footwear');
    }
    if (lower.includes('anc') || lower.includes('headphone')) {
      chips.push('Feature: Active Noise Cancelling');
    }
    setUnderstoodChips(chips);

    const t = setTimeout(() => {
      fetch(`/backend/api/search/suggestions?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setSuggestions(data);
        })
        .catch(() => {});
    }, 180);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Close dropdowns on route change or outside click
  useEffect(() => {
    setUserDropdown(false);
    setNotifDropdown(false);
    setShowSuggestions(false);
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

  const handleLanguageToggle = () => {
    const next = language === 'EN' ? 'UR' : 'EN';
    setLanguage(next);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = next === 'UR' ? 'rtl' : 'ltr';
      document.documentElement.lang = next === 'UR' ? 'ur' : 'en';
    }
    setToast(next === 'UR' ? 'زبان اردو میں تبدیل کر دی گئی ہے' : 'Language switched to English');
  };

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
      recognition.lang = language === 'UR' ? 'ur-PK' : 'en-US';
      recognition.onstart = () => {
        setIsListening(true);
        setToast('Listening... Speak your product search.');
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        submitSearchQuery(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const submitSearchQuery = (qText: string) => {
    const q = qText.trim();
    if (!q) {
      router.push('/shop');
      return;
    }
    setRecentSearches((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 5));
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearchQuery(searchQuery);
  };

  const switchPersona = async (email: string, targetPath: string, label: string) => {
    try {
      await fetch('/backend/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Demo12345!' }),
      });
      await refresh();
      setToast(`Switched active role to ${label}`);
      router.push(targetPath);
    } catch {
      setToast(`Unable to switch role right now`);
    }
  };

  const notifications = [
    {
      id: 'n1',
      title: 'Order #AIM-94821 Dispatched',
      desc: 'Your package is in transit from Lahore Central Hub.',
      time: '12m ago',
      icon: Truck,
      color: 'text-[#0B7A6C]',
    },
    {
      id: 'n2',
      title: 'Wishlist Price Drop',
      desc: 'Sony WH-1000XM5 ANC Headphones dropped by 10%.',
      time: '1h ago',
      icon: Sparkles,
      color: 'text-[#6D28D9]',
    },
    {
      id: 'n3',
      title: 'AI Daily Brief Ready',
      desc: 'Quantile demand forecast and service-level stock metrics updated.',
      time: '3h ago',
      icon: Package,
      color: 'text-[#0B7A6C]',
    },
  ];

  return (
    <div className="sticky top-0 z-[60] w-full">
      {/* =====================================================================
          1. DISMISSIBLE UTILITY STRIP (Public Storefront Pages)
          ===================================================================== */}
      <AnimatePresence initial={false}>
        {utilityStripVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 32, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#17181B] text-white/90 text-[11.5px] px-4 md:px-7 flex items-center justify-between overflow-hidden border-b border-white/10"
          >
            <div className="hidden sm:flex items-center gap-2 text-[#9CA3AF]">
              <Phone size={12} className="text-[#0B7A6C]" />
              <span>Support: +92 (42) 3578-9000</span>
            </div>

            <div className="flex-1 text-center font-medium truncate px-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={promoIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="inline-block text-white"
                >
                  {PROMO_MESSAGES[promoIdx]}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/account/orders"
                className="hidden md:inline-flex items-center gap-1 text-[#09665A] hover:underline font-semibold"
              >
                <Truck size={12} />
                <span>Track Order</span>
              </Link>
              <button
                type="button"
                onClick={onDismissUtilityStrip}
                aria-label="Dismiss promotional strip"
                className="text-[#9CA3AF] hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          2. SLIM 64PX TOP NAVIGATION BAR (Section 5)
          ===================================================================== */}
      <header
        className={`h-[64px] px-3.5 md:px-7 flex items-center justify-between gap-3 md:gap-6 transition-all duration-200 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] shadow-[0_4px_20px_-12px_rgba(27,31,35,0.12)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        {/* LEFT SECTION: Small Orange AI Logo Tile + Wordmark AI Mart + Yellow PRO Pill */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none"
            aria-label="AI Mart Pro Home"
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #0B7A6C, #09665A)',
                boxShadow: '0 4px 12px rgba(11, 122, 108, 0.35)',
              }}
              className="w-9 h-9 rounded-[11px] flex items-center justify-center text-white font-extrabold text-base relative flex-shrink-0 group-hover:scale-105 transition-transform"
            >
              <span>A</span>
              <Sparkles size={9} className="absolute top-1 right-1 text-white" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[19px] font-extrabold tracking-tight leading-none">
                <span className="text-[#0B7A6C]">AI</span>{' '}
                <span className="text-[#1B1F23]">Mart</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#FFC531] text-[#1B1F23] text-[10px] font-extrabold uppercase tracking-wider leading-none shadow-2xs">
                PRO
              </span>
            </div>
          </Link>
        </div>

        {/* CENTRE SECTION: Large Natural-Language Search Field */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-[640px]">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="relative flex items-center w-full h-[42px] bg-white border border-[#E5E7EB] focus-within:border-[#0B7A6C] focus-within:ring-3 focus-within:ring-[#0B7A6C]/15 rounded-[14px] pl-3.5 pr-1.5 shadow-2xs transition-all"
          >
            <Search size={17} className="text-[#6B7280] flex-shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder={
                isListening
                  ? 'Listening... Speak now...'
                  : 'Search products, brands, categories... (e.g. "ANC under 25k", "sasta watch")'
              }
              aria-label="Search products, brands, categories"
              className="w-full bg-transparent text-[13.5px] text-[#1B1F23] placeholder-[#6B7280] focus:outline-none border-none shadow-none"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="p-1 text-[#6B7280] hover:text-[#1B1F23]"
              >
                <X size={14} />
              </button>
            )}

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              aria-label="Voice Search"
              title="Voice Search"
              className={`p-1.5 rounded-lg transition-colors mr-1 ${
                isListening
                  ? 'bg-[#FEE2E2] text-[#E53935] animate-pulse'
                  : 'text-[#6B7280] hover:text-[#0B7A6C] hover:bg-[#E6F4F1]'
              }`}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            <button
              type="submit"
              className="h-[32px] px-3.5 rounded-[10px] bg-[#0B7A6C] hover:bg-[#09665A] text-white text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Live Suggestions, AI Understood Chips & Recent Searches Flyout */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.14)] z-[85] p-3.5 space-y-3"
              >
                {/* AI Understood Chips (AI Purple #6D28D9) */}
                {understoodChips.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-[#E5E7EB]">
                    <span
                      style={{ background: 'linear-gradient(135deg, #6D28D9, #C026D3)' }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10.5px] font-bold"
                    >
                      <Sparkles size={11} />
                      AI Understood
                    </span>
                    {understoodChips.map((chip) => (
                      <span
                        key={chip}
                        className="px-2.5 py-0.5 rounded-full bg-[#F5F3FF] border border-[#DDD6FE] text-[#6D28D9] text-[11px] font-semibold"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}

                {/* Autocomplete Matches */}
                {suggestions.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] px-2">
                      Live Catalog Suggestions
                    </span>
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => {
                          setSearchQuery(item);
                          submitSearchQuery(item);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs hover:bg-[#E6F4F1] hover:text-[#0B7A6C] transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-[#1B1F23]">{item}</span>
                        <ArrowRight size={13} className="text-[#0B7A6C]" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1">
                        <Clock size={11} /> Recent &amp; Natural-Language Searches
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onMouseDown={() => {
                            setSearchQuery(s);
                            submitSearchQuery(s);
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#F5F7F8] border border-[#E5E7EB] text-[11.5px] text-[#1B1F23] hover:border-[#0B7A6C] hover:text-[#0B7A6C] transition-colors cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SECTION: Lang Selector, PKR, Notifications, Cart + Total, User Avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* English / اردو Selector */}
          <button
            type="button"
            onClick={handleLanguageToggle}
            aria-label="Toggle Language English or Urdu"
            className="hidden lg:inline-flex items-center gap-1.5 h-[38px] px-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#0B7A6C] text-xs font-semibold text-[#1B1F23] transition-colors cursor-pointer"
          >
            <Globe size={14} className="text-[#0B7A6C]" />
            <span>{language === 'EN' ? 'EN / اردو' : 'اردو / EN'}</span>
          </button>

          {/* Currency Selector: PKR */}
          <div className="hidden xl:flex items-center gap-1 h-[38px] px-2.5 rounded-xl bg-white border border-[#E5E7EB] text-xs font-bold text-[#1B1F23]">
            <span className="text-[#0B7A6C]">PKR</span>
            <span className="text-[#6B7280] font-normal">(Rs.)</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              type="button"
              onClick={() => setNotifDropdown(!notifDropdown)}
              aria-label="Notifications"
              className="relative w-[38px] h-[38px] rounded-xl bg-white border border-[#E5E7EB] hover:border-[#0B7A6C] text-[#1B1F23] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Bell size={17} />
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF7A2F] text-white text-[10px] font-bold flex items-center justify-center">
                {notifications.length}
              </span>
            </button>

            <AnimatePresence>
              {notifDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+10px)] w-[320px] bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.16)] overflow-hidden z-[85]"
                >
                  <div className="p-3.5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F7F8]">
                    <span className="text-xs font-bold text-[#1B1F23]">Notifications</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F4F1] text-[#0B7A6C] text-[10px] font-bold">
                      {notifications.length} Active
                    </span>
                  </div>
                  <div className="divide-y divide-[#E5E7EB] max-h-72 overflow-y-auto">
                    {notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div
                          key={n.id}
                          className="p-3 hover:bg-[#F5F7F8] transition-colors flex items-start gap-2.5"
                        >
                          <div className={`p-2 rounded-xl bg-[#F5F7F8] border border-[#E5E7EB] ${n.color}`}>
                            <Icon size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#1B1F23] truncate">{n.title}</span>
                              <span className="text-[10px] text-[#6B7280]">{n.time}</span>
                            </div>
                            <p className="text-[11.5px] text-[#6B7280] mt-0.5 leading-snug">
                              {n.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-2.5 bg-[#F5F7F8] border-t border-[#E5E7EB] text-center">
                    <Link
                      href="/account/orders"
                      onClick={() => setNotifDropdown(false)}
                      className="text-xs font-bold text-[#0B7A6C] hover:underline"
                    >
                      View All Orders &amp; Alerts &rarr;
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Button with Item Count + Cart Total in PKR */}
          <Link
            href="/cart"
            aria-label={`Shopping Cart: ${cartCount} items, total ${money(cartTotalPkr)}`}
            className="relative h-[38px] px-3 rounded-xl bg-[#E6F4F1] hover:bg-[#0B7A6C] text-[#0B7A6C] hover:text-white border border-[#0B7A6C]/25 flex items-center gap-2 transition-all group"
          >
            <motion.div
              key={cartPulse}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 0.28 }}
              className="relative flex items-center"
            >
              <ShoppingBag size={17} />
            </motion.div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Cart ({cartCount})
              </span>
              <span className="text-[11.5px] font-extrabold">{money(cartTotalPkr)}</span>
            </div>
            {cartCount > 0 && (
              <span className="sm:hidden px-1.5 py-0.5 rounded-full bg-[#FF7A2F] text-white text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Avatar & Profile Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdown(!userDropdown)}
              aria-label="Account and Role Menu"
              className="h-[38px] pl-1.5 pr-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#0B7A6C] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <div
                style={{ background: 'linear-gradient(135deg, #0B7A6C, #09665A)' }}
                className="w-7 h-7 rounded-lg text-white text-xs font-extrabold flex items-center justify-center"
              >
                {user ? user.name.trim().slice(0, 2).toUpperCase() : 'G'}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <span className="text-xs font-bold text-[#1B1F23] block truncate max-w-[85px]">
                  {user ? user.name.split(' ')[0] : 'Sign In'}
                </span>
                <span className="text-[9.5px] font-bold text-[#0B7A6C] uppercase tracking-wider block">
                  {user ? user.role : 'Guest'}
                </span>
              </div>
              <ChevronDown size={13} className="text-[#6B7280]" />
            </button>

            <AnimatePresence>
              {userDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+10px)] w-[290px] bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.16)] overflow-hidden z-[85]"
                >
                  {user ? (
                    <div className="p-3.5 bg-[#F5F7F8] border-b border-[#E5E7EB]">
                      <p className="text-xs font-bold text-[#1B1F23]">{user.name}</p>
                      <p className="text-[11px] text-[#6B7280] truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#E6F4F1] text-[#0B7A6C] text-[10px] font-bold uppercase">
                        Active Role: {user.role}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-[#F5F7F8] border-b border-[#E5E7EB] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#1B1F23]">Welcome to AI Mart Pro</p>
                        <p className="text-[11px] text-[#6B7280]">Sign in or test a live role</p>
                      </div>
                      <Link
                        href="/login"
                        className="px-3 py-1.5 rounded-lg bg-[#0B7A6C] text-white text-xs font-bold"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}

                  {/* Quick Role Switcher for Demo / Evaluation */}
                  <div className="p-3 border-b border-[#E5E7EB]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2">
                      Switch Active Role Workspace
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { role: 'CUSTOMER', label: 'Customer', email: 'customer@aimart.test', path: '/' },
                        { role: 'VENDOR', label: 'Vendor Hub', email: 'vendor@aimart.test', path: '/vendor' },
                        { role: 'ADMIN', label: 'Admin Panel', email: 'admin@aimart.test', path: '/admin' },
                        { role: 'DELIVERY', label: 'Delivery Agent', email: 'delivery@aimart.test', path: '/delivery' },
                      ].map((p) => (
                        <button
                          key={p.role}
                          type="button"
                          onClick={() => switchPersona(p.email, p.path, p.label)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all cursor-pointer ${
                            user?.role === p.role
                              ? 'bg-[#E6F4F1] text-[#0B7A6C] border border-[#A7F3D0]'
                              : 'bg-[#F5F7F8] text-[#1B1F23] hover:bg-[#E6F4F1] hover:text-[#0B7A6C]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="p-2 space-y-0.5 text-xs">
                    <Link
                      href="/account/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F5F7F8] text-[#1B1F23] font-medium"
                    >
                      <User size={15} className="text-[#6B7280]" />
                      <span>My Profile &amp; Addresses</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F5F7F8] text-[#1B1F23] font-medium"
                    >
                      <Package size={15} className="text-[#6B7280]" />
                      <span>My Orders &amp; Tracking</span>
                    </Link>
                    <Link
                      href="/account/wishlist"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F5F7F8] text-[#1B1F23] font-medium"
                    >
                      <Heart size={15} className="text-[#6B7280]" />
                      <span>Wishlist ({wishlistCount})</span>
                    </Link>
                    <Link
                      href="/ai-studio"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F5F3FF] text-[#6D28D9] font-semibold"
                    >
                      <Sparkles size={15} className="text-[#6D28D9]" />
                      <span>AI Predictions Studio</span>
                    </Link>
                  </div>

                  {user && (
                    <div className="p-2 border-t border-[#E5E7EB]">
                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-[#E53935] hover:bg-[#FEE2E2]/40 transition-colors cursor-pointer"
                      >
                        <LogOut size={15} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </div>
  );
}
