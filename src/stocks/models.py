from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, Float, DateTime, func
from src.database import Base
from datetime import datetime
from typing import List


class Stock(Base):
    __tablename__ = "stocks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text, unique=True, index=True)
    symbol: Mapped[str | None] = mapped_column(Text, unique=True, nullable=True, index=True)
    average_price: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    #Relationships-Parent
    positions: Mapped[List["Position"]] = relationship("Position", back_populates="stock", cascade="all, delete-orphan")  # type: ignore
    trades: Mapped[List["Trade"]] = relationship("Trade", back_populates="stock", cascade="all, delete-orphan")  # type: ignore