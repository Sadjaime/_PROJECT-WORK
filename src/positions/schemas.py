from src.schemas import CustomBase
from datetime import datetime
from pydantic import PositiveInt, Field
from typing import Optional

class PositionBase(CustomBase):
    account_id: PositiveInt
    stock_id: PositiveInt
    quantity: float = Field(..., ge=0, description="Number of shares held")

class PositionResponse(CustomBase):
    account_id: PositiveInt
    stock_id: PositiveInt
    quantity: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PositionDetailResponse(CustomBase):
    account_id: PositiveInt
    stock_id: PositiveInt
    stock_name: str = Field(..., description="Name of the stock")
    stock_ticker: Optional[str] = Field(None, description="Stock ticker symbol")
    quantity: float = Field(..., description="Number of shares held")
    
    average_purchase_price: float = Field(..., description="Average price paid per share")
    current_market_price: float = Field(..., description="Current market price per share")
    
    total_invested: float = Field(..., description="Total amount invested (quantity * avg_price)")
    current_value: float = Field(..., description="Current market value (quantity * current_price)")
    
    unrealized_profit_loss: float = Field(..., description="Profit/loss if sold now")
    unrealized_profit_loss_percentage: float = Field(..., description="Profit/loss as percentage")
    
    created_at: datetime
    updated_at: datetime

class PortfolioSummary(CustomBase):
    account_id: PositiveInt
    
    total_positions: int = Field(..., description="Number of different stocks held")
    total_invested: float = Field(..., description="Total cash invested in stocks")
    current_portfolio_value: float = Field(..., description="Current total value of all positions")
    
    total_unrealized_profit_loss: float = Field(..., description="Total unrealized profit/loss")
    total_unrealized_profit_loss_percentage: float = Field(..., description="Overall return percentage")
    
    best_performer: Optional[dict] = Field(None, description="Stock with highest return %")
    worst_performer: Optional[dict] = Field(None, description="Stock with lowest return %")
    
    positions: list[PositionDetailResponse] = Field(default_factory=list)
    
    calculated_at: datetime = Field(default_factory=datetime.now)

class TradeHistoryItem(CustomBase):
    trade_id: PositiveInt
    type: str = Field(..., description="BUY_STOCK or SELL_STOCK")
    quantity: float
    price_per_share: float
    total_amount: float
    description: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class PositionTradeHistory(CustomBase):
    account_id: PositiveInt
    stock_id: PositiveInt
    stock_name: str
    stock_ticker: Optional[str] = None
    
    current_quantity: float
    
    total_shares_bought: float
    total_shares_sold: float
    average_purchase_price: float
    
    trades: list[TradeHistoryItem] = Field(default_factory=list)

class PositionPerformance(CustomBase):
    account_id: PositiveInt
    stock_id: PositiveInt
    stock_name: str
    
    total_return: float = Field(..., description="Total $ gained/lost")
    total_return_percentage: float = Field(..., description="Total % return")
    
    days_held: int = Field(..., description="Number of days position has been held")
    first_purchase_date: datetime