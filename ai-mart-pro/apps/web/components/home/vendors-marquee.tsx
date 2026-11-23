'use client';
import React, { useState } from 'react';
import { Store, CheckCircle2, ShieldCheck } from 'lucide-react';

export interface VendorPill {
  id: string;
  name: string;
  city: string;
  category: string;
  verified: boolean;
}

const DEFAULT_VENDORS: VendorPill[] = [
  { id: 'v1', name: 'Northstar AI Electronics', city: 'Lahore', category: 'Audio & Tech', verified: true },
  { id: 'v2', name: 'SoundCore Direct', city: 'Karachi', category: 'Acoustics', verified: true },
  { id: 'v3', name: 'Time & Tech Watchmakers', city: 'Islamabad', category: 'Wearables', verified: true },
  { id: 'v4', name: 'Urban Steps Footwear', city: 'Faisalabad', category: 'Fashion', verified: true },
  { id: 'v5', name: 'Carry Culture Packs', city: 'Sialkot', category: 'Accessories', verified: true },
  { id: 'v6', name: 'Glow House Organic', city: 'Lahore', category: 'Skincare', verified: true },
  { id: 'v7', name: 'Nest Living Studio', city: 'Rawalpindi', category: 'Home & Decor', verified: true },
  { id: 'v8', name: 'Active Nation Gear', city: 'Karachi', category: 'Sporting Goods', verified: true },
  { id: 'v9', name: 'PakTech Peripherals', city: 'Multan', category: 'Computing', verified: true },
  { id: 'v10', name: 'Indus Crafts & Apparel', city: 'Peshawar', category: 'Artisan', verified: true }
];

export function VendorsMarquee({
  vendors = DEFAULT_VENDORS,
  className = ''
}: {
  vendors?: VendorPill[];
  className?: string;
}) {
  // Duplicate for seamless 50% translateX loop
  const duplicated = [...vendors, ...vendors];

  return (
    <section className={`w-full py-8 overflow-hidden select-none ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store size={16} className="text-[#0B7A6C]" />
          <span className="font-manrope text-xs sm:text-sm font-bold uppercase tracking-wider text-[#171717]">
            Vendors We Carry
          </span>
        </div>
        <span className="text-[11px] text-[#737373] hidden sm:inline">
          100% Escrow Verified Merchants Across Pakistan
        </span>
      </div>

      {/* Edge-Fade Mask Container */}
      <div
        className="group relative w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)'
        }}
      >
        <div className="flex gap-4 w-max animate-[marquee_28s_linear_infinite] group-hover:[animation-play-state:paused] py-2">
          {duplicated.map((vendor, idx) => (
            <div
              key={`${vendor.id}-${idx}`}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:border-[#0B7A6C] hover:shadow-[0_8px_24px_rgba(11, 122, 108,0.12)] transition-all cursor-pointer flex-shrink-0"
            >
              {/* Vendor Monogram Icon */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E6F4F1] to-[#A7F3D0]/60 text-[#0B7A6C] flex items-center justify-center font-bold text-xs border border-[#A7F3D0]">
                {vendor.name.charAt(0)}
              </div>

              {/* Vendor Details */}
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-manrope font-bold text-xs text-[#171717] whitespace-nowrap">
                    {vendor.name}
                  </span>
                  {vendor.verified && (
                    <CheckCircle2 size={13} className="text-[#16A34A] flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#737373]">
                  <span>{vendor.city}</span>
                  <span>&bull;</span>
                  <span className="text-[#0B7A6C] font-medium">{vendor.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VendorsMarquee;
