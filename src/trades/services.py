# ...existing code...
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException
from src.trades.models import Trade
from src.accounts.models import Account
from src.stocks.models import Stock
from src.positions.models import Position
from src.trades.schemas import MoneyTradeCreate, StockTradeCreate
from datetime import datetime


class TradeService:
    @staticmethod
    async def calculate_balance(account_id: int, session: AsyncSession) -> float:
        query = select(Trade).where(Trade.account_id == account_id)
        result = await session.scalars(query)
        trades = result.all()
        balance = 0.0
        for trade in trades:
            if trade.type == "DEPOSIT":
                balance += trade.amount
            elif trade.type == "WITHDRAW":
                balance -= trade.amount
            elif trade.type == "BUY_STOCK":
                balance -= trade.amount
            elif trade.type == "SELL_STOCK":
                balance += trade.amount
        return balance

    @staticmethod
    async def process_money_trade(payload: MoneyTradeCreate, session: AsyncSession) -> Trade:
        account_query = select(Account).where(Account.id == payload.account_id)
        account_result = await session.scalars(account_query)
        account = account_result.first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        if payload.type == "WITHDRAW":
            current_balance = await TradeService.calculate_balance(payload.account_id, session)
            if current_balance < payload.amount:
                raise HTTPException(status_code=400, detail=f"Insufficient funds. Current balance: {current_balance}")
        new_trade = Trade(
            account_id=payload.account_id,
            type=payload.type,
            amount=payload.amount,
            description=payload.description,
            stock_id=None,
            quantity=None,
            price=None
        )
        session.add(new_trade)
        await session.commit()
        await session.refresh(new_trade)
        return new_trade

    @staticmethod
    async def process_stock_trade(payload: StockTradeCreate, session: AsyncSession) -> Trade:
        account_query = select(Account).where(Account.id == payload.account_id)
        account_result = await session.scalars(account_query)
        account = account_result.first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        stock_query = select(Stock).where(Stock.id == payload.stock_id)
        stock_result = await session.scalars(stock_query)
        stock = stock_result.first()
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")
        trade_amount = payload.quantity * payload.price
        if payload.type == "BUY_STOCK":
            current_balance = await TradeService.calculate_balance(payload.account_id, session)
            if current_balance < trade_amount:
                raise HTTPException(status_code=400, detail=f"Insufficient funds. Required: {trade_amount}, Available: {current_balance}")
        if payload.type == "SELL_STOCK":
            position_query = select(Position).where(Position.account_id == payload.account_id, Position.stock_id == payload.stock_id)
            position_result = await session.scalars(position_query)
            position = position_result.first()
            if not position or position.quantity < payload.quantity:
                available = position.quantity if position else 0
                raise HTTPException(status_code=400, detail=f"Insufficient shares. Required: {payload.quantity}, Available: {available}")
        new_trade = Trade(
            account_id=payload.account_id,
            type=payload.type,
            amount=trade_amount,
            stock_id=payload.stock_id,
            quantity=payload.quantity,
            price=payload.price,
            description=payload.description
        )
        session.add(new_trade)
        await TradeService._update_position(payload.account_id, payload.stock_id, payload.quantity, payload.type, session)
        await session.commit()
        await session.refresh(new_trade)
        return new_trade

    @staticmethod
    async def _update_position(account_id: int, stock_id: int, quantity: float, trade_type: str, session: AsyncSession):
        position_query = select(Position).where(Position.account_id == account_id, Position.stock_id == stock_id)
        position_result = await session.scalars(position_query)
        position = position_result.first()
        if not position:
            if trade_type == "BUY_STOCK":
                position = Position(account_id=account_id, stock_id=stock_id, quantity=quantity)
                session.add(position)
        else:
            if trade_type == "BUY_STOCK":
                position.quantity += quantity
            elif trade_type == "SELL_STOCK":
                position.quantity -= quantity
                if position.quantity <= 0:
                    await session.delete(position)

    @staticmethod
    async def get_account_trades(account_id: int, session: AsyncSession, trade_type: str | None = None) -> list[Trade]:
        query = select(Trade).where(Trade.account_id == account_id)
        if trade_type:
            query = query.where(Trade.type == trade_type)
        query = query.order_by(Trade.timestamp.desc())
        result = await session.scalars(query)
        return list(result.all())