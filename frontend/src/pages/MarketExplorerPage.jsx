import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const defaultFilters = {
  crop: 'Rice',
  state: 'Tamil Nadu',
  district: '',
};

export default function MarketExplorerPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);
  const [markets, setMarkets] = useState([]);
  const [catalog, setCatalog] = useState({ crops: [], states: [], districts: [] });
  const [sortBy, setSortBy] = useState('modal_price');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [cropRes, regionRes] = await Promise.all([
          api.get('/catalog/crops'),
          api.get('/catalog/regions'),
        ]);

        const cropNames = cropRes.data.categories.flatMap((section) => section.crops.map((crop) => crop.crop));
        setCatalog({
          crops: cropNames,
          states: regionRes.data.states,
          districts: regionRes.data.tamil_nadu_districts,
        });
      } catch (error) {
        console.error('Failed to load catalog options', error);
      }
    };

    if (token) fetchCatalog();
  }, [token]);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.crop) params.append('crop', filters.crop);
        if (filters.state) params.append('state', filters.state);
        if (filters.district) params.append('district', filters.district);
        params.append('sort_by', sortBy);

        const response = await api.get(`/markets?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMarkets(response.data);
      } catch (err) {
        console.error('Market fetch failed', err);
      }
    };

    if (token) fetchMarkets();
  }, [filters, sortBy, token]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-agri-green">Live mandi explorer</div>
        <h1 className="mt-3 text-3xl font-bold text-agri-dark">Compare crop prices across Tamil Nadu and India</h1>
      </div>

      <div className="card p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Crop</label>
            <input
              className="input"
              name="crop"
              list="crop-options"
              value={filters.crop}
              onChange={handleFilterChange}
            />
            <datalist id="crop-options">
              {catalog.crops.map((crop) => (
                <option key={crop} value={crop} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">State</label>
            <select className="input" name="state" value={filters.state} onChange={handleFilterChange}>
              {catalog.states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">District</label>
            <input
              className="input"
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              placeholder={filters.state === 'Tamil Nadu' ? 'e.g. Coimbatore' : 'e.g. Nagpur'}
              list={filters.state === 'Tamil Nadu' ? 'district-options' : undefined}
            />
            {filters.state === 'Tamil Nadu' && (
              <datalist id="district-options">
                {catalog.districts.map((district) => (
                  <option key={district} value={district} />
                ))}
              </datalist>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Sort by</label>
            <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="modal_price">Modal price</option>
              <option value="date">Date</option>
              <option value="arrival_quantity">Arrival quantity</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 font-medium">Crop</th>
                <th className="p-3 font-medium">State</th>
                <th className="p-3 font-medium">District</th>
                <th className="p-3 font-medium">Mandi</th>
                <th className="p-3 font-medium">Min</th>
                <th className="p-3 font-medium">Max</th>
                <th className="p-3 font-medium">Modal</th>
                <th className="p-3 font-medium">Arrival</th>
                <th className="p-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {markets.map((market) => (
                <tr key={market.id}>
                  <td className="p-3 font-medium text-agri-dark">{market.crop}</td>
                  <td className="p-3">{market.state}</td>
                  <td className="p-3">{market.district}</td>
                  <td className="p-3">{market.mandi_name}</td>
                  <td className="p-3">?{market.min_price}</td>
                  <td className="p-3">?{market.max_price}</td>
                  <td className="p-3 font-semibold">?{market.modal_price}</td>
                  <td className="p-3">{market.arrival_quantity}</td>
                  <td className="p-3">{market.price_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
