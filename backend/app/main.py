import os
from datetime import date, datetime
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from .auth import create_access_token, get_current_user, get_password_hash, verify_password
from .database import get_db
from .models import MandiPrice, User
from .schemas import MarketFilter, MarketPrice, PredictionRequest, PredictionResponse, RecommendationItem, Token, UserCreate, UserLogin, UserOut
from .services.market_data import CROP_CATALOG, INDIAN_STATES_AND_UTS, TAMIL_NADU_DISTRICTS, get_crop_catalog
from .services.prediction import build_prediction_response, calculate_best_market_recommendations

app = FastAPI(title="AgriWise AI API", version="1.0.0")

cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
cors_origins.extend(
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "").split(",")
    if origin.strip()
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "AgriWise AI backend running"}


@app.get("/api/catalog/crops")
def get_crop_catalog_api():
    grouped = {}
    for entry in get_crop_catalog():
        category = entry["category"]
        grouped.setdefault(category, []).append({
            "crop": entry["crop"],
            "tamil_name": entry.get("tamil_name"),
            "aliases": entry.get("aliases", []),
        })

    return {
        "total_crops": len(get_crop_catalog()),
        "categories": [
            {"category": category, "crops": crops}
            for category, crops in grouped.items()
        ],
    }


@app.get("/api/catalog/regions")
def get_regions_catalog():
    return {
        "states": sorted(set(INDIAN_STATES_AND_UTS)),
        "tamil_nadu_districts": TAMIL_NADU_DISTRICTS,
    }


@app.get("/api/catalog/locations")
def get_location_catalog(
    state: str | None = Query(default=None),
    district: str | None = Query(default=None),
    crop: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    district_query = db.query(MandiPrice.district)
    market_query = db.query(MandiPrice.mandi_name)

    if state:
        district_query = district_query.filter(MandiPrice.state.ilike(state.strip()))
        market_query = market_query.filter(MandiPrice.state.ilike(state.strip()))
    if district:
        market_query = market_query.filter(MandiPrice.district.ilike(district.strip()))
    if crop:
        market_query = market_query.filter(MandiPrice.crop.ilike(crop.strip()))

    districts = [
        row[0]
        for row in district_query.distinct().order_by(MandiPrice.district).all()
    ]
    markets = [
        row[0]
        for row in market_query.distinct().order_by(MandiPrice.mandi_name).all()
    ]
    return {"districts": districts, "markets": markets}


@app.post("/api/auth/register", response_model=UserOut)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user = User(
        full_name=payload.full_name,
        email=payload.email.lower(),
        phone_number=payload.phone_number,
        password_hash=get_password_hash(payload.password),
        state=payload.state,
        district=payload.district,
        village=payload.village,
        preferred_language=payload.preferred_language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login", response_model=Token)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/api/markets", response_model=list[MarketPrice])
def get_markets(
    crop: str | None = Query(default=None),
    state: str | None = Query(default=None),
    district: str | None = Query(default=None),
    mandi: str | None = Query(default=None),
    sort_by: str = Query(default="modal_price"),
    db: Session = Depends(get_db),
):
    query = db.query(MandiPrice)
    if crop:
        query = query.filter(MandiPrice.crop.ilike(f"%{crop}%"))
    if state:
        query = query.filter(MandiPrice.state.ilike(f"%{state}%"))
    if district:
        query = query.filter(MandiPrice.district.ilike(f"%{district}%"))
    if mandi:
        query = query.filter(MandiPrice.mandi_name.ilike(f"%{mandi}%"))

    if sort_by == "modal_price":
        query = query.order_by(MandiPrice.modal_price.desc())
    elif sort_by == "date":
        query = query.order_by(MandiPrice.price_date.desc())
    elif sort_by == "arrival_quantity":
        query = query.order_by(MandiPrice.arrival_quantity.desc())
    else:
        query = query.order_by(MandiPrice.modal_price.desc())

    return query.all()


@app.post("/api/predict", response_model=PredictionResponse)
def predict_crop_price(payload: PredictionRequest, db: Session = Depends(get_db)):
    return build_prediction_response(payload, db)


@app.post("/api/recommend", response_model=list[RecommendationItem])
def recommend_market(payload: PredictionRequest, db: Session = Depends(get_db)):
    recommendation = calculate_best_market_recommendations(payload, db)
    return recommendation


@app.get("/api/dashboard")
def get_dashboard_summary(db: Session = Depends(get_db)):
    crops = db.query(MandiPrice.crop).distinct().all()
    states = db.query(MandiPrice.state).distinct().count()
    districts = db.query(MandiPrice.district).distinct().count()
    markets = db.query(MandiPrice.mandi_name).distinct().count()
    latest_modal = db.query(MandiPrice.modal_price).order_by(MandiPrice.price_date.desc()).first()
    avg_price = db.query(func.avg(MandiPrice.modal_price)).scalar() or 0

    return {
        "welcome_message": "Welcome back to AgriWise AI",
        "subtitle": "Tamil Nadu is now the primary focus, with nationwide market coverage across Indian states and regulated mandis.",
        "stats": {
            "crop_count": len(crops),
            "state_count": states,
            "district_count": districts,
            "market_count": markets,
            "latest_modal_price": float(latest_modal[0]) if latest_modal else 0.0,
            "average_price": float(avg_price),
        },
        "recent_searches": [
            {"crop": "Rice", "market": "Coimbatore Regulated Market", "date": "2026-11-06"},
            {"crop": "Groundnut", "market": "Madurai Regulated Market", "date": "2026-11-06"},
            {"crop": "Cotton", "market": "Tiruppur Regulated Market", "date": "2026-11-05"},
        ],
    }
