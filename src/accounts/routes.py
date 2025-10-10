from fastapi import APIRouter
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from src.database import get_async_session
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.accounts.models import Account
from src.accounts.schemas import AccountResponse, AccountCreate, AccountUpdate
from sqlalchemy.exc import IntegrityError

router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)

@router.get("/", response_model=List[AccountResponse])
async def get_accounts(session: AsyncSession = Depends(get_async_session)):
    query = select(Account)
    query_result = await session.scalars(query)
    result = query_result.unique().all()
    return result


@router.post("/", response_model=AccountResponse)
async def create_account(payload: AccountCreate, session: AsyncSession = Depends(get_async_session)):
    new_account = Account(
        name = payload.name,
        email = payload.email,
        password = payload.password,        
        is_admin = payload.is_admin
    )
    session.add(new_account)
    try:
        await session.commit()
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Email already in use")
    return new_account

@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(account_id: int, session: AsyncSession = Depends(get_async_session)):
    query = select(Account).where(Account.id==account_id)
    query_result = await session.scalars(query)
    result = query_result.first()
    if not result:
        raise HTTPException(status_code=404, detail="Account not found")
    return result

@router.patch("/{account_id}", response_model=AccountResponse)
async def update_account(account_id: int, payload: AccountUpdate, session: AsyncSession = Depends(get_async_session)):
    query = select(Account).where(Account.id==account_id)
    query_result = await session.scalars(query)
    result = query_result.first()
    if not result:
        raise HTTPException(status_code=404, detail="Account not found")
    
    for field, value in payload.model_dump().items():
        if value is not None:
            setattr(result, field, value)
    try:
        await session.commit()
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Email already in use")
    return result

@router.delete("/user_id", status_code=204)
async def delete_account(account_id: int, payload: AccountUpdate, session: AsyncSession = Depends(get_async_session)):
    query = select(Account).where(Account.id==account_id)
    query_result = await session.scalars(query)
    result = query_result.first()
    if not result:
        raise HTTPException(status_code=404, detail="Account not found")
    await session.delete(result)
    await session.commit()
    return None