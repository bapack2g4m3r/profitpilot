'use client';

import { useState, useEffect, use } from 'react';
import {
  ShoppingBag, Search, Star, ShieldCheck, Truck, Clock, ArrowRight,
  ExternalLink, Sparkles, RefreshCw, CheckCircle2, ChevronRight, Share2, ThumbsUp
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
      <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center justify-center p-4">
        <RefreshCw size={32} className="animate-spin text-blue-500 mb-3" />
        <p className="text-sm text-slate-400">Memuat halaman produk...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
          !
        </div>
        <h2 className="text-lg font-bold">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">{error || 'Halaman landing ini mungkin telah dihapus atau tidak aktif.'}</p>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
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
              {isRedirecting ? 'Mengalihkan ke halaman produk...' : 'Membuka halaman produk resmi...'}
            </p>
          </div>

          {/* Loading Indicator & Countdown */}
          <div className="flex flex-col items-center justify-center space-y-3 py-2">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
              <span className="absolute text-xs font-mono font-bold text-blue-400">
                {countdown.toFixed(1)}s
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Anda akan diarahkan secara otomatis ke toko resmi.
            </p>
          </div>

          {/* Manual Link Button */}
          <button
            onClick={handleCustomCTAClick}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <span>Buka Langsung Halaman Produk</span>
            <ExternalLink size={14} />
          </button>

          <div className="pt-2 border-t border-white/5 text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" />
            Koneksi Aman &amp; Terverifikasi
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODE 1: CUSTOM SHOPPING PAGE (Mobile Marketplace UX)
  // ==========================================
  const highlightsList = (data.highlights || '')
    .split(/[,;\n]/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-[#222222] font-sans pb-24 max-w-md mx-auto relative shadow-2xl">
      {/* 1. Marketplace Mobile Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-3 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 flex-1 mr-3 bg-gray-100 px-3 py-1.5 rounded-full text-xs text-gray-500">
          <Search size={14} className="text-gray-400 shrink-0" />
          <span className="truncate">{data.product_name}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Share2 size={18} className="cursor-pointer" />
          <ShoppingBag size={18} className="cursor-pointer" />
        </div>
      </header>

      {/* 2. Product Image Gallery */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {data.image_url ? (
          <img src={data.image_url} alt={data.product_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            Foto Produk Promo
          </div>
        )}
        {data.discount_percent > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2 py-1 rounded-md shadow">
            -{data.discount_percent}% OFF
          </div>
        )}
      </div>

      {/* 3. Price & Ratings Section */}
      <div className="bg-white p-4 space-y-2 border-b border-gray-100">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-red-600 font-sans">
            {formatIDR(data.promo_price || data.original_price)}
          </span>
          {data.original_price > data.promo_price && (
            <span className="text-xs text-gray-400 line-through">
              {formatIDR(data.original_price)}
            </span>
          )}
        </div>

        <h1 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
          {data.product_name}
        </h1>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <div className="flex items-center gap-1">
            <span className="text-amber-500 font-bold flex items-center gap-0.5">
              <Star size={13} className="fill-amber-500 text-amber-500" /> {data.rating || 4.9}
            </span>
            <span className="text-gray-300">•</span>
            <span>{data.sold_count || '2.5rb+'} Terjual</span>
          </div>
          <span className="text-emerald-600 font-medium">{data.shop_name}</span>
        </div>
      </div>

      {/* 4. Marketplace Guarantee & Shipping Information */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
            <Truck size={12} /> Gratis Ongkir Extra
          </span>
          <span className="flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
            <ShieldCheck size={12} /> COD Bisa Bayar di Tempat
          </span>
        </div>
      </div>

      {/* 5. Product Highlights */}
      {highlightsList.length > 0 && (
        <div className="bg-white p-4 border-b border-gray-100 space-y-2">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Keunggulan Produk</h3>
          <div className="grid grid-cols-2 gap-2">
            {highlightsList.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Product Description */}
      <div className="bg-white p-4 border-b border-gray-100 space-y-2">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Deskripsi Produk</h3>
        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
          {data.description || 'Produk pilihan terbaik kualitas terjamin.'}
        </p>
      </div>

      {/* 7. Social Proof & Reviews Section */}
      <div className="bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Ulasan Pembeli (4.9/5)</h3>
          <span className="text-xs text-emerald-600 font-semibold">100% Pembeli Puas</span>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="font-bold text-gray-800">Rina S. (Bandung)</span>
              <div className="flex text-amber-500">★★★★★</div>
            </div>
            <p className="text-gray-600">
              &quot;Barang cepet banget nyampenya, kemasan aman bubble wrap tebel. Pas dicoba beneran memuaskan sesuai deskripsi!&quot;
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="font-bold text-gray-800">Dedi K. (Jakarta)</span>
              <div className="flex text-amber-500">★★★★★</div>
            </div>
            <p className="text-gray-600">
              &quot;Dapet harga promo potongan gede, pengiriman aman COD. Recomended banget seller ini!&quot;
            </p>
          </div>
        </div>
      </div>

      {/* 8. Sticky Bottom Floating CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-3 flex items-center gap-3 z-50 shadow-2xl">
        <div className="flex flex-col text-xs shrink-0">
          <span className="text-[10px] text-gray-400 uppercase">Harga Promo</span>
          <span className="font-bold text-red-600 text-sm">{formatIDR(data.promo_price || data.original_price)}</span>
        </div>
        <button
          onClick={handleCustomCTAClick}
          className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
        >
          <span>{data.cta_text || 'CEK PROMO'}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
