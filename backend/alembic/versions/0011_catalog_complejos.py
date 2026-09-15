"""oficinas, complejos, ocupacion y agentes de oferta

Revision ID: 0011_catalog_complejos
Revises: 0010_lead_events
Create Date: 2026-09-15
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0011_catalog_complejos"
down_revision: Union[str, None] = "0010_lead_events"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _tables(inspector) -> set[str]:
    return set(inspector.get_table_names())


def _columns(inspector, table: str) -> set[str]:
    if table not in inspector.get_table_names():
        return set()
    return {column["name"] for column in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = _tables(inspector)

    if "oficinas" not in tables:
        op.create_table(
            "oficinas",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("nombre", sa.String(), nullable=False),
            sa.Column("ciudad", sa.String(), nullable=True),
            sa.Column("telefono", sa.String(), nullable=True),
            sa.Column("whatsapp", sa.String(), nullable=True),
        )
        op.create_index("ix_oficinas_nombre", "oficinas", ["nombre"])

    if "complejos" not in tables:
        op.create_table(
            "complejos",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("nombre", sa.String(), nullable=False),
            sa.Column("ciudad", sa.String(), nullable=True),
            sa.Column("zona", sa.String(), nullable=True),
            sa.Column("direccion", sa.String(), nullable=True),
            sa.Column("lat", sa.Float(), nullable=True),
            sa.Column("lng", sa.Float(), nullable=True),
            sa.Column("amenidades", sa.String(), nullable=True),
            sa.Column("imagenes", sa.String(), nullable=True),
        )
        op.create_index("ix_complejos_nombre", "complejos", ["nombre"])

    inspector = sa.inspect(bind)
    if "oficina_id" not in _columns(inspector, "agentes"):
        op.add_column("agentes", sa.Column("oficina_id", sa.Integer(), nullable=True))
    if "complejo_id" not in _columns(inspector, "inmuebles"):
        op.add_column("inmuebles", sa.Column("complejo_id", sa.Integer(), nullable=True))
    if "ocupacion" not in _columns(inspector, "inmuebles"):
        op.add_column("inmuebles", sa.Column("ocupacion", sa.String(), nullable=True, server_default="Disponible"))

    inspector = sa.inspect(bind)
    oferta_cols = _columns(inspector, "ofertas")
    if "captador_id" not in oferta_cols:
        op.add_column("ofertas", sa.Column("captador_id", sa.Integer(), nullable=True))
    if "colocador_id" not in oferta_cols:
        op.add_column("ofertas", sa.Column("colocador_id", sa.Integer(), nullable=True))
    if "incluye_expensas" not in oferta_cols:
        op.add_column("ofertas", sa.Column("incluye_expensas", sa.Boolean(), nullable=True, server_default=sa.false()))
    if "monto_expensas" not in oferta_cols:
        op.add_column("ofertas", sa.Column("monto_expensas", sa.Float(), nullable=True))
    if "expensas_moneda" not in oferta_cols:
        op.add_column("ofertas", sa.Column("expensas_moneda", sa.String(), nullable=True))

    op.execute("UPDATE inmuebles SET ocupacion = 'Disponible' WHERE ocupacion IS NULL OR ocupacion = ''")
    op.execute("UPDATE ofertas SET captador_id = COALESCE(captador_id, agente_id) WHERE captador_id IS NULL")


def downgrade() -> None:
    pass
