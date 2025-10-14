from pydantic import BaseModel, PositiveInt, Field
from datetime import datetime
from typing import Optional


class AccountCreate(BaseModel):
    user_id: PositiveInt
    name: str = Field(..., min_length=4, max_length=40, examples=["Main account"])


class AccountResponse(BaseModel):
    id: PositiveInt
    user_id: PositiveInt
    name: str = Field(..., min_length=4, max_length=40, examples=["Main account"])
    created_at: datetime

    class Config:
        from_attributes = True


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=4, max_length=40, examples=["Main account"])