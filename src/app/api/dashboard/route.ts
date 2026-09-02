import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { seedDemoData } from '@/lib/db/seed';

export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    seedDemoData(); // Seeds only if empty

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'thisMonth';
    const includeTax = searchParams.get('include_tax') !== 'false'; // default true
    const metaAccountId = searchParams.get('meta_account_id') || 'all';

    // Calculate date range
    const now = new Date();
    let startDate: string;
    let endDate: string = now.toISOString().split('T')[0];

    switch (period) {
      case 'today':
        startDate = endDate;
        break;
      case '7days': {
        const d = new Date(now);
        d.setDate(d.getDate() - 6);
        startDate = d.toISOString().split('T')[0];
        break;
      }
      case '30days': {
        const d = new Date(now);
        d.setDate(d.getDate() - 29);
        startDate = d.toISOString().split('T')[0];
        break;
      }
      case 'thisMonth':
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        break;
      case 'lastMonth': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = lastMonth.toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate = lastDay.toISOString().split('T')[0];
        break;
      }
      default:
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }

    // Spend field selection based on PPN 11% setting
    const spendCol = includeTax ? 'total_ad_spend_with_tax' : 'total_ad_spend';

    // KPI Summary
    const kpiQuery = db.prepare(`
      SELECT 
        COALESCE(SUM(total_commission), 0) as total_commission,
        COALESCE(SUM(ads_commission), 0) as ads_commission,
        COALESCE(SUM(organic_commission), 0) as organic_commission,
        COALESCE(SUM(${spendCol}), 0) as total_ad_spend,
        COALESCE(SUM(total_commission - ${spendCol}), 0) as net_profit,
        CASE WHEN SUM(${spendCol}) > 0 THEN ROUND(SUM(total_commission) * 1.0 / SUM(${spendCol}), 2) ELSE 0 END as roas,
        COALESCE(SUM(total_orders), 0) as total_orders,
        COALESCE(SUM(completed_orders), 0) as completed_orders,
        COALESCE(SUM(pending_orders), 0) as pending_orders,
        COALESCE(SUM(cancelled_orders), 0) as cancelled_orders
      FROM daily_summary
      WHERE summary_date BETWEEN ? AND ?
    `);
    const kpi = kpiQuery.get(startDate, endDate) as Record<string, number>;

    // Daily chart data
    const dailyQuery = db.prepare(`
      SELECT summary_date, total_commission, ${spendCol} as total_ad_spend, 
             (total_commission - ${spendCol}) as net_profit, roas, 
             ads_commission, organic_commission, total_orders
      FROM daily_summary
      WHERE summary_date BETWEEN ? AND ?
      ORDER BY summary_date ASC
    `);
    const dailyData = dailyQuery.all(startDate, endDate) as Array<Record<string, unknown>>;

    // Top products by commission
    const topProductsQuery = db.prepare(`
      SELECT product_name, shop_name, 
             SUM(commission_amount) as total_commission, 
             COUNT(*) as order_count,
             source
      FROM shopee_orders
      WHERE order_date BETWEEN ? AND ? AND status = 'selesai'
      GROUP BY product_name
      ORDER BY total_commission DESC
      LIMIT 5
    `);
    const topProducts = topProductsQuery.all(startDate, endDate);

    // Recent orders
    const recentOrdersQuery = db.prepare(`
      SELECT order_id, product_name, shop_name, commission_amount, status, source, order_date
      FROM shopee_orders
      WHERE order_date BETWEEN ? AND ?
      ORDER BY order_date DESC, id DESC
      LIMIT 10
    `);
    const recentOrders = recentOrdersQuery.all(startDate, endDate);

    return NextResponse.json({
      kpi,
      dailyData,
      topProducts,
      recentOrders,
      period,
      includeTax,
      metaAccountId,
      dateRange: { start: startDate, end: endDate },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
