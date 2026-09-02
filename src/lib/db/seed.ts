// Seed data for development and demo purposes
import { getDB } from './index';

export function seedDemoData() {
  const db = getDB();
  
  // Check if we already have data
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM shopee_orders').get() as { count: number };
  if (orderCount.count > 0) return;

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
    const netProfit = dayCommission - adSpend;
    const roas = adSpend > 0 ? Math.round((dayCommission / adSpend) * 100) / 100 : 0;

    dailySummaries.push({
      summary_date: dateStr,
      total_commission: dayCommission,
      ads_commission: dayAdsCommission,
      organic_commission: dayOrganicCommission,
      total_ad_spend: adSpend,
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
    INSERT INTO daily_summary (summary_date, total_commission, ads_commission, organic_commission, total_ad_spend, net_profit, roas, total_orders, completed_orders, pending_orders, cancelled_orders)
    VALUES (@summary_date, @total_commission, @ads_commission, @organic_commission, @total_ad_spend, @net_profit, @roas, @total_orders, @completed_orders, @pending_orders, @cancelled_orders)
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
      INSERT INTO meta_ads_metrics (campaign_id, metric_date, spend, impressions, clicks, ctr, cpc, cpm, conversions, cost_per_conversion, reach, frequency)
      VALUES (@campaign_id, @metric_date, @spend, @impressions, @clicks, @ctr, @cpc, @cpm, @conversions, @cost_per_conversion, @reach, @frequency)
    `);

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
