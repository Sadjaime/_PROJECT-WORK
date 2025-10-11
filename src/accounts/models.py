from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, Boolean, func, DateTime, ForeignKey, Float
from src.database import Base
from typing import List
from datetime import datetime


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    #Relationships-Child
    user: Mapped["User"] = relationship(back_populates="accounts") # type: ignore

    #Relationships-Parent
    positions: Mapped[List["Position"]] = relationship("Position", back_populates="account") # type: ignore
    trades: Mapped[List["Trade"]] = relationship("Trade", back_populates="account") # type: ignore
