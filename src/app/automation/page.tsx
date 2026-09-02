'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bot, Play, Pause, Zap, Shield, Plus, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Rule {
  id: number;
  rule_name: string;
  rule_type: string;
  is_active: number;
  last_triggered: string;
  conditions: string;
}

interface Log {
  id: number;
  rule_name: string;
  action_taken: string;
  details: string;
  status: string;
  executed_at: string;
}

export default function AutomationPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchAutomationData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/automation');
      const data = await res.json();
      setRules(data.rules || []);
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch automation data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAutomationData();
  }, [fetchAutomationData]);

  const toggleRule = async (id: number, currentStatus: number) => {
    await fetch('/api/automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id, is_active: !currentStatus }),
    });
    fetchAutomationData();
  };

  const handleRunNow = async (ruleId: number) => {
    setRunning(true);
    try {
      await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_now', id: ruleId }),
      });
      fetchAutomationData();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot size={20} className="text-purple-400" />
            <h1 className="text-2xl font-bold">Robot Automasi Meta 24/7</h1>
            <span className="badge badge-purple text-[10px]">BETA PRO</span>
          </div>
          <p className="text-sm text-slate-400">
            Set rule otomatis untuk mematikan iklan rugi (ROAS &lt; target), menaikkan budget iklan pemenang, atau jadwal matikan malam.
          </p>
        </div>

        <button
          onClick={() => handleRunNow(1)}
          disabled={running}
          className="btn-primary text-xs flex items-center gap-2"
        >
          <Zap size={14} className={running ? 'animate-spin' : ''} />
          {running ? 'Mengeksekusi Robot...' : 'Jalankan Evaluasi Robot Sekarang'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Rules Section */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Shield size={16} className="text-emerald-400" /> Rule Automasi Aktif ({rules.length})
              </h3>
            </div>

            {rules.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                Belum ada rule automasi yang dibuat.
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${rule.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                      <div>
                        <p className="font-semibold text-sm text-white">{rule.rule_name}</p>
                        <p className="text-xs text-slate-400">Tipe: <span className="text-purple-400 font-mono">{rule.rule_type}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRunNow(rule.id)}
                        className="btn-secondary text-xs px-2.5 py-1"
                      >
                        <Zap size={12} /> Test Rule
                      </button>
                      <button
                        onClick={() => toggleRule(rule.id, rule.is_active)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                          rule.is_active ? 'btn-danger' : 'btn-primary'
                        }`}
                      >
                        {rule.is_active ? <><Pause size={12} /> Matikan</> : <><Play size={12} /> Aktifkan</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logs Section */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Log Aktivitas Eksekusi Robot</h3>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Waktu Exec</th>
                    <th>Nama Rule</th>
                    <th>Aksi Dijalankan</th>
                    <th>Detail Status</th>
                    <th>Hasil</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-400 py-6">Belum ada riwayat aktivitas robot.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td><span className="font-mono text-xs text-slate-400">{log.executed_at}</span></td>
                        <td><span className="text-white text-xs font-medium">{log.rule_name || 'System Rule'}</span></td>
                        <td><span className="badge badge-purple text-[10px]">{log.action_taken}</span></td>
                        <td><span className="text-xs text-slate-300">{log.details}</span></td>
                        <td>
                          <span className="badge badge-success text-[10px] flex items-center gap-1">
                            <CheckCircle2 size={10} /> Success
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
