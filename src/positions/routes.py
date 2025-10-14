from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database import get_async_session
from src.positions.models import Position
from src.positions.schemas import PositionResponse, PositionDetailResponse
from src.positions.services import PositionService

router = APIRouter(prefix="/positions", tags=["Positions"])

@router.get("/account/{account_id}", response_model=List[PositionDetailResponse])
async def get_account_positions(account_id: int,session: AsyncSession = Depends(get_async_session)):
    positions = await PositionService.get_account_positions_with_details(account_id, session)
    return positions

@router.get("/account/{account_id}/summary")
async def get_portfolio_summary(account_id: int, session: AsyncSession = Depends(get_async_session)):
    summary = await PositionService.get_portfolio_summary(account_id, session)
    return summary

@router.get("/account/{account_id}/stock/{stock_id}", response_model=PositionDetailResponse)
async def get_specific_position(account_id: int, stock_id: int, session: AsyncSession = Depends(get_async_session)):
    position = await PositionService.get_position_with_details(account_id, stock_id, session) 
    if not position:
        raise HTTPException(status_code=404, detail="Position not found for this account and stock")
    return position

@router.get("/{account_id}/stock/{stock_id}/history")
async def get_position_history(account_id: int, stock_id: int, session: AsyncSession = Depends(get_async_session)):
    history = await PositionService.get_position_trade_history(account_id, stock_id, session)
    return history