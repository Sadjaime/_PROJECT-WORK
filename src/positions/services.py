from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException
from src.positions.models import Position
from src.stocks.models import Stock
from src.accounts.models import Account
from src.trades.models import Trade
from src.positions.schemas import (PositionDetailResponse, PortfolioSummary, TradeHistoryItem, PositionTradeHistory, PositionPerformance)
from datetime import datetime
from typing import Optional


class PositionService:
    @staticmethod
    async def get_account_positions_with_details(account_id: int, session: AsyncSession) -> list[PositionDetailResponse]:
        await PositionService._verify_account_exists(account_id, session)        
        query = select(Position).where(Position.account_id == account_id, Position.quantity > 0)
        result = await session.scalars(query)
        positions = list(result.all())
        
        detailed_positions = []
        
        for position in positions:
            detail = await PositionService._build_position_detail(position, session)
            if detail:
                detailed_positions.append(detail)
        
        detailed_positions.sort(key=lambda x: x.current_value, reverse=True)
        
        return detailed_positions
    
    @staticmethod
    async def get_position_with_details(account_id: int, stock_id: int, session: AsyncSession) -> Optional[PositionDetailResponse]:
        query = select(Position).where(Position.account_id == account_id,Position.stock_id == stock_id)
        result = await session.scalars(query)
        position = result.first()
        
        if not position or position.quantity <= 0:
            return None
        
        return await PositionService._build_position_detail(position, session)
    
    @staticmethod
    async def get_portfolio_summary(account_id: int, session: AsyncSession) -> PortfolioSummary:
        positions = await PositionService.get_account_positions_with_details(account_id, session)
        
        if not positions:
            return PortfolioSummary(
                account_id=account_id,
                total_positions=0,
                total_invested=0.0,
                current_portfolio_value=0.0,
                total_unrealized_profit_loss=0.0,
                total_unrealized_profit_loss_percentage=0.0,
                best_performer=None,
                worst_performer=None,
                positions=[],
                calculated_at=datetime.now()
            )
        
        total_invested = sum(p.total_invested for p in positions)
        current_value = sum(p.current_value for p in positions)
        total_profit_loss = current_value - total_invested
        total_profit_loss_pct = ((total_profit_loss / total_invested * 100) if total_invested > 0 else 0)
        
        best = max(positions, key=lambda x: x.unrealized_profit_loss_percentage)
        worst = min(positions, key=lambda x: x.unrealized_profit_loss_percentage)
        
        best_performer = {
            "stock_id": best.stock_id,
            "stock_name": best.stock_name,
            "return_percentage": best.unrealized_profit_loss_percentage
        }
        
        worst_performer = {
            "stock_id": worst.stock_id,
            "stock_name": worst.stock_name,
            "return_percentage": worst.unrealized_profit_loss_percentage
        }
        
        return PortfolioSummary(
            account_id=account_id,
            total_positions=len(positions),
            total_invested=total_invested,
            current_portfolio_value=current_value,
            total_unrealized_profit_loss=total_profit_loss,
            total_unrealized_profit_loss_percentage=total_profit_loss_pct,
            best_performer=best_performer,
            worst_performer=worst_performer,
            positions=positions,
            calculated_at=datetime.now()
        )
    
    @staticmethod
    async def get_position_trade_history(account_id: int, stock_id: int, session: AsyncSession) -> PositionTradeHistory:
        position_query = select(Position).where(Position.account_id == account_id, Position.stock_id == stock_id)
        position_result = await session.scalars(position_query)
        position = position_result.first()
        
        stock_query = select(Stock).where(Stock.id == stock_id)
        stock_result = await session.scalars(stock_query)
        stock = stock_result.first()
        
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")
        
        trades_query = select(Trade).where(Trade.account_id == account_id, Trade.stock_id == stock_id, Trade.type.in_(["BUY_STOCK", "SELL_STOCK"])).order_by(Trade.timestamp.desc())
        
        trades_result = await session.scalars(trades_query)
        trades = list(trades_result.all())
        
        history_items = []
        total_bought = 0.0
        total_sold = 0.0
        
        for trade in trades:
            trade_quantity = trade.quantity if trade.quantity is not None else 0.0
            trade_price = trade.price if trade.price is not None else 0.0
            
            history_items.append(TradeHistoryItem(
                trade_id=trade.id,
                type=trade.type,
                quantity=trade_quantity,
                price_per_share=trade_price,
                total_amount=trade.amount,
                description=trade.description,
                timestamp=trade.timestamp
            ))
            
            if trade.type == "BUY_STOCK":
                total_bought += trade_quantity
            elif trade.type == "SELL_STOCK":
                total_sold += trade_quantity
        
        current_quantity = position.quantity if position else 0
        
        avg_price = await PositionService._calculate_average_purchase_price(
            account_id, stock_id, session
        )
        
        return PositionTradeHistory(
            account_id=account_id,
            stock_id=stock_id,
            stock_name=stock.name,
            stock_ticker=stock.symbol,
            current_quantity=current_quantity,
            total_shares_bought=total_bought,
            total_shares_sold=total_sold,
            average_purchase_price=avg_price,
            trades=history_items
        )
    
    @staticmethod
    async def get_position_performance(account_id: int, stock_id: int, session: AsyncSession) -> PositionPerformance:
        position_detail = await PositionService.get_position_with_details(account_id, stock_id, session)
        
        if not position_detail:
            raise HTTPException(status_code=404, detail="Position not found")
        
        first_trade_query = select(Trade).where(Trade.account_id == account_id, Trade.stock_id == stock_id, Trade.type == "BUY_STOCK").order_by(Trade.timestamp.asc()).limit(1)
        
        first_trade_result = await session.scalars(first_trade_query)
        first_trade = first_trade_result.first()
        
        first_purchase_date = first_trade.timestamp if first_trade else datetime.now()
        days_held = (datetime.now() - first_purchase_date.replace(tzinfo=None)).days if first_purchase_date else 0
        
        return PositionPerformance(
            account_id=account_id,
            stock_id=stock_id,
            stock_name=position_detail.stock_name,
            total_return=position_detail.unrealized_profit_loss,
            total_return_percentage=position_detail.unrealized_profit_loss_percentage,
            days_held=days_held,
            first_purchase_date=first_purchase_date
        )
    
    @staticmethod
    async def update_position(account_id: int, stock_id: int, quantity_change: float, trade_type: str, session: AsyncSession) -> Optional[Position]:
        position_query = select(Position).where(Position.account_id == account_id, Position.stock_id == stock_id)
        position_result = await session.scalars(position_query)
        position = position_result.first()
        
        if not position:
            position = Position(account_id=account_id, stock_id=stock_id, quantity=0.0)
            session.add(position)
        
        if trade_type == "BUY_STOCK":
            position.quantity += quantity_change
        elif trade_type == "SELL_STOCK":
            position.quantity -= quantity_change
        
        if position.quantity <= 0:
            await session.delete(position)
            return None
        
        return position
    
    @staticmethod
    async def _build_position_detail(position: Position, session: AsyncSession) -> Optional[PositionDetailResponse]:
        stock_query = select(Stock).where(Stock.id == position.stock_id)
        stock_result = await session.scalars(stock_query)
        stock = stock_result.first()
        
        if not stock:
            return None
        
        avg_price = await PositionService._calculate_average_purchase_price(position.account_id, position.stock_id, session)
        
        current_price = stock.average_price
        
        total_invested = position.quantity * avg_price
        current_value = position.quantity * current_price
        profit_loss = current_value - total_invested
        profit_loss_pct = ((profit_loss / total_invested * 100) if total_invested > 0 else 0)
        
        return PositionDetailResponse(
            account_id=position.account_id,
            stock_id=position.stock_id,
            stock_name=stock.name,
            stock_ticker=stock.symbol,
            quantity=position.quantity,
            average_purchase_price=avg_price,
            current_market_price=current_price,
            total_invested=total_invested,
            current_value=current_value,
            unrealized_profit_loss=profit_loss,
            unrealized_profit_loss_percentage=profit_loss_pct,
            created_at=position.created_at,
            updated_at=position.updated_at
        )
    
    @staticmethod
    async def _calculate_average_purchase_price(account_id: int, stock_id: int, session: AsyncSession) -> float:
        query = select(Trade).where(Trade.account_id == account_id, Trade.stock_id == stock_id, Trade.type == "BUY_STOCK")
        
        result = await session.scalars(query)
        buy_trades = list(result.all())
        
        if not buy_trades:
            return 0.0
        
        total_cost = sum(trade.amount for trade in buy_trades if trade.amount is not None)
        total_quantity = sum(trade.quantity for trade in buy_trades if trade.quantity is not None)
        
        return total_cost / total_quantity if total_quantity > 0 else 0.0
    
    @staticmethod
    async def _verify_account_exists(account_id: int, session: AsyncSession):
        query = select(Account).where(Account.id == account_id)
        result = await session.scalars(query)
        account = result.first()
        
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")