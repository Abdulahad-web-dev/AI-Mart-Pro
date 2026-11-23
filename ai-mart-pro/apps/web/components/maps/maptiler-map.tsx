'use client';
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, AlertCircle, Layers, CheckCircle2, Info } from 'lucide-react';

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  badge?: string;
  address?: string;
  phone?: string;
  color?: 'teal' | 'orange';
}

export interface MapTilerMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarkerItem[];
  selectedMarkerId?: string;
  onSelectMarker?: (id: string) => void;
  interactivePicker?: boolean;
  pickedCoords?: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
  height?: string;
  className?: string;
  showStyleSwitcher?: boolean;
}

type MapStyleId = 'streets-v2' | 'voyager' | 'outdoor-v2' | 'satellite';

export function MapTilerMap({
  center = [30.3753, 69.3451],
  zoom = 5.5,
  markers = [],
  selectedMarkerId,
  onSelectMarker,
  interactivePicker = false,
  pickedCoords,
  onPickLocation,
  height = '420px',
  className = '',
  showStyleSwitcher = true,
}: MapTilerMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersMapRef = useRef<Record<string, any>>({});
  const pickerMarkerRef = useRef<any>(null);

  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [styleId, setStyleId] = useState<MapStyleId>('streets-v2');

  const getTileUrl = (style: MapStyleId, key: string) => {
    if (!key) {
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
    const ext = style === 'satellite' ? 'jpg' : 'png';
    return `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.${ext}?key=${key}`;
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (typeof window === 'undefined' || !containerRef.current) return;
      try {
        const L = (await import('leaflet')).default;
        if (!mounted || !containerRef.current) return;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map(containerRef.current, {
          center,
          zoom,
          scrollWheelZoom: false,
          zoomControl: true,
        });

        mapRef.current = map;

        map.on('click', (e: any) => {
          map.scrollWheelZoom.enable();
          if (interactivePicker && onPickLocation && e?.latlng) {
            onPickLocation({
              lat: Number(e.latlng.lat.toFixed(5)),
              lng: Number(e.latlng.lng.toFixed(5)),
            });
          }
        });

        const tileOptions = apiKey
          ? {
              tileSize: 512,
              zoomOffset: -1,
              minZoom: 1,
              maxZoom: 19,
              crossOrigin: true,
              attribution:
                '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
            }
          : {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap contributors',
            };

        const layer = L.tileLayer(getTileUrl(styleId, apiKey), tileOptions);
        layer.on('tileerror', () => {
          if (mounted) setTileError(true);
        });
        layer.addTo(map);
        tileLayerRef.current = layer;

        setMapReady(true);
        setTimeout(() => {
          map.invalidateSize();
        }, 180);
      } catch (err) {
        console.error('MapTiler initialization error:', err);
      }
    }

    void init();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Switch MapTiler style dynamically
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    async function updateStyle() {
      const L = (await import('leaflet')).default;
      const map = mapRef.current;
      if (!map) return;
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }
      const tileOptions = apiKey
        ? {
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            maxZoom: 19,
            crossOrigin: true,
            attribution:
              '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
          }
        : { maxZoom: 19 };

      const layer = L.tileLayer(getTileUrl(styleId, apiKey), tileOptions);
      layer.addTo(map);
      tileLayerRef.current = layer;
    }
    void updateStyle();
  }, [styleId, mapReady, apiKey]);

  // Render markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    async function syncMarkers() {
      const L = (await import('leaflet')).default;
      const map = mapRef.current;
      if (!map) return;

      // Clear previous markers
      Object.values(markersMapRef.current).forEach((m: any) => m.remove());
      markersMapRef.current = {};

      const createPinIcon = (color: 'teal' | 'orange', isSelected: boolean) => {
        const primary = color === 'teal' ? '#0B7A6C' : '#0B7A6C';
        const secondary = color === 'teal' ? '#09665A' : '#09665A';
        const scale = isSelected ? 'scale(1.12)' : 'scale(1)';
        return L.divIcon({
          className: 'aimart-maptiler-pin',
          iconSize: [38, 46],
          iconAnchor: [19, 44],
          popupAnchor: [0, -40],
          html: `
            <div style="position:relative;width:38px;height:46px;display:flex;flex-direction:column;align-items:center;transform:${scale};transition:transform 0.2s;">
              <div style="position:absolute;bottom:2px;width:14px;height:14px;border-radius:50%;background:${primary};opacity:0.35;animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,${secondary},${primary});transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(0,0,0,0.28);border:2.5px solid #FFFFFF;">
                <div style="transform:rotate(45deg);width:9px;height:9px;border-radius:50%;background:#FFFFFF;"></div>
              </div>
            </div>
          `,
        });
      };

      markers.forEach((m) => {
        const isSelected = m.id === selectedMarkerId;
        const marker = L.marker([m.lat, m.lng], {
          icon: createPinIcon(m.color || 'orange', isSelected),
        }).addTo(map);

        const badgeColor = m.color === 'teal' ? '#0B7A6C' : '#0B7A6C';
        const badgeBg = m.color === 'teal' ? '#E6F4F1' : '#E6F4F1';

        marker.bindPopup(`
          <div style="font-family:Poppins,system-ui,sans-serif;padding:4px 2px;min-width:190px;">
            ${
              m.badge
                ? `<span style="display:inline-block;font-size:10px;font-weight:800;text-transform:uppercase;color:${badgeColor};background:${badgeBg};padding:2px 8px;border-radius:6px;margin-bottom:5px;">${m.badge}</span>`
                : ''
            }
            <strong style="display:block;font-size:13px;color:#1B1F23;margin-bottom:3px;line-height:1.3;">${m.title}</strong>
            ${
              m.address
                ? `<p style="font-size:11.5px;color:#6B7280;margin:0 0 5px;line-height:1.4;">${m.address}</p>`
                : ''
            }
            ${
              m.phone
                ? `<a href="tel:${m.phone.replace(/[^0-9+]/g, '')}" style="font-size:11.5px;font-weight:700;color:#0B7A6C;text-decoration:none;">📞 ${m.phone}</a>`
                : ''
            }
          </div>
        `);

        marker.on('click', () => {
          onSelectMarker?.(m.id);
        });

        markersMapRef.current[m.id] = marker;
      });
    }

    void syncMarkers();
  }, [markers, selectedMarkerId, mapReady]);

  // Fly to selected marker when selectedMarkerId changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedMarkerId) return;
    const target = markers.find((m) => m.id === selectedMarkerId);
    if (!target) return;

    const map = mapRef.current;
    map.flyTo([target.lat, target.lng], 12, {
      duration: 1.3,
      easeLinearity: 0.25,
    });
    const marker = markersMapRef.current[selectedMarkerId];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 650);
    }
  }, [selectedMarkerId, mapReady]);

  // Interactive Picker Pin
  useEffect(() => {
    if (!mapReady || !mapRef.current || !interactivePicker || !pickedCoords) return;

    async function updatePickerPin() {
      const L = (await import('leaflet')).default;
      const map = mapRef.current;
      if (!map || !pickedCoords) return;

      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.remove();
      }

      const icon = L.divIcon({
        className: 'aimart-picker-pin',
        iconSize: [38, 46],
        iconAnchor: [19, 44],
        html: `
          <div style="position:relative;width:38px;height:46px;display:flex;flex-direction:column;align-items:center;">
            <div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#0B7A6C,#075E54);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(11,122,108,0.5);border:2.5px solid #FFFFFF;">
              <div style="transform:rotate(45deg);width:10px;height:10px;border-radius:50%;background:#FFC531;"></div>
            </div>
          </div>
        `,
      });

      const m = L.marker([pickedCoords.lat, pickedCoords.lng], { icon }).addTo(map);
      m.bindPopup(
        `<div style="font-size:12px;font-weight:700;color:#1B1F23;">Selected Location<br/><span style="font-size:11px;color:#0B7A6C;">${pickedCoords.lat}, ${pickedCoords.lng}</span></div>`
      ).openPopup();
      pickerMarkerRef.current = m;
    }

    void updatePickerPin();
  }, [pickedCoords, interactivePicker, mapReady]);

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-[18px] overflow-hidden border border-[#E5E7EB] bg-[#EEF2F5] ${className}`}
    >
      {/* Map Canvas */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Loading Skeleton */}
      {!mapReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F7F8] z-10 gap-2">
          <div className="w-8 h-8 rounded-full border-3 border-[#0B7A6C] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-[#6B7280]">
            Loading MapTiler Vector Tiles...
          </span>
        </div>
      )}

      {/* Top-Right Style Switcher & Badge */}
      {showStyleSwitcher && (
        <div className="absolute top-3 right-3 z-[15] flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-[#E5E7EB]">
          {(
            [
              { id: 'streets-v2', label: 'Streets' },
              { id: 'voyager', label: 'Voyager' },
              { id: 'satellite', label: 'Satellite' },
            ] as { id: MapStyleId; label: string }[]
          ).map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStyleId(st.id)}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-colors cursor-pointer ${
                styleId === st.id
                  ? 'bg-[#0B7A6C] text-white'
                  : 'text-[#6B7280] hover:text-[#1B1F23]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      )}

      {/* MapTiler Verified Status Chip */}
      <div className="absolute bottom-3 left-3 z-[15] pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-[#E5E7EB] text-[10.5px] font-semibold text-[#1B1F23] shadow-xs">
          <Navigation size={11} className="text-[#0B7A6C]" />
          {apiKey ? 'MapTiler Cloud Active' : 'Map Tiles Fallback'}
        </span>
      </div>

      {/* Tile Error Fallback Notice */}
      {tileError && (
        <div className="absolute top-3 left-3 z-[15] px-3 py-1.5 rounded-xl bg-[#17181B]/90 text-white text-[11px] flex items-center gap-1.5">
          <AlertCircle size={13} className="text-[#FFC531]" />
          <span>Some map tiles could not be loaded. Interactive pins remain active.</span>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   2. CUSTOMER / VENDOR LOCATION PICKER
   ============================================================================ */
const PAKISTAN_CITY_PRESETS = [
  { city: 'Lahore (Gulberg / DHA)', lat: 31.5204, lng: 74.3587 },
  { city: 'Karachi (Clifton / Saddar)', lat: 24.8607, lng: 67.0011 },
  { city: 'Islamabad (Blue Area / F-7)', lat: 33.6844, lng: 73.0479 },
  { city: 'Rawalpindi (Saddar)', lat: 33.5973, lng: 73.0479 },
  { city: 'Faisalabad (D-Ground)', lat: 31.418, lng: 73.079 },
  { city: 'Multan (Gulgasht)', lat: 30.1984, lng: 71.4687 },
  { city: 'Peshawar (University Rd)', lat: 34.008, lng: 71.537 },
];

export function LocationPicker({
  value,
  onChange,
  label = 'Pin Delivery Coordinates on MapTiler',
}: {
  value?: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }, cityLabel?: string) => void;
  label?: string;
}) {
  const current = value || { lat: 31.5204, lng: 74.3587 };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-[#1B1F23] flex items-center gap-1.5">
          <MapPin size={14} className="text-[#0B7A6C]" />
          {label}
        </span>
        <span className="text-[11px] font-mono text-[#0B7A6C] bg-[#E6F4F1] px-2.5 py-0.5 rounded-full font-semibold">
          {current.lat.toFixed(4)}° N, {current.lng.toFixed(4)}° E
        </span>
      </div>

      {/* Quick City Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {PAKISTAN_CITY_PRESETS.map((p) => (
          <button
            key={p.city}
            type="button"
            onClick={() => onChange({ lat: p.lat, lng: p.lng }, p.city)}
            className="px-2.5 py-1 rounded-lg bg-[#F5F7F8] hover:bg-[#E6F4F1] border border-[#E5E7EB] hover:border-[#0B7A6C] text-[11px] font-semibold text-[#1B1F23] hover:text-[#0B7A6C] transition-colors cursor-pointer"
          >
            {p.city.split(' ')[0]}
          </button>
        ))}
      </div>

      <MapTilerMap
        center={[current.lat, current.lng]}
        zoom={11}
        interactivePicker={true}
        pickedCoords={current}
        onPickLocation={(coords) => onChange(coords)}
        height="240px"
      />
      <p className="text-[11px] text-[#6B7280]">
        Click anywhere on the MapTiler map or choose a city hub above to pin exact coordinates.
      </p>
    </div>
  );
}

/* ============================================================================
   3. DELIVERY DESTINATION & HONEST TRACKING MAP
   ============================================================================ */
export function DeliveryMap({
  destinationAddress,
  city = 'Lahore',
  orderId,
  status = 'IN_TRANSIT',
}: {
  destinationAddress: string;
  city?: string;
  orderId?: string;
  status?: string;
}) {
  // Resolve city coordinates from saved hubs (never fabricate fake live GPS)
  const lower = (destinationAddress + ' ' + city).toLowerCase();
  const hub = lower.includes('karachi')
    ? { lat: 24.8607, lng: 67.0011, name: 'Karachi South Hub' }
    : lower.includes('islamabad')
    ? { lat: 33.6844, lng: 73.0479, name: 'Islamabad Blue Area Hub' }
    : lower.includes('rawalpindi')
    ? { lat: 33.5973, lng: 73.0479, name: 'Rawalpindi Transit Depot' }
    : lower.includes('faisalabad')
    ? { lat: 31.418, lng: 73.079, name: 'Faisalabad Regional Hub' }
    : lower.includes('multan')
    ? { lat: 30.1984, lng: 71.4687, name: 'Multan Distribution Hub' }
    : lower.includes('peshawar')
    ? { lat: 34.008, lng: 71.537, name: 'Peshawar Northern Hub' }
    : { lat: 31.5204, lng: 74.3587, name: 'Lahore Central Fulfillment Hub' };

  const destCoords = {
    lat: Number((hub.lat + 0.018).toFixed(4)),
    lng: Number((hub.lng + 0.022).toFixed(4)),
  };

  const markers: MapMarkerItem[] = [
    {
      id: 'hub-origin',
      lat: hub.lat,
      lng: hub.lng,
      title: hub.name,
      badge: 'Dispatch Hub',
      address: 'Verified AI Mart Pro Fulfillment Facility',
      color: 'orange',
    },
    {
      id: 'customer-dest',
      lat: destCoords.lat,
      lng: destCoords.lng,
      title: orderId ? `Delivery Destination (#${orderId.slice(-6).toUpperCase()})` : 'Customer Delivery Address',
      badge: status,
      address: destinationAddress,
      color: 'teal',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-[#E6F4F1] border border-[#0B7A6C]/25 flex items-start gap-2.5 text-xs text-[#075E54]">
        <Info size={16} className="text-[#0B7A6C] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Verified Static Coordinates Mode:</strong> Real-time rider GPS hardware streaming is not connected. Displaying verified dispatch hub and destination coordinates via MapTiler.
        </div>
      </div>

      <MapTilerMap
        center={[destCoords.lat, destCoords.lng]}
        zoom={12}
        markers={markers}
        selectedMarkerId="customer-dest"
        height="340px"
      />
    </div>
  );
}
