import { ArrowRight, ArrowUpRight, BarChart3, MapPinned, ShieldCheck, Sprout, Tractor } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: BarChart3,
    title: 'Read price signals',
    description: 'Explore stored mandi records and compare minimum, modal and maximum prices by crop and location.',
  },
  {
    icon: MapPinned,
    title: 'Compare nearby markets',
    description: 'Use location-aware market options to find relevant records for your district.',
  },
  {
    icon: ShieldCheck,
    title: 'Understand every forecast',
    description: 'Review model name, confidence and warning details alongside every prediction.',
  },
];

export default function LandingPage() {
  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:px-8 lg:py-16">
        <div className="py-4 lg:py-10">
          <div className="eyebrow">
            <Sprout className="h-4 w-4" />
            Strengthening market linkages
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-agri-dark sm:text-5xl lg:text-6xl">
            Better market insight, from field to mandi.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            AgriWise AI helps farmers explore crop prices, compare markets and review transparent forecast signals before making a selling decision.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="button-primary gap-2">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/markets" className="button-secondary gap-2">
              Explore market records <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-agri-green" />
              Tamil Nadu district focus
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-agri-gold" />
              Wider India location catalogue
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src="/images/field-landscape.jpg"
            alt="Golden agricultural fields at sunrise"
            className="hero-image"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <div className="hero-image-shade" />
          <div className="absolute left-5 top-5 rounded-2xl border border-white/30 bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:left-7 sm:top-7">
            <div className="text-xs font-semibold uppercase tracking-wider text-agri-green">AgriWise AI</div>
            <div className="mt-1 text-sm font-bold text-agri-dark">Market intelligence for farmers</div>
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-xl backdrop-blur sm:bottom-7 sm:left-7 sm:right-7 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-agri-green">
                <Tractor className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-agri-dark">Strengthening price discovery</div>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Browse market history, choose a crop and see the source and confidence of your forecast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow justify-center">A clearer way to plan</div>
            <h2 className="section-title mt-4">Tools for more informed farm decisions</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Practical market context, with sample records and demo forecasts clearly identified.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="feature-card">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-agri-green">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-agri-dark">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div className="crop-visual">
          <img
            src="/images/crop-rows.jpg"
            alt="Green crops growing in cultivated rows"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <div className="crop-image-caption">
            <Sprout className="h-4 w-4" />
            Built around crops, locations and market records
          </div>
        </div>
        <div>
          <div className="eyebrow">From crop to comparison</div>
          <h2 className="section-title mt-4">A simple journey from field to market</h2>
          <div className="mt-7 space-y-4">
            {[
              'Choose a crop and the state or district you want to explore.',
              'Compare stored market prices and review the record dates.',
              'Generate a forecast or recommendation with its model details in view.',
            ].map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-agri-green">
                  0{index + 1}
                </div>
                <p className="pt-1 text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-agri-dark py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">Explore AgriWise AI</div>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Bring your next market question.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/80">
              Sign in to compare recorded prices, run a prediction and review market recommendations.
            </p>
          </div>
          <Link to="/register" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-agri-dark transition hover:bg-emerald-50">
            Create an account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-7">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>© 2026 AgriWise AI · Strengthening market linkages and price discovery for farmers</div>
          <div className="font-medium">Historical sample data and demo forecasts are labelled in the app.</div>
        </div>
      </footer>
    </div>
  );
}
