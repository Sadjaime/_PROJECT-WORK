from pydantic import BaseModel, PositiveInt, Field
from datetime import datetime
from typing import Optional, List
from src.schemas import CustomBase


class TopTraderResponse(CustomBase):
    user_id: PositiveInt
    user_name: str
    user_email: str
    total_accounts: int = Field(..., description="Number of accounts owned by user")
    total_positions: int = Field(..., description="Total number of stock positions")
    total_invested: float = Field(..., description="Total amount invested across all accounts")
    current_value: float = Field(..., description="Current total portfolio value")
    profit_loss: float = Field(..., description="Unrealized profit or loss")
    return_percentage: float = Field(..., description="Overall return percentage")


class RecentTradeResponse(CustomBase):
    trade_id: PositiveInt
    trader_name: str
    trader_id: PositiveInt
    trader_return: float = Field(..., description="Trader's overall return percentage")
    stock_id: PositiveInt
    stock_name: str
    stock_symbol: Optional[str] = None
    stock_price: float = Field(..., description="Current stock price")
    quantity: float = Field(..., description="Number of shares traded")
    price: float = Field(..., description="Price per share at trade time")
    total_amount: float = Field(..., description="Total trade value")
    timestamp: datetime
    description: Optional[str] = None


class TrendingStockResponse(CustomBase):
    stock_id: PositiveInt
    stock_name: str
    stock_symbol: Optional[str] = None
    current_price: float = Field(..., description="Current market price")
    purchase_count: int = Field(..., description="Number of buy trades in period")
    traders_buying: int = Field(..., description="Number of unique traders buying")
    total_invested: float = Field(..., description="Total amount invested by all traders")
    trend_score: int = Field(..., description="Trending score (purchase_count × traders_buying)")


class TraderProfileResponse(CustomBase):
    user_id: PositiveInt
    user_name: str
    member_since: datetime
    total_accounts: int
    total_invested: float
    current_value: float
    profit_loss: float
    return_percentage: float
    positions: List[dict] = Field(default_factory=list, description="List of current positions")
    recent_trades_count: int = Field(..., description="Number of recent trades")


class TopTradersListResponse(CustomBase):
    count: int
    traders: List[TopTraderResponse]


class RecentTradesListResponse(CustomBase):
    count: int
    period_days: int
    trades: List[RecentTradeResponse]


class TrendingStocksListResponse(CustomBase):
    count: int
    period_days: int
    trending_stocks: List[TrendingStockResponse]