from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from fastapi import HTTPException
from src.users.models import User
from src.accounts.models import Account
from src.positions.models import Position
from src.stocks.models import Stock
from src.trades.models import Trade
from src.positions.services import PositionService
from src.trades.services import TradeService
from typing import List, Dict
from datetime import datetime, timedelta
from collections import Counter


class FeedService:
    @staticmethod
    async def get_top_traders(session: AsyncSession, limit: int = 10) -> List[Dict]:
        users_query = select(User)
        users_result = await session.scalars(users_query)
        users = list(users_result.all())
        
        traders_performance = []
        
        for user in users:
            accounts_query = select(Account).where(Account.user_id == user.id)
            accounts_result = await session.scalars(accounts_query)
            accounts = list(accounts_result.all())
            
            if not accounts:
                continue
            
            total_invested = 0.0
            total_current_value = 0.0
            total_profit_loss = 0.0
            num_positions = 0
            
            for account in accounts:
                try:
                    portfolio = await PositionService.get_portfolio_summary(account.id, session)
                    
                    if portfolio.total_positions > 0:
                        total_invested += portfolio.total_invested
                        total_current_value += portfolio.current_portfolio_value
                        total_profit_loss += portfolio.total_unrealized_profit_loss
                        num_positions += portfolio.total_positions
                except Exception:
                    continue
            
            if num_positions > 0 and total_invested > 0:
                return_percentage = (total_profit_loss / total_invested * 100)
                
                traders_performance.append({
                    "user_id": user.id,
                    "user_name": user.name,
                    "user_email": user.email,
                    "total_accounts": len(accounts),
                    "total_positions": num_positions,
                    "total_invested": round(total_invested, 2),
                    "current_value": round(total_current_value, 2),
                    "profit_loss": round(total_profit_loss, 2),
                    "return_percentage": round(return_percentage, 2)
                })
        
        traders_performance.sort(key=lambda x: x["return_percentage"], reverse=True)
        
        return traders_performance[:limit]
    
    @staticmethod
    async def get_recent_trades_from_top_traders(session: AsyncSession,  limit: int = 20, days: int = 7) -> List[Dict]:
        top_traders = await FeedService.get_top_traders(session, limit=10)
        
        if not top_traders:
            return []
        
        top_user_ids = [trader["user_id"] for trader in top_traders]
        
        cutoff_date = datetime.now() - timedelta(days=days)
        
        accounts_query = select(Account).where(Account.user_id.in_(top_user_ids))
        accounts_result = await session.scalars(accounts_query)
        accounts = list(accounts_result.all())
        account_ids = [acc.id for acc in accounts]
        
        if not account_ids:
            return []
        
        trades_query = select(Trade).where(
            Trade.account_id.in_(account_ids),
            Trade.type == "BUY_STOCK",
            Trade.timestamp >= cutoff_date
        ).order_by(Trade.timestamp.desc()).limit(limit)
        
        trades_result = await session.scalars(trades_query)
        trades = list(trades_result.all())
        
        recent_trades = []
        
        for trade in trades:
            account = next((acc for acc in accounts if acc.id == trade.account_id), None)
            if not account:
                continue
            
            trader = next((t for t in top_traders if t["user_id"] == account.user_id), None)
            if not trader:
                continue
            
            stock_query = select(Stock).where(Stock.id == trade.stock_id)
            stock_result = await session.scalars(stock_query)
            stock = stock_result.first()
            
            if not stock:
                continue
            
            recent_trades.append({
                "trade_id": trade.id,
                "trader_name": trader["user_name"],
                "trader_id": trader["user_id"],
                "trader_return": trader["return_percentage"],
                "stock_id": stock.id,
                "stock_name": stock.name,
                "stock_symbol": stock.symbol,
                "stock_price": stock.average_price,
                "quantity": trade.quantity,
                "price": trade.price,
                "total_amount": trade.amount,
                "timestamp": trade.timestamp,
                "description": trade.description
            })
        
        return recent_trades
    
    @staticmethod
    async def get_trending_stocks(session: AsyncSession, days: int = 7) -> List[Dict]:
        top_traders = await FeedService.get_top_traders(session, limit=10)
        
        if not top_traders:
            return []
        
        top_user_ids = [trader["user_id"] for trader in top_traders]
        
        accounts_query = select(Account).where(Account.user_id.in_(top_user_ids))
        accounts_result = await session.scalars(accounts_query)
        accounts = list(accounts_result.all())
        account_ids = [acc.id for acc in accounts]
        
        if not account_ids:
            return []
        
        cutoff_date = datetime.now() - timedelta(days=days)
        trades_query = select(Trade).where(
            Trade.account_id.in_(account_ids),
            Trade.type == "BUY_STOCK",
            Trade.timestamp >= cutoff_date
        )
        
        trades_result = await session.scalars(trades_query)
        trades = list(trades_result.all())
        stock_counter = Counter()
        stock_total_invested = {}
        
        for trade in trades:
            stock_counter[trade.stock_id] += 1
            stock_total_invested[trade.stock_id] = stock_total_invested.get(trade.stock_id, 0) + trade.amount
        
        trending_stocks = []
        
        for stock_id, purchase_count in stock_counter.most_common(10):
            stock_query = select(Stock).where(Stock.id == stock_id)
            stock_result = await session.scalars(stock_query)
            stock = stock_result.first()
            
            if not stock:
                continue
            
            traders_buying = set()
            for trade in trades:
                if trade.stock_id == stock_id:
                    account = next((acc for acc in accounts if acc.id == trade.account_id), None)
                    if account:
                        traders_buying.add(account.user_id)
            
            trending_stocks.append({
                "stock_id": stock.id,
                "stock_name": stock.name,
                "stock_symbol": stock.symbol,
                "current_price": stock.average_price,
                "purchase_count": purchase_count,
                "traders_buying": len(traders_buying),
                "total_invested": round(stock_total_invested[stock_id], 2),
                "trend_score": purchase_count * len(traders_buying)
            })
        
        trending_stocks.sort(key=lambda x: x["trend_score"], reverse=True)
        
        return trending_stocks
    
    @staticmethod
    async def get_trader_profile(user_id: int, session: AsyncSession) -> Dict:
        user_query = select(User).where(User.id == user_id)
        user_result = await session.scalars(user_query)
        user = user_result.first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        accounts_query = select(Account).where(Account.user_id == user_id)
        accounts_result = await session.scalars(accounts_query)
        accounts = list(accounts_result.all())
        
        total_invested = 0.0
        total_current_value = 0.0
        total_profit_loss = 0.0
        all_positions = []
        
        for account in accounts:
            try:
                portfolio = await PositionService.get_portfolio_summary(account.id, session)
                
                if portfolio.total_positions > 0:
                    total_invested += portfolio.total_invested
                    total_current_value += portfolio.current_portfolio_value
                    total_profit_loss += portfolio.total_unrealized_profit_loss
                    
                    for position in portfolio.positions:
                        all_positions.append({
                            "stock_id": position.stock_id,
                            "stock_name": position.stock_name,
                            "stock_ticker": position.stock_ticker,
                            "quantity": position.quantity,
                            "profit_loss_percentage": position.unrealized_profit_loss_percentage
                        })
            except Exception:
                continue
        
        account_ids = [acc.id for acc in accounts]
        trades_query = select(Trade).where(
            Trade.account_id.in_(account_ids),
            Trade.type.in_(["BUY_STOCK", "SELL_STOCK"])
        ).order_by(Trade.timestamp.desc()).limit(10)
        
        trades_result = await session.scalars(trades_query)
        recent_trades = list(trades_result.all())
        
        return_percentage = (total_profit_loss / total_invested * 100) if total_invested > 0 else 0
        
        return {
            "user_id": user.id,
            "user_name": user.name,
            "member_since": user.created_at,
            "total_accounts": len(accounts),
            "total_invested": round(total_invested, 2),
            "current_value": round(total_current_value, 2),
            "profit_loss": round(total_profit_loss, 2),
            "return_percentage": round(return_percentage, 2),
            "positions": all_positions,
            "recent_trades_count": len(recent_trades)
        }