import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_80%_60%_at_20%_20%,rgba(99,102,241,0.12)_0%,transparent_60%),radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(16,185,129,0.07)_0%,transparent_50%),#0a0f1e]">
      <div className="w-full max-w-[420px] bg-[#111827] border border-[#1e2d45] rounded-[18px] p-10 shadow-2xl animate-[fadeUp_0.35s_ease]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xl font-extrabold text-indigo-500 mb-5 tracking-tight">
            
            TaskFlow
          </div>
          <h1 className="text-2xl font-bold text-[#f0f4ff] mb-1.5">Welcome back</h1>
          <p className="text-sm text-slate-400">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          <div>
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-6 py-3 text-[15px]" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-indigo-500 font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
