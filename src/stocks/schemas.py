from src.schemas import CustomBase

from pydantic import PositiveInt, PositiveFloat, Field


class StockResponse(CustomBase):
    id: PositiveInt
    name: str = Field(..., min_length=4, max_length=40)
    average_price: PositiveFloat