'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  List,
  ChevronRight,
  X,
  Star,
  SlidersHorizontal,
  Package,
  Sparkles,
  ArrowRight,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Product, Category, api } from '@/lib/api';
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from '@/lib/demo-products';
import {
  ProductCard,
  ProductSkeleton,
  Pagination,
  SearchBar,
  Slider,
  Checkbox,
  Radio,
  Button,
} from '@/components/aimart-ui';

export interface BrowseProductsScreenProps {
  initialCategorySlug?: string;
  isSearchPage?: boolean;
}

export function BrowseProductsScreen({
  initialCategorySlug = '',
  isSearchPage = false,
}: BrowseProductsScreenProps = {}) {
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchAnalysis, setSearchAnalysis] = useState<any>(null);
  const [selectedCat, setSelectedCat] = useState<string>(initialCategorySlug);
  const [priceRange, setPriceRange] = useState<number>(150000);
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [discountedOnly, setDiscountedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (initialCategorySlug) setSelectedCat(initialCategorySlug);
  }, [initialCategorySlug]);

  // Load products & categories from API with fallback to DEMO_PRODUCTS
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [prodData, catData] = await Promise.all([
          api<any>('/api/products?limit=250').catch(() => null),
          api<any>('/api/categories').catch(() => null),
        ]);
        if (isMounted) {
          const rawProds = Array.isArray(prodData) ? prodData : prodData?.products;
          const list = rawProds && rawProds.length > 0 ? rawProds : DEMO_PRODUCTS;
          const rawCats = Array.isArray(catData) ? catData : catData?.categories;
          setProducts(list);
          setCategories(rawCats && rawCats.length ? rawCats : DEMO_CATEGORIES);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setProducts(DEMO_PRODUCTS);
          setCategories(DEMO_CATEGORIES);
          setLoading(false);
        }
      }
    }
    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with URL query parameters (?q=, ?category=, ?sort=)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get('q');
      if (q) {
        setSearchQuery(q);
        void fetch(`/backend/api/search?q=${encodeURIComponent(q)}`)
          .then((r) => r.json())
          .then((data) => {
            setSearchAnalysis(data);
            if (data.results && data.results.length > 0) {
              setProducts(data.results);
            }
          })
          .catch(() => {});
      }
      const cat = sp.get('category');
      if (cat) setSelectedCat(cat);
      const sort = sp.get('sort');
      if (sort) {
        if (sort === 'best') setSortBy('rating');
        else if (sort === 'new') setSortBy('newest');
        else if (sort === 'deals') setSortBy('deals');
      }
    }
  }, []);

  const executeLiveSearch = (qText: string) => {
    const q = qText.trim();
    setSearchQuery(q);
    setCurrentPage(1);
    if (!q) {
      setSearchAnalysis(null);
      setProducts(DEMO_PRODUCTS);
      return;
    }
    void fetch(`/backend/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        setSearchAnalysis(data);
        if (data.results && data.results.length > 0) {
          setProducts(data.results);
        }
      })
      .catch(() => {});
  };

  // Compute Vendor / Brand List
  const brands = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const b = p.vendor?.vendorProfile?.storeName || p.vendor?.name || 'AI Mart Verified';
      counts[b] = (counts[b] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [products, brandSearch]);

  const categoryTree = [
    {
      slug: 'electronics',
      name: 'Electronics',
      count: 42,
      subcategories: ['Audio & Headphones', 'Wearables', 'Keyboards & Mice', 'Accessories'],
    },
    {
      slug: 'fashion',
      name: 'Fashion',
      count: 28,
      subcategories: ['Urban Streetwear', 'Footwear', 'Outerwear', 'Eyewear'],
    },
    {
      slug: 'home-living',
      name: 'Home & Living',
      count: 19,
      subcategories: ['Smart Lighting', 'Kitchen Appliances', 'Workspace', 'Decor'],
    },
    {
      slug: 'beauty',
      name: 'Beauty',
      count: 14,
      subcategories: ['Skincare Serums', 'Grooming', 'Fragrances'],
    },
    {
      slug: 'sports',
      name: 'Sports',
      count: 11,
      subcategories: ['Fitness Equipment', 'Smart Trackers', 'Hydration'],
    },
    {
      slug: 'books',
      name: 'Books',
      count: 7,
      subcategories: ['Technology & AI', 'System Design', 'Business'],
    },
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (selectedCat && p.category?.slug !== selectedCat) return false;
      if (p.price > priceRange) return false;
      const b = p.vendor?.vendorProfile?.storeName || p.vendor?.name || 'AI Mart Verified';
      if (selectedBrands.length > 0 && !selectedBrands.includes(b)) return false;
      if (selectedRating !== null && (p.rating || 0) < selectedRating) return false;
      if (inStockOnly && (p.stock === undefined || p.stock <= 0)) return false;
      if (discountedOnly && (!p.comparePrice || p.comparePrice <= p.price)) return false;
      if (
        searchQuery &&
        !searchAnalysis &&
        !`${p.name} ${p.description} ${p.category?.name || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price-low') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      list = [...list].reverse();
    } else if (sortBy === 'deals') {
      list = [...list].sort((a, b) => (b.comparePrice || 0) - (a.comparePrice || 0));
    }

    return list;
  }, [
    products,
    selectedCat,
    priceRange,
    selectedBrands,
    selectedRating,
    inStockOnly,
    discountedOnly,
    sortBy,
    searchQuery,
    searchAnalysis,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearAllFilters = () => {
    setSelectedCat('');
    setPriceRange(150000);
    setSelectedBrands([]);
    setSelectedRating(null);
    setInStockOnly(false);
    setDiscountedOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(selectedCat) ||
    priceRange < 150000 ||
    selectedBrands.length > 0 ||
    selectedRating !== null ||
    inStockOnly ||
    discountedOnly;

  const activeCategoryName =
    categoryTree.find((c) => c.slug === selectedCat)?.name ||
    categories.find((c) => c.slug === selectedCat)?.name ||
    selectedCat;

  const filterSidebarContent = (
    <div className="space-y-5">
      {/* 1. Categories Tree */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold tracking-wider uppercase text-[#1B1F23]">
            Category Tree
          </h3>
          {selectedCat && (
            <button
              type="button"
              onClick={() => {
                setSelectedCat('');
                setCurrentPage(1);
              }}
              className="text-xs text-[#0B7A6C] font-semibold hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        <ul className="space-y-1 text-xs">
          <li>
            <button
              type="button"
              onClick={() => {
                setSelectedCat('');
                setCurrentPage(1);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left font-semibold transition-colors cursor-pointer ${
                !selectedCat
                  ? 'bg-[#E6F4F1] text-[#0B7A6C]'
                  : 'text-[#1B1F23] hover:bg-[#F5F7F8]'
              }`}
            >
              <span>All Departments</span>
              <span className="text-[11px] font-mono opacity-70">{products.length}</span>
            </button>
          </li>
          {categoryTree.map((cat) => {
            const isSelected = selectedCat === cat.slug;
            return (
              <li key={cat.slug} className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCat(cat.slug);
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#E6F4F1] text-[#0B7A6C]'
                      : 'text-[#1B1F23] hover:bg-[#F5F7F8]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] font-mono opacity-70">{cat.count}</span>
                </button>
                {isSelected && (
                  <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-[#0B7A6C]/30 ml-3 mt-1">
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => executeLiveSearch(sub.split(' ')[0])}
                        className="block text-[11.5px] text-[#6B7280] hover:text-[#0B7A6C] cursor-pointer py-0.5 text-left"
                      >
                        • {sub}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2. Price Slider */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-2xs">
        <h3 className="text-xs font-bold tracking-wider uppercase text-[#1B1F23] mb-3">
          Max Budget (PKR)
        </h3>
        <div className="space-y-3">
          <Slider
            min={1000}
            max={150000}
            step={2000}
            value={priceRange}
            onChange={(val) => {
              setPriceRange(val);
              setCurrentPage(1);
            }}
          />
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="bg-[#F5F7F8] border border-[#E5E7EB] px-2 py-1 rounded-lg text-[#6B7280]">
              Rs. 1,000
            </span>
            <span className="bg-[#E6F4F1] border border-[#0B7A6C]/30 px-2.5 py-1 rounded-lg text-[#0B7A6C] font-bold">
              Rs. {priceRange.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Availability & Discount Filters */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-2xs space-y-2.5">
        <h3 className="text-xs font-bold tracking-wider uppercase text-[#1B1F23] mb-2">
          Availability &amp; Offers
        </h3>
        <Checkbox
          checked={inStockOnly}
          onChange={(chk) => {
            setInStockOnly(chk);
            setCurrentPage(1);
          }}
          label={<span className="text-xs font-medium text-[#1B1F23]">In Stock Only</span>}
        />
        <Checkbox
          checked={discountedOnly}
          onChange={(chk) => {
            setDiscountedOnly(chk);
            setCurrentPage(1);
          }}
          label={<span className="text-xs font-medium text-[#1B1F23]">On Sale / Discounted</span>}
        />
      </div>

      {/* 4. Vendor Filter */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-2xs">
        <h3 className="text-xs font-bold tracking-wider uppercase text-[#1B1F23] mb-2.5">
          Verified Vendors
        </h3>
        <div className="mb-2.5">
          <SearchBar
            value={brandSearch}
            onChange={setBrandSearch}
            placeholder="Filter vendors..."
          />
        </div>
        <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
          {brands.map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-between text-xs text-[#1B1F23] py-1"
            >
              <Checkbox
                checked={selectedBrands.includes(b.name)}
                onChange={(chk) => {
                  setSelectedBrands((prev) =>
                    chk ? [...prev, b.name] : prev.filter((x) => x !== b.name)
                  );
                  setCurrentPage(1);
                }}
                label={<span className="text-xs truncate max-w-[140px]">{b.name}</span>}
              />
              <span className="text-[11px] font-mono text-[#6B7280]">({b.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Rating Filter */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold tracking-wider uppercase text-[#1B1F23]">
            Customer Rating
          </h3>
          {selectedRating !== null && (
            <button
              type="button"
              onClick={() => setSelectedRating(null)}
              className="text-xs text-[#0B7A6C] font-semibold hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {[5, 4, 3, 2].map((stars) => (
            <div key={stars} className="flex items-center justify-between py-0.5">
              <Radio
                name="rating-filter"
                value={String(stars)}
                checked={selectedRating === stars}
                onChange={() => {
                  setSelectedRating(stars);
                  setCurrentPage(1);
                }}
                label={
                  <span className="inline-flex items-center gap-1 text-xs">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} size={12} className="fill-[#FFC531] text-[#FFC531]" />
                    ))}
                    <span className="text-[#6B7280] ml-1">&amp; Up</span>
                  </span>
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-[#1B1F23] space-y-6">
      {/* Breadcrumb & Header Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1.5">
            <Link href="/" className="hover:text-[#0B7A6C] transition-colors">
              Home
            </Link>
            <ChevronRight size={13} />
            <Link href="/shop" className="hover:text-[#0B7A6C] transition-colors">
              Shop
            </Link>
            {(selectedCat || isSearchPage || searchQuery) && (
              <>
                <ChevronRight size={13} />
                <span className="text-[#0B7A6C] font-semibold capitalize">
                  {searchQuery ? `Search: "${searchQuery}"` : activeCategoryName}
                </span>
              </>
            )}
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F23]">
            {isSearchPage || searchQuery
              ? `Search Results ${searchQuery ? `for "${searchQuery}"` : ''}`
              : selectedCat
              ? `${activeCategoryName} Department`
              : 'Explore All Marketplace Products'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-[#0B7A6C] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-[#E6F4F1] text-[#0B7A6C] text-xs font-bold">
            {filteredProducts.length} Products
          </span>
        </div>
      </div>

      {/* A3. AI Natural-Language Search Understanding Banner (AI Purple) */}
      {(isSearchPage || searchAnalysis || searchQuery) && (
        <div className="rounded-[18px] bg-gradient-to-r from-[#E6F4F1] via-white to-[#F5F7F8] border border-[#A7F3D0] p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                style={{ background: 'linear-gradient(135deg, #0B7A6C, #075E54)' }}
                className="p-2 rounded-xl text-white"
              >
                <Sparkles size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1B1F23]">
                    ✨ AI Natural-Language Search Engine
                  </span>
                  {searchAnalysis?.understood?.language && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F4F1] border border-[#A7F3D0] text-[#0B7A6C] text-[10px] font-bold uppercase">
                      {searchAnalysis.understood.language.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7280]">
                  Understands budget limits (&ldquo;under 25k&rdquo;, &ldquo;5000 se kam&rdquo;), Roman Urdu synonyms (&ldquo;ghari&rdquo;, &ldquo;jootay&rdquo;), and typos
                </p>
              </div>
            </div>

            {searchAnalysis?.relaxed && (
              <span className="px-3 py-1 rounded-full bg-[#FFF8E1] border border-[#FFC531] text-[#1B1F23] text-xs font-bold">
                Zero exact match — rescued with closest semantic matches
              </span>
            )}
          </div>

          {/* Did You Mean / Corrections & AI Understood Chips */}
          {searchAnalysis?.understood && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-bold text-[#0B7A6C] mr-1">AI Understood:</span>
              {searchAnalysis.understood.terms?.map((term: string) => (
                <span
                  key={term}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#A7F3D0] text-[#1B1F23] font-semibold text-xs"
                >
                  🔍 {term}
                </span>
              ))}
              {searchAnalysis.understood.max_price && (
                <span className="px-2.5 py-1 rounded-full bg-[#E6F4F1] border border-[#0B7A6C]/30 text-[#0B7A6C] font-bold text-xs">
                  Budget ≤ Rs. {Number(searchAnalysis.understood.max_price).toLocaleString()}
                </span>
              )}
              {searchAnalysis.understood.intent?.map((i: string) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-[#E6F4F1] border border-[#A7F3D0] text-[#0B7A6C] font-bold text-xs capitalize"
                >
                  Intent: {i}
                </span>
              ))}
              {searchAnalysis.understood.corrections?.map((c: any, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-[#FFF8E1] border border-[#FFC531] text-[#1B1F23] font-semibold text-xs"
                >
                  Did you mean: <strong>{c.corrected}</strong> (from &ldquo;{c.original}&rdquo;)
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">{filterSidebarContent}</aside>

        {/* Right Content */}
        <div className="space-y-5">
          {/* Sort Toolbar & View Toggle */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-3.5 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="text-xs text-[#6B7280]">
              Showing{' '}
              <strong className="text-[#1B1F23]">
                {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
              </strong>{' '}
              of <strong className="text-[#1B1F23]">{filteredProducts.length}</strong> listings
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#6B7280] font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#F5F7F8] border border-[#E5E7EB] text-[#1B1F23] text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0B7A6C] cursor-pointer"
                >
                  <option value="featured">Featured / AI Ranked</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="deals">Biggest Discounts</option>
                </select>
              </div>

              <div className="flex items-center bg-[#F5F7F8] border border-[#E5E7EB] rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[#0B7A6C] text-white'
                      : 'text-[#6B7280] hover:text-[#1B1F23]'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#0B7A6C] text-white'
                      : 'text-[#6B7280] hover:text-[#1B1F23]'
                  }`}
                  aria-label="List view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#6B7280]">Active Filters:</span>
              {selectedCat && (
                <span className="inline-flex items-center gap-1.5 bg-[#E6F4F1] text-[#0B7A6C] text-xs font-bold px-3 py-1 rounded-full">
                  Category: {activeCategoryName}
                  <button type="button" onClick={() => setSelectedCat('')} className="cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {priceRange < 150000 && (
                <span className="inline-flex items-center gap-1.5 bg-[#E6F4F1] text-[#0B7A6C] text-xs font-bold px-3 py-1 rounded-full">
                  Max Rs. {priceRange.toLocaleString()}
                  <button
                    type="button"
                    onClick={() => setPriceRange(150000)}
                    className="cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 bg-[#E6F4F1] text-[#0B7A6C] text-xs font-bold px-3 py-1 rounded-full">
                  In Stock Only
                  <button
                    type="button"
                    onClick={() => setInStockOnly(false)}
                    className="cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {discountedOnly && (
                <span className="inline-flex items-center gap-1.5 bg-[#FEE2E2] text-[#E53935] text-xs font-bold px-3 py-1 rounded-full">
                  On Sale
                  <button
                    type="button"
                    onClick={() => setDiscountedOnly(false)}
                    className="cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedBrands.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] text-[#1B1F23] text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {b}
                  <button
                    type="button"
                    onClick={() => setSelectedBrands((prev) => prev.filter((x) => x !== b))}
                    className="cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {selectedRating !== null && (
                <span className="inline-flex items-center gap-1.5 bg-[#FFF8E1] text-[#1B1F23] text-xs font-bold px-3 py-1 rounded-full">
                  {selectedRating}★ &amp; Up
                  <button
                    type="button"
                    onClick={() => setSelectedRating(null)}
                    className="cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-[#E53935] hover:underline font-bold ml-1 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid (4 columns) or No-Result Recovery */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-4'
              }
            >
              {paginatedProducts.map((p) => (
                <div key={p.id} className="flex flex-col h-full">
                  {(isSearchPage || searchQuery) && (
                    <div className="mb-1 px-2.5 py-1 rounded-t-xl bg-[#E6F4F1] border border-b-0 border-[#A7F3D0] text-[10.5px] font-bold text-[#0B7A6C] flex items-center gap-1 truncate">
                      <Sparkles size={11} className="flex-shrink-0" />
                      <span className="truncate">
                        {(p as any).match_reason ||
                          `Why this product: Matches ${p.category?.name || 'Catalog'} & budget`}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <ProductCard
                      product={p}
                      isWishlisted={wishlist.includes(p.id)}
                      onToggleWishlist={() => toggleWishlist(p.id, p)}
                      onAddToCart={() => addToCart(p, 1)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Zero-Result Recovery with Popular Products & Related Categories */
            <div className="space-y-6">
              <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#E6F4F1] text-[#0B7A6C] flex items-center justify-center mx-auto">
                  <Package size={26} />
                </div>
                <h3 className="text-lg font-extrabold text-[#1B1F23]">
                  No exact products matched your current filter combination
                </h3>
                <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                  We couldn&apos;t find an exact match for those strict filters. Reset filters below or explore our most popular flagship products.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Button variant="primary" onClick={clearAllFilters}>
                    Reset All Filters
                  </Button>
                  {categoryTree.slice(0, 4).map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        clearAllFilters();
                        setSelectedCat(c.slug);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#F5F7F8] hover:bg-[#E6F4F1] text-xs font-bold text-[#1B1F23] hover:text-[#0B7A6C] cursor-pointer"
                    >
                      Browse {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-extrabold text-[#1B1F23]">
                  Popular Rescue Recommendations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {DEMO_PRODUCTS.slice(0, 4).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isWishlisted={wishlist.includes(p.id)}
                      onToggleWishlist={() => toggleWishlist(p.id, p)}
                      onAddToCart={() => addToCart(p, 1)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-[85]"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              className="lg:hidden fixed left-0 right-0 bottom-0 bg-[#F5F7F8] rounded-t-[24px] p-5 z-[90] max-h-[82vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E7EB]">
                <span className="text-base font-extrabold text-[#1B1F23]">Filter Catalog</span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg bg-white text-[#6B7280]"
                >
                  <X size={16} />
                </button>
              </div>
              {filterSidebarContent}
              <div className="sticky bottom-0 pt-3 mt-4 bg-[#F5F7F8] border-t border-[#E5E7EB] flex gap-2">
                <Button variant="outline" fullWidth onClick={clearAllFilters}>
                  Reset
                </Button>
                <Button variant="primary" fullWidth onClick={() => setMobileFilterOpen(false)}>
                  Apply ({filteredProducts.length})
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
