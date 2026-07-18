"""add local embedding storage

Revision ID: 0007_nia_embed
Revises: 0006_nia_search
Create Date: 2026-07-14
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0007_nia_embed"
down_revision: Union[str, None] = "0006_nia_search"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(inspector, table_name: str) -> set[str]:
    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = inspector.get_table_names()

    if "inmuebles" not in table_names:
        return

    columns = _column_names(inspector, "inmuebles")
    if "embedding_json" not in columns:
        op.add_column("inmuebles", sa.Column("embedding_json", sa.Text(), nullable=True))
    if "embedding_model" not in columns:
        op.add_column("inmuebles", sa.Column("embedding_model", sa.String(), nullable=True))
    if "embedding_updated_at" not in columns:
        op.add_column("inmuebles", sa.Column("embedding_updated_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = inspector.get_table_names()

    if "inmuebles" not in table_names:
        return

    columns = _column_names(inspector, "inmuebles")
    for column in ["embedding_updated_at", "embedding_model", "embedding_json"]:
        if column in columns:
            op.drop_column("inmuebles", column)