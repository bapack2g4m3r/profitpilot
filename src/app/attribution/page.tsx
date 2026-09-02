'use client';

import { Crosshair, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { formatIDR } from '@/lib/utils';

export default function AttributionPage() {
  const attributionData = [
    { campaign: 'Beauty Serum - Broad', ad: 'Ad_Serum_Video1', utm: 'utm_campaign=beauty_serum', orders: 42, commission: 1250000, spend: 450000, roas: 2.78 },
    { campaign: 'Skincare Bundle - Lookalike', ad: 'Ad_Bundle_Image2', utm: 'utm_campaign=skincare_bundle', orders: 28, commission: 890000, spend: 320000, roas: 2.78 },
    { campaign: 'Sunscreen Promo - Interest', ad: 'Ad_Sunscreen_Carousel', utm: 'utm_campaign=sunscreen_promo', orders: 15, commission: 450000, spend: 200000, roas: 2.25 },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Crosshair size={20} className="text-emerald-400" />
          <h1 className="text-2xl font-bold">Atribusi Presisi (UTM Matching)</h1>
          <span className="badge badge-success text-[10px]">99.8% AKURASI</span>
        </div>
        <p className="text-sm text-slate-400">
          Menghubungkan data komisi transaksi Shopee Affiliate secara presisi ke Meta Ads Campaign &amp; Ad Set spesifik menggunakan parameter UTM tracking.
        </p>
      </div>

      {/* Attribution Funnel Visualizer */}
      <div className="card space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Alur Presisi Atribusi Customer Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="badge badge-purple text-[9px]">STEP 1</span>
            <p className="text-xs font-bold text-white">Meta Ads Impresi</p>
            <p className="text-[10px] text-slate-400">Customer melihat iklan Meta</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="badge badge-info text-[9px]">STEP 2</span>
            <p className="text-xs font-bold text-white">Klik Link Affiliate</p>
            <p className="text-[10px] text-slate-400">Parameter UTM tersimpan</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="badge badge-warning text-[9px]">STEP 3</span>
            <p className="text-xs font-bold text-white">Checkout Shopee</p>
            <p className="text-[10px] text-slate-400">Order terkonfirmasi</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="badge badge-success text-[9px]">STEP 4</span>
            <p className="text-xs font-bold text-emerald-400">Komisi Matched!</p>
            <p className="text-[10px] text-slate-400">Komisi masuk ke Campaign</p>
          </div>
        </div>
      </div>

      {/* Attribution Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Matching Atribusi per Meta Campaign</h3>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kampanye Meta Ads</th>
                <th>Parameter UTM Link</th>
                <th>Matched Orders</th>
                <th>Ad Spend</th>
                <th>Total Komisi</th>
                <th>Real ROAS</th>
              </tr>
            </thead>
            <tbody>
              {attributionData.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <div>
                      <p className="font-semibold text-sm text-white">{row.campaign}</p>
                      <p className="text-[11px] text-slate-400">{row.ad}</p>
                    </div>
                  </td>
                  <td><span className="font-mono text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{row.utm}</span></td>
                  <td><span className="font-mono font-bold text-white">{row.orders} orders</span></td>
                  <td><span className="font-mono text-red-400">{formatIDR(row.spend)}</span></td>
                  <td><span className="font-mono text-emerald-400 font-bold">{formatIDR(row.commission)}</span></td>
                  <td><span className="badge badge-success text-[10px]">{row.roas}x</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
