import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Bus, AlertTriangle, Clock, CheckCircle, TrendingUp, RefreshCw, Zap, ArrowUpRight, Activity } from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'];

const chartTooltipStyle = {
  background: 'rgba(13, 19, 33, 0.95)',
  border: '1px solid rgba(99, 102, 241, 0.15)',
  borderRadius: '14px',
  color: '#f1f5f9',
  boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
  fontSize: '12px',
  padding: '10px 14px',
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.getStats });
  const generateMut = useMutation({
    mutationFn: dashboardApi.generateForecasts,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  const stats = data?.data;

  const metricCards = [
    { label: 'Total Buses', value: stats?.totalBuses || 0, icon: Bus, color: '#818cf8', colorEnd: '#c7d2fe', bg: 'rgba(99,102,241,0.08)', glow: 'rgba(99,102,241,0.15)', change: '+12%' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: AlertTriangle, color: '#fb7185', colorEnd: '#fda4af', bg: 'rgba(244,63,94,0.08)', glow: 'rgba(244,63,94,0.15)', change: '-3%' },
    { label: 'Due Soon', value: stats?.dueSoon || 0, icon: Clock, color: '#fbbf24', colorEnd: '#fde68a', bg: 'rgba(245,158,11,0.08)', glow: 'rgba(245,158,11,0.15)', change: '+5%' },
    { label: 'Healthy', value: stats?.healthy || 0, icon: CheckCircle, color: '#34d399', colorEnd: '#6ee7b7', bg: 'rgba(16,185,129,0.08)', glow: 'rgba(16,185,129,0.15)', change: '+8%' },
  ];

  const serviceDistData = stats?.serviceDistribution
    ? Object.entries(stats.serviceDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const forecastTimeline = stats?.forecastTimeline || [];
  const partsDemand = stats?.partsDemand || [];

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent)', filter: 'blur(20px)' }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Fleet health overview & predictive analytics</p>
        </div>
        <button onClick={() => generateMut.mutate()} disabled={generateMut.isPending}
          className="btn-glow flex items-center gap-2.5">
          <RefreshCw className={`w-4 h-4 ${generateMut.isPending ? 'animate-spin' : ''}`} />
          Generate Forecasts
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map(({ label, value, icon: Icon, color, colorEnd, bg, glow, change }) => (
          <div key={label} className="metric-card" style={{ '--metric-color': color, '--metric-color-end': colorEnd, '--metric-bg': bg, '--metric-glow': glow }}>
            <div className="flex items-start justify-between mb-4">
              <div className="metric-icon">
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: change.startsWith('+') ? '#34d399' : '#fb7185' }}>
                <ArrowUpRight className="w-3 h-3" />
                {change}
              </div>
            </div>
            <p className="metric-value">{value}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider mt-2" style={{ color: '#334155' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast timeline */}
        <div className="glass-card p-6">
          <div className="section-header mb-5" style={{ '--dot-color': '#6366f1' }}>
            <div className="dot" />
            Maintenance Forecast Timeline
          </div>
          {forecastTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={forecastTimeline}>
                <defs>
                  <linearGradient id="urgencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
                <XAxis dataKey="busAlias" tick={{ fill: '#334155', fontSize: 11 }} axisLine={{ stroke: 'rgba(99,102,241,0.06)' }} />
                <YAxis tick={{ fill: '#334155', fontSize: 11 }} axisLine={{ stroke: 'rgba(99,102,241,0.06)' }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="urgencyScore" stroke="#6366f1" fill="url(#urgencyGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                <Bar dataKey="dueInDays" fill="rgba(6,182,212,0.4)" radius={[4, 4, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><TrendingUp className="w-6 h-6 text-indigo-500/50" /></div>
              <p className="text-sm font-medium text-slate-500">No forecast data</p>
              <p className="text-xs text-slate-700 mt-1">Click Generate Forecasts to see predictions</p>
            </div>
          )}
        </div>

        {/* Parts demand */}
        <div className="glass-card p-6">
          <div className="section-header mb-5" style={{ '--dot-color': '#06b6d4' }}>
            <div className="dot" />
            Parts Demand Forecast
          </div>
          {partsDemand.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={partsDemand} layout="vertical">
                <defs>
                  <linearGradient id="partsGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
                <XAxis type="number" tick={{ fill: '#334155', fontSize: 11 }} axisLine={{ stroke: 'rgba(99,102,241,0.06)' }} />
                <YAxis dataKey="partNumber" type="category" width={100} tick={{ fill: '#475569', fontSize: 11 }} axisLine={{ stroke: 'rgba(99,102,241,0.06)' }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="quantity" fill="url(#partsGrad)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Activity className="w-6 h-6 text-cyan-500/50" /></div>
              <p className="text-sm font-medium text-slate-500">No parts forecast</p>
              <p className="text-xs text-slate-700 mt-1">Parts demand will appear after forecast generation</p>
            </div>
          )}
        </div>
      </div>

      {/* Service distribution */}
      <div className="glass-card p-6">
        <div className="section-header mb-5" style={{ '--dot-color': '#f59e0b' }}>
          <div className="dot" />
          Service Distribution
        </div>
        {serviceDistData.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={serviceDistData} cx="50%" cy="50%" outerRadius={110} innerRadius={70}
                    dataKey="value" paddingAngle={4} strokeWidth={0}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {serviceDistData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {serviceDistData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-slate-400 flex-1">{s.name}</span>
                  <span className="text-sm font-bold text-slate-200">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><Zap className="w-6 h-6 text-amber-500/50" /></div>
            <p className="text-sm font-medium text-slate-500">No service data</p>
            <p className="text-xs text-slate-700 mt-1">Service distribution appears after adding maintenance records</p>
          </div>
        )}
      </div>
    </div>
  );
}
