'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatIDR, formatNumber } from '@/lib/utils';
import {
  Megaphone, RefreshCw, Download, Play, Pause, Target, Eye, MousePointer, ShoppingCart, AlertTriangle, ShieldCheck, Zap, Activity
} from 'lucide-react';

interface Campaign {
  id: number;
  campaign_id: string;
  campaign_name: string;
  ad_set_name: string;
  ad_name: string;
  objective: string;
  status: 'active' | 'paused' | 'archived';
  daily_budget: number;
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_reach: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cost_per_conversion: number;
  active_days: number;
  health_status?: string;
}

interface CampaignReportData {
  campaigns: Campaign[];
  totals: {
    total_spend: number;
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    total_reach: number;
  };
}

const periods = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7days', label: '7 Hari' },
  { value: 'thisMonth', label: 'Bulan Ini' },
  { value: '30days', label: '30 Hari' },
  { value: 'lastMonth', label: 'Bulan Lalu' },
];

export default function CampaignReportPage() {
  const [data, setData] = useState<CampaignReportData | null>(null);
  const [period, setPeriod] = useState('thisMonth');
  const [statusFilter, setStatusFilter] = useState('all');
  const [includeTax, setIncludeTax] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/campaigns?period=${period}&status=${statusFilter}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch campaign report:', err);
    } finally {
      setLoading(false);
    }
  }, [period, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCampaignStatus = async (id: number, currentStatus: string) => {
    if (!data) return;
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setData({
      ...data,
      campaigns: data.campaigns.map(c => c.id === id ? { ...c, status: newStatus as any } : c)
    });
  };

  const getHealthBadge = (ctr: number, cpm: number, spend: number) => {
    if (cpm > 35000) {
      return <span className="apple-badge apple-badge-red text-[10px]"><AlertTriangle size={10} /> CPM Tinggi</span>;
    }
    if (ctr < 1.2) {
      return <span className="apple-badge apple-badge-amber text-[10px]"><Activity size={10} /> Low CTR</span>;
    }
    if (spend > 300000 && ctr >= 2.0) {
      return <span className="apple-badge apple-badge-green text-[10px]"><Zap size={10} /> Scale Ready</span>;
    }
    return <span className="apple-badge apple-badge-blue text-[10px]"><ShieldCheck size={10} /> Sehat</span>;
  };

  const totalSpendRaw = data?.totals?.total_spend || 0;
  const totalSpendCalc = includeTax ? Math.round(totalSpendRaw * 1.11) : totalSpendRaw;
  const totalCTR = data?.totals?.total_impressions ? (data.totals.total_clicks / data.totals.total_impressions) * 100 : 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Megaphone size={20} className="text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Analisis Iklan &amp; Kampanye Meta</h1>
            <span className="apple-badge apple-badge-purple text-[10px]">DIAGNOSA KESEHATAN IKLAN</span>
          </div>
          <p className="text-sm text-slate-400">
            Performa iklan Meta Graph API, diagnosa CPM/CTR, konversi, dan perhitungan PPN 11% Indonesia.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIncludeTax(!includeTax)}
            className={`apple-badge cursor-pointer text-xs ${includeTax ? 'apple-badge-green' : 'apple-badge-amber'}`}
          >
            PPN 11% Meta: {includeTax ? 'Dihitung (+11%)' : 'Tanpa Tax'}
          </button>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-auto" style={{ minWidth: '120px' }}>
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="select-field w-auto" style={{ minWidth: '130px' }}>
            {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button onClick={fetchData} className="apple-btn-primary text-xs"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
          <div className="skeleton h-96 rounded-xl" />
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="apple-card">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-rose-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Ad Spend {includeTax ? '(inc. PPN 11%)' : ''}</span>
              </div>
              <p className="text-xl font-bold font-mono text-rose-400">{formatIDR(totalSpendCalc)}</p>
              {includeTax && <p className="text-[10px] text-slate-500 font-mono mt-0.5">Ad Spend Net: {formatIDR(totalSpendRaw)}</p>}
            </div>
            <div className="apple-card">
              <div className="flex items-center gap-2 mb-1">
                <Eye size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Impressions &amp; Reach</span>
              </div>
              <p className="text-xl font-bold font-mono text-blue-400">{formatNumber(data.totals.total_impressions)}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Reach: {formatNumber(data.totals.total_reach)}</p>
            </div>
            <div className="apple-card">
              <div className="flex items-center gap-2 mb-1">
                <MousePointer size={14} className="text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clicks &amp; Rata-Rata CTR</span>
              </div>
              <p className="text-xl font-bold font-mono text-amber-400">{formatNumber(data.totals.total_clicks)} Clicks</p>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">CTR: {totalCTR.toFixed(2)}%</p>
            </div>
            <div className="apple-card">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart size={14} className="text-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Conversions</span>
              </div>
              <p className="text-xl font-bold font-mono text-purple-400">{formatNumber(data.totals.total_conversions)} Result</p>
            </div>
          </div>

          {/* Campaign Table */}
          <div className="apple-card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight text-white">
                📢 Performa Kampanye Meta Ads ({data.campaigns.length})
              </h3>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Nama Kampanye</th>
                    <th>Diagnosa</th>
                    <th>Daily Budget</th>
                    <th>Total Spend {includeTax ? '(+11%)' : ''}</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                    <th>CPC</th>
                    <th>CPM</th>
                    <th>Conversions</th>
                    <th>Cost/Conv</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((c) => {
                    const spendCalc = includeTax ? Math.round(c.total_spend * 1.11) : c.total_spend;
                    return (
                      <tr key={c.id}>
                        <td>
                          <span className={`apple-badge text-[10px] ${c.status === 'active' ? 'apple-badge-green' : 'apple-badge-amber'}`}>
                            {c.status === 'active' ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <p className="font-semibold text-xs text-white">{c.campaign_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {c.campaign_id}</p>
                          </div>
                        </td>
                        <td>{getHealthBadge(c.ctr, c.cpm, c.total_spend)}</td>
                        <td><span className="font-mono text-xs">{formatIDR(c.daily_budget)}</span></td>
                        <td><span className="font-mono font-semibold text-rose-400 text-xs">{formatIDR(spendCalc)}</span></td>
                        <td><span className="font-mono text-xs">{formatNumber(c.total_impressions)}</span></td>
                        <td><span className="font-mono text-xs">{formatNumber(c.total_clicks)}</span></td>
                        <td><span className="font-mono text-xs text-emerald-400 font-bold">{c.ctr.toFixed(2)}%</span></td>
                        <td><span className="font-mono text-xs">{formatIDR(c.cpc)}</span></td>
                        <td><span className="font-mono text-xs">{formatIDR(c.cpm)}</span></td>
                        <td><span className="font-mono text-purple-400 font-bold text-xs">{c.total_conversions}</span></td>
                        <td><span className="font-mono text-xs">{formatIDR(c.cost_per_conversion)}</span></td>
                        <td>
                          <button
                            onClick={() => toggleCampaignStatus(c.id, c.status)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                              c.status === 'active' ? 'apple-btn-secondary' : 'apple-btn-primary'
                            }`}
                          >
                            {c.status === 'active' ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Start</>}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
