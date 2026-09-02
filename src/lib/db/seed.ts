// Seed data for development and demo purposes
import { getDB } from './index';

export function seedDemoData() {
  const db = getDB();
  
  // Check if we already have daily summary data
  const summaryCount = db.prepare('SELECT COUNT(*) as count FROM daily_summary').get() as { count: number };
  if (summaryCount && summaryCount.count > 0) return;

  const now = new Date();
  const orders: any[] = [];
  const dailySummaries: any[] = [];
  const campaigns: any[] = [];
  const metrics: any[] = [];

  // Product names for realism
  const products = [
    { name: 'Serum Vitamin C Brightening 30ml', shop: 'BeautyGlow Official', rate: 8.5, price: 89000 },
    { name: 'Moisturizer Hyaluronic Acid', shop: 'SkinCare Lab', rate: 7.2, price: 125000 },
    { name: 'Sunscreen SPF 50+ PA+++', shop: 'SunGuard Store', rate: 9.0, price: 68000 },
    { name: 'Facial Wash Gentle Cleanser', shop: 'CleanFace ID', rate: 6.8, price: 45000 },
    { name: 'Eye Cream Anti Aging', shop: 'BeautyGlow Official', rate: 10.2, price: 175000 },
    { name: 'Toner Rose Water 200ml', shop: 'NaturalBeauty', rate: 5.5, price: 55000 },
    { name: 'Sheet Mask Bundle 10pcs', shop: 'MaskHub', rate: 8.0, price: 95000 },
    { name: 'Lip Balm SPF 15', shop: 'LipCare Store', rate: 7.5, price: 35000 },
    { name: 'Hair Serum Argan Oil', shop: 'HairGlow ID', rate: 9.5, price: 79000 },
    { name: 'Body Lotion Whitening 500ml', shop: 'BodyCare Plus', rate: 6.0, price: 65000 },
  ];

  const statuses: Array<'selesai' | 'pending' | 'batal'> = ['selesai', 'selesai', 'selesai', 'selesai', 'selesai', 'selesai', 'selesai', 'pending', 'pending', 'batal'];
  const sources: Array<'organic' | 'ads'> = ['ads', 'ads', 'ads', 'organic', 'organic'];
  const tags = ['Winner', 'Testing', 'Potential', 'Scale Up', ''];

  // Generate 30 days of data
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    // Random number of orders per day (5-25)
    const numOrders = Math.floor(Math.random() * 20) + 5;
    let dayCommission = 0;
    let dayAdsCommission = 0;
    let dayOrganicCommission = 0;
    let dayCompleted = 0;
    let dayPending = 0;
    let dayCancelled = 0;

    for (let j = 0; j < numOrders; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const tag = tags[Math.floor(Math.random() * tags.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const commission = Math.round(product.price * qty * (product.rate / 100));

      orders.push({
        order_id: `SHP${dateStr.replace(/-/g, '')}${String(j).padStart(4, '0')}`,
        product_name: product.name,
        product_id: `PROD${Math.floor(Math.random() * 10000)}`,
        shop_name: product.shop,
        item_price: product.price,
        quantity: qty,
        commission_rate: product.rate,
        commission_amount: commission,
        status,
        source,
        tag,
        utm_campaign: source === 'ads' ? `campaign_beauty_${dayOffset}` : '',
        order_date: dateStr,
      });

      if (status === 'selesai') {
        dayCommission += commission;
        dayCompleted++;
        if (source === 'ads') dayAdsCommission += commission;
        else dayOrganicCommission += commission;
      } else if (status === 'pending') {
        dayPending++;
      } else {
        dayCancelled++;
      }
    }

    // Daily ad spend (varies by day, higher on weekdays)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseSpend = isWeekend ? 80000 : 150000;
    const adSpend = Math.round(baseSpend + Math.random() * 100000);
    const adSpendWithTax = Math.round(adSpend * 1.11); // Includes 11% PPN Tax Meta Ads Indonesia
    const netProfit = dayCommission - adSpendWithTax;
    const roas = adSpendWithTax > 0 ? Math.round((dayCommission / adSpendWithTax) * 100) / 100 : 0;

    dailySummaries.push({
      summary_date: dateStr,
      total_commission: dayCommission,
      ads_commission: dayAdsCommission,
      organic_commission: dayOrganicCommission,
      total_ad_spend: adSpend,
      total_ad_spend_with_tax: adSpendWithTax,
      net_profit: netProfit,
      roas,
      total_orders: numOrders,
      completed_orders: dayCompleted,
      pending_orders: dayPending,
      cancelled_orders: dayCancelled,
    });
  }

  // Create Meta campaigns
  const campaignNames = [
    { name: 'Beauty Serum - Broad', objective: 'CONVERSIONS', budget: 200000 },
    { name: 'Skincare Bundle - Lookalike', objective: 'CONVERSIONS', budget: 150000 },
    { name: 'Sunscreen Promo - Interest', objective: 'CONVERSIONS', budget: 100000 },
    { name: 'Brand Awareness - Video', objective: 'REACH', budget: 75000 },
    { name: 'Retargeting - Cart Abandon', objective: 'CONVERSIONS', budget: 120000 },
  ];

  campaignNames.forEach((c, i) => {
    campaigns.push({
      campaign_id: `META_${100 + i}`,
      campaign_name: c.name,
      ad_set_name: `AdSet_${c.name}`,
      ad_name: `Ad_${c.name}`,
      objective: c.objective,
      status: i < 3 ? 'active' : 'paused',
      daily_budget: c.budget,
    });
  });

  // Insert orders
  const insertOrder = db.prepare(`
    INSERT INTO shopee_orders (order_id, product_name, product_id, shop_name, item_price, quantity, commission_rate, commission_amount, status, source, tag, utm_campaign, order_date)
    VALUES (@order_id, @product_name, @product_id, @shop_name, @item_price, @quantity, @commission_rate, @commission_amount, @status, @source, @tag, @utm_campaign, @order_date)
  `);

  const insertSummary = db.prepare(`
    INSERT INTO daily_summary (summary_date, total_commission, ads_commission, organic_commission, total_ad_spend, total_ad_spend_with_tax, net_profit, roas, total_orders, completed_orders, pending_orders, cancelled_orders)
    VALUES (@summary_date, @total_commission, @ads_commission, @organic_commission, @total_ad_spend, @total_ad_spend_with_tax, @net_profit, @roas, @total_orders, @completed_orders, @pending_orders, @cancelled_orders)
  `);

  const insertCampaign = db.prepare(`
    INSERT INTO meta_campaigns (campaign_id, campaign_name, ad_set_name, ad_name, objective, status, daily_budget)
    VALUES (@campaign_id, @campaign_name, @ad_set_name, @ad_name, @objective, @status, @daily_budget)
  `);

  // Insert products
  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (product_id, name, shop_name, commission_rate, tag, is_active)
    VALUES (@product_id, @name, @shop_name, @commission_rate, @tag, 1)
  `);

  const transaction = db.transaction(() => {
    orders.forEach(o => insertOrder.run(o));
    dailySummaries.forEach(s => insertSummary.run(s));
    campaigns.forEach(c => insertCampaign.run(c));
    products.forEach(p => {
      insertProduct.run({
        product_id: `PROD_${p.name.substring(0, 10).replace(/\s/g, '_')}`,
        name: p.name,
        shop_name: p.shop,
        commission_rate: p.rate,
        tag: tags[Math.floor(Math.random() * tags.length)],
      });
    });

    // Generate metrics for campaigns
    const insertMetric = db.prepare(`
      INSERT INTO meta_ads_metrics (campaign_id, metric_date, spend, spend_with_tax, impressions, clicks, ctr, cpc, cpm, conversions, cost_per_conversion, reach, frequency)
      VALUES (@campaign_id, @metric_date, @spend, @spend_with_tax, @impressions, @clicks, @ctr, @cpc, @cpm, @conversions, @cost_per_conversion, @reach, @frequency)
    `);

    // Seed Demo Landing Pages
    const landingCount = db.prepare('SELECT COUNT(*) as count FROM landing_pages').get() as { count: number };
    if (landingCount.count === 0) {
      const insertLanding = db.prepare(`
        INSERT INTO landing_pages (
          name, slug, landing_type, template, product_name, shop_name, original_price, promo_price,
          discount_percent, rating, sold_count, image_url, description, highlights, cta_text,
          affiliate_url, campaign_id, utm_source, utm_medium, utm_campaign, meta_pixel_id,
          redirect_delay, visitors, cta_clicks, redirects, outbound_clicks, orders, commission, ad_spend, profit, status
        ) VALUES (
          @name, @slug, @landing_type, @template, @product_name, @shop_name, @original_price, @promo_price,
          @discount_percent, @rating, @sold_count, @image_url, @description, @highlights, @cta_text,
          @affiliate_url, @campaign_id, @utm_source, @utm_medium, @utm_campaign, @meta_pixel_id,
          @redirect_delay, @visitors, @cta_clicks, @redirects, @outbound_clicks, @orders, @commission, @ad_spend, @profit, @status
        )
      `);

      const demoLandings = [
        // Custom Shopping Pages
        {
          name: 'Serum Glowing X',
          slug: 'serum-glowing-x',
          landing_type: 'CUSTOM',
          template: 'PRODUCT',
          product_name: 'Serum Glowing Vitamin C 30ml Anti Aging Brightening',
          shop_name: 'BeautyGlow Official',
          original_price: 150000,
          promo_price: 89000,
          discount_percent: 41,
          rating: 4.9,
          sold_count: '2.5rb+',
          image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
          description: 'Serum pencerah wajah dengan kandungan Vitamin C murni 10% & Niacinamide. Mencerahkan kulit kusam, menyamarkan flek hitam, dan menjaga kelembaban kulit sepanjang hari.',
          highlights: 'Formulasi Korea, Niacinamide 5%, BPOM Approved, Hasil Terlihat 7 Hari',
          cta_text: 'CEK PROMO',
          affiliate_url: 'https://shope.ee/demo-serum',
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
        },
        {
          name: 'Sandal Wanita Premium',
          slug: 'sandal-wanita-premium',
          landing_type: 'CUSTOM',
          template: 'DEAL',
          product_name: 'Sandal Slip On Wanita Flat Slip On Empuk Kekinian',
          shop_name: 'ShoesMarket ID',
          original_price: 120000,
          promo_price: 65000,
          discount_percent: 46,
          rating: 4.8,
          sold_count: '1.8rb+',
          image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
          description: 'Sandal flat wanita empuk antislip. Cocok untuk kegiatan sehari-hari, santai, maupun kerja. Bahan sintetis premium lentur tidak bikin lecet.',
          highlights: 'Sol Empuk Anti Slip, Ringan Nyaman, Pilihan Warna Estetik',
          cta_text: 'LIHAT PRODUK',
          affiliate_url: 'https://shope.ee/demo-sandal',
          campaign_id: 'campaign_footwear_fashion',
          utm_source: 'instagram',
          utm_medium: 'cpc',
          utm_campaign: 'Sandal Wanita Trend',
          meta_pixel_id: '1234567890',
          redirect_delay: 1.0,
          visitors: 980,
          cta_clicks: 520,
          redirects: 0,
          outbound_clicks: 440,
          orders: 31,
          commission: 890000,
          ad_spend: 320000,
          profit: 570000,
          status: 'active',
        },
        {
          name: 'Sepatu Running Pria',
          slug: 'sepatu-running-pria',
          landing_type: 'CUSTOM',
          template: 'REVIEW',
          product_name: 'Sepatu Running Sport Pria Breathable Ultra Light',
          shop_name: 'SportWear Official Store',
          original_price: 250000,
          promo_price: 135000,
          discount_percent: 46,
          rating: 4.9,
          sold_count: '3.1rb+',
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
          description: 'Sepatu lari olahraga pria dengan jaring breathable dan bantalan empuk meredam guncangan saat joging dan gym.',
          highlights: 'Mesh Air Cushion, Insole Foam Empuk, Sol Karet Anti Licin',
          cta_text: 'CEK HARGA',
          affiliate_url: 'https://shope.ee/demo-sepatu',
          campaign_id: 'campaign_sport_running',
          utm_source: 'facebook',
          utm_medium: 'cpc',
          utm_campaign: 'Sepatu Running Pria',
          meta_pixel_id: '1234567890',
          redirect_delay: 1.0,
          visitors: 1420,
          cta_clicks: 810,
          redirects: 0,
          outbound_clicks: 720,
          orders: 54,
          commission: 1680000,
          ad_spend: 550000,
          profit: 1130000,
          status: 'active',
        },
        // Blink Pages (Ultra-light minimal bridge)
        {
          name: 'Serum Glowing X - Blink',
          slug: 'serum-glowing-blink',
          landing_type: 'BLINK',
          template: 'REDIRECT',
          product_name: 'Serum Glowing Vitamin C 30ml Anti Aging Brightening',
          shop_name: 'BeautyGlow Official',
          original_price: 150000,
          promo_price: 89000,
          discount_percent: 41,
          rating: 4.9,
          sold_count: '2.5rb+',
          image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
          description: 'Anda akan diarahkan ke halaman produk resmi.',
          highlights: 'Fast Redirect Bridge',
          cta_text: 'LIHAT SEKARANG',
          affiliate_url: 'https://shope.ee/demo-serum',
          campaign_id: 'campaign_beauty_broad',
          utm_source: 'facebook',
          utm_medium: 'cpc',
          utm_campaign: 'Serum Glowing Broad',
          meta_pixel_id: '1234567890',
          redirect_delay: 1.0,
          visitors: 1180,
          cta_clicks: 0,
          redirects: 1100,
          outbound_clicks: 1020,
          orders: 38,
          commission: 1140000,
          ad_spend: 450000,
          profit: 690000,
          status: 'active',
        },
        {
          name: 'Sandal Wanita - Blink',
          slug: 'sandal-wanita-blink',
          landing_type: 'BLINK',
          template: 'REDIRECT',
          product_name: 'Sandal Slip On Wanita Flat Slip On Empuk Kekinian',
          shop_name: 'ShoesMarket ID',
          original_price: 120000,
          promo_price: 65000,
          discount_percent: 46,
          rating: 4.8,
          sold_count: '1.8rb+',
          image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
          description: 'Membuka halaman promo sandal wanita...',
          highlights: 'Instant Bridge',
          cta_text: 'MENUJU PROMO',
          affiliate_url: 'https://shope.ee/demo-sandal',
          campaign_id: 'campaign_footwear_fashion',
          utm_source: 'instagram',
          utm_medium: 'cpc',
          utm_campaign: 'Sandal Wanita Trend',
          meta_pixel_id: '1234567890',
          redirect_delay: 0.5,
          visitors: 910,
          cta_clicks: 0,
          redirects: 870,
          outbound_clicks: 810,
          orders: 26,
          commission: 780000,
          ad_spend: 320000,
          profit: 460000,
          status: 'active',
        },
        {
          name: 'Sepatu Running - Blink',
          slug: 'sepatu-running-blink',
          landing_type: 'BLINK',
          template: 'REDIRECT',
          product_name: 'Sepatu Running Sport Pria Breathable Ultra Light',
          shop_name: 'SportWear Official Store',
          original_price: 250000,
          promo_price: 135000,
          discount_percent: 46,
          rating: 4.9,
          sold_count: '3.1rb+',
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
          description: 'Membuka halaman produk resmi sepatu running...',
          highlights: 'Ultra Light Bridge',
          cta_text: 'BUKA SEKARANG',
          affiliate_url: 'https://shope.ee/demo-sepatu',
          campaign_id: 'campaign_sport_running',
          utm_source: 'facebook',
          utm_medium: 'cpc',
          utm_campaign: 'Sepatu Running Pria',
          meta_pixel_id: '1234567890',
          redirect_delay: 1.0,
          visitors: 1350,
          cta_clicks: 0,
          redirects: 1290,
          outbound_clicks: 1210,
          orders: 49,
          commission: 1520000,
          ad_spend: 550000,
          profit: 970000,
          status: 'active',
        },
      ];

      demoLandings.forEach(l => insertLanding.run(l));
    }

    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];

      campaignNames.forEach((_, i) => {
        const spend = Math.round(campaignNames[i].budget * (0.7 + Math.random() * 0.6));
        const impressions = Math.floor(spend / 15 * (80 + Math.random() * 40));
        const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.03));
        const conversions = Math.floor(clicks * (0.02 + Math.random() * 0.05));
        const ctr = clicks / impressions * 100;
        const cpc = clicks > 0 ? spend / clicks : 0;
        const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
        const costPerConversion = conversions > 0 ? spend / conversions : 0;
        const reach = Math.floor(impressions * 0.75);
        const frequency = reach > 0 ? impressions / reach : 0;

        insertMetric.run({
          campaign_id: i + 1,
          metric_date: dateStr,
          spend: Math.round(spend),
          spend_with_tax: Math.round(spend * 1.11),
          impressions,
          clicks,
          ctr: Math.round(ctr * 100) / 100,
          cpc: Math.round(cpc),
          cpm: Math.round(cpm),
          conversions,
          cost_per_conversion: Math.round(costPerConversion),
          reach,
          frequency: Math.round(frequency * 100) / 100,
        });
      });
    }
  });

  transaction();
}
