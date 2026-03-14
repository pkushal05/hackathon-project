import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partsApi } from '../api/client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import Modal from '../components/Modal';

const emptyPart = { partNumber: '', name: '', category: '', manufacturer: '', unit: 'each' };

export default function Parts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPart);

  const { data, isLoading } = useQuery({ queryKey: ['parts'], queryFn: partsApi.getAll });
  const createMut = useMutation({ mutationFn: partsApi.create, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['parts'] }); closeModal(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => partsApi.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['parts'] }); closeModal(); } });
  const deleteMut = useMutation({ mutationFn: partsApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parts'] }) });

  const parts = (data?.data || []).filter(p =>
    p.partNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() { setEditing(null); setForm(emptyPart); setModalOpen(true); }
  function openEdit(p) { setEditing(p); setForm({ ...p }); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }
  function handleSubmit(e) {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing._id, data: form });
    else createMut.mutate(form);
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Parts Catalog</h1>
          <p className="page-subtitle">Manage maintenance parts inventory</p>
        </div>
        <button onClick={openCreate} className="btn-glow flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Part
        </button>
      </div>

      <div className="search-bar flex items-center gap-3 px-4 py-3">
        <Search className="w-4 h-4 text-slate-600" />
        <input className="bg-transparent outline-none flex-1 text-sm text-slate-300 placeholder:text-slate-700"
          placeholder="Search parts by number, name, or category…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          </div>
        ) : parts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package className="w-7 h-7 text-indigo-500/40" /></div>
            <p className="text-sm font-semibold text-slate-400 mt-2">No parts found</p>
            <p className="text-xs text-slate-700 mt-1">Add parts to your catalog</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Part Number</th><th>Name</th><th>Category</th><th>Manufacturer</th><th>Unit</th><th></th></tr></thead>
              <tbody>
                {parts.map(p => (
                  <tr key={p._id}>
                    <td><span className="font-mono text-xs font-bold text-indigo-400/80">{p.partNumber}</span></td>
                    <td><span className="font-medium text-slate-200">{p.name}</span></td>
                    <td>{p.category ? <span className="badge badge-info">{p.category}</span> : <span className="text-slate-700">—</span>}</td>
                    <td className="text-slate-400">{p.manufacturer || <span className="text-slate-700">—</span>}</td>
                    <td className="text-slate-500">{p.unit}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="action-btn action-btn-edit"><Pencil className="w-3.5 h-3.5 text-indigo-400/60" /></button>
                        <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(p._id); }} className="action-btn action-btn-delete"><Trash2 className="w-3.5 h-3.5 text-rose-400/60" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Part' : 'Add New Part'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Part Number</label><input className="form-input" required placeholder="OIL-FILTER-01" value={form.partNumber} onChange={e => setForm({ ...form, partNumber: e.target.value })} /></div>
            <div><label className="form-label">Name</label><input className="form-input" required placeholder="Oil Filter" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="form-label">Category</label><input className="form-input" placeholder="Filters" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            <div><label className="form-label">Manufacturer</label><input className="form-input" placeholder="Fleetguard" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} /></div>
          </div>
          <div><label className="form-label">Unit</label><input className="form-input" placeholder="each" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
          <div className="flex gap-3 pt-3">
            <button type="submit" className="btn-glow flex-1">{editing ? 'Save Changes' : 'Create Part'}</button>
            <button type="button" onClick={closeModal} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
