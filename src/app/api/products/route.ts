import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag') || 'all';

    let query = `
      SELECT p.*,
        COALESCE(SUM(o.commission_amount), 0) as calc_commission,
        COUNT(o.id) as order_count
      FROM products p
      LEFT JOIN shopee_orders o ON p.name = o.product_name AND o.status = 'selesai'
    `;
    if (tag !== 'all') {
      query += ` WHERE p.tag = ?`;
    }
    query += ` GROUP BY p.id ORDER BY calc_commission DESC`;

    const stmt = db.prepare(query);
    const products = tag !== 'all' ? stmt.all(tag) : stmt.all();

    // Get tags list
    const tagsList = db.prepare(`SELECT DISTINCT tag FROM products WHERE tag IS NOT NULL AND tag != ''`).all();

    return NextResponse.json({ products, tags: tagsList });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json();
    const { action, id, tag, name, shop_name, commission_rate, affiliate_link } = body;

    if (action === 'update_tag') {
      db.prepare('UPDATE products SET tag = ? WHERE id = ?').run(tag, id);
      // also update orders tag
      const prod = db.prepare('SELECT name FROM products WHERE id = ?').get() as { name: string };
      if (prod) {
        db.prepare('UPDATE shopee_orders SET tag = ? WHERE product_name = ?').run(tag, prod.name);
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'add') {
      db.prepare(`
        INSERT INTO products (product_id, name, shop_name, commission_rate, tag, affiliate_link)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `PROD_${Date.now()}`,
        name,
        shop_name || 'Shopee Store',
        commission_rate || 5,
        tag || 'Testing',
        affiliate_link || ''
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Products POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
