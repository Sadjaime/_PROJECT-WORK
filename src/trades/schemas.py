from src.schemas import CustomBase
from datetime import datetime
from pydantic import PositiveInt, PositiveFloat, Field


class TradeResponse(CustomBase):
    id: PositiveInt
    account_id: PositiveInt
    type: str
    stock_id: PositiveInt
    quantity: int
    price: PositiveFloat
    timestamp: datetime

class TradeCreate(CustomBase):
    id: PositiveInt
    account_id: PositiveInt
    type: str = Field("BUY", min_length=4, max_length=40, examples=["BUY","SELL"])
    stock_id: PositiveInt
    quantity: int
    price: PositiveFloat
    timestamp: datetime