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
- Backend: FastAPI, SQLAlchemy, SQLite, Pydantic
- ML/data layer: Python, Pandas, NumPy, scikit-learn, demo forecasting logic

## Quick start

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open http://localhost:5173.

## Netlify frontend preview

The repository includes a Netlify build configuration. In Netlify, import the project or manually deploy the `frontend/dist` folder after running `npm run build` in `frontend`.

The frontend preview does not host the FastAPI backend. Registration, login, market data, and predictions need a separately hosted backend; set the Netlify environment variable `VITE_API_BASE_URL` to that backend's `/api` URL and redeploy to enable them.

## Notes

- Seed market data is bundled in the app so it works without external data sources.
- Forecasting is intentionally labeled as a demo model when no trained production model is available, to avoid presenting unverified AI confidence as fact.
- Sample market data is clearly treated as historical or demo data rather than live official feeds.
