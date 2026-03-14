import { useState } from 'react';
import { Save, Globe, Gauge, Database, Info, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    gtfsFeedUrl: '',
    plannedMonthlyDistance: 5000,
    refreshInterval: 30,
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    localStorage.setItem('fleetpulse_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const sections = [
    {
      icon: Globe, title: 'GTFS-Realtime Feed', desc: 'Vehicle positions data source',
      color: '#6366f1', bg: 'rgba(99,102,241,0.06)',
      content: (
        <div className="space-y-6 mt-2">
          <div>
            <label className="form-label">Feed URL</label>
            <input className="form-input font-mono text-xs" placeholder="https://cdn.mbta.com/realtime/VehiclePositions.pb"
              value={settings.gtfsFeedUrl} onChange={e => setSettings({ ...settings, gtfsFeedUrl: e.target.value })} />
            <p className="text-[11px] text-slate-700 mt-3 leading-relaxed">
              Configure via <span className="font-mono text-indigo-500/60">GTFS_FEED_URL</span> in <span className="font-mono text-indigo-500/60">server/.env</span> for backend.
              Currently set to MBTA (Boston) feed.
            </p>
          </div>
          <div>
            <label className="form-label">Auto-Refresh Interval (seconds)</label>
            <input className="form-input" type="number" min="5" max="120" value={settings.refreshInterval}
              onChange={e => setSettings({ ...settings, refreshInterval: +e.target.value })} />
          </div>
        </div>
      ),
    },
    {
      icon: Gauge, title: 'Forecast Parameters', desc: 'Prediction engine configuration',
      color: '#06b6d4', bg: 'rgba(6,182,212,0.06)',
      content: (
        <div className="mt-2">
          <label className="form-label">Planned Monthly Distance (km)</label>
          <input className="form-input" type="number" min="100" value={settings.plannedMonthlyDistance}
            onChange={e => setSettings({ ...settings, plannedMonthlyDistance: +e.target.value })} />
          <p className="text-[11px] text-slate-700 mt-3">
            Used to calculate <span className="font-mono text-cyan-500/60">avgDailyKm</span> for maintenance forecasting
          </p>
        </div>
      ),
    },
    {
      icon: Database, title: 'Database', desc: 'MongoDB Atlas connection',
      color: '#10b981', bg: 'rgba(16,185,129,0.06)',
      content: (
        <div className="flex items-center gap-4 p-5 rounded-xl mt-2" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.08)' }}>
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-50" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-400/80">Connected</p>
            <p className="text-[11px] text-slate-700 mt-1">Configure <span className="font-mono text-emerald-500/50">MONGO_URI</span> in server/.env</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure application preferences and integrations</p>
      </div>

      {sections.map(({ icon: Icon, title, desc, color, bg, content }) => (
        <div key={title} className="glass-card p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: bg, boxShadow: `0 0 20px ${bg}` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-200">{title}</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">{desc}</p>
            </div>
          </div>
          <div className="mt-6">{content}</div>
        </div>
      ))}

      {/* App Info */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.06)' }}>
            <Info className="w-5 h-5 text-amber-500/70" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-200">Application Info</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">FleetPulse DRT v1.0.0</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Platform', value: 'MERN Stack' },
            { label: 'Frontend', value: 'React + Vite' },
            { label: 'Backend', value: 'Express + Mongoose' },
            { label: 'Database', value: 'MongoDB Atlas' },
            { label: 'UI Framework', value: 'TailwindCSS v4' },
            { label: 'Charts', value: 'Recharts' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.02)', border: '1px solid rgba(99,102,241,0.04)' }}>
              <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">{label}</span>
              <span className="text-xs text-slate-400">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className={`btn-glow flex items-center gap-2.5 ${saved ? 'opacity-80' : ''}`}>
        {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? 'Saved Successfully' : 'Save Settings'}
      </button>
    </div>
  );
}
