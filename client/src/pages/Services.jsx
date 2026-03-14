import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { servicesApi } from '../api/client';
import Modal from '../components/Modal';
import PageContainer from '../components/ui/PageContainer';
import DashboardCard from '../components/ui/DashboardCard';
import DataTable from '../components/ui/DataTable';
import FormField from '../components/ui/FormField';
import StatusBadge from '../components/ui/StatusBadge';

const emptyService = {
  name: '',
  description: '',
  severityWeight: 1,
  includes: [],
};

function getSeverityVariant(weight) {
  if (weight >= 4) return 'danger';
  if (weight >= 3) return 'orange';
  if (weight >= 2) return 'warning';
  return 'success';
}

export default function Services() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [includesInput, setIncludesInput] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['services'], queryFn: servicesApi.getAll });

  const createMutation = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => servicesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: servicesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const rows = (data?.data || []).filter((service) =>
    service.name?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingService(null);
    setForm(emptyService);
    setIncludesInput('');
    setIsModalOpen(true);
  }

  function openEdit(service) {
    setEditingService(service);
    setForm({ ...service });
    setIncludesInput((service.includes || []).join(', '));
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingService(null);
    setForm(emptyService);
    setIncludesInput('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      includes: includesInput
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService._id, payload });
      return;
    }

    createMutation.mutate(payload);
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    {
      key: 'severityWeight',
      header: 'Severity',
      render: (row) => <StatusBadge value={`Weight ${row.severityWeight || 0}`} variant={getSeverityVariant(row.severityWeight || 0)} />,
    },
    {
      key: 'includes',
      header: 'Includes',
      render: (row) => (row.includes || []).join(', ') || 'None',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" onClick={() => openEdit(row)}>
            <Pencil size={14} />
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              if (confirm('Delete this service type?')) {
                deleteMutation.mutate(row._id);
              }
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Service Types"
      subtitle="Define service ladders used in maintenance planning"
      actions={
        <button className="btn btn-primary" onClick={openCreate}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Plus size={14} />
            Add Service
          </span>
        </button>
      }
    >
      <DashboardCard>
        <input
          className="search-input"
          placeholder="Search service name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </DashboardCard>

      <DashboardCard>
        {isLoading ? (
          <p className="card-muted">Loading services...</p>
        ) : (
          <DataTable columns={columns} data={rows} emptyText="No service types found" />
        )}
      </DashboardCard>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingService ? 'Edit Service Type' : 'Add Service Type'}>
        <form className="form-stack" onSubmit={handleSubmit}>
          <FormField label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <FormField label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
          <FormField
            label="Severity Weight"
            type="number"
            min={1}
            max={10}
            value={form.severityWeight}
            onChange={(value) => setForm({ ...form, severityWeight: Number(value) })}
          />
          <FormField
            label="Includes (comma-separated)"
            value={includesInput}
            onChange={(value) => setIncludesInput(value)}
            placeholder="A, B, C"
          />
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {editingService ? 'Save Changes' : 'Create Service'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
