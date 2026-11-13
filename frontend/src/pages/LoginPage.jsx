import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', form);
      const token = response.data.access_token;
      const profileResponse = await api.get('/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToken(token, profileResponse.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-8">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-agri-green">Welcome back</div>
          <h2 className="mt-3 text-3xl font-bold text-agri-dark">Farmer sign in</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>

          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <button type="submit" className="button-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Don’t have an account? <Link to="/register" className="font-semibold text-agri-green">Register now</Link>
        </div>
      </div>
    </div>
  );
}
