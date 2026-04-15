# FastAPI Fintech Web App

A full-stack fintech portfolio project with a FastAPI backend, PostgreSQL persistence, Alembic migrations, and a React frontend.

The app lets users sign up, create accounts, deposit or withdraw virtual cash, buy and sell stocks, track positions, view portfolio performance, transfer funds, and browse social trading feeds such as top traders, recent trades, and trending stocks.

## Tech Stack

- Backend: FastAPI, SQLAlchemy async, asyncpg, Pydantic, Alembic
- Database: PostgreSQL
- Frontend: React, Create React App, Tailwind CSS, Recharts, lucide-react
- Runtime: Python 3.12

## Project Structure

- `src/` - FastAPI application modules, models, schemas, routes, and services
- `migrations/` - Alembic database migrations
- `frontend/` - React app
- `requirements.txt` - Python dependencies
- `render.yaml` - Render deployment blueprint

## Local Development

Create a backend `.env` from `.env.example`, then fill in your local PostgreSQL values.

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn src.main:app --reload
```

In another terminal:

```powershell
cd frontend
npm install
npm start
```

The frontend uses `REACT_APP_API_BASE_URL` and falls back to `http://localhost:8000`.

## Deploying On Render

This repo includes a `render.yaml` blueprint for:

- `fintech-api` - FastAPI web service
- `fintech-frontend` - static React site
- `fintech-db` - PostgreSQL database

The free web service start command runs `alembic upgrade head` before launching Uvicorn so the database schema is prepared on boot.

After creating the Render Blueprint, set these prompted environment variables:

- `CORS_ORIGINS` on `fintech-api`, for example `https://fintech-frontend.onrender.com`
- `REACT_APP_API_BASE_URL` on `fintech-frontend`, for example `https://fintech-api.onrender.com`

If Render assigns different service URLs, use those actual URLs instead.

## Demo Data

After the backend and database are deployed, seed the hosted PostgreSQL database from Render Shell:

```bash
python scripts/seed_demo_data.py
```

The script is idempotent and creates a demo user, sample users, accounts, stocks, price history, deposits, buys, sells, positions, and social feed data.

Demo login:

```text
demo@fintech.test
DemoPass123
```

## Portfolio Notes

Before sharing publicly, seed the database with demo data and avoid using real passwords or personal financial data. This is a portfolio simulator, not a production brokerage application.
