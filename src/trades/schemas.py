from src.schemas import CustomBase
from datetime import datetime
from pydantic import PositiveInt, PositiveFloat, Field, field_validator
from typing import Optional, Literal


class TradeBase(CustomBase):
    """Base schema for trades"""
    account_id: PositiveInt
    type: Literal["DEPOSIT", "WITHDRAW", "BUY_STOCK", "SELL_STOCK", "TRANSFER_OUT", "TRANSFER_IN"]
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


class AccountTransferCreate(CustomBase):
    """Schema for transferring money between accounts"""
    from_account_id: PositiveInt = Field(..., description="Source account ID")
    to_account_id: PositiveInt = Field(..., description="Destination account ID")
    amount: PositiveFloat = Field(..., gt=0, description="Amount to transfer")
    description: Optional[str] = Field(None, max_length=200, description="Transfer note")
    
    @field_validator('to_account_id')
    @classmethod
    def validate_different_accounts(cls, v, info):
        if 'from_account_id' in info.data and v == info.data['from_account_id']:
            raise ValueError('Cannot transfer to the same account')
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
    from_account_id: Optional[PositiveInt] = None
    to_account_id: Optional[PositiveInt] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class TransferResponse(CustomBase):
    """Schema for transfer response"""
    transfer_id: int
    from_account_id: int
    from_account_name: str
    to_account_id: int
    to_account_name: str
    amount: float
    description: Optional[str]
    timestamp: datetime
    status: str = "completed"


class BalanceResponse(CustomBase):
    """Schema for account balance response"""
    account_id: PositiveInt
    balance: float
    last_updated: datetime


class DetailedBalanceResponse(CustomBase):
    """Schema for detailed balance breakdown"""
    account_id: int
    balance: float
    total_deposits: float
    total_withdrawals: float
    total_stock_purchases: float
    total_stock_sales: float
    total_transfers_out: float
    total_transfers_in: float