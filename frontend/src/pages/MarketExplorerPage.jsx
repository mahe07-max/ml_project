import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartNoAxesCombined, Filter, MapPin, Search } from 'lucide-react';
import api from '../api';
import AutocompleteInput from '../components/AutocompleteInput';
import useAgriCatalog from '../hooks/useAgriCatalog';
import { formatINR } from '../utils/currency';
import { useAuth } from '../context/AuthContext';

const defaultFilters = {
  crop: 'Rice',
  state: 'Tamil Nadu',
  district: '',
  mandi: '',
};

const formatQuantity = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export default function MarketExplorerPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);
  const [markets, setMarkets] = useState([]);
  const [sortBy, setSortBy] = useState('modal_price');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const catalog = useAgriCatalog(filters.state, filters.district, filters.crop);

  useEffect(() => {
    let active = true;

    const fetchMarkets = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([name, value]) => {
          if (value) params.append(name, value);
        });
        params.append('sort_by', sortBy);

        const response = await api.get(`/markets?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) {
          setMarkets(response.data);
          setError('');
        }
      } catch (requestError) {
        console.error('Market fetch failed', requestError);
        if (active) setError('Market records could not be loaded. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (token) fetchMarkets();
    return () => {
      active = false;
    };
  }, [filters, sortBy, token]);

  const setFilter = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'state' && value !== previous.state ? { district: '', mandi: '' } : {}),
      ...(name === 'district' && value !== previous.district ? { mandi: '' } : {}),
      ...(name === 'crop' && value !== previous.crop ? { mandi: '' } : {}),
    }));
  };

  const marketSummary = useMemo(() => {
    const latestByMarket = new Map();
    const dailyTotals = new Map();

    markets.forEach((market) => {
      const marketKey = `${market.state}\u0000${market.district}\u0000${market.mandi_name}`;
      const current = latestByMarket.get(marketKey);
      if (!current || market.price_date > current.price_date) {
        latestByMarket.set(marketKey, market);
      }

      const day = dailyTotals.get(market.price_date) || { total: 0, count: 0 };
      day.total += market.modal_price;
      day.count += 1;
      dailyTotals.set(market.price_date, day);
    });

    const latestRecords = [...latestByMarket.values()];
    const averageModal = markets.length
      ? markets.reduce((total, market) => total + market.modal_price, 0) / markets.length
      : null;

    return {
      marketCount: latestRecords.length,
      averageModal,
      latestDate: markets.reduce((latest, market) => (
        market.price_date > latest ? market.price_date : latest
      ), ''),
      comparisons: latestRecords
        .sort((left, right) => right.modal_price - left.modal_price)
        .slice(0, 6)
        .map((market) => {
          const marketName = market.mandi_name.replace(/\s+Regulated Market$/i, '');
          return {
            name: marketName.toLocaleLowerCase().includes(market.district.toLocaleLowerCase())
              ? marketName
              : `${marketName} - ${market.district}`,
            min: market.min_price,
            modal: market.modal_price,
            max: market.max_price,
          };
        }),
      trend: [...dailyTotals.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, value]) => ({
          date,
          average: value.total / value.count,
        })),
    };
  }, [markets]);

  return (
    <div className="page-shell">
      <div className="page-heading">
        <div className="eyebrow"><ChartNoAxesCombined className="h-4 w-4" /> Market intelligence</div>
        <h1 className="page-title">Market prices</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Search the existing mandi price history by crop and location. The bundled records are historical sample/demo data, not live market quotes.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Historical sample/demo records
        </div>
      </div>

      <section className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Filter className="h-4 w-4 text-agri-green" />
          <h2 className="text-base font-bold text-agri-dark">Filter records</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div>
            <label htmlFor="market-crop" className="field-label">Crop</label>
            <AutocompleteInput
              id="market-crop"
              name="crop"
              value={filters.crop}
              options={catalog.crops}
              onChange={(value) => setFilter('crop', value)}
              placeholder="Search crops"
            />
          </div>
          <div>
            <label htmlFor="market-state" className="field-label">State</label>
            <AutocompleteInput
              id="market-state"
              name="state"
              value={filters.state}
              options={catalog.states}
              onChange={(value) => setFilter('state', value)}
              placeholder="Search Indian states"
            />
          </div>
          <div>
            <label htmlFor="market-district" className="field-label">District</label>
            <AutocompleteInput
              id="market-district"
              name="district"
              value={filters.district}
              options={catalog.districts}
              onChange={(value) => setFilter('district', value)}
              placeholder="Search available districts"
            />
          </div>
          <div>
            <label htmlFor="market-mandi" className="field-label">Market / mandi</label>
            <AutocompleteInput
              id="market-mandi"
              name="mandi"
              value={filters.mandi}
              options={catalog.markets}
              onChange={(value) => setFilter('mandi', value)}
              placeholder="Search available mandis"
            />
          </div>
          <div>
            <label htmlFor="market-sort" className="field-label">Sort by</label>
            <select id="market-sort" className="input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="modal_price">Modal price</option>
              <option value="date">Date</option>
              <option value="arrival_quantity">Arrival quantity</option>
            </select>
          </div>
        </div>
        {(catalog.error || error) && (
          <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
            {error || catalog.error}
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Market summary">
        <div className="card p-5">
          <div className="text-sm text-slate-500">Matching price records</div>
          <div className="mt-2 text-2xl font-black text-agri-dark">{formatQuantity.format(markets.length)}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Markets represented</div>
          <div className="mt-2 text-2xl font-black text-agri-dark">{formatQuantity.format(marketSummary.marketCount)}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Average modal price</div>
          <div className="mt-2 text-2xl font-black text-agri-dark">
            {marketSummary.averageModal === null ? '—' : formatINR(marketSummary.averageModal)}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Latest record date</div>
          <div className="mt-2 text-2xl font-black text-agri-dark">{marketSummary.latestDate || '—'}</div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-agri-dark">Market price comparison</h2>
            <p className="mt-1 text-sm text-slate-500">Latest available min, modal and max values for each matching market.</p>
          </div>
          <div className="h-72">
            {marketSummary.comparisons.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketSummary.comparisons} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5eee7" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={formatINR} />
                  <Tooltip formatter={(value) => formatINR(value)} />
                  <Bar dataKey="min" name="Minimum" fill="#bbd9c6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="modal" name="Modal" fill="#247a52" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" name="Maximum" fill="#e7b64c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                {loading ? 'Loading market records...' : 'No market records match these filters.'}
              </div>
            )}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-agri-dark">Historical price trend</h2>
            <p className="mt-1 text-sm text-slate-500">Daily average modal price across the currently matching records.</p>
          </div>
          <div className="h-72">
            {marketSummary.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketSummary.trend} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id="marketPriceFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#247a52" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#247a52" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5eee7" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={formatINR} />
                  <Tooltip formatter={(value) => formatINR(value)} />
                  <Area type="monotone" dataKey="average" name="Average modal price" stroke="#247a52" fill="url(#marketPriceFill)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                {loading ? 'Loading historical records...' : 'No historical records match these filters.'}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="card mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-agri-dark">Price records</h2>
            <p className="mt-1 text-sm text-slate-500">Minimum and maximum values are shown exactly as stored by the API.</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:self-auto">
            <MapPin className="h-3.5 w-3.5" />
            {filters.state || 'All India'}
          </div>
        </div>
        {markets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-[#f7f9f4] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Crop</th>
                  <th className="px-4 py-3 font-semibold">State</th>
                  <th className="px-4 py-3 font-semibold">District</th>
                  <th className="px-4 py-3 font-semibold">Market</th>
                  <th className="px-4 py-3 font-semibold">Minimum</th>
                  <th className="px-4 py-3 font-semibold">Maximum</th>
                  <th className="px-4 py-3 font-semibold">Modal</th>
                  <th className="px-4 py-3 font-semibold">Arrival</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {markets.map((market) => (
                  <tr key={market.id} className="transition-colors hover:bg-emerald-50/50">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-agri-dark">{market.crop}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{market.state}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{market.district}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{market.mandi_name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatINR(market.min_price)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatINR(market.max_price)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold text-agri-dark">{formatINR(market.modal_price)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatQuantity.format(market.arrival_quantity)} q</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{market.price_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : loading ? (
          <div className="px-6 py-14 text-center text-sm text-slate-500" role="status">Loading market records...</div>
        ) : (
          <div className="px-6 py-14 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">No matching price records</p>
            <p className="mt-1 text-sm text-slate-500">Try another crop, state, district or market available in the database.</p>
          </div>
        )}
      </section>
    </div>
  );
}
