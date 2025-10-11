from fastapi import APIRouter
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from src.database import get_async_session
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.users.models import User
from src.accounts.models import Account
from src.users.schemas import UserResponse, UserCreate, UserUpdate
from src.accounts.schemas import AccountCreate, AccountResponse
from sqlalchemy.exc import IntegrityError
from src.accounts.routes import router as accounts_router

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/", response_model=List[UserResponse])
async def get_users(session: AsyncSession = Depends(get_async_session)):
    query = select(User)
    query_result = await session.scalars(query)
    result = query_result.unique().all()
    return result

@router.post("/", response_model=UserResponse)
async def create_user(payload: UserCreate, session: AsyncSession = Depends(get_async_session)):
    new_user = User(**payload.model_dump())
    session.add(new_user)
    try:
        await session.commit()
        await session.refresh(new_user)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Email already in use")
    return new_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, session: AsyncSession = Depends(get_async_session)):
    query = select(User).where(User.id==user_id)
    query_result = await session.scalars(query)
    result = query_result.first()
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, payload: UserUpdate, session: AsyncSession = Depends(get_async_session)):
    query = select(User).where(User.id==user_id)
    query_result = await session.scalars(query)
    result = query_result.first()
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    
    for field, value in payload.model_dump().items():
        if value is not None:
            setattr(result, field, value)
    try:
        await session.commit()
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Email already in use")
    return result

@router.delete("/user_id", status_code=204)
async def delete_user(user_id: int, payload: UserUpdate, session: AsyncSession = Depends(get_async_session)):
    query = select(User).where(User.id==user_id)
    query_result = await session.scalars(query)
    result = query_result.first()
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    await session.delete(result)
    await session.commit()
    return None

