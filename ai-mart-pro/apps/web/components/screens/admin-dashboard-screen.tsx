'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  Users,
  Package,
  ShoppingBag,
  ShieldAlert,
  SlidersHorizontal,
  Bell,
  AlertTriangle,
  Download,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import {
  StatCard,
  ChartArea,
  Button,
  Modal
} from '@/components/aimart-ui';

export function AdminDashboardScreen() {
  const { setToast } = useApp();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [blockIpModal, setBlockIpModal] = useState<string | null>(null);

  // 12-Month Area Chart Data matching Screenshot 2
  const chartData = [
    { label: 'Jan', value: 420 },
    { label: 'Feb', value: 580 },
    { label: 'Mar', value: 720 },
    { label: 'Apr', value: 890 },
    { label: 'May', value: 1100 },
    { label: 'Jun', value: 950 },
    { label: 'Jul', value: 1340 },
    { label: 'Aug', value: 1220 },
    { label: 'Sep', value: 1560 },
    { label: 'Oct', value: 1840 }
  ];

  // Fraud & Risk Alerts List in State
  const [fraudAlerts, setFraudAlerts] = useState([
    {
      id: 'fa-1',
      severity: 'CRITICAL',
      title: 'Velocity Anomaly Detected',
      ip: '185.220.101.5',
      desc: '12 high-velocity order attempts with mismatched billing addresses in under 90s.',
      time: '2m ago'
    },
    {
      id: 'fa-2',
      severity: 'HIGH',
      title: 'Card Testing Pattern',
      ip: '194.26.29.112',
      desc: 'Repeated sequential CVV re-submissions across 4 virtual cards.',
      time: '18m ago'
    },
    {
      id: 'fa-3',
      severity: 'HIGH',
      title: 'Sudden Vendor Catalog Deflation',
      ip: '172.56.21.90',
      desc: 'Merchant "Apex Labs" dropped 40 prices by 95% within 3 minutes.',
      time: '45m ago'
    }
  ]);

  // Moderation Queue Table in State
  const [moderationQueue, setModerationQueue] = useState([
    {
      id: 'MOD-882',
      product: 'AuraTech Active Studio Headphones',
      vendor: 'AuraTech Acoustics',
      flag: 'Suspected duplicate listing',
      date: 'Today, 11:20 AM'
    },
    {
      id: 'MOD-881',
      product: 'Titanium Smart Ring Band Gen 3',
      vendor: 'Nexus Wearables',
      flag: 'Unverified medical claim in description',
      date: 'Today, 09:45 AM'
    },
    {
      id: 'MOD-880',
      product: 'Wireless Drone 4K Gimbal',
      vendor: 'SkyHigh Electronics',
      flag: 'Customer reported non-authentic serial',
      date: 'Yesterday'
    }
  ]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'orders', label: 'Global Orders', icon: ShoppingBag },
    { id: 'fraud', label: 'Fraud & Security', icon: ShieldAlert, badge: `${fraudAlerts.length} High` },
    { id: 'moderation', label: 'Moderation Queue', icon: AlertTriangle, badge: `${moderationQueue.length}` },
    { id: 'settings', label: 'System Settings', icon: SlidersHorizontal }
  ];

  const handleBlockIp = () => {
    if (!blockIpModal) return;
    setFraudAlerts(fraudAlerts.filter((a) => a.ip !== blockIpModal));
    setToast(`IP ${blockIpModal} blocked & blacklisted at edge firewall.`);
    setBlockIpModal(null);
  };

  const handleApprove = (id: string, name: string) => {
    setModerationQueue(moderationQueue.filter((m) => m.id !== id));
    setToast(`Listing ${id} ("${name.slice(0, 20)}...") verified & approved.`);
  };

  const handleReject = (id: string, name: string) => {
    setModerationQueue(moderationQueue.filter((m) => m.id !== id));
    setToast(`Listing ${id} removed from marketplace.`);
  };

  // Real CSV download
  const handleExportCsv = () => {
    const csvContent =
      'Date,Metric,Value,Status\n' +
      '2024-10-01,Gross GMV,$1840000,Normal\n' +
      '2024-10-01,Active Shoppers,48219,Normal\n' +
      '2024-10-01,Fraud Attempts,124,Mitigated\n' +
      '2024-10-01,Pending Moderation,23,In Review\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'aimart-platform-telemetry.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast('Marketplace telemetry CSV downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] flex">
      {/* ADMIN FIXED LEFT SIDEBAR */}
      <aside className="w-72 bg-[#FFFFFF] border-r border-[#E5E7EB] hidden lg:flex flex-col justify-between p-6 flex-shrink-0">
        <div className="space-y-8">
          <div>
            <Link href="/" className="text-2xl font-extrabold text-[#0B7A6C] tracking-tight">
              AI MART
            </Link>
            <span className="block text-[11px] uppercase tracking-widest text-[#737373] mt-1 font-semibold">
              Admin Control Center
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSel = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                    isSel
                      ? 'bg-[rgba(11, 122, 108,0.12)] text-[#0B7A6C] font-semibold'
                      : 'text-[#525252] hover:bg-[#F1F5F9] hover:text-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isSel ? 'text-[#0B7A6C]' : 'text-[#737373]'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badge.includes('High')
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : 'bg-[#F1F5F9] text-[#171717]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Super Admin Card */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[rgba(11, 122, 108,0.15)] text-[#0B7A6C] flex items-center justify-center font-bold text-xs">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#171717] block">Super Admin</span>
            <span className="text-[10px] text-[#16A34A] flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Root Privileges
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN ADMIN CONTROL VIEW */}
      <div className="flex-1 min-w-0 flex flex-col pb-24">
        {/* Top Header */}
        <header className="h-20 border-b border-[#E5E7EB] bg-[#FFFFFF]/80 backdrop-blur-md px-6 sm:px-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#171717]">Platform Overview</h1>
            <p className="text-xs text-[#737373]">Marketplace health, anomaly alerts &amp; audit trails.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
              <span className="text-[#525252]">Live Active Shoppers:</span>
              <span className="font-mono font-bold text-[#0B7A6C]">3,428</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 text-xs"
            >
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 sm:p-10 space-y-8 max-w-[1400px]">
          {/* 4 StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              label="Active Users"
              value="48,219"
              trend={12.0}
              icon={<Users size={20} />}
            />
            <StatCard
              label="Platform GMV"
              value="$1.84M"
              trend={18.5}
              icon={<DollarSign size={20} />}
            />
            <StatCard
              label="Pending Moderation"
              value={moderationQueue.length}
              trend={-4.5}
              icon={<Package size={20} />}
            />

            {/* Fraud Alerts Card with Danger Styling */}
            <div className="bg-[#FFFFFF] border-2 border-[#FEE2E2] rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="uppercase tracking-wider font-bold text-[#DC2626]">
                  Fraud Alerts
                </span>
                <span className="p-2 rounded-lg bg-[#FEE2E2]/40 text-[#DC2626]">
                  <AlertTriangle size={18} />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#DC2626] font-mono">
                  {fraudAlerts.length}
                </span>
                <span className="text-xs text-[#DC2626] font-semibold">High Priority</span>
              </div>
              <span className="text-[11px] text-[#DC2626]/80 block mt-1">
                Active automated anomaly mitigation
              </span>
            </div>
          </div>

          {/* 12-Month Area Chart & Fraud & Risk Alerts Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
            {/* 12-Month Volume Area Chart */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#171717]">
                    Platform Volume &amp; Transactions (12 Mo)
                  </h3>
                  <span className="text-xs text-[#737373]">Gross monthly marketplace throughput in thousands</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#0B7A6C] bg-[rgba(11, 122, 108,0.12)] px-2.5 py-1 rounded-full">
                  $1.84M YTD
                </span>
              </div>

              <div className="pt-2">
                <ChartArea data={chartData} height={260} />
              </div>
            </div>

            {/* Fraud & Risk Alerts Panel */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className="text-[#DC2626]" />
                  <h3 className="text-base font-bold text-[#171717]">Security &amp; Fraud</h3>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[#FEE2E2] text-[#DC2626]">
                  {fraudAlerts.length} Active
                </span>
              </div>

              <div className="space-y-3.5">
                {fraudAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#DC2626]">{alert.severity}</span>
                      <span className="text-[#737373]">{alert.time}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#171717]">{alert.title}</h4>
                      <p className="text-[11px] text-[#525252] mt-0.5">{alert.desc}</p>
                      <span className="text-[10px] font-mono text-[#737373] block mt-1">
                        Origin IP: {alert.ip}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs py-1"
                        onClick={() => setToast(`Auditing telemetry for ${alert.ip}`)}
                      >
                        Review
                      </Button>
                      <Button
                        variant="danger-soft"
                        size="sm"
                        className="text-xs py-1"
                        onClick={() => setBlockIpModal(alert.ip)}
                      >
                        Block IP
                      </Button>
                    </div>
                  </div>
                ))}
                {fraudAlerts.length === 0 && (
                  <p className="text-xs text-[#16A34A] text-center py-4">
                    ✓ All threat anomalies successfully mitigated.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Moderation Queue Table (Working Feature) */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#171717]">Recent Moderation Queue</h3>
                <span className="text-xs text-[#737373]">Automated and customer-reported catalog flags.</span>
              </div>
              <span className="text-xs text-[#0B7A6C] font-semibold">{moderationQueue.length} Total Pending</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFFFFF] text-[#737373] uppercase tracking-wider font-semibold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3.5 px-6">Queue ID</th>
                    <th className="py-3.5 px-6">Listing / Product</th>
                    <th className="py-3.5 px-6">Vendor</th>
                    <th className="py-3.5 px-6">Flag Reason</th>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-[#525252]">
                  {moderationQueue.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F1F5F9]/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#0B7A6C]">{m.id}</td>
                      <td className="py-4 px-6 font-medium text-[#171717]">{m.product}</td>
                      <td className="py-4 px-6 text-[#525252]">{m.vendor}</td>
                      <td className="py-4 px-6 text-[#0B7A6C]">{m.flag}</td>
                      <td className="py-4 px-6 text-[#737373]">{m.date}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(m.id, m.product)}
                            className="p-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#16A34A]/20 text-[#16A34A] transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(m.id, m.product)}
                            className="p-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#FEE2E2]/40 text-[#DC2626] transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {moderationQueue.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-[#16A34A]">
                        ✓ Moderation queue is clear! All items verified.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Block IP Modal */}
      {blockIpModal && (
        <Modal
          isOpen={Boolean(blockIpModal)}
          onClose={() => setBlockIpModal(null)}
          title="Block Malicious IP"
        >
          <div className="space-y-4 text-xs text-[#525252]">
            <p>
              Are you sure you want to block IP <b className="text-[#0B7A6C] font-mono">{blockIpModal}</b>?
              All future traffic, authentication attempts, and order submissions from this address will be dropped at the API gateway.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" onClick={() => setBlockIpModal(null)}>
                Cancel
              </Button>
              <Button variant="danger-soft" size="sm" onClick={handleBlockIp}>
                Confirm Block IP
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
