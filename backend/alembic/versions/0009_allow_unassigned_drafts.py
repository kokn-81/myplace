"""allow unassigned property drafts

Revision ID: 0009_unassigned_drafts
Revises: 0008_keywords
Create Date: 2026-08-04
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0009_unassigned_drafts"
down_revision: Union[str, None] = "0008_keywords"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_names(inspector) -> set[str]:
    return set(inspector.get_table_names())


def _column_names(inspector, table_name: str) -> set[str]:
    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = _table_names(inspector)

    if "inmuebles" in tables and "agente_id" in _column_names(inspector, "inmuebles"):
        op.alter_column("inmuebles", "agente_id", existing_type=sa.Integer(), nullable=True)

    if "ofertas" in tables and "agente_id" in _column_names(inspector, "ofertas"):
        op.alter_column("ofertas", "agente_id", existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = _table_names(inspector)

    if "agentes" in tables and "inmuebles" in tables:
        bind.execute(sa.text("""
            UPDATE inmuebles
            SET agente_id = (SELECT id FROM agentes ORDER BY id LIMIT 1)
            WHERE agente_id IS NULL AND EXISTS (SELECT 1 FROM agentes)
        """))

    if "agentes" in tables and "ofertas" in tables:
        bind.execute(sa.text("""
            UPDATE ofertas
            SET agente_id = (SELECT id FROM agentes ORDER BY id LIMIT 1)
            WHERE agente_id IS NULL AND EXISTS (SELECT 1 FROM agentes)
        """))

    if "ofertas" in tables and "agente_id" in _column_names(inspector, "ofertas"):
        op.alter_column("ofertas", "agente_id", existing_type=sa.Integer(), nullable=False)

    if "inmuebles" in tables and "agente_id" in _column_names(inspector, "inmuebles"):
        op.alter_column("inmuebles", "agente_id", existing_type=sa.Integer(), nullable=False)