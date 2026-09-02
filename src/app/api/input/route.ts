import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json();
    const { type, order_id, product_name, shop_name, item_price, commission_amount, status, source, order_date, spend, date } = body;

    if (type === 'ad_spend') {
      // Input Ad Spend manual
      const summary_date = date || new Date().toISOString().split('T')[0];
      const spendVal = Number(spend) || 0;

      const existing = db.prepare('SELECT * FROM daily_summary WHERE summary_date = ?').get(summary_date) as any;
      if (existing) {
        const netProfit = existing.total_commission - spendVal;
        const roas = spendVal > 0 ? existing.total_commission / spendVal : 0;
        db.prepare('UPDATE daily_summary SET total_ad_spend = ?, net_profit = ?, roas = ? WHERE summary_date = ?').run(
          spendVal, netProfit, roas, summary_date
        );
      } else {
        db.prepare(`
          INSERT INTO daily_summary (summary_date, total_ad_spend, net_profit, roas)
          VALUES (?, ?, ?, 0)
        `).run(summary_date, spendVal, -spendVal);
      }
      return NextResponse.json({ success: true, message: 'Ad spend berhasil disimpan' });
    }

    if (type === 'order') {
      const dateStr = order_date || new Date().toISOString().split('T')[0];
      const commVal = Number(commission_amount) || 0;

      db.prepare(`
        INSERT INTO shopee_orders (order_id, product_name, shop_name, item_price, commission_amount, status, source, order_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        order_id || `MAN_${Date.now()}`,
        product_name || 'Order Manual',
        shop_name || 'Shopee Store',
        Number(item_price) || 0,
        commVal,
        status || 'selesai',
        source || 'ads',
        dateStr
      );

      // Recalculate summary
      const stats = db.prepare(`
        SELECT
          COALESCE(SUM(commission_amount), 0) as total_commission,
          COALESCE(SUM(CASE WHEN source = 'ads' THEN commission_amount ELSE 0 END), 0) as ads_commission,
          COALESCE(SUM(CASE WHEN source = 'organic' THEN commission_amount ELSE 0 END), 0) as organic_commission,
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'selesai' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'batal' THEN 1 END) as cancelled_orders
        FROM shopee_orders WHERE order_date = ?
      `).get(dateStr) as any;

      const summary = db.prepare('SELECT total_ad_spend FROM daily_summary WHERE summary_date = ?').get(dateStr) as any;
      const adSpend = summary ? summary.total_ad_spend : 0;
      const netProfit = stats.total_commission - adSpend;
      const roas = adSpend > 0 ? stats.total_commission / adSpend : 0;

      db.prepare(`
        INSERT INTO daily_summary (
          summary_date, total_commission, ads_commission, organic_commission,
          total_ad_spend, net_profit, roas, total_orders, completed_orders, pending_orders, cancelled_orders
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(summary_date) DO UPDATE SET
          total_commission = excluded.total_commission,
          ads_commission = excluded.ads_commission,
          organic_commission = excluded.organic_commission,
          net_profit = excluded.total_commission - daily_summary.total_ad_spend,
          roas = CASE WHEN daily_summary.total_ad_spend > 0 THEN excluded.total_commission / daily_summary.total_ad_spend ELSE 0 END,
          total_orders = excluded.total_orders,
          completed_orders = excluded.completed_orders
      `).run(
        dateStr, stats.total_commission, stats.ads_commission, stats.organic_commission,
        adSpend, netProfit, roas, stats.total_orders, stats.completed_orders, stats.pending_orders, stats.cancelled_orders
      );

      return NextResponse.json({ success: true, message: 'Order manual berhasil disimpan' });
    }

    return NextResponse.json({ error: 'Tipe input tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Manual input API error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan input' }, { status: 500 });
  }
}
