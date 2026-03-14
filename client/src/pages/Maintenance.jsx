import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../api/client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Wrench } from 'lucide-react';
import Modal from '../components/Modal';

const emptyRecord = { busAlias: '', pmNumber: '', pmDescription: '', jobDescription: '', currentJobPlan: '', lastOdometerReading: 0, nextTriggerKm: 0, unitsToGoKm: 0, unitsLateKm: 0, daysLate: 0, frequencyKm: 0, toleranceKm: 0, reportDate: '', serviceType: '', pmStatus: '', assetStatus: '' };

export default function Maintenance() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyRecord);

  const { data, isLoading } = useQuery({ queryKey: ['maintenance'], queryFn: maintenanceApi.getAll });
  const createMut = useMutation({ mutationFn: maintenanceApi.create, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['maintenance'] }); closeModal(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => maintenanceApi.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['maintenance'] }); closeModal(); } });
  const deleteMut = useMutation({ mutationFn: maintenanceApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] }) });

  const records = (data?.data || []).filter(r =>
    r.busAlias?.toLowerCase().includes(search.toLowerCase()) ||
    r.serviceType?.toLowerCase().includes(search.toLowerCase()) ||
    r.pmNumber?.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() { setEditing(null); setForm(emptyRecord); setModalOpen(true); }
  function openEdit(r) { setEditing(r); setForm({ ...r, reportDate: r.reportDate ? new Date(r.reportDate).toISOString().split('T')[0] : '' }); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }
  function handleSubmit(e) {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing._id, data: form });
    else createMut.mutate(form);
  }

  function getUrgencyBadge(score) {
    if (score >= 80) return <span className="badge badge-critical">Critical · {score}</span>;
    if (score >= 60) return <span className="badge badge-warning">High · {score}</span>;
    if (score >= 40) return <span className="badge" style={{ background: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.12)' }}>Medium · {score}</span>;
    if (score >= 20) return <span className="badge badge-info">Low · {score}</span>;
    return <span className="badge badge-success">Healthy · {score}</span>;
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p className="page-subtitle">Preventative maintenance tracking with urgency scoring</p>
        </div>
        <button onClick={openCreate} className="btn-glow flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      <div className="search-bar flex items-center gap-3 px-4 py-3">
        <Search className="w-4 h-4 text-slate-600" />
        <input className="bg-transparent outline-none flex-1 text-sm text-slate-300 placeholder:text-slate-700"
          placeholder="Search by bus, service type, or PM number…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Wrench className="w-7 h-7 text-indigo-500/40" /></div>
            <p className="text-sm font-semibold text-slate-400 mt-2">No maintenance records</p>
            <p className="text-xs text-slate-700 mt-1">Add PM records to start tracking fleet maintenance</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Bus</th><th>PM #</th><th>Service</th><th>Urgency</th><th>Odometer</th><th>To Go</th><th>Overdue</th><th>Days Late</th><th></th></tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td><span className="font-bold text-slate-200">{r.busAlias}</span></td>
                    <td><span className="font-mono text-xs text-slate-500">{r.pmNumber}</span></td>
                    <td><span className="badge badge-info">{r.serviceType}</span></td>
                    <td>{getUrgencyBadge(r.urgencyScore || 0)}</td>
                    <td className="font-mono text-xs">{r.lastOdometerReading?.toLocaleString()}</td>
                    <td className="font-mono text-xs">{r.unitsToGoKm?.toLocaleString()} km</td>
                    <td>{r.unitsLateKm > 0 ? <span className="font-bold text-rose-400">{r.unitsLateKm.toLocaleString()} km</span> : <span className="text-slate-700">—</span>}</td>
                    <td>{r.daysLate > 0 ? <span className="font-bold text-amber-400">{r.daysLate}d</span> : <span className="text-slate-700">—</span>}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(r)} className="action-btn action-btn-edit"><Pencil className="w-3.5 h-3.5 text-indigo-400/60" /></button>
                        <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(r._id); }} className="action-btn action-btn-delete"><Trash2 className="w-3.5 h-3.5 text-rose-400/60" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Record' : 'Add Maintenance Record'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Bus Alias</label><input className="form-input" required placeholder="BUS-1001" value={form.busAlias} onChange={e => setForm({ ...form, busAlias: e.target.value })} /></div>
            <div><label className="form-label">PM Number</label><input className="form-input" placeholder="PM-001" value={form.pmNumber} onChange={e => setForm({ ...form, pmNumber: e.target.value })} /></div>
            <div><label className="form-label">Service Type</label><input className="form-input" placeholder="A, B, C, D" value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })} /></div>
            <div><label className="form-label">Report Date</label><input className="form-input" type="date" value={form.reportDate} onChange={e => setForm({ ...form, reportDate: e.target.value })} /></div>
            <div><label className="form-label">Last Odometer</label><input className="form-input" type="number" value={form.lastOdometerReading} onChange={e => setForm({ ...form, lastOdometerReading: +e.target.value })} /></div>
            <div><label className="form-label">Next Trigger (km)</label><input className="form-input" type="number" value={form.nextTriggerKm} onChange={e => setForm({ ...form, nextTriggerKm: +e.target.value })} /></div>
            <div><label className="form-label">Units To Go (km)</label><input className="form-input" type="number" value={form.unitsToGoKm} onChange={e => setForm({ ...form, unitsToGoKm: +e.target.value })} /></div>
            <div><label className="form-label">Units Late (km)</label><input className="form-input" type="number" value={form.unitsLateKm} onChange={e => setForm({ ...form, unitsLateKm: +e.target.value })} /></div>
            <div><label className="form-label">Days Late</label><input className="form-input" type="number" value={form.daysLate} onChange={e => setForm({ ...form, daysLate: +e.target.value })} /></div>
            <div><label className="form-label">Frequency (km)</label><input className="form-input" type="number" value={form.frequencyKm} onChange={e => setForm({ ...form, frequencyKm: +e.target.value })} /></div>
            <div><label className="form-label">Tolerance (km)</label><input className="form-input" type="number" value={form.toleranceKm} onChange={e => setForm({ ...form, toleranceKm: +e.target.value })} /></div>
            <div><label className="form-label">PM Status</label><input className="form-input" value={form.pmStatus} onChange={e => setForm({ ...form, pmStatus: e.target.value })} /></div>
          </div>
          <div><label className="form-label">PM Description</label><input className="form-input" placeholder="Brief description" value={form.pmDescription} onChange={e => setForm({ ...form, pmDescription: e.target.value })} /></div>
          <div><label className="form-label">Job Description</label><input className="form-input" placeholder="Job details" value={form.jobDescription} onChange={e => setForm({ ...form, jobDescription: e.target.value })} /></div>
          <div className="flex gap-3 pt-3">
            <button type="submit" className="btn-glow flex-1">{editing ? 'Save Changes' : 'Create Record'}</button>
            <button type="button" onClick={closeModal} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
