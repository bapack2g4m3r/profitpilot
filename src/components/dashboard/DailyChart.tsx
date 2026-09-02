'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatShortIDR, formatDateShort } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface DailyChartProps {
  data: Array<{
    summary_date: string;
    total_commission: number;
    total_ad_spend: number;
    net_profit: number;
  }>;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;

  return (
    <div className="apple-glass rounded-2xl px-4 py-3 shadow-2xl space-y-1">
      <p className="text-xs font-semibold text-slate-400 mb-1.5">{label ? formatDateShort(label) : ''}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2.5 text-xs">
          <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: entry.color }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-bold font-mono ml-auto" style={{ color: entry.color }}>
            {formatShortIDR(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DailyChart({ data = [] }: DailyChartProps) {
  const chartData = (data || []).map((d) => ({
    ...d,
    date: formatDateShort(d.summary_date),
  }));

  return (
    <div className="apple-card animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Perbandingan Biaya Iklan vs Komisi</h3>
            <p className="text-[11px] text-slate-400">Analisis tren harian kotor &amp; net profit</p>
          </div>
        </div>

        {/* Legend Pills */}
        <div className="hidden sm:flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Komisi</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>Biaya Ads</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Net Profit</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6e6e82', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6e6e82', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatShortIDR(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="total_commission"
              name="Total Komisi"
              fill="#64d2ff"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="total_ad_spend"
              name="Biaya Iklan"
              fill="#ff453a"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Line
              dataKey="net_profit"
              name="Net Profit"
              stroke="#30d158"
              strokeWidth={3}
              dot={{ r: 3, fill: '#30d158', strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: '#30d158', strokeWidth: 2, fill: '#0b0d14' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
