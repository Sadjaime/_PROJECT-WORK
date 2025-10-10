from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, Boolean, func, DateTime, ForeignKey, Float
from src.database import Base
from typing import List
from datetime import datetime

class Position(Base):
    __tablename__ = "positions"
    
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE", onupdate="CASCADE"))    
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    #Relationships-Child
    account_stock: Mapped["Stock"] = relationship(back_populates="account") # type: ignore
    account: Mapped["Account"] = relationship(back_populates="stocks")
