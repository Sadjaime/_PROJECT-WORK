import asyncio
import random
import sys
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy import select

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from src.accounts.models import Account
from src.database import async_session_maker
from src.stocks.models import Stock
from src.trades.models import Trade
from src.trades.schemas import MoneyTradeCreate, StockTradeCreate
from src.trades.services import TradeService
from src.users.models import User


DEMO_PASSWORD = "DemoPass123"

USERS = [
    {"name": "Demo Investor", "email": "demo@fintechdemo.app", "password": DEMO_PASSWORD, "type": "user"},
    {"name": "Maria Bianchi", "email": "maria.bianchi@example.com", "password": DEMO_PASSWORD, "type": "user"},
    {"name": "Luca Ferrari", "email": "luca.ferrari@example.com", "password": DEMO_PASSWORD, "type": "user"},
    {"name": "Sofia Ricci", "email": "sofia.ricci@example.com", "password": DEMO_PASSWORD, "type": "user"},
]

STOCKS = [
    ("Apple Inc.", "AAPL", 214.42),
    ("Microsoft Corporation", "MSFT", 421.88),
    ("Amazon.com Inc.", "AMZN", 183.15),
    ("Alphabet Inc.", "GOOGL", 166.03),
    ("Tesla Inc.", "TSLA", 238.55),
    ("NVIDIA Corporation", "NVDA", 132.74),
    ("Meta Platforms Inc.", "META", 512.28),
    ("Netflix Inc.", "NFLX", 693.37),
    ("Adobe Inc.", "ADBE", 478.92),
    ("Advanced Micro Devices", "AMD", 156.12),
    ("Salesforce Inc.", "CRM", 284.46),
    ("PayPal Holdings Inc.", "PYPL", 68.34),
]

ACCOUNT_NAMES = ["Growth Portfolio", "Long Term Holdings", "Trading Account"]


def price_history(current_price: float, seed: int) -> dict[str, float]:
    rng = random.Random(seed)
    start = datetime.utcnow().date() - timedelta(days=60)
    price = current_price * rng.uniform(0.82, 1.05)
    history: dict[str, float] = {}

    for day in range(61):
        date_key = (start + timedelta(days=day)).isoformat()
        drift = rng.uniform(-0.025, 0.03)
        price = max(1.0, price * (1 + drift))
        history[date_key] = round(price, 2)

    history[datetime.utcnow().date().isoformat()] = current_price
    return history


async def get_or_create_user(session, user_data: dict) -> User:
    result = await session.scalars(select(User).where(User.email == user_data["email"]))
    user = result.first()
    if user:
        return user

    user = User(**user_data)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def get_or_create_stock(session, name: str, symbol: str, average_price: float, seed: int) -> Stock:
    result = await session.scalars(select(Stock).where(Stock.symbol == symbol))
    stock = result.first()
    if stock:
        if not stock.price_history or len(stock.price_history) < 30:
            stock.price_history = price_history(average_price, seed)
            stock.average_price = average_price
            await session.commit()
            await session.refresh(stock)
        return stock

    stock = Stock(
        name=name,
        symbol=symbol,
        average_price=average_price,
        price_history=price_history(average_price, seed),
    )
    session.add(stock)
    await session.commit()
    await session.refresh(stock)
    return stock


async def get_or_create_account(session, user_id: int, name: str) -> Account:
    result = await session.scalars(
        select(Account).where(Account.user_id == user_id, Account.name == name)
    )
    account = result.first()
    if account:
        return account

    account = Account(user_id=user_id, name=name)
    session.add(account)
    await session.commit()
    await session.refresh(account)
    return account


async def account_has_trades(session, account_id: int) -> bool:
    result = await session.scalars(select(Trade.id).where(Trade.account_id == account_id).limit(1))
    return result.first() is not None


async def seed_account_trades(session, account: Account, stocks: list[Stock], rng: random.Random) -> None:
    if await account_has_trades(session, account.id):
        return

    deposit_amount = round(rng.uniform(25000, 65000), 2)
    await TradeService.process_money_trade(
        MoneyTradeCreate(
            account_id=account.id,
            type="DEPOSIT",
            amount=deposit_amount,
            description="Demo starting capital",
        ),
        session,
    )

    selected_stocks = rng.sample(stocks, k=min(rng.randint(4, 7), len(stocks)))
    for stock in selected_stocks:
        buy_price = round(stock.average_price * rng.uniform(0.72, 1.03), 2)
        quantity = round(rng.uniform(3, 18), 2)

        await TradeService.process_stock_trade(
            StockTradeCreate(
                account_id=account.id,
                stock_id=stock.id,
                type="BUY_STOCK",
                quantity=quantity,
                price=buy_price,
                description="Demo portfolio position",
            ),
            session,
        )

        if rng.random() < 0.25:
            sell_quantity = round(quantity * rng.uniform(0.2, 0.45), 2)
            sell_price = round(stock.average_price * rng.uniform(0.95, 1.15), 2)
            await TradeService.process_stock_trade(
                StockTradeCreate(
                    account_id=account.id,
                    stock_id=stock.id,
                    type="SELL_STOCK",
                    quantity=sell_quantity,
                    price=sell_price,
                    description="Demo profit taking",
                ),
                session,
            )


async def seed_demo_data() -> None:
    rng = random.Random(42)

    async with async_session_maker() as session:
        users = [await get_or_create_user(session, user_data) for user_data in USERS]
        stocks = [
            await get_or_create_stock(session, name, symbol, price, index)
            for index, (name, symbol, price) in enumerate(STOCKS, start=1)
        ]

        for user in users:
            account_count = 2 if user.email == "demo@fintechdemo.app" else 1
            for account_name in ACCOUNT_NAMES[:account_count]:
                account = await get_or_create_account(session, user.id, account_name)
                await seed_account_trades(session, account, stocks, rng)

    print("Demo data is ready.")
    print("Demo login: demo@fintechdemo.app / DemoPass123")


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
