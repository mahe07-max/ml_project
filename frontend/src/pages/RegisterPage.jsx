import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const initialState = {
  full_name: '',
  email: '',
  phone_number: '',
  password: '',
  state: '',
  district: '',
  village: '',
  preferred_language: 'English',
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialState);
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
      const response = await api.post('/auth/register', form);
      const loginResponse = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      const token = loginResponse.data.access_token;
      const profileResponse = await api.get('/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToken(token, profileResponse.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <div className="card p-8">
        <div className="mb-8 text-center">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-agri-green">Create account</div>
          <h2 className="mt-3 text-3xl font-bold text-agri-dark">Register as a farmer</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <input type="text" name="full_name" className="input" value={form.full_name} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input type="email" name="email" className="input" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone number</label>
            <input type="tel" name="phone_number" className="input" value={form.phone_number} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input type="password" name="password" className="input" value={form.password} onChange={handleChange} minLength={6} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">State</label>
            <input type="text" name="state" className="input" value={form.state} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">District</label>
            <input type="text" name="district" className="input" value={form.district} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Village</label>
            <input type="text" name="village" className="input" value={form.village} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Preferred language</label>
            <select name="preferred_language" className="input" value={form.preferred_language} onChange={handleChange}>
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
              <option>Kannada</option>
            </select>
          </div>

          {error && <div className="md:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <div className="md:col-span-2">
            <button type="submit" className="button-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already registered? <Link to="/login" className="font-semibold text-agri-green">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
