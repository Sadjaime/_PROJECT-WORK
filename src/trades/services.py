from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from fastapi import HTTPException
from src.trades.models import Trade
from src.accounts.models import Account
from src.stocks.models import Stock
from src.positions.models import Position
from src.trades.schemas import MoneyTradeCreate, StockTradeCreate, AccountTransferCreate
from typing import Dict, List
from datetime import datetime


class TradeService:
    @staticmethod
    async def calculate_balance(account_id: int, session: AsyncSession) -> float:
        """Calculate account balance including transfers"""
        query = select(Trade).where(Trade.account_id == account_id)
        result = await session.scalars(query)
        trades = result.all()
        
        balance = 0.0
        for trade in trades:
            if trade.type in ["DEPOSIT", "SELL_STOCK", "TRANSFER_IN"]:
                balance += trade.amount
            elif trade.type in ["WITHDRAW", "BUY_STOCK", "TRANSFER_OUT"]:
                balance -= trade.amount
        
        return balance

    @staticmethod
    async def process_money_trade(payload: MoneyTradeCreate, session: AsyncSession) -> Trade:
        """Process deposit or withdrawal"""
        account_query = select(Account).where(Account.id == payload.account_id)
        account_result = await session.scalars(account_query)
        account = account_result.first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        
        if payload.type == "WITHDRAW":
            current_balance = await TradeService.calculate_balance(payload.account_id, session)
            if current_balance < payload.amount:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient funds. Current balance: ${current_balance:.2f}"
                )
        
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
        """Process stock buy or sell"""
        # Validate account exists
        account_query = select(Account).where(Account.id == payload.account_id)
        account_result = await session.scalars(account_query)
        account = account_result.first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        
        # Validate stock exists
        stock_query = select(Stock).where(Stock.id == payload.stock_id)
        stock_result = await session.scalars(stock_query)
        stock = stock_result.first()
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")
        
        trade_amount = payload.quantity * payload.price
        
        if payload.type == "BUY_STOCK":
            current_balance = await TradeService.calculate_balance(payload.account_id, session)
            if current_balance < trade_amount:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient funds. Required: ${trade_amount:.2f}, Available: ${current_balance:.2f}"
                )
        
        if payload.type == "SELL_STOCK":
            position_query = select(Position).where(
                and_(
                    Position.account_id == payload.account_id,
                    Position.stock_id == payload.stock_id
                )
            )
            position_result = await session.scalars(position_query)
            position = position_result.first()
            
            if not position or position.quantity < payload.quantity:
                available = position.quantity if position else 0
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient shares. Required: {payload.quantity}, Available: {available}"
                )
        
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
        
        # Update position BEFORE committing the trade
        await TradeService._update_position(
            payload.account_id, 
            payload.stock_id, 
            payload.quantity, 
            payload.price,
            payload.type, 
            session
        )
        
        await session.commit()
        await session.refresh(new_trade)
        return new_trade

    @staticmethod
    async def _update_position(
        account_id: int, 
        stock_id: int, 
        quantity: float, 
        price: float,
        trade_type: str, 
        session: AsyncSession
    ):
        """Update stock position after trade - FIXED VERSION"""
        # Query for existing position using composite key
        position_query = select(Position).where(
            and_(
                Position.account_id == account_id,
                Position.stock_id == stock_id
            )
        )
        position_result = await session.scalars(position_query)
        position = position_result.first()
        
        if trade_type == "BUY_STOCK":
            if not position:
                # CREATE new position - no position exists yet
                position = Position(
                    account_id=account_id, 
                    stock_id=stock_id, 
                    quantity=quantity,
                    average_purchase_price=price
                )
                session.add(position)
            else:
                # UPDATE existing position - calculate new average price
                old_total_cost = position.quantity * position.average_purchase_price
                new_cost = quantity * price
                total_cost = old_total_cost + new_cost
                new_quantity = position.quantity + quantity
                
                # Update the existing position object
                position.average_purchase_price = total_cost / new_quantity if new_quantity > 0 else 0
                position.quantity = new_quantity
                # No need to session.add() - object is already tracked
        
        elif trade_type == "SELL_STOCK":
            if not position:
                # This should never happen due to validation above, but just in case
                raise HTTPException(status_code=400, detail="No position found to sell")
            
            # Reduce quantity
            position.quantity -= quantity
            
            # If all shares sold, delete the position
            if position.quantity <= 0:
                await session.delete(position)
            # Otherwise, keep the average purchase price the same

    @staticmethod
    async def transfer_between_accounts(payload: AccountTransferCreate, session: AsyncSession) -> Dict:
        """Transfer money from one account to another"""
        # Validate both accounts exist
        from_account_query = select(Account).where(Account.id == payload.from_account_id)
        from_account_result = await session.scalars(from_account_query)
        from_account = from_account_result.first()
        
        if not from_account:
            raise HTTPException(status_code=404, detail=f"Source account {payload.from_account_id} not found")
        
        to_account_query = select(Account).where(Account.id == payload.to_account_id)
        to_account_result = await session.scalars(to_account_query)
        to_account = to_account_result.first()
        
        if not to_account:
            raise HTTPException(status_code=404, detail=f"Destination account {payload.to_account_id} not found")
        
        # Check sufficient balance in source account
        current_balance = await TradeService.calculate_balance(payload.from_account_id, session)
        if current_balance < payload.amount:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient funds. Available: ${current_balance:.2f}, Required: ${payload.amount:.2f}"
            )
        
        # Create TRANSFER_OUT transaction for source account
        transfer_out = Trade(
            account_id=payload.from_account_id,
            type="TRANSFER_OUT",
            amount=payload.amount,
            description=payload.description or f"Transfer to {to_account.name}",
            to_account_id=payload.to_account_id
        )
        
        # Create TRANSFER_IN transaction for destination account
        transfer_in = Trade(
            account_id=payload.to_account_id,
            type="TRANSFER_IN",
            amount=payload.amount,
            description=payload.description or f"Transfer from {from_account.name}",
            from_account_id=payload.from_account_id
        )
        
        session.add(transfer_out)
        session.add(transfer_in)
        await session.commit()
        await session.refresh(transfer_out)
        await session.refresh(transfer_in)
        
        return {
            "transfer_id": transfer_out.id,
            "from_account_id": payload.from_account_id,
            "from_account_name": from_account.name,
            "to_account_id": payload.to_account_id,
            "to_account_name": to_account.name,
            "amount": payload.amount,
            "description": payload.description,
            "timestamp": transfer_out.timestamp,
            "status": "completed"
        }

    @staticmethod
    async def get_account_trades(
        account_id: int, 
        session: AsyncSession, 
        trade_type: str | None = None
    ) -> list[Trade]:
        """Get all trades for an account"""
        query = select(Trade).where(Trade.account_id == account_id)
        
        if trade_type:
            query = query.where(Trade.type == trade_type)
        
        query = query.order_by(Trade.timestamp.desc())
        result = await session.scalars(query)
        return list(result.all())

    @staticmethod
    async def get_account_transfers(account_id: int, session: AsyncSession) -> List[Dict]:
        """Get all transfers (in and out) for a specific account"""
        query = select(Trade).where(
            and_(
                Trade.account_id == account_id,
                or_(Trade.type == "TRANSFER_IN", Trade.type == "TRANSFER_OUT")
            )
        ).order_by(Trade.timestamp.desc())
        
        result = await session.scalars(query)
        trades = result.all()
        
        transfers = []
        for trade in trades:
            # Get the other account info
            other_account_id = trade.to_account_id if trade.type == "TRANSFER_OUT" else trade.from_account_id
            
            if other_account_id:
                other_account_query = select(Account).where(Account.id == other_account_id)
                other_account_result = await session.scalars(other_account_query)
                other_account = other_account_result.first()
                other_account_name = other_account.name if other_account else "Unknown"
            else:
                other_account_name = "Unknown"
            
            if trade.type == "TRANSFER_OUT":
                transfers.append({
                    "transfer_id": trade.id,
                    "from_account_id": trade.account_id,
                    "to_account_id": other_account_id,
                    "to_account_name": other_account_name,
                    "amount": trade.amount,
                    "description": trade.description,
                    "timestamp": trade.timestamp,
                    "type": "outgoing"
                })
            else:  # TRANSFER_IN
                transfers.append({
                    "transfer_id": trade.id,
                    "from_account_id": other_account_id,
                    "from_account_name": other_account_name,
                    "to_account_id": trade.account_id,
                    "amount": trade.amount,
                    "description": trade.description,
                    "timestamp": trade.timestamp,
                    "type": "incoming"
                })
        
        return transfers

    @staticmethod
    async def get_detailed_balance(account_id: int, session: AsyncSession) -> Dict:
        """Get detailed balance breakdown for an account"""
        query = select(Trade).where(Trade.account_id == account_id)
        result = await session.scalars(query)
        trades = result.all()
        
        total_deposits = sum(t.amount for t in trades if t.type == "DEPOSIT")
        total_withdrawals = sum(t.amount for t in trades if t.type == "WITHDRAW")
        total_stock_purchases = sum(t.amount for t in trades if t.type == "BUY_STOCK")
        total_stock_sales = sum(t.amount for t in trades if t.type == "SELL_STOCK")
        total_transfers_in = sum(t.amount for t in trades if t.type == "TRANSFER_IN")
        total_transfers_out = sum(t.amount for t in trades if t.type == "TRANSFER_OUT")
        
        balance = (
            total_deposits + total_stock_sales + total_transfers_in -
            total_withdrawals - total_stock_purchases - total_transfers_out
        )
        
        return {
            "account_id": account_id,
            "balance": round(balance, 2),
            "total_deposits": round(total_deposits, 2),
            "total_withdrawals": round(total_withdrawals, 2),
            "total_stock_purchases": round(total_stock_purchases, 2),
            "total_stock_sales": round(total_stock_sales, 2),
            "total_transfers_in": round(total_transfers_in, 2),
            "total_transfers_out": round(total_transfers_out, 2)
        }