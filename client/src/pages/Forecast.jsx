import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RefreshCw, Trash2 } from 'lucide-react';
import { forecastApi } from '../api/client';
import PageContainer from '../components/ui/PageContainer';
import DashboardCard from '../components/ui/DashboardCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';

function tooltipStyle() {
  return {
    background: '#1e293b',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: '12px',
  };
}

function urgencyVariant(score) {
  if (score >= 80) return 'danger';
  if (score >= 60) return 'orange';
  if (score >= 40) return 'warning';
  return 'success';
}

export default function Forecast() {
  const [windowSize, setWindowSize] = useState('30');
  const [activeTab, setActiveTab] = useState('maintenance');
  const queryClient = useQueryClient();

  const maintenanceQuery = useQuery({
    queryKey: ['forecast-maintenance', windowSize],
    queryFn: () => forecastApi.getMaintenance(windowSize),
  });

  const partsQuery = useQuery({
    queryKey: ['forecast-parts', windowSize],
    queryFn: () => forecastApi.getParts(windowSize),
  });

  const generateMaintenance = useMutation({
    mutationFn: forecastApi.generateMaintenance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forecast-maintenance'] }),
  });

  const generateParts = useMutation({
    mutationFn: forecastApi.generateParts,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forecast-parts'] }),
  });

  const deleteMaintenance = useMutation({
    mutationFn: forecastApi.removeMaintenance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forecast-maintenance'] }),
  });

  const deleteParts = useMutation({
    mutationFn: forecastApi.removeParts,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forecast-parts'] }),
  });

  const maintenanceRows = maintenanceQuery.data?.data || [];
  const partsRows = partsQuery.data?.data || [];

  const chartData = maintenanceRows.slice(0, 14).map((row) => ({
    bus: row.busAlias,
    urgency: row.urgencyScore,
    dueDays: row.dueInDays,
  }));

  const maintenanceColumns = [
    { key: 'busAlias', header: 'Bus' },
    { key: 'serviceType', header: 'Service' },
    {
      key: 'urgencyScore',
      header: 'Urgency',
      render: (row) => <StatusBadge value={`Score ${row.urgencyScore || 0}`} variant={urgencyVariant(row.urgencyScore || 0)} />,
    },
    {
      key: 'dueInDays',
      header: 'Due In',
      render: (row) => `${row.dueInDays || 0} days`,
    },
    {
      key: 'forecastWindow',
      header: 'Window',
      render: (row) => `${row.forecastWindow || 0} days`,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button className="icon-btn" onClick={() => deleteMaintenance.mutate(row._id)}>
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  const partsColumns = [
    { key: 'partNumber', header: 'Part Number' },
    { key: 'quantity', header: 'Quantity' },
    {
      key: 'forecastWindow',
      header: 'Window',
      render: (row) => `${row.forecastWindow || 0} days`,
    },
    {
      key: 'generatedAt',
      header: 'Generated At',
      render: (row) => (row.generatedAt ? new Date(row.generatedAt).toLocaleString() : 'N/A'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button className="icon-btn" onClick={() => deleteParts.mutate(row._id)}>
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <PageContainer
      title="Forecast"
      subtitle="Predictive maintenance and parts demand planning"
      actions={(
        <>
          <select
            className="form-control"
            style={{ width: 130 }}
            value={windowSize}
            onChange={(event) => setWindowSize(event.target.value)}
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={() => {
              generateMaintenance.mutate();
              generateParts.mutate();
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={14} />
              Generate
            </span>
          </button>
        </>
      )}
    >
      <DashboardCard>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="forecast-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="bus" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle()} />
              <Area type="monotone" dataKey="urgency" stroke="#3b82f6" fill="url(#forecast-area)" />
              <Bar dataKey="dueDays" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="card-muted">Generate forecasts to populate the chart.</p>
        )}
      </DashboardCard>

      <DashboardCard>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            className={`btn ${activeTab === 'maintenance' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('maintenance')}
          >
            Maintenance
          </button>
          <button
            className={`btn ${activeTab === 'parts' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('parts')}
          >
            Parts
          </button>
        </div>

        {activeTab === 'maintenance' ? (
          maintenanceQuery.isLoading ? (
            <p className="card-muted">Loading maintenance forecasts...</p>
          ) : (
            <DataTable columns={maintenanceColumns} data={maintenanceRows} emptyText="No maintenance forecasts found" />
          )
        ) : partsQuery.isLoading ? (
          <p className="card-muted">Loading parts forecasts...</p>
        ) : (
          <DataTable columns={partsColumns} data={partsRows} emptyText="No parts forecasts found" />
        )}
      </DashboardCard>
    </PageContainer>
  );
}
