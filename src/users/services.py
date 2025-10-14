from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from src.users.models import User
from src.users.schemas import UserCreate, UserUpdate, UserDetailResponse
from typing import Optional


class UserService:
    @staticmethod
    async def create_user(payload: UserCreate, session: AsyncSession) -> User:
        existing_query = select(User).where(User.email == payload.email)
        existing_result = await session.scalars(existing_query)
        existing_user = existing_result.first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        new_user = User(name=payload.name, email=payload.email, password=payload.password, type=payload.type or "user")
        session.add(new_user)
        try:
            await session.commit()
            await session.refresh(new_user)
        except IntegrityError:
            await session.rollback()
            raise HTTPException(status_code=400, detail="Email already registered")
        return new_user

    @staticmethod
    async def get_user_by_id(user_id: int, session: AsyncSession) -> User:
        query = select(User).where(User.id == user_id)
        result = await session.scalars(query)
        user = result.first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    @staticmethod
    async def get_user_by_email(email: str, session: AsyncSession) -> Optional[User]:
        query = select(User).where(User.email == email)
        result = await session.scalars(query)
        return result.first()

    @staticmethod
    async def get_all_users(session: AsyncSession) -> list[User]:
        query = select(User)
        result = await session.scalars(query)
        return list(result.all())

    @staticmethod
    async def update_user(user_id: int, payload: UserUpdate, session: AsyncSession) -> User:
        user = await UserService.get_user_by_id(user_id, session)
        update_data = payload.model_dump(exclude_unset=True)
        if "email" in update_data and update_data["email"] != user.email:
            existing_query = select(User).where(User.email == update_data["email"], User.id != user_id)
            existing_result = await session.scalars(existing_query)
            if existing_result.first():
                raise HTTPException(status_code=400, detail="Email already in use by another user")
        for field, value in update_data.items():
            setattr(user, field, value)
        try:
            await session.commit()
            await session.refresh(user)
        except IntegrityError:
            await session.rollback()
            raise HTTPException(status_code=400, detail="Email already in use")
        return user

    @staticmethod
    async def delete_user(user_id: int, session: AsyncSession) -> None:
        user = await UserService.get_user_by_id(user_id, session)
        await session.delete(user)
        await session.commit()

    @staticmethod
    async def get_user_with_details(user_id: int, session: AsyncSession) -> UserDetailResponse:
        from src.accounts.models import Account
        from src.trades.services import TradeService
        from src.positions.services import PositionService
        user = await UserService.get_user_by_id(user_id, session)
        accounts_query = select(Account).where(Account.user_id == user_id)
        accounts_result = await session.scalars(accounts_query)
        accounts = list(accounts_result.all())
        total_value = 0.0
        for account in accounts:
            balance = await TradeService.calculate_balance(account.id, session)
            try:
                portfolio = await PositionService.get_portfolio_summary(account.id, session)
                portfolio_value = portfolio.current_portfolio_value
            except Exception:
                portfolio_value = 0.0
            total_value += balance + portfolio_value
        return UserDetailResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            type=user.type,
            created_at=user.created_at,
            total_accounts=len(accounts),
            total_portfolio_value=total_value
        )

    @staticmethod
    async def verify_password(email: str, password: str, session: AsyncSession) -> Optional[User]:
        user = await UserService.get_user_by_email(email, session)
        if not user:
            return None
        if password != user.password:
            return None
        return user