import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account created! Welcome to TaskFlow.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      const errors = err.response?.data?.errors;
      toast.error(errors ? errors[0].message : msg);
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
          <h1 className="text-2xl font-bold text-[#f0f4ff] mb-1.5">Create your account</h1>
          <p className="text-sm text-slate-400">Start managing your tasks today</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              className="form-input"
              placeholder="Your name"
              value={form.username}
              onChange={handleChange}
              minLength={3}
              required
            />
          </div>

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

          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Min. 8 chars with letters & numbers"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          <div>
            <label htmlFor="confirm" className="form-label">Confirm password</label>
            <input
              id="confirm"
              type="password"
              name="confirm"
              className="form-input"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-2 py-3 text-[15px]" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
