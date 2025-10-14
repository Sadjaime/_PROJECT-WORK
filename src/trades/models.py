from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, func, DateTime, ForeignKey, Float
from src.database import Base
from datetime import datetime


class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE", onupdate="CASCADE"))
    type: Mapped[str] = mapped_column(Text)
    amount: Mapped[float] = mapped_column(Float)
    stock_id: Mapped[int | None] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=True)
    quantity: Mapped[float | None] = mapped_column(Float, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)    
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    #Relationships-Child
    account: Mapped["Account"] = relationship("Account", back_populates="trades")  # type: ignore
    stock: Mapped["Stock"] = relationship("Stock", back_populates="trades")  # type: ignore