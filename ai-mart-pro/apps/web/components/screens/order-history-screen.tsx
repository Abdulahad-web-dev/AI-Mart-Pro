'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  Truck,
  RotateCcw,
  Check,
  Search,
  ExternalLink,
  Package,
  Calendar,
  Clock
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { api, Order, money } from '@/lib/api';
import {
  Tabs,
  Button,
  Badge,
  SearchBar
} from '@/components/aimart-ui';

export function OrderHistoryScreen() {
  const { user, setToast } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const accountNav = [
    { label: 'Profile', href: '/profile', icon: User, active: false },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, active: true },
    { label: 'Wishlist', href: '/wishlist', icon: Heart, active: false },
    { label: 'Addresses', href: '/profile?tab=addresses', icon: MapPin, active: false },
    { label: 'Settings', href: '/profile?tab=settings', icon: Settings, active: false }
  ];

  // Mock Realistic Orders matching Screenshot 9
  const defaultOrders = [
    {
      id: 'AIM-94821',
      date: 'Oct 22, 2024',
      status: 'In Transit',
      statusNote: 'Arriving Tomorrow by 4 PM',
      isPulsing: true,
      total: 89999,
      items: [
        {
          name: 'AuraTech ANC Wireless Headphones (Matte Black)',
          price: 64999,
          qty: 1,
          img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'
        },
        {
          name: 'Titanium Edge Smart Watch Ultra 49mm',
          price: 25000,
          qty: 1,
          img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'
        }
      ]
    },
    {
      id: 'AIM-88314',
      date: 'Oct 14, 2024',
      status: 'Delivered',
      statusNote: 'Delivered to Front Door',
      isPulsing: false,
      total: 18500,
      items: [
        {
          name: 'Minimalist Mechanical Keyboard RGB Hot-swap',
          price: 18500,
          qty: 1,
          img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=200&q=80'
        }
      ]
    },
    {
      id: 'AIM-76290',
      date: 'Sep 29, 2024',
      status: 'Delivered',
      statusNote: 'Signed by A. Warraich',
      isPulsing: false,
      total: 12400,
      items: [
        {
          name: 'Ceramic Pour-Over Coffee Dripper Set',
          price: 12400,
          qty: 1,
          img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80'
        }
      ]
    }
  ];

  const [orders, setOrders] = useState(defaultOrders);

  React.useEffect(() => {
    let mounted = true;
    async function loadRealOrders() {
      try {
        const real = await api<Order[]>('/api/orders/my');
        if (mounted && Array.isArray(real) && real.length > 0) {
          const mapped = real.map((o) => ({
            id: o.id.slice(-7).toUpperCase(),
            date: new Date(o.createdAt).toLocaleDateString('en-PK', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            status: o.status === 'DELIVERED' ? 'Delivered' : o.status === 'CANCELLED' ? 'Cancelled' : 'In Transit',
            statusNote: o.delivery?.status ? `Logistics: ${o.delivery.status}` : o.address,
            isPulsing: o.status !== 'DELIVERED' && o.status !== 'CANCELLED',
            total: o.total,
            items: o.items.map((i) => ({
              name: i.nameSnapshot,
              price: i.priceSnapshot,
              qty: i.quantity,
              img:
                i.product?.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'
            }))
          }));
          setOrders(mapped);
        }
      } catch {}
    }
    loadRealOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'in-progress' && o.status !== 'In Transit') return false;
    if (activeTab === 'delivered' && o.status !== 'Delivered') return false;
    if (activeTab === 'cancelled' && o.status !== 'Cancelled') return false;
    if (searchQuery) {
      const match =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] pb-24">
      {/* Top Bar */}
      <div className="border-b border-[#E5E7EB] bg-[#FFFFFF]/80 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-[#171717]">Account Center</h1>
          <span className="text-xs text-[#737373]">Logged in as {user?.email || 'customer@aimart.test'}</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* LEFT SIDEBAR: Account Navigation */}
          <aside className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 space-y-1 shadow-sm">
            {accountNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    item.active
                      ? 'bg-[rgba(11, 122, 108,0.12)] text-[#0B7A6C] font-semibold'
                      : 'text-[#525252] hover:bg-[#F1F5F9] hover:text-[#171717]'
                  }`}
                >
                  <Icon size={16} className={item.active ? 'text-[#0B7A6C]' : 'text-[#737373]'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </aside>

          {/* MAIN AREA: Order History */}
          <main className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#171717]">Order History</h2>
                <p className="text-xs text-[#737373]">
                  Manage past shipments, view live status, and initiate returns.
                </p>
              </div>

              <div className="w-full sm:w-64">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by Order # or item..."
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <Tabs
              tabs={[
                { id: 'all', label: 'All Orders' },
                { id: 'in-progress', label: 'In Progress (1)' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'cancelled', label: 'Cancelled' }
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* Order Cards List */}
            <div className="space-y-5">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm hover:border-[#A3A3A3] transition-colors"
                  >
                    {/* Header Row */}
                    <div className="bg-[#FFFFFF] px-5 py-3.5 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-[#737373] block text-[10px] uppercase">
                            Order Placed
                          </span>
                          <span className="font-semibold text-[#171717]">{order.date}</span>
                        </div>
                        <div>
                          <span className="text-[#737373] block text-[10px] uppercase">
                            Total
                          </span>
                          <span className="font-mono font-bold text-[#0B7A6C]">
                            {money(order.total)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[#737373]">ORDER # {order.id}</span>
                        {/* Status Pill */}
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            order.isPulsing
                              ? 'bg-[rgba(11, 122, 108,0.15)] text-[#0B7A6C] border border-[#0B7A6C]/30'
                              : 'bg-[#F1F5F9] text-[#16A34A]'
                          }`}
                        >
                          {order.isPulsing && (
                            <span className="w-2 h-2 rounded-full bg-[#0B7A6C] animate-pulse" />
                          )}
                          <span>{order.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Body: Items & Actions */}
                    <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="text-xs font-medium text-[#16A34A] flex items-center gap-1.5">
                          <Truck size={14} /> {order.statusNote}
                        </div>

                        {/* Items Thumbnails */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-[#F1F5F9] border border-[#E5E7EB] overflow-hidden flex-shrink-0">
                                <img
                                  src={item.img}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-[#171717] line-clamp-1">
                                  {item.name}
                                </p>
                                <span className="text-[11px] text-[#737373]">
                                  Qty: {item.qty} · {money(item.price)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap sm:flex-col items-center gap-2.5 w-full sm:w-auto">
                        {order.status === 'In Transit' ? (
                          <>
                            <Link href="/track-order" className="w-full sm:w-auto">
                              <Button variant="primary" size="sm" className="w-full">
                                Track Package
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => setToast('Viewing order details invoice')}
                            >
                              View Details
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full"
                              onClick={() => setToast('Added items to cart')}
                            >
                              Buy Again
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => setToast('Review modal opened')}
                            >
                              Leave Review
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-12 text-center space-y-3">
                  <Package size={32} className="mx-auto text-[#737373]" />
                  <h3 className="text-base font-semibold text-[#171717]">No orders found</h3>
                  <p className="text-xs text-[#737373]">
                    Try switching filters or search for another order number.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

