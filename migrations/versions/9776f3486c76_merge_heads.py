"""merge heads

Revision ID: 9776f3486c76
Revises: fix_positions_pk, 2076b70eb34d
Create Date: 2025-10-30 15:03:58.245287

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9776f3486c76'
down_revision: Union[str, Sequence[str], None] = ('fix_positions_pk', '2076b70eb34d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
