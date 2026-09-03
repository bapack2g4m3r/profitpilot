'use client';

import { useState } from 'react';
import { RefreshCw, Sparkles, Layers, Percent, Database } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
  selectedAccount?: string;
  onAccountChange?: (accountId: string) => void;
  includeTax11?: boolean;
  onTaxChange?: (include: boolean) => void;
}

export default function Header({
  onRefresh,
  selectedAccount = 'all',
  onAccountChange,
  includeTax11 = true,
  onTaxChange,
}: HeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="apple-badge apple-badge-green text-[10px]">
              <Database size={10} /> Supabase Cloud Connected
            </span>
            <span className="apple-badge apple-badge-purple text-[10px]">
              <Sparkles size={10} /> Multi-Account &amp; Tax Ready
            </span>
            <button
              onClick={() => onTaxChange?.(!includeTax11)}
              className={`apple-badge cursor-pointer transition-all ${
                includeTax11 ? 'apple-badge-green' : 'apple-badge-amber'
              }`}
              title="Klik untuk ubah perhitungan PPN 11% Meta Ads Indonesia"
            >
              <Percent size={10} /> PPN 11% Meta: {includeTax11 ? 'Dihitung (Riil)' : 'Mentah (Tanpa Tax)'}
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Pusat Analitik &amp; Automasi
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pantau performa Shopee Affiliate &amp; Meta Ads secara presisi dari satu tempat.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Meta Ad Account Switcher */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-1">
            <Layers size={14} className="text-purple-400" />
            <select
              value={selectedAccount}
              onChange={(e) => onAccountChange?.(e.target.value)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer font-medium py-1"
            >
              <option value="all" className="bg-slate-900 text-white">Semua Akun Meta</option>
              <option value="1" className="bg-slate-900 text-white">Akun #1 (Beauty Store)</option>
              <option value="2" className="bg-slate-900 text-white">Akun #2 (Fashion Hub)</option>
            </select>
          </div>

          <button onClick={onRefresh} className="apple-btn-primary text-xs">
            <RefreshCw size={14} /> Sync Data
          </button>
        </div>
      </div>
    </header>
  );
}
