import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json();
    const { orders } = body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: 'Data pesanan kosong atau tidak valid' }, { status: 400 });
    }

    const insertOrder = db.prepare(`
      INSERT OR REPLACE INTO shopee_orders (
        order_id, product_name, product_id, shop_name, item_price, quantity,
        commission_rate, commission_amount, status, source, tag, order_date
      ) VALUES (
        @order_id, @product_name, @product_id, @shop_name, @item_price, @quantity,
        @commission_rate, @commission_amount, @status, @source, @tag, @order_date
      )
    `);

    let importedCount = 0;

    const transaction = db.transaction(() => {
      for (const order of orders) {
        insertOrder.run({
          order_id: order.order_id || `SHP_IMP_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          product_name: order.product_name || 'Produk Shopee',
          product_id: order.product_id || '',
          shop_name: order.shop_name || 'Toko Shopee',
          item_price: Number(order.item_price) || 0,
          quantity: Number(order.quantity) || 1,
          commission_rate: Number(order.commission_rate) || 0,
          commission_amount: Number(order.commission_amount) || 0,
          status: order.status || 'selesai',
          source: order.source || 'organic',
          tag: order.tag || 'Imported',
          order_date: order.order_date || new Date().toISOString().split('T')[0],
        });
        importedCount++;
      }

      // Recalculate daily summary for affected dates
      const dates = Array.from(new Set(orders.map((o: any) => o.order_date).filter(Boolean)));
      for (const dateStr of dates) {
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

        if (stats) {
          const existingSummary = db.prepare('SELECT total_ad_spend FROM daily_summary WHERE summary_date = ?').get(dateStr) as any;
          const adSpend = existingSummary ? existingSummary.total_ad_spend : 0;
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
              completed_orders = excluded.completed_orders,
              pending_orders = excluded.pending_orders,
              cancelled_orders = excluded.cancelled_orders
          `).run(
            dateStr, stats.total_commission, stats.ads_commission, stats.organic_commission,
            adSpend, netProfit, roas, stats.total_orders, stats.completed_orders, stats.pending_orders, stats.cancelled_orders
          );
        }
      }
    });

    transaction();

    return NextResponse.json({ success: true, count: importedCount });
  } catch (error) {
    console.error('CSV import API error:', error);
    return NextResponse.json({ error: 'Gagal mengimpor CSV' }, { status: 500 });
  }
}
