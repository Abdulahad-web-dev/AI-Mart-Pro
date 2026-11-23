'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Package, LoaderCircle, Heart, Zap, Check, ShoppingCart, Scale, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { Product, money, imageSrc } from '@/lib/api';
import { useApp, addLocalCart, toggleLocalWishlist, getLocalWishlist } from '@/lib/app-context';
import { post } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toggleCompare, getCompared } from '@/lib/compare';
import { AnimatedCounter } from '@/components/animated-counter';

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  onClick
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'amber';
  className?: string;
  disabled?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
}) {
  return (
    <button disabled={disabled} type={type} onClick={onClick} className={`btn btn-${variant} ${className}`}>
      {children}
    </button>
  );
}

export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="loading">
      <LoaderCircle className="animate-spin" size={24} />
      <span>{text}</span>
    </div>
  );
}

export function Empty({
  title = 'Nothing here yet',
  detail,
  href,
  action
}: {
  title?: string;
  detail?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Package size={28} />
      </div>
      <h3>{title}</h3>
      <p>{detail || 'Check back later or explore our marketplace.'}</p>
      {href && (
        <Link className="btn btn-primary" href={href}>
          {action || 'Explore products'} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

export function Status({ value }: { value: string }) {
  return <span className={`status st-${value.toLowerCase().replace('_', '-')}`}>{value.replaceAll('_', ' ')}</span>;
}

export function Head({
  eyebrow,
  title,
  subtitle,
  actions
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { user, setToast, updateCounts } = useApp();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [isWished, setIsWished] = useState(() => getLocalWishlist().includes(product.id));
  const [isCompared, setIsCompared] = useState(() => getCompared().includes(product.id));

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : null;

  const add = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Local cart increment for immediate reactive UI
    addLocalCart(product.id, 1);
    updateCounts();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    if (user && user.role === 'CUSTOMER') {
      try {
        await post('/api/cart/items', { productId: product.id, quantity: 1 });
      } catch {}
    }
    setToast(`Added "${product.name.slice(0, 24)}..." to cart`);
  };

  const toggleWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleLocalWishlist(product.id);
    setIsWished(next.includes(product.id));
    updateCounts();

    if (user && user.role === 'CUSTOMER') {
      try {
        await post(`/api/wishlist/${product.id}`, {});
      } catch {}
    }
    setToast(next.includes(product.id) ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist');
  };

  const compare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const items = toggleCompare(product.id);
    setIsCompared(items.includes(product.id));
    updateCounts();
    setToast(
      items.includes(product.id)
        ? `Added to comparison (${items.length}/4). Open /compare.`
        : 'Removed from comparison'
    );
  };

  const lowStock = product.stock > 0 && product.stock <= 10;
  const hasRating = Number(product.rating) > 0;

  return (
    <article className="product-card group">
      <Link href={`/product/${product.slug}`} className="product-image">
        <img src={imageSrc(product)} alt={product.name} loading="lazy" />

        <div className="product-badges-top">
          <span className="card-chip-row">
            {discountPercent && <span className="chip chip-discount">-{discountPercent}%</span>}
            {product.featured && (
              <span className="chip chip-featured">
                <Sparkles size={10} /> Top pick
              </span>
            )}
          </span>

          <button
            type="button"
            className={`card-action-btn ${isWished ? 'wished' : ''}`}
            title={isWished ? 'Saved in wishlist' : 'Save to wishlist'}
            onClick={toggleWish}
          >
            <Heart size={15} fill={isWished ? '#ec4899' : 'none'} color={isWished ? '#ec4899' : '#94a3b8'} />
          </button>
        </div>

        {/* Hover Quick Actions */}
        <div className="card-hover-actions">
          <button
            type="button"
            className={`card-compare-pill ${isCompared ? 'active' : ''}`}
            onClick={compare}
            title="Compare in Neural Matrix"
          >
            <Scale size={13} />
            <span>{isCompared ? 'In Matrix' : 'Compare'}</span>
          </button>
        </div>
      </Link>

      <div className="product-body">
        <div className="product-meta-row">
          <span className="category-name">{product.category?.name || 'General'}</span>
          {hasRating ? (
            <span className="rating-inline" title={`${product.rating} out of 5`}>
              <Star size={12} fill="currentColor" strokeWidth={0} /> {Number(product.rating).toFixed(1)}
              <small>({product.reviewCount})</small>
            </span>
          ) : (
            <span className="rating-inline muted">New</span>
          )}
        </div>

        <Link className="product-name" href={`/product/${product.slug}`} title={product.name}>
          {product.name}
        </Link>

        <div className="product-ai-intelligence-bar">
          <div className="intelligence-item">
            <ShieldCheck size={12} />
            <span>{product.vendor?.vendorProfile?.storeName || 'Verified merchant'}</span>
          </div>
          {lowStock && (
            <>
              <span className="dot-divider">·</span>
              <div className="intelligence-item warn">
                <TrendingUp size={12} />
                <span>Only {product.stock} left</span>
              </div>
            </>
          )}
        </div>

        <div className="product-price-section">
          <div className="price-stack">
            <div className="main-price">{money(product.price)}</div>
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="compare-line">
                <del>{money(product.comparePrice)}</del>
                <span className="savings-pill">Save {money(product.comparePrice - product.price)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="product-bottom">
          <span className={`stock-status ${product.stock <= 5 ? 'low' : 'ok'}`}>
            {product.stock <= 0 ? 'Backorder' : product.stock <= 10 ? `Reserve: ${product.stock} units` : 'In Stock'}
          </span>

          <button
            className={`add-btn-lux ${added ? 'added' : ''}`}
            title="Add to Cart"
            onClick={add}
            disabled={product.stock <= 0}
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return message ? (
    <div className="error-note" role="alert">
      {message}
    </div>
  ) : null;
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Metric({
  label,
  value,
  note,
  icon
}: {
  label: string;
  value: string | number;
  note?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <div className="metric-icon">{icon}</div>
      </div>
      <strong><AnimatedCounter value={value} /></strong>
      {note && <small>{note}</small>}
    </div>
  );
}
