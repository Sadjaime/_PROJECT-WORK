from src.schemas import CustomBase
from datetime import datetime
from pydantic import PositiveInt, PositiveFloat, Field, EmailStr, SecretStr, BaseModel
from typing import Optional

class AccountBase(BaseModel):
    id: PositiveInt
    user_id: PositiveInt
    name: str = Field(..., min_length=4, max_length=40, examples=["Conto principale"])
    balance: Optional[float] = 0.0


class AccountCreate(AccountBase):
    pass

class AccountResponse(CustomBase):
    id: PositiveInt
    user_id: PositiveInt
    name: str = Field(..., min_length=4, max_length=40, examples=["Conto principale"])
    balance: float
    created_at: datetime

class AccountUpdate(CustomBase):
    name: Optional[str] = Field(None, min_length=4, max_length=40, examples=["Paolo Rossi"])