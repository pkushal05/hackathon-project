import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { dashboardApi } from '../api/client';
import PageContainer from '../components/ui/PageContainer';
import DashboardCard from '../components/ui/DashboardCard';
import SectionHeader from '../components/ui/SectionHeader';

const PIE_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'];

function tooltipStyle() {
  return {
    background: '#1e293b',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: '12px',
  };
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.getStats });

  const generateMutation = useMutation({
    mutationFn: dashboardApi.generateForecasts,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  const stats = data?.data || {};

  const cards = [
    { label: 'Total Buses', value: stats.totalBuses || 0, color: '#3b82f6' },
    { label: 'Overdue Buses', value: stats.overdue || 0, color: '#ef4444' },
    { label: 'Due Soon Buses', value: stats.dueSoon || 0, color: '#f97316' },
    { label: 'Healthy Buses', value: stats.healthy || 0, color: '#22c55e' },
  ];

  const serviceDistribution = stats.serviceDistribution
    ? Object.entries(stats.serviceDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const forecastData = stats.forecastTimeline || [];
  const partsDemandData = stats.partsDemand || [];

  return (
    <PageContainer
      title="Operations Dashboard"
      subtitle="Live fleet health and maintenance intelligence"
      actions={(
        <button
          className="btn btn-primary"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={14} className={generateMutation.isPending ? 'animate-spin' : ''} />
            Regenerate Forecasts
          </span>
        </button>
      )}
    >
      <section className="dashboard-grid-4">
        {cards.map((card) => (
          <DashboardCard key={card.label}>
            <p className="metric-label">{card.label}</p>
            <p className="metric-value" style={{ color: card.color }}>
              {card.value}
            </p>
          </DashboardCard>
        ))}
      </section>

      <section className="dashboard-grid-2">
        <DashboardCard>
          <SectionHeader title="Maintenance Forecast Chart" />
          {isLoading ? (
            <p className="card-muted">Loading forecast timeline...</p>
          ) : forecastData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="urgency-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="busAlias" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle()} />
                <Area type="monotone" dataKey="urgencyScore" stroke="#3b82f6" fill="url(#urgency-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="card-muted">No forecast data available yet.</p>
          )}
        </DashboardCard>

        <DashboardCard>
          <SectionHeader title="Parts Demand Chart" />
          {isLoading ? (
            <p className="card-muted">Loading parts demand...</p>
          ) : partsDemandData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={partsDemandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="partNumber" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle()} />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="card-muted">No parts demand has been generated.</p>
          )}
        </DashboardCard>
      </section>

      <DashboardCard>
        <SectionHeader title="Service Distribution" />
        {!serviceDistribution.length ? (
          <p className="card-muted">No service distribution data available.</p>
        ) : (
          <div className="dashboard-grid-2">
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={serviceDistribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105}>
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle()} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
              {serviceDistribution.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="dot" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span style={{ flex: 1 }}>{entry.name}</span>
                  <strong>{entry.value}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardCard>
    </PageContainer>
  );
}
