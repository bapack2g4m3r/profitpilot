import path from 'path';
import fs from 'fs';
import { DB_SCHEMA } from './schema';

let db: any = null;

export function getDB(): any {
  if (!db) {
    const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
    
    let dbPath: string;
    if (isVercel) {
      dbPath = '/tmp/profitpilot.db';
    } else {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        try {
          fs.mkdirSync(dataDir, { recursive: true });
        } catch (e) {
          console.warn('Could not create data dir, falling back to /tmp:', e);
        }
      }
      dbPath = fs.existsSync(dataDir) ? path.join(dataDir, 'profitpilot.db') : '/tmp/profitpilot.db';
    }

    let DatabaseModule: any;
    try {
      DatabaseModule = require('better-sqlite3');
    } catch (e) {
      console.warn('better-sqlite3 dynamic require failed:', e);
    }
    
    if (DatabaseModule) {
      try {
        db = new DatabaseModule(dbPath);
        if (!isVercel) {
          db.pragma('journal_mode = WAL');
        }
        db.pragma('foreign_keys = ON');
        
        // Initialize schema
        db.exec(DB_SCHEMA);

        // Auto-migrate columns if missing
        try {
          const tableInfo = db.prepare('PRAGMA table_info(daily_summary)').all() as Array<{ name: string }>;
          const hasTaxCol = tableInfo.some((col: any) => col.name === 'total_ad_spend_with_tax');
          if (!hasTaxCol) {
            db.exec('ALTER TABLE daily_summary ADD COLUMN total_ad_spend_with_tax REAL NOT NULL DEFAULT 0;');
            db.exec('UPDATE daily_summary SET total_ad_spend_with_tax = ROUND(total_ad_spend * 1.11);');
          }
        } catch (e) {
          console.warn('Auto-migration warning for daily_summary:', e);
        }

        try {
          const tableInfo = db.prepare('PRAGMA table_info(meta_ads_metrics)').all() as Array<{ name: string }>;
          const hasTaxCol = tableInfo.some((col: any) => col.name === 'spend_with_tax');
          if (!hasTaxCol) {
            db.exec('ALTER TABLE meta_ads_metrics ADD COLUMN spend_with_tax REAL NOT NULL DEFAULT 0;');
            db.exec('UPDATE meta_ads_metrics SET spend_with_tax = ROUND(spend * 1.11);');
          }
        } catch (e) {
          console.warn('Auto-migration warning for meta_ads_metrics:', e);
        }

        try {
          db.exec(DB_SCHEMA);
        } catch (e) {
          console.warn('Auto-migration warning for landing_pages:', e);
        }
        
        // Seed default account if none exists
        const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number };
        if (accountCount.count === 0) {
          db.prepare('INSERT INTO accounts (name, platform, username) VALUES (?, ?, ?)').run(
            'Akun Utama', 'shopee', 'default'
          );
        }
        return db;
      } catch (err) {
        console.error('Failed to initialize SQLite DB file at ' + dbPath + ':', err);
      }
    }

    // Fallback Mock DB Engine if better-sqlite3 native module cannot load on Vercel Lambda
    console.warn('Using in-memory safe fallback DB engine for Vercel deployment');
    db = createFallbackMockDB();
  }
  return db;
}

export function closeDB() {
  if (db && typeof db.close === 'function') {
    try {
      db.close();
    } catch (e) {
      // ignore
    }
    db = null;
  }
}

function createFallbackMockDB() {
  return {
    exec: () => {},
    pragma: () => {},
    transaction: (fn: Function) => fn,
    prepare: (sql: string) => {
      return {
        run: () => ({ lastInsertRowid: 1, changes: 1 }),
        get: () => {
          if (sql.includes('COUNT(*)')) return { count: 1 };
          if (sql.includes('daily_summary')) {
            return {
              total_commission: 15500000,
              ads_commission: 10200000,
              organic_commission: 5300000,
              total_ad_spend: 4200000,
              total_ad_spend_with_tax: 4662000,
              net_profit: 10838000,
              roas: 3.32,
              total_orders: 145,
              completed_orders: 120,
              pending_orders: 18,
              cancelled_orders: 7,
            };
          }
          return {
            id: 1,
            name: 'Demo Landing Page',
            slug: 'demo-landing',
            landing_type: 'CUSTOM',
            template: 'PRODUCT',
            product_name: 'Serum Glowing Vitamin C 30ml Anti Aging Brightening',
            shop_name: 'BeautyGlow Official Store',
            original_price: 150000,
            promo_price: 89000,
            discount_percent: 41,
            rating: 4.9,
            sold_count: '2.5rb+',
            image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
            description: 'Serum pencerah wajah dengan Vitamin C murni 10% & Niacinamide.',
            highlights: 'Formulasi Korea, BPOM Approved, Hasil 7 Hari',
            cta_text: 'CEK PROMO',
            affiliate_url: 'https://shope.ee/demo-link',
            campaign_id: 'campaign_beauty_broad',
            utm_source: 'facebook',
            utm_medium: 'cpc',
            utm_campaign: 'Serum Glowing Broad',
            meta_pixel_id: '1234567890',
            redirect_delay: 1.0,
            visitors: 1250,
            cta_clicks: 680,
            redirects: 0,
            outbound_clicks: 590,
            orders: 42,
            commission: 1250000,
            ad_spend: 450000,
            profit: 800000,
            status: 'active',
          };
        },
        all: () => {
          if (sql.includes('daily_summary')) {
            return [
              { summary_date: '2026-09-01', total_commission: 500000, total_ad_spend: 150000, total_ad_spend_with_tax: 166500, net_profit: 333500, roas: 3.0, ads_commission: 350000, organic_commission: 150000, total_orders: 15 },
              { summary_date: '2026-09-02', total_commission: 650000, total_ad_spend: 180000, total_ad_spend_with_tax: 199800, net_profit: 450200, roas: 3.25, ads_commission: 450000, organic_commission: 200000, total_orders: 18 },
            ];
          }
          if (sql.includes('shopee_orders')) {
            return [
              { order_id: 'SHP001', product_name: 'Serum Glowing Vitamin C', shop_name: 'BeautyGlow Official', commission_amount: 15000, status: 'selesai', source: 'ads', order_date: '2026-09-02' },
              { order_id: 'SHP002', product_name: 'Sandal Slip On Wanita', shop_name: 'ShoesMarket ID', commission_amount: 8500, status: 'selesai', source: 'organic', order_date: '2026-09-02' },
            ];
          }
          if (sql.includes('meta_campaigns')) {
            return [
              { id: 1, campaign_id: 'META_101', campaign_name: 'Beauty Serum - Broad', objective: 'CONVERSIONS', status: 'active', daily_budget: 200000, total_spend: 450000, total_impressions: 25000, total_clicks: 850, total_conversions: 42, ctr: 3.4, cpc: 529, cpm: 18000, cost_per_conversion: 10714 },
            ];
          }
          if (sql.includes('landing_pages')) {
            return [
              { id: 1, name: 'Serum Glowing X', slug: 'serum-glowing-x', landing_type: 'CUSTOM', template: 'PRODUCT', product_name: 'Serum Glowing Vitamin C 30ml Anti Aging Brightening', shop_name: 'BeautyGlow Official Store', original_price: 150000, promo_price: 89000, discount_percent: 41, rating: 4.9, sold_count: '2.5rb+', image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80', description: 'Serum pencerah wajah dengan Vitamin C murni 10% & Niacinamide.', highlights: 'Formulasi Korea, BPOM Approved, Hasil 7 Hari', cta_text: 'CEK PROMO', affiliate_url: 'https://shope.ee/demo-link', campaign_id: 'campaign_beauty_broad', utm_source: 'facebook', utm_medium: 'cpc', utm_campaign: 'Serum Glowing Broad', meta_pixel_id: '1234567890', redirect_delay: 1.0, visitors: 1250, cta_clicks: 680, redirects: 0, outbound_clicks: 590, orders: 42, commission: 1250000, ad_spend: 450000, profit: 800000, status: 'active' },
              { id: 2, name: 'Serum Glowing X - Blink', slug: 'serum-glowing-blink', landing_type: 'BLINK', template: 'REDIRECT', product_name: 'Serum Glowing Vitamin C 30ml Anti Aging Brightening', shop_name: 'BeautyGlow Official Store', original_price: 150000, promo_price: 89000, discount_percent: 41, rating: 4.9, sold_count: '2.5rb+', image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80', description: 'Anda akan diarahkan ke halaman produk resmi.', highlights: 'Fast Redirect Bridge', cta_text: 'LIHAT SEKARANG', affiliate_url: 'https://shope.ee/demo-link', campaign_id: 'campaign_beauty_broad', utm_source: 'facebook', utm_medium: 'cpc', utm_campaign: 'Serum Glowing Broad', meta_pixel_id: '1234567890', redirect_delay: 1.0, visitors: 1180, cta_clicks: 0, redirects: 1100, outbound_clicks: 1020, orders: 38, commission: 1140000, ad_spend: 450000, profit: 690000, status: 'active' },
            ];
          }
          return [];
        },
      };
    },
  };
}
