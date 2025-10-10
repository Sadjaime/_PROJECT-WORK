from src.schemas import CustomBase
from datetime import datetime
from pydantic import PositiveInt, PositiveFloat, Field, EmailStr, SecretStr
from typing import Optional


class AccountResponse(CustomBase):
    id: PositiveInt
    name: str = Field(..., min_length=4, max_length=40, examples=["Paolo Rossi"])
    is_admin: bool
    email: EmailStr
    created_at: datetime

class AccountCreate(CustomBase):
    name: str = Field(..., min_length=4, max_length=40, examples=["Paolo Rossi"])
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=30, examples=["nomecognome123"])
    is_admin: bool = Field(False)

class AccountUpdate(CustomBase):
    name: Optional[str] = Field(None, min_length=4, max_length=40, examples=["Paolo Rossi"])
    email: Optional[EmailStr] = Field(None)
    password: Optional[str] = Field(None, min_length=8, max_length=30, examples=["nomecognome123"])
    is_admin: Optional[bool] = Field(False)