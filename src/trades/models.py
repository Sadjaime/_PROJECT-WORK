from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, Boolean, func, DateTime, ForeignKey, Float
from src.database import Base
from typing import List
from datetime import datetime

class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"))
    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(Text)  # es. 'BUY' o 'SELL'
    quantity: Mapped[float] = mapped_column(Float)
    price: Mapped[float] = mapped_column(Float)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships-Child
    account: Mapped["Account"] = relationship("Account",back_populates="trades") # type: ignore
    stock: Mapped["Stock"] = relationship("Stock",back_populates="trades") # type: ignore
