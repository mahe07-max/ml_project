import { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const defaultForm = {
  crop: 'Rice',
  state: 'Maharashtra',
  district: 'Nagpur',
  mandi: 'Nagpur APMC',
  quantity: 10,
  horizon_days: 3,
};

export default function PredictionPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/predict', {
        ...form,
        quantity: Number(form.quantity),
        horizon_days: Number(form.horizon_days),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction could not be generated.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-agri-green">AI crop price prediction</div>
        <h1 className="mt-3 text-3xl font-bold text-agri-dark">Forecast crop value before you sell</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="card p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Crop name</label>
              <input className="input" name="crop" value={form.crop} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">State</label>
              <input className="input" name="state" value={form.state} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">District</label>
              <input className="input" name="district" value={form.district} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Preferred mandi</label>
              <input className="input" name="mandi" value={form.mandi} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Quantity (quintals)</label>
              <input type="number" className="input" name="quantity" value={form.quantity} onChange={handleChange} min="1" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Forecast horizon (days)</label>
              <input type="number" className="input" name="horizon_days" value={form.horizon_days} onChange={handleChange} min="1" max="7" required />
            </div>
          </div>

          {error && <div className="mt-5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <button type="submit" className="button-primary mt-6 w-full" disabled={loading}>
            {loading ? 'Generating forecast...' : 'Predict crop price'}
          </button>
        </form>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-agri-dark">Prediction result</h2>
          {result ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-agri-accent p-4">
                <div className="text-sm text-slate-600">Predicted modal price</div>
                <div className="mt-2 text-4xl font-black text-agri-dark">₹{result.predicted_modal_price.toFixed(0)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-slate-500">Model</div>
                  <div className="mt-2 font-semibold text-agri-dark">{result.model_name}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-slate-500">Confidence</div>
                  <div className="mt-2 font-semibold text-agri-dark">{result.confidence}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-slate-500">Horizon</div>
                  <div className="mt-2 font-semibold text-agri-dark">{result.forecast_horizon} days</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-slate-500">Prediction date</div>
                  <div className="mt-2 font-semibold text-agri-dark">{result.prediction_date}</div>
                </div>
              </div>

              {result.warning && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  {result.warning}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Fill in the crop details and generate a forecast to see the AI price outlook.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
