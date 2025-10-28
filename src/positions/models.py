from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Float, DateTime, ForeignKey, func, UniqueConstraint
from src.database import Base
from datetime import datetime


class Position(Base):
    __tablename__ = "positions"
    
    account_id: Mapped[int] = mapped_column(Integer, ForeignKey("accounts.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    stock_id: Mapped[int] = mapped_column(Integer, ForeignKey("stocks.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)    
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    average_purchase_price: Mapped[float] = mapped_column(Float, default=0.0)  # NEW FIELD
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    #Relationships-Child
    stock: Mapped["Stock"] = relationship("Stock", back_populates="positions")  # type: ignore
    account: Mapped["Account"] = relationship("Account", back_populates="positions")  # type: ignore
    
    __table_args__ = (UniqueConstraint('account_id', 'stock_id', name='unique_account_stock'),)