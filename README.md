# AgriWise AI

AgriWise AI is a full-stack agricultural market intelligence platform for Indian farmers. It combines a FastAPI backend, SQLite database, and React + Tailwind frontend to help farmers compare mandi prices, predict crop value, and identify the most profitable market.

## Features

- Farmer registration and JWT login
- Farmer dashboard with price insights
- AI-style crop price forecasting with demo mode labeling
- Mandi price explorer with filters and sorting
- Market comparison and recommendation engine
- Transportation and marketing cost framing for net return estimates

## Stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: FastAPI, SQLAlchemy, SQLite for local development and PostgreSQL for hosted deployments, Pydantic
- ML/data layer: Python, Pandas, NumPy, scikit-learn, demo forecasting logic

## Quick start

For local Neon development, the Neon CLI writes connection settings to the root `.env.local` file. The backend loads this file automatically; it is ignored by Git and must not be copied into frontend code.

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m app.init_db --seed-market-data
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The local initialization command creates the SQLite tables and explicitly seeds the bundled demo market prices. FastAPI startup itself does not create tables or seed data.

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open http://localhost:5173.

## Vercel full-stack deployment

The root `vercel.json` configures two Vercel Services: the FastAPI backend at `/api/*` and the Vite frontend for all other paths. The frontend service rewrites page routes to `index.html` so direct navigation and refreshes work. The browser calls the same-domain `/api` path; no service binding or `VITE_API_BASE_URL` is needed.

Initialize PostgreSQL manually before the first deployment, from the `backend` directory:

```bash
python -m app.init_db
```

The initializer uses `DATABASE_URL_UNPOOLED` for PostgreSQL schema setup (or a direct, non-pooled `DATABASE_URL` if no unpooled URL is supplied). With the Neon CLI's root `.env.local`, that selects the direct connection. The command creates missing tables and indexes, including a unique index on the market natural key; it does not seed market data. If existing market rows contain duplicate natural keys, initialization stops and preserves them so they can be reviewed.

Market seeding is a separate, explicit opt-in:

```bash
python -m app.init_db --seed-market-data
```

That flag inserts only missing bundled demo rows (up to 23,310) and never updates conflicting rows. Do not run it in production until you have reviewed and approved adding this generated demo data. Neither schema initialization nor seeding runs when FastAPI starts or in Vercel serverless instances. Keep Vercel's `DATABASE_URL` pooled for runtime requests; do not add `DATABASE_URL_UNPOOLED` to Vercel unless you separately need to run an approved manual initialization there.

Set these Vercel environment variables for the backend in each deployment environment you use:

- `DATABASE_URL`: a persistent PostgreSQL connection URL. The checked-in SQLite database is for local development and is not durable or writable production storage on Vercel.
- `SECRET_KEY`: a long, random signing key. Do not prefix it with `VITE_`.

Enable Vercel system environment variables so the API can reject a deployment that is missing either required setting instead of falling back to SQLite or the local demo signing key. `CORS_ORIGINS` is optional and only needed if a browser frontend is hosted on a different origin; the default local development origins are already allowed.

The prediction implementation currently uses its existing demo trend logic and does not load a separate model file. The API service entrypoint is `app.main:app`; its Python packages are installed from `backend/requirements.txt`.

To deploy, import this repository as a Vercel project, add the two backend environment variables, and deploy. Verify the API at `/api/health` and refresh a nested frontend page to check SPA routing.

## Notes

- Seed market data is bundled in the app so it works without external data sources.
- Forecasting is intentionally labeled as a demo model when no trained production model is available, to avoid presenting unverified AI confidence as fact.
- Sample market data is clearly treated as historical or demo data rather than live official feeds.
- Crop suggestions use the existing crop catalogue. Districts and market names are suggested from the location catalogue and stored market records through `GET /api/catalog/locations`; a suggestion does not guarantee that a price record exists for every crop.
- The current API and database do not define a crop-variety field or variety catalogue, so the UI does not fabricate variety suggestions.
