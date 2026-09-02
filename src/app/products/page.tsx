'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatIDR, formatNumber } from '@/lib/utils';
import { Tag, Plus, Filter, ExternalLink, Edit2, Check } from 'lucide-react';

interface Product {
  id: number;
  product_id: string;
  name: string;
  shop_name: string;
  tag: string;
  commission_rate: number;
  calc_commission: number;
  order_count: number;
  affiliate_link: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTagValue, setEditTagValue] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newShop, setNewShop] = useState('');
  const [newRate, setNewRate] = useState('7.5');
  const [newTag, setNewTag] = useState('Testing');
  const [newLink, setNewLink] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?tag=${selectedTag}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTag]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateTag = async (id: number, newTag: string) => {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_tag', id, tag: newTag }),
    });
    setEditingId(null);
    fetchProducts();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        name: newName,
        shop_name: newShop,
        commission_rate: parseFloat(newRate),
        tag: newTag,
        affiliate_link: newLink,
      }),
    });
    setShowAddModal(false);
    setNewName('');
    setNewShop('');
    fetchProducts();
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag size={20} className="text-emerald-400" />
            <h1 className="text-2xl font-bold">Tag Product Affiliate</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Kelola tagging produk (Winner, Scale Up, Testing, Dead) untuk analisis performa iklan & komisi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="select-field w-auto" style={{ minWidth: '150px' }}>
            <option value="all">Semua Tag</option>
            <option value="Winner">🔥 Winner</option>
            <option value="Scale Up">🚀 Scale Up</option>
            <option value="Testing">🧪 Testing</option>
            <option value="Dead">💀 Dead</option>
          </select>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs flex items-center gap-1">
            <Plus size={14} /> Tambah Produk
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="card-glow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] text-slate-400">{p.product_id}</span>
                  {editingId === p.id ? (
                    <div className="flex items-center gap-1">
                      <select
                        value={editTagValue}
                        onChange={(e) => setEditTagValue(e.target.value)}
                        className="select-field text-xs py-0.5 px-1 w-auto"
                      >
                        <option value="Winner">Winner</option>
                        <option value="Scale Up">Scale Up</option>
                        <option value="Testing">Testing</option>
                        <option value="Dead">Dead</option>
                        <option value="Potential">Potential</option>
                      </select>
                      <button onClick={() => updateTag(p.id, editTagValue)} className="p-1 text-emerald-400 hover:text-emerald-300">
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className={`badge text-[10px] ${
                        p.tag === 'Winner' ? 'badge-success' :
                        p.tag === 'Scale Up' ? 'badge-purple' :
                        p.tag === 'Testing' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        🏷️ {p.tag || 'Un-tagged'}
                      </span>
                      <button onClick={() => { setEditingId(p.id); setEditTagValue(p.tag || 'Testing'); }} className="text-slate-500 hover:text-slate-300 p-1">
                        <Edit2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{p.shop_name}</p>

                <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Rate Komisi</span>
                    <p className="font-bold text-yellow-400 font-mono">{p.commission_rate}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Total Komisi</span>
                    <p className="font-bold text-emerald-400 font-mono">{formatIDR(p.calc_commission)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span>Total Orders: <strong className="text-white font-mono">{formatNumber(p.order_count)}</strong></span>
                {p.affiliate_link && (
                  <a href={p.affiliate_link} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                    Link <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="card max-w-md w-full animate-fade-in space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" /> Tambah Produk Baru
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Produk Shopee *</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required className="input-field" placeholder="Serum Brightening 30ml" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Toko Shopee</label>
                <input type="text" value={newShop} onChange={(e) => setNewShop(e.target.value)} className="input-field" placeholder="BeautyGlow Official" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Rate Komisi (%)</label>
                  <input type="number" step="0.1" value={newRate} onChange={(e) => setNewRate(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tag Status</label>
                  <select value={newTag} onChange={(e) => setNewTag(e.target.value)} className="select-field">
                    <option value="Winner">Winner</option>
                    <option value="Scale Up">Scale Up</option>
                    <option value="Testing">Testing</option>
                    <option value="Potential">Potential</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Link Affiliate Shopee (Optional)</label>
                <input type="url" value={newLink} onChange={(e) => setNewLink(e.target.value)} className="input-field" placeholder="https://shope.ee/..." />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-xs">Batal</button>
                <button type="submit" className="btn-primary text-xs">Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
