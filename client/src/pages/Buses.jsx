import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { busesApi } from '../api/client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Bus as BusIcon } from 'lucide-react';
import Modal from '../components/Modal';

const emptyBus = { busNumber: '', alias: '', manufacturer: '', model: '', year: '', garage: '', status: 'Active' };

export default function Buses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBus);

  const { data, isLoading } = useQuery({ queryKey: ['buses'], queryFn: busesApi.getAll });
  const createMut = useMutation({ mutationFn: busesApi.create, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['buses'] }); closeModal(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => busesApi.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['buses'] }); closeModal(); } });
  const deleteMut = useMutation({ mutationFn: busesApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buses'] }) });

  const buses = (data?.data || []).filter(b =>
    b.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
    b.alias?.toLowerCase().includes(search.toLowerCase()) ||
    b.manufacturer?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() { setEditing(null); setForm(emptyBus); setModalOpen(true); }
  function openEdit(bus) { setEditing(bus); setForm({ ...bus }); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); setForm(emptyBus); }
  function handleSubmit(e) {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing._id, data: form });
    else createMut.mutate(form);
  }

  const statusColors = {
    Active: 'badge-success',
    Inactive: 'badge-warning',
    Maintenance: 'badge-critical',
    Retired: 'badge-info',
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Buses</h1>
          <p className="page-subtitle">Manage your fleet inventory</p>
        </div>
        <button onClick={openCreate} className="btn-glow flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Bus
        </button>
      </div>

      {/* Search */}
      <div className="search-bar flex items-center gap-3 px-4 py-3">
        <Search className="w-4 h-4 text-slate-600" />
        <input className="bg-transparent outline-none flex-1 text-sm text-slate-300 placeholder:text-slate-700"
          placeholder="Search by number, alias, or manufacturer..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && (
          <span className="text-[11px] font-semibold text-slate-600">{buses.length} results</span>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          </div>
        ) : buses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><BusIcon className="w-7 h-7 text-indigo-500/40" /></div>
            <p className="text-sm font-semibold text-slate-400 mt-2">No buses found</p>
            <p className="text-xs text-slate-700 mt-1">Add a bus to start managing your fleet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Bus Number</th><th>Alias</th><th>Manufacturer</th><th>Model</th><th>Year</th><th>Garage</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {buses.map(bus => (
                  <tr key={bus._id}>
                    <td><span className="font-bold text-slate-200">{bus.busNumber}</span></td>
                    <td><span className="font-mono text-xs text-indigo-400/70">{bus.alias}</span></td>
                    <td>{bus.manufacturer || <span className="text-slate-700">—</span>}</td>
                    <td>{bus.model || <span className="text-slate-700">—</span>}</td>
                    <td>{bus.year || <span className="text-slate-700">—</span>}</td>
                    <td>{bus.garage || <span className="text-slate-700">—</span>}</td>
                    <td><span className={`badge ${statusColors[bus.status] || 'badge-info'}`}>{bus.status}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(bus)} className="action-btn action-btn-edit">
                          <Pencil className="w-3.5 h-3.5 text-indigo-400/60" />
                        </button>
                        <button onClick={() => { if (confirm('Delete this bus?')) deleteMut.mutate(bus._id); }} className="action-btn action-btn-delete">
                          <Trash2 className="w-3.5 h-3.5 text-rose-400/60" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Bus' : 'Add New Bus'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Bus Number</label><input className="form-input" required placeholder="e.g. 1001" value={form.busNumber} onChange={e => setForm({ ...form, busNumber: e.target.value })} /></div>
            <div><label className="form-label">Alias</label><input className="form-input" required placeholder="e.g. BUS-1001" value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} /></div>
            <div><label className="form-label">Manufacturer</label><input className="form-input" placeholder="e.g. Nova Bus" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} /></div>
            <div><label className="form-label">Model</label><input className="form-input" placeholder="e.g. LFS" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
            <div><label className="form-label">Year</label><input className="form-input" type="number" placeholder="2024" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></div>
            <div><label className="form-label">Garage</label><input className="form-input" placeholder="e.g. Central" value={form.garage} onChange={e => setForm({ ...form, garage: e.target.value })} /></div>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="Active">Active</option><option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option><option value="Retired">Retired</option>
            </select>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="submit" className="btn-glow flex-1">{editing ? 'Save Changes' : 'Create Bus'}</button>
            <button type="button" onClick={closeModal} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
