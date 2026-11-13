from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str
    password: str = Field(..., min_length=6)
    state: str
    district: str
    village: str
    preferred_language: str = "English"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: str
    state: str
    district: str
    village: str
    preferred_language: str

    class Config:
        from_attributes = True


class MarketPrice(BaseModel):
    id: int
    crop: str
    state: str
    district: str
    mandi_name: str
    min_price: float
    max_price: float
    modal_price: float
    arrival_quantity: float
    price_date: date

    class Config:
        from_attributes = True


class PredictionRequest(BaseModel):
    crop: str
    state: str
    district: str
    mandi: str
    quantity: float = Field(..., gt=0)
    horizon_days: int = Field(default=3, ge=1, le=7)


class PredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    crop: str
    state: str
    district: str
    mandi: str
    predicted_modal_price: float
    forecast_horizon: int
    prediction_date: str
    model_name: str
    confidence: str
    warning: Optional[str] = None
    is_demo: bool = True


class RecommendationItem(BaseModel):
    rank: int
    market_name: str
    predicted_selling_price: float
    transportation_cost: float
    marketing_cost: float
    estimated_net_price: float
    difference_from_local: float
    confidence: str
    recommendation_reason: str


class MarketFilter(BaseModel):
    crop: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    sort_by: str = "modal_price"
