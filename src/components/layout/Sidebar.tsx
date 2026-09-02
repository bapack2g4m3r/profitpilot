'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Tag,
  DollarSign,
  Crosshair,
  Target,
  BrainCircuit,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Upload,
  PenLine,
  Compass,
  Radio,
  Sparkles
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  section: string;
}

const navItems: NavItem[] = [
  // Laporan & Data
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, section: 'ANALITIK' },
  { label: 'Laporan Harian', href: '/reports/daily', icon: <BarChart3 size={18} />, section: 'ANALITIK' },
  { label: 'Laporan Meta Ads', href: '/reports/campaigns', icon: <Megaphone size={18} />, section: 'ANALITIK' },
  { label: 'Tagging Produk', href: '/products', icon: <Tag size={18} />, section: 'ANALITIK' },
  { label: 'Kalkulator Profit', href: '/profit', icon: <DollarSign size={18} />, section: 'ANALITIK' },
  // Input Data
  { label: 'Import CSV Shopee', href: '/import', icon: <Upload size={18} />, section: 'INPUT DATA' },
  { label: 'Input Manual', href: '/input', icon: <PenLine size={18} />, section: 'INPUT DATA' },
  // Advanced & Intelligence
  { label: 'Atribusi Presisi', href: '/attribution', icon: <Crosshair size={18} />, section: 'AUTOMATION & AI' },
  { label: 'Robot Automasi', href: '/automation', icon: <Bot size={18} />, badge: 'BETA', section: 'AUTOMATION & AI' },
  { label: 'KPI Target', href: '/kpi', icon: <Target size={18} />, section: 'AUTOMATION & AI' },
  { label: 'AI Insights', href: '/insights', icon: <BrainCircuit size={18} />, badge: 'AI', section: 'AUTOMATION & AI' },
  // Settings
  { label: 'Pengaturan', href: '/settings', icon: <Settings size={18} />, section: 'PENGATURAN' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Group items by section
  const sections = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <aside
      className={`fixed left-4 top-4 bottom-4 z-50 flex flex-col rounded-3xl transition-all duration-300 ease-out apple-glass ${
        collapsed ? 'w-[70px]' : 'w-[240px]'
      }`}
      style={{
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}
    >
      {/* Brand & App Icon */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 shadow-lg shadow-blue-500/20 shrink-0">
          <Compass size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              ProfitPilot
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Shopee Affiliate × Meta
            </p>
          </div>
        )}
      </div>

      {/* Robot Live Indicator Pill */}
      <div className="px-3 pt-3">
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] border border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <Radio size={14} className="text-emerald-400 animate-pulse shrink-0" />
          {!collapsed && (
            <span className="text-[11px] text-slate-300 font-medium truncate">
              Robot System Ready
            </span>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                {section}
              </p>
            )}
            {items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                    collapsed ? 'justify-center' : ''
                  }`}
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    color: isActive ? '#ffffff' : '#a1a1b6',
                    boxShadow: isActive ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={`shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="group-hover:text-white transition-colors">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[60] apple-glass shadow-xl text-white">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/5 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Personal Admin</p>
              <p className="text-[10px] text-slate-400">Pro Member</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ml-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
