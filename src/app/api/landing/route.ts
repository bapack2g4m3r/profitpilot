import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { seedDemoData } from '@/lib/db/seed';

export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    seedDemoData();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all'; // all, CUSTOM, BLINK
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (slug) {
      const page = db.prepare('SELECT * FROM landing_pages WHERE slug = ?').get(slug);
      if (!page) return NextResponse.json({ error: 'Landing page tidak ditemukan' }, { status: 404 });
      return NextResponse.json({ page });
    }

    if (id) {
      const page = db.prepare('SELECT * FROM landing_pages WHERE id = ?').get(id);
      if (!page) return NextResponse.json({ error: 'Landing page tidak ditemukan' }, { status: 404 });
      return NextResponse.json({ page });
    }

    let query = 'SELECT * FROM landing_pages';
    if (type !== 'all') {
      query += ` WHERE landing_type = ?`;
    }
    query += ' ORDER BY id DESC';

    const stmt = db.prepare(query);
    const pages = type !== 'all' ? stmt.all(type) : stmt.all();

    // Summary totals
    const totals = db.prepare(`
      SELECT
        COUNT(*) as total_pages,
        SUM(CASE WHEN landing_type = 'CUSTOM' THEN 1 ELSE 0 END) as custom_pages,
        SUM(CASE WHEN landing_type = 'BLINK' THEN 1 ELSE 0 END) as blink_pages,
        COALESCE(SUM(visitors), 0) as total_visitors,
        COALESCE(SUM(cta_clicks), 0) as total_cta_clicks,
        COALESCE(SUM(redirects), 0) as total_redirects,
        COALESCE(SUM(outbound_clicks), 0) as total_outbound_clicks,
        COALESCE(SUM(orders), 0) as total_orders,
        COALESCE(SUM(commission), 0) as total_commission,
        COALESCE(SUM(ad_spend), 0) as total_ad_spend,
        COALESCE(SUM(profit), 0) as total_profit
      FROM landing_pages
    `).get();

    return NextResponse.json({ pages, totals });
  } catch (error) {
    console.error('Landing API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json();
    const {
      action, id, name, slug, landing_type, template, product_name, shop_name,
      original_price, promo_price, discount_percent, rating, sold_count,
      image_url, description, highlights, cta_text, affiliate_url, campaign_id,
      utm_source, utm_medium, utm_campaign, utm_content, meta_pixel_id, redirect_delay,
      event_type
    } = body;

    // Simulated Event Tracking (page_view, cta_click, redirect_start, outbound_click)
    if (action === 'track_event' && (slug || id)) {
      const field = 
        event_type === 'page_view' ? 'visitors' :
        event_type === 'cta_click' ? 'cta_clicks' :
        event_type === 'redirect_start' ? 'redirects' :
        event_type === 'outbound_click' ? 'outbound_clicks' : null;

      if (field) {
        if (slug) {
          db.prepare(`UPDATE landing_pages SET ${field} = ${field} + 1 WHERE slug = ?`).run(slug);
        } else if (id) {
          db.prepare(`UPDATE landing_pages SET ${field} = ${field} + 1 WHERE id = ?`).run(id);
        }
      }
      return NextResponse.json({ success: true, event: event_type });
    }

    if (action === 'delete' && id) {
      db.prepare('DELETE FROM landing_pages WHERE id = ?').run(id);
      return NextResponse.json({ success: true, message: 'Landing page berhasil dihapus' });
    }

    // Create / Update Landing Page
    const pageSlug = slug || (name || 'landing').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);
    const landingTypeVal = landing_type || 'CUSTOM';
    const templateVal = template || (landingTypeVal === 'BLINK' ? 'REDIRECT' : 'PRODUCT');

    if (id) {
      db.prepare(`
        UPDATE landing_pages SET
          name = ?, slug = ?, landing_type = ?, template = ?, product_name = ?, shop_name = ?,
          original_price = ?, promo_price = ?, discount_percent = ?, rating = ?, sold_count = ?,
          image_url = ?, description = ?, highlights = ?, cta_text = ?, affiliate_url = ?,
          campaign_id = ?, utm_source = ?, utm_medium = ?, utm_campaign = ?, utm_content = ?,
          meta_pixel_id = ?, redirect_delay = ?
        WHERE id = ?
      `).run(
        name, pageSlug, landingTypeVal, templateVal, product_name, shop_name || 'Toko Marketplace',
        Number(original_price) || 0, Number(promo_price) || 0, Number(discount_percent) || 0,
        Number(rating) || 4.9, sold_count || '2.5rb+', image_url || '', description || '',
        highlights || '', cta_text || 'CEK PROMO', affiliate_url || '#', campaign_id || '',
        utm_source || 'facebook', utm_medium || 'cpc', utm_campaign || '', utm_content || '',
        meta_pixel_id || '', Number(redirect_delay) || 1.0, id
      );
      return NextResponse.json({ success: true, id, slug: pageSlug, message: 'Landing page berhasil diperbarui' });
    } else {
      const res = db.prepare(`
        INSERT INTO landing_pages (
          name, slug, landing_type, template, product_name, shop_name, original_price, promo_price,
          discount_percent, rating, sold_count, image_url, description, highlights, cta_text,
          affiliate_url, campaign_id, utm_source, utm_medium, utm_campaign, utm_content,
          meta_pixel_id, redirect_delay, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `).run(
        name || 'Landing Page Baru', pageSlug, landingTypeVal, templateVal, product_name || 'Produk Promo', shop_name || 'Toko Marketplace',
        Number(original_price) || 0, Number(promo_price) || 0, Number(discount_percent) || 0,
        Number(rating) || 4.9, sold_count || '2.5rb+', image_url || '', description || '',
        highlights || '', cta_text || 'CEK PROMO', affiliate_url || '#', campaign_id || '',
        utm_source || 'facebook', utm_medium || 'cpc', utm_campaign || '', utm_content || '',
        meta_pixel_id || '', Number(redirect_delay) || 1.0
      );
      return NextResponse.json({ success: true, id: res.lastInsertRowid, slug: pageSlug, message: 'Landing page baru berhasil dibuat' });
    }
  } catch (error) {
    console.error('Landing POST API error:', error);
    return NextResponse.json({ error: 'Gagal memproses data landing page' }, { status: 500 });
  }
}
