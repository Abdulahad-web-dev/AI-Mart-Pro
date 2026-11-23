'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Button, Stepper, Card } from '@/components/aimart-ui';
import { money } from '@/lib/api';

export function OrderConfirmedScreen() {
  const { setToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [orderNumber, setOrderNumber] = useState('#AIM-94821');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const id = sp.get('id');
      if (id) setOrderNumber('#AIM-' + id.slice(-6).toUpperCase());
    }
  }, []);
  const estimatedDelivery = 'Wednesday, Oct 24 – Friday, Oct 26';

  const handleCopyOrder = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setToast('Order number copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const progressSteps = [
    { number: 1, label: 'Order Placed' },
    { number: 2, label: 'Processing' },
    { number: 3, label: 'Shipped' },
    { number: 4, label: 'Delivered' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] pb-24">
      <div className="max-w-[880px] mx-auto px-4 sm:px-8 pt-12 space-y-10">
        {/* Glow Tile Check Icon Header matching Screenshot 8 */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="w-20 h-20 rounded-2xl bg-[rgba(11, 122, 108,0.15)] border border-[#0B7A6C] flex items-center justify-center mx-auto text-[#0B7A6C] shadow-[0_0_35px_rgba(11, 122, 108,0.25)]"
          >
            <Check size={40} strokeWidth={2.5} />
          </motion.div>

          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
              Thank you for your order!
            </h1>
            <p className="text-sm text-[#737373] max-w-md mx-auto">
              We&apos;ve sent a confirmation email with invoice and telemetry tracker details to your inbox.
            </p>
          </div>

          {/* Order Number Chip with Copy Button */}
          <div className="inline-flex items-center gap-2.5 bg-[#FFFFFF] border border-[#E5E7EB] px-4 py-2 rounded-full text-xs">
            <span className="text-[#737373]">ORDER REFERENCE:</span>
            <span className="font-mono font-bold text-[#0B7A6C]">{orderNumber}</span>
            <button
              onClick={handleCopyOrder}
              className="p-1 rounded hover:bg-[#F1F5F9] text-[#171717] transition-colors"
              aria-label="Copy order number"
            >
              {copied ? <Check size={13} className="text-[#16A34A]" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* 4-Step Progress Stepper matching Screenshot 8 */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-2">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#737373] font-semibold">
                Estimated Delivery
              </span>
              <p className="text-base font-bold text-[#16A34A] flex items-center gap-1.5 mt-0.5">
                <Calendar size={16} /> {estimatedDelivery}
              </p>
            </div>
            <span className="text-xs font-mono text-[#0B7A6C] bg-[rgba(11, 122, 108,0.12)] px-3 py-1 rounded-full self-start sm:self-auto">
              Carrier: AI Mart Express Fleet
            </span>
          </div>

          <div className="pt-2">
            <Stepper steps={progressSteps} currentStep={2} />
          </div>
        </div>

        {/* Two Detail Cards: Delivery & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
              <MapPin size={17} className="text-[#0B7A6C]" />
              <h3>Shipping Destination</h3>
            </div>
            <div className="text-xs text-[#525252] space-y-1">
              <p className="font-semibold text-[#171717]">Abdulahad Warraich</p>
              <p>House #42, Street 8, Phase 5, DHA</p>
              <p>Lahore, Punjab, Pakistan</p>
              <p className="text-[#737373] pt-1">+92 300 1234567</p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
              <CreditCard size={17} className="text-[#0B7A6C]" />
              <h3>Payment Method</h3>
            </div>
            <div className="text-xs text-[#525252] space-y-1">
              <p className="font-semibold text-[#171717]">Visa Credit Card</p>
              <p className="font-mono">•••• •••• •••• 4242</p>
              <p className="text-[#16A34A] pt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 size={13} /> Payment Authorized &amp; Verified
              </p>
            </div>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#737373]">
            Items in this Shipment
          </h3>
          <div className="space-y-3">
            {[
              {
                name: 'AuraTech ANC Wireless Headphones (Matte Black)',
                price: money(89999),
                qty: 1,
                img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'
              },
              {
                name: 'Titanium Edge Smart Watch Ultra 49mm',
                price: money(54999),
                qty: 1,
                img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-[#E5E7EB] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F1F5F9] border border-[#E5E7EB] overflow-hidden flex-shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#171717]">{item.name}</p>
                    <span className="text-[11px] text-[#737373]">Qty: {item.qty}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#0B7A6C]">{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/track-order">
            <Button variant="primary" size="lg">
              Track Order Telemetry <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

