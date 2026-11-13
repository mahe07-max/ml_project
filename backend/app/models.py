from sqlalchemy import Boolean, Column, Float, Integer, String, Date

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    village = Column(String, nullable=False)
    preferred_language = Column(String, default="English")
    is_active = Column(Boolean, default=True)


class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String, index=True, nullable=False)
    state = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    mandi_name = Column(String, index=True, nullable=False)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    arrival_quantity = Column(Float, default=0.0)
    price_date = Column(Date, nullable=False)
