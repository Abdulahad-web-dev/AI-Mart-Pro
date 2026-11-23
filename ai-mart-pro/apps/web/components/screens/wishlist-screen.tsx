'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bell,
  Heart,
  ShoppingCart,
  Trash2,
  Share2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { DEMO_PRODUCTS } from '@/lib/demo-products';
import { ProductCard, Button, Checkbox, Badge } from '@/components/aimart-ui';

export function WishlistScreen() {
  const { wishlist, wishlistProducts: ctxWishlistProducts, toggleWishlist, addToCart, setToast } = useApp();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Real saved products or realistic sample
  const savedFromDemo = DEMO_PRODUCTS.filter((p) => wishlist.includes(p.id));
  const wishlistProducts =
    ctxWishlistProducts && ctxWishlistProducts.length > 0
      ? ctxWishlistProducts
      : savedFromDemo.length > 0
      ? savedFromDemo
      : DEMO_PRODUCTS.slice(0, 6);
  const recommendations = DEMO_PRODUCTS.slice(8, 12);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(wishlistProducts.map((p) => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleToggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMoveSelectedToCart = () => {
    selectedItems.forEach((id) => {
      const prod = wishlistProducts.find((p) => p.id === id);
      if (prod) addToCart(prod, 1);
    });
    setToast(`Moved ${selectedItems.length} items to your cart`);
    setSelectedItems([]);
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach((id) => toggleWishlist(id));
    setToast(`Removed ${selectedItems.length} items from wishlist`);
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] pb-24">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-[#FFFFFF]/80 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#171717]">
              My Wishlist <span className="text-sm font-normal text-[#737373]">({wishlistProducts.length} items)</span>
            </h1>
            <p className="text-xs text-[#737373]">Items saved across all devices and sessions.</p>
          </div>

          <button
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                setToast('Wishlist link copied to clipboard');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] text-xs text-[#171717] hover:border-[#0B7A6C] transition-colors"
          >
            <Share2 size={13} /> Share List
          </button>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* PRICE DROP ALERT BANNER matching Screenshot 10 */}
        <div className="bg-[#FFFFFF] border border-[#0B7A6C]/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(11, 122, 108,0.15)] text-[#0B7A6C] flex items-center justify-center flex-shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171717]">Price Drop Alert!</h3>
              <p className="text-xs text-[#525252]">
                Good news! <span className="text-[#0B7A6C] font-semibold">2 items</span> in your wishlist dropped in price today.
              </p>
            </div>
          </div>
          <button
            onClick={() => setToast('Viewing price drop discounted items')}
            className="text-xs text-[#0B7A6C] font-semibold hover:underline flex-shrink-0"
          >
            View Discounts →
          </button>
        </div>

        {/* BULK ACTION BAR matching Screenshot 10 */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2.5 text-xs text-[#171717] cursor-pointer select-none">
            <Checkbox
              checked={
                selectedItems.length === wishlistProducts.length &&
                wishlistProducts.length > 0
              }
              onChange={handleSelectAll}
            />
            <span className="font-medium">
              Select All ({selectedItems.length}/{wishlistProducts.length})
            </span>
          </label>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedItems.length === 0}
              onClick={handleMoveSelectedToCart}
              className="flex items-center gap-1.5 text-xs"
            >
              <ShoppingCart size={14} /> Move Selected to Cart
            </Button>
            <Button
              variant="danger-soft"
              size="sm"
              disabled={selectedItems.length === 0}
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 text-xs"
            >
              <Trash2 size={14} /> Delete Selected
            </Button>
          </div>
        </div>

        {/* 4-COLUMN PRODUCT GRID WITH CHECKBOXES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlistProducts.map((p, idx) => {
            const isSel = selectedItems.includes(p.id);
            return (
              <div
                key={p.id}
                className="relative group bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-3 flex flex-col justify-between hover:border-[#0B7A6C]/50 transition-colors"
              >
                {/* Selection Checkbox */}
                <div className="absolute top-5 left-5 z-10">
                  <Checkbox
                    checked={isSel}
                    onChange={() => handleToggleItem(p.id)}
                  />
                </div>

                <div className="relative aspect-square rounded-xl bg-[#F1F5F9] overflow-hidden mb-3">
                  <img
                    src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {idx < 2 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="orange">-25% Drop</Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider block">
                      {p.category?.name || 'Electronics'}
                    </span>
                    <Link
                      href={`/product/${p.id}`}
                      className="text-xs font-semibold text-[#171717] hover:text-[#0B7A6C] transition-colors line-clamp-2 mt-0.5"
                    >
                      {p.name}
                    </Link>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-bold text-[#0B7A6C]">
                        ${p.price.toFixed(2)}
                      </span>
                      {p.comparePrice && (
                        <span className="text-xs text-[#737373] line-through">
                          ${p.comparePrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => addToCart(p, 1)}
                    >
                      <ShoppingCart size={13} /> Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BASED ON YOUR WISHLIST RECOMMENDATION SECTION */}
        <div className="pt-10 border-t border-[#E5E7EB] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
                <Sparkles size={17} className="text-[#0B7A6C]" />
                Based on your wishlist
              </h2>
              <p className="text-xs text-[#737373]">
                AI-recommended companions and trending accessories.
              </p>
            </div>
            <Link href="/shop" className="text-xs text-[#0B7A6C] hover:underline font-medium">
              View All Recommendations →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {recommendations.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isWishlisted={wishlist.includes(p.id)}
                onToggleWishlist={() => toggleWishlist(p.id)}
                onAddToCart={() => addToCart(p, 1)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
