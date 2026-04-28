import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (role) => {
    const creds = {
      admin: { email: 'admin@demoerp.com', password: 'Admin@123' },
      manager: { email: 'manager@demoerp.com', password: 'Manager@123' },
      employee: { email: 'employee@demoerp.com', password: 'Employee@123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <span className="text-white text-lg font-bold font-display">D</span>
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Digital ERP</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="glass-card border border-slate-700/60 p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-input"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-xs"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
              Register
            </Link>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mt-4 glass-card border border-slate-800/40 p-4">
          <p className="text-xs text-slate-500 text-center mb-3 uppercase tracking-wider">Quick Demo Access</p>
          <div className="grid grid-cols-3 gap-2">
            {['admin', 'manager', 'employee'].map((role) => (
              <button
                key={role}
                onClick={() => quickFill(role)}
                className="text-xs py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 transition-all capitalize"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
