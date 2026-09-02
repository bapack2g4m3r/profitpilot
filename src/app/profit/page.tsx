'use client';

import { useState } from 'react';
import { formatIDR } from '@/lib/utils';
import { DollarSign, Calculator, Percent, ShieldAlert, ArrowRight, PercentIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ProfitRealPage() {
  const [komisiKotor, setKomisiKotor] = useState(5000000);
  const [biayaIklanRaw, setBiayaIklanRaw] = useState(2000000);
  const [hitungPpn11, setHitungPpn11] = useState(true);
  const [pajakPlatform, setPajakPlatform] = useState(2.5); // %
  const [biayaOps, setBiayaOps] = useState(250000);
  const [biayaDomainLanding, setBiayaDomainLanding] = useState(100000);

  const ppnMetaAmount = hitungPpn11 ? Math.round(biayaIklanRaw * 0.11) : 0;
  const totalBiayaIklanMeta = biayaIklanRaw + ppnMetaAmount;

  const totalDeductionPlatform = Math.round(komisiKotor * (pajakPlatform / 100));
  const totalBiaya = totalBiayaIklanMeta + totalDeductionPlatform + biayaOps + biayaDomainLanding;
  const netProfit = komisiKotor - totalBiaya;
  const marginPercentage = komisiKotor > 0 ? (netProfit / komisiKotor) * 100 : 0;
  const realROAS = totalBiayaIklanMeta > 0 ? komisiKotor / totalBiayaIklanMeta : 0;

  const pieData = [
    { name: 'Net Profit Bersih', value: Math.max(0, netProfit), color: '#30d158' },
    { name: 'Biaya Meta Ads Net', value: biayaIklanRaw, color: '#ff453a' },
    { name: 'PPN 11% Meta Ads', value: ppnMetaAmount, color: '#ff9f0a' },
    { name: 'Potongan Platform', value: totalDeductionPlatform, color: '#bf5af2' },
    { name: 'Ops & Domain', value: biayaOps + biayaDomainLanding, color: '#64d2ff' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <DollarSign size={20} className="text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Kalkulator Profit Real &amp; Net Margin</h1>
          <span className="apple-badge apple-badge-green text-[10px]">PRESI PRESI DENGAN PPN 11%</span>
        </div>
        <p className="text-sm text-slate-400">
          Hitung profit bersih riil setelah dikurangi biaya iklan Meta (termasuk PPN 11% Indonesia), potongan platform, ops, &amp; domain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <div className="apple-card space-y-4">
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
                className="input-field font-mono font-semibold text-amber-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 block font-semibold">Biaya Iklan Meta Ads (Dashboard Net)</label>
                <button
                  type="button"
                  onClick={() => setHitungPpn11(!hitungPpn11)}
                  className={`apple-badge text-[10px] cursor-pointer ${
                    hitungPpn11 ? 'apple-badge-green' : 'apple-badge-amber'
                  }`}
                >
                  PPN 11%: {hitungPpn11 ? 'Aktif (+11%)' : 'Non-Aktif'}
                </button>
              </div>
              <input
                type="number"
                value={biayaIklanRaw}
                onChange={(e) => setBiayaIklanRaw(Number(e.target.value))}
                className="input-field font-mono font-semibold text-rose-400"
              />

              {hitungPpn11 && (
                <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-300">
                  <span>+ PPN 11% Meta Ads: <strong className="text-amber-400">{formatIDR(ppnMetaAmount)}</strong></span>
                  <span>Total Tagihan: <strong className="text-rose-400">{formatIDR(totalBiayaIklanMeta)}</strong></span>
                </div>
              )}
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
                <div className="input-field bg-slate-900/80 font-mono text-slate-400 cursor-not-allowed">
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
          <div className="apple-card" style={{ borderColor: netProfit >= 0 ? 'rgba(48, 209, 88, 0.4)' : 'rgba(255, 69, 58, 0.4)' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Profit Real (Bersih Diterima ReKenangan)</span>
            <p className={`text-3xl font-extrabold font-mono mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatIDR(netProfit)}
            </p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs">
              <div>
                <span className="text-slate-400">Net Profit Margin: </span>
                <strong className={`font-mono ${marginPercentage >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {marginPercentage.toFixed(1)}%
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Real ROAS (Inc. PPN): </span>
                <strong className="font-mono text-purple-400">{realROAS.toFixed(2)}x</strong>
              </div>
            </div>
          </div>

          {/* Breakdown Chart */}
          <div className="apple-card">
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
