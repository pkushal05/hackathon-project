import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forecastApi } from '../api/client';
import { useState } from 'react';
import { RefreshCw, Trash2, TrendingUp, Package, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const chartTooltipStyle = {
  background: 'rgba(13, 19, 33, 0.95)',
  border: '1px solid rgba(99, 102, 241, 0.15)',
  borderRadius: '14px',
  color: '#f1f5f9',
  boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
  fontSize: '12px',
  padding: '10px 14px',
};

export default function Forecast() {
  const queryClient = useQueryClient();
  const [window, setWindow] = useState('30');
  const [tab, setTab] = useState('maintenance');

  const { data: mData, isLoading: mLoading } = useQuery({ queryKey: ['forecast-maintenance', window], queryFn: () => forecastApi.getMaintenance(window) });
  const { data: pData, isLoading: pLoading } = useQuery({ queryKey: ['forecast-parts', window], queryFn: () => forecastApi.getParts(window) });

  const genMaint = useMutation({ mutationFn: forecastApi.generateMaintenance, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forecast-maintenance'] }) });
  const genParts = useMutation({ mutationFn: forecastApi.generateParts, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forecast-parts'] }) });
  const delMaint = useMutation({ mutationFn: forecastApi.removeMaintenance, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forecast-maintenance'] }) });
  const delParts = useMutation({ mutationFn: forecastApi.removeParts, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forecast-parts'] }) });

  const maintenanceData = mData?.data || [];
  const partsData = pData?.data || [];

  const chartData = maintenanceData.slice(0, 15).map(f => ({
    bus: f.busAlias,
    urgency: f.urgencyScore,
    dueInDays: f.dueInDays,
  }));

  function getUrgencyBadge(score) {
    if (score >= 80) return <span className="badge badge-critical">{score}</span>;
    if (score >= 60) return <span className="badge badge-warning">{score}</span>;
    if (score >= 40) return <span className="badge" style={{ background: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.12)' }}>{score}</span>;
    return <span className="badge badge-success">{score}</span>;
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Forecast</h1>
          <p className="page-subtitle">Predictive maintenance & parts demand analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="search-bar flex items-center gap-2 px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <select className="bg-transparent text-xs font-semibold outline-none text-slate-400" value={window} onChange={e => setWindow(e.target.value)}>
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>
          <button onClick={() => { genMaint.mutate(); genParts.mutate(); }} disabled={genMaint.isPending}
            className="btn-glow flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${genMaint.isPending ? 'animate-spin' : ''}`} /> Generate
          </button>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="glass-card p-6">
          <div className="section-header mb-5" style={{ '--dot-color': '#6366f1' }}>
            <div className="dot" />
            Urgency Overview
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fcUrgency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
              <XAxis dataKey="bus" tick={{ fill: '#334155', fontSize: 11 }} axisLine={{ stroke: 'rgba(99,102,241,0.06)' }} />
              <YAxis tick={{ fill: '#334155', fontSize: 11 }} axisLine={{ stroke: 'rgba(99,102,241,0.06)' }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="urgency" stroke="#6366f1" fill="url(#fcUrgency)" strokeWidth={2} name="Urgency" />
              <Bar dataKey="dueInDays" fill="rgba(6,182,212,0.3)" radius={[4, 4, 0, 0]} name="Due (days)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('maintenance')} className={`tab-btn ${tab === 'maintenance' ? 'active' : ''}`}>
          <TrendingUp className="w-4 h-4" /> Maintenance <span className="opacity-50">({maintenanceData.length})</span>
        </button>
        <button onClick={() => setTab('parts')} className={`tab-btn ${tab === 'parts' ? 'active' : ''}`}>
          <Package className="w-4 h-4" /> Parts <span className="opacity-50">({partsData.length})</span>
        </button>
      </div>

      {/* Tables */}
      <div className="glass-card overflow-hidden">
        {tab === 'maintenance' ? (
          mLoading ? (
            <div className="flex items-center justify-center h-48"><div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" /></div>
          ) : maintenanceData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><TrendingUp className="w-7 h-7 text-indigo-500/40" /></div>
              <p className="text-sm font-semibold text-slate-400 mt-2">No maintenance forecasts</p>
              <p className="text-xs text-slate-700 mt-1">Click Generate to create predictions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Bus</th><th>Service</th><th>Urgency</th><th>Due In</th><th>Due Date</th><th>Window</th><th></th></tr></thead>
                <tbody>
                  {maintenanceData.map(f => (
                    <tr key={f._id}>
                      <td><span className="font-bold text-slate-200">{f.busAlias}</span></td>
                      <td><span className="badge badge-info">{f.serviceType}</span></td>
                      <td>{getUrgencyBadge(f.urgencyScore)}</td>
                      <td className="font-mono text-xs">{f.dueInDays}d</td>
                      <td className="text-xs text-slate-500">{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</td>
                      <td><span className="text-[11px] font-semibold text-slate-600">{f.forecastWindow}d window</span></td>
                      <td><button onClick={() => delMaint.mutate(f._id)} className="action-btn action-btn-delete"><Trash2 className="w-3.5 h-3.5 text-rose-400/60" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          pLoading ? (
            <div className="flex items-center justify-center h-48"><div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" /></div>
          ) : partsData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Package className="w-7 h-7 text-cyan-500/40" /></div>
              <p className="text-sm font-semibold text-slate-400 mt-2">No parts forecasts</p>
              <p className="text-xs text-slate-700 mt-1">Parts demand appears after generating forecasts</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Part Number</th><th>Quantity</th><th>Window</th><th>Generated</th><th></th></tr></thead>
                <tbody>
                  {partsData.map(p => (
                    <tr key={p._id}>
                      <td><span className="font-mono text-xs font-bold text-cyan-400/80">{p.partNumber}</span></td>
                      <td><span className="text-xl font-extrabold" style={{ background: 'linear-gradient(135deg, #22d3ee, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{p.quantity}</span></td>
                      <td><span className="text-[11px] font-semibold text-slate-600">{p.forecastWindow}d window</span></td>
                      <td className="text-xs text-slate-600">{p.generatedAt ? new Date(p.generatedAt).toLocaleString() : '—'}</td>
                      <td><button onClick={() => delParts.mutate(p._id)} className="action-btn action-btn-delete"><Trash2 className="w-3.5 h-3.5 text-rose-400/60" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
