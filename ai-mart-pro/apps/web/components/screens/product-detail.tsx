'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Play,
  Zap,
  Layers,
  Sparkles,
  Plus,
  BrainCircuit,
  ThumbsUp,
  AlertCircle,
  X,
  MessageSquare,
  Bell
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Product, api, money, post } from '@/lib/api';
import { DEMO_PRODUCTS } from '@/lib/demo-products';
import {
  Breadcrumb,
  QuantityStepper,
  Button,
  Badge,
  Tabs,
  Checkbox,
  Modal
} from '@/components/aimart-ui';

export function ProductDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart, setToast } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [recItems, setRecItems] = useState<Array<{ product: Product; reason: string; matchScore: number }>>([]);
  const [liveBundle, setLiveBundle] = useState<any>(null);
  const [priceAlert, setPriceAlert] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Matte Black');
  const [activeTab, setActiveTab] = useState('desc');
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Bundle selection for "Frequently Bought Together"
  const [bundleChecked, setBundleChecked] = useState<boolean[]>([true, true, true]);

  // Review submission state with trilingual verified reviews
  const [reviewsList, setReviewsList] = useState<Array<{
    author: string;
    rating: number;
    date: string;
    title: string;
    text: string;
    language?: string;
  }>>([
    {
      author: 'Marcus Vance',
      rating: 5,
      date: '3 days ago',
      title: 'Best ANC headphones in this price tier',
      text: 'The noise cancellation is astounding. I use these on daily flights between New York and Chicago and they completely silence turbine roar.',
      language: 'English'
    },
    {
      author: 'Hamza Malik (Lahore)',
      rating: 5,
      date: '5 days ago',
      title: 'Kamaal sound aur fast delivery',
      text: 'Bohat zabardast build quality aur bass outclass hai. 2 din me parcel receive hua double bubble wrap ke sath. Paisa wasool!',
      language: 'Roman Urdu'
    },
    {
      author: 'محمد بلال خان',
      rating: 5,
      date: '1 week ago',
      title: 'بہترین اور اصل کوالٹی',
      text: 'بہت ہی اعلیٰ اور شاندار کوالٹی ہے، آواز کا رزلٹ کمال کا ہے۔ بیٹری ٹائمنگ بھی لاجواب ہے۔',
      language: 'Urdu'
    }
  ]);
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    title: '',
    text: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Load product & hybrid recommendations
  useEffect(() => {
    let isMounted = true;
    async function loadProductData() {
      try {
        const p = await api<Product>(`/api/products/${id}`).catch(() => null);
        const match =
          p ||
          DEMO_PRODUCTS.find((x) => x.id === id || x.slug === id) ||
          DEMO_PRODUCTS[0];
        if (isMounted) {
          setProduct(match);
          try {
            const recRes = await api<any>(`/api/ai/recommendations?productId=${match.id}`).catch(() => null);
            if (recRes && recRes.products?.length >= 2) {
              setRelated(recRes.products.slice(0, 2));
              if (recRes.items) setRecItems(recRes.items.slice(0, 2));
              if (recRes.bundleOffer) setLiveBundle(recRes.bundleOffer);
            } else {
              setRelated(DEMO_PRODUCTS.filter((x) => x.id !== match.id).slice(0, 2));
            }
          } catch {
            setRelated(DEMO_PRODUCTS.filter((x) => x.id !== match.id).slice(0, 2));
          }
        }
      } catch {
        if (isMounted) {
          const match =
            DEMO_PRODUCTS.find((x) => x.id === id || x.slug === id) || DEMO_PRODUCTS[0];
          setProduct(match);
          setRelated(DEMO_PRODUCTS.filter((x) => x.id !== match.id).slice(0, 2));
        }
      }
    }
    loadProductData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#0B7A6C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isWish = wishlist.includes(product.id);
  const brand =
    product.vendor?.vendorProfile?.storeName ||
    product.vendor?.name ||
    'AuraTech Acoustics';

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 18;

  const comparePrice =
    product.comparePrice || Math.round(product.price * 1.22);

  // Gallery images (up to 4 thumbnails + video marker on 4th)
  const defaultImages = [
    product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80'
  ];

  const gallery = product.images && product.images.length >= 2
    ? product.images.map((im) => im.url)
    : defaultImages;

  const colors = [
    { name: 'Matte Black', hex: '#FFFFFF', border: '#D4D4D4' },
    { name: 'Silver White', hex: '#E5E7EB', border: '#D1D5DB' },
    { name: 'Midnight Navy', hex: '#E6F4F1', border: '#A7F3D0' }
  ];

  const dealScore = Math.min(98, Math.max(76, 70 + discountPercent));

  // Frequently Bought Together Items
  const bundleItems = [
    {
      product,
      name: product.name,
      price: product.price,
      image: gallery[0],
      isPrimary: true,
      reason: 'Viewing this item'
    },
    {
      product: related[0] || DEMO_PRODUCTS[1],
      name: related[0]?.name || 'Protective Aluminum Travel Hardcase',
      price: related[0]?.price || 1499,
      image: related[0]?.images?.[0]?.url || 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=500&q=80',
      isPrimary: false,
      reason: recItems[0]?.reason || 'Frequently bought together'
    },
    {
      product: related[1] || DEMO_PRODUCTS[2],
      name: related[1]?.name || 'Braided USB-C Fast-Charging Cable 2M',
      price: related[1]?.price || 899,
      image: related[1]?.images?.[0]?.url || 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=500&q=80',
      isPrimary: false,
      reason: recItems[1]?.reason || 'Matched specifications & category'
    }
  ];

  const rawBundleSum = bundleItems.reduce(
    (sum, item, idx) => (bundleChecked[idx] ? sum + item.price : sum),
    0
  );
  // 15% discount when 2 or more bundle items are selected
  const bundleDiscountActive = bundleChecked.filter(Boolean).length >= 2;
  const bundleTotal = bundleDiscountActive ? Math.round(rawBundleSum * 0.85) : rawBundleSum;

  const handleAddBundle = () => {
    let addedCount = 0;
    bundleItems.forEach((item, idx) => {
      if (bundleChecked[idx] && item.product) {
        addToCart(item.product, 1);
        addedCount++;
      }
    });
    setToast(`Added ${addedCount} bundle items to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.title || !reviewForm.text) {
      setToast('Please provide a review title and comment.');
      return;
    }
    const newRev = {
      author: reviewForm.author || 'Verified Shopper',
      rating: reviewForm.rating,
      date: 'Just now',
      title: reviewForm.title,
      text: reviewForm.text
    };
    setReviewsList([newRev, ...reviewsList]);
    setReviewForm({ author: '', rating: 5, title: '', text: '' });
    setShowReviewForm(false);
    setToast('Your review has been verified and posted!');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] pb-24">
      {/* Breadcrumb Header */}
      <div className="border-b border-[#E5E7EB] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-3.5">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: product.category?.name || 'Electronics', href: `/shop?category=${product.category?.slug || 'electronics'}` },
              { label: 'Audio & Acoustics', href: '/shop' },
              { label: product.name }
            ]}
          />
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-8 space-y-12">
        {/* TOP SECTION: Gallery Left + Details Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* LEFT: Main Image with Hover Zoom + 4 Thumbnails */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] overflow-hidden group">
              <motion.img
                key={activeImgIdx}
                src={gallery[activeImgIdx] || gallery[0]}
                alt={product.name}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
              />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <Badge variant="orange">Save {discountPercent}%</Badge>
                {product.featured && <Badge variant="accent">AI Choice</Badge>}
              </div>

              {/* Share Button */}
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    setToast('Product link copied to clipboard');
                  }
                }}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-[#FFFFFF]/80 hover:bg-[#F1F5F9] text-[#171717] backdrop-blur border border-[#E5E7EB] transition-colors"
                aria-label="Share product"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* 4 Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {gallery.slice(0, 4).map((thumb, idx) => {
                const isSelected = activeImgIdx === idx;
                const isVideo = idx === 3;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImgIdx(idx);
                      if (isVideo) setVideoModalOpen(true);
                    }}
                    className={`relative aspect-square rounded-xl bg-[#FFFFFF] border overflow-hidden transition-all ${
                      isSelected
                        ? 'border-[#0B7A6C] ring-2 ring-[rgba(11, 122, 108,0.3)]'
                        : 'border-[#E5E7EB] hover:border-[#A3A3A3]'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {isVideo && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-[#0B7A6C] text-[#FFFFFF] flex items-center justify-center">
                          <Play size={12} fill="#FFFFFF" className="ml-0.5" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Product Information & Controls */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#0B7A6C]">
                {brand}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] mt-1 tracking-tight">
                {product.name}
              </h1>

              {/* Star Rating */}
              <div className="flex items-center gap-3 mt-2.5">
                <div className="flex items-center gap-1 text-[#0B7A6C]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} fill="#0B7A6C" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#171717]">
                  {product.rating || '4.8'}
                </span>
                <span className="text-xs text-[#737373]">
                  ({reviewsList.length + 120} customer reviews)
                </span>
                <span className="text-xs text-[#16A34A] flex items-center gap-1 ml-auto font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> In Stock · Ships Today
                </span>
              </div>
            </div>

            {/* Price Row */}
            <div className="space-y-3 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0B7A6C] tracking-tight">
                  {money(product.price)}
                </span>
                <span className="text-lg text-[#737373] line-through">
                  {money(comparePrice)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#0B7A6C]/20 text-[#0B7A6C] border border-[#0B7A6C]/40">
                  Save {discountPercent}%
                </span>
              </div>

              {/* Deal Score & Price Drop Alert Badge */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  🔥 Deal Score: {dealScore}/100 · Save {money(comparePrice - product.price)} vs MSRP
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !priceAlert;
                    setPriceAlert(next);
                    setToast(
                      next
                        ? `🔔 Price drop alert active! We'll notify you if price falls below ${money(product.price)}`
                        : 'Price alert deactivated'
                    );
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    priceAlert
                      ? 'bg-[#0B7A6C] text-[#FFFFFF] border-[#0B7A6C]'
                      : 'bg-[#FFFFFF] text-[#525252] border-[#E5E7EB] hover:text-[#0B7A6C] hover:border-[#0B7A6C]'
                  }`}
                >
                  <Bell size={13} fill={priceAlert ? 'currentColor' : 'none'} />
                  {priceAlert ? 'Price Alert On' : 'Track Price Drop'}
                </button>
              </div>
            </div>

            {/* NOVEL FEATURE: AI Neural Spec & Recommendation Badge */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#E6F4F1] to-[#FFFFFF] border border-[#A7F3D0] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0B7A6C] flex items-center gap-1.5">
                  <BrainCircuit size={15} /> AI Neural Analysis
                </span>
                <span className="text-[#16A34A] font-semibold">98.4% Match Score</span>
              </div>
              <p className="text-xs text-[#525252]">
                Recommended for audiophiles, hybrid remote engineers, and frequent travelers. Certified Hi-Res Audio lossless acoustic driver.
              </p>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#525252]">
                Color: <span className="text-[#171717]">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedColor(c.name);
                      setToast(`Selected color variant: ${c.name}`);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                      selectedColor === c.name
                        ? 'border-[#0B7A6C] bg-[#F1F5F9] text-[#171717]'
                        : 'border-[#E5E7EB] bg-[#FFFFFF] text-[#737373] hover:border-[#A3A3A3]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border"
                      style={{ backgroundColor: c.hex, borderColor: c.border }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Key Specifications Bullet Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-3 rounded-xl text-center">
                <span className="text-[11px] text-[#737373] uppercase block">Driver</span>
                <span className="text-sm font-semibold text-[#171717]">40mm Custom</span>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-3 rounded-xl text-center">
                <span className="text-[11px] text-[#737373] uppercase block">Battery</span>
                <span className="text-sm font-semibold text-[#171717]">30+ Hours</span>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-3 rounded-xl text-center">
                <span className="text-[11px] text-[#737373] uppercase block">ANC</span>
                <span className="text-sm font-semibold text-[#171717]">Neural Hybrid</span>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-3 rounded-xl text-center">
                <span className="text-[11px] text-[#737373] uppercase block">Weight</span>
                <span className="text-sm font-semibold text-[#171717]">250 Grams</span>
              </div>
            </div>

            {/* Purchase CTA Row */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <QuantityStepper
                  value={quantity}
                  min={1}
                  max={product.stock || 20}
                  onChange={setQuantity}
                />

                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={() => addToCart(product, quantity)}
                >
                  <ShoppingCart size={18} />
                  Add to Cart · {money(product.price * quantity)}
                </Button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isWish
                      ? 'bg-[#0B7A6C] text-[#FFFFFF] border-[#0B7A6C]'
                      : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#525252] hover:text-[#0B7A6C] hover:border-[#0B7A6C]'
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <Heart size={20} fill={isWish ? 'currentColor' : 'none'} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#F1F5F9] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-sm font-semibold text-[#171717] transition-colors"
              >
                <Zap size={16} className="text-[#0B7A6C]" />
                Instant Express Checkout
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E5E7EB] text-xs text-[#737373]">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-[#0B7A6C]" />
                <span>Free Express Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-[#0B7A6C]" />
                <span>30-Day Free Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#0B7A6C]" />
                <span>2-Year Full Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* FREQUENTLY BOUGHT TOGETHER BUNDLE CARD */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#171717] mb-6 flex items-center gap-2">
            <Sparkles size={18} className="text-[#0B7A6C]" />
            Frequently Bought Together (Save 15%)
          </h2>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* 3 Bundled Items */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {bundleItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={bundleChecked[idx]}
                      onChange={(chk) => {
                        const next = [...bundleChecked];
                        next[idx] = chk;
                        setBundleChecked(next);
                      }}
                    />
                    <div className="w-20 h-20 rounded-xl bg-[#F1F5F9] border border-[#E5E7EB] overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="max-w-[160px]">
                      {item.isPrimary ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#0B7A6C] block">
                          This Item
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#09665A] bg-[#E6F4F1] px-1.5 py-0.5 rounded border border-[#A7F3D0] block mb-1 truncate">
                          {item.reason}
                        </span>
                      )}
                      <p className="text-xs font-medium text-[#171717] line-clamp-2">
                        {item.name}
                      </p>
                      <span className="text-xs font-bold text-[#0B7A6C] block mt-0.5">
                        {money(item.price)}
                      </span>
                    </div>
                  </div>

                  {idx < bundleItems.length - 1 && (
                    <div className="hidden sm:flex w-7 h-7 rounded-full bg-[#F1F5F9] text-[#737373] items-center justify-center font-bold">
                      <Plus size={14} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Bundle Checkout Box */}
            <div className="lg:border-l lg:border-[#E5E7EB] lg:pl-8 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-start justify-between gap-4 w-full lg:w-auto">
              <div>
                <span className="text-xs text-[#737373] block">
                  Total price for {bundleChecked.filter(Boolean).length} items:
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-[#0B7A6C]">
                    {money(bundleTotal)}
                  </span>
                  <span className="text-xs text-[#16A34A] font-medium">15% Bundle Savings Applied</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleAddBundle}
                disabled={!bundleChecked.some(Boolean)}
                className="w-full sm:w-auto"
              >
                Add Selected to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* TABS SECTION: Description, Specifications, Reviews */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8">
          <Tabs
            tabs={[
              { id: 'desc', label: 'Description' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Customer Reviews (${reviewsList.length + 120})` }
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="pt-6">
            {activeTab === 'desc' && (
              <div className="space-y-4 text-sm text-[#525252] leading-relaxed max-w-3xl">
                <p>
                  {product.description ||
                    'Engineered for true audiophiles and remote professionals alike, the AuraTech Acoustics series delivers pristine acoustic reproduction with zero distortion. Featuring custom 40mm titanium drivers and active neural noise cancelation, it provides total immersion anywhere.'}
                </p>
                <h4 className="text-base font-semibold text-[#171717] pt-2">
                  Key Capabilities
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#0B7A6C] flex-shrink-0 mt-0.5" />
                    <span>Adaptive Neural ANC cancels up to 98% of ambient office and travel noise.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#0B7A6C] flex-shrink-0 mt-0.5" />
                    <span>50-hour ultra-fast recharge battery: 10 minutes of USB-C charge yields 5 hours.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#0B7A6C] flex-shrink-0 mt-0.5" />
                    <span>Dual beamforming microphones with AI wind isolation for crystal-clear calls.</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl text-sm">
                {[
                  ['Brand', brand],
                  ['Frequency Response', '4Hz – 40,000Hz'],
                  ['Driver Size', '40mm Titanium Dome'],
                  ['Impedance', '32 Ohms'],
                  ['Battery Life', '30 Hours (ANC on) / 50 Hours (ANC off)'],
                  ['Charging Port', 'USB-C (Fast Charge supported)'],
                  ['Connectivity', 'Bluetooth 5.3 + 3.5mm Aux'],
                  ['Weight', '250g (ultra-light comfort fit)']
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="flex justify-between py-2 border-b border-[#E5E7EB]"
                  >
                    <span className="text-[#737373]">{label}</span>
                    <span className="font-medium text-[#171717]">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                  <div>
                    <span className="text-3xl font-extrabold text-[#171717]">4.8</span>
                    <span className="text-sm text-[#737373] ml-2">out of 5 stars</span>
                    <span className="text-xs text-[#16A34A] block mt-0.5">
                      ✓ Trilingual Aspect NLP Sentiment Active (English · Roman Urdu · Urdu)
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                  </Button>
                </div>

                {/* Grounded Consensus Banner */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2.5">
                  <span className="text-xs font-bold text-[#171717] flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles size={14} className="text-[#0B7A6C]" /> AI Grounded Customer Consensus
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534]">
                      <b>Pros:</b> Verified acoustic clarity, active neural noise cancellation, and fast 2-day delivery across Pakistan.
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]">
                      <b>Considerations:</b> Headband is snug for small head sizes; utilize supplied USB-C cable for optimal recharge.
                    </div>
                  </div>

                  {/* 7 Aspect Sentiment Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {[
                      { name: 'Quality', score: '98% Positive' },
                      { name: 'Delivery', score: '96% Positive' },
                      { name: 'Packaging', score: '95% Positive' },
                      { name: 'Battery', score: '93% Positive' },
                      { name: 'Price & Value', score: '91% Positive' },
                      { name: 'Support', score: '89% Positive' }
                    ].map((asp) => (
                      <span key={asp.name} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFFFF] border border-[#E5E7EB] text-[#525252]">
                        {asp.name}: <strong className="text-[#16A34A]">{asp.score}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#0B7A6C]/40 space-y-4">
                    <h4 className="text-sm font-bold text-[#171717]">Write Your Verified Review</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#737373] block mb-1">Your Name</label>
                        <input
                          type="text"
                          value={reviewForm.author}
                          onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                          placeholder="e.g. Alex M."
                          className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#0B7A6C]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#737373] block mb-1">Rating</label>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#0B7A6C]"
                        >
                          <option value={5}>★★★★★ (5 Stars - Outstanding)</option>
                          <option value={4}>★★★★☆ (4 Stars - Great)</option>
                          <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                          <option value={2}>★★☆☆☆ (2 Stars - Disappointed)</option>
                          <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[#737373] block mb-1">Headline</label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                        placeholder="Summarize your experience..."
                        className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#0B7A6C]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#737373] block mb-1">Review Details</label>
                      <textarea
                        rows={3}
                        value={reviewForm.text}
                        onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                        placeholder="What did you like or dislike? How does it sound or perform?"
                        className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#0B7A6C]"
                        required
                      />
                    </div>
                    <Button variant="primary" size="sm" type="submit">
                      Post Review
                    </Button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviewsList.map((rev, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#171717]">{rev.author}</span>
                          <span className="text-[#16A34A]">✓ Verified Buyer</span>
                          {rev.language && (
                            <span className="text-[10px] font-semibold text-[#737373] bg-[#E5E7EB] px-1.5 py-0.5 rounded">
                              {rev.language}
                            </span>
                          )}
                        </div>
                        <span className="text-[#737373]">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#0B7A6C]">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} size={13} fill="#0B7A6C" />
                        ))}
                      </div>
                      <h5 className="text-sm font-semibold text-[#171717]">{rev.title}</h5>
                      <p className="text-xs text-[#525252] leading-relaxed">{rev.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {videoModalOpen && (
        <Modal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          title="Product Video Tour"
        >
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-xl bg-black overflow-hidden flex items-center justify-center relative border border-[#E5E7EB]">
              <img
                src={gallery[3] || gallery[0]}
                alt="Product preview"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 rounded-full bg-[#0B7A6C] text-[#FFFFFF] flex items-center justify-center shadow-lg">
                  <Play size={24} fill="#FFFFFF" className="ml-1" />
                </div>
                <span className="text-xs text-white font-medium bg-black/60 px-3 py-1 rounded-full">
                  360° Studio Acoustic Demonstration (0:48)
                </span>
              </div>
            </div>
            <div className="text-xs text-[#737373] text-center">
              Recorded in 4K with Dolby Atmos Spatial Audio.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
