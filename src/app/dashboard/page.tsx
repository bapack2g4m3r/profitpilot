'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import KPIGrid from '@/components/dashboard/KPIGrid';
import DailyChart from '@/components/dashboard/DailyChart';
import TopPerformers from '@/components/dashboard/TopPerformers';
import OrderStatus from '@/components/dashboard/OrderStatus';
import RecentOrders from '@/components/dashboard/RecentOrders';
import { Calendar, RefreshCw } from 'lucide-react';

interface DashboardData {
  kpi: {
    net_profit: number;
    total_commission: number;
    ads_commission: number;
    organic_commission: number;
    total_ad_spend: number;
    roas: number;
    total_orders: number;
    completed_orders: number;
    pending_orders: number;
    cancelled_orders: number;
  };
  dailyData: Array<{
    summary_date: string;
    total_commission: number;
    total_ad_spend: number;
    net_profit: number;
  }>;
  topProducts: Array<{
    product_name: string;
    shop_name: string;
    total_commission: number;
    order_count: number;
    source: string;
  }>;
  recentOrders: Array<{
    order_id: string;
    product_name: string;
    shop_name: string;
    commission_amount: number;
    status: string;
    source: string;
    order_date: string;
  }>;
}

const periods = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7days', label: '7 Hari' },
  { value: 'thisMonth', label: 'Bulan Ini' },
  { value: '30days', label: '30 Hari' },
  { value: 'lastMonth', label: 'Bulan Lalu' },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState('thisMonth');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [includeTax11, setIncludeTax11] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(
        `/api/dashboard?period=${period}&include_tax=${includeTax11}&meta_account_id=${selectedAccount}`
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, includeTax11, selectedAccount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <Header
        onRefresh={() => fetchData(true)}
        selectedAccount={selectedAccount}
        onAccountChange={(acc) => setSelectedAccount(acc)}
        includeTax11={includeTax11}
        onTaxChange={(tax) => setIncludeTax11(tax)}
      />

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 mr-1">
            Periode Waktu:
          </span>
          {/* Segmented Control */}
          <div className="segmented-control">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`segmented-btn ${period === p.value ? 'active' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="apple-btn-secondary text-xs ml-auto sm:ml-0"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 skeleton h-[360px] rounded-2xl" />
            <div className="skeleton h-[360px] rounded-2xl" />
          </div>
          <div className="skeleton h-44 rounded-2xl" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <KPIGrid kpi={data.kpi} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DailyChart data={data.dailyData} />
            </div>
            <div>
              <TopPerformers products={data.topProducts} />
            </div>
          </div>

          {/* Order Status */}
          <OrderStatus
            completed={data.kpi?.completed_orders ?? 0}
            pending={data.kpi?.pending_orders ?? 0}
            cancelled={data.kpi?.cancelled_orders ?? 0}
            total={data.kpi?.total_orders ?? 0}
          />

          {/* Recent Orders */}
          <RecentOrders orders={data.recentOrders} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-slate-400">
            Gagal memuat data. Silakan coba refresh.
          </p>
        </div>
      )}
    </div>
  );
}
