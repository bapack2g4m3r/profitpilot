'use client';

import { BrainCircuit, Sparkles, Zap, TrendingUp, Lightbulb } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit size={20} className="text-emerald-400" />
          <h1 className="text-2xl font-bold">AI Insights &amp; Rekomendasi Scaling</h1>
          <span className="badge badge-purple text-[10px]">GEMINI AI POWERED</span>
        </div>
        <p className="text-sm text-slate-400">
          Analisis kecerdasan buatan otomatis untuk mendeteksi campaign berpotensi rugi, saran kenaikan budget, dan prediksi komisi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-glow space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles size={18} />
            <h3 className="font-bold text-sm text-white">Rekomendasi Scaling Produk Winner</h3>
          </div>
          <p className="text-xs text-slate-300">
            Produk <strong>&quot;Serum Vitamin C Brightening&quot;</strong> menunjukkan ROAS 3.2x dengan kestabilan komisi selama 7 hari berturut-turut.
          </p>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            💡 Saran: Naikkan daily budget Meta Ads sebesar +25% (dari Rp 200rb ke Rp 250rb).
          </div>
        </div>

        <div className="card-glow space-y-2">
          <div className="flex items-center gap-2 text-yellow-400">
            <Lightbulb size={18} />
            <h3 className="font-bold text-sm text-white">Alert Kebocoran Budget</h3>
          </div>
          <p className="text-xs text-slate-300">
            Kampanye <strong>&quot;Brand Awareness - Video&quot;</strong> mengalami penurunan CTR ke 0.8% dan ROAS 0.9x dalam 3 hari terakhir.
          </p>
          <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
            ⚠️ Saran: Matikan ad set ini atau ganti materi kreatif video/thumbnail baru.
          </div>
        </div>
      </div>
    </div>
  );
}
