from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from fastapi import HTTPException
from src.stocks.models import Stock
from src.positions.models import Position
from src.accounts.models import Account
from src.stocks.schemas import StockCreate, StockUpdate, StockDetailResponse
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import random
import math


class StockService:
    @staticmethod
    async def create_stock(payload: StockCreate, session: AsyncSession) -> Stock:
        if payload.symbol:
            existing_query = select(Stock).where((Stock.name == payload.name) | (Stock.symbol == payload.symbol))
        else:
            existing_query = select(Stock).where(Stock.name == payload.name)
        existing_result = await session.scalars(existing_query)
        existing_stock = existing_result.first()
        if existing_stock:
            if existing_stock.name == payload.name:
                raise HTTPException(status_code=400, detail="Stock with this name already exists")
            if payload.symbol and existing_stock.symbol == payload.symbol:
                raise HTTPException(status_code=400, detail="Stock with this symbol already exists")
        new_stock = Stock(name=payload.name, symbol=payload.symbol, average_price=payload.average_price)
        session.add(new_stock)
        await session.commit()
        await session.refresh(new_stock)
        return new_stock
    
    @staticmethod
    async def get_all_stocks(session: AsyncSession) -> list[Stock]:
        query = select(Stock)
        result = await session.scalars(query)
        return list(result.all())

    @staticmethod
    async def get_stock_with_details(stock_id: int, session: AsyncSession) -> StockDetailResponse:
        stock_query = select(Stock).where(Stock.id == stock_id)
        stock_result = await session.scalars(stock_query)
        stock = stock_result.first()
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")
        positions_query = select(Position).where(Position.stock_id == stock_id, Position.quantity > 0)
        positions_result = await session.scalars(positions_query)
        positions = positions_result.all()
        total_holders = len(positions)
        total_shares_held = sum(p.quantity for p in positions)
        return StockDetailResponse(
            id=stock.id,
            name=stock.name,
            symbol=stock.symbol,
            average_price=stock.average_price,
            price_history=stock.price_history,
            created_at=stock.created_at,
            updated_at=stock.updated_at,
            total_holders=total_holders,
            total_shares_held=total_shares_held
        )

    @staticmethod
    async def update_stock(stock_id: int, payload: StockUpdate, session: AsyncSession) -> Stock:
        stock_query = select(Stock).where(Stock.id == stock_id)
        stock_result = await session.scalars(stock_query)
        stock = stock_result.first()
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(stock, field, value)
        await session.commit()
        await session.refresh(stock)
        return stock

    @staticmethod
    async def search_stocks(query: str, session: AsyncSession, limit: int = 20) -> list[Stock]:
        search_query = select(Stock).where((Stock.name.ilike(f"%{query}%")) | (Stock.symbol.ilike(f"%{query}%"))).limit(limit)
        result = await session.scalars(search_query)
        return list(result.all())

    

    @staticmethod
    async def get_stock_holders(stock_id: int, session: AsyncSession) -> dict:
        stock_query = select(Stock).where(Stock.id == stock_id)
        stock_result = await session.scalars(stock_query)
        stock = stock_result.first()
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")
        positions_query = select(Position).where(Position.stock_id == stock_id, Position.quantity > 0)
        positions_result = await session.scalars(positions_query)
        positions = positions_result.all()
        holders = []
        total_shares = 0
        for position in positions:
            account_query = select(Account).where(Account.id == position.account_id)
            account_result = await session.scalars(account_query)
            account = account_result.first()
            if account:
                total_shares += position.quantity
                holders.append({"account_id": account.id, "account_name": account.name, "quantity": position.quantity, "last_updated": getattr(position, "updated_at", None)})
        for holder in holders:
            holder["ownership_percentage"] = ((holder["quantity"] / total_shares * 100) if total_shares > 0 else 0)
        holders.sort(key=lambda x: x["quantity"], reverse=True)
        return {"stock_id": stock_id, "stock_name": stock.name, "symbol": stock.symbol, "current_price": stock.average_price, "total_holders": len(holders), "total_shares_held": total_shares, "holders": holders}

    @staticmethod
    async def validate_stock_exists(stock_id: int, session: AsyncSession) -> Stock:
        query = select(Stock).where(Stock.id == stock_id)
        result = await session.scalars(query)
        stock = result.first()
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")
        return stock
    
    @staticmethod
    async def delete_stock(stock_id: int, session: AsyncSession):
        query = select(Stock).where(Stock.id == stock_id)
        query_result = await session.scalars(query)
        stock = query_result.first()
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")
        await session.delete(stock)
        await session.commit()
        return None
    
    @staticmethod
    async def get_top_stocks_performers(session: AsyncSession, limit: int = 3) -> List[Dict]:
        query = select(Stock)
        result = await session.scalars(query)
        stocks = result.all()
        
        performers = []
        
        for stock in stocks:
            if not stock.price_history or len(stock.price_history) < 2:
                continue
            sorted_dates = sorted(stock.price_history.keys())            
            last_price = stock.price_history[sorted_dates[-2]]
            current_price = stock.price_history[sorted_dates[-1]]            
            price_change = current_price - last_price
            price_change_percent = (price_change / last_price * 100) if last_price > 0 else 0
            
            performers.append({
                "id": stock.id,
                "name": stock.name,
                "symbol": stock.symbol if hasattr(stock, 'symbol') else f"STK{stock.id}",
                "current_price": current_price,
                "last_price": last_price,
                "price_change": round(price_change, 4),
                "price_change_percent": round(price_change_percent, 2),
                "price_history": stock.price_history,
                "period_start": sorted_dates[-2],
                "period_end": sorted_dates[-1]
            })
        
        performers.sort(key=lambda x: x["price_change_percent"], reverse=True)
        
        return performers[:limit]
    
    @staticmethod
    async def get_worst_stocks_performers(session: AsyncSession, limit: int = 3) -> List[Dict]:
        query = select(Stock)
        result = await session.scalars(query)
        stocks = result.all()
        
        performers = []
        
        for stock in stocks:
            if not stock.price_history or len(stock.price_history) < 2:
                continue            
            sorted_dates = sorted(stock.price_history.keys())           
            last_price = stock.price_history[sorted_dates[-2]]
            current_price = stock.price_history[sorted_dates[-1]]
            price_change = current_price - last_price
            price_change_percent = (price_change / last_price * 100) if last_price > 0 else 0
            
            performers.append({
                "id": stock.id,
                "name": stock.name,
                "symbol": stock.symbol if hasattr(stock, 'symbol') else f"STK{stock.id}",
                "current_price": current_price,
                "last_price": last_price,
                "price_change": round(price_change, 4),
                "price_change_percent": round(price_change_percent, 2),
                "price_history": stock.price_history,
                "period_start": sorted_dates[-2],
                "period_end": sorted_dates[-1]
            })
        
        performers.sort(key=lambda x: x["price_change_percent"])
        
        return performers[:limit]
    
    @staticmethod
    async def get_most_traded_stocks(session: AsyncSession, limit: int = 10) -> list[dict]:
        """Get most traded stocks by number of holders and total quantity"""
        query = select(
            Stock.id,
            Stock.name,
            Stock.symbol,
            Stock.average_price,
            func.count(Position.account_id).label('holder_count'),
            func.sum(Position.quantity).label('total_quantity')
        ).join(Position, Stock.id == Position.stock_id) \
         .where(Position.quantity > 0) \
         .group_by(Stock.id, Stock.name, Stock.symbol, Stock.average_price) \
         .order_by(desc('holder_count'), desc('total_quantity')) \
         .limit(limit)
        
        result = await session.execute(query)
        rows = result.all()
        
        return [
            {
                "stock": {
                    "id": row.id,
                    "name": row.name,
                    "symbol": row.symbol,
                    "average_price": row.average_price
                },
                "holder_count": row.holder_count,
                "total_quantity": float(row.total_quantity) if row.total_quantity else 0.0
            }
            for row in rows
        ]
    
    @staticmethod
    async def get_market_overview(session: AsyncSession) -> Dict:
        top_performers = await StockService.get_top_stocks_performers(session, limit=10)
        worst_performers = await StockService.get_worst_stocks_performers(session, limit=10)        
        query = select(Stock)
        result = await session.scalars(query)
        all_stocks = result.all()        
        stocks_with_history = [s for s in all_stocks if s.price_history and len(s.price_history) >= 2]        
        gainers = len([s for s in stocks_with_history if s.price_history and 
                       list(s.price_history.values())[-1] > list(s.price_history.values())[-2]])
        losers = len(stocks_with_history) - gainers
        
        return {
            "total_stocks": len(all_stocks),
            "stocks_with_data": len(stocks_with_history),
            "gainers": gainers,
            "losers": losers,
            "top_performers": top_performers,
            "worst_performers": worst_performers,
            "last_updated": datetime.now().isoformat()
        }