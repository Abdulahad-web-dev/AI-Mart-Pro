'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Bookmark,
  ShieldCheck,
  Truck,
  Sparkles,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { money } from '@/lib/api';
import {
  QuantityStepper,
  PriceSummary,
  ProgressBarRow,
  Button
} from '@/components/aimart-ui';

export function CartScreen() {
  const { cart, removeFromCart, updateCartQuantity, toggleWishlist, setToast } = useApp();
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  // Free shipping threshold: PKR 5,000
  const freeShippingThreshold = 5000;
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const shippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 350;
  const discountAmount = (subtotal * discountPercent) / 100;
  const estimatedTax = subtotal * 0.05;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping + estimatedTax);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'AIMART20' || code === 'SAVE20') {
      setDiscountPercent(20);
      setPromoApplied(true);
      setToast('Promo code applied: 20% off!');
    } else if (code === 'SAVE10') {
      setDiscountPercent(10);
      setPromoApplied(true);
      setToast('Promo code applied: 10% off!');
    } else {
      setToast('Invalid promo code. Try SAVE20');
    }
  };

  const handleSaveForLater = (productId: string, productName: string) => {
    toggleWishlist(productId);
    removeFromCart(productId);
    setToast(`Saved "${productName.slice(0, 24)}" to wishlist`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#171717] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-8 text-center space-y-6 shadow-xl"
        >
          <div className="w-20 h-20 rounded-full bg-[rgba(11, 122, 108,0.12)] text-[#0B7A6C] flex items-center justify-center mx-auto">
            <ShoppingBag size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#171717]">Your Cart is Empty</h2>
            <p className="text-sm text-[#737373]">
              Looks like you haven&apos;t added any cutting-edge tech or curated essentials to your order yet.
            </p>
          </div>
          <Link href="/shop" className="block">
            <Button variant="primary" size="lg" className="w-full">
              Explore The Catalog <ArrowRight size={16} />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] pb-24">
      {/* Page Header */}
      <div className="border-b border-[#E5E7EB] bg-[#FFFFFF]/80 backdrop-blur-md">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] text-[#737373] hover:text-[#171717] transition-colors"
              aria-label="Back to store"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#171717]">Shopping Cart</h1>
              <span className="text-xs text-[#737373]">
                {cart.reduce((s, i) => s + i.quantity, 0)} items in your cart
              </span>
            </div>
          </div>

          <Link href="/shop" className="text-xs text-[#0B7A6C] hover:underline font-medium">
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* LEFT: Free Shipping Bar & Cart Items List */}
          <div className="space-y-6">
            {/* Free Shipping Progress Card matching Screenshot 6 */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 font-medium text-[#171717]">
                  <Truck size={17} className="text-[#0B7A6C]" />
                  {amountNeeded === 0 ? (
                    <span className="text-[#16A34A] font-semibold">
                      You unlocked FREE Express Nationwide Shipping!
                    </span>
                  ) : (
                    <>
                      Add <span className="text-[#0B7A6C] font-bold">{money(amountNeeded)}</span>{' '}
                      more for FREE express shipping
                    </>
                  )}
                </span>
                <span className="text-xs font-mono text-[#737373]">{shippingPercent}%</span>
              </div>
              <ProgressBarRow value={shippingPercent} max={100} color="#0B7A6C" />
            </div>

            {/* Cart Items Table / List */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between text-xs uppercase tracking-wider text-[#737373] font-semibold">
                <span>Product Item</span>
                <div className="hidden sm:flex items-center gap-16 pr-4">
                  <span>Price</span>
                  <span>Quantity</span>
                  <span>Total</span>
                </div>
              </div>

              <div className="divide-y divide-[#E5E7EB]">
                <AnimatePresence>
                  {cart.map(({ product, quantity }) => {
                    const lineTotal = product.price * quantity;
                    const variant = 'Obsidian Black / 44mm';
                    const imgUrl =
                      product.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80';

                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        {/* Item Details */}
                        <div className="flex items-start sm:items-center gap-4 flex-1">
                          <div className="w-20 h-20 rounded-xl bg-[#F1F5F9] border border-[#E5E7EB] overflow-hidden flex-shrink-0">
                            <img
                              src={imgUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="space-y-1">
                            <Link
                              href={`/product/${product.id}`}
                              className="text-sm font-semibold text-[#171717] hover:text-[#0B7A6C] transition-colors line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-[#737373]">Variant: {variant}</p>
                            <span className="text-xs text-[#16A34A]">In Stock · Ships within 24h</span>

                            {/* Mobile only controls */}
                            <div className="flex sm:hidden items-center gap-4 pt-2">
                              <span className="text-sm font-bold text-[#0B7A6C]">
                                {money(lineTotal)}
                              </span>
                              <QuantityStepper
                                value={quantity}
                                min={1}
                                max={product.stock || 20}
                                onChange={(val) => updateCartQuantity(product.id, val)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden sm:flex items-center gap-8">
                          <span className="text-xs font-mono text-[#525252]">
                            {money(product.price)}
                          </span>

                          <QuantityStepper
                            value={quantity}
                            min={1}
                            max={product.stock || 20}
                            onChange={(val) => updateCartQuantity(product.id, val)}
                          />

                          <span className="text-sm font-bold font-mono text-[#0B7A6C] min-w-[70px] text-right">
                            {money(lineTotal)}
                          </span>
                        </div>

                        {/* Actions: Save for later & Remove */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB]">
                          <button
                            onClick={() => handleSaveForLater(product.id, product.name)}
                            className="text-xs text-[#525252] hover:text-[#0B7A6C] flex items-center gap-1 transition-colors"
                          >
                            <Bookmark size={13} /> Save for Later
                          </button>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-xs text-[#DC2626] hover:text-red-400 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Summary Card matching Screenshot 6 */}
          <aside className="sticky top-20 space-y-6">
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-xl space-y-6">
              <h2 className="text-lg font-bold text-[#171717] pb-4 border-b border-[#E5E7EB]">
                Order Summary
              </h2>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
                  <Tag size={13} className="text-[#0B7A6C]" /> Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code (e.g. SAVE20)"
                    className="flex-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#171717] placeholder-[#737373] focus:outline-none focus:border-[#0B7A6C] transition-colors"
                  />
                  <Button variant="outline" size="sm" type="submit">
                    Apply
                  </Button>
                </div>
                {promoApplied && (
                  <span className="text-[11px] text-[#16A34A] flex items-center gap-1 mt-1">
                    ✓ Promo code applied: 20% discount
                  </span>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-2 text-sm text-[#525252]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#171717]">{money(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#16A34A]">
                    <span>Discount (20%)</span>
                    <span className="font-mono">-{money(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono text-[#171717]">
                    {shipping === 0 ? (
                      <span className="text-[#16A34A] font-medium">FREE</span>
                    ) : (
                      money(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-mono text-[#171717]">{money(estimatedTax)}</span>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB] flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#171717]">Total</span>
                  <span className="text-2xl font-extrabold text-[#0B7A6C] font-mono">
                    {money(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link href="/checkout" className="block pt-2">
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Checkout <ArrowRight size={16} />
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-2 text-xs text-[#737373] pt-2">
                <ShieldCheck size={14} className="text-[#16A34A]" />
                <span>256-Bit SSL Encrypted &amp; Guaranteed</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

