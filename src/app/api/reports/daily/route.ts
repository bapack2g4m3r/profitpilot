import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'thisMonth';
    const source = searchParams.get('source') || 'all'; // all, organic, ads
    const accountId = searchParams.get('account_id') || '1';

    const now = new Date();
    let startDate: string;
    let endDate: string = now.toISOString().split('T')[0];

    switch (period) {
      case 'today': startDate = endDate; break;
      case '7days': {
        const d = new Date(now); d.setDate(d.getDate() - 6);
        startDate = d.toISOString().split('T')[0]; break;
      }
      case '30days': {
        const d = new Date(now); d.setDate(d.getDate() - 29);
        startDate = d.toISOString().split('T')[0]; break;
      }
      case 'thisMonth':
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; break;
      case 'lastMonth': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]; break;
      }
      default:
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }

    // Daily summaries
    const dailyQuery = db.prepare(`
      SELECT 
        summary_date,
        total_commission,
        ads_commission,
        organic_commission,
        total_ad_spend,
        net_profit,
        roas,
        total_orders,
        completed_orders,
        pending_orders,
        cancelled_orders
      FROM daily_summary
      WHERE summary_date BETWEEN ? AND ?
      ORDER BY summary_date DESC
    `);
    const dailyData = dailyQuery.all(startDate, endDate);

    // Period totals
    const totalsQuery = db.prepare(`
      SELECT
        COALESCE(SUM(total_commission), 0) as total_commission,
        COALESCE(SUM(ads_commission), 0) as ads_commission,
        COALESCE(SUM(organic_commission), 0) as organic_commission,
        COALESCE(SUM(total_ad_spend), 0) as total_ad_spend,
        COALESCE(SUM(net_profit), 0) as net_profit,
        CASE WHEN SUM(total_ad_spend) > 0 THEN ROUND(SUM(total_commission) * 1.0 / SUM(total_ad_spend), 2) ELSE 0 END as avg_roas,
        COALESCE(SUM(total_orders), 0) as total_orders,
        COALESCE(SUM(completed_orders), 0) as completed_orders,
        COALESCE(SUM(pending_orders), 0) as pending_orders,
        COALESCE(SUM(cancelled_orders), 0) as cancelled_orders,
        COUNT(*) as total_days
      FROM daily_summary
      WHERE summary_date BETWEEN ? AND ?
    `);
    const totals = totalsQuery.get(startDate, endDate);

    // Daily average
    const days = (dailyData as Array<Record<string, unknown>>).length || 1;
    const totalData = totals as Record<string, number>;
    const averages = {
      avg_commission: Math.round(totalData.total_commission / days),
      avg_ad_spend: Math.round(totalData.total_ad_spend / days),
      avg_net_profit: Math.round(totalData.net_profit / days),
      avg_orders: Math.round(totalData.total_orders / days),
    };

    return NextResponse.json({
      dailyData,
      totals,
      averages,
      dateRange: { start: startDate, end: endDate },
      period,
    });
  } catch (error) {
    console.error('Daily report API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
