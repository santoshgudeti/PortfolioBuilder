"""add_role_versions_and_missing_columns

Revision ID: c3d2b9e5f1a0
Revises: b2f1a8c4e3d0
Create Date: 2026-06-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = 'c3d2b9e5f1a0'
down_revision = 'b2f1a8c4e3d0'
branch_labels = None
depends_on = None


def _column_exists(conn, table: str, column: str) -> bool:
    """Check if a column exists in the given table."""
    inspector = inspect(conn)
    columns = [c["name"] for c in inspector.get_columns(table)]
    return column in columns


def upgrade() -> None:
    conn = op.get_bind()

    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('role_versions', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('active_role', sa.String(), nullable=True))

    # Add model columns that were never tracked in migrations
    if not _column_exists(conn, "portfolios", "version_history"):
        with op.batch_alter_table('portfolios', schema=None) as batch_op:
            batch_op.add_column(sa.Column('version_history', sa.Text(), nullable=False, server_default=sa.text("'[]'")))
    if not _column_exists(conn, "portfolios", "career_graph"):
        with op.batch_alter_table('portfolios', schema=None) as batch_op:
            batch_op.add_column(sa.Column('career_graph', sa.Text(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.drop_column('active_role')
        batch_op.drop_column('role_versions')

    # Only drop if they exist — the downgrade is best-effort for these
    conn = op.get_bind()
    if _column_exists(conn, "portfolios", "version_history"):
        with op.batch_alter_table('portfolios', schema=None) as batch_op:
            batch_op.drop_column('version_history')
    if _column_exists(conn, "portfolios", "career_graph"):
        with op.batch_alter_table('portfolios', schema=None) as batch_op:
            batch_op.drop_column('career_graph')
