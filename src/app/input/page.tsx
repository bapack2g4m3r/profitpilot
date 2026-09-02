'use client';

import { useState } from 'react';
import { PenLine, Target, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { formatIDR } from '@/lib/utils';

export default function InputPage() {
  const [activeTab, setActiveTab] = useState<'ad_spend' | 'order'>('ad_spend');

  // Ad Spend Form State
  const [spendDate, setSpendDate] = useState(new Date().toISOString().split('T')[0]);
  const [spendAmount, setSpendAmount] = useState('');

  // Order Form State
  const [orderId, setOrderId] = useState('');
  const [productName, setProductName] = useState('');
  const [shopName, setShopName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [commAmount, setCommAmount] = useState('');
  const [status, setStatus] = useState('selesai');
  const [source, setSource] = useState('ads');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmitAdSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ad_spend', date: spendDate, spend: spendAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Biaya iklan berhasil dicatat!', type: 'success' });
        setSpendAmount('');
      } else {
        setMessage({ text: data.error || 'Gagal menyimpan ad spend', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Kesalahan koneksi jaringan.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          order_id: orderId,
          product_name: productName,
          shop_name: shopName,
          item_price: itemPrice,
          commission_amount: commAmount,
          status,
          source,
          order_date: orderDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Order manual berhasil ditambahkan!', type: 'success' });
        setOrderId('');
        setProductName('');
        setCommAmount('');
      } else {
        setMessage({ text: data.error || 'Gagal menyimpan order', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Kesalahan koneksi jaringan.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <PenLine size={20} className="text-emerald-400" />
          <h1 className="text-2xl font-bold">Input Data Manual</h1>
        </div>
        <p className="text-sm text-slate-400">
          Catat ad spend harian Meta Ads secara manual atau tambah pesanan komisi Shopee Affiliate satu per satu.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-semibold">{message.text}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('ad_spend')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'ad_spend' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target size={14} /> Biaya Iklan Harian (Ad Spend)
        </button>
        <button
          onClick={() => setActiveTab('order')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'order' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingCart size={14} /> Order Shopee Single
        </button>
      </div>

      {activeTab === 'ad_spend' ? (
        <div className="card space-y-4">
          <h3 className="text-sm font-bold uppercase text-white">Input Biaya Iklan Harian Meta Ads</h3>
          <form onSubmit={handleSubmitAdSpend} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tanggal *</label>
              <input
                type="date"
                value={spendDate}
                onChange={(e) => setSpendDate(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Total Biaya Iklan Hari Ini (IDR) *</label>
              <input
                type="number"
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                placeholder="misal: 150000"
                required
                className="input-field font-mono text-red-400 font-bold"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-xs justify-center">
              {loading ? 'Menyimpan...' : 'Simpan Biaya Iklan'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card space-y-4">
          <h3 className="text-sm font-bold uppercase text-white">Tambah Order Shopee Manual</h3>
          <form onSubmit={handleSubmitOrder} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Order ID</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="SHP123456"
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tanggal Order *</label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Nama Produk *</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Serum Brightening 30ml"
                required
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Toko</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Beauty Store"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Harga Produk (IDR)</label>
                <input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="89000"
                  className="input-field font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Komisi (IDR) *</label>
                <input
                  type="number"
                  value={commAmount}
                  onChange={(e) => setCommAmount(e.target.value)}
                  placeholder="7500"
                  required
                  className="input-field font-mono text-emerald-400 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field">
                  <option value="selesai">Selesai</option>
                  <option value="pending">Pending</option>
                  <option value="batal">Batal</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Sumber Traffic</label>
                <select value={source} onChange={(e) => setSource(e.target.value)} className="select-field">
                  <option value="ads">Meta Ads</option>
                  <option value="organic">Organik</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-xs justify-center pt-2">
              {loading ? 'Menyimpan...' : 'Simpan Order Shopee'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
