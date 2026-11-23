'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  CreditCard,
  ShieldCheck,
  Check,
  ArrowRight,
  Sparkles,
  Quote
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Button, Input, Radio, Checkbox } from '@/components/aimart-ui';
import { post } from '@/lib/api';

export function RegisterScreen() {
  const router = useRouter();
  const { refresh, setToast } = useApp();
  const [step, setStep] = useState(1);

  // Form states
  const [fullName, setFullName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [password, setPassword] = useState('Demo12345!');
  const [accountType, setAccountType] = useState<'customer' | 'vendor'>('customer');
  const [storeName, setStoreName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await post('/api/auth/register', {
        name: fullName,
        email,
        password,
        role: accountType === 'vendor' ? 'VENDOR' : 'CUSTOMER',
        ...(accountType === 'vendor' ? { storeName: storeName || `${fullName}'s Store` } : {})
      });
      await refresh();
      setToast('Account created successfully! Welcome to AI MART.');
      router.push(accountType === 'vendor' ? '/vendor' : '/');
    } catch (err: any) {
      setToast(err?.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] flex items-stretch">
      {/* 50/50 SPLIT: LEFT SIDE (Solid Orange #0B7A6C Panel with High Contrast White Copy) matching Screenshot 13 */}
      <div className="hidden lg:flex flex-1 relative bg-[#0B7A6C] p-12 xl:p-16 flex-col justify-between text-white overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-2xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-black/10 blur-2xl -ml-20 -mb-20 pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="text-3xl font-extrabold tracking-tight text-white">
            AI MART
          </Link>
          <span className="block text-xs uppercase tracking-widest text-white/80 mt-1 font-medium">
            Next-Generation Multi-Vendor Marketplace
          </span>
        </div>

        {/* Center Content & Live Stats matching Screenshot 13 */}
        <div className="relative z-10 max-w-lg space-y-10 my-auto">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
              Join 4.8M+ tech enthusiasts &amp; businesses on AI MART.
            </h1>
            <p className="text-white/90 text-base leading-relaxed">
              Experience algorithmic discovery, ultra-low transaction friction, and nationwide verified fulfillment.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/20">
            <div>
              <span className="text-3xl xl:text-4xl font-extrabold text-white block">4.8M+</span>
              <span className="text-xs uppercase tracking-wider text-white/80 mt-0.5 block">
                Active Users
              </span>
            </div>
            <div>
              <span className="text-3xl xl:text-4xl font-extrabold text-white block">$2B+</span>
              <span className="text-xs uppercase tracking-wider text-white/80 mt-0.5 block">
                Gross Volume Processed
              </span>
            </div>
            <div>
              <span className="text-3xl xl:text-4xl font-extrabold text-white block">99.98%</span>
              <span className="text-xs uppercase tracking-wider text-white/80 mt-0.5 block">
                Platform Uptime
              </span>
            </div>
            <div>
              <span className="text-3xl xl:text-4xl font-extrabold text-white block">&lt; 24h</span>
              <span className="text-xs uppercase tracking-wider text-white/80 mt-0.5 block">
                Express Dispatch
              </span>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="p-5 rounded-2xl bg-black/10 border border-white/15 space-y-2">
            <Quote size={20} className="text-white/60" />
            <p className="text-sm italic text-white/95">
              &ldquo;AI MART has transformed how our hardware lab procures custom components. The inventory intelligence is uncanny.&rdquo;
            </p>
            <span className="text-xs text-white/80 font-medium block">
              — Dr. Aris Thorne, Lead Engineer at QuantumX
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-white/70">
          © {new Date().getFullYear()} AI MART Inc. Built for the modern era.
        </div>
      </div>

      {/* 50/50 SPLIT: RIGHT SIDE (3-Step Registration Wizard) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header & Step Tracker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#737373]">
              <span className="text-[#0B7A6C] uppercase tracking-wider">
                Step {step} of 3
              </span>
              <span>
                {step === 1
                  ? 'Account Details'
                  : step === 2
                  ? 'Profile Info'
                  : 'Preferences'}
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-colors ${
                    s <= step ? 'bg-[#0B7A6C]' : 'bg-[#F1F5F9]'
                  }`}
                />
              ))}
            </div>

            <div className="pt-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                {step === 1
                  ? 'Create your account'
                  : step === 2
                  ? 'Account Type & Role'
                  : 'Review & Confirm'}
              </h2>
              <p className="text-xs text-[#737373] mt-1">
                Enter your details to begin your AI-driven commerce journey.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleNextStep} className="space-y-5">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Input
                  label="Full Name"
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <label className="text-xs font-semibold uppercase tracking-wider text-[#525252] block">
                  Select Account Role
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setAccountType('customer')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      accountType === 'customer'
                        ? 'border-[#0B7A6C] bg-[rgba(11, 122, 108,0.08)]'
                        : 'border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#A3A3A3]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#171717]">Shopper / Customer</span>
                      <Radio
                        name="account-type"
                        value="customer"
                        checked={accountType === 'customer'}
                        onChange={() => setAccountType('customer')}
                      />
                    </div>
                    <p className="text-[11px] text-[#737373]">
                      Browse curated tech, place orders, and receive real-time tracking.
                    </p>
                  </div>

                  <div
                    onClick={() => setAccountType('vendor')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      accountType === 'vendor'
                        ? 'border-[#0B7A6C] bg-[rgba(11, 122, 108,0.08)]'
                        : 'border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#A3A3A3]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#171717]">Merchant / Vendor</span>
                      <Radio
                        name="account-type"
                        value="vendor"
                        checked={accountType === 'vendor'}
                        onChange={() => setAccountType('vendor')}
                      />
                    </div>
                    <p className="text-[11px] text-[#737373]">
                      List products, manage inventory, and use AI forecasting tools.
                    </p>
                  </div>
                </div>

                {accountType === 'vendor' && (
                  <Input
                    label="Store Name"
                    placeholder="e.g. Apex Hardware Store"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                  />
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-2 text-xs text-[#525252]">
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Full Name:</span>
                    <span className="font-semibold text-[#171717]">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Email Address:</span>
                    <span className="font-semibold text-[#171717]">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Role:</span>
                    <span className="font-semibold text-[#0B7A6C] uppercase">{accountType}</span>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-[#525252] cursor-pointer pt-2 select-none">
                  <Checkbox
                    checked={agreeTerms}
                    onChange={setAgreeTerms}
                  />
                  <span>
                    I agree to the AI MART{' '}
                    <a href="#" className="text-[#0B7A6C] hover:underline">
                      Terms of Service
                    </a>{' '}
                    and Privacy Policy.
                  </span>
                </label>
              </motion.div>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              {step > 1 ? (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={loading || (step === 3 && !agreeTerms)}
                className="shadow-[0_4px_16px_rgba(11, 122, 108,0.25)]"
              >
                {step < 3 ? (
                  <>
                    Continue <ArrowRight size={15} />
                  </>
                ) : loading ? (
                  'Creating Account...'
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </div>
          </form>

          {/* Switch to Sign In */}
          <p className="text-center text-xs text-[#737373] pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-[#0B7A6C] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

