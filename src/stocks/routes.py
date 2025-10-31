from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_async_session
from src.stocks.models import Stock
from src.stocks.services import StockService
from sqlalchemy import select
from src.stocks.schemas import StockResponse, StockCreate, StockUpdate

router = APIRouter(prefix="/stocks", tags=["Stocks"])


@router.get("/", response_model=List[StockResponse])
async def get_stocks(session: AsyncSession = Depends(get_async_session)):
    result = await StockService.get_all_stocks(session)
    return result


@router.post("/", response_model=StockResponse, status_code=201)
async def create_stock(payload: StockCreate, session: AsyncSession = Depends(get_async_session)):    
    new_stock = await StockService.create_stock(payload, session)
    return new_stock


@router.get("/performance/top", tags=["Stock Performance"])
async def get_top_performers(limit: int = 10, session: AsyncSession = Depends(get_async_session)):
    performers = await StockService.get_top_stocks_performers(session, limit)
    return {"count": len(performers), "stocks": performers}


@router.get("/performance/worst", tags=["Stock Performance"])
async def get_worst_performers(limit: int = 10, session: AsyncSession = Depends(get_async_session)):
    performers = await StockService.get_worst_stocks_performers(session, limit)
    return {"count": len(performers), "stocks": performers}


@router.get("/performance/overview", tags=["Stock Performance"])
async def get_market_overview(session: AsyncSession = Depends(get_async_session)):
    overview = await StockService.get_market_overview(session)
    return overview


@router.get("/most-traded", response_model=dict)
async def get_most_traded_stocks(limit: int = 10, session: AsyncSession = Depends(get_async_session)):
    most_traded_stocks = await StockService.get_most_traded_stocks(session, limit)
    return {"count":len(most_traded_stocks), "stocks": most_traded_stocks}


@router.get("/search", response_model=list[StockResponse])
async def search_stocks(query: str, session: AsyncSession = Depends(get_async_session)):
    stocks_list = await StockService.search_stocks(query, session)
    return stocks_list


@router.get("/{stock_id}", response_model=StockResponse)
async def get_stock(stock_id: int, session: AsyncSession = Depends(get_async_session)):
    result = await StockService.get_stock_with_details(stock_id, session)
    return result


@router.get("/{stock_id}/holders")
async def get_stock_holders(stock_id: int, session: AsyncSession = Depends(get_async_session)):
    stock_holders = await StockService.get_stock_holders(stock_id, session)
    return stock_holders


@router.patch("/{stock_id}", response_model=StockResponse)
async def update_stock(stock_id: int, payload: StockUpdate, session: AsyncSession = Depends(get_async_session)):
    stock = await StockService.update_stock(stock_id, payload, session)
    return stock


@router.delete("/{stock_id}", status_code=204)
async def delete_stock(stock_id: int, session: AsyncSession = Depends(get_async_session)):
    await StockService.delete_stock(stock_id, session)
    return None