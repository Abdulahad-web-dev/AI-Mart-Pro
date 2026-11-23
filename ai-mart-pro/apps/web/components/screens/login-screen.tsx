'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ShieldCheck,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Button, Input, Checkbox } from '@/components/aimart-ui';
import { post } from '@/lib/api';

export function LoginScreen() {
  const router = useRouter();
  const { refresh, setToast } = useApp();
  const [email, setEmail] = useState('customer@aimart.test');
  const [password, setPassword] = useState('Demo12345!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await post<any>('/api/auth/login', { email, password });
      await refresh();
      setToast('Welcome back to AI MART!');
      router.push(
        data?.role === 'VENDOR' || data?.user?.role === 'VENDOR'
          ? '/vendor'
          : data?.role === 'ADMIN' || data?.user?.role === 'ADMIN'
          ? '/admin'
          : data?.role === 'DELIVERY' || data?.user?.role === 'DELIVERY'
          ? '/delivery'
          : '/'
      );
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1214] text-[#DFE2E5] flex items-stretch">
      {/* 50/50 SPLIT: LEFT SIDE (Feature Bullets & Server Glow) */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0B0E10] via-[#101519] to-[#0D1B2A] border-r border-[#2E3236] p-12 flex-col justify-between overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[rgba(255,182,147,0.08)] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[rgba(236,106,5,0.08)] rounded-full blur-[90px] pointer-events-none" />

        {/* Brand Top */}
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-extrabold text-[#FFB693] tracking-tight">
            AI MART
          </Link>
          <span className="block text-xs uppercase tracking-widest text-[#7C8288] mt-1">
            Technology for the Modern Era
          </span>
        </div>

        {/* Center Hero Copy & Features matching Screenshot 12 */}
        <div className="relative z-10 max-w-lg space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-[#DFE2E5] leading-tight">
              The Intelligent Multi-Vendor Marketplace.
            </h2>
            <p className="text-sm text-[#B8BDC2] leading-relaxed">
              Curated precision tech, autonomous inventory guidance, and millisecond checkout security.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1C1F23]/60 border border-[#2E3236] backdrop-blur-sm">
              <div className="p-2.5 rounded-lg bg-[rgba(255,182,147,0.12)] text-[#FFB693]">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#DFE2E5]">Predictive AI Ordering</h4>
                <p className="text-xs text-[#7C8288] mt-0.5">
                  Restock reminders and dynamic price-drop predictions based on real demand telemetry.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1C1F23]/60 border border-[#2E3236] backdrop-blur-sm">
              <div className="p-2.5 rounded-lg bg-[rgba(255,182,147,0.12)] text-[#FFB693]">
                <Zap size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#DFE2E5]">Instant Checkout</h4>
                <p className="text-xs text-[#7C8288] mt-0.5">
                  One-click verified address dispatch with nationwide same-day warehouse fulfillment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1C1F23]/60 border border-[#2E3236] backdrop-blur-sm">
              <div className="p-2.5 rounded-lg bg-[rgba(255,182,147,0.12)] text-[#FFB693]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#DFE2E5]">Encrypted Vault</h4>
                <p className="text-xs text-[#7C8288] mt-0.5">
                  Strict JWT multi-role token security with zero third-party telemetry leakage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-[#7C8288]">
          © {new Date().getFullYear()} AI MART Inc. All rights reserved.
        </div>
      </div>

      {/* 50/50 SPLIT: RIGHT SIDE (Sign In Form) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#DFE2E5] tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#7C8288]">
              Enter your credentials to access your account and active orders.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />

            {/* Password with Eye Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#B8BDC2]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#101315] border border-[#2E3236] rounded-md px-3.5 py-2.5 text-sm text-[#DFE2E5] placeholder-[#7C8288] focus:outline-none focus:border-[#FFB693] transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8288] hover:text-[#DFE2E5] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#B8BDC2] cursor-pointer select-none">
                <Checkbox
                  checked={rememberMe}
                  onChange={setRememberMe}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setToast('Password reset instructions sent')}
                className="text-[#FFB693] hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="text-xs text-[#FFB4AB] bg-[#8B0000]/20 border border-[#8B0000] p-2.5 rounded-lg">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-[0_4px_16px_rgba(255,182,147,0.25)]"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </Button>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#2E3236] w-full" />
            <span className="bg-[#0F1214] px-3 text-[11px] text-[#7C8288] uppercase tracking-wider absolute">
              Or continue with
            </span>
          </div>

          {/* Social OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setToast('Google SSO enabled for production')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1C1F23] hover:bg-[#2A2D31] border border-[#2E3236] text-xs font-medium text-[#DFE2E5] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-1.9.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={() => setToast('GitHub OAuth connected')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1C1F23] hover:bg-[#2A2D31] border border-[#2E3236] text-xs font-medium text-[#DFE2E5] transition-colors"
            >
              <svg className="w-4 h-4 fill-current text-[#DFE2E5]" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Switch to Register */}
          <p className="text-center text-xs text-[#7C8288]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#FFB693] font-semibold hover:underline">
              Join AI MART
            </Link>
          </p>

          <div className="p-3 rounded-lg bg-[#101315] border border-[#2E3236] text-[11px] text-[#7C8288] text-center">
            Demo credentials: <span className="text-[#FFB693]">customer@aimart.test</span> / <span className="text-[#FFB693]">Demo12345!</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

