import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../api/client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Layers } from 'lucide-react';
import Modal from '../components/Modal';

const emptyService = { name: '', description: '', severityWeight: 1, includes: [] };

export default function Services() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [includesInput, setIncludesInput] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['services'], queryFn: servicesApi.getAll });
  const createMut = useMutation({ mutationFn: servicesApi.create, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); closeModal(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => servicesApi.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); closeModal(); } });
  const deleteMut = useMutation({ mutationFn: servicesApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }) });

  const services = (data?.data || []).filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  function openCreate() { setEditing(null); setForm(emptyService); setIncludesInput(''); setModalOpen(true); }
  function openEdit(s) { setEditing(s); setForm({ ...s }); setIncludesInput(s.includes?.join(', ') || ''); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }
  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, includes: includesInput.split(',').map(s => s.trim()).filter(Boolean) };
    if (editing) updateMut.mutate({ id: editing._id, data: payload });
    else createMut.mutate(payload);
  }

  const severityBadge = (w) => {
    if (w >= 4) return 'badge-critical';
    if (w >= 3) return 'badge-warning';
    if (w >= 2) return 'badge-info';
    return 'badge-success';
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Service Types</h1>
          <p className="page-subtitle">Define maintenance service levels and hierarchies</p>
        </div>
        <button onClick={openCreate} className="btn-glow flex items-center gap-2"><Plus className="w-4 h-4" /> Add Service</button>
      </div>

      <div className="search-bar flex items-center gap-3 px-4 py-3">
        <Search className="w-4 h-4 text-slate-600" />
        <input className="bg-transparent outline-none flex-1 text-sm text-slate-300 placeholder:text-slate-700"
          placeholder="Search services…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Layers className="w-7 h-7 text-indigo-500/40" /></div>
            <p className="text-sm font-semibold text-slate-400 mt-2">No service types defined</p>
            <p className="text-xs text-slate-700 mt-1">Define A, B, C, D service levels</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Description</th><th>Severity</th><th>Includes</th><th></th></tr></thead>
              <tbody>
                {services.map(s => (
                  <tr key={s._id}>
                    <td>
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg"
                        style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8' }}>
                        {s.name}
                      </span>
                    </td>
                    <td className="text-slate-400">{s.description || <span className="text-slate-700">—</span>}</td>
                    <td><span className={`badge ${severityBadge(s.severityWeight)}`}>Weight {s.severityWeight}</span></td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        {(s.includes || []).map((inc, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: 'rgba(6,182,212,0.06)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.1)' }}>{inc}</span>
                        ))}
                        {(!s.includes || s.includes.length === 0) && <span className="text-slate-700 text-xs">None</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="action-btn action-btn-edit"><Pencil className="w-3.5 h-3.5 text-indigo-400/60" /></button>
                        <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(s._id); }} className="action-btn action-btn-delete"><Trash2 className="w-3.5 h-3.5 text-rose-400/60" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Service Type' : 'Add Service Type'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="form-label">Name</label><input className="form-input" required placeholder="e.g. D" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="form-label">Description</label><input className="form-input" placeholder="Major overhaul" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="form-label">Severity Weight (1–10)</label><input className="form-input" type="number" min="1" max="10" value={form.severityWeight} onChange={e => setForm({ ...form, severityWeight: +e.target.value })} /></div>
          <div>
            <label className="form-label">Includes (comma-separated)</label>
            <input className="form-input" placeholder="A, B, C" value={includesInput} onChange={e => setIncludesInput(e.target.value)} />
            <p className="text-[11px] text-slate-700 mt-2">e.g. Service D includes A, B, C</p>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="submit" className="btn-glow flex-1">{editing ? 'Save Changes' : 'Create Service'}</button>
            <button type="button" onClick={closeModal} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
