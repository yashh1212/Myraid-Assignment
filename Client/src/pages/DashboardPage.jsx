import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';

const STATUS_OPTIONS = ['', 'todo', 'in-progress', 'done'];
const STATUS_LABELS = { '': 'All', todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ open: false, task: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const searchTimeout = useRef(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: val }));
      setPage(1);
    }, 400);
  };

  const handleStatusFilter = (status) => {
    setFilters((f) => ({ ...f, status }));
    setPage(1);
  };

  const handleSaveTask = async (data, taskId) => {
    try {
      if (taskId) {
        await api.put(`/tasks/${taskId}`, data);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', data);
        toast.success('Task created!');
      }
      fetchTasks();
      setModalState({ open: false, task: null });
    } catch (err) {
      const errors = err.response?.data?.errors;
      toast.error(errors ? errors[0].message : err.response?.data?.message || 'Error saving task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      setDeleteConfirm(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const stats = {
    total: pagination.total,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#0a0f1e]/85 backdrop-blur-md border-b border-[#1e2d45]">
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[18px] font-extrabold text-indigo-500 tracking-tight">
            TaskFlow
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-full flex items-center justify-center text-[13px] font-bold text-white uppercase shadow-sm">
                {user?.username?.[0]}
              </span>
              <span className="text-sm font-medium text-slate-400 hidden sm:block">
                {user?.username}
              </span>
            </div>
            <button onClick={handleLogout} className="btn-ghost !px-3 !py-1.5 text-[13px]">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#f0f4ff] tracking-tight">My Tasks</h1>
            <p className="text-sm text-slate-400 mt-1">Manage and track all your tasks in one place</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setModalState({ open: true, task: null })}
          >
            + New Task
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">To Do</div>
            <div className="text-[32px] font-bold text-amber-500 tracking-tight leading-none">{stats.todo}</div>
          </div>
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">In Progress</div>
            <div className="text-[32px] font-bold text-indigo-500 tracking-tight leading-none">{stats['in-progress']}</div>
          </div>
          <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Done</div>
            <div className="text-[32px] font-bold text-emerald-500 tracking-tight leading-none">{stats.done}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full min-w-[200px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              type="text"
              className="w-full bg-[#111827] border border-[#283548] text-[#f0f4ff] pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 placeholder-slate-500"
              placeholder="Search tasks by title..."
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                className={`text-[13px] font-medium px-4 py-2 rounded-full border transition-all ${
                  filters.status === s 
                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_0_3px_rgba(99,102,241,0.25)]' 
                    : 'bg-[#111827] border-[#283548] text-slate-400 hover:bg-[#1a2234] hover:text-[#f0f4ff]'
                }`}
                onClick={() => handleStatusFilter(s)}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="spinner" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 px-6 bg-[#111827] border border-dashed border-[#283548] rounded-xl">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-[#f0f4ff] mb-2">No tasks found</h3>
            <p className="text-sm text-slate-400 mb-5">
              {filters.search || filters.status ? 'Try adjusting your filters' : 'Create your first task to get started!'}
            </p>
            {!filters.search && !filters.status && (
              <button className="btn-primary" onClick={() => setModalState({ open: true, task: null })}>
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <div key={task._id} className="group bg-[#111827] border border-[#1e2d45] rounded-xl p-5 hover:-translate-y-1 hover:shadow-xl hover:border-[#283548] transition-all animate-[fadeUp_0.3s_ease] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                    task.status === 'todo' ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' :
                    task.status === 'in-progress' ? 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30' :
                    'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                  }`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 rounded-md text-slate-400 hover:bg-[#1a2234] hover:text-white transition-colors"
                      title="Edit"
                      onClick={() => setModalState({ open: true, task })}
                    >
                      ✏️
                    </button>
                    <button
                      className="p-1.5 rounded-md text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Delete"
                      onClick={() => setDeleteConfirm(task._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <h3 className="text-base font-semibold text-[#f0f4ff] mb-2 leading-snug break-words">
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-[13px] text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {task.description}
                  </p>
                )}
                
                <div className="text-[11px] text-slate-500 mt-auto pt-4 border-t border-[#1e2d45]/50">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button
              className="bg-[#111827] border border-[#283548] text-slate-400 text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#1a2234] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`w-9 h-9 border rounded-lg text-[13px] transition-colors ${
                    pagination.page === n 
                      ? 'bg-indigo-500 border-indigo-500 text-white' 
                      : 'bg-[#111827] border-[#283548] text-slate-400 hover:bg-[#1a2234] hover:text-white'
                  }`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              className="bg-[#111827] border border-[#283548] text-slate-400 text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#1a2234] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}

        <div className="text-center mt-3 text-slate-500 text-[13px]">
          {pagination.total} task{pagination.total !== 1 ? 's' : ''} total
          {(filters.status || filters.search) && ' (filtered)'}
        </div>
      </main>

      {/* Task create/edit modal */}
      {modalState.open && (
        <TaskModal
          task={modalState.task}
          onSave={handleSaveTask}
          onClose={() => setModalState({ open: false, task: null })}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#111827] border border-[#283548] rounded-[18px] shadow-2xl p-7 text-center w-full max-w-[340px] animate-[fadeUp_0.25s_ease]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#f0f4ff] mb-2">Delete Task?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone. Are you sure?</p>
            <div className="flex justify-center gap-2.5">
              <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
