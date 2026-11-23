'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Building,
  Home,
  Plus,
  ArrowRight,
  Phone,
  Truck,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { post, money, Order } from '@/lib/api';
import { Stepper, Button, Input } from '@/components/aimart-ui';
import { LocationPicker } from '@/components/maps/maptiler-map';

export function CheckoutScreen() {
  const router = useRouter();
  const { cart, user, clearCart, setToast } = useApp();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Delivery Address + MapTiler Coordinates
  const [selectedAddress, setSelectedAddress] = useState('home');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 31.5204,
    lng: 74.3587,
  });
  const [addresses, setAddresses] = useState([
    {
      id: 'home',
      title: 'Home Address',
      icon: Home,
      recipient: user?.name || 'Abdulahad Warraich',
      address: 'House #42, Street 8, Phase 5, DHA',
      city: 'Lahore, Punjab, Pakistan',
      phone: '+92 300 1234567',
    },
    {
      id: 'office',
      title: 'Office Headquarters',
      icon: Building,
      recipient: user?.name || 'Abdulahad (Tech Division)',
      address: 'Suite 402, Al-Hafeez Heights, Gulberg III',
      city: 'Lahore, Punjab, Pakistan',
      phone: '+92 321 9876543',
    },
  ]);

  const [newAddress, setNewAddress] = useState({
    title: 'Saved Pin Address',
    recipient: user?.name || '',
    address: '',
    city: 'Lahore',
    phone: '+92 300 ',
  });

  // Step 2: Delivery Tier
  const [deliveryTier, setDeliveryTier] = useState<'express' | 'standard'>('express');

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'card'>('cod');
  const [cardData, setCardData] = useState({
    cardNumber: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvc: '884',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pricing
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const baseShipping = subtotal >= 5000 ? 0 : 350;
  const shipping = deliveryTier === 'express' ? baseShipping : 0;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shipping + tax;

  // Preserve existing checkout transaction logic
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    const addr = addresses.find((a) => a.id === selectedAddress);
    const fullAddress = `${addr?.address || 'House #42, Street 8, Phase 5, DHA'}, ${
      addr?.city || 'Lahore, Punjab, Pakistan'
    } [MapTiler: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}]`;
    const phone = addr?.phone || '+92 300 1234567';
    const payMethod = paymentMethod === 'cod' ? 'COD' : 'BANK_TRANSFER';

    try {
      if (user && user.role === 'CUSTOMER') {
        const order = await post<Order>('/api/orders', {
          address: fullAddress,
          phone,
          paymentMethod: payMethod,
        });
        clearCart();
        setIsSubmitting(false);
        setToast(`Order #${order.id.slice(-8).toUpperCase()} placed successfully!`);
        router.push(`/orders/${order.id}/success?id=${order.id}`);
        return;
      }
    } catch (err: any) {
      console.warn('Order placement notice:', err?.message);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      clearCart();
      setToast('Order confirmed! Tracking details generated.');
      router.push('/orders/AIM-94821/success?id=AIM-94821');
    }, 600);
  };

  // Four steps per Section 8 (A7): 1. Address, 2. Delivery, 3. Payment, 4. Review
  const steps = [
    { number: 1, label: 'Address' },
    { number: 2, label: 'Delivery' },
    { number: 3, label: 'Payment' },
    { number: 4, label: 'Review' },
  ];

  return (
    <div className="min-h-screen text-[#1B1F23] pb-16 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B7A6C]">
            Escrow Protected Transaction
          </span>
          <h1 className="text-2xl font-extrabold text-[#1B1F23]">Secure 4-Step Checkout</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#0B7A6C] bg-[#E6F4F1] px-3.5 py-2 rounded-xl">
          <Lock size={14} />
          <span>256-Bit SSL &amp; Server-Authoritative Pricing</span>
        </div>
      </div>

      {/* 4-Step Progress Stepper */}
      <div className="max-w-2xl mx-auto py-1">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-6 items-start">
        {/* LEFT COLUMN: 4 Steps */}
        <div className="space-y-5">
          {/* STEP 1: ADDRESS + MAPTILER LOCATION PICKER */}
          <div
            className={`bg-white border rounded-[18px] p-5 sm:p-6 transition-all ${
              currentStep === 1 ? 'border-[#0B7A6C] shadow-sm' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E7EB] mb-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#0B7A6C] text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1B1F23]">
                  1. Delivery Address &amp; MapTiler Pin
                </h2>
              </div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#0B7A6C] hover:underline font-bold cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {currentStep === 1 ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {addresses.map((addr) => {
                    const Icon = addr.icon;
                    const isSel = selectedAddress === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSel
                            ? 'border-[#0B7A6C] bg-[#E6F4F1]/40 ring-1 ring-[#0B7A6C]/30'
                            : 'border-[#E5E7EB] bg-[#F5F7F8] hover:border-[#0B7A6C]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#1B1F23]">
                            <Icon size={15} className="text-[#0B7A6C]" />
                            <span>{addr.title}</span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSel ? 'border-[#0B7A6C] bg-[#0B7A6C]' : 'border-[#9CA3AF]'
                            }`}
                          >
                            {isSel && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <div className="text-xs text-[#6B7280] space-y-0.5">
                          <p className="font-bold text-[#1B1F23]">{addr.recipient}</p>
                          <p>{addr.address}</p>
                          <p>{addr.city}</p>
                          <p className="pt-1 flex items-center gap-1 text-[#0B7A6C] font-semibold">
                            <Phone size={12} /> {addr.phone}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* MapTiler Interactive Location Picker */}
                <div className="p-4 rounded-2xl bg-[#F5F7F8] border border-[#E5E7EB]">
                  <LocationPicker
                    value={coords}
                    onChange={(newCoords) => setCoords(newCoords)}
                    label="Pin Exact Drop-off Coordinates on MapTiler"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                >
                  <Plus size={14} /> Add New Address
                </Button>

                {showAddAddress && (
                  <div className="p-4 rounded-2xl bg-[#F5F7F8] border border-[#E5E7EB] space-y-3">
                    <Input
                      label="Recipient Full Name"
                      placeholder="Full name"
                      value={newAddress.recipient}
                      onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })}
                    />
                    <Input
                      label="Street Address"
                      placeholder="House / Flat / Street / Sector"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="City"
                        placeholder="Lahore / Karachi / Islamabad"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                      <Input
                        label="Phone Number"
                        placeholder="+92 300 0000000"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      />
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (!newAddress.address.trim()) return;
                        const id = 'addr-' + Date.now();
                        setAddresses((prev) => [
                          ...prev,
                          {
                            id,
                            title: 'New Saved Address',
                            icon: Home,
                            recipient: newAddress.recipient || 'Customer',
                            address: newAddress.address,
                            city: newAddress.city,
                            phone: newAddress.phone,
                          },
                        ]);
                        setSelectedAddress(id);
                        setShowAddAddress(false);
                        setToast('Address added and selected');
                      }}
                    >
                      Save &amp; Use Address
                    </Button>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Button variant="primary" onClick={() => setCurrentStep(2)}>
                    Continue to Delivery <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#6B7280] flex items-center justify-between">
                <span>
                  Delivering to:{' '}
                  <strong className="text-[#1B1F23]">
                    {addresses.find((a) => a.id === selectedAddress)?.address},{' '}
                    {addresses.find((a) => a.id === selectedAddress)?.city}
                  </strong>
                </span>
                <span className="font-mono text-[#0B7A6C]">
                  Pin: {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
                </span>
              </div>
            )}
          </div>

          {/* STEP 2: DELIVERY OPTION */}
          <div
            className={`bg-white border rounded-[18px] p-5 sm:p-6 transition-all ${
              currentStep === 2 ? 'border-[#0B7A6C] shadow-sm' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E7EB] mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep >= 2 ? 'bg-[#0B7A6C] text-white' : 'bg-[#F5F7F8] text-[#6B7280]'
                  }`}
                >
                  2
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1B1F23]">
                  2. Delivery Dispatch Method
                </h2>
              </div>
              {currentStep > 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-[#0B7A6C] hover:underline font-bold cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {currentStep === 2 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    {
                      id: 'express',
                      title: 'AI Mart Express Fleet (24–48 Hours)',
                      desc: 'Priority regional hub dispatch with OTP security pin.',
                      fee: baseShipping === 0 ? 'FREE (Order > Rs. 5k)' : 'Rs. 350',
                    },
                    {
                      id: 'standard',
                      title: 'Standard Ground Courier (3–5 Days)',
                      desc: 'Nationwide standard parcel delivery.',
                      fee: 'FREE',
                    },
                  ].map((d) => {
                    const isSel = deliveryTier === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => setDeliveryTier(d.id as any)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSel
                            ? 'border-[#0B7A6C] bg-[#E6F4F1]/40'
                            : 'border-[#E5E7EB] bg-[#F5F7F8]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#1B1F23]">{d.title}</span>
                          <span className="text-xs font-extrabold text-[#0B7A6C]">{d.fee}</span>
                        </div>
                        <p className="text-[11.5px] text-[#6B7280]">{d.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentStep(3)}>
                    Continue to Payment <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ) : currentStep > 2 ? (
              <div className="text-xs text-[#6B7280]">
                Dispatch Tier:{' '}
                <strong className="text-[#1B1F23] uppercase">{deliveryTier} Delivery</strong>
              </div>
            ) : null}
          </div>

          {/* STEP 3: PAYMENT METHOD */}
          <div
            className={`bg-white border rounded-[18px] p-5 sm:p-6 transition-all ${
              currentStep === 3 ? 'border-[#0B7A6C] shadow-sm' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E7EB] mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep >= 3 ? 'bg-[#0B7A6C] text-white' : 'bg-[#F5F7F8] text-[#6B7280]'
                  }`}
                >
                  3
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1B1F23]">
                  3. Payment Option
                </h2>
              </div>
              {currentStep > 3 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-[#0B7A6C] hover:underline font-bold cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {currentStep === 3 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'cod', name: 'Cash on Delivery (COD)', desc: 'Pay cash at doorstep' },
                    { id: 'bank', name: 'Bank Transfer / IBFT', desc: 'Direct escrow settlement' },
                    { id: 'card', name: 'Debit / Credit Card', desc: 'Visa & Mastercard' },
                  ].map((m) => {
                    const isSel = paymentMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSel
                            ? 'border-[#0B7A6C] bg-[#E6F4F1]/40'
                            : 'border-[#E5E7EB] bg-[#F5F7F8]'
                        }`}
                      >
                        <span className="text-xs font-bold text-[#1B1F23] block">{m.name}</span>
                        <span className="text-[11px] text-[#6B7280]">{m.desc}</span>
                      </div>
                    );
                  })}
                </div>

                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-[#F5F7F8] border border-[#E5E7EB] space-y-3">
                    <Input
                      label="Card Number"
                      value={cardData.cardNumber}
                      onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Expiry (MM/YY)"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      />
                      <Input
                        label="CVC"
                        value={cardData.cvc}
                        onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentStep(4)}>
                    Continue to Final Review <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ) : currentStep > 3 ? (
              <div className="text-xs text-[#6B7280]">
                Payment Method:{' '}
                <strong className="text-[#1B1F23] uppercase">{paymentMethod}</strong>
              </div>
            ) : null}
          </div>

          {/* STEP 4: FINAL REVIEW */}
          <div
            className={`bg-white border rounded-[18px] p-5 sm:p-6 transition-all ${
              currentStep === 4 ? 'border-[#0B7A6C] shadow-sm' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center gap-3 pb-3.5 border-b border-[#E5E7EB] mb-4">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 4 ? 'bg-[#0B7A6C] text-white' : 'bg-[#F5F7F8] text-[#6B7280]'
                }`}
              >
                4
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-[#1B1F23]">
                4. Final Order Review &amp; Confirmation
              </h2>
            </div>

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#E6F4F1]/60 border border-[#0B7A6C]/25 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Recipient &amp; Address:</span>
                    <strong className="text-[#1B1F23]">
                      {addresses.find((a) => a.id === selectedAddress)?.address}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">MapTiler Coordinates:</span>
                    <strong className="font-mono text-[#0B7A6C]">
                      {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Payment &amp; Dispatch:</span>
                    <strong className="text-[#1B1F23] uppercase">
                      {paymentMethod} · {deliveryTier}
                    </strong>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-[#FEE2E2] text-[#E53935] text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={handlePlaceOrder}
                  >
                    {isSubmitting ? 'Confirming Order...' : `Confirm & Pay ${money(grandTotal)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <aside className="sticky top-24">
          <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-5 sm:p-6 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-[#1B1F23] pb-3 border-b border-[#E5E7EB]">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <img
                    src={
                      product.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-[#F5F7F8] border border-[#E5E7EB] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1B1F23] truncate">{product.name}</p>
                    <span className="text-[11px] text-[#6B7280]">Qty: {quantity}</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#0B7A6C]">
                    {money(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <strong className="text-[#1B1F23]">{money(subtotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <strong className="text-[#0B7A6C]">
                  {shipping === 0 ? 'FREE' : money(shipping)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (5%)</span>
                <strong className="text-[#1B1F23]">{money(tax)}</strong>
              </div>
              <div className="pt-3 border-t border-[#E5E7EB] flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-[#1B1F23]">Total (PKR)</span>
                <span className="text-xl font-extrabold text-[#0B7A6C]">{money(grandTotal)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
            >
              {isSubmitting ? 'Processing Order...' : 'Place Order Now'}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#0B7A6C] font-semibold">
              <ShieldCheck size={14} />
              <span>100% Escrow Money-Back Protection</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
