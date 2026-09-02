import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'thisMonth';
    const status = searchParams.get('status') || 'all';

    const now = new Date();
    let startDate: string;
    let endDate: string = now.toISOString().split('T')[0];

    switch (period) {
      case 'today': startDate = endDate; break;
      case '7days': { const d = new Date(now); d.setDate(d.getDate() - 6); startDate = d.toISOString().split('T')[0]; break; }
      case '30days': { const d = new Date(now); d.setDate(d.getDate() - 29); startDate = d.toISOString().split('T')[0]; break; }
      case 'thisMonth': startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; break;
      case 'lastMonth': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]; break;
      }
      default: startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }

    let statusFilter = '';
    if (status !== 'all') {
      statusFilter = `AND c.status = '${status}'`;
    }

    const campaignsQuery = db.prepare(`
      SELECT 
        c.id, c.campaign_id, c.campaign_name, c.ad_set_name, c.ad_name,
        c.objective, c.status, c.daily_budget,
        COALESCE(SUM(m.spend), 0) as total_spend,
        COALESCE(SUM(m.impressions), 0) as total_impressions,
        COALESCE(SUM(m.clicks), 0) as total_clicks,
        COALESCE(SUM(m.conversions), 0) as total_conversions,
        COALESCE(SUM(m.reach), 0) as total_reach,
        CASE WHEN SUM(m.impressions) > 0 THEN ROUND(SUM(m.clicks) * 100.0 / SUM(m.impressions), 2) ELSE 0 END as ctr,
        CASE WHEN SUM(m.clicks) > 0 THEN ROUND(SUM(m.spend) * 1.0 / SUM(m.clicks), 0) ELSE 0 END as cpc,
        CASE WHEN SUM(m.impressions) > 0 THEN ROUND(SUM(m.spend) * 1000.0 / SUM(m.impressions), 0) ELSE 0 END as cpm,
        CASE WHEN SUM(m.conversions) > 0 THEN ROUND(SUM(m.spend) * 1.0 / SUM(m.conversions), 0) ELSE 0 END as cost_per_conversion,
        COUNT(DISTINCT m.metric_date) as active_days
      FROM meta_campaigns c
      LEFT JOIN meta_ads_metrics m ON c.id = m.campaign_id AND m.metric_date BETWEEN ? AND ?
      WHERE 1=1 ${statusFilter}
      GROUP BY c.id
      ORDER BY total_spend DESC
    `);
    const campaigns = campaignsQuery.all(startDate, endDate);

    // Campaign totals
    const totalsQuery = db.prepare(`
      SELECT
        COALESCE(SUM(m.spend), 0) as total_spend,
        COALESCE(SUM(m.impressions), 0) as total_impressions,
        COALESCE(SUM(m.clicks), 0) as total_clicks,
        COALESCE(SUM(m.conversions), 0) as total_conversions,
        COALESCE(SUM(m.reach), 0) as total_reach
      FROM meta_ads_metrics m
      WHERE m.metric_date BETWEEN ? AND ?
    `);
    const totals = totalsQuery.get(startDate, endDate);

    return NextResponse.json({
      campaigns,
      totals,
      dateRange: { start: startDate, end: endDate },
      period,
    });
  } catch (error) {
    console.error('Campaign report API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
