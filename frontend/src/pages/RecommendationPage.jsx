import { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AutocompleteInput from '../components/AutocompleteInput';
import useAgriCatalog from '../hooks/useAgriCatalog';
import { formatINR } from '../utils/currency';

const defaultForm = {
  crop: 'Rice',
  state: 'Tamil Nadu',
  district: 'Coimbatore',
  mandi: 'Coimbatore Regulated Market',
  quantity: 10,
  horizon_days: 3,
};

export default function RecommendationPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const catalog = useAgriCatalog(form.state, form.district, form.crop);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'state' && value !== prev.state ? { district: '', mandi: '' } : {}),
      ...(name === 'district' && value !== prev.district ? { mandi: '' } : {}),
      ...(name === 'crop' && value !== prev.crop ? { mandi: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/recommend', {
        ...form,
        quantity: Number(form.quantity),
        horizon_days: Number(form.horizon_days),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Recommendation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-agri-green">Smart recommendation engine</div>
        <h1 className="mt-3 text-3xl font-bold text-agri-dark">Rank mandi options by net selling value</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.4fr]">
        <form onSubmit={handleSubmit} className="card p-6">
          <div className="grid gap-5">
            <div>
              <label htmlFor="recommend-crop" className="field-label">Crop</label>
              <AutocompleteInput id="recommend-crop" name="crop" value={form.crop} options={catalog.crops} onChange={(value) => handleChange('crop', value)} placeholder="Search crops" />
            </div>
            <div>
              <label htmlFor="recommend-state" className="field-label">State</label>
              <AutocompleteInput id="recommend-state" name="state" value={form.state} options={catalog.states} onChange={(value) => handleChange('state', value)} placeholder="Search Indian states" />
            </div>
            <div>
              <label htmlFor="recommend-district" className="field-label">District</label>
              <AutocompleteInput id="recommend-district" name="district" value={form.district} options={catalog.districts} onChange={(value) => handleChange('district', value)} placeholder="Search available districts" />
            </div>
            <div>
              <label htmlFor="recommend-mandi" className="field-label">Preferred mandi</label>
              <AutocompleteInput id="recommend-mandi" name="mandi" value={form.mandi} options={catalog.markets} onChange={(value) => handleChange('mandi', value)} placeholder="Search markets in this district" />
            </div>
            <div>
              <label htmlFor="recommend-quantity" className="field-label">Quantity (quintals)</label>
              <input id="recommend-quantity" type="number" className="input" name="quantity" value={form.quantity} onChange={(event) => handleChange('quantity', event.target.value)} min="1" />
            </div>
            <div>
              <label htmlFor="recommend-horizon" className="field-label">Forecast horizon (days)</label>
              <input id="recommend-horizon" type="number" className="input" name="horizon_days" value={form.horizon_days} onChange={(event) => handleChange('horizon_days', event.target.value)} min="1" max="7" />
            </div>
          </div>

          {catalog.error && <div className="mt-5 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{catalog.error}</div>}
          {error && <div className="mt-5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <button type="submit" className="button-primary mt-6 w-full" disabled={loading}>
            {loading ? 'Calculating...' : 'Find best market'}
          </button>
        </form>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-agri-dark">Ranked options</h2>
          {results.length > 0 ? (
            <div className="mt-5 space-y-4">
              {results.map((item) => (
                <div key={`${item.rank}-${item.market_name}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm text-slate-500">Rank #{item.rank}</div>
                      <div className="text-xl font-bold text-agri-dark">{item.market_name}</div>
                    </div>
                    <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {item.confidence}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <div className="text-slate-500">Net price</div>
                      <div className="mt-1 text-lg font-bold text-agri-dark">{formatINR(item.estimated_net_price)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <div className="text-slate-500">Transport</div>
                      <div className="mt-1 text-lg font-bold text-agri-dark">{formatINR(item.transportation_cost)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <div className="text-slate-500">Marketing</div>
                      <div className="mt-1 text-lg font-bold text-agri-dark">{formatINR(item.marketing_cost)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                      <div className="text-slate-500">Difference vs local</div>
                      <div className="mt-1 text-lg font-bold text-agri-dark">{formatINR(item.difference_from_local)}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-slate-600">{item.recommendation_reason}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Select your crop and mandi inputs, then compute the best market recommendation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
