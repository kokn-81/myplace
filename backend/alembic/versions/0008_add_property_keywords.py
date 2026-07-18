"""add property keywords

Revision ID: 0008_keywords
Revises: 0007_nia_embed
Create Date: 2026-07-14
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0008_keywords"
down_revision: Union[str, None] = "0007_nia_embed"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(inspector, table_name: str) -> set[str]:
    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "inmuebles" not in inspector.get_table_names():
        return

    columns = _column_names(inspector, "inmuebles")
    if "keywords" not in columns:
        op.add_column("inmuebles", sa.Column("keywords", sa.Text(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "inmuebles" not in inspector.get_table_names():
        return

    columns = _column_names(inspector, "inmuebles")
    if "keywords" in columns:
        op.drop_column("inmuebles", "keywords")