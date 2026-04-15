"""add transfer columns to trades

Revision ID: 9f2a1c4d8e7b
Revises: 9776f3486c76
Create Date: 2026-04-15 14:05:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "9f2a1c4d8e7b"
down_revision: Union[str, Sequence[str], None] = "9776f3486c76"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE trades
        ADD COLUMN IF NOT EXISTS from_account_id INTEGER
        REFERENCES accounts(id) ON DELETE SET NULL
        """
    )
    op.execute(
        """
        ALTER TABLE trades
        ADD COLUMN IF NOT EXISTS to_account_id INTEGER
        REFERENCES accounts(id) ON DELETE SET NULL
        """
    )


def downgrade() -> None:
    op.execute("ALTER TABLE trades DROP COLUMN IF EXISTS to_account_id")
    op.execute("ALTER TABLE trades DROP COLUMN IF EXISTS from_account_id")
