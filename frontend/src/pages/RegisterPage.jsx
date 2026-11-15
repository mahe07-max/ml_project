import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AutocompleteInput from '../components/AutocompleteInput';
import useAgriCatalog from '../hooks/useAgriCatalog';

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
  const catalog = useAgriCatalog(form.state, form.district);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'state' && value !== prev.state ? { district: '' } : {}),
    }));
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
            <label htmlFor="register-full-name" className="text-sm font-medium text-slate-700">Full name</label>
            <input id="register-full-name" type="text" name="full_name" className="input" value={form.full_name} onChange={(event) => handleChange('full_name', event.target.value)} required />
          </div>
          <div>
            <label htmlFor="register-email" className="text-sm font-medium text-slate-700">Email</label>
            <input id="register-email" type="email" name="email" className="input" value={form.email} onChange={(event) => handleChange('email', event.target.value)} required />
          </div>
          <div>
            <label htmlFor="register-phone" className="text-sm font-medium text-slate-700">Phone number</label>
            <input id="register-phone" type="tel" name="phone_number" className="input" value={form.phone_number} onChange={(event) => handleChange('phone_number', event.target.value)} required />
          </div>
          <div>
            <label htmlFor="register-password" className="text-sm font-medium text-slate-700">Password</label>
            <input id="register-password" type="password" name="password" className="input" value={form.password} onChange={(event) => handleChange('password', event.target.value)} minLength={6} required />
          </div>
          <div>
            <label htmlFor="register-state" className="text-sm font-medium text-slate-700">State</label>
            <AutocompleteInput
              id="register-state"
              name="state"
              value={form.state}
              options={catalog.states}
              onChange={(value) => handleChange('state', value)}
              placeholder="Search Indian states"
              required
            />
          </div>
          <div>
            <label htmlFor="register-district" className="text-sm font-medium text-slate-700">District</label>
            <AutocompleteInput
              id="register-district"
              name="district"
              value={form.district}
              options={catalog.districts}
              onChange={(value) => handleChange('district', value)}
              placeholder={form.state ? 'Search available districts' : 'Select a state first'}
              required
            />
          </div>
          <div>
            <label htmlFor="register-village" className="text-sm font-medium text-slate-700">Village</label>
            <input id="register-village" type="text" name="village" className="input" value={form.village} onChange={(event) => handleChange('village', event.target.value)} required />
          </div>
          <div>
            <label htmlFor="register-language" className="text-sm font-medium text-slate-700">Preferred language</label>
            <select id="register-language" name="preferred_language" className="input" value={form.preferred_language} onChange={(event) => handleChange('preferred_language', event.target.value)}>
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
              <option>Kannada</option>
            </select>
          </div>

          {catalog.error && <div className="md:col-span-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">{catalog.error}</div>}
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
