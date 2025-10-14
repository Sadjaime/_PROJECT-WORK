from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, DateTime, func
from src.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text)
    email: Mapped[str] = mapped_column(Text, unique=True, index=True)
    type: Mapped[str] = mapped_column(Text, default="user")
    password: Mapped[str] = mapped_column(Text)  # TODO: Hash passwords
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    #Relationships-Parent
    accounts: Mapped[list["Account"]] = relationship("Account",back_populates="user",cascade="all, delete-orphan")  # type: ignore