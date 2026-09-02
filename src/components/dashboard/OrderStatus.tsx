'use client';

import { Package, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface OrderStatusProps {
  completed: number;
  pending: number;
  cancelled: number;
  total: number;
}

export default function OrderStatus({ completed, pending, cancelled, total }: OrderStatusProps) {
  const completedPct = total > 0 ? (completed / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;
  const cancelledPct = total > 0 ? (cancelled / total) * 100 : 0;

  return (
    <div className="apple-card animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Package size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Status Pesanan Physical</h3>
            <p className="text-[11px] text-slate-400">Rincian status konfirmasi transaksi</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-300">
          Total: <strong className="text-white font-bold">{formatNumber(total)} Pesanan</strong>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 rounded-full overflow-hidden flex mb-4 bg-white/5 p-0.5">
        <div
          className="h-full rounded-l-full transition-all duration-700 ease-out bg-emerald-400"
          style={{ width: `${completedPct}%` }}
        />
        <div
          className="h-full transition-all duration-700 ease-out bg-amber-400"
          style={{ width: `${pendingPct}%` }}
        />
        <div
          className="h-full rounded-r-full transition-all duration-700 ease-out bg-rose-500"
          style={{ width: `${cancelledPct}%` }}
        />
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
            <CheckCircle2 size={14} />
            <span className="text-[11px] font-semibold">Selesai</span>
          </div>
          <p className="text-base font-bold font-mono text-white">{formatNumber(completed)}</p>
          <p className="text-[10px] text-slate-400">{completedPct.toFixed(1)}%</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
            <Clock size={14} />
            <span className="text-[11px] font-semibold">Pending</span>
          </div>
          <p className="text-base font-bold font-mono text-white">{formatNumber(pending)}</p>
          <p className="text-[10px] text-slate-400">{pendingPct.toFixed(1)}%</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-center gap-1.5 text-rose-400 mb-1">
            <XCircle size={14} />
            <span className="text-[11px] font-semibold">Batal</span>
          </div>
          <p className="text-base font-bold font-mono text-white">{formatNumber(cancelled)}</p>
          <p className="text-[10px] text-slate-400">{cancelledPct.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
