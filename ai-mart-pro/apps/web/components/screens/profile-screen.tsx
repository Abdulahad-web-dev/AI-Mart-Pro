'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  ShoppingBag,
  Shield,
  MapPin,
  CreditCard,
  Bell,
  Camera,
  Award,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Button, Input } from '@/components/aimart-ui';

export function ProfileScreen() {
  const { user, setToast } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [formData, setFormData] = useState({
    firstName: 'Abdulahad',
    lastName: 'Warraich',
    email: user?.email || 'abdulahad@aimart.pro',
    phone: '+92 300 1234567',
    birthday: '1998-04-16',
    address: 'House #42, Street 8, Phase 5, DHA, Lahore'
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToast('Account profile successfully updated!');
    }, 700);
  };

  const navLinks = [
    { id: 'profile', label: 'Personal Information', icon: User },
    { id: 'security', label: 'Security & 2FA', icon: Shield },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] pb-24">
      {/* Top Header */}
      <div className="border-b border-[#E5E7EB] bg-[#FFFFFF]/80 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-[#171717]">Account Settings</h1>
          <span className="text-xs text-[#16A34A] flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Verified Member
          </span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* LEFT SIDEBAR NAVIGATION matching Screenshot 11 */}
          <aside className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 space-y-1 shadow-sm">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isSel = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                    isSel
                      ? 'bg-[rgba(11, 122, 108,0.12)] text-[#0B7A6C] font-semibold'
                      : 'text-[#525252] hover:bg-[#F1F5F9] hover:text-[#171717]'
                  }`}
                >
                  <Icon size={16} className={isSel ? 'text-[#0B7A6C]' : 'text-[#737373]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* MAIN SETTINGS AREA */}
          <main className="space-y-6">
            {/* Profile Header Card: 96px rounded-square avatar with upload badge matching Screenshot 11 */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-[#F1F5F9] border-2 border-[#0B7A6C] flex items-center justify-center text-[#0B7A6C] text-3xl font-extrabold shadow-md overflow-hidden">
                  <span>AW</span>
                </div>
                <button
                  onClick={() => setToast('Photo upload dialogue opened')}
                  className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#0B7A6C] text-[#FFFFFF] shadow hover:bg-[#09665A] transition-colors"
                  aria-label="Upload avatar image"
                >
                  <Camera size={15} />
                </button>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-[#171717]">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0B7A6C]/20 text-[#0B7A6C] border border-[#0B7A6C]/30">
                    <Award size={12} /> Tier: Gold Member
                  </span>
                </div>
                <p className="text-xs text-[#737373] flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail size={12} /> {formData.email} · Member since Oct 2023
                </p>
              </div>
            </div>

            {/* Form Fields matching Screenshot 11 */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSave} className="space-y-6">
                <h3 className="text-base font-bold text-[#171717] pb-3 border-b border-[#E5E7EB]">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    type="email"
                    required
                  />
                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) =>
                      setFormData({ ...formData, birthday: e.target.value })
                    }
                  />
                  <Input
                    label="Default City / Region"
                    value="Lahore, Punjab"
                    onChange={() => {}}
                  />
                </div>

                <Input
                  label="Primary Delivery Street Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />

                <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                  <span className="text-xs text-[#737373]">
                    Last updated: Today at 10:24 AM
                  </span>

                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={saving}
                    className="shadow-[0_4px_15px_rgba(11, 122, 108,0.25)]"
                  >
                    {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

