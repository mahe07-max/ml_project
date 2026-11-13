import { ArrowRight, ArrowUpRight, BarChart3, Cpu, MapPinned, ShieldCheck, Sprout, Tractor } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: Cpu, title: 'AI price forecasting', description: 'Track expected crop prices using historical mandi signals and trend analysis.' },
  { icon: MapPinned, title: 'Mandi comparison', description: 'Compare local and distant markets with transport and marketing cost estimates.' },
  { icon: BarChart3, title: 'Smart recommendations', description: 'Find the most profitable selling option and understand the confidence level.' },
];

const steps = [
  'Select crop, state, and mandi details',
  'Review forecast confidence and price signals',
  'Compare net returns before selling',
];

const stats = [
  { label: 'Markets tracked', value: '28+' },
  { label: 'Crop categories', value: '12+' },
  { label: 'Average forecast window', value: '7 days' },
  { label: 'Farmers supported', value: '5K+' },
];

export default function LandingPage() {
  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-agri-accent px-3 py-1 text-sm font-medium text-agri-dark">
            <Sprout className="h-4 w-4" />
            Agricultural market intelligence
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight text-agri-dark md:text-6xl">
            Sell Smarter. Earn Better. Grow Stronger.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600">
            AgriWise AI helps Indian farmers discover the best mandi to sell their crops, estimate net earnings, and make data-informed decisions with transparent forecast signals.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="button-primary gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/markets" className="button-secondary gap-2">
              Explore Market Prices <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-500">
            <div><span className="font-bold text-agri-dark">4.8/5</span> farmer experience</div>
            <div><span className="font-bold text-agri-dark">Live</span> mandi trend insights</div>
          </div>
        </div>

        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-soft">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Recommended mandi</div>
                <div className="mt-1 text-2xl font-bold text-agri-dark">Nagpur APMC</div>
              </div>
              <div className="rounded-full bg-agri-green/10 px-3 py-1 text-sm font-semibold text-agri-green">Top pick</div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">Predicted selling price</div>
                <div className="mt-2 text-3xl font-bold text-agri-dark">₹2,420</div>
                <div className="mt-1 text-xs text-emerald-600">+4.2% vs local</div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">Net return</div>
                <div className="mt-2 text-3xl font-bold text-agri-dark">₹2,180</div>
                <div className="mt-1 text-xs text-slate-500">After transport & fees</div>
              </div>
            </div>
            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Crop</span>
                <span className="font-semibold text-agri-dark">Rice</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Current trend</span>
                <span className="font-semibold text-emerald-600">Rising</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Confidence</span>
                <span className="font-semibold text-amber-600">Moderate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-agri-green">Features</div>
            <h2 className="section-title mt-4">Built for modern farm decisions</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-6">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-agri-accent text-agri-green">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-agri-dark">{title}</h3>
                <p className="mt-3 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="text-center">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-agri-green">How it works</div>
          <h2 className="section-title mt-4">A simple journey from field to market</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={step} className="card p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-agri-green text-lg font-bold text-white">{idx + 1}</div>
              <p className="text-lg font-semibold text-agri-dark">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
                <div className="text-3xl font-black text-agri-dark">{value}</div>
                <div className="mt-2 text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-agri-green" />
              <h3 className="text-2xl font-bold text-agri-dark">No guesswork. Only clear signal.</h3>
            </div>
            <p className="mt-4 text-slate-600">
              AgriWise AI uses historical price patterns, mandi-level signals, and transparent cost modeling to help farmers compare markets fairly before they decide where to sell.
            </p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <Tractor className="h-6 w-6 text-agri-green" />
              <h3 className="text-xl font-bold text-agri-dark">Farmer-first</h3>
            </div>
            <p className="mt-4 text-slate-600">
              Built to support small and midsize farmers with practical, easy-to-read insights and mobile-friendly workflows.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-8">
          <div>© 2026 AgriWise AI</div>
          <div className="flex gap-6">
            <span>About</span>
            <span>Contact</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
