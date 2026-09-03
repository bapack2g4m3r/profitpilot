'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Compass, Plus, Sparkles, ExternalLink, Copy, Check, Trash2, Edit3, Eye,
  Zap, ArrowRight, Smartphone, RefreshCw, BarChart2, Split, ShieldCheck, Filter,
  Percent, MousePointer, ShoppingCart, DollarSign, ShoppingBag, Code, Download,
  Layers, CheckCircle2, Play, Heart, Star, ChevronRight, MessageSquare
} from 'lucide-react';
import { formatIDR, formatNumber } from '@/lib/utils';

interface LandingPageItem {
  id: number;
  name: string;
  slug: string;
  landing_type: 'CUSTOM' | 'BLINK';
  template: 'PRODUCT' | 'DEAL' | 'REVIEW' | 'REDIRECT';
  product_name: string;
  shop_name: string;
  original_price: number;
  promo_price: number;
  discount_percent: number;
  rating: number;
  sold_count: string;
  image_url: string;
  description: string;
  highlights: string;
  cta_text: string;
  affiliate_url: string;
  campaign_id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  meta_pixel_id: string;
  redirect_delay: number;
  visitors: number;
  cta_clicks: number;
  redirects: number;
  outbound_clicks: number;
  orders: number;
  commission: number;
  ad_spend: number;
  profit: number;
  status: 'active' | 'paused';
}

export default function LandingPagesDashboard() {
  const [pages, setPages] = useState<LandingPageItem[]>([]);
  const [totals, setTotals] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'builder' | 'analytics' | 'ab_test'>('list');
  const [typeFilter, setTypeFilter] = useState<'all' | 'CUSTOM' | 'BLINK'>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Form State for Builder
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formType, setFormType] = useState<'CUSTOM' | 'BLINK'>('CUSTOM');
  const [formTemplate, setFormTemplate] = useState<'PRODUCT' | 'DEAL' | 'REVIEW' | 'REDIRECT'>('PRODUCT');
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formShopName, setFormShopName] = useState('Bisah Watch Original');
  const [formOriginalPrice, setFormOriginalPrice] = useState('2500000');
  const [formPromoPrice, setFormPromoPrice] = useState('1770000');
  const [formRating, setFormRating] = useState('4.9');
  const [formSoldCount, setFormSoldCount] = useState('13 Terjual');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80');
  const [formDescription, setFormDescription] = useState('Kelengkapan unit dan charger original, tidak ada box ori, dikirimkan dengan box toko.');
  const [formHighlights, setFormHighlights] = useState('Sol Empuk Anti Slip, Ringan Nyaman, Pilihan Warna Estetik');
  const [formCtaText, setFormCtaText] = useState('BELI DENGAN VOUCHER RP1.770.000');
  const [formAffiliateUrl, setFormAffiliateUrl] = useState('https://shope.ee/demo-link');
  const [formCampaignId, setFormCampaignId] = useState('campaign_suunto_watch');
  const [formMetaPixelId, setFormMetaPixelId] = useState('1234567890');
  const [formRedirectDelay, setFormRedirectDelay] = useState<number>(0.3);
  const [formPixelEvent, setFormPixelEvent] = useState<string>('PageView + Lead');
  const [formBrowserTitle, setFormBrowserTitle] = useState<string>('Mengarahkan ke Shopee...');
  const [saving, setSaving] = useState(false);

  // WYSIWYG Interactive Editing State inside Mobile Frame
  const [activeEditField, setActiveEditField] = useState<string | null>(null);
  
  // Custom Reviews List
  const [reviewsList, setReviewsList] = useState<Array<{ id: number; name: string; stars: number; text: string; date: string }>>([
    { id: 1, name: 'kinzaghaisanrayyan', stars: 5, text: 'so far so good, semoga gada masalah dan aman sentosa', date: '2026-09-02' },
    { id: 2, name: 'rina_skincare', stars: 5, text: 'Pengiriman cepat banget, produk ori 100%! Recomended bgt.', date: '2026-09-01' }
  ]);

  // Custom Store Products List
  const [storeProductsList, setStoreProductsList] = useState<Array<{ id: number; name: string; price: number; sold: string; img: string }>>([
    { id: 1, name: 'AMAZFIT Pace 2 GPS Running Outdoor', price: 370000, sold: '35 terjual', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80' },
    { id: 2, name: 'SMARTWATCH XIAOMI S1...', price: 600000, sold: '19 terjual', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80' },
    { id: 3, name: 'XIAOMI REDMI WATCH LITE', price: 150000, sold: '4.9 rating', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80' }
  ]);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/landing?type=${typeFilter}`);
      const json = await res.json();
      setPages(json.pages || []);
      setTotals(json.totals || null);
    } catch (err) {
      console.error('Failed to fetch landing pages:', err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleCreateNew = (type: 'CUSTOM' | 'BLINK' = 'CUSTOM') => {
    setEditingId(null);
    setFormType(type);
    setFormTemplate(type === 'BLINK' ? 'REDIRECT' : 'PRODUCT');
    setFormName(type === 'BLINK' ? 'Jam Tangan Suunto - Blink' : 'Jam Tangan Suunto 7');
    setFormSlug(type === 'BLINK' ? 'jam-tangan-suunto-blink' : 'jam-tangan-suunto-7');
    setFormProductName('Jam Tangan Suunto 7 WearOS by Google GPS Outdoor Original');
    setFormShopName('Bisah Watch Original');
    setFormOriginalPrice('2500000');
    setFormPromoPrice('1770000');
    setFormRating('4.9');
    setFormSoldCount('13 Terjual');
    setFormImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80');
    setFormDescription('Kelengkapan unit dan charger original, tidak ada box ori, dikirimkan dengan box toko.');
    setFormHighlights('GPS Outdoor, Body Water Resistant, Full Set Charger');
    setFormCtaText(type === 'BLINK' ? 'LIHAT SEKARANG' : 'BELI DENGAN VOUCHER RP1.770.000');
    setFormAffiliateUrl('https://shope.ee/demo-link');
    setFormCampaignId('campaign_suunto_watch');
    setFormMetaPixelId('1234567890');
    setFormRedirectDelay(0.3);
    setFormPixelEvent('PageView + Lead');
    setFormBrowserTitle('Mengarahkan ke Shopee...');
    setActiveTab('builder');
  };

  const handleEdit = (p: LandingPageItem) => {
    setEditingId(p.id);
    setFormType(p.landing_type);
    setFormTemplate(p.template);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormProductName(p.product_name);
    setFormShopName(p.shop_name);
    setFormOriginalPrice(p.original_price.toString());
    setFormPromoPrice(p.promo_price.toString());
    setFormRating(p.rating.toString());
    setFormSoldCount(p.sold_count);
    setFormImageUrl(p.image_url);
    setFormDescription(p.description);
    setFormHighlights(p.highlights);
    setFormCtaText(p.cta_text);
    setFormAffiliateUrl(p.affiliate_url);
    setFormCampaignId(p.campaign_id);
    setFormMetaPixelId(p.meta_pixel_id);
    setFormRedirectDelay(p.redirect_delay);
    setActiveTab('builder');
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const orig = parseFloat(formOriginalPrice) || 0;
      const promo = parseFloat(formPromoPrice) || 0;
      const disc = orig > promo && orig > 0 ? Math.round(((orig - promo) / orig) * 100) : 0;

      const res = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          name: formName,
          slug: formSlug,
          landing_type: formType,
          template: formTemplate,
          product_name: formProductName,
          shop_name: formShopName,
          original_price: orig,
          promo_price: promo,
          discount_percent: disc,
          rating: parseFloat(formRating) || 4.9,
          sold_count: formSoldCount,
          image_url: formImageUrl,
          description: formDescription,
          highlights: formHighlights,
          cta_text: formCtaText,
          affiliate_url: formAffiliateUrl,
          campaign_id: formCampaignId,
          meta_pixel_id: formMetaPixelId,
          redirect_delay: formRedirectDelay,
        }),
      });

      if (res.ok) {
        fetchPages();
        setActiveTab('list');
      }
    } catch (err) {
      console.error('Error saving landing page:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah kamu yakin ingin menghapus landing page ini?')) return;
    await fetch('/api/landing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    fetchPages();
  };

  const copyLiveLink = (slug: string) => {
    const url = `${window.location.origin}/lp/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleAddReview = () => {
    const newRev = {
      id: Date.now(),
      name: `buyer_${Math.floor(Math.random() * 1000)}`,
      stars: 5,
      text: 'Barang terjamin original, recommended seller!',
      date: new Date().toISOString().split('T')[0]
    };
    setReviewsList([...reviewsList, newRev]);
  };

  const handleDeleteReview = (id: number) => {
    setReviewsList(reviewsList.filter(r => r.id !== id));
  };

  const handleAddStoreProduct = () => {
    const newProd = {
      id: Date.now(),
      name: `PRODUK REKOMENDASI TOKO #${storeProductsList.length + 1}`,
      price: 250000,
      sold: '10 terjual',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80'
    };
    setStoreProductsList([...storeProductsList, newProd]);
  };

  const handleDeleteStoreProduct = (id: number) => {
    setStoreProductsList(storeProductsList.filter(p => p.id !== id));
  };

  // Standalone HTML & CSS Generator for Exporting
  const generateStandaloneHTML = () => {
    if (formType === 'BLINK') {
      return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formBrowserTitle || 'Mengarahkan ke Shopee...'}</title>
  ${formMetaPixelId ? `<!-- Meta Pixel Code -->
  <script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${formMetaPixelId}');
    fbq('track', 'PageView');
    fbq('track', 'Lead');
  </script>` : ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090b10; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px; }
    .card { background: rgba(19, 23, 34, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 32px; max-width: 400px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .spinner { width: 44px; height: 44px; border: 3px solid rgba(238, 77, 45, 0.2); border-top-color: #ee4d2d; border-radius: 50%; animation: spin 1s linear infinite; margin: 16px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn { display: inline-block; width: 100%; padding: 14px; background: #ee4d2d; color: #fff; font-weight: bold; border-radius: 12px; text-decoration: none; margin-top: 16px; font-size: 13px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h3 style="font-size:15px; font-weight:bold;">${formProductName || 'Mengarahkan ke Halaman Resmi Shopee...'}</h3>
    <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">Anda akan dialihkan secara otomatis...</p>
    <a href="${formAffiliateUrl || '#'}" class="btn">${formCtaText || 'Buka Halaman Produk'}</a>
  </div>
  <script>
    setTimeout(function() { window.location.href = "${formAffiliateUrl || '#'}"; }, ${formRedirectDelay * 1000});
  </script>
</body>
</html>`;
    } else {
      return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formProductName}</title>
  ${formMetaPixelId ? `<script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${formMetaPixelId}');
    fbq('track', 'PageView');
  </script>` : ''}
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; color: #222; }
    .container { max-width: 450px; margin: 0 auto; background: #f5f5f5; min-height: 100vh; padding-bottom: 70px; }
    .header { sticky top: 0; background: #fff; border-bottom: 1px solid #eee; padding: 10px; display: flex; justify-content: space-between; align-items: center; }
    .price-box { background: #fff; padding: 12px; margin-bottom: 8px; }
    .price { font-size: 22px; font-weight: 900; color: #ee4d2d; }
    .sticky-bar { position: fixed; bottom: 0; left: 0; right: 0; max-width: 450px; margin: 0 auto; background: #fff; border-top: 1px solid #eee; padding: 8px; display: flex; }
    .cta-btn { flex: 1; background: #ee4d2d; color: #fff; font-weight: bold; border: none; padding: 12px; border-radius: 8px; font-size: 13px; text-transform: uppercase; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span style="background:#ee4d2d; color:#fff; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">MALL</span>
      <span>${formShopName}</span>
    </div>
    <img src="${formImageUrl}" style="width:100%; aspect-ratio:1/1; object-fit:cover;">
    <div class="price-box">
      <div class="price">${formatIDR(parseFloat(formPromoPrice) || 0)}</div>
      <h1 style="font-size:14px; font-weight:bold; margin-top:6px;">${formProductName}</h1>
    </div>
    <div class="sticky-bar">
      <button class="cta-btn" onclick="window.location.href='${formAffiliateUrl}'">${formCtaText}</button>
    </div>
  </div>
</body>
</html>`;
    }
  };

  const copyHTMLCode = () => {
    const code = generateStandaloneHTML();
    navigator.clipboard.writeText(code);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const downloadHTMLFile = () => {
    const code = generateStandaloneHTML();
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formSlug || 'landing-page'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Compass size={20} className="text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Visual Shopee LP Studio &amp; Click-to-Edit</h1>
            <span className="apple-badge apple-badge-blue text-[10px]">INLINE CLICK-TO-EDIT EDITOR</span>
          </div>
          <p className="text-sm text-slate-400">
            Klik elemen di dalam frame preview mobile web untuk langsung mengedit teks, harga, foto, testimoni, atau produk toko!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => handleCreateNew('CUSTOM')} className="apple-btn-primary text-xs">
            <Plus size={14} /> Buat Shopee Mobile LP
          </button>
          <button onClick={() => handleCreateNew('BLINK')} className="apple-btn-secondary text-xs">
            <Zap size={14} className="text-amber-400" /> Buat Pixel Bridge LP (Fast Redirect)
          </button>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'list' ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass size={14} /> Daftar Landing Page ({pages.length})
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'builder' ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone size={14} /> Visual WYSIWYG Builder &amp; Click-to-Edit
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 size={14} /> Analitik Funnel Modal
        </button>
        <button
          onClick={() => setActiveTab('ab_test')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ab_test' ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Split size={14} className="text-purple-400" /> A/B Testing Comparison
        </button>
      </div>

      {/* TAB 1: DAFTAR LANDING PAGE */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Summary Stat Cards */}
          {totals && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="apple-card">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Visitors</span>
                <p className="text-xl font-bold font-mono text-blue-400">{formatNumber(totals.total_visitors)}</p>
                <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                  <span>Custom: {totals.custom_pages}</span>
                  <span>Blink: {totals.blink_pages}</span>
                </div>
              </div>
              <div className="apple-card">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outbound Clicks (Shopee)</span>
                <p className="text-xl font-bold font-mono text-emerald-400">{formatNumber(totals.total_outbound_clicks)}</p>
                <p className="text-[10px] text-slate-400 mt-1">CTA Clicks: {formatNumber(totals.total_cta_clicks)}</p>
              </div>
              <div className="apple-card">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
                <p className="text-xl font-bold font-mono text-purple-400">{formatNumber(totals.total_orders)} Order</p>
                <p className="text-[10px] text-emerald-400 mt-1">Komisi: {formatIDR(totals.total_commission)}</p>
              </div>
              <div className="apple-card">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Est. Profit Landing</span>
                <p className="text-xl font-bold font-mono text-emerald-400">{formatIDR(totals.total_profit)}</p>
                <p className="text-[10px] text-rose-400 mt-1">Ad Spend: {formatIDR(totals.total_ad_spend)}</p>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <span className="text-xs text-slate-400">Filter Tipe:</span>
              <div className="segmented-control">
                <button onClick={() => setTypeFilter('all')} className={`segmented-btn ${typeFilter === 'all' ? 'active' : ''}`}>
                  Semua ({pages.length})
                </button>
                <button onClick={() => setTypeFilter('CUSTOM')} className={`segmented-btn ${typeFilter === 'CUSTOM' ? 'active' : ''}`}>
                  Shopee Mobile UI
                </button>
                <button onClick={() => setTypeFilter('BLINK')} className={`segmented-btn ${typeFilter === 'BLINK' ? 'active' : ''}`}>
                  Pixel Bridge LP
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="apple-card p-0 overflow-hidden">
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tipe Mode</th>
                    <th>Nama &amp; Slug</th>
                    <th>Template</th>
                    <th>Produk Marketplace</th>
                    <th>Campaign Meta</th>
                    <th>Visitors</th>
                    <th>Outbound Clicks</th>
                    <th>CTR %</th>
                    <th>Est. Profit</th>
                    <th>Aksi &amp; Export</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((p) => {
                    const ctrRate = p.visitors > 0 ? (p.outbound_clicks / p.visitors) * 100 : 0;
                    return (
                      <tr key={p.id}>
                        <td>
                          <span className={`apple-badge text-[9px] ${p.landing_type === 'CUSTOM' ? 'apple-badge-purple' : 'apple-badge-amber'}`}>
                            {p.landing_type === 'CUSTOM' ? '🛍️ SHOPEE UI' : '⚡ PIXEL BRIDGE'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <p className="font-semibold text-xs text-white">{p.name}</p>
                            <p className="text-[10px] text-blue-400 font-mono">/lp/{p.slug}</p>
                          </div>
                        </td>
                        <td><span className="apple-badge apple-badge-blue text-[9px]">{p.template}</span></td>
                        <td><span className="text-xs text-slate-300 truncate max-w-[150px] block">{p.product_name}</span></td>
                        <td><span className="font-mono text-xs text-slate-400">{p.utm_campaign || p.campaign_id}</span></td>
                        <td><span className="font-mono text-xs">{formatNumber(p.visitors)}</span></td>
                        <td><span className="font-mono text-xs font-bold text-emerald-400">{formatNumber(p.outbound_clicks)}</span></td>
                        <td><span className="font-mono text-xs text-amber-400 font-bold">{ctrRate.toFixed(1)}%</span></td>
                        <td><span className="font-mono text-xs text-emerald-400 font-bold">{formatIDR(p.profit)}</span></td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`/lp/${p.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400"
                              title="Buka Link Live"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => copyLiveLink(p.slug)}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400"
                              title="Copy URL Link"
                            >
                              {copiedSlug === p.slug ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400"
                              title="Edit Configuration"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-rose-400"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL WYSIWYG BUILDER & CLICK-TO-EDIT PREVIEW */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form Editor */}
          <div className="lg:col-span-7 space-y-4">
            <div className="apple-card space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Smartphone size={16} className="text-blue-400" />
                  {editingId ? 'Edit Configuration' : 'Konfigurasi Landing Page Baru'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyHTMLCode}
                    className="apple-btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1"
                    title="Salin Kode HTML Standalone"
                  >
                    {copiedHtml ? <Check size={12} className="text-emerald-400" /> : <Code size={12} />}
                    <span>{copiedHtml ? 'Kode Tersalin!' : 'Copy Kode HTML'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadHTMLFile}
                    className="apple-btn-primary text-[10px] py-1 px-2.5 flex items-center gap-1"
                    title="Download File HTML"
                  >
                    <Download size={12} /> Download .html
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                {/* 1. Mode Selector */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Tipe Landing Page Generator Mode *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setFormType('CUSTOM'); setFormTemplate('PRODUCT'); setFormCtaText('CEK PROMO'); }}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        formType === 'CUSTOM' ? 'bg-purple-500/20 border-purple-500/40 text-white shadow-lg' : 'bg-white/[0.02] border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">🛍️ 1. SHOPEE MOBILE UI</span>
                        {formType === 'CUSTOM' && <Check size={14} className="text-purple-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400">100% Shopee Mobile Product Detail (Tingkatkan Konversi)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setFormType('BLINK'); setFormTemplate('REDIRECT'); setFormCtaText('LIHAT SEKARANG'); }}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        formType === 'BLINK' ? 'bg-amber-500/20 border-amber-500/40 text-white shadow-lg' : 'bg-white/[0.02] border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">⚡ 2. PIXEL BRIDGE LP</span>
                        {formType === 'BLINK' && <Check size={14} className="text-amber-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400">Pixel Event Trigger &amp; Fast Auto Redirect (0.1s - 3s)</span>
                    </button>
                  </div>
                </div>

                {/* Quick Asset Uploaders */}
                <div className="flex items-center gap-2 flex-wrap p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Assets:</span>
                  <label className="apple-btn-secondary text-[10px] py-1 px-2.5 cursor-pointer flex items-center gap-1">
                    <Plus size={12} className="text-emerald-400" />
                    <span>+ Upload Gambar Hero</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormImageUrl(URL.createObjectURL(file));
                    }} />
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStoreProduct}
                    className="apple-btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1"
                  >
                    <Plus size={12} className="text-blue-400" />
                    <span>+ Produk Toko Lain</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddReview}
                    className="apple-btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1 text-rose-400"
                  >
                    <Plus size={12} />
                    <span>+ Tambah Testimoni Baru</span>
                  </button>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nama Internal Landing Page *</label>
                    <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required className="input-field" placeholder="Jam Tangan Suunto 7" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Custom Slug URL (/lp/slug) *</label>
                    <input type="text" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} required className="input-field font-mono text-blue-400" placeholder="jam-tangan-suunto-7" />
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nama Produk Shopee *</label>
                  <input type="text" value={formProductName} onChange={(e) => setFormProductName(e.target.value)} required className="input-field" placeholder="Jam Tangan Suunto 7 WearOS" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nama Toko Marketplace</label>
                    <input type="text" value={formShopName} onChange={(e) => setFormShopName(e.target.value)} className="input-field" placeholder="Bisah Watch Original" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Image URL Thumbnail</label>
                    <input type="url" value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} className="input-field font-mono text-xs" placeholder="https://..." />
                  </div>
                </div>

                {/* Mode 1 Specific Form Fields */}
                {formType === 'CUSTOM' && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Harga Coret (Original IDR)</label>
                        <input type="number" value={formOriginalPrice} onChange={(e) => setFormOriginalPrice(e.target.value)} className="input-field font-mono" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Harga Promo (IDR)</label>
                        <input type="number" value={formPromoPrice} onChange={(e) => setFormPromoPrice(e.target.value)} className="input-field font-mono text-rose-400 font-bold" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Terjual Count</label>
                        <input type="text" value={formSoldCount} onChange={(e) => setFormSoldCount(e.target.value)} className="input-field font-mono" placeholder="13 Terjual" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Deskripsi Ringkas Produk</label>
                      <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} className="input-field text-xs" />
                    </div>
                  </>
                )}

                {/* Destination & Tracking Links */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tautan Afiliasi &amp; Meta Tracking</h4>
                  
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Affiliate Destination URL (Shopee Link) *</label>
                    <input type="url" value={formAffiliateUrl} onChange={(e) => setFormAffiliateUrl(e.target.value)} required className="input-field font-mono text-emerald-400" placeholder="https://shope.ee/..." />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Teks Tombol CTA</label>
                      <input type="text" value={formCtaText} onChange={(e) => setFormCtaText(e.target.value)} className="input-field font-semibold" placeholder="BELI DENGAN VOUCHER" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Meta Campaign ID</label>
                      <input type="text" value={formCampaignId} onChange={(e) => setFormCampaignId(e.target.value)} className="input-field font-mono" placeholder="campaign_beauty" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Meta Pixel ID (Mock)</label>
                      <input type="text" value={formMetaPixelId} onChange={(e) => setFormMetaPixelId(e.target.value)} className="input-field font-mono" placeholder="1234567890" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setActiveTab('list')} className="apple-btn-secondary text-xs">Batal</button>
                  <button type="submit" disabled={saving} className="apple-btn-primary text-xs">
                    {saving ? 'Menyimpan...' : 'Simpan &amp; Publish Landing Page'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Interactive Mobile Frame WYSIWYG Click-to-Edit Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-6 w-full max-w-[340px]">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Smartphone size={14} className="text-emerald-400" /> Interactive Click-to-Edit Preview
                </span>
                <span className="apple-badge apple-badge-purple text-[9px]">{formType} PREVIEW</span>
              </div>

              {/* Realistic iPhone / Mobile Frame Mockup */}
              <div className="w-full aspect-[9/18] bg-black rounded-[40px] p-3 border-[6px] border-[#2d3242] shadow-2xl overflow-hidden relative flex flex-col">
                {/* Mobile Speaker / Notch */}
                <div className="w-24 h-4 bg-[#2d3242] rounded-full mx-auto mb-2 shrink-0 z-20" />

                {/* Frame Content Viewport */}
                <div className="flex-1 bg-white rounded-[28px] overflow-y-auto text-[#222] text-xs font-sans relative flex flex-col">
                  {formType === 'BLINK' ? (
                    // Pixel Bridge Live Preview
                    <div className="flex-1 bg-[#090b10] text-slate-200 p-4 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                        <img src={formImageUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-white line-clamp-2">{formProductName}</h4>
                        <p className="text-[10px] text-slate-400">{formBrowserTitle}</p>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full border-2 border-[#ee4d2d]/20 border-t-[#ee4d2d] animate-spin my-1" />
                      
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono flex items-center justify-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Simulasi Pixel: fbq(&apos;track&apos;, &apos;{formPixelEvent.split(' ')[0]}&apos;) Fired!</span>
                      </div>

                      <button className="w-full py-2.5 px-3 rounded-xl bg-[#ee4d2d] text-white font-extrabold text-[10px] uppercase shadow-lg shadow-[#ee4d2d]/20">
                        {formCtaText || 'BUKA HALAMAN PRODUK'}
                      </button>
                    </div>
                  ) : (
                    // 100% Shopee Mobile Interactive Click-to-Edit Frame
                    <div className="flex-1 bg-[#f5f5f5] pb-14 text-[10px]">
                      {/* Top Nav (Clickable Title) */}
                      <div
                        onClick={() => setActiveEditField('title')}
                        className={`bg-white p-2 border-b flex items-center justify-between cursor-pointer transition-all ${
                          activeEditField === 'title' ? 'border-2 border-dashed border-red-500 bg-red-50/50' : 'hover:bg-slate-50'
                        }`}
                        title="Klik untuk edit Judul Produk"
                      >
                        <div className="flex items-center gap-1 bg-[#f5f5f5] px-2 py-0.5 rounded-full truncate flex-1 mr-2 text-[9px]">
                          <span className="bg-[#ee4d2d] text-white font-black px-1 rounded text-[8px]">MALL</span>
                          <span className="font-bold text-slate-800 truncate">{formProductName || 'Judul Produk'}</span>
                        </div>
                        <ShoppingBag size={12} className="text-slate-600" />
                      </div>

                      {/* Hero Image (Click to replace) */}
                      <div
                        onClick={() => setActiveEditField('image')}
                        className={`aspect-square bg-white relative cursor-pointer group ${
                          activeEditField === 'image' ? 'border-2 border-dashed border-red-500' : ''
                        }`}
                        title="Klik untuk ganti Gambar Hero"
                      >
                        <img src={formImageUrl} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                          📷 Klik Ganti Gambar
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full font-mono">
                          1/3
                        </div>
                      </div>

                      {/* Price & Voucher Section (Clickable Price) */}
                      <div
                        onClick={() => setActiveEditField('price')}
                        className={`bg-white p-2.5 space-y-1 cursor-pointer transition-all ${
                          activeEditField === 'price' ? 'border-2 border-dashed border-red-500 bg-red-50/50' : 'hover:bg-slate-50'
                        }`}
                        title="Klik untuk edit Harga"
                      >
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-[#ee4d2d] font-sans">{formatIDR(parseFloat(formPromoPrice) || 0)}</span>
                          <span className="text-[9px] text-slate-400 line-through">{formatIDR(parseFloat(formOriginalPrice) || 0)}</span>
                        </div>
                        <div className="flex gap-1 text-[8px]">
                          <span className="bg-[#fff0ed] text-[#ee4d2d] border border-[#ee4d2d]/30 font-semibold px-1 rounded">Dengan Voucher</span>
                          <span className="bg-[#fff0ed] text-[#ee4d2d] border border-[#ee4d2d]/30 font-semibold px-1 rounded">Diskon Promo</span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-900 leading-tight line-clamp-2 pt-0.5">
                          <span className="bg-[#ee4d2d] text-white text-[8px] font-black px-1 rounded mr-1">Star</span>
                          {formProductName}
                        </p>
                        <p className="text-[8px] text-slate-500 pt-0.5">★ {formRating} • {formSoldCount}</p>
                      </div>

                      {/* Store Profile Card (Clickable Store Name) */}
                      <div
                        onClick={() => setActiveEditField('store')}
                        className={`bg-white mt-1 p-2 border-y border-slate-100 flex items-center justify-between cursor-pointer ${
                          activeEditField === 'store' ? 'border-2 border-dashed border-red-500 bg-red-50/50' : ''
                        }`}
                        title="Klik untuk edit Toko"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
                            <img src={formImageUrl} alt="store" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-[9px] block">{formShopName}</span>
                            <span className="text-[7.5px] text-slate-400">Aktif 4 jam lalu • KOTA JAKARTA</span>
                          </div>
                        </div>
                        <button className="px-2 py-0.5 rounded border border-[#ee4d2d] text-[#ee4d2d] text-[8px] font-bold">
                          Kunjungi Toko
                        </button>
                      </div>

                      {/* Produk Lain Dari Toko Ini (With Trash Icon & Add Product Button) */}
                      <div className="bg-white mt-1 p-2 border-y border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="font-bold text-slate-900 uppercase">PRODUK LAIN DARI TOKO INI</span>
                          <button
                            type="button"
                            onClick={handleAddStoreProduct}
                            className="text-[#ee4d2d] font-bold text-[8px] hover:underline"
                          >
                            + Tambah Produk Toko
                          </button>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {storeProductsList.map((prod) => (
                            <div key={prod.id} className="w-20 rounded bg-slate-50 p-1 border border-slate-100 relative group shrink-0">
                              <button
                                type="button"
                                onClick={() => handleDeleteStoreProduct(prod.id)}
                                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] z-10 shadow"
                                title="Hapus Produk Ini"
                              >
                                🗑️
                              </button>
                              <img src={prod.img} alt="p" className="w-full aspect-square object-cover rounded" />
                              <p className="text-[7.5px] font-medium text-slate-800 line-clamp-1 border-dashed border-red-400 mt-0.5">{prod.name}</p>
                              <p className="text-[8.5px] font-bold text-[#ee4d2d]">{formatIDR(prod.price)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deskripsi & Spesifikasi */}
                      <div
                        onClick={() => setActiveEditField('desc')}
                        className={`bg-white mt-1 p-2 border-y border-slate-100 space-y-1 cursor-pointer ${
                          activeEditField === 'desc' ? 'border-2 border-dashed border-red-500 bg-red-50/50' : ''
                        }`}
                        title="Klik untuk edit Deskripsi"
                      >
                        <span className="font-bold text-slate-900 text-[9px] block">Deskripsi Produk</span>
                        <p className="text-[8px] text-slate-600 line-clamp-3 leading-snug">
                          {formDescription}
                        </p>
                      </div>

                      {/* Penilaian Produk & Testimoni Section (With + Tambah Testimoni Baru Button) */}
                      <div className="bg-white mt-1 p-2 border-y border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="font-bold text-slate-900">Penilaian Produk ({reviewsList.length} Ulasan)</span>
                          <button
                            type="button"
                            onClick={handleAddReview}
                            className="text-[#ee4d2d] font-bold text-[8.5px] hover:underline"
                          >
                            + + Tambah Testimoni Baru
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {reviewsList.map((rev) => (
                            <div key={rev.id} className="p-1.5 rounded bg-slate-50 border border-slate-100 text-[8px] relative group space-y-0.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.id)}
                                className="absolute top-1 right-1 text-slate-400 hover:text-rose-500 text-[9px]"
                                title="Hapus Testimoni"
                              >
                                🗑️
                              </button>
                              <div className="flex items-center gap-1 font-bold text-slate-800">
                                <span>{rev.name}</span>
                                <div className="flex text-[#ee4d2d]">★★★★★</div>
                              </div>
                              <p className="text-slate-600 text-[8px] leading-tight">{rev.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sticky Bar (Clickable CTA) */}
                      <div
                        onClick={() => setActiveEditField('cta')}
                        className={`absolute bottom-0 left-0 right-0 bg-white border-t p-1.5 flex items-center gap-1.5 h-12 z-20 cursor-pointer ${
                          activeEditField === 'cta' ? 'border-2 border-dashed border-red-500' : ''
                        }`}
                        title="Klik untuk edit Teks Tombol CTA"
                      >
                        <div className="text-[8px] text-slate-500 px-1 border-r text-center">
                          💬 Chat
                        </div>
                        <div className="text-[8px] text-slate-500 px-1 border-r text-center">
                          🛒 Keranjang
                        </div>
                        <button className="flex-1 bg-[#ee4d2d] text-white font-extrabold text-[9px] py-2 rounded uppercase text-center truncate px-1">
                          {formCtaText || 'BELI DENGAN VOUCHER'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FUNNEL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Custom Shopping Funnel */}
            <div className="apple-card space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  🛍️ Shopee Mobile Funnel Flow
                </h3>
                <span className="apple-badge apple-badge-purple text-[10px]">MODE 1</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">1. Visitors (Meta Ads Traffic)</span>
                  <span className="font-mono font-bold text-white text-sm">1,250</span>
                </div>
                <div className="text-center text-slate-500">↓ (54.4% CTR)</div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">2. CTA Button Clicks (Beli Dengan Voucher)</span>
                  <span className="font-mono font-bold text-purple-400 text-sm">680</span>
                </div>
                <div className="text-center text-slate-500">↓ (86.7% Outbound)</div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">3. Outbound Clicks (Shopee)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">590</span>
                </div>
              </div>
            </div>

            {/* Pixel Bridge Funnel */}
            <div className="apple-card space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  ⚡ Pixel Bridge Funnel Flow
                </h3>
                <span className="apple-badge apple-badge-amber text-[10px]">MODE 2</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">1. Visitors (Meta Ads Traffic)</span>
                  <span className="font-mono font-bold text-white text-sm">1,180</span>
                </div>
                <div className="text-center text-slate-500">↓ (93.2% Fast Redirect)</div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">2. Pixel Fired (PageView + Lead)</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">1,100</span>
                </div>
                <div className="text-center text-slate-500">↓ (92.7% Outbound)</div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">3. Outbound Clicks (Shopee)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">1,020</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: A/B TESTING COMPARISON */}
      {activeTab === 'ab_test' && (
        <div className="apple-card space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Split size={16} className="text-purple-400" /> A/B Testing Variant Comparison
              </h3>
              <p className="text-xs text-slate-400">Komparasi performa Variant A (Shopee Mobile UI) vs Variant B (Pixel Bridge) pada campaign yang sama.</p>
            </div>
            <span className="apple-badge apple-badge-purple text-[10px]">FUTURE READY</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Variant Mode</th>
                  <th>Nama Landing Page</th>
                  <th>Visitors</th>
                  <th>Outbound Rate %</th>
                  <th>Affiliate Orders</th>
                  <th>Total Komisi</th>
                  <th>Ad Spend</th>
                  <th>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="apple-badge apple-badge-purple text-[9px]">Variant A (SHOPEE UI)</span></td>
                  <td><span className="font-semibold text-xs text-white">Jam Tangan Suunto 7</span></td>
                  <td><span className="font-mono text-xs">1,250</span></td>
                  <td><span className="font-mono text-xs text-amber-400 font-bold">47.2%</span></td>
                  <td><span className="font-mono text-xs font-bold text-purple-400">42 Orders</span></td>
                  <td><span className="font-mono text-xs text-emerald-400 font-bold">Rp 1.250.000</span></td>
                  <td><span className="font-mono text-xs text-rose-400">Rp 450.000</span></td>
                  <td><span className="font-mono text-xs text-emerald-400 font-bold">Rp 800.000</span></td>
                </tr>
                <tr>
                  <td><span className="apple-badge apple-badge-amber text-[9px]">Variant B (PIXEL BRIDGE)</span></td>
                  <td><span className="font-semibold text-xs text-white">Jam Tangan Suunto - Blink</span></td>
                  <td><span className="font-mono text-xs">1,180</span></td>
                  <td><span className="font-mono text-xs text-emerald-400 font-bold">86.4%</span></td>
                  <td><span className="font-mono text-xs font-bold text-purple-400">38 Orders</span></td>
                  <td><span className="font-mono text-xs text-emerald-400 font-bold">Rp 1.140.000</span></td>
                  <td><span className="font-mono text-xs text-rose-400">Rp 450.000</span></td>
                  <td><span className="font-mono text-xs text-emerald-400 font-bold">Rp 690.000</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
