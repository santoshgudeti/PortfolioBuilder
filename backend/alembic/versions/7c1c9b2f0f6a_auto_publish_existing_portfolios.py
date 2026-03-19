"""auto_publish_existing_portfolios

Revision ID: 7c1c9b2f0f6a
Revises: d6ad9a719af5
Create Date: 2026-03-19

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "7c1c9b2f0f6a"
down_revision = "d6ad9a719af5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    dialect = conn.dialect.name

    if dialect == "sqlite":
        conn.execute(sa.text("UPDATE portfolios SET is_published = 1 WHERE is_published = 0"))
    else:
        conn.execute(sa.text("UPDATE portfolios SET is_published = TRUE WHERE is_published = FALSE"))


def downgrade() -> None:
    # No-op: we don't want to automatically revert user visibility.
    pass

