"""add_analytics_v2_columns

Revision ID: b2f1a8c4e3d0
Revises: a8f3c6e9b1d2
Create Date: 2026-06-12 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'b2f1a8c4e3d0'
down_revision = 'a8f3c6e9b1d2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('page_views', schema=None) as batch_op:
        batch_op.add_column(sa.Column('ip_address', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('visitor_type', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('intent_score', sa.Integer(), nullable=True))
        batch_op.create_index(batch_op.f('ix_page_views_visitor_type'), ['visitor_type'], unique=False)
        batch_op.create_index(batch_op.f('ix_page_views_ip_address'), ['ip_address'], unique=False)


def downgrade() -> None:
    with op.batch_alter_table('page_views', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_page_views_ip_address'))
        batch_op.drop_index(batch_op.f('ix_page_views_visitor_type'))
        batch_op.drop_column('intent_score')
        batch_op.drop_column('visitor_type')
        batch_op.drop_column('ip_address')
