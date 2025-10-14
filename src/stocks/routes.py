from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_async_session
from src.stocks.models import Stock
from sqlalchemy import select
from src.stocks.schemas import StockResponse

router = APIRouter(
    prefix="/stocks",
    tags=["Stocks"]
)

@router.get("/stocks", response_model=List[StockResponse])
async def get_stocks(session: AsyncSession = Depends(get_async_session)):
    query = select(Stock)
    query_result = await session.scalars(query)
    result = query_result.all()
    return result


