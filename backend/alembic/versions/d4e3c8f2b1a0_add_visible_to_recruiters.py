"""add_visible_to_recruiters

Revision ID: d4e3c8f2b1a0
Revises: c3d2b9e5f1a0
Create Date: 2026-06-12 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'd4e3c8f2b1a0'
down_revision = 'c3d2b9e5f1a0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('visible_to_recruiters', sa.Boolean(), nullable=False, server_default=sa.text('true')))


def downgrade() -> None:
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.drop_column('visible_to_recruiters')
