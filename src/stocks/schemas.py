from src.schemas import CustomBase
from pydantic import PositiveInt, Field, field_validator
from datetime import datetime
from typing import Optional
import re

class StockCreate(CustomBase):
    name: str = Field(..., min_length=1, max_length=100, examples=["Apple Inc."])
    symbol: Optional[str] = Field(None, min_length=1, max_length=10, examples=["AAPL"], description="Stock symbol")
    average_price: float = Field(..., gt=0, examples=[150.75], description="Initial/current market price")
    
    @field_validator('symbol')
    @classmethod
    def validate_symbol(cls, v):
        if v is not None:
            v = v.upper().strip()
            if not re.match(r'^[A-Z]{1,10}([.-][A-Z]{1,5})?$', v):
                raise ValueError('Invalid symbol format. Use uppercase letters (e.g., AAPL, BRK.A)')
        return v

class StockResponse(CustomBase):
    id: PositiveInt
    name: str
    symbol: Optional[str] = None
    average_price: float = Field(..., description="Current market price")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StockUpdate(CustomBase):
    name: Optional[str] = Field(None, min_length=1, max_length=100, examples=["Apple Inc."])
    symbol: Optional[str] = Field(None, min_length=1, max_length=10, examples=["AAPL"])
    average_price: Optional[float] = Field(None, gt=0, examples=[155.25], description="Updated market price")
    
    @field_validator('symbol')
    @classmethod
    def validate_symbol(cls, v):
        if v is not None:
            v = v.upper().strip()
            if not re.match(r'^[A-Z]{1,10}([.-][A-Z]{1,5})?$', v):
                raise ValueError('Invalid symbol format')
        return v

class StockDetailResponse(StockResponse):
    total_holders: int = Field(..., description="Number of accounts holding this stock")
    total_shares_held: float = Field(..., description="Total shares held across all accounts")

class StockSearchResponse(CustomBase):
    id: PositiveInt
    name: str
    symbol: Optional[str] = None
    average_price: float

    class Config:
        from_attributes = True