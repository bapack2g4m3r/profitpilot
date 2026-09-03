import { supabase } from './client';

export async function initSupabaseTablesAndSeed() {
  try {
    // 1. Verify connection & seed demo landing pages if table empty
    const { data: existingLandings, error: landingErr } = await supabase.from('landing_pages').select('id').limit(1);
    
    if (landingErr && landingErr.code === 'PGRST116') {
      console.log('Supabase table landing_pages initialized');
    }

    // Seed default demo landing pages into Supabase
    if (!existingLandings || existingLandings.length === 0) {
      await supabase.from('landing_pages').upsert([
        {
          name: 'Serum Glowing X',
          slug: 'serum-glowing-x',
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
        },
        {
          name: 'Serum Glowing X - Blink',
          slug: 'serum-glowing-blink',
          landing_type: 'BLINK',
          template: 'REDIRECT',
          product_name: 'Serum Glowing Vitamin C 30ml Anti Aging Brightening',
          shop_name: 'BeautyGlow Official Store',
          original_price: 150000,
          promo_price: 89000,
          discount_percent: 41,
          rating: 4.9,
          sold_count: '2.5rb+',
          image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
          description: 'Anda akan diarahkan ke halaman produk resmi.',
          highlights: 'Fast Redirect Bridge',
          cta_text: 'LIHAT SEKARANG',
          affiliate_url: 'https://shope.ee/demo-link',
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
        }
      ], { onConflict: 'slug' });
    }

    return true;
  } catch (err) {
    console.warn('Supabase initialization note:', err);
    return false;
  }
}
