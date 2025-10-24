from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_async_session
from src.users.models import User
from src.users.schemas import (UserResponse, UserCreate, UserUpdate, UserDetailResponse, UserLogin)
from src.users.services import UserService
from src.accounts.services import AccountService

router = APIRouter(prefix="/users",tags=["Users"])


@router.get("/", response_model=List[UserResponse])
async def get_users(session: AsyncSession = Depends(get_async_session)):
    users = await UserService.get_all_users(session)
    return users

@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(payload: UserCreate, session: AsyncSession = Depends(get_async_session)):
    user = await UserService.create_user(payload, session)
    return user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, session: AsyncSession = Depends(get_async_session)):
    user = await UserService.get_user_by_id(user_id, session)
    return user

@router.get("/{user_id}/details", response_model=UserDetailResponse)
async def get_user_details(user_id: int, session: AsyncSession = Depends(get_async_session)):
    details = await UserService.get_user_with_details(user_id, session)
    return details

@router.get("/{user_id}/accounts")
async def get_user_accounts(user_id: int, session: AsyncSession = Depends(get_async_session)):
    accounts = await AccountService.get_user_accounts(user_id, session)
    return accounts

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, payload: UserUpdate, session: AsyncSession = Depends(get_async_session)):
    user = await UserService.update_user(user_id, payload, session)
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: int, session: AsyncSession = Depends(get_async_session)):
    await UserService.delete_user(user_id, session)
    return None

@router.post("/login", response_model=UserResponse)
async def login(payload: UserLogin, session: AsyncSession = Depends(get_async_session)):
    user = await UserService.verify_password(payload.email, payload.password, session)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user