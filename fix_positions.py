"""fix positions primary key to composite

Revision ID: fix_positions_pk
Revises: 
Create Date: 2024-10-29 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'fix_positions'
down_revision = '2076b70eb34d' 
branch_labels = None
depends_on = None


def upgrade():
    """
    Fix the positions table primary key from (account_id) to (account_id, stock_id)
    """
    # Drop the old primary key constraint
    op.drop_constraint('positions_pkey', 'positions', type_='primary')
    
    # Create the new composite primary key
    op.create_primary_key(
        'positions_pkey',
        'positions',
        ['account_id', 'stock_id']
    )


def downgrade():
    """
    Revert back to the old (incorrect) primary key - only for rollback purposes
    WARNING: This will fail if you have multiple positions per account!
    """
    # Drop the composite primary key
    op.drop_constraint('positions_pkey', 'positions', type_='primary')
    
    # Recreate the old (wrong) primary key
    op.create_primary_key(
        'positions_pkey',
        'positions',
        ['account_id']
    )