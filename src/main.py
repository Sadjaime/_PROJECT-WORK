from fastapi import FastAPI

from pydantic import BaseModel, Field

from src.accounts.routes import router as account_router
from src.stocks.routes import router as stock_router
from src.users.routes import router as user_router
from src.config import settings
from src.database import Base
from src.accounts.models import Account
from src.stocks.models import Stock
from src.positions.models import Position
from src.trades.models import Trade


app = FastAPI(
    title=settings.app_name
)

app.include_router(stock_router)
app.include_router(user_router)
app.include_router(account_router)


#Accounts
    #get_balance
    #get_stocks
    #get_interests

#Transactions
    #get_transactions
    #create_transactions

#Stocks
    #get_stocks
    #buy_stock
    #sell stock

