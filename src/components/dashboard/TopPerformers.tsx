'use client';

import { Trophy, Star } from 'lucide-react';
import { formatIDR, formatNumber } from '@/lib/utils';

interface TopPerformersProps {
  products: Array<{
    product_name: string;
    shop_name: string;
    total_commission: number;
    order_count: number;
    source: string;
  }>;
}

export default function TopPerformers({ products }: TopPerformersProps) {
  const maxCommission = products.length > 0 ? products[0].total_commission : 1;

  return (
    <div className="apple-card animate-fade-in flex flex-col justify-between" style={{ animationDelay: '0.25s', opacity: 0 }}>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Trophy size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Produk Terbaik</h3>
            <p className="text-[11px] text-slate-400">Top 5 perolehan komisi terbesar</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex items-center justify-center h-44 text-slate-500 text-xs">
            Belum ada data komisi pada periode ini.
          </div>
        ) : (
          <div className="space-y-3.5">
            {products.map((product, index) => {
              const percentage = (product.total_commission / maxCommission) * 100;
              const badgeBg = index === 0 ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' :
                              index === 1 ? 'bg-slate-300/20 text-slate-200 border-slate-300/30' :
                              index === 2 ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                              'bg-white/5 text-slate-400 border-white/10';

              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center border ${badgeBg} shrink-0`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {product.product_name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {product.shop_name} • {formatNumber(product.order_count)} orders
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-400 shrink-0">
                      {formatIDR(product.total_commission)}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
