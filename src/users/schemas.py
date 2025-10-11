from src.schemas import CustomBase
from datetime import datetime
from pydantic import PositiveInt, PositiveFloat, Field, EmailStr, SecretStr
from typing import Optional, Literal


class UserResponse(CustomBase):
    id: PositiveInt
    name: str = Field(..., min_length=4, max_length=40, examples=["Paolo Rossi"])
    type: str = Field("user", min_length=4, max_length=4)
    email: EmailStr
    created_at: datetime

class UserCreate(CustomBase):
    name: str = Field(..., min_length=4, max_length=40, examples=["Paolo Rossi"])
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=30, examples=["nomecognome123"])
    type: Optional[Literal["user"]] = Field("user")

class UserUpdate(CustomBase):
    name: Optional[str] = Field(None, min_length=4, max_length=40, examples=["Paolo Rossi"])
    email: Optional[EmailStr] = Field(None)
    password: Optional[str] = Field(None, min_length=8, max_length=30, examples=["nomecognome123"])