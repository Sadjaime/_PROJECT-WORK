from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings

from src.users.routes import router as user_router
from src.accounts.routes import router as account_router
from src.stocks.routes import router as stock_router
from src.trades.routes import router as trades_router
from src.positions.routes import router as positions_router
from src.feeds.routes import router as feeds_router

app = FastAPI(title=settings.app_name, description=settings.description, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # !!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(account_router)
app.include_router(stock_router)
app.include_router(trades_router)
app.include_router(positions_router)
app.include_router(feeds_router)

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.app_name} API",
    }
