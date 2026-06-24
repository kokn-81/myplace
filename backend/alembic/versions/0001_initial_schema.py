"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-06-24
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "agentes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(), nullable=True),
        sa.Column("whatsapp", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_agentes_email"), "agentes", ["email"], unique=False)
    op.create_index(op.f("ix_agentes_id"), "agentes", ["id"], unique=False)

    op.create_table(
        "inmuebles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("titulo", sa.String(), nullable=True),
        sa.Column("precio_usd", sa.Float(), nullable=True),
        sa.Column("moneda", sa.String(), nullable=True),
        sa.Column("habitaciones", sa.Integer(), nullable=True),
        sa.Column("ciudad", sa.String(), nullable=True),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lng", sa.Float(), nullable=True),
        sa.Column("operacion", sa.String(), nullable=True),
        sa.Column("tipo_inmueble", sa.String(), nullable=True),
        sa.Column("descripcion", sa.String(), nullable=True),
        sa.Column("amenidades", sa.String(), nullable=True),
        sa.Column("imagenes", sa.String(), nullable=True),
        sa.Column("agente_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["agente_id"], ["agentes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_inmuebles_id"), "inmuebles", ["id"], unique=False)
    op.create_index(op.f("ix_inmuebles_titulo"), "inmuebles", ["titulo"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_inmuebles_titulo"), table_name="inmuebles")
    op.drop_index(op.f("ix_inmuebles_id"), table_name="inmuebles")
    op.drop_table("inmuebles")
    op.drop_index(op.f("ix_agentes_id"), table_name="agentes")
    op.drop_index(op.f("ix_agentes_email"), table_name="agentes")
    op.drop_table("agentes")
