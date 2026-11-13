import { useEffect, useState } from 'react';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, marketRes] = await Promise.all([
          api.get('/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/markets?crop=Rice&sort_by=modal_price', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setSummary(dashboardRes.data);
        setMarkets(marketRes.data.slice(0, 6));
      } catch (e) {
        console.error('Unable to load dashboard data', e);
      }
    };

    if (token) fetchData();
  }, [token]);

  const chartData = markets.map((market) => ({
    name: market.mandi_name.split(' ')[0],
    price: market.modal_price,
  }));

  if (!summary) {
    return <div className="px-4 py-16 text-center text-slate-500">Loading dashboard...</div>;
  }

  const stats = [
    { label: 'Crop varieties', value: summary.stats.crop_count },
    { label: 'State coverage', value: summary.stats.state_count },
    { label: 'District coverage', value: summary.stats.district_count },
    { label: 'Mandi networks', value: summary.stats.market_count },
    { label: 'Average price', value: `₹${summary.stats.average_price.toFixed(0)}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-agri-green">Farmer dashboard</div>
        <h1 className="mt-3 text-3xl font-bold text-agri-dark">{summary.welcome_message}</h1>
        <p className="mt-2 text-slate-600">{summary.subtitle}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-5">
        {stats.map(({ label, value }) => (
          <div key={label} className="card p-5">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-3 text-3xl font-black text-agri-dark">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-agri-dark">Price trend</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Rice</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#1f8f5f" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#1f8f5f" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#dcebe3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Modal price']} />
                <Area type="monotone" dataKey="price" stroke="#1f8f5f" fill="url(#priceFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-agri-dark">Recent searches</h2>
          <div className="mt-5 space-y-4">
            {summary.recent_searches.map((item) => (
              <div key={`${item.crop}-${item.market}-${item.date}`} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex justify-between">
                  <div className="font-semibold text-agri-dark">{item.crop}</div>
                  <div className="text-sm text-slate-500">{item.date}</div>
                </div>
                <div className="mt-2 text-sm text-slate-600">{item.market}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <h2 className="text-xl font-bold text-agri-dark">Current market overview</h2>
        <div className="mt-4 overflow-hidden rounded-2xl">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 font-medium">Mandi</th>
                <th className="p-3 font-medium">Crop</th>
                <th className="p-3 font-medium">Modal</th>
                <th className="p-3 font-medium">Arrival</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {markets.map((market) => (
                <tr key={market.id}>
                  <td className="p-3 font-medium text-agri-dark">{market.mandi_name}</td>
                  <td className="p-3">{market.crop}</td>
                  <td className="p-3">₹{market.modal_price}</td>
                  <td className="p-3">{market.arrival_quantity} q</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
