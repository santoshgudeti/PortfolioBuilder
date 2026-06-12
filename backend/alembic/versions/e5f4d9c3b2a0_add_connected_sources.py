"""add_connected_sources

Revision ID: e5f4d9c3b2a0
Revises: d4e3c8f2b1a0
Create Date: 2026-06-12 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'e5f4d9c3b2a0'
down_revision = 'd4e3c8f2b1a0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('connected_sources', sa.Text(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.drop_column('connected_sources')
