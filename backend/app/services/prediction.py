from datetime import date, datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models import MandiPrice
from ..schemas import PredictionRequest


def _get_price_history(db: Session, crop: str, state: str, district: str, mandi: str, limit: int = 5):
    return (
        db.query(MandiPrice)
        .filter(
            MandiPrice.crop.ilike(crop),
            MandiPrice.state.ilike(state),
            MandiPrice.district.ilike(district),
            MandiPrice.mandi_name.ilike(mandi),
        )
        .order_by(MandiPrice.price_date.desc())
        .limit(limit)
        .all()
    )


def build_prediction_response(payload: PredictionRequest, db: Session):
    history = _get_price_history(db, payload.crop, payload.state, payload.district, payload.mandi, limit=5)
    if not history:
        raise HTTPException(status_code=404, detail="No historical price data available for the requested crop and mandi.")

    recent = [row.modal_price for row in history]
    trend = (recent[0] - recent[-1]) / max(len(recent) - 1, 1)
    avg_recent = sum(recent) / len(recent)
    forecast = max(0, avg_recent + (trend * payload.horizon_days) + (payload.quantity * 0.05))

    confidence = "Moderate confidence"
    warning = None
    if payload.horizon_days >= 5:
        confidence = "Low confidence"
        warning = "Forecast is for a longer horizon and should be treated with caution."

    return {
        "crop": payload.crop,
        "state": payload.state,
        "district": payload.district,
        "mandi": payload.mandi,
        "predicted_modal_price": round(forecast, 2),
        "forecast_horizon": payload.horizon_days,
        "prediction_date": date.today().isoformat(),
        "model_name": "Demo Linear Trend Model",
        "confidence": confidence,
        "warning": warning,
        "is_demo": True,
    }


def calculate_best_market_recommendations(payload: PredictionRequest, db: Session):
    candidate_markets = (
        db.query(MandiPrice)
        .filter(MandiPrice.crop.ilike(payload.crop))
        .filter(MandiPrice.state.ilike(f"%{payload.state}%"))
        .order_by(MandiPrice.modal_price.desc())
        .all()
    )

    if not candidate_markets:
        raise HTTPException(status_code=404, detail="No market data found for the requested crop.")

    local_price = payload.quantity * 0.0
    recommendations = []
    for index, market in enumerate(candidate_markets[:5], start=1):
        price_signal = market.modal_price * (1 + (payload.horizon_days / 100))
        transport_cost = max(150, market.modal_price * 0.025)
        marketing_cost = max(80, market.modal_price * 0.012)
        estimated_net_price = price_signal - transport_cost - marketing_cost
        difference_from_local = estimated_net_price - (market.modal_price - 200)

        recommendations.append(
            {
                "rank": index,
                "market_name": market.mandi_name,
                "predicted_selling_price": round(price_signal, 2),
                "transportation_cost": round(transport_cost, 2),
                "marketing_cost": round(marketing_cost, 2),
                "estimated_net_price": round(estimated_net_price, 2),
                "difference_from_local": round(difference_from_local, 2),
                "confidence": "Moderate confidence" if payload.horizon_days <= 3 else "Low confidence",
                "recommendation_reason": "Strong net return outlook based on recent mandi trend and logistics cost.",
            }
        )

    recommendations.sort(key=lambda item: item["estimated_net_price"], reverse=True)
    for idx, item in enumerate(recommendations, start=1):
        item["rank"] = idx
    return recommendations
