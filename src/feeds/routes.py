from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_async_session
from src.feeds.services import FeedService
from src.feeds.schemas import (
    TopTradersListResponse,
    RecentTradesListResponse, 
    TrendingStocksListResponse,
    TraderProfileResponse
)

router = APIRouter(prefix="/feed", tags=["Social Feed"])


@router.get("/top-traders", response_model=TopTradersListResponse)
async def get_top_traders(limit: int = Query(10, ge=1, le=50, description="Number of top traders to return"), session: AsyncSession = Depends(get_async_session)):
    top_traders = await FeedService.get_top_traders(session, limit)
    return {
        "count": len(top_traders),
        "traders": top_traders
    }


@router.get("/recent-trades", response_model=RecentTradesListResponse)
async def get_recent_trades_from_top_traders(limit: int = Query(20, ge=1, le=100, description="Number of trades to return"),days: int = Query(7, ge=1, le=30, description="Number of days to look back"),session: AsyncSession = Depends(get_async_session)):
    recent_trades = await FeedService.get_recent_trades_from_top_traders(session, limit, days)
    return {
        "count": len(recent_trades),
        "period_days": days,
        "trades": recent_trades
    }


@router.get("/trending-stocks", response_model=TrendingStocksListResponse)
async def get_trending_stocks(days: int = Query(7, ge=1, le=30, description="Number of days to analyze"), session: AsyncSession = Depends(get_async_session)):
    trending = await FeedService.get_trending_stocks(session, days)
    return {
        "count": len(trending),
        "period_days": days,
        "trending_stocks": trending
    }


@router.get("/trader/{user_id}", response_model=TraderProfileResponse)
async def get_trader_profile(user_id: int, session: AsyncSession = Depends(get_async_session)):
    profile = await FeedService.get_trader_profile(user_id, session)
    return profile