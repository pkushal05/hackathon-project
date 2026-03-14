import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { partsApi } from '../api/client';
import Modal from '../components/Modal';
import PageContainer from '../components/ui/PageContainer';
import DashboardCard from '../components/ui/DashboardCard';
import DataTable from '../components/ui/DataTable';
import FormField from '../components/ui/FormField';

const emptyPart = {
  partNumber: '',
  name: '',
  category: '',
  manufacturer: '',
  unit: 'each',
};

export default function Parts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [form, setForm] = useState(emptyPart);

  const { data, isLoading } = useQuery({ queryKey: ['parts'], queryFn: partsApi.getAll });

  const createMutation = useMutation({
    mutationFn: partsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => partsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: partsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parts'] }),
  });

  const rows = (data?.data || []).filter((item) => {
    const q = search.toLowerCase();
    return (
      item.partNumber?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  function openCreate() {
    setEditingPart(null);
    setForm(emptyPart);
    setIsModalOpen(true);
  }

  function openEdit(part) {
    setEditingPart(part);
    setForm({ ...part });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingPart(null);
    setForm(emptyPart);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (editingPart) {
      updateMutation.mutate({ id: editingPart._id, payload: form });
      return;
    }
    createMutation.mutate(form);
  }

  const columns = [
    { key: 'partNumber', header: 'Part Number' },
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'manufacturer', header: 'Manufacturer' },
    { key: 'unit', header: 'Unit' },
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
              if (confirm('Delete this part?')) {
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
      title="Parts"
      subtitle="Parts catalog and procurement planning"
      actions={
        <button className="btn btn-primary" onClick={openCreate}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Plus size={14} />
            Add Part
          </span>
        </button>
      }
    >
      <DashboardCard>
        <input
          className="search-input"
          placeholder="Search by part number, name, or category"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </DashboardCard>

      <DashboardCard>
        {isLoading ? (
          <p className="card-muted">Loading parts...</p>
        ) : (
          <DataTable columns={columns} data={rows} emptyText="No parts available" />
        )}
      </DashboardCard>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPart ? 'Edit Part' : 'Add Part'}>
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormField label="Part Number" value={form.partNumber} onChange={(value) => setForm({ ...form, partNumber: value })} required />
            <FormField label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <FormField label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
            <FormField label="Manufacturer" value={form.manufacturer} onChange={(value) => setForm({ ...form, manufacturer: value })} />
          </div>
          <FormField label="Unit" value={form.unit} onChange={(value) => setForm({ ...form, unit: value })} />
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {editingPart ? 'Save Changes' : 'Create Part'}
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
