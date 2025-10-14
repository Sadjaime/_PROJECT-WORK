from src.schemas import CustomBase
from datetime import datetime
from pydantic import PositiveInt, Field, EmailStr, field_validator
from typing import Optional, Literal

class UserCreate(CustomBase):
    name: str = Field(..., min_length=4, max_length=100, examples=["Paolo Rossi"])
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100, examples=["securepassword123"])
    type: Optional[Literal["user", "admin"]] = Field(default="user")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        return v.strip()

class UserResponse(CustomBase):
    id: PositiveInt
    name: str
    email: EmailStr
    type: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(CustomBase):
    name: Optional[str] = Field(None, min_length=4, max_length=100, examples=["Paolo Rossi"])
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, max_length=100, examples=["newsecurepassword123"])
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        return v.strip() if v else v

class UserDetailResponse(UserResponse):
    total_accounts: int = Field(..., description="Number of accounts user owns")
    total_portfolio_value: float = Field(..., description="Combined value of all accounts")

class UserWithAccountsResponse(UserResponse):
    accounts: list = Field(default_factory=list, description="List of user's accounts")