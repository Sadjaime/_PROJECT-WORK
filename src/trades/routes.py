from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_async_session
from src.trades.schemas import (
    MoneyTradeCreate, 
    StockTradeCreate,
    AccountTransferCreate,
    TradeResponse,
    TransferResponse,
    BalanceResponse,
    DetailedBalanceResponse
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


@router.post("/transfer", response_model=TransferResponse, status_code=201)
async def transfer_between_accounts(
    payload: AccountTransferCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Transfer money from one account to another.
    
    Can transfer between:
    - Your own accounts
    - Your account to another user's account
    
    Requires sufficient balance in source account.
    Creates paired TRANSFER_OUT and TRANSFER_IN transactions.
    """
    transfer = await TradeService.transfer_between_accounts(payload, session)
    return transfer


@router.get("/account/{account_id}", response_model=List[TradeResponse])
async def get_account_trades(
    account_id: int,
    trade_type: str | None = Query(
        None, 
        description="Filter by type: DEPOSIT, WITHDRAW, BUY_STOCK, SELL_STOCK, TRANSFER_IN, TRANSFER_OUT"
    ),
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
    
    Balance = Deposits + Stock Sales + Transfers In - Withdrawals - Stock Purchases - Transfers Out
    """
    balance = await TradeService.calculate_balance(account_id, session)
    
    return BalanceResponse(
        account_id=account_id,
        balance=balance,
        last_updated=datetime.now()
    )


@router.get("/account/{account_id}/balance/detailed", response_model=DetailedBalanceResponse)
async def get_detailed_balance(
    account_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Get detailed balance breakdown for an account.
    
    Shows all components that make up the account balance.
    """
    balance_info = await TradeService.get_detailed_balance(account_id, session)
    return balance_info


@router.get("/account/{account_id}/transfers")
async def get_account_transfers(
    account_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Get all transfers (incoming and outgoing) for a specific account.
    
    Returns detailed information about each transfer including the other account involved.
    """
    transfers = await TradeService.get_account_transfers(account_id, session)
    return {"count": len(transfers), "transfers": transfers}


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