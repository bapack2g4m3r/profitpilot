'use client';

import { useState } from 'react';
import { formatIDR } from '@/lib/utils';
import { DollarSign, Calculator, Percent, ShieldAlert, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ProfitRealPage() {
  const [komisiKotor, setKomisiKotor] = useState(5000000);
  const [biayaIklan, setBiayaIklan] = useState(2000000);
  const [pajakPlatform, setPajakPlatform] = useState(2.5); // %
  const [biayaOps, setBiayaOps] = useState(250000);
  const [biayaDomainLanding, setBiayaDomainLanding] = useState(100000);

  const totalDeductionPlatform = Math.round(komisiKotor * (pajakPlatform / 100));
  const totalBiaya = biayaIklan + totalDeductionPlatform + biayaOps + biayaDomainLanding;
  const netProfit = komisiKotor - totalBiaya;
  const marginPercentage = komisiKotor > 0 ? (netProfit / komisiKotor) * 100 : 0;
  const realROAS = biayaIklan > 0 ? komisiKotor / biayaIklan : 0;

  const pieData = [
    { name: 'Net Profit Bersih', value: Math.max(0, netProfit), color: '#34d399' },
    { name: 'Biaya Meta Ads', value: biayaIklan, color: '#f87171' },
    { name: 'Potongan Shopee/Pajak', value: totalDeductionPlatform, color: '#fbbf24' },
    { name: 'Biaya Ops & Tools', value: biayaOps + biayaDomainLanding, color: '#a78bfa' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={20} className="text-emerald-400" />
          <h1 className="text-2xl font-bold">Kalkulator Profit Real & Net Margin</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Hitung profit bersih riil setelah dikurangi biaya iklan Meta, potongan platform, biaya operasional, dan domain landing page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <div className="card space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-white">
            <Calculator size={16} className="text-emerald-400" /> Input Param Biaya
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Komisi Kotor Shopee (IDR)</label>
              <input
                type="number"
                value={komisiKotor}
                onChange={(e) => setKomisiKotor(Number(e.target.value))}
                className="input-field font-mono font-semibold text-yellow-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Biaya Iklan Meta Ads (IDR)</label>
              <input
                type="number"
                value={biayaIklan}
                onChange={(e) => setBiayaIklan(Number(e.target.value))}
                className="input-field font-mono font-semibold text-red-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Potongan Platform (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={pajakPlatform}
                  onChange={(e) => setPajakPlatform(Number(e.target.value))}
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nominal Potongan</label>
                <div className="input-field bg-slate-900 font-mono text-slate-400 cursor-not-allowed">
                  {formatIDR(totalDeductionPlatform)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Biaya Ops (Tools/Internet/Gaji)</label>
              <input
                type="number"
                value={biayaOps}
                onChange={(e) => setBiayaOps(Number(e.target.value))}
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Biaya Domain / Hosting Landing Page</label>
              <input
                type="number"
                value={biayaDomainLanding}
                onChange={(e) => setBiayaDomainLanding(Number(e.target.value))}
                className="input-field font-mono"
              />
            </div>
          </div>
        </div>

        {/* Real Profit Result & Breakdown */}
        <div className="space-y-4">
          {/* Main Net Profit Card */}
          <div className="card-glow" style={{ borderColor: netProfit >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Profit Real (Bersih Diterima)</span>
            <p className={`text-3xl font-extrabold font-mono mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatIDR(netProfit)}
            </p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Net Profit Margin: </span>
                <strong className={`font-mono ${marginPercentage >= 20 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {marginPercentage.toFixed(1)}%
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Real ROAS: </span>
                <strong className="font-mono text-purple-400">{realROAS.toFixed(2)}x</strong>
              </div>
            </div>
          </div>

          {/* Breakdown Chart */}
          <div className="card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Distribusi Alokasi Komisi</h4>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatIDR(Number(value) || 0)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-slate-400 truncate">{item.name}</span>
                  <span className="font-mono text-white ml-auto">{formatIDR(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
