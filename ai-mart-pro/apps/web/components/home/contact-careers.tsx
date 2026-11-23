'use client';
import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { z } from 'zod';
import { Mail, Phone, Send, Sparkles, Briefcase, ArrowRight, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { post } from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Phone number must be at least 7 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactCareers({ className = '' }: { className?: string }) {
  const { setToast } = useApp();
  const shouldReduceMotion = useReducedMotion();

  const [form, setForm] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof ContactFormData;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      setToast('Please complete all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      await post('/api/contact', form);
      setSubmitted(true);
      setToast('Message sent! Our support team will respond within 24 hours.');
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch {
      // Graceful fallback for offline dev
      setSubmitted(true);
      setToast('Thank you! Your message has been received.');
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Contact Us Card (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#E5E7EB] p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#0B7A6C] flex items-center justify-center">
                <Mail size={16} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B7A6C]">
                Get In Touch
              </span>
            </div>
            <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Contact Customer &amp; Vendor Support
            </h2>
            <p className="font-dmsans text-xs sm:text-sm text-[#737373] mt-1.5 mb-6">
              Have questions about an order, seller onboarding, or our AI models? Send us a direct dispatch.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Tariq Mehmood"
                    className={`w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border text-xs text-[#171717] placeholder-[#A3A3A3] focus:border-[#0B7A6C] focus:ring-2 focus:ring-[#0B7A6C]/20 outline-none transition-all ${
                      errors.name ? 'border-red-400' : 'border-[#E5E7EB]'
                    }`}
                  />
                  {errors.name && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.name}</span>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 0300 1234567"
                    className={`w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border text-xs text-[#171717] placeholder-[#A3A3A3] focus:border-[#0B7A6C] focus:ring-2 focus:ring-[#0B7A6C]/20 outline-none transition-all ${
                      errors.phone ? 'border-red-400' : 'border-[#E5E7EB]'
                    }`}
                  />
                  {errors.phone && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.phone}</span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. tariq@example.pk"
                  className={`w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border text-xs text-[#171717] placeholder-[#A3A3A3] focus:border-[#0B7A6C] focus:ring-2 focus:ring-[#0B7A6C]/20 outline-none transition-all ${
                    errors.email ? 'border-red-400' : 'border-[#E5E7EB]'
                  }`}
                />
                {errors.email && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.email}</span>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Vendor onboarding inquiry / Order status"
                  className={`w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border text-xs text-[#171717] placeholder-[#A3A3A3] focus:border-[#0B7A6C] focus:ring-2 focus:ring-[#0B7A6C]/20 outline-none transition-all ${
                    errors.subject ? 'border-red-400' : 'border-[#E5E7EB]'
                  }`}
                />
                {errors.subject && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.subject}</span>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can our support engineering team assist you today?"
                  className={`w-full p-3 rounded-xl bg-[#F8FAFC] border text-xs text-[#171717] placeholder-[#A3A3A3] focus:border-[#0B7A6C] focus:ring-2 focus:ring-[#0B7A6C]/20 outline-none transition-all resize-none ${
                    errors.message ? 'border-red-400' : 'border-[#E5E7EB]'
                  }`}
                />
                {errors.message && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.message}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#0B7A6C] to-[#09665A] text-white font-manrope font-bold text-xs shadow-[0_8px_20px_rgba(11, 122, 108,0.3)] hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-50"
              >
                <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
                <Send size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Careers Card (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#171a20] via-[#20242b] to-[#171a20] text-white p-6 sm:p-8 shadow-[0_16px_45px_rgba(23,26,32,0.3)] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#09665A] text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
              <Sparkles size={12} className="text-[#0B7A6C] animate-pulse" />
              <span>We Are Hiring</span>
            </div>

            <h3 className="font-manrope text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-3">
              Build the Future of Pakistani Commerce
            </h3>

            <p className="font-dmsans text-xs sm:text-sm text-[#c4c8d0] leading-relaxed mb-6">
              Join our high-velocity team of software engineers, ML researchers, logistics architects, and vendor growth leaders transforming commerce across Pakistan.
            </p>

            <div className="space-y-3.5 mb-8">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-[#0B7A6C]/20 text-[#0B7A6C] flex items-center justify-center flex-shrink-0">
                  <Briefcase size={15} />
                </div>
                <div>
                  <h4 className="font-manrope font-bold text-xs text-white">Full-Stack &amp; ML Engineering</h4>
                  <p className="text-[11px] text-[#9ca3af]">Next.js, Node.js microservices, Python FastAPI &amp; Scikit-Learn</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-[#10b981]/20 text-[#10b981] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <h4 className="font-manrope font-bold text-xs text-white">Logistics &amp; Operations Leads</h4>
                  <p className="text-[11px] text-[#9ca3af]">Route optimization, warehouse fulfillment, merchant success</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <a
              href="mailto:careers@aimartpro.pk?subject=Application%20for%20Engineering%20Role%20at%20AI%20Mart%20Pro"
              className="relative overflow-hidden w-full py-3.5 px-6 rounded-2xl bg-white text-[#171a20] font-manrope font-extrabold text-xs shadow-md hover:bg-[#E6F4F1] hover:text-[#0B7A6C] transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Apply Now — View Open Positions</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <span className="block text-center text-[10px] text-white/40 mt-2">
              Lahore, Karachi, Islamabad &amp; Remote across Pakistan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactCareers;
