from src.schemas import CustomBase
from datetime import datetime
from pydantic import PositiveInt, PositiveFloat, Field, field_validator
from typing import Optional, Literal


class TradeBase(CustomBase):
    """Base schema for trades"""
    account_id: PositiveInt
    type: Literal["DEPOSIT", "WITHDRAW", "BUY_STOCK", "SELL_STOCK"]
    amount: PositiveFloat
    description: Optional[str] = Field(None, max_length=200)


class MoneyTradeCreate(CustomBase):
    """Schema for depositing or withdrawing money"""
    account_id: PositiveInt
    type: Literal["DEPOSIT", "WITHDRAW"]
    amount: PositiveFloat = Field(..., gt=0, examples=[500.00])
    description: Optional[str] = Field(None, max_length=200, examples=["Monthly salary deposit"])


class StockTradeCreate(CustomBase):
    """Schema for buying or selling stocks"""
    account_id: PositiveInt
    stock_id: PositiveInt
    type: Literal["BUY_STOCK", "SELL_STOCK"]
    quantity: PositiveFloat = Field(..., gt=0, examples=[10.5])
    price: PositiveFloat = Field(..., gt=0, examples=[150.75])
    description: Optional[str] = Field(None, max_length=200, examples=["Buy AAPL shares"])
    
    @field_validator('quantity')
    @classmethod
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v


class TradeResponse(CustomBase):
    """Schema for trade responses"""
    id: PositiveInt
    account_id: PositiveInt
    type: str
    amount: float
    stock_id: Optional[PositiveInt] = None
    quantity: Optional[float] = None
    price: Optional[float] = None
    description: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class BalanceResponse(CustomBase):
    """Schema for account balance response"""
    account_id: PositiveInt
    balance: float
    last_updated: datetime