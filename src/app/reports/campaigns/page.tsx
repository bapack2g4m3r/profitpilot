'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatIDR, formatNumber, formatPercent } from '@/lib/utils';
import {
  Megaphone, RefreshCw, Download, Play, Pause, Target, Eye, MousePointer, ShoppingCart, DollarSign
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
    // Optimistic status update simulation
    if (!data) return;
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setData({
      ...data,
      campaigns: data.campaigns.map(c => c.id === id ? { ...c, status: newStatus as any } : c)
    });
  };

  const exportCSV = () => {
    if (!data?.campaigns.length) return;
    const headers = ['Campaign ID', 'Nama Kampanye', 'Objective', 'Status', 'Daily Budget', 'Total Spend', 'Impressions', 'Clicks', 'CTR (%)', 'CPC', 'CPM', 'Conversions', 'Cost/Conversion'];
    const rows = data.campaigns.map(c => [
      c.campaign_id, `"${c.campaign_name}"`, c.objective, c.status, c.daily_budget,
      c.total_spend, c.total_impressions, c.total_clicks, c.ctr, c.cpc, c.cpm,
      c.total_conversions, c.cost_per_conversion
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_kampanye_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalCTR = data?.totals?.total_impressions ? (data.totals.total_clicks / data.totals.total_impressions) * 100 : 0;
  const totalCPC = data?.totals?.total_clicks ? data.totals.total_spend / data.totals.total_clicks : 0;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone size={20} className="text-purple-400" />
            <h1 className="text-2xl font-bold">Laporan Kampanye Meta Ads</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Pantau performa iklan Meta Graph API, budget, CTR, CPC, dan konversi.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-auto" style={{ minWidth: '120px' }}>
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="select-field w-auto" style={{ minWidth: '130px' }}>
            {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button onClick={exportCSV} className="btn-secondary text-xs"><Download size={14} /> Export CSV</button>
          <button onClick={fetchData} className="btn-primary text-xs"><RefreshCw size={14} /> Refresh</button>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-red-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Total Ad Spend</span>
              </div>
              <p className="text-xl font-bold font-mono text-red-400">{formatIDR(data.totals.total_spend)}</p>
            </div>
            <div className="card animate-fade-in stagger-1">
              <div className="flex items-center gap-2 mb-1">
                <Eye size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Impressions & Reach</span>
              </div>
              <p className="text-xl font-bold font-mono text-blue-400">{formatNumber(data.totals.total_impressions)}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Reach: {formatNumber(data.totals.total_reach)}</p>
            </div>
            <div className="card animate-fade-in stagger-2">
              <div className="flex items-center gap-2 mb-1">
                <MousePointer size={14} className="text-yellow-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Clicks & Rata-Rata CTR</span>
              </div>
              <p className="text-xl font-bold font-mono text-yellow-400">{formatNumber(data.totals.total_clicks)} Clicks</p>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">CTR: {totalCTR.toFixed(2)}% | CPC: {formatIDR(totalCPC)}</p>
            </div>
            <div className="card animate-fade-in stagger-3">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart size={14} className="text-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Total Conversions</span>
              </div>
              <p className="text-xl font-bold font-mono text-purple-400">{formatNumber(data.totals.total_conversions)} Result</p>
            </div>
          </div>

          {/* Campaign Table */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                📢 Daftar Kampanye Meta ({data.campaigns.length})
              </h3>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Nama Kampanye</th>
                    <th>Objective</th>
                    <th>Daily Budget</th>
                    <th>Total Spend</th>
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
                  {data.campaigns.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className={`badge text-[10px] ${c.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                          {c.status === 'active' ? '● Active' : '⏸ Paused'}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="font-semibold text-sm text-white">{c.campaign_name}</p>
                          <p className="text-[11px] text-slate-400">ID: {c.campaign_id}</p>
                        </div>
                      </td>
                      <td><span className="badge badge-info text-[10px]">{c.objective}</span></td>
                      <td><span className="font-mono text-sm">{formatIDR(c.daily_budget)}</span></td>
                      <td><span className="font-mono font-semibold text-red-400">{formatIDR(c.total_spend)}</span></td>
                      <td><span className="font-mono">{formatNumber(c.total_impressions)}</span></td>
                      <td><span className="font-mono">{formatNumber(c.total_clicks)}</span></td>
                      <td><span className="font-mono text-emerald-400">{c.ctr.toFixed(2)}%</span></td>
                      <td><span className="font-mono">{formatIDR(c.cpc)}</span></td>
                      <td><span className="font-mono">{formatIDR(c.cpm)}</span></td>
                      <td><span className="font-mono text-purple-400 font-bold">{c.total_conversions}</span></td>
                      <td><span className="font-mono">{formatIDR(c.cost_per_conversion)}</span></td>
                      <td>
                        <button
                          onClick={() => toggleCampaignStatus(c.id, c.status)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                            c.status === 'active' ? 'btn-danger' : 'btn-primary'
                          }`}
                        >
                          {c.status === 'active' ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Start</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
