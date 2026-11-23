'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Shirt,
  Home as HomeIcon,
  Sparkles,
  Dumbbell,
  BookOpen,
  ChevronRight,
  Zap,
  Star,
  X,
  ArrowRight,
  Laptop,
} from 'lucide-react';
import { api, Category, Product, money, imageSrc } from '@/lib/api';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/lib/demo-products';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  topOffset?: number;
}

const CATEGORY_METADATA: Record<
  string,
  {
    icon: React.ElementType;
    subcategories: { group: string; items: { label: string; query: string }[] }[];
    promoTitle: string;
    promoSub: string;
    promoBadge: string;
  }
> = {
  electronics: {
    icon: Headphones,
    subcategories: [
      {
        group: 'Audio & Wearables',
        items: [
          { label: 'ANC Wireless Headphones', query: 'headphones' },
          { label: 'True Wireless Earbuds', query: 'airpods' },
          { label: 'AMOLED Smart Watches', query: 'watch' },
          { label: 'Portable Bluetooth Speakers', query: 'speaker' },
        ],
      },
      {
        group: 'Computing & Peripherals',
        items: [
          { label: 'Custom Mechanical Keyboards', query: 'keyboard' },
          { label: 'Pro Gaming Mice & Pads', query: 'mouse' },
          { label: 'USB-C Hubs & GaN Chargers', query: 'charger' },
          { label: 'Webcams & Microphones', query: 'camera' },
        ],
      },
    ],
    promoBadge: 'UP TO 25% OFF',
    promoTitle: 'Flagship Audio & AI Wearables',
    promoSub: 'Verified brand warranty with 24–48h express dispatch across Pakistan.',
  },
  fashion: {
    icon: Shirt,
    subcategories: [
      {
        group: 'Apparel & Streetwear',
        items: [
          { label: 'Premium Cotton Hoodies', query: 'hoodie' },
          { label: 'Tailored Polo & Tees', query: 'shirt' },
          { label: 'Winter Jackets & Coats', query: 'jacket' },
          { label: 'Ethnic & Kurta Collection', query: 'kurta' },
        ],
      },
      {
        group: 'Footwear & Accessories',
        items: [
          { label: 'Running & Lifestyle Sneakers', query: 'shoes' },
          { label: 'Leather Wallets & Belts', query: 'wallet' },
          { label: 'Travel Backpacks', query: 'backpack' },
          { label: 'Polarized Sunglasses', query: 'sunglasses' },
        ],
      },
    ],
    promoBadge: 'NEW SEASON',
    promoTitle: 'Urban Streetwear & Footwear',
    promoSub: 'Handpicked export-grade fabrics and ergonomic comfort.',
  },
  'home-living': {
    icon: HomeIcon,
    subcategories: [
      {
        group: 'Smart Home & Lighting',
        items: [
          { label: 'Ambient RGB Desk Lamps', query: 'lamp' },
          { label: 'Air Purifiers & Humidifiers', query: 'purifier' },
          { label: 'Smart Plugs & Sensors', query: 'smart' },
          { label: 'Ergonomic Office Chairs', query: 'chair' },
        ],
      },
      {
        group: 'Kitchen & Essentials',
        items: [
          { label: 'Espresso & Coffee Makers', query: 'coffee' },
          { label: 'Insulated Thermal Flasks', query: 'bottle' },
          { label: 'Minimalist Wall Decor', query: 'decor' },
          { label: 'Bedding & Cushions', query: 'pillow' },
        ],
      },
    ],
    promoBadge: 'HOME UPGRADE',
    promoTitle: 'Modern Workspace & Living',
    promoSub: 'Elevate your desk and living room with curated smart essentials.',
  },
  beauty: {
    icon: Sparkles,
    subcategories: [
      {
        group: 'Skincare & Serums',
        items: [
          { label: 'Vitamin C & Hyaluronic Serums', query: 'serum' },
          { label: 'Daily Hydrating Moisturizers', query: 'cream' },
          { label: 'SPF 50+ Sunblock', query: 'sunscreen' },
          { label: 'Organic Cleansers', query: 'cleanser' },
        ],
      },
      {
        group: 'Grooming & Fragrances',
        items: [
          { label: 'Eau De Parfum & Oud', query: 'perfume' },
          { label: 'Precision Beard Trimmers', query: 'trimmer' },
          { label: 'Hair Care & Dryers', query: 'hair' },
          { label: 'Gift Grooming Kits', query: 'kit' },
        ],
      },
    ],
    promoBadge: 'DERM TESTED',
    promoTitle: 'Authentic Skincare & Fragrances',
    promoSub: '100% original sealed formulations from verified distributors.',
  },
  sports: {
    icon: Dumbbell,
    subcategories: [
      {
        group: 'Fitness & Training',
        items: [
          { label: 'Adjustable Dumbbells & Weights', query: 'dumbbell' },
          { label: 'Non-Slip Yoga & Gym Mats', query: 'yoga' },
          { label: 'Resistance Bands & Grips', query: 'fitness' },
          { label: 'Protein Shakers & Hydration', query: 'shaker' },
        ],
      },
      {
        group: 'Outdoor & Athletics',
        items: [
          { label: 'Cricket Bats & Gear', query: 'cricket' },
          { label: 'Badminton & Padel Rackets', query: 'racket' },
          { label: 'Compression Sportswear', query: 'sport' },
          { label: 'Camping & Trekking Gear', query: 'camp' },
        ],
      },
    ],
    promoBadge: 'PRO ATHLETE',
    promoTitle: 'Home Gym & Sports Gear',
    promoSub: 'Commercial-grade durability for peak performance.',
  },
  books: {
    icon: BookOpen,
    subcategories: [
      {
        group: 'Technology & AI',
        items: [
          { label: 'Machine Learning & Deep Learning', query: 'ai' },
          { label: 'System Design & Architecture', query: 'system' },
          { label: 'Full-Stack Web Engineering', query: 'code' },
          { label: 'Data Science & Python', query: 'data' },
        ],
      },
      {
        group: 'Business & Self-Growth',
        items: [
          { label: 'Startup & Product Strategy', query: 'business' },
          { label: 'Productivity & Habits', query: 'habit' },
          { label: 'Finance & Investing', query: 'finance' },
          { label: 'Journals & Planners', query: 'notebook' },
        ],
      },
    ],
    promoBadge: 'BESTSELLERS',
    promoTitle: 'Engineering, AI & Leadership Library',
    promoSub: 'Original print editions for builders, students, and executives.',
  },
};

export function MegaMenu({ isOpen, onClose, topOffset = 76 }: MegaMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [activeSlug, setActiveSlug] = useState<string>('electronics');

  useEffect(() => {
    void api<Category[]>('/api/categories')
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setCategories(res);
          setActiveSlug(res[0].slug);
        }
      })
      .catch(() => {});

    void api<{ products: Product[] }>('/api/products?limit=40')
      .then((res) => {
        if (res?.products?.length) setProducts(res.products);
      })
      .catch(() => {});
  }, []);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Close on Escape or outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-mega-trigger="true"]')) return;
      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const activeCategory =
    categories.find((c) => c.slug === activeSlug) || categories[0] || DEMO_CATEGORIES[0];
  const meta =
    CATEGORY_METADATA[activeCategory?.slug] || CATEGORY_METADATA.electronics;

  const categoryProducts = products
    .filter(
      (p) =>
        p.category?.slug === activeCategory?.slug ||
        p.category?.name?.toLowerCase() === activeCategory?.name?.toLowerCase()
    )
    .slice(0, 2);

  const featuredList =
    categoryProducts.length > 0 ? categoryProducts : products.slice(0, 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[75]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Interactive Mega-Menu Flyout (720px, 20px radius) */}
          <motion.div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Categories Mega Menu"
            initial={{ opacity: 0, x: -16, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ top: `${topOffset}px` }}
            className="fixed left-3 right-3 md:left-[100px] md:right-auto md:w-[740px] max-h-[calc(100vh-110px)] overflow-y-auto bg-white rounded-[20px] shadow-[0_24px_64px_rgba(0,0,0,0.22)] border border-[#E5E7EB] z-[80] grid grid-cols-1 md:grid-cols-12"
          >
            {/* Left Column: Main Categories (4 cols) */}
            <div className="md:col-span-4 bg-[#F5F7F8] p-4 border-b md:border-b-0 md:border-r border-[#E5E7EB] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between px-2.5 pb-3 mb-2 border-b border-[#E5E7EB]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Departments
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="md:hidden p-1 rounded-lg text-[#6B7280] hover:text-[#1B1F23]"
                    aria-label="Close categories menu"
                  >
                    <X size={16} />
                  </button>
                </div>

                <ul className="space-y-1" role="menu">
                  {categories.map((cat) => {
                    const catMeta =
                      CATEGORY_METADATA[cat.slug] || CATEGORY_METADATA.electronics;
                    const Icon = catMeta.icon || Laptop;
                    const isSelected = cat.slug === activeCategory?.slug;

                    return (
                      <li key={cat.id} role="none">
                        <Link
                          href={`/category/${cat.slug}`}
                          role="menuitem"
                          onMouseEnter={() => setActiveSlug(cat.slug)}
                          onFocus={() => setActiveSlug(cat.slug)}
                          onClick={onClose}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all ${
                            isSelected
                              ? 'bg-white text-[#0B7A6C] shadow-sm border border-[#A7F3D0]'
                              : 'text-[#1B1F23] hover:bg-white/70 hover:text-[#0B7A6C]'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-[#E6F4F1] text-[#0B7A6C]'
                                  : 'bg-white text-[#6B7280]'
                              }`}
                            >
                              <Icon size={17} strokeWidth={1.8} />
                            </span>
                            <span>{cat.name}</span>
                          </span>
                          <ChevronRight
                            size={15}
                            className={
                              isSelected ? 'text-[#0B7A6C]' : 'text-[#9CA3AF]'
                            }
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E7EB] px-2">
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B7A6C] hover:text-[#075E54]"
                >
                  <span>Browse Full Catalog</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Right Section: Subcategories (2 cols) + Featured Products + Promo Banner (8 cols) */}
            <div className="md:col-span-8 p-5 flex flex-col justify-between gap-5 bg-white">
              {/* Subcategories in Two Columns */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Link
                    href={`/category/${activeCategory?.slug}`}
                    onClick={onClose}
                    className="text-base font-bold text-[#1B1F23] hover:text-[#0B7A6C] flex items-center gap-1.5"
                  >
                    <span>{activeCategory?.name}</span>
                    <ChevronRight size={16} className="text-[#0B7A6C]" />
                  </Link>
                  <Link
                    href={`/category/${activeCategory?.slug}`}
                    onClick={onClose}
                    className="text-xs font-semibold text-[#0B7A6C] hover:underline"
                  >
                    See all in {activeCategory?.name} &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {meta.subcategories.map((group) => (
                    <div
                      key={group.group}
                      className="p-3 rounded-xl bg-[#F5F7F8]/70 border border-[#E5E7EB]/70"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B1F23] mb-2">
                        {group.group}
                      </h4>
                      <ul className="space-y-1.5">
                        {group.items.map((sub) => (
                          <li key={sub.label}>
                            <Link
                              href={`/search?q=${encodeURIComponent(sub.query)}&category=${activeCategory?.slug}`}
                              onClick={onClose}
                              className="text-xs text-[#6B7280] hover:text-[#0B7A6C] font-medium flex items-center justify-between group py-0.5"
                            >
                              <span>{sub.label}</span>
                              <ArrowRight
                                size={11}
                                className="opacity-0 group-hover:opacity-100 text-[#0B7A6C] transition-opacity"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Products in this Category */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2">
                  Featured in {activeCategory?.name}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {featuredList.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug || prod.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E5E7EB] hover:border-[#0B7A6C] hover:shadow-sm transition-all group bg-white"
                    >
                      <img
                        src={imageSrc(prod)}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover bg-[#F5F7F8] flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#1B1F23] truncate group-hover:text-[#0B7A6C]">
                          {prod.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-[#0B7A6C]">
                            {money(prod.price)}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#6B7280]">
                            <Star size={10} className="fill-[#FFC531] text-[#FFC531]" />
                            {prod.rating || 4.8}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Promotional Banner */}
              <div className="rounded-2xl p-4 bg-gradient-to-r from-[#0B7A6C] to-[#075E54] text-white flex items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFC531] text-[#1B1F23] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    <Zap size={10} fill="currentColor" />
                    {meta.promoBadge}
                  </span>
                  <h5 className="text-sm font-bold text-white">{meta.promoTitle}</h5>
                  <p className="text-[11px] text-white/85 mt-0.5">{meta.promoSub}</p>
                </div>
                <Link
                  href={`/category/${activeCategory?.slug}`}
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-white text-[#0B7A6C] text-xs font-bold hover:bg-[#E6F4F1] transition-colors flex-shrink-0 shadow-sm"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
