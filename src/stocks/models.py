from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, Boolean, func, DateTime, Float, ForeignKey
from src.database import Base
from datetime import datetime
from typing import List

class Stock(Base):
    __tablename__="stocks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text)
    average_price: Mapped[float] = mapped_column(Float, default=0.0)

    #Relationships-Parent
    account: Mapped[List["AccountStock"]] = relationship(back_populates="account_stock")
