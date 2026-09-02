import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const db = getDB();
    const targets = db.prepare('SELECT * FROM kpi_targets ORDER BY id DESC LIMIT 1').get() as any;

    // Get current month performance
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = now.toISOString().split('T')[0];

    const currentStats = db.prepare(`
      SELECT
        COALESCE(SUM(total_commission), 0) as current_commission,
        COALESCE(SUM(total_ad_spend), 0) as current_spend,
        COALESCE(SUM(net_profit), 0) as current_profit,
        COALESCE(SUM(total_orders), 0) as current_orders
      FROM daily_summary WHERE summary_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    return NextResponse.json({
      target: targets || { target_commission: 10000000, target_roas: 2.5, max_ad_spend: 4000000, target_orders: 500 },
      current: currentStats,
    });
  } catch (error) {
    console.error('KPI API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json();
    const { target_commission, target_roas, max_ad_spend, target_orders } = body;

    db.prepare(`
      INSERT INTO kpi_targets (period, target_date, target_commission, target_roas, max_ad_spend, target_orders)
      VALUES ('monthly', date('now'), ?, ?, ?, ?)
    `).run(target_commission, target_roas, max_ad_spend, target_orders);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KPI POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
