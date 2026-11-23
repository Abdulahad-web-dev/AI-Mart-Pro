'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Search, Heart, ShoppingBag, Star, Plus, Minus, Check, X, ArrowRight,
  TrendingUp, TrendingDown, Bot, Send, Mic, Copy, ChevronDown, ChevronRight,
  ShieldCheck, Truck, ShieldAlert, Sparkles, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Product, money, imageSrc } from '@/lib/api';
import { AnimatedCounter } from '@/components/animated-counter';
export { AnimatedCounter };

/* ==========================================================================
   ANIMATION PRESETS (Framer Motion cubic-bezier(0.22, 1, 0.36, 1))
   ========================================================================== */
export const easeCurve = [0.22, 1, 0.36, 1] as const;

export const fadeInVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeCurve } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: easeCurve } }
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 }
  }
};

/* ==========================================================================
   1. BUTTON COMPONENT
   ========================================================================== */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger-soft';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  glow?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  glow = false,
  icon,
  iconRight,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    primary:
      'bg-[#0B7A6C] text-[#FFFFFF] hover:bg-[#09665A] font-semibold border-none ' +
      (glow ? 'shadow-[0_6px_20px_rgba(11,122,108,0.35)]' : ''),
    secondary: 'bg-[#F5F7F8] text-[#1B1F23] hover:bg-[#E6F4F1] border border-[#E5E7EB]',
    outline:
      'bg-transparent text-[#1B1F23] border border-[#E5E7EB] hover:border-[#0B7A6C] hover:text-[#0B7A6C]',
    ghost: 'bg-transparent text-[#6B7280] hover:text-[#1B1F23] hover:bg-[#FFFFFF] border-none',
    'danger-soft': 'bg-[#FEE2E2] text-[#E53935] hover:bg-[#FECACA] border-none',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-[6px] gap-1.5 h-8',
    md: 'text-sm px-4 py-2.5 rounded-[6px] gap-2 h-10',
    lg: 'text-base px-6 py-3.5 rounded-[8px] gap-2.5 h-12'
  };

  return (
    <motion.button
      whileHover={shouldReduceMotion || disabled ? {} : { y: -2 }}
      whileTap={shouldReduceMotion || disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.18, ease: easeCurve }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-sans tracking-[0.02em] transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...(props as any)}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
        </>
      )}
    </motion.button>
  );
}

/* ==========================================================================
   2. FORM CONTROLS
   ========================================================================== */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export function Input({
  label,
  error,
  icon,
  clearable,
  onClear,
  value,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-[#525252] tracking-[0.02em]">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <span className="absolute left-3 text-[#737373] pointer-events-none flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          value={value}
          className={`w-full bg-[#F8FAFC] border ${error ? 'border-[#FEE2E2] focus:ring-1 focus:ring-[#DC2626]' : 'border-[#E5E7EB] focus:border-[#0B7A6C] focus:ring-2 focus:ring-[#0B7A6C]/20'} text-[#171717] text-sm rounded-[6px] transition-all outline-none placeholder-[#737373] h-10 ${icon ? 'pl-9' : 'pl-3'} ${clearable && value ? 'pr-9' : 'pr-3'} ${className}`}
          {...props}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-[#737373] hover:text-[#171717] transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {error && (
        <motion.span
          initial={{ x: -4, opacity: 0 }}
          animate={{ x: [ -4, 4, -4, 4, 0 ], opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="text-xs text-[#DC2626]"
        >
          {error}
        </motion.span>
      )}
    </div>
  );
}

export function SearchBar({
  placeholder = 'Search products...',
  value,
  onChange,
  onSearch,
  className = ''
}: {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onSearch?: () => void;
  className?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch?.();
      }}
      className={`relative flex items-center bg-[#F8FAFC] border border-[#E5E7EB] focus-within:border-[#0B7A6C] focus-within:ring-2 focus-within:ring-[#0B7A6C]/20 rounded-[8px] px-3 h-10 transition-all ${className}`}
    >
      <Search size={16} className="text-[#737373] mr-2 flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[#171717] placeholder-[#737373] text-sm outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-[#737373] hover:text-[#171717] ml-1 flex-shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className = ''
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-[#525252] hover:text-[#171717] transition-colors ${className}`}>
      <span
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${checked ? 'bg-[#0B7A6C] border-[#0B7A6C] text-[#FFFFFF]' : 'bg-[#F8FAFC] border-[#E5E7EB] text-transparent'}`}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

export function Radio({
  checked,
  onChange,
  label,
  name,
  value,
  className = ''
}: {
  checked: boolean;
  onChange: () => void;
  label?: React.ReactNode;
  name?: string;
  value?: string;
  className?: string;
}) {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-[#525252] hover:text-[#171717] transition-colors ${className}`}>
      <span
        onClick={onChange}
        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${checked ? 'border-[#0B7A6C]' : 'border-[#E5E7EB] bg-[#F8FAFC]'}`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-[#0B7A6C]" />}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

export function Slider({
  min = 0,
  max = 1000,
  step = 10,
  value,
  onChange,
  label
}: {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  label?: string;
}) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <div className="flex justify-between items-center text-xs text-[#525252]">
          <span>{label}</span>
          <span className="text-[#0B7A6C] font-semibold">${value}</span>
        </div>
      )}
      <div className="relative w-full h-5 flex items-center">
        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div className="h-full bg-[#0B7A6C]" style={{ width: `${percentage}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-[#0B7A6C] border-2 border-[#F8FAFC] shadow-md pointer-events-none -ml-2 transition-transform"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   3. CARDS, STATS & BADGES
   ========================================================================== */
export function Card({
  children,
  className = '',
  hoverEffect = false,
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={hoverEffect && !shouldReduceMotion ? { y: -4, borderColor: 'rgba(11, 122, 108,0.4)' } : {}}
      transition={{ duration: 0.25, ease: easeCurve }}
      onClick={onClick}
      className={`bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-5 text-[#171717] ${hoverEffect ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  trend,
  trendPositive,
  icon,
  danger = false
}: {
  label: string;
  value: string | number;
  trend?: string | number;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  danger?: boolean;
}) {
  const isPositive =
    trendPositive !== undefined
      ? trendPositive
      : typeof trend === 'number'
      ? trend >= 0
      : typeof trend === 'string'
      ? !trend.startsWith('-')
      : true;

  const trendFormatted =
    typeof trend === 'number'
      ? `${trend >= 0 ? '+' : ''}${trend}%`
      : trend;
  return (
    <div
      className={`p-5 rounded-[10px] border relative flex flex-col justify-between transition-all ${
        danger
          ? 'bg-[#FFFFFF] border-[#FEE2E2] shadow-[0_0_20px_rgba(139,0,0,0.2)]'
          : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_8px_24px_rgba(15,23,42,0.08)]'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#525252]">
          {label}
        </span>
        {icon && (
          <div
            className={`w-9 h-9 rounded-[8px] flex items-center justify-center ${
              danger ? 'bg-[#FEE2E2]/30 text-[#DC2626]' : 'bg-[rgba(11, 122, 108,0.12)] text-[#0B7A6C]'
            }`}
          >
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-extrabold text-[#171717] tracking-tight mb-1.5">
          <AnimatedCounter value={value} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1.5 text-xs">
            {isPositive ? (
              <TrendingUp size={14} className="text-[#16A34A]" />
            ) : (
              <TrendingDown size={14} className="text-[#DC2626]" />
            )}
            <span
              className={
                isPositive
                  ? 'text-[#16A34A] font-medium'
                  : 'text-[#DC2626] font-medium'
              }
            >
              {trendFormatted}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'orange' | 'danger' | 'success';
  className?: string;
}) {
  const styles = {
    default: 'bg-[#F1F5F9] text-[#171717] border border-[#E5E7EB]',
    accent: 'bg-[rgba(11, 122, 108,0.15)] text-[#0B7A6C] border border-[#0B7A6C]/30',
    orange: 'bg-[#0B7A6C] text-[#FFFFFF] font-bold',
    danger: 'bg-[#FEE2E2]/40 text-[#DC2626] border border-[#FEE2E2]',
    success: 'bg-[#16A34A]/15 text-[#16A34A] border border-[#16A34A]/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-[0.04em] uppercase ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ==========================================================================
   4. PRODUCT CARD & PROGRESS VARIANT
   ========================================================================== */
export function ProductCard({
  product,
  badge,
  isWished = false,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  showProgressBar = false,
  soldPercent = 75,
  availableCount = 15
}: {
  product: Product;
  badge?: string;
  isWished?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: ((productId: string) => void) | (() => void);
  onAddToCart?: ((product: Product) => void) | (() => void);
  showProgressBar?: boolean;
  soldPercent?: number;
  availableCount?: number;
}) {
  const effectiveWish = isWishlisted !== undefined ? isWishlisted : isWished;
  const shouldReduceMotion = useReducedMotion();
  const [wished, setWished] = useState(effectiveWish);
  const [justWished, setJustWished] = useState(false);
  const [addedRecently, setAddedRecently] = useState(false);

  useEffect(() => {
    setWished(effectiveWish);
  }, [effectiveWish]);

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              y: -5,
              borderColor: '#0B7A6C',
              boxShadow: '0 18px 34px -10px rgba(11,122,108,0.16), 0 4px 12px rgba(0,0,0,0.04)',
            }
      }
      transition={{ duration: 0.25, ease: easeCurve }}
      className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] overflow-hidden flex flex-col h-full shadow-[0_2px_10px_rgba(15,23,42,0.04)] relative group transition-colors"
    >
      {/* Clean White / Light Product Image Container matching Reference Picture */}
      <div className="relative aspect-square w-full bg-[#F8FAFC] p-3 overflow-hidden flex items-center justify-center">
        <Link
          href={`/product/${product.slug || product.id}`}
          className="block w-full h-full rounded-xl overflow-hidden"
        >
          <motion.img
            src={imageSrc(product)}
            alt={product.name}
            whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
            transition={{ duration: 0.4, ease: easeCurve }}
            className="w-full h-full object-cover rounded-xl"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.err) {
                target.dataset.err = '1';
                target.src = '/images/0.jpg';
              }
            }}
          />
        </Link>

        {/* Badge Top-Left */}
        {(badge || discount > 0 || product.featured) && (
          <div className="absolute top-3 left-3 z-10">
            {discount > 0 ? (
              <span className="bg-[#E53935] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide shadow-xs">
                -{discount}% Off
              </span>
            ) : badge ? (
              <span className="bg-[#0B7A6C] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide shadow-xs">
                {badge}
              </span>
            ) : product.featured ? (
              <span className="bg-[#0B7A6C] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide shadow-xs">
                Featured
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Body — Centered Sellzy Mega-Store Layout */}
      <div className="p-4 pt-2 flex flex-col flex-1 justify-between gap-2.5 text-center">
        <div className="space-y-1.5">
          {/* Soft Pink Countdown Pill (matches Reference Picture) */}
          <div className="inline-flex items-center justify-center px-3 py-0.5 rounded-full bg-[#FFE4E6] text-[#E53935] text-[10px] font-bold tracking-tight">
            {showProgressBar
              ? `71 Day : 19 Hr : 30 Min · ${soldPercent}% Sold`
              : `${product.category?.name || 'Electronics'} · ${
                  product.stock && product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'
                }`}
          </div>

          {/* Product Title */}
          <Link
            href={`/product/${product.slug || product.id}`}
            className="block text-[13.5px] font-bold text-[#1B1F23] hover:text-[#0B7A6C] transition-colors line-clamp-2 leading-snug min-h-[36px]"
          >
            {product.name}
          </Link>

          {/* 5 Yellow Stars + Review Count */}
          <div className="flex items-center justify-center gap-1 text-xs">
            <div className="flex items-center gap-0.5 text-[#FFC531]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} className="fill-[#FFC531] text-[#FFC531]" />
              ))}
            </div>
            <span className="text-[11px] text-[#6B7280]">({product.reviewCount || 120})</span>
          </div>

          {/* Price Row (Teal Bold + Muted Strikethrough) */}
          <div className="flex items-baseline justify-center gap-2 pt-0.5">
            <span className="text-[15px] font-extrabold text-[#0B7A6C]">
              {money(product.price)}
            </span>
            {(discount > 0 || product.comparePrice) && (
              <s className="text-xs text-[#9CA3AF] font-normal">
                {money(product.comparePrice || Math.round(product.price * 1.18))}
              </s>
            )}
          </div>
        </div>

        {/* Bottom Action Row: Circular Heart Button on Left + Teal Pill "Add To Cart" on Right */}
        <div className="flex items-center gap-2 pt-2">
          <motion.button
            type="button"
            aria-label="Wishlist"
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.preventDefault();
              const next = !wished;
              setWished(next);
              if (next) setJustWished(true);
              onToggleWishlist?.(product.id);
            }}
            className={`relative w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
              wished
                ? 'bg-[#FFE4E6] border-[#E53935] text-[#E53935]'
                : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#0B7A6C] hover:text-[#0B7A6C]'
            }`}
          >
            <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
            {justWished && (
              <motion.span
                initial={{ scale: 0.7, opacity: 0.85 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 0.35 }}
                onAnimationComplete={() => setJustWished(false)}
                className="absolute inset-0 rounded-full border-2 border-[#E53935] pointer-events-none"
              />
            )}
          </motion.button>

          <motion.button
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            disabled={product.stock !== undefined && product.stock <= 0}
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product);
              setAddedRecently(true);
              setTimeout(() => setAddedRecently(false), 1400);
            }}
            aria-label="Add to cart"
            className={`flex-1 h-9 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-bold shadow-[0_4px_12px_rgba(11,122,108,0.25)] transition-all cursor-pointer ${
              addedRecently
                ? 'bg-[#075E54] text-white'
                : 'bg-[#0B7A6C] text-white hover:bg-[#09665A]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {addedRecently ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={13} />
                <span>Add To Cart</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

/* ==========================================================================
   5. SKELETON LOADER
   ========================================================================== */
export function ProductSkeleton() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] overflow-hidden flex flex-col h-[340px] relative">
      <div className="relative aspect-square w-full bg-[#F1F5F9] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
      </div>
      <div className="p-4 flex flex-col gap-2.5 flex-1 justify-between">
        <div className="space-y-2">
          <div className="w-16 h-3 bg-[#F1F5F9] rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
          </div>
          <div className="w-full h-4 bg-[#F1F5F9] rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
          </div>
          <div className="w-3/4 h-4 bg-[#F1F5F9] rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="w-20 h-5 bg-[#F1F5F9] rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
          </div>
          <div className="w-9 h-9 bg-[#F1F5F9] rounded-[8px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   6. PAGINATION
   ========================================================================== */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5 my-8 select-none" aria-label="Pagination">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 h-9 rounded-[6px] border border-[#E5E7EB] text-sm text-[#171717] bg-[#FFFFFF] hover:border-[#0B7A6C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`min-w-9 h-9 px-3 rounded-[6px] text-sm font-semibold transition-all ${
            p === currentPage
              ? 'bg-[#0B7A6C] text-[#FFFFFF] font-bold shadow-[0_2px_8px_rgba(11, 122, 108,0.3)]'
              : 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#171717] hover:border-[#0B7A6C]'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 h-9 rounded-[6px] border border-[#E5E7EB] text-sm text-[#171717] bg-[#FFFFFF] hover:border-[#0B7A6C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </nav>
  );
}

/* ==========================================================================
   7. TABS, STEPPER, TIMELINE, BREADCRUMB
   ========================================================================== */
export function Tabs({
  tabs,
  activeTab,
  onChange
}: {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex border-b border-[#E5E7EB] gap-6 w-full overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative py-3.5 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              isActive ? 'text-[#0B7A6C]' : 'text-[#525252] hover:text-[#171717]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-[#737373]">({tab.count})</span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#0B7A6C]"
                transition={{ duration: 0.25, ease: easeCurve }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({
  steps,
  currentStep
}: {
  steps: Array<string | { number?: number; label: string }>;
  currentStep: number;
}) {
  return (
    <div className="flex items-center max-w-xl mx-auto w-full my-6">
      {steps.map((item, index) => {
        const label = typeof item === 'string' ? item : item.label;
        const stepNum = typeof item === 'object' && item.number ? item.number : index + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive || isDone
                    ? 'bg-[#0B7A6C] text-[#FFFFFF]'
                    : 'bg-[#F1F5F9] text-[#737373] border border-[#E5E7EB]'
                }`}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : stepNum}
              </div>
              <span
                className={`text-xs font-semibold ${
                  isActive ? 'text-[#171717]' : 'text-[#737373]'
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 transition-colors ${
                  stepNum < currentStep ? 'bg-[#0B7A6C]' : 'bg-[#E5E7EB]'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function Timeline({
  items
}: {
  items: { title: string; time?: string; active?: boolean; done?: boolean }[];
}) {
  return (
    <div className="relative pl-6 space-y-6">
      <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-[#E5E7EB]" />
      {items.map((item, idx) => (
        <div key={idx} className="relative flex items-start gap-3">
          <div
            className={`absolute -left-6 mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-[#F8FAFC] transition-all ${
              item.active
                ? 'border-[#0B7A6C] bg-[#0B7A6C]'
                : item.done
                ? 'border-[#0B7A6C]'
                : 'border-[#737373]'
            }`}
          >
            {item.done && <span className="w-1.5 h-1.5 rounded-full bg-[#0B7A6C]" />}
          </div>
          <div>
            <div
              className={`text-sm font-semibold ${
                item.active ? 'text-[#0B7A6C]' : item.done ? 'text-[#171717]' : 'text-[#737373]'
              }`}
            >
              {item.title}
            </div>
            {item.time && <div className="text-xs text-[#737373]">{item.time}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Breadcrumb({
  items
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#737373] mb-6 select-none" aria-label="Breadcrumb">
      {items.map((it, idx) => (
        <React.Fragment key={idx}>
          {it.href ? (
            <Link href={it.href} className="hover:text-[#0B7A6C] transition-colors">
              {it.label}
            </Link>
          ) : (
            <span className="text-[#171717] font-medium">{it.label}</span>
          )}
          {idx < items.length - 1 && <ChevronRight size={12} className="text-[#E5E7EB]" />}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ==========================================================================
   8. QUANTITY STEPPER & PRICE SUMMARY
   ========================================================================= */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center border border-[#E5E7EB] rounded-[6px] bg-[#F8FAFC] h-9">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-full flex items-center justify-center text-[#525252] hover:text-[#171717] disabled:opacity-30 cursor-pointer"
      >
        <Minus size={13} />
      </button>
      <span className="w-9 text-center text-xs font-bold text-[#171717]">
        {value}
      </span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-full flex items-center justify-center text-[#525252] hover:text-[#171717] disabled:opacity-30 cursor-pointer"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

export function PriceSummary({
  subtotal,
  discount = 0,
  shipping = 0,
  tax = 0,
  total,
  buttonText = 'Proceed to Checkout',
  onProceed
}: {
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total: number;
  buttonText?: string;
  onProceed?: () => void;
}) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4">
      <h3 className="text-base font-bold text-[#171717]">Order Summary</h3>
      <div className="space-y-2 text-sm text-[#525252]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="text-[#171717] font-medium">{money(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[#0B7A6C]">
            <span>Discount</span>
            <span>-{money(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Estimated Shipping</span>
          <span className="text-[#171717] font-medium">
            {shipping === 0 ? 'Free' : money(shipping)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Tax</span>
          <span className="text-[#171717] font-medium">{money(tax)}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-[#E5E7EB] flex justify-between items-baseline">
        <span className="text-base font-bold text-[#171717]">Total</span>
        <span className="text-2xl font-extrabold text-[#0B7A6C]">{money(total)}</span>
      </div>

      <Button variant="primary" fullWidth size="lg" glow onClick={onProceed}>
        {buttonText}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-[#737373] pt-1">
        <ShieldCheck size={14} className="text-[#0B7A6C]" />
        <span>Payments are 256-bit SSL encrypted.</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   9. CHAT WIDGET (AI ASSISTANT SUPPORT)
   ========================================================================== */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: 'bot' | 'user'; text: string; time: string }[]
  >([
    {
      sender: 'bot',
      text: "Welcome back to AI MART! I'm your digital concierge. I noticed you were looking at the New Releases. How can I assist you today?",
      time: '10:24 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: nowTime }
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `I've analyzed your query regarding "${userMsg}". Your active order #AI-8472-991 is currently In Transit and scheduled for delivery tomorrow by 8:00 PM!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.28, ease: easeCurve }}
            className="w-[420px] max-w-[calc(100vw-32px)] h-[520px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-[0_20px_50px_rgba(15,23,42,0.14)] flex flex-col overflow-hidden mb-3"
          >
            {/* Header */}
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-[#0B7A6C]/20 flex items-center justify-center text-[#0B7A6C]">
                  <Bot size={20} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#16A34A] border-2 border-[#F8FAFC]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#171717]">AI MART Support</h4>
                  <div className="text-[11px] text-[#16A34A] flex items-center gap-1">
                    <span>⚡ Always Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#737373] hover:text-[#171717] p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-center my-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#737373] bg-[#F1F5F9] px-2.5 py-1 rounded-full">
                  Today, 10:24 AM
                </span>
              </div>

              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-[10px] text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#0B7A6C] text-[#FFFFFF] font-medium'
                        : 'bg-[#F1F5F9] text-[#171717]'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-[#737373] mt-1 px-1">{m.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-[10px] bg-[#F1F5F9] w-16">
                  <span className="w-2 h-2 rounded-full bg-[#0B7A6C] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#0B7A6C] animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#0B7A6C] animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Row */}
            <div className="p-3 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-[#171717] placeholder-[#737373] outline-none px-2"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-[6px] bg-[#0B7A6C] text-[#FFFFFF] flex items-center justify-center disabled:opacity-40 cursor-pointer flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-[#0B7A6C] text-[#FFFFFF] flex items-center justify-center shadow-[0_8px_24px_rgba(11, 122, 108,0.35)] cursor-pointer relative"
      >
        <Bot size={26} />
        {!open && (
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#0B7A6C] border-2 border-[#F8FAFC] rounded-full animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}

/* ==========================================================================
   10. CHART AREA & PROGRESS BAR ROW
   ========================================================================== */
export function ChartArea({
  data,
  height = 240
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="peachGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0B7A6C" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0B7A6C" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            stroke="#737373"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            stroke="#737373"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              borderRadius: '8px',
              color: '#171717',
              fontSize: '12px'
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0B7A6C"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#peachGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProgressBarRow({
  label,
  value,
  max = 100,
  color = '#0B7A6C'
}: {
  label?: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-[#525252]">{label}</span>
          <span className="font-semibold text-[#171717]">{percent}%</span>
        </div>
      )}
      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: easeCurve }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   11. MODAL COMPONENT
   ========================================================================== */
export function Modal({
  isOpen,
  onClose,
  title,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-4">
          {title && <h3 className="text-base font-bold text-[#171717]">{title}</h3>}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F1F5F9] transition-colors ml-auto"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
        <div>{children}</div>
      </motion.div>
    </div>
  );
}
