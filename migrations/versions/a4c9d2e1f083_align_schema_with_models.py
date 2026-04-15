"""align schema with current models

Revision ID: a4c9d2e1f083
Revises: 9f2a1c4d8e7b
Create Date: 2026-04-15 14:12:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "a4c9d2e1f083"
down_revision: Union[str, Sequence[str], None] = "9f2a1c4d8e7b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE accounts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL")

    op.execute("ALTER TABLE stocks ADD COLUMN IF NOT EXISTS symbol TEXT")
    op.execute("ALTER TABLE stocks ADD COLUMN IF NOT EXISTS price_history JSON")
    op.execute("ALTER TABLE stocks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL")
    op.execute("ALTER TABLE stocks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL")

    op.execute("ALTER TABLE positions ADD COLUMN IF NOT EXISTS average_purchase_price DOUBLE PRECISION DEFAULT 0.0 NOT NULL")
    op.execute("ALTER TABLE positions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL")
    op.execute("ALTER TABLE positions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL")

    op.execute("ALTER TABLE trades ADD COLUMN IF NOT EXISTS description TEXT")
    op.execute("ALTER TABLE trades ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL")

    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_stocks_symbol ON stocks (symbol)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_stocks_name ON stocks (name)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_users_email ON users (email)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_users_email")
    op.execute("DROP INDEX IF EXISTS ix_stocks_name")
    op.execute("DROP INDEX IF EXISTS ix_stocks_symbol")
    op.execute("ALTER TABLE trades DROP COLUMN IF EXISTS timestamp")
    op.execute("ALTER TABLE trades DROP COLUMN IF EXISTS description")
    op.execute("ALTER TABLE positions DROP COLUMN IF EXISTS updated_at")
    op.execute("ALTER TABLE positions DROP COLUMN IF EXISTS created_at")
    op.execute("ALTER TABLE positions DROP COLUMN IF EXISTS average_purchase_price")
    op.execute("ALTER TABLE stocks DROP COLUMN IF EXISTS updated_at")
    op.execute("ALTER TABLE stocks DROP COLUMN IF EXISTS created_at")
    op.execute("ALTER TABLE stocks DROP COLUMN IF EXISTS price_history")
    op.execute("ALTER TABLE stocks DROP COLUMN IF EXISTS symbol")
    op.execute("ALTER TABLE accounts DROP COLUMN IF EXISTS created_at")
