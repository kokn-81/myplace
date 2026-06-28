"""create property offers

Revision ID: 0004_create_property_offers
Revises: 0003_add_bathrooms_to_properties
Create Date: 2026-06-27
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0004_create_property_offers"
down_revision: Union[str, None] = "0003_add_bathrooms_to_properties"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = inspector.get_table_names()

    if "ofertas" not in table_names:
        op.create_table(
            "ofertas",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("inmueble_id", sa.Integer(), nullable=False),
            sa.Column("operacion", sa.String(), nullable=False, index=True),
            sa.Column("precio", sa.Float(), nullable=False, server_default="0"),
            sa.Column("moneda", sa.String(), nullable=True, server_default="$ (USD)"),
            sa.Column("estado", sa.String(), nullable=True, server_default="Publicado", index=True),
            sa.Column("agente_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["inmueble_id"], ["inmuebles.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["agente_id"], ["agentes.id"], ondelete="CASCADE"),
        )

    indexes = {index["name"] for index in inspector.get_indexes("ofertas")}
    if "ix_ofertas_inmueble_id" not in indexes:
        op.create_index("ix_ofertas_inmueble_id", "ofertas", ["inmueble_id"])
    if "ix_ofertas_agente_id" not in indexes:
        op.create_index("ix_ofertas_agente_id", "ofertas", ["agente_id"])

    op.execute(
        """
        INSERT INTO ofertas (inmueble_id, operacion, precio, moneda, estado, agente_id)
        SELECT id,
               COALESCE(NULLIF(operacion, ''), 'Venta'),
               COALESCE(precio_usd, 0),
               COALESCE(NULLIF(moneda, ''), '$ (USD)'),
               'Publicado',
               agente_id
        FROM inmuebles
        WHERE agente_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM ofertas WHERE ofertas.inmueble_id = inmuebles.id
          )
        """
    )


def downgrade() -> None:
    op.drop_index("ix_ofertas_agente_id", table_name="ofertas")
    op.drop_index("ix_ofertas_inmueble_id", table_name="ofertas")
    op.drop_table("ofertas")
