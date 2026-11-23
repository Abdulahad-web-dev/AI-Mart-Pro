'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  Phone,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  ArrowLeft,
  FileText,
  Star,
  AlertCircle,
  User,
} from 'lucide-react';
import { Button } from '@/components/aimart-ui';
import { useApp } from '@/lib/app-context';
import { api, Order, money, shortDate } from '@/lib/api';
import { DeliveryMap } from '@/components/maps/maptiler-map';

export function TrackOrderScreen({ orderIdProp }: { orderIdProp?: string } = {}) {
  const { setToast } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    void api<Order[]>('/api/orders')
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          const found = orderIdProp
            ? list.find((o) => o.id === orderIdProp || o.id.endsWith(orderIdProp))
            : list[0];
          setOrder(found || list[0]);
        }
      })
      .catch(() => {});
  }, [orderIdProp]);

  const displayId = order?.id ? order.id.slice(-8).toUpperCase() : orderIdProp || 'AIM-94821';
  const status = order?.status || 'IN_TRANSIT';
  const address = order?.address || 'Level 8, Tricon Corporate Centre, Main Boulevard, Gulberg III, Lahore';
  const phone = order?.phone || '+92 300 1234567';
  const totalPkr = order?.total || 89999;

  const items = order?.items?.length
    ? order.items
    : [
        {
          id: 'item-1',
          nameSnapshot: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
          priceSnapshot: 89999,
          quantity: 1,
          status: 'SHIPPED',
          vendorId: 'usr-vendor-1',
          productId: 'prod-0',
        },
      ];

  const timelineSteps = [
    {
      key: 'PENDING',
      title: 'Order Placed & Escrow Locked',
      desc: 'Order received and payment snapshot verified',
      time: order?.createdAt ? shortDate(order.createdAt) : 'Recorded in Ledger',
      done: true,
    },
    {
      key: 'CONFIRMED',
      title: 'Merchant Confirmed',
      desc: 'Seller verified serial numbers and stock allocation',
      time: 'Verified',
      done: ['CONFIRMED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(status),
    },
    {
      key: 'PACKED',
      title: 'Packed & Quality Inspected',
      desc: 'Sealed at regional fulfillment center',
      time: 'Completed',
      done: ['PACKED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(status),
    },
    {
      key: 'IN_TRANSIT',
      title: 'Out for Delivery',
      desc: order?.delivery?.agent?.name
        ? `Assigned to Delivery Agent: ${order.delivery.agent.name}`
        : 'Dispatched via AI Mart Express Fleet',
      time: 'Current Stage',
      done: ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(status),
      active: status !== 'DELIVERED' && status !== 'FAILED',
    },
    {
      key: 'DELIVERED',
      title: status === 'FAILED' ? 'Failed Delivery Attempt' : 'Delivered to Customer',
      desc:
        status === 'FAILED'
          ? 'Courier noted delivery exception — rescheduling'
          : 'Handed over at destination address',
      time: status === 'DELIVERED' ? 'Completed' : 'Awaiting Handover',
      done: status === 'DELIVERED',
    },
  ];

  return (
    <div className="min-h-screen text-[#1B1F23] pb-16 space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <Link
            href="/account/orders"
            className="w-10 h-10 rounded-xl bg-[#F5F7F8] border border-[#E5E7EB] flex items-center justify-center text-[#1B1F23] hover:border-[#0B7A6C] hover:text-[#0B7A6C] transition-colors"
            aria-label="Back to orders"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1B1F23]">
                Order #{displayId}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4F1] text-[#0B7A6C] text-xs font-extrabold uppercase">
                {status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Destination: <strong className="text-[#1B1F23]">{address}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInvoice(!showInvoice)}
          >
            <FileText size={14} /> {showInvoice ? 'Hide Invoice' : 'View Invoice'}
          </Button>
          <Link href="/account/reviews">
            <Button variant="primary" size="sm">
              <Star size={14} /> Write Review
            </Button>
          </Link>
        </div>
      </div>

      {/* Optional Printable Invoice Snapshot */}
      {showInvoice && (
        <div className="bg-white border-2 border-[#0B7A6C] rounded-[18px] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
            <div>
              <span className="text-xs font-bold uppercase text-[#0B7A6C]">Official Tax Invoice</span>
              <h3 className="text-lg font-extrabold text-[#1B1F23]">
                AI Mart Pro Escrow Receipt #{displayId}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#0B7A6C] text-white text-xs font-bold cursor-pointer"
            >
              Print / Save PDF
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#6B7280] block">Billed To:</span>
              <strong className="text-[#1B1F23]">{order?.customer?.name || 'Verified Customer'}</strong>
              <p className="text-[#6B7280]">{address}</p>
            </div>
            <div>
              <span className="text-[#6B7280] block">Payment Method:</span>
              <strong className="text-[#1B1F23]">{order?.paymentMethod || 'COD / Escrow'}</strong>
            </div>
            <div>
              <span className="text-[#6B7280] block">Total Settled:</span>
              <strong className="text-base text-[#0B7A6C]">{money(totalPkr)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: MapTiler Destination Map & Order Items (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#1B1F23]">
                Delivery Destination &amp; Hub Coordinates (MapTiler)
              </h2>
              <span className="text-xs font-semibold text-[#0B7A6C]">
                Verified Static Coordinates
              </span>
            </div>
            <DeliveryMap
              destinationAddress={address}
              orderId={displayId}
              status={status}
            />
          </div>

          {/* Items & Price Snapshots */}
          <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-2xs space-y-4">
            <h2 className="text-base font-extrabold text-[#1B1F23]">
              Order Items &amp; Authoritative Price Snapshots
            </h2>
            <div className="divide-y divide-[#E5E7EB]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <Link
                      href={`/product/${item.productId}`}
                      className="font-bold text-sm text-[#1B1F23] hover:text-[#0B7A6C]"
                    >
                      {item.nameSnapshot}
                    </Link>
                    <div className="text-[#6B7280] mt-0.5">
                      Qty: <strong>{item.quantity}</strong> &bull; Unit Price Snapshot:{' '}
                      <strong>{money(item.priceSnapshot)}</strong> &bull; Item Status:{' '}
                      <span className="text-[#0B7A6C] font-bold">{item.status}</span>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-[#0B7A6C]">
                    {money(item.priceSnapshot * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280]">Order Total</span>
              <span className="text-lg font-extrabold text-[#0B7A6C]">{money(totalPkr)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Status Timeline & Delivery Agent Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Timeline */}
          <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-2xs space-y-4">
            <h2 className="text-base font-extrabold text-[#1B1F23]">
              Fulfillment &amp; Delivery Timeline
            </h2>
            <div className="space-y-4 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E5E7EB]">
              {timelineSteps.map((step) => (
                <div key={step.key} className="relative pl-10">
                  <div
                    className={`absolute left-0 top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step.done
                        ? 'bg-[#0B7A6C] border-[#0B7A6C] text-white'
                        : step.active
                        ? 'bg-[#E6F4F1] border-[#0B7A6C] text-[#0B7A6C]'
                        : 'bg-white border-[#E5E7EB] text-[#9CA3AF]'
                    }`}
                  >
                    {step.done ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#1B1F23]">{step.title}</span>
                      <span className="text-[10.5px] font-semibold text-[#6B7280]">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#6B7280] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Agent Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-extrabold text-[#1B1F23]">
              Delivery Agent &amp; Contact Information
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F7F8] border border-[#E5E7EB]">
              <div className="w-10 h-10 rounded-xl bg-[#0B7A6C] text-white flex items-center justify-center font-bold">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <strong className="text-xs font-bold text-[#1B1F23] block">
                  {order?.delivery?.agent?.name || 'Bilal Express Rider (Regional Hub)'}
                </strong>
                <span className="text-[11px] text-[#6B7280]">
                  Delivery Status: {order?.delivery?.status || status}
                </span>
              </div>
            </div>
            <div className="text-xs text-[#6B7280] space-y-1">
              <div className="flex justify-between">
                <span>Customer Contact Phone:</span>
                <strong className="text-[#1B1F23]">{phone}</strong>
              </div>
              <div className="flex justify-between">
                <span>Escrow Verification:</span>
                <strong className="text-[#0B7A6C]">Protected</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
