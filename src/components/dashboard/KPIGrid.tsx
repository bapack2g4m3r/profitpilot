'use client';

import { useEffect, useRef } from 'react';
import { formatIDR } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  ShoppingCart,
  BarChart3,
  Target,
  Percent,
} from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number;
  type: 'currency' | 'number' | 'roas' | 'percent';
  icon: React.ReactNode;
  accentColor: string;
  gradient: string;
  delay?: number;
}

function AnimatedValue({ value, type }: { value: number; type: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const duration = 800;
    const start = performance.now();
    const startVal = 0;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + ((value || 0) - startVal) * eased;

      if (el) {
        if (type === 'currency') {
          el.textContent = formatIDR(Math.round(current));
        } else if (type === 'roas') {
          el.textContent = `${current.toFixed(2)}x`;
        } else if (type === 'percent') {
          el.textContent = `${current.toFixed(1)}%`;
        } else {
          el.textContent = Math.round(current).toLocaleString('id-ID');
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value, type]);

  return <span ref={ref} className="font-mono" />;
}

function KPICard({ label, value, type, icon, accentColor, gradient, delay = 0 }: KPICardProps) {
  const isPositive = (value || 0) >= 0;

  return (
    <div
      className="apple-card animate-fade-in flex flex-col justify-between relative overflow-hidden"
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
      }}
    >
      {/* Top Background Ambient Glow */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: accentColor }}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-inner"
          style={{ background: gradient, color: accentColor }}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          <AnimatedValue value={value || 0} type={type} />
        </p>
        {type === 'currency' && (
          <span className="mb-1">
            {isPositive ? (
              <TrendingUp size={14} className="text-emerald-400" />
            ) : (
              <TrendingDown size={14} className="text-rose-400" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}

interface KPIGridProps {
  kpi?: {
    net_profit?: number;
    total_commission?: number;
    ads_commission?: number;
    organic_commission?: number;
    total_ad_spend?: number;
    roas?: number;
  };
}

export default function KPIGrid({ kpi }: KPIGridProps) {
  const safeKpi = {
    net_profit: kpi?.net_profit ?? 0,
    total_commission: kpi?.total_commission ?? 0,
    ads_commission: kpi?.ads_commission ?? 0,
    organic_commission: kpi?.organic_commission ?? 0,
    total_ad_spend: kpi?.total_ad_spend ?? 0,
    roas: kpi?.roas ?? 0,
  };

  const cards: KPICardProps[] = [
    {
      label: 'Net Profit Real',
      value: safeKpi.net_profit,
      type: 'currency',
      icon: <DollarSign size={16} />,
      accentColor: '#30d158',
      gradient: 'rgba(48, 209, 88, 0.15)',
    },
    {
      label: 'Total Komisi',
      value: safeKpi.total_commission,
      type: 'currency',
      icon: <Coins size={16} />,
      accentColor: '#ff9f0a',
      gradient: 'rgba(255, 159, 10, 0.15)',
    },
    {
      label: 'Komisi Meta Ads',
      value: safeKpi.ads_commission,
      type: 'currency',
      icon: <ShoppingCart size={16} />,
      accentColor: '#bf5af2',
      gradient: 'rgba(191, 90, 242, 0.15)',
    },
    {
      label: 'Komisi Organik',
      value: safeKpi.organic_commission,
      type: 'currency',
      icon: <BarChart3 size={16} />,
      accentColor: '#64d2ff',
      gradient: 'rgba(100, 210, 255, 0.15)',
    },
    {
      label: 'Biaya Iklan Meta',
      value: safeKpi.total_ad_spend,
      type: 'currency',
      icon: <Target size={16} />,
      accentColor: '#ff453a',
      gradient: 'rgba(255, 69, 58, 0.15)',
    },
    {
      label: 'ROAS Performa',
      value: safeKpi.roas,
      type: 'roas',
      icon: <Percent size={16} />,
      accentColor: safeKpi.roas >= 2 ? '#30d158' : safeKpi.roas >= 1 ? '#ff9f0a' : '#ff453a',
      gradient: safeKpi.roas >= 2 ? 'rgba(48,209,88,0.15)' : safeKpi.roas >= 1 ? 'rgba(255,159,10,0.15)' : 'rgba(255,69,58,0.15)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, i) => (
        <KPICard key={card.label} {...card} delay={i * 50} />
      ))}
    </div>
  );
}
