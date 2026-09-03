'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, Check, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { formatIDR } from '@/lib/utils';

export default function CSVImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [mappedOrders, setMappedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setSuccessCount(null);
    setErrorMsg(null);

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data);
        // Smart mapping attempt for Shopee Affiliate CSV format
        const mapped = results.data.map((row: any, idx: number) => {
          const keys = Object.keys(row);
          const findKey = (candidates: string[]) => keys.find(k => candidates.some(c => k.toLowerCase().includes(c.toLowerCase())));

          const orderIdKey = findKey(['order', 'pesanan', 'id_pesanan', 'no']);
          const productKey = findKey(['product', 'produk', 'item', 'nama']);
          const shopKey = findKey(['shop', 'toko', 'penjual', 'seller']);
          const priceKey = findKey(['price', 'harga', 'amount', 'total']);
          const commKey = findKey(['commission', 'komisi', 'penghasilan']);
          const statusKey = findKey(['status', 'state']);
          const dateKey = findKey(['date', 'waktu', 'tanggal', 'time']);

          const rawStatus = (row[statusKey || ''] || '').toLowerCase();
          let status = 'selesai';
          if (rawStatus.includes('pend') || rawStatus.includes('tunda') || rawStatus.includes('proses')) status = 'pending';
          if (rawStatus.includes('batal') || rawStatus.includes('cancel')) status = 'batal';

          const commAmount = parseFloat((row[commKey || ''] || '0').replace(/[^0-9.]/g, '')) || 0;
          const itemPrice = parseFloat((row[priceKey || ''] || '0').replace(/[^0-9.]/g, '')) || 0;

          return {
            order_id: row[orderIdKey || ''] || `SHP_IMP_${Date.now()}_${idx}`,
            product_name: row[productKey || ''] || 'Produk Shopee',
            shop_name: row[shopKey || ''] || 'Toko Shopee',
            item_price: itemPrice,
            quantity: 1,
            commission_rate: itemPrice > 0 ? (commAmount / itemPrice) * 100 : 5,
            commission_amount: commAmount,
            status,
            source: 'ads',
            tag: 'CSV Import',
            order_date: row[dateKey || ''] ? new Date(row[dateKey || '']).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          };
        });

        setMappedOrders(mapped);
      },
      error: (err) => {
        setErrorMsg(`Gagal membaca file CSV: ${err.message}`);
      }
    });
  };

  const handleSaveImport = async () => {
    if (!mappedOrders.length) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: mappedOrders }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessCount(data.count);
        setMappedOrders([]);
        setFile(null);
      } else {
        setErrorMsg(data.error || 'Gagal menyimpan data import');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Upload size={20} className="text-emerald-400" />
            <h1 className="text-2xl font-bold">Import CSV Shopee Affiliate</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Upload file export CSV komisi dari dashboard Shopee Affiliate untuk langsung diproses &amp; dihitung ke analitik.
          </p>
        </div>

        <a
          href="/shopee_sample_report.csv"
          download="shopee_sample_report.csv"
          className="apple-btn-secondary text-xs shrink-0 inline-flex items-center gap-2"
        >
          <FileSpreadsheet size={14} className="text-emerald-400" />
          <span>Download Contoh File CSV Shopee</span>
        </a>
      </div>

      {successCount !== null && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
          <Check size={20} />
          <div>
            <p className="font-bold">Import Berhasil!</p>
            <p className="text-xs">Berhasil mengimpor {successCount} pesanan Shopee Affiliate ke database.</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
          <AlertCircle size={20} />
          <div>
            <p className="font-bold">Import Gagal</p>
            <p className="text-xs">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="card border-dashed border-2 border-slate-700 hover:border-emerald-400 transition-colors p-8 text-center cursor-pointer relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <FileSpreadsheet size={48} className="mx-auto text-emerald-400 mb-3" />
        <h3 className="text-base font-semibold text-white mb-1">
          {file ? file.name : 'Pilih atau Drop File CSV Export Shopee'}
        </h3>
        <p className="text-xs text-slate-400">
          Format didukung: CSV standar export Shopee Affiliate (.csv)
        </p>
      </div>

      {/* Preview Table */}
      {mappedOrders.length > 0 && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Preview Data Parsed ({mappedOrders.length} Pesanan)
            </h3>
            <button
              onClick={handleSaveImport}
              disabled={loading}
              className="btn-primary text-xs flex items-center gap-1"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <><Check size={14} /> Simpan Import Data</>}
            </button>
          </div>

          <div className="table-container max-h-[400px] overflow-y-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Produk</th>
                  <th>Toko</th>
                  <th>Harga</th>
                  <th>Komisi</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {mappedOrders.slice(0, 15).map((o, idx) => (
                  <tr key={idx}>
                    <td><span className="font-mono text-xs text-slate-400">{o.order_id}</span></td>
                    <td><span className="text-white text-xs truncate max-w-[200px] block">{o.product_name}</span></td>
                    <td><span className="text-xs text-slate-400">{o.shop_name}</span></td>
                    <td><span className="font-mono text-xs">{formatIDR(o.item_price)}</span></td>
                    <td><span className="font-mono text-xs text-emerald-400 font-bold">{formatIDR(o.commission_amount)}</span></td>
                    <td><span className="badge badge-success text-[10px]">{o.status}</span></td>
                    <td><span className="text-xs text-slate-400">{o.order_date}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mappedOrders.length > 15 && (
            <p className="text-xs text-slate-400 text-center">Menampilkan 15 dari {mappedOrders.length} baris data...</p>
          )}
        </div>
      )}
    </div>
  );
}
