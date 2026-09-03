# 🚀 PROFITPILOT — FULL ARCHITECTURE & SYSTEM SPECIFICATION REPORT
> **Dokumen Laporan Komprehensif Sistem Aplikasi ProfitPilot**  
> *Dibuat khusus untuk dianalisis oleh AI (Claude, GPT-4o, Gemini, dll.)*

---

## 📋 1. EXECUTIVE SUMMARY & IDENTITAS APLIKASI

* **Nama Aplikasi**: **ProfitPilot**
* **Target Pengguna**: Pemain **Shopee Affiliate x Meta Ads Marketer (Indonesia)**.
* **Tujuan Utama**: Memangkas *blind-spot* bisnis afiliasi dengan menyajikan perhitungan **Profit Bersih Real** (termasuk pajak PPN 11% Meta Ads Indonesia), **Atribusi Presisi**, **Automasi Diagnosa Ikan 24/7**, serta **Landing Page Generator (100% Shopee Mobile UI & Blink Bridge)**.
* **Tech Stack**:
  * **Framework**: Next.js 14 App Router (React 19, Turbopack)
  * **Bahasa**: TypeScript (Strict Mode 100% Type-Safe)
  * **Styling**: Vanilla CSS + Tailwind CSS (Apple Dark Glassmorphic Design System, SF Typography, Ambient Glows, Segmented Pills)
  * **Icons & Charts**: Lucide React Icons, Recharts (Composed Daily Trendlines & Pie Charts)
  * **Database**: Hybrid Engine — SQLite (`better-sqlite3`) dengan *fail-safe fallback memory* + Integrasi Supabase Cloud PostgreSQL Client (`@supabase/supabase-js`)
  * **Deployment**: Vercel Serverless Ready (Git push auto-deploy)

---

## 🏗️ 2. STRUKTUR DIREKTORI & ARSITEKTUR FILE

```
ProfitPilot/
├── src/
│   ├── app/                          # Next.js App Router Routes
│   │   ├── page.tsx                  # Root route (Redirects to /dashboard)
│   │   ├── layout.tsx                # Root layout (Sidebar + Header)
│   │   ├── globals.css               # Apple Glassmorphic CSS Token System
│   │   ├── dashboard/                # Pusat Analitik Utama (/dashboard)
│   │   ├── landing/                  # Landing Page Generator Builder (/landing)
│   │   ├── lp/[slug]/                # Public Landing Page Dynamic Route (/lp/[slug])
│   │   ├── reports/
│   │   │   ├── daily/                # Laporan Harian (/reports/daily)
│   │   │   └── campaigns/            # Laporan Iklan Meta Ads (/reports/campaigns)
│   │   ├── products/                 # Tag Produk & Katalog (/products)
│   │   ├── profit/                   # Kalkulator Profit Real (/profit)
│   │   ├── import/                   # Shopee CSV Import Engine (/import)
│   │   ├── input/                    # Logger Order & Spend Manual (/input)
│   │   ├── attribution/              # Atribusi Presisi (/attribution)
│   │   ├── automation/               # Robot Automasi Iklan (/automation)
│   │   ├── kpi/                      # KPI Target Planner (/kpi)
│   │   ├── insights/                 # AI Insights Generator (/insights)
│   │   ├── settings/                 # Pengaturan API Meta & Telegram (/settings)
│   │   └── api/                      # REST API Endpoints
│   │       ├── dashboard/route.ts    # GET Dashboard Analytics API
│   │       ├── landing/route.ts      # GET/POST Landing Page CRUD & Event Tracking
│   │       ├── reports/daily/        # Daily Summary Report API
│   │       ├── reports/campaigns/    # Meta Campaign Metrics API
│   │       ├── import/csv/           # CSV Upload Processor API
│   │       ├── input/                # Manual Entry API
│   │       └── automation/           # Automation Rules Engine API
│   ├── components/
│   │   ├── brand/
│   │   │   └── Logo.tsx              # ProfitPilot Pilot Wing & Growth Chart SVG Logo
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Floating Translucent Sidebar Navigation
│   │   │   └── Header.tsx            # Header with Account Switcher & PPN 11% Tax Badge
│   │   └── dashboard/
│   │       ├── KPIGrid.tsx           # 6 Safe KPI Cards with Animated Numbers
│   │       ├── DailyChart.tsx        # Composed Chart (Bar Spend/Comm + Line Net Profit)
│   │       ├── TopPerformers.tsx     # Top Commission Products Bar Breakdown
│   │       ├── OrderStatus.tsx       # Status Order Progress (Selesai, Pending, Batal)
│   │       └── RecentOrders.tsx      # Table Live Transactions
│   └── lib/
│       ├── db/
│       │   ├── schema.ts             # TypeScript Interfaces & SQLite Table Schemas
│       │   ├── index.ts              # Crash-Proof Database Initialization
│       │   └── seed.ts               # 30-Day Realistic Demo Data Seeder
│       ├── supabase/
│       │   ├── client.ts             # Supabase Client Singleton
│       │   └── service.ts            # Supabase Data Sync & Query Helpers
│       └── utils.ts                  # IDR Currency & Date Formatter Utilities
├── .env.local                        # Supabase Credentials (URL + Anon Key)
├── next.config.ts                    # Next.js Serverless Configuration
└── package.json                      # Dependency Manifest
```

---

## ⚡ 3. DASHBOARD & SPESIFIKASI FITUR UTAMA

### 1. 📊 Pusat Analitik Utama (`/dashboard`)
* **KPI Grid Card (Fail-Safe)**:
  1. **Net Profit Real**: Total Komisi Selesai − Total Biaya Iklan (termasuk PPN 11%).
  2. **Total Komisi**: Total pendapatan komisi dari Shopee Affiliate.
  3. **Komisi Meta Ads**: Komisi dari pesanan yang teratribusi dari iklan Meta.
  4. **Komisi Organik**: Komisi dari lalu lintas organik / konten tanpa iklan.
  5. **Biaya Iklan Meta**: Total ad spend (dengan opsi PPN 11% ON/OFF).
  6. **ROAS Performa**: Return on Ad Spend (`Komisi / Ad Spend`).
* **Fitur Multi-Account & Tax Switcher**:
  * Dropdown Pemilih Akun Meta Ads (Semua Akun, Akun #1 Beauty, Akun #2 Fashion).
  * Toggle **PPN 11% Meta Ads Indonesia**: Menghitung `spend_with_tax = spend * 1.11`.
* **Composed Trendline Chart**: Visualisasi grafik kombinasi Bar Biaya Iklan & Komisi + Line Net Profit harian.
* **Top Performers & Recent Orders**: Breakdown produk paling menguntungkan & tabel pesanan terkini.

---

### 2. 🛍️ Landing Page Generator Suite (`/landing` & `/lp/[slug]`)

Menyediakan **Dua Mode Utama Landing Page** sebagai jembatan antara lalu lintas Meta Ads dan URL Afiliasi Shopee:

#### **MODE 1: CUSTOM SHOPPING PAGE (`CUSTOM`)**
* **Konsep**: Tampilan **100% Mirip Mobile Product Detail Shopee**.
* **Komponen Visual**:
  1. **Top Nav Header**: Tombol back, Mall Red Badge, Nama Toko Resmi, Search, Cart (badge `99+`), Share, & Opsi `...`.
  2. **Galeri Media Interaktif**: Foto utama resolusi tinggi, tombol play video overlay, indikator counter foto (`1/4`), dan thumbnail selector.
  3. **Banner Harga Promo**: Harga promo merah (`Rp89.000`), harga coret asli (`Rp150.000`), tag diskon (`Hemat 41%`), dan badge voucher (*Dgn Tempat Voucher*, *Diskon Rp9.000*).
  4. **Informasi Pengiriman & Garansi**: `🚚 4 Jam Pengiriman Cepat • Tiba Esok Hari`, `🛡️ 15 Hari Pengembalian • 100% Original • COD-Bisa Cek`.
  5. **Banner Ranking Kategori**: `🏆 No. 7 Terlaris di Masker Wajah`.
  6. **Penilaian Produk (4.9 ★) & AI Rangkuman Penilaian**: Bullet points rangkuman AI, galeri foto ulasan pembeli (`+1,4RB`), dan kartu ulasan pembeli asli (`p******p`, 5 Bintang).
  7. **Video Terkait Produk**: Carousel video review produk.
  8. **Kartu Profil Toko Resmi**: Logo toko, badge **OFFICIAL STORE**, tombol `Kunjungi Toko`, serta statistik toko (*141 Produk*, *4.9 Rating*, *98% Chat Dibalas*).
  9. **Produk Serupa / Toko Carousel**: Grid 2x2 produk rekomendasi toko.
  10. **Sticky Bottom Action Bar**: Tombol `Chat`, `Keranjang`, dan **Tombol Merah Besar `Beli Dengan Voucher Rp89.000`** (memicu event tracking & redirect ke link afiliasi).

#### **MODE 2: BLINK PAGE (`BLINK`)**
* **Konsep**: Halaman jembatan ultra-ringan (*Ultra-light minimal bridge*).
* **Komponen Visual**: Kartu gelap minimalis, logo ProfitPilot, *Product Thumbnail*, spinner loading, countdown timer (0s, 0.5s, 1s, 2s, 3s), dan pesan pengalihan otomatis.

#### **BUILDER & EVENT TRACKING**
* **Visual Mobile Frame Preview**: Editor form di sebelah kiri dengan **Live iPhone Preview** di sebelah kanan yang me-render tampilan Shopee Mobile secara real-time saat form diketik!
* **Analitik Funnel**: Visualisasi alur konversi (*Visitors* → *CTA Clicks / Redirect Start* → *Outbound Clicks*).
* **Simulasi Event Tracking**: API `/api/landing` mencatat event `page_view`, `cta_click`, `redirect_start`, dan `outbound_click`.

---

### 3. 📈 Laporan & Tools Tambahan

* **Laporan Harian (`/reports/daily`)**: Tabel rangkuman statistik harian dengan fitur filter periode dan ekspor data ke file CSV.
* **Laporan Kampanye Meta Ads (`/reports/campaigns`)**: Tabel metric kampanye (Spend, Impressions, Clicks, CTR, CPC, CPM, Conversions, Cost/Conversion) yang dilengkapi dengan **Badge Diagnosa Kesehatan Iklan Otomatis** (*Scale Ready*, *CPM Tinggi*, *Low CTR*).
* **Katalog & Tag Produk (`/products`)**: Pengelompokan produk afiliasi berdasarkan tag status (*Winner*, *Testing*, *Potential*, *Scale Up*).
* **Kalkulator Profit Real (`/profit`)**: Simulasi kalkulasi komisi kotor, potongan PPN 11%, dan net profit margin.
* **Import CSV Shopee (`/import`)**: Engine pengunggah laporan CSV Shopee dengan pemeta kolom otomatis (*auto-column mapping*).
* **Input Manual (`/input`)**: Form pencatatan manual biaya iklan Meta Ads dan transaksi order Shopee.
* **Automasi & AI (`/automation`, `/attribution`, `/insights`, `/kpi`)**: Atribusi presisi, robot automasi rules 24/7, rekomendasi AI Insights, dan planner target bulanan.

---

## 🗄️ 4. STRUKTUR DATABASE & DATA MODEL

Tabel database yang digunakan (SQLite / Supabase PostgreSQL):

```sql
-- 1. Shopee Orders Table
CREATE TABLE IF NOT EXISTS shopee_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  product_id TEXT,
  shop_name TEXT,
  item_price REAL NOT NULL,
  quantity INTEGER DEFAULT 1,
  commission_rate REAL NOT NULL,
  commission_amount REAL NOT NULL,
  status TEXT DEFAULT 'selesai',
  source TEXT DEFAULT 'organic',
  tag TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  order_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Daily Summary Table
CREATE TABLE IF NOT EXISTS daily_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  summary_date TEXT UNIQUE NOT NULL,
  total_commission REAL DEFAULT 0,
  ads_commission REAL DEFAULT 0,
  organic_commission REAL DEFAULT 0,
  total_ad_spend REAL DEFAULT 0,
  total_ad_spend_with_tax REAL DEFAULT 0,
  net_profit REAL DEFAULT 0,
  roas REAL DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  pending_orders INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Landing Pages Table
CREATE TABLE IF NOT EXISTS landing_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  landing_type TEXT DEFAULT 'CUSTOM', -- 'CUSTOM' or 'BLINK'
  template TEXT DEFAULT 'PRODUCT',   -- 'PRODUCT', 'DEAL', 'REVIEW', 'REDIRECT'
  product_name TEXT NOT NULL,
  shop_name TEXT DEFAULT '',
  original_price REAL DEFAULT 0,
  promo_price REAL DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  rating REAL DEFAULT 4.9,
  sold_count TEXT DEFAULT '10rb+',
  image_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  highlights TEXT DEFAULT '',
  cta_text TEXT DEFAULT 'CEK PROMO',
  affiliate_url TEXT NOT NULL,
  campaign_id TEXT DEFAULT '',
  utm_source TEXT DEFAULT 'facebook',
  utm_medium TEXT DEFAULT 'cpc',
  utm_campaign TEXT DEFAULT '',
  meta_pixel_id TEXT DEFAULT '',
  redirect_delay REAL DEFAULT 1.0,
  visitors INTEGER DEFAULT 0,
  cta_clicks INTEGER DEFAULT 0,
  redirects INTEGER DEFAULT 0,
  outbound_clicks INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  commission REAL DEFAULT 0,
  ad_spend REAL DEFAULT 0,
  profit REAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 5. PROMPT PANDUAN UNTUK DISERAHKAN KE CLAUDE / AI LAIN

Berikut adalah template prompt yang bisa langsung kamu salin dan kirim ke Claude atau AI lain untuk melakukan analisis mendalam terhadap aplikasi ProfitPilot ini:

```text
Halo Claude, saya ingin kamu menganalisis aplikasi web bernama "ProfitPilot".
ProfitPilot adalah aplikasi analitik & automasi khusus Shopee Affiliate x Meta Ads Marketer di Indonesia.

Berikut adalah laporan arsitektur dan spesifikasi sistem lengkapnya:
[Tempel seluruh isi dokumen profitpilot_full_app_report.md di sini]

Tolong berikan analisis kamu mengenai:
1. Kekuatan utama arsitektur dan keunggulan fitur ProfitPilot dibanding dashboard analitik konvensional.
2. Analisis efektivitas Landing Page Generator (100% Shopee Mobile UI vs Blink Page Mode) dalam meningkatkan Conversion Rate & CTR ke link Shopee Afiliasi.
3. Rekomendasi peningkatan fitur lanjut (seperti integrasi Webhook otomatis Meta Graph API & Shopee Open API).
4. Saran optimalisasi keamanan & skalabilitas database jika digunakan oleh ribuan pengguna secara bersamaan.
```

---
*Dokumen ini dibuat secara otomatis oleh Antigravity AI Engine untuk project ProfitPilot v1.5 Pro Suite.*
