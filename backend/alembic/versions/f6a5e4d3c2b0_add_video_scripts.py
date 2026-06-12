"""add_video_scripts

Revision ID: f6a5e4d3c2b0
Revises: e5f4d9c3b2a0
Create Date: 2026-06-12 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'f6a5e4d3c2b0'
down_revision = 'e5f4d9c3b2a0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('video_scripts', sa.Text(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.drop_column('video_scripts')
