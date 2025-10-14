from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_async_session
from src.trades.schemas import (
    MoneyTradeCreate, 
    StockTradeCreate, 
    TradeResponse, 
    BalanceResponse
)
from src.trades.services import TradeService
from datetime import datetime

router = APIRouter(
    prefix="/trades",
    tags=["Trades"]
)


@router.post("/money", response_model=TradeResponse, status_code=201)
async def create_money_trade(
    payload: MoneyTradeCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Deposit or withdraw money from an account.
    
    - **DEPOSIT**: Add money to account
    - **WITHDRAW**: Remove money from account (checks for sufficient balance)
    """
    trade = await TradeService.process_money_trade(payload, session)
    return trade


@router.post("/stocks", response_model=TradeResponse, status_code=201)
async def create_stock_trade(
    payload: StockTradeCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Buy or sell stocks.
    
    - **BUY_STOCK**: Purchase shares (checks for sufficient balance)
    - **SELL_STOCK**: Sell shares (checks for sufficient quantity)
    
    Automatically updates positions.
    """
    trade = await TradeService.process_stock_trade(payload, session)
    return trade


@router.get("/account/{account_id}", response_model=List[TradeResponse])
async def get_account_trades(
    account_id: int,
    trade_type: str | None = Query(None, description="Filter by type: DEPOSIT, WITHDRAW, BUY_STOCK, SELL_STOCK"),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Get all trades for a specific account.
    
    Optionally filter by trade type.
    """
    trades = await TradeService.get_account_trades(account_id, session, trade_type)
    return trades


@router.get("/account/{account_id}/balance", response_model=BalanceResponse)
async def get_account_balance(
    account_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Calculate and return the current balance for an account.
    
    Balance = Sum of all deposits - withdrawals - stock purchases + stock sales
    """
    balance = await TradeService.calculate_balance(account_id, session)
    
    return BalanceResponse(
        account_id=account_id,
        balance=balance,
        last_updated=datetime.now()
    )


@router.get("/{trade_id}", response_model=TradeResponse)
async def get_trade(
    trade_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get a specific trade by ID"""
    from sqlalchemy import select
    from src.trades.models import Trade
    
    query = select(Trade).where(Trade.id == trade_id)
    result = await session.scalars(query)
    trade = result.first()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    return trade