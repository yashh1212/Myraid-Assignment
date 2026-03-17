import { useState, useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
  });
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await onSave(form, task?._id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]" onClick={onClose}>
      <div className="bg-[#111827] border border-[#283548] rounded-[18px] shadow-2xl animate-[fadeUp_0.25s_ease] max-h-[90vh] overflow-y-auto w-full max-w-[480px] p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{task ? 'Edit Task' : 'Create Task'}</h2>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a2234] text-slate-400 hover:bg-red-500/15 hover:text-red-500 transition-colors text-sm" 
            onClick={onClose} 
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          <div className="mb-4">
            <label htmlFor="modal-title" className="form-label">Title <span className="text-red-500">*</span></label>
            <input
              id="modal-title"
              type="text"
              name="title"
              className="form-input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              required
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label htmlFor="modal-description" className="form-label">Description</label>
            <textarea
              id="modal-description"
              name="description"
              className="form-input min-h-[100px] resize-y"
              placeholder="Add details or notes (optional)"
              value={form.description}
              onChange={handleChange}
              maxLength={1000}
              rows={4}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="modal-status" className="form-label">Status</label>
            <select 
              id="modal-status" 
              name="status" 
              className="form-input cursor-pointer appearance-none" 
              value={form.status} 
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 mt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button id="save-task-btn" type="submit" className="btn-primary" disabled={loading || !form.title.trim()}>
              {loading ? <span className="btn-spinner" /> : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
