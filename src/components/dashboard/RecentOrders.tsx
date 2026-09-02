'use client';

import { formatIDR, formatDate } from '@/lib/utils';
import { History, ShoppingBag } from 'lucide-react';

interface RecentOrdersProps {
  orders: Array<{
    order_id: string;
    product_name: string;
    shop_name: string;
    commission_amount: number;
    status: string;
    source: string;
    order_date: string;
  }>;
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="apple-card animate-fade-in" style={{ animationDelay: '0.35s', opacity: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <History size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Transaksi Terbaru</h3>
            <p className="text-[11px] text-slate-400">10 transaksi komisi terakhir</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Produk</th>
              <th>Toko</th>
              <th>Komisi</th>
              <th>Traffic</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr key={i}>
                <td>
                  <span className="font-mono text-xs text-slate-400">
                    {order.order_id}
                  </span>
                </td>
                <td>
                  <span className="text-xs font-semibold text-white">
                    {order.product_name.length > 32 ? order.product_name.slice(0, 32) + '...' : order.product_name}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-slate-400">
                    {order.shop_name}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {formatIDR(order.commission_amount)}
                  </span>
                </td>
                <td>
                  <span className={`apple-badge text-[9px] ${order.source === 'ads' ? 'apple-badge-purple' : 'apple-badge-blue'}`}>
                    {order.source === 'ads' ? '📢 Meta Ads' : '🌿 Organik'}
                  </span>
                </td>
                <td>
                  <span className={`apple-badge text-[9px] ${
                    order.status === 'selesai' ? 'apple-badge-green' :
                    order.status === 'pending' ? 'apple-badge-amber' : 'apple-badge-red'
                  }`}>
                    {order.status === 'selesai' ? 'Selesai' : order.status === 'pending' ? 'Pending' : 'Batal'}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatDate(order.order_date)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
