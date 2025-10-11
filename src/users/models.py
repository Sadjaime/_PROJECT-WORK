from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, Boolean, func, DateTime, ForeignKey, Float
from src.database import Base
from typing import List, Literal
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text)
    email: Mapped[str] = mapped_column(Text, unique=True)
    type: Mapped[str] = mapped_column(Text)
    password: Mapped[str] = mapped_column(Text)  # TODO: store hashed pass instead of plain str
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    #Relationships-Parent
    accounts: Mapped[List["Account"]] = relationship("Account",back_populates="user") # type: ignore