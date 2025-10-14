from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from src.database import get_async_session
from src.accounts.models import Account
from src.accounts.schemas import AccountResponse, AccountCreate, AccountUpdate
from src.accounts.services import AccountService
from src.users.models import User

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("/", response_model=List[AccountResponse])
async def get_accounts(session: AsyncSession = Depends(get_async_session)):
    result = await AccountService.get_all_accounts(session)
    return result

@router.post("/", response_model=AccountResponse, status_code=201)
async def create_account(payload: AccountCreate, session: AsyncSession = Depends(get_async_session)):
    new_account = await AccountService.create_account(payload, session)
    return new_account

@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(account_id: int, session: AsyncSession = Depends(get_async_session)):
    result = await AccountService.get_account_summary(account_id ,session)
    return result

@router.patch("/{account_id}", response_model=AccountResponse)
async def update_account(account_id: int, payload: AccountUpdate, session: AsyncSession = Depends(get_async_session)):
    result = await AccountService.update_account(account_id, payload, session)
    return result

@router.delete("/{account_id}", status_code=204)
async def delete_account(account_id: int, session: AsyncSession = Depends(get_async_session)):
    await AccountService.delete_account(account_id, session)
    return None