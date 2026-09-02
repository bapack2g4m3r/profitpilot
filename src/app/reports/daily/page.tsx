'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatIDR, formatNumber, formatDate, formatPercent } from '@/lib/utils';
import {
  BarChart3, Calendar, RefreshCw, Download, TrendingUp, TrendingDown,
  DollarSign, Coins, ShoppingCart, Target, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

interface DailySummary {
  summary_date: string;
  total_commission: number;
  ads_commission: number;
  organic_commission: number;
  total_ad_spend: number;
  net_profit: number;
  roas: number;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  cancelled_orders: number;
}

interface ReportData {
  dailyData: DailySummary[];
  totals: {
    total_commission: number;
    ads_commission: number;
    organic_commission: number;
    total_ad_spend: number;
    net_profit: number;
    avg_roas: number;
    total_orders: number;
    completed_orders: number;
    total_days: number;
  };
  averages: {
    avg_commission: number;
    avg_ad_spend: number;
    avg_net_profit: number;
    avg_orders: number;
  };
}

const periods = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7days', label: '7 Hari' },
  { value: 'thisMonth', label: 'Bulan Ini' },
  { value: '30days', label: '30 Hari' },
  { value: 'lastMonth', label: 'Bulan Lalu' },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-lg" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>{entry.name}:</span>
          <span className="font-semibold font-mono" style={{ color: entry.color }}>{formatIDR(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function DailyReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>('summary_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/daily?period=${period}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch daily report:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedData = data?.dailyData ? [...data.dailyData].sort((a, b) => {
    const aVal = a[sortField as keyof DailySummary] as number;
    const bVal = b[sortField as keyof DailySummary] as number;
    return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  }) : [];

  const exportCSV = () => {
    if (!sortedData.length) return;
    const headers = ['Tanggal', 'Total Komisi', 'Komisi Iklan', 'Komisi Organik', 'Biaya Iklan', 'Net Profit', 'ROAS', 'Total Orders', 'Selesai', 'Pending', 'Batal'];
    const rows = sortedData.map(d => [
      d.summary_date, d.total_commission, d.ads_commission, d.organic_commission,
      d.total_ad_spend, d.net_profit, d.roas, d.total_orders, d.completed_orders,
      d.pending_orders, d.cancelled_orders,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_harian_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = data?.dailyData ? [...data.dailyData].reverse().map(d => ({
    date: d.summary_date.split('-').slice(1).join('/'),
    profit: d.net_profit,
    commission: d.total_commission,
    spend: d.total_ad_spend,
  })) : [];

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={20} className="text-emerald-400" />
            <h1 className="text-2xl font-bold">Laporan Harian</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Detail performa harian Shopee Affiliate & Meta Ads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="select-field w-auto" style={{ minWidth: '140px' }}>
            {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button onClick={exportCSV} className="btn-secondary text-xs"><Download size={14} /> Export CSV</button>
          <button onClick={fetchData} className="btn-primary text-xs"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-96 rounded-xl" />
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={14} className="text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Rata-rata Profit/Hari</span>
              </div>
              <p className={`text-xl font-bold font-mono ${data.averages.avg_net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatIDR(data.averages.avg_net_profit)}
              </p>
            </div>
            <div className="card animate-fade-in stagger-1">
              <div className="flex items-center gap-2 mb-1">
                <Coins size={14} className="text-yellow-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Rata-rata Komisi/Hari</span>
              </div>
              <p className="text-xl font-bold font-mono text-yellow-400">{formatIDR(data.averages.avg_commission)}</p>
            </div>
            <div className="card animate-fade-in stagger-2">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-red-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Rata-rata Biaya Iklan/Hari</span>
              </div>
              <p className="text-xl font-bold font-mono text-red-400">{formatIDR(data.averages.avg_ad_spend)}</p>
            </div>
            <div className="card animate-fade-in stagger-3">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Rata-rata Order/Hari</span>
              </div>
              <p className="text-xl font-bold font-mono text-blue-400">{formatNumber(data.averages.avg_orders)}</p>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="card animate-fade-in stagger-4">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-primary)' }}>
              📈 Trend Net Profit Harian
            </h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" fill="url(#profitGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Table */}
          <div className="card animate-fade-in stagger-5 p-0 overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                📊 Detail Harian ({sortedData.length} hari)
              </h3>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {[
                      { field: 'summary_date', label: 'Tanggal' },
                      { field: 'total_commission', label: 'Komisi Total' },
                      { field: 'ads_commission', label: 'Komisi Iklan' },
                      { field: 'organic_commission', label: 'Komisi Organik' },
                      { field: 'total_ad_spend', label: 'Biaya Iklan' },
                      { field: 'net_profit', label: 'Net Profit' },
                      { field: 'roas', label: 'ROAS' },
                      { field: 'total_orders', label: 'Orders' },
                    ].map(col => (
                      <th key={col.field} onClick={() => handleSort(col.field)} className="cursor-pointer hover:text-white transition-colors select-none">
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortField === col.field && (
                            <span className="text-emerald-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((d, i) => (
                    <tr key={i}>
                      <td><span className="font-medium">{formatDate(d.summary_date)}</span></td>
                      <td><span className="font-mono text-yellow-400">{formatIDR(d.total_commission)}</span></td>
                      <td><span className="font-mono text-purple-400">{formatIDR(d.ads_commission)}</span></td>
                      <td><span className="font-mono text-blue-400">{formatIDR(d.organic_commission)}</span></td>
                      <td><span className="font-mono text-red-400">{formatIDR(d.total_ad_spend)}</span></td>
                      <td>
                        <span className={`font-mono font-semibold flex items-center gap-1 ${d.net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {d.net_profit >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {formatIDR(d.net_profit)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-[10px] ${d.roas >= 2 ? 'badge-success' : d.roas >= 1 ? 'badge-warning' : 'badge-danger'}`}>
                          {d.roas.toFixed(2)}x
                        </span>
                      </td>
                      <td><span className="font-mono">{d.total_orders}</span></td>
                    </tr>
                  ))}
                </tbody>
                {/* Totals Footer */}
                <tfoot>
                  <tr style={{ background: 'var(--color-bg-secondary)' }}>
                    <td><span className="font-bold text-emerald-400">TOTAL</span></td>
                    <td><span className="font-mono font-bold text-yellow-400">{formatIDR(data.totals.total_commission)}</span></td>
                    <td><span className="font-mono font-bold text-purple-400">{formatIDR(data.totals.ads_commission)}</span></td>
                    <td><span className="font-mono font-bold text-blue-400">{formatIDR(data.totals.organic_commission)}</span></td>
                    <td><span className="font-mono font-bold text-red-400">{formatIDR(data.totals.total_ad_spend)}</span></td>
                    <td><span className={`font-mono font-bold ${data.totals.net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatIDR(data.totals.net_profit)}</span></td>
                    <td><span className="badge badge-info text-[10px]">{data.totals.avg_roas.toFixed(2)}x avg</span></td>
                    <td><span className="font-mono font-bold">{formatNumber(data.totals.total_orders)}</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
