from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Float, DateTime, ForeignKey, func
from src.database import Base
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.accounts.models import Account
    from src.stocks.models import Stock


class Position(Base):
    __tablename__ = "positions"

    account_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("accounts.id", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True  # Part 1 of composite key
    )
    
    stock_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("stocks.id", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True  # Part 2 of composite key
    )
    
    quantity: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    average_purchase_price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships - Child
    account: Mapped["Account"] = relationship("Account", back_populates="positions")
    stock: Mapped["Stock"] = relationship("Stock", back_populates="positions")
    
    def __repr__(self):
        return f"<Position(account_id={self.account_id}, stock_id={self.stock_id}, quantity={self.quantity})>"