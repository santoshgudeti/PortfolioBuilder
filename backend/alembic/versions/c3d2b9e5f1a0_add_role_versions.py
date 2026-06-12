"""add_role_versions

Revision ID: c3d2b9e5f1a0
Revises: b2f1a8c4e3d0
Create Date: 2026-06-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'c3d2b9e5f1a0'
down_revision = 'b2f1a8c4e3d0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('role_versions', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('active_role', sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.drop_column('active_role')
        batch_op.drop_column('role_versions')
