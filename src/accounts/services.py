from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from src.accounts.models import Account
from src.users.models import User
from src.accounts.schemas import AccountCreate, AccountUpdate
from sqlalchemy.exc import IntegrityError

class AccountService:
    @staticmethod
    async def create_account(payload: AccountCreate, session: AsyncSession) -> Account:
        user_query = select(User).where(User.id == payload.user_id)
        user_result = await session.scalars(user_query)
        user = user_result.first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        new_account = Account(name=payload.name, user_id=payload.user_id)
        session.add(new_account)
        try:
            await session.commit()
            await session.refresh(new_account)
        except IntegrityError:
            await session.rollback()
            raise HTTPException(status_code=400, detail="Failed to create account")
        return new_account
    
    @staticmethod
    async def get_account_by_id(account_id: int, session: AsyncSession) -> Account:
        query = select(Account).where(Account.id == account_id)
        result = await session.scalars(query)
        account = result.first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        return account
    
    @staticmethod
    async def get_all_accounts(session: AsyncSession) -> list[Account]:
        query = select(Account)
        result = await session.scalars(query)
        return list(result.all())
    
    @staticmethod
    async def get_user_accounts(user_id: int, session: AsyncSession) -> list[Account]:
        user_query = select(User).where(User.id == user_id)
        user_result = await session.scalars(user_query)
        user = user_result.first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        query = select(Account).where(Account.user_id == user_id)
        result = await session.scalars(query)
        return list(result.all())
    
    @staticmethod
    async def update_account(account_id: int, payload: AccountUpdate, session: AsyncSession) -> Account:
        account = await AccountService.get_account_by_id(account_id, session)
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(account, field, value)
        try:
            await session.commit()
            await session.refresh(account)
        except IntegrityError:
            await session.rollback()
            raise HTTPException(status_code=400, detail="Failed to update account")
        return account
    
    @staticmethod
    async def delete_account(account_id: int, session: AsyncSession) -> None:
        account = await AccountService.get_account_by_id(account_id, session)
        await session.delete(account)
        await session.commit()
    
    @staticmethod
    async def get_account_summary(account_id: int, session: AsyncSession) -> dict:
        from src.trades.services import TradeService
        from src.positions.services import PositionService
        account = await AccountService.get_account_by_id(account_id, session)
        balance = await TradeService.calculate_balance(account_id, session)
        try:
            portfolio = await PositionService.get_portfolio_summary(account_id, session)
            portfolio_value = portfolio.current_portfolio_value
            num_positions = portfolio.total_positions
            total_profit_loss = portfolio.total_unrealized_profit_loss
        except Exception:
            portfolio_value = 0.0
            num_positions = 0
            total_profit_loss = 0.0
        total_value = balance + portfolio_value
        return {
            "account_id": account.id,
            "account_name": account.name,
            "user_id": account.user_id,
            "created_at": account.created_at,
            "cash_balance": balance,
            "portfolio_value": portfolio_value,
            "total_account_value": total_value,
            "num_positions": num_positions,
            "unrealized_profit_loss": total_profit_loss
        }