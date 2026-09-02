'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Key, Send, User, Check, Plus, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [metaConfig, setMetaConfig] = useState<any>({ app_id: '', access_token: '', ad_account_id: '' });
  const [telegramConfig, setTelegramConfig] = useState<any>({ bot_token: '', chat_id: '', roas_threshold: '2.0', spend_threshold: '500000' });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New account form
  const [newAccName, setNewAccName] = useState('');
  const [newAccUser, setNewAccUser] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      setMetaConfig(json.meta || {});
      setTelegramConfig(json.telegram || {});
      setAccounts(json.accounts || []);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'meta', ...metaConfig }),
    });
    const json = await res.json();
    if (res.ok) setMessage({ text: json.message, type: 'success' });
    else setMessage({ text: json.error, type: 'error' });
    fetchSettings();
  };

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'telegram', ...telegramConfig }),
    });
    const json = await res.json();
    if (res.ok) setMessage({ text: json.message, type: 'success' });
    else setMessage({ text: json.error, type: 'error' });
    fetchSettings();
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccUser) return;
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'add_account', account_name: newAccName, account_username: newAccUser }),
    });
    setNewAccName('');
    setNewAccUser('');
    fetchSettings();
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings size={20} className="text-emerald-400" />
          <h1 className="text-2xl font-bold">Pengaturan Aplikasi</h1>
        </div>
        <p className="text-sm text-slate-400">
          Kelola koneksi Meta Graph API, notifikasi bot Telegram alert, dan manajemen multi-akun Shopee.
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

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meta Graph API Section */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <Key size={16} className="text-purple-400" /> Koneksi Meta Graph API
              </h3>
              <span className={`badge text-[10px] ${metaConfig.is_connected ? 'badge-success' : 'badge-warning'}`}>
                {metaConfig.is_connected ? '● Terhubung' : '○ Belum Terhubung'}
              </span>
            </div>

            <form onSubmit={handleSaveMeta} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Facebook App ID</label>
                <input
                  type="text"
                  value={metaConfig.app_id || ''}
                  onChange={(e) => setMetaConfig({ ...metaConfig, app_id: e.target.value })}
                  placeholder="1234567890"
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Ad Account ID</label>
                <input
                  type="text"
                  value={metaConfig.ad_account_id || ''}
                  onChange={(e) => setMetaConfig({ ...metaConfig, ad_account_id: e.target.value })}
                  placeholder="act_123456789"
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">User Access Token (Long-Lived)</label>
                <textarea
                  value={metaConfig.access_token || ''}
                  onChange={(e) => setMetaConfig({ ...metaConfig, access_token: e.target.value })}
                  rows={3}
                  placeholder="EAAB..."
                  className="input-field font-mono text-xs"
                />
              </div>
              <button type="submit" className="btn-primary w-full text-xs justify-center">
                Simpan &amp; Uji Koneksi Meta API
              </button>
            </form>
          </div>

          {/* Telegram Notifications Section */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <Send size={16} className="text-blue-400" /> Notifikasi Bot Telegram Alert
              </h3>
              <span className={`badge text-[10px] ${telegramConfig.is_active ? 'badge-success' : 'badge-warning'}`}>
                {telegramConfig.is_active ? '● Aktif' : '○ Non-Aktif'}
              </span>
            </div>

            <form onSubmit={handleSaveTelegram} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Telegram Bot Token</label>
                <input
                  type="text"
                  value={telegramConfig.bot_token || ''}
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, bot_token: e.target.value })}
                  placeholder="123456:ABC-DEF..."
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Telegram Chat ID / Group ID</label>
                <input
                  type="text"
                  value={telegramConfig.chat_id || ''}
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, chat_id: e.target.value })}
                  placeholder="-1001234567"
                  className="input-field font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Alert Jika ROAS &lt;</label>
                  <input
                    type="number"
                    step="0.1"
                    value={telegramConfig.roas_threshold || '2.0'}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, roas_threshold: e.target.value })}
                    className="input-field font-mono text-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Alert Jika Spend &gt;</label>
                  <input
                    type="number"
                    value={telegramConfig.spend_threshold || '500000'}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, spend_threshold: e.target.value })}
                    className="input-field font-mono text-red-400"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full text-xs justify-center">
                Simpan &amp; Kirim Test Alert Telegram
              </button>
            </form>
          </div>

          {/* Multi Account Shopee Section */}
          <div className="lg:col-span-2 card space-y-4">
            <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
              <User size={16} className="text-emerald-400" /> Multi-Akun Shopee Affiliate ({accounts.length} Akun)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={handleAddAccount} className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <p className="text-xs font-bold text-white">Tambah Akun Baru</p>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nama Label Akun</label>
                  <input
                    type="text"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="misal: Akun Fashion / Akun Beauty"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Username Shopee</label>
                  <input
                    type="text"
                    value={newAccUser}
                    onChange={(e) => setNewAccUser(e.target.value)}
                    placeholder="username_shopee"
                    className="input-field"
                    required
                  />
                </div>
                <button type="submit" className="btn-secondary w-full text-xs justify-center">
                  <Plus size={14} /> Tambah Akun
                </button>
              </form>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400">Daftar Akun Terdaftar</p>
                {accounts.map((acc) => (
                  <div key={acc.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-white">{acc.name}</p>
                      <p className="text-xs text-slate-400">@{acc.username}</p>
                    </div>
                    <span className="badge badge-success text-[10px]">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
