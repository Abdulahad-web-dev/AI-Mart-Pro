'use client';
import React, { useState } from 'react';
import { Building2, Store, Truck, MapPin, Phone } from 'lucide-react';
import { MapTilerMap, MapMarkerItem } from '@/components/maps/maptiler-map';

export interface LocationItem {
  id: string;
  name: string;
  type: 'HQ' | 'Office' | 'Store' | 'Fulfillment';
  area: string;
  city: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

export const AI_MART_LOCATIONS: LocationItem[] = [
  {
    id: 'lhr-hq',
    name: 'AI Mart Pro National Headquarters',
    type: 'HQ',
    area: 'Gulberg III',
    city: 'Lahore',
    address: 'Level 8, Tricon Corporate Centre, Main Boulevard, Gulberg III, Lahore',
    phone: '+92 (42) 3578-9000',
    lat: 31.5204,
    lng: 74.3587,
  },
  {
    id: 'khi-hub',
    name: 'Karachi Technology & Logistics Hub',
    type: 'Office',
    area: 'Clifton Block 4',
    city: 'Karachi',
    address: 'Suite 402, Harbour Front Tower, Marine Drive, Clifton Block 4, Karachi',
    phone: '+92 (21) 3582-1200',
    lat: 24.827,
    lng: 67.0251,
  },
  {
    id: 'isb-lab',
    name: 'Islamabad Executive & AI Research Lab',
    type: 'Office',
    area: 'Blue Area',
    city: 'Islamabad',
    address: 'Plot 14, Saudi Pak Tower, Jinnah Avenue, Blue Area, Islamabad',
    phone: '+92 (51) 280-4500',
    lat: 33.7142,
    lng: 73.0645,
  },
  {
    id: 'fsd-store',
    name: 'Faisalabad Regional Experience Center',
    type: 'Store',
    area: 'D-Ground',
    city: 'Faisalabad',
    address: 'Shop 12-14, Chenab Market, D-Ground Commercial Area, Faisalabad',
    phone: '+92 (41) 872-3300',
    lat: 31.418,
    lng: 73.079,
  },
  {
    id: 'rwp-depot',
    name: 'Rawalpindi Transit & Dispatch Station',
    type: 'Fulfillment',
    area: 'Saddar',
    city: 'Rawalpindi',
    address: 'Logistics Bay 4, Haider Road, Saddar Commercial Area, Rawalpindi',
    phone: '+92 (51) 556-7800',
    lat: 33.5973,
    lng: 73.0479,
  },
  {
    id: 'pew-depot',
    name: 'Peshawar Northern Distribution Center',
    type: 'Fulfillment',
    area: 'University Road',
    city: 'Peshawar',
    address: 'Depot 9, Industrial Estate Phase 2, University Road, Peshawar',
    phone: '+92 (91) 584-2200',
    lat: 34.008,
    lng: 71.537,
  },
  {
    id: 'mux-store',
    name: 'Multan South Hub & Experience Center',
    type: 'Store',
    area: 'Bosan Road',
    city: 'Multan',
    address: 'Plaza 7, Gulgasht Colony, Bosan Road, Multan',
    phone: '+92 (61) 621-9900',
    lat: 30.1984,
    lng: 71.4687,
  },
];

export function StoresMap({ className = '' }: { className?: string }) {
  const [selectedId, setSelectedId] = useState<string>('lhr-hq');

  const markers: MapMarkerItem[] = AI_MART_LOCATIONS.map((loc) => ({
    id: loc.id,
    lat: loc.lat,
    lng: loc.lng,
    title: loc.name,
    badge: `${loc.type} • ${loc.city}`,
    address: loc.address,
    phone: loc.phone,
    color: loc.type === 'Store' || loc.type === 'Fulfillment' ? 'teal' : 'orange',
  }));

  const getTypeIcon = (type: LocationItem['type']) => {
    switch (type) {
      case 'HQ':
        return <Building2 size={16} className="text-[#0B7A6C]" />;
      case 'Office':
        return <Building2 size={16} className="text-[#0B7A6C]" />;
      case 'Store':
        return <Store size={16} className="text-[#0B7A6C]" />;
      case 'Fulfillment':
        return <Truck size={16} className="text-[#0B7A6C]" />;
    }
  };

  return (
    <section
      id="stores"
      className={`relative max-w-[1320px] mx-auto py-10 scroll-mt-24 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-[#0B7A6C] uppercase tracking-wider block mb-1">
            Nationwide Presence · Powered by MapTiler
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B1F23] tracking-tight">
            Stores &amp; Operational Hubs
          </h2>
        </div>
        <span className="text-xs text-[#6B7280]">
          Click any regional location to fly the interactive MapTiler map to that pin.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch rounded-[20px] bg-white border border-[#E5E7EB] p-4 sm:p-6 shadow-xs">
        {/* Left Scrollable List */}
        <div className="lg:col-span-5 flex flex-col h-[420px] lg:h-[480px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E7EB]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B1F23]">
              Regional Hubs ({AI_MART_LOCATIONS.length})
            </span>
            <span className="text-[11px] text-[#0B7A6C] font-semibold">Interactive Fly-To</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5">
            {AI_MART_LOCATIONS.map((loc) => {
              const isSelected = loc.id === selectedId;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedId(loc.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#0B7A6C] bg-[#E6F4F1]/50 shadow-xs ring-1 ring-[#0B7A6C]/30'
                      : 'border-[#E5E7EB] bg-[#F5F7F8] hover:border-[#0B7A6C] hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(loc.type)}
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-[#1B1F23] line-clamp-1">
                        {loc.name}
                      </span>
                    </div>
                    <span
                      className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                        loc.type === 'HQ'
                          ? 'bg-[#0B7A6C] text-white'
                          : loc.type === 'Store'
                          ? 'bg-[#E6F4F1] text-[#0B7A6C]'
                          : 'bg-[#FFF8E1] text-[#1B1F23]'
                      }`}
                    >
                      {loc.type}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-[#6B7280] leading-snug line-clamp-1 pl-9">
                    {loc.address}
                  </p>

                  <div className="flex items-center justify-between pl-9 mt-2 text-[11px]">
                    <span className="font-semibold text-[#1B1F23]">
                      {loc.city} &bull; {loc.area}
                    </span>
                    <span className="text-[#0B7A6C] font-bold">Fly to Pin &rarr;</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Interactive MapTiler Map */}
        <div className="lg:col-span-7">
          <MapTilerMap
            center={[30.3753, 69.3451]}
            zoom={5.5}
            markers={markers}
            selectedMarkerId={selectedId}
            onSelectMarker={(id) => setSelectedId(id)}
            height="480px"
          />
        </div>
      </div>
    </section>
  );
}

export default StoresMap;
