from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, DateTime, ForeignKey, func
from src.database import Base
from datetime import datetime


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    #Relationships-Child
    user: Mapped["User"] = relationship("User", back_populates="accounts")  # type: ignore

    #Relationships-Parent
    positions: Mapped[list["Position"]] = relationship("Position", back_populates="account",cascade="all, delete-orphan")  # type: ignore
    trades: Mapped[list["Trade"]] = relationship("Trade", back_populates="account", cascade="all, delete-orphan")  # type: ignore