// Currency & number formatting utilities for IDR
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatPercent(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`;
}

export function formatROAS(roas: number): string {
  return `${roas.toFixed(2)}x`;
}

export function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatShortIDR(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toFixed(0)}rb`;
  return `${sign}Rp ${abs}`;
}

// Date utilities
export function getDateRange(period: string): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: string;

  switch (period) {
    case 'today':
      start = end;
      break;
    case '7days':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 6);
      start = weekAgo.toISOString().split('T')[0];
      break;
    case '30days':
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 29);
      start = monthAgo.toISOString().split('T')[0];
      break;
    case 'thisMonth':
      start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      break;
    case 'lastMonth': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = lastMonth.toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start, end: lastDay.toISOString().split('T')[0] };
    }
    default:
      start = end;
  }

  return { start, end };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

// Color utilities
export function getProfitColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
}

export function getROASColor(roas: number): string {
  if (roas >= 3) return 'text-emerald-400';
  if (roas >= 2) return 'text-yellow-400';
  if (roas >= 1) return 'text-orange-400';
  return 'text-red-400';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'selesai': return 'text-emerald-400 bg-emerald-400/10';
    case 'pending': return 'text-yellow-400 bg-yellow-400/10';
    case 'batal': return 'text-red-400 bg-red-400/10';
    case 'active': return 'text-emerald-400 bg-emerald-400/10';
    case 'paused': return 'text-yellow-400 bg-yellow-400/10';
    case 'archived': return 'text-gray-400 bg-gray-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
}

// clsx utility
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
