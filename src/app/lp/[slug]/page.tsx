'use client';

import { useState, useEffect, use } from 'react';
import {
  Search, Star, ShieldCheck, Truck, Clock, ExternalLink, Sparkles, RefreshCw,
  CheckCircle2, ChevronRight, Share2, ThumbsUp, MessageSquare, ShoppingCart,
  Play, Heart, MoreHorizontal, ArrowLeft, Trophy, Award, Check, MapPin, Store
} from 'lucide-react';
import { formatIDR } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PublicLandingPage({ params }: PageProps) {
  const { slug } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/landing?slug=${slug}`);
        const json = await res.json();
        if (res.ok && json.page) {
          setData(json.page);
          setCountdown(json.page.redirect_delay || 1.0);

          // Track page_view event
          fetch('/api/landing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'track_event', slug, event_type: 'page_view' }),
          }).catch(() => {});
        } else {
          setError(json.error || 'Halaman tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat halaman landing');
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [slug]);

  // Handle Blink Page Redirect
  useEffect(() => {
    if (data && data.landing_type === 'BLINK' && !isRedirecting) {
      const delayMs = (data.redirect_delay || 1.0) * 1000;
      
      // Track redirect_start
      fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'track_event', slug, event_type: 'redirect_start' }),
      }).catch(() => {});

      const timer = setTimeout(() => {
        setIsRedirecting(true);
        // Track outbound_click
        fetch('/api/landing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'track_event', slug, event_type: 'outbound_click' }),
        }).catch(() => {});

        // Perform mock redirect
        if (data.affiliate_url && data.affiliate_url !== '#') {
          window.location.href = data.affiliate_url;
        }
      }, delayMs);

      // Countdown interval
      const interval = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 0.1));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [data, slug, isRedirecting]);

  const handleCustomCTAClick = () => {
    if (!data) return;
    // Track cta_click & outbound_click
    fetch('/api/landing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'track_event', slug, event_type: 'cta_click' }),
    }).catch(() => {});

    fetch('/api/landing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'track_event', slug, event_type: 'outbound_click' }),
    }).catch(() => {});

    if (data.affiliate_url && data.affiliate_url !== '#') {
      window.location.href = data.affiliate_url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] text-slate-800 flex flex-col items-center justify-center p-4">
        <RefreshCw size={32} className="animate-spin text-[#ee4d2d] mb-3" />
        <p className="text-xs text-slate-500 font-sans">Memuat halaman produk Shopee...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] text-slate-800 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
          !
        </div>
        <h2 className="text-base font-bold">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">{error || 'Halaman landing ini mungkin telah dihapus atau tidak aktif.'}</p>
      </div>
    );
  }

  // ==========================================
  // MODE 2: BLINK PAGE (Ultra-light minimal bridge)
  // ==========================================
  if (data.landing_type === 'BLINK') {
    return (
      <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-md w-full bg-[#131722]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6 animate-fade-in">
          {/* Brand Header */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ee4d2d]/10 border border-[#ee4d2d]/20 text-[#ee4d2d] text-xs font-semibold">
            <Sparkles size={12} /> ProfitPilot Bridge Mode
          </div>

          {/* Product Thumbnail */}
          {data.image_url && (
            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-lg relative">
              <img src={data.image_url} alt={data.product_name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Title & Redirect Notice */}
          <div className="space-y-2">
            <h1 className="text-base font-bold text-white line-clamp-2">{data.product_name}</h1>
            <p className="text-xs text-slate-400">
              {isRedirecting ? 'Mengalihkan ke halaman produk resmi Shopee...' : 'Membuka halaman produk resmi...'}
            </p>
          </div>

          {/* Loading Indicator & Countdown */}
          <div className="flex flex-col items-center justify-center space-y-3 py-2">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#ee4d2d]/20 border-t-[#ee4d2d] animate-spin" />
              <span className="absolute text-xs font-mono font-bold text-[#ee4d2d]">
                {countdown.toFixed(1)}s
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Anda akan diarahkan secara otomatis ke toko resmi Shopee.
            </p>
          </div>

          {/* Manual Link Button */}
          <button
            onClick={handleCustomCTAClick}
            className="w-full py-3 px-4 rounded-xl bg-[#ee4d2d] hover:bg-[#d73211] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ee4d2d]/30 flex items-center justify-center gap-2"
          >
            <span>Buka Langsung Halaman Produk</span>
            <ExternalLink size={14} />
          </button>

          <div className="pt-2 border-t border-white/5 text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" />
            Koneksi Resmi Shopee Terverifikasi
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODE 1: 100% SHOPEE MOBILE PRODUCT PAGE UX
  // ==========================================
  const highlightsList = (data.highlights || '')
    .split(/[,;\n]/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  const galleryImages = [
    data.image_url,
    'https://images.unsplash.com/photo-1608248597261-83325e6ba688?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
  ].filter(Boolean);

  const promoPrice = data.promo_price || data.original_price || 89000;
  const originalPrice = data.original_price || 150000;
  const discountPercent = data.discount_percent || (originalPrice > promoPrice ? Math.round(((originalPrice - promoPrice) / originalPrice) * 100) : 41);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#222222] font-sans pb-20 max-w-md mx-auto relative shadow-2xl selection:bg-[#ee4d2d] selection:text-white">
      
      {/* 1. Exact Shopee Mobile Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 flex-1 mr-2">
          <ArrowLeft size={18} className="text-slate-600 cursor-pointer shrink-0" />
          <div className="flex items-center gap-1 truncate bg-[#f5f5f5] px-2.5 py-1 rounded-full text-xs">
            <span className="bg-[#ee4d2d] text-white text-[9px] font-black px-1 rounded">MALL</span>
            <span className="font-bold text-slate-800 text-[11px] truncate">{data.shop_name || 'SKINTIFIC | OFFICIAL'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-600 shrink-0">
          <Search size={18} className="cursor-pointer" />
          <div className="relative">
            <ShoppingCart size={18} className="cursor-pointer" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#ee4d2d] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              99+
            </span>
          </div>
          <Share2 size={18} className="cursor-pointer" />
          <MoreHorizontal size={18} className="cursor-pointer" />
        </div>
      </header>

      {/* 2. Interactive Product Image & Video Gallery */}
      <div className="relative aspect-square bg-white overflow-hidden group">
        <img
          src={galleryImages[activeMediaIdx] || galleryImages[0]}
          alt={data.product_name}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Video Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 shadow-lg">
            <Play size={20} className="fill-white ml-0.5" />
          </div>
        </div>

        {/* Media Slider Index Counter (e.g. 1/14) */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-sm">
          {activeMediaIdx + 1}/{galleryImages.length}
        </div>
      </div>

      {/* Gallery Thumbnail Selector */}
      <div className="bg-white px-3 py-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        {galleryImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveMediaIdx(idx)}
            className={`w-12 h-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
              activeMediaIdx === idx ? 'border-[#ee4d2d] scale-105 shadow-sm' : 'border-transparent opacity-70'
            }`}
          >
            <img src={img} alt="thumb" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* 3. Red Price & Voucher Banner */}
      <div className="bg-white p-3 space-y-2 border-b border-slate-100">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#ee4d2d] font-sans">
              {formatIDR(promoPrice)}
            </span>
            {originalPrice > promoPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatIDR(originalPrice)}
              </span>
            )}
          </div>
          <Heart size={20} className="text-slate-400 cursor-pointer hover:text-rose-500" />
        </div>

        {/* Voucher Tag Badges */}
        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
          <span className="bg-[#fff0ed] text-[#ee4d2d] border border-[#ee4d2d]/30 font-semibold px-1.5 py-0.5 rounded">
            Dgn Tempat Voucher
          </span>
          <span className="bg-[#fff0ed] text-[#ee4d2d] border border-[#ee4d2d]/30 font-semibold px-1.5 py-0.5 rounded">
            Diskon Rp9.000
          </span>
          <span className="bg-[#fff0ed] text-[#ee4d2d] border border-[#ee4d2d]/30 font-semibold px-1.5 py-0.5 rounded">
            Hemat {discountPercent}%
          </span>
        </div>

        {/* Mall Tag & Title */}
        <h1 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 pt-1">
          <span className="bg-[#ee4d2d] text-white text-[10px] font-black px-1.5 py-0.5 rounded mr-1 inline-block align-middle">
            Shopee Mall
          </span>
          {data.product_name}
        </h1>

        {/* Rating & Sold Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <span className="text-[#ee4d2d] font-bold flex items-center gap-0.5">
              <Star size={12} className="fill-[#ee4d2d] text-[#ee4d2d]" /> {data.rating || 4.9}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">{data.sold_count || '10rb+'} Terjual</span>
          </div>
          <span className="text-[11px] text-slate-400">Garansi Shopee</span>
        </div>
      </div>

      {/* 4. Shipping & Trust Guarantee Section */}
      <div className="bg-white mt-2 p-3 space-y-2 text-[11px] border-y border-slate-100">
        <div className="flex items-center gap-2 text-slate-700">
          <Truck size={14} className="text-emerald-600 shrink-0" />
          <span className="font-bold text-slate-800">4 Jam</span>
          <span className="text-slate-500">Pengiriman Cepat 4Jam • Tiba Esok Hari</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-600 pt-1 border-t border-slate-50">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-[#ee4d2d]" /> 15 Hari Pengembalian
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-[#ee4d2d]" /> 100% Original
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-[#ee4d2d]" /> COD-Bisa Cek
          </span>
        </div>
        {/* Category Rank Banner */}
        <div className="bg-[#fff8f6] p-2 rounded-lg border border-[#ffeeeb] flex items-center justify-between text-[#ee4d2d] font-semibold text-[11px]">
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-500" />
            <span>No. 7 Terlaris di Masker Wajah</span>
          </div>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* 5. Product Rating & AI Rangkuman Penilaian */}
      <div className="bg-white mt-2 p-3 space-y-3 border-y border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold text-slate-900">4.9</span>
            <div className="flex text-[#ee4d2d]">★★★★★</div>
            <span className="text-slate-600 font-medium">Penilaian Produk (114,6RB)</span>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>

        {/* Rangkuman Penilaian Bullet Points */}
        <div className="bg-[#fcfbf7] p-2.5 rounded-xl border border-amber-200/60 text-[11px] space-y-1.5">
          <div className="flex items-center gap-1 font-bold text-amber-900 text-[11px]">
            <Sparkles size={12} className="text-amber-600" /> Rangkuman Penilaian AI
          </div>
          <ul className="space-y-1 text-slate-700 list-disc pl-4 text-[10.5px]">
            <li><strong>Rekomendasi:</strong> Tipe kulit kering dan lebih terawat setelah pemakaian rutin...</li>
            <li><strong>Formulasi:</strong> Tekstur dan baunya harum serta tidak perih di kulit wajah...</li>
          </ul>
        </div>

        {/* User Review Media Grid */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
            <img src={galleryImages[0]} alt="rev" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Play size={16} className="fill-white text-white" />
            </div>
          </div>
          <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
            <img src={galleryImages[1]} alt="rev" className="w-full h-full object-cover" />
          </div>
          <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
            <img src={galleryImages[2]} alt="rev" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 text-white font-bold text-xs flex items-center justify-center">
              +1,4RB
            </div>
          </div>
        </div>

        {/* Single Detailed Buyer Review Card */}
        <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                P
              </div>
              <span className="font-semibold text-slate-800">p******p</span>
            </div>
            <div className="flex text-[#ee4d2d]">★★★★★</div>
          </div>
          <p className="text-slate-400 text-[10px]">Variasi: Clay Stick 40g • 2026-09-02</p>
          <p className="text-slate-700 text-[11px] leading-snug">
            &quot;Suka banget sm clay stick ini, praktis bgt tinggal diusap ke muka tanpa perlu kotorin tangan. Muka langsung berasa bersih &amp; haluss!&quot;
          </p>
        </div>
      </div>

      {/* 6. Video Terkait Produk Carousel */}
      <div className="bg-white mt-2 p-3 space-y-2 border-y border-slate-100">
        <h3 className="text-xs font-bold text-slate-900 uppercase">Video Terkait Produk</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <div className="w-28 aspect-[3/4] rounded-lg bg-slate-900 relative overflow-hidden shrink-0 shadow-sm">
            <img src={galleryImages[0]} alt="video" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-2 flex flex-col justify-between">
              <div className="flex justify-end"><Play size={12} className="text-white fill-white" /></div>
              <p className="text-white text-[9px] font-medium line-clamp-2">Aroma rose nya enak banget...</p>
            </div>
          </div>
          <div className="w-28 aspect-[3/4] rounded-lg bg-slate-900 relative overflow-hidden shrink-0 shadow-sm">
            <img src={galleryImages[1]} alt="video" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-2 flex flex-col justify-between">
              <div className="flex justify-end"><Play size={12} className="text-white fill-white" /></div>
              <p className="text-white text-[9px] font-medium line-clamp-2">Clay stick SKINTIFIC ter-best seller...</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Store Profile Card (Shopee Mall Official Store) */}
      <div className="bg-white mt-2 p-3 space-y-3 border-y border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#0088cc] text-white font-black text-xs flex items-center justify-center border border-slate-200">
              OFFICIAL
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 text-xs">{data.shop_name || 'SKINTIFIC Official Store'}</span>
                <span className="bg-[#ee4d2d] text-white text-[8px] font-black px-1 rounded">MALL</span>
              </div>
              <p className="text-[10px] text-slate-400">Aktif 1 menit lalu • Kota Jakarta Selatan</p>
            </div>
          </div>
          <button className="px-3 py-1 rounded border border-[#ee4d2d] text-[#ee4d2d] text-xs font-bold hover:bg-[#fff0ed]">
            Kunjungi Toko
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2 text-center text-[10px]">
          <div>
            <span className="font-bold text-slate-800 block text-xs">141</span>
            <span className="text-slate-400">Produk</span>
          </div>
          <div>
            <span className="font-bold text-[#ee4d2d] block text-xs">4.9</span>
            <span className="text-slate-400">Penilaian Toko</span>
          </div>
          <div>
            <span className="font-bold text-emerald-600 block text-xs">98%</span>
            <span className="text-slate-400">Chat Dibalas</span>
          </div>
        </div>
      </div>

      {/* 8. Produk Serupa / Rekomendasi Toko Carousel */}
      <div className="bg-white mt-2 p-3 space-y-2 border-y border-slate-100">
        <h3 className="text-xs font-bold text-slate-900 uppercase">Produk Lain Dari Toko Ini</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 space-y-1">
            <img src={galleryImages[1]} alt="rec" className="w-full aspect-square object-cover rounded" />
            <p className="text-[10px] font-medium text-slate-800 line-clamp-2">SKINTIFIC Cover All Perfect Cushion</p>
            <p className="text-xs font-black text-[#ee4d2d]">Rp119.401</p>
            <p className="text-[9px] text-slate-400">10rb+ Terjual</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 space-y-1">
            <img src={galleryImages[2]} alt="rec" className="w-full aspect-square object-cover rounded" />
            <p className="text-[10px] font-medium text-slate-800 line-clamp-2">SKINTIFIC 5X Ceramide Barrier Moisture</p>
            <p className="text-xs font-black text-[#ee4d2d]">Rp129.401</p>
            <p className="text-[9px] text-slate-400">10rb+ Terjual</p>
          </div>
        </div>
      </div>

      {/* 9. Product Highlights & Description */}
      <div className="bg-white mt-2 p-3 space-y-2 border-y border-slate-100">
        <h3 className="text-xs font-bold text-slate-900 uppercase">Rincian &amp; Deskripsi Produk</h3>
        
        {highlightsList.length > 0 && (
          <div className="space-y-1 text-[11px] text-slate-700 border-b border-slate-100 pb-2">
            {highlightsList.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
          {data.description || 'Produk unggulan terlaris kualitas terjamin BPOM.'}
        </p>
      </div>

      {/* 10. Sticky Bottom Mobile Action Bar (Exact Shopee UI) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex items-stretch z-50 shadow-2xl h-14">
        {/* Chat Seller */}
        <button className="flex-1 flex flex-col items-center justify-center text-[10px] text-slate-600 bg-[#5ca89e]/10 border-r border-slate-100">
          <MessageSquare size={16} className="text-[#5ca89e]" />
          <span>Chat</span>
        </button>

        {/* Add to Cart */}
        <button className="flex-1 flex flex-col items-center justify-center text-[10px] text-slate-600 bg-[#5ca89e]/10 border-r border-slate-100">
          <ShoppingCart size={16} className="text-[#5ca89e]" />
          <span>Keranjang</span>
        </button>

        {/* Large Solid Red Action Button */}
        <button
          onClick={handleCustomCTAClick}
          className="flex-[2.5] bg-[#ee4d2d] hover:bg-[#d73211] active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wide flex flex-col items-center justify-center px-2 transition-all shadow-md"
        >
          <span>{data.cta_text || 'Beli Dengan Voucher'}</span>
          <span className="text-[11px] font-black font-sans">{formatIDR(promoPrice)}</span>
        </button>
      </div>

    </div>
  );
}
