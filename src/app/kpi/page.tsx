'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Flag, TrendingUp, DollarSign, RefreshCw, Check } from 'lucide-react';
import { formatIDR, formatNumber } from '@/lib/utils';

export default function KPIPlannerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form target state
  const [targetComm, setTargetComm] = useState('10000000');
  const [targetROAS, setTargetROAS] = useState('2.5');
  const [maxSpend, setMaxSpend] = useState('4000000');
  const [targetOrders, setTargetOrders] = useState('500');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchKPIData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kpi');
      const json = await res.json();
      setData(json);
      if (json.target) {
        setTargetComm(json.target.target_commission.toString());
        setTargetROAS(json.target.target_roas.toString());
        setMaxSpend(json.target.max_ad_spend.toString());
        setTargetOrders(json.target.target_orders.toString());
      }
    } catch (err) {
      console.error('Failed to fetch KPI data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIData();
  }, [fetchKPIData]);

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/kpi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_commission: parseFloat(targetComm),
        target_roas: parseFloat(targetROAS),
        max_ad_spend: parseFloat(maxSpend),
        target_orders: parseInt(targetOrders),
      }),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    fetchKPIData();
  };

  const commProgress = data?.target ? Math.min(100, (data.current.current_commission / data.target.target_commission) * 100) : 0;
  const ordersProgress = data?.target ? Math.min(100, (data.current.current_orders / data.target.target_orders) * 100) : 0;
  const spendProgress = data?.target ? Math.min(100, (data.current.current_spend / data.target.max_ad_spend) * 100) : 0;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Target size={20} className="text-emerald-400" />
          <h1 className="text-2xl font-bold">KPI Planner &amp; Target Tracking</h1>
        </div>
        <p className="text-sm text-slate-400">
          Tentukan target omset komisi bulanan, batas max budget iklan, dan pantau progres pencapaian secara real-time.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-32 rounded-xl" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Targets Progress Bars */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card space-y-4">
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <Flag size={16} className="text-yellow-400" /> Progres Target Bulan Ini
              </h3>

              {/* Commission Target */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Komisi Kotor</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {formatIDR(data.current.current_commission)} / {formatIDR(data.target.target_commission)} ({commProgress.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${commProgress}%` }} />
                </div>
              </div>

              {/* Orders Target */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Order Selesai</span>
                  <span className="font-mono text-blue-400 font-bold">
                    {formatNumber(data.current.current_orders)} / {formatNumber(data.target.target_orders)} Order ({ordersProgress.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${ordersProgress}%` }} />
                </div>
              </div>

              {/* Ad Spend Cap */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Batas Maksimal Spend Ads</span>
                  <span className={`font-mono font-bold ${spendProgress > 90 ? 'text-red-400' : 'text-purple-400'}`}>
                    {formatIDR(data.current.current_spend)} / {formatIDR(data.target.max_ad_spend)} ({spendProgress.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${spendProgress > 90 ? 'bg-red-400' : 'bg-purple-400'}`} style={{ width: `${spendProgress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Target Form */}
          <div className="card space-y-4">
            <h3 className="text-sm font-bold uppercase text-white">Atur Target Baru</h3>
            {saveSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check size={14} /> Target berhasil diperbarui!
              </div>
            )}
            <form onSubmit={handleSaveTarget} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Komisi Bulanan (IDR)</label>
                <input
                  type="number"
                  value={targetComm}
                  onChange={(e) => setTargetComm(e.target.value)}
                  className="input-field font-mono text-emerald-400 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Minimum ROAS</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetROAS}
                  onChange={(e) => setTargetROAS(e.target.value)}
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Maksimal Spend Ads (IDR Cap)</label>
                <input
                  type="number"
                  value={maxSpend}
                  onChange={(e) => setMaxSpend(e.target.value)}
                  className="input-field font-mono text-red-400 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Jumlah Order</label>
                <input
                  type="number"
                  value={targetOrders}
                  onChange={(e) => setTargetOrders(e.target.value)}
                  className="input-field font-mono"
                />
              </div>

              <button type="submit" className="btn-primary w-full text-xs justify-center pt-2">
                Simpan Target Baru
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
