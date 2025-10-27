import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from src.stocks.models import Stock
from src.database import DATABASE_URL
import random
from datetime import datetime, timedelta

async def generate_history():
    engine = create_async_engine(DATABASE_URL)
    async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session_maker() as session:
        result = await session.execute(select(Stock))
        stocks = result.scalars().all()
        
        if not stocks:
            print("No stocks found in database!")
            return
        
        for stock in stocks:
            history = {}
            price = stock.average_price
            
            # Generate 12 months of history
            for i in range(12, 0, -1):
                date = (datetime.now() - timedelta(days=30*i)).strftime('%Y-%m')
                # Random fluctuation ±10%
                price *= (1 + random.uniform(-0.1, 0.1))
                price = max(price, 1.0)  # Keep price positive
                history[date] = round(price, 2)
            
            stock.price_history = history
            print(f"Added history to {stock.name}: {len(history)} months")
        
        await session.commit()
        print(f"\n✅ Successfully added price history to {len(stocks)} stocks!")

if __name__ == "__main__":
    asyncio.run(generate_history())