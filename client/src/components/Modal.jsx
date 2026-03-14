import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{title}</h2>
            <div className="w-8 h-0.5 rounded-full mt-2" style={{ background: 'linear-gradient(90deg, #6366f1, transparent)' }} />
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
