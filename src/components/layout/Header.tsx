'use client';

import { RefreshCw, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="apple-badge apple-badge-green text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              v1.0 Apple Edition
            </span>
            <span className="apple-badge apple-badge-purple text-[10px]">
              <Sparkles size={10} /> Personal Suite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Pusat Analitik &amp; Automasi
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pantau performa Shopee Affiliate &amp; Meta Ads secara presisi dari satu tempat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="apple-btn-secondary text-xs">
            <ShieldCheck size={14} className="text-emerald-400" /> API Connected
          </button>
          <button onClick={onRefresh} className="apple-btn-primary text-xs">
            <RefreshCw size={14} /> Sync Data
          </button>
        </div>
      </div>
    </header>
  );
}
