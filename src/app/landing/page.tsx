'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Compass, Plus, Sparkles, ExternalLink, Copy, Check, Trash2, Edit3, Eye,
  Zap, ArrowRight, Smartphone, RefreshCw, BarChart2, Split, ShieldCheck, Filter,
  Percent, MousePointer, ShoppingCart, DollarSign, ShoppingBag
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

  // Form State for Builder
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formType, setFormType] = useState<'CUSTOM' | 'BLINK'>('CUSTOM');
  const [formTemplate, setFormTemplate] = useState<'PRODUCT' | 'DEAL' | 'REVIEW' | 'REDIRECT'>('PRODUCT');
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formShopName, setFormShopName] = useState('Toko Marketplace Official');
  const [formOriginalPrice, setFormOriginalPrice] = useState('150000');
  const [formPromoPrice, setFormPromoPrice] = useState('89000');
  const [formRating, setFormRating] = useState('4.9');
  const [formSoldCount, setFormSoldCount] = useState('2.5rb+');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80');
  const [formDescription, setFormDescription] = useState('Produk unggulan pencerah wajah kualitas terjamin BPOM.');
  const [formHighlights, setFormHighlights] = useState('Formulasi Korea, Niacinamide 5%, Hasil Terlihat 7 Hari');
  const [formCtaText, setFormCtaText] = useState('CEK PROMO');
  const [formAffiliateUrl, setFormAffiliateUrl] = useState('https://shope.ee/demo-link');
  const [formCampaignId, setFormCampaignId] = useState('campaign_beauty_broad');
  const [formMetaPixelId, setFormMetaPixelId] = useState('1234567890');
  const [formRedirectDelay, setFormRedirectDelay] = useState<number>(1.0);
  const [saving, setSaving] = useState(false);

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
    setFormName(type === 'BLINK' ? 'Serum Glowing - Blink' : 'Serum Glowing X');
    setFormSlug(type === 'BLINK' ? 'serum-glowing-blink-new' : 'serum-glowing-new');
    setFormProductName('Serum Glowing Vitamin C 30ml Anti Aging Brightening');
    setFormShopName('BeautyGlow Official Store');
    setFormOriginalPrice('150000');
    setFormPromoPrice('89000');
    setFormRating('4.9');
    setFormSoldCount('2.5rb+');
    setFormImageUrl('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80');
    setFormDescription('Serum pencerah wajah dengan Vitamin C murni 10% & Niacinamide.');
    setFormHighlights('Formulasi Korea, BPOM Approved, Hasil 7 Hari');
    setFormCtaText(type === 'BLINK' ? 'LIHAT SEKARANG' : 'CEK PROMO');
    setFormAffiliateUrl('https://shope.ee/demo-link');
    setFormCampaignId('campaign_beauty_broad');
    setFormMetaPixelId('1234567890');
    setFormRedirectDelay(1.0);
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

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Compass size={20} className="text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Landing Page Generator</h1>
            <span className="apple-badge apple-badge-blue text-[10px]">CUSTOM &amp; BLINK MODES</span>
          </div>
          <p className="text-sm text-slate-400">
            Generator landing page jembatan lalu lintas iklan Meta Ads ke Shopee Affiliate.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => handleCreateNew('CUSTOM')} className="apple-btn-primary text-xs">
            <Plus size={14} /> Buat Custom Shopping Page
          </button>
          <button onClick={() => handleCreateNew('BLINK')} className="apple-btn-secondary text-xs">
            <Zap size={14} className="text-yellow-400" /> Buat Blink Page (Ultra Light)
          </button>
        </div>
      </div>

      {/* Tabs */}
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
          <Smartphone size={14} /> Visual Mobile Builder &amp; Live Editor
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
                  Custom Shopping
                </button>
                <button onClick={() => setTypeFilter('BLINK')} className={`segmented-btn ${typeFilter === 'BLINK' ? 'active' : ''}`}>
                  Blink (Minimal)
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
                    <th>CTR / Redirect %</th>
                    <th>Est. Profit</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((p) => {
                    const ctrRate = p.visitors > 0 ? (p.outbound_clicks / p.visitors) * 100 : 0;
                    return (
                      <tr key={p.id}>
                        <td>
                          <span className={`apple-badge text-[9px] ${p.landing_type === 'CUSTOM' ? 'apple-badge-purple' : 'apple-badge-amber'}`}>
                            {p.landing_type === 'CUSTOM' ? '🛍️ CUSTOM' : '⚡ BLINK'}
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
                              title="Buka Link Publik Live"
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

      {/* TAB 2: VISUAL MOBILE BUILDER & LIVE EDITOR */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form Editor */}
          <div className="lg:col-span-7 space-y-4">
            <div className="apple-card space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {editingId ? 'Edit Configuration' : 'Konfigurasi Landing Page Baru'}
                </h3>
                <span className="apple-badge apple-badge-purple text-[10px]">
                  MODE: {formType}
                </span>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                {/* 1. Mode Selector */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Tipe Landing Page Mode *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setFormType('CUSTOM'); setFormTemplate('PRODUCT'); setFormCtaText('CEK PROMO'); }}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        formType === 'CUSTOM' ? 'bg-purple-500/20 border-purple-500/40 text-white shadow-lg' : 'bg-white/[0.02] border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">🛍️ MODE 1: CUSTOM SHOPPING</span>
                        {formType === 'CUSTOM' && <Check size={14} className="text-purple-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400">Mobile Marketplace Experience (Shopee-like PD UX)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setFormType('BLINK'); setFormTemplate('REDIRECT'); setFormCtaText('LIHAT SEKARANG'); }}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        formType === 'BLINK' ? 'bg-amber-500/20 border-amber-500/40 text-white shadow-lg' : 'bg-white/[0.02] border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">⚡ MODE 2: BLINK PAGE</span>
                        {formType === 'BLINK' && <Check size={14} className="text-amber-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400">Ultra-light minimal fast redirect bridge</span>
                    </button>
                  </div>
                </div>

                {/* 2. Basic Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nama Internal Landing Page *</label>
                    <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required className="input-field" placeholder="Serum Glowing Campaign X" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Custom Slug URL (/lp/slug) *</label>
                    <input type="text" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} required className="input-field font-mono text-blue-400" placeholder="serum-glowing-x" />
                  </div>
                </div>

                {/* 3. Product Info */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nama Produk Shopee *</label>
                  <input type="text" value={formProductName} onChange={(e) => setFormProductName(e.target.value)} required className="input-field" placeholder="Serum Glowing Vitamin C 30ml" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nama Toko Marketplace</label>
                    <input type="text" value={formShopName} onChange={(e) => setFormShopName(e.target.value)} className="input-field" placeholder="BeautyGlow Official Store" />
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
                        <input type="text" value={formSoldCount} onChange={(e) => setFormSoldCount(e.target.value)} className="input-field font-mono" placeholder="2.5rb+" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Deskripsi Ringkas Produk</label>
                      <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} className="input-field text-xs" />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Keunggulan / Highlights (Pisahkan Komma)</label>
                      <input type="text" value={formHighlights} onChange={(e) => setFormHighlights(e.target.value)} className="input-field" placeholder="BPOM Approved, Niacinamide 5%, Hasil 7 Hari" />
                    </div>
                  </>
                )}

                {/* Mode 2 Specific Delay Selector */}
                {formType === 'BLINK' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold">Redirect Delay (Detik) *</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[0, 0.5, 1.0, 2.0, 3.0].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFormRedirectDelay(d)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                            formRedirectDelay === d ? 'bg-amber-500 text-black shadow' : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {d}s {d === 1.0 ? '(Default)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
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
                      <input type="text" value={formCtaText} onChange={(e) => setFormCtaText(e.target.value)} className="input-field font-semibold" placeholder="CEK PROMO" />
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

          {/* Right Mobile Phone Live Frame Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-6 w-full max-w-[340px]">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Smartphone size={14} className="text-emerald-400" /> Live Mobile Frame Preview
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
                    // Blink Live Preview
                    <div className="flex-1 bg-[#090b10] text-slate-200 p-4 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                        <img src={formImageUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-white line-clamp-2">{formProductName}</h4>
                        <p className="text-[10px] text-slate-400">Membuka halaman produk resmi...</p>
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                      <button className="w-full py-2 px-3 rounded-lg bg-blue-600 text-white font-semibold text-[10px]">
                        {formCtaText}
                      </button>
                    </div>
                  ) : (
                    // 100% Shopee Mobile Live Preview Frame
                    <div className="flex-1 bg-[#f5f5f5] pb-14 text-[10px]">
                      {/* Top Nav */}
                      <div className="bg-white p-2 border-b flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-[#f5f5f5] px-2 py-0.5 rounded-full truncate flex-1 mr-2 text-[9px]">
                          <span className="bg-[#ee4d2d] text-white font-black px-1 rounded text-[8px]">MALL</span>
                          <span className="font-bold text-slate-800 truncate">{formShopName || 'Toko Resmi'}</span>
                        </div>
                        <ShoppingBag size={12} className="text-slate-600" />
                      </div>
                      {/* Media */}
                      <div className="aspect-square bg-white relative">
                        <img src={formImageUrl} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full font-mono">
                          1/4
                        </div>
                      </div>
                      {/* Price Banner */}
                      <div className="bg-white p-2.5 space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-[#ee4d2d] font-sans">{formatIDR(parseFloat(formPromoPrice) || 0)}</span>
                          <span className="text-[9px] text-slate-400 line-through">{formatIDR(parseFloat(formOriginalPrice) || 0)}</span>
                        </div>
                        <div className="flex gap-1 text-[8px]">
                          <span className="bg-[#fff0ed] text-[#ee4d2d] border border-[#ee4d2d]/30 font-semibold px-1 rounded">Diskon Promo</span>
                          <span className="bg-[#fff0ed] text-[#ee4d2d] border border-[#ee4d2d]/30 font-semibold px-1 rounded">Voucher Extra</span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-900 leading-tight line-clamp-2">
                          <span className="bg-[#ee4d2d] text-white text-[8px] font-black px-1 rounded mr-1">MALL</span>
                          {formProductName}
                        </p>
                        <p className="text-[8px] text-slate-500 pt-0.5">★ {formRating} • {formSoldCount} Terjual</p>
                      </div>
                      {/* Shipping Bar */}
                      <div className="bg-white mt-1 p-2 border-y border-slate-100 text-[8px] space-y-1 text-slate-600">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-800">4 Jam</span>
                          <span>Pengiriman Cepat • Tiba Esok Hari</span>
                        </div>
                        <div className="flex gap-2 text-[7.5px] pt-0.5 text-slate-500">
                          <span>✓ 15 Hari Pengembalian</span>
                          <span>✓ 100% Original</span>
                          <span>✓ COD</span>
                        </div>
                      </div>
                      {/* Rating Summary */}
                      <div className="bg-white mt-1 p-2 border-y border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-bold">
                          <span>Penilaian Produk (4.9/5)</span>
                          <span className="text-[#ee4d2d]">100% Puas</span>
                        </div>
                        <div className="bg-[#fcfbf7] p-1.5 rounded border border-amber-200 text-[8px] text-slate-700">
                          ★ Tipe kulit terawat &amp; tekstur lembut tidak perih...
                        </div>
                      </div>
                      {/* Sticky Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-1.5 flex items-center gap-1.5 h-12 z-20">
                        <div className="text-[8px] text-slate-500 px-1 border-r text-center">
                          💬 Chat
                        </div>
                        <div className="text-[8px] text-slate-500 px-1 border-r text-center">
                          🛒 Keranjang
                        </div>
                        <button className="flex-1 bg-[#ee4d2d] text-white font-extrabold text-[9px] py-2 rounded uppercase text-center">
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
                  🛍️ Custom Shopping Funnel Flow
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
                  <span className="text-xs text-slate-400">2. CTA Button Clicks (CEK PROMO)</span>
                  <span className="font-mono font-bold text-purple-400 text-sm">680</span>
                </div>
                <div className="text-center text-slate-500">↓ (86.7% Outbound)</div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">3. Outbound Clicks (Shopee)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">590</span>
                </div>
              </div>
            </div>

            {/* Blink Page Funnel */}
            <div className="apple-card space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  ⚡ Blink Bridge Funnel Flow
                </h3>
                <span className="apple-badge apple-badge-amber text-[10px]">MODE 2</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">1. Visitors (Meta Ads Traffic)</span>
                  <span className="font-mono font-bold text-white text-sm">1,180</span>
                </div>
                <div className="text-center text-slate-500">↓ (93.2% Auto Redirect)</div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">2. Redirect Started (Auto Bridge)</span>
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
              <p className="text-xs text-slate-400">Komparasi performa Variant A (Custom Shopping) vs Variant B (Blink Bridge) pada campaign yang sama.</p>
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
                  <td><span className="apple-badge apple-badge-purple text-[9px]">Variant A (CUSTOM)</span></td>
                  <td><span className="font-semibold text-xs text-white">Serum Glowing X</span></td>
                  <td><span className="font-mono text-xs">1,250</span></td>
                  <td><span className="font-mono text-xs text-amber-400 font-bold">47.2%</span></td>
                  <td><span className="font-mono text-xs font-bold text-purple-400">42 Orders</span></td>
                  <td><span className="font-mono text-xs text-emerald-400 font-bold">Rp 1.250.000</span></td>
                  <td><span className="font-mono text-xs text-rose-400">Rp 450.000</span></td>
                  <td><span className="font-mono text-xs text-emerald-400 font-bold">Rp 800.000</span></td>
                </tr>
                <tr>
                  <td><span className="apple-badge apple-badge-amber text-[9px]">Variant B (BLINK)</span></td>
                  <td><span className="font-semibold text-xs text-white">Serum Glowing X - Blink</span></td>
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
