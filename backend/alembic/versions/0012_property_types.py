"""property types and exclusive characteristics
Revision ID: 0012_property_types
Revises: 0011_catalog_complejos
Create Date: 2026-09-21
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0012_property_types"
down_revision: Union[str, None] = "0011_catalog_complejos"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _columns(inspector, table: str) -> set[str]:
    if table not in inspector.get_table_names():
        return set()
    return {column["name"] for column in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    inm_cols = _columns(inspector, "inmuebles")

    if "fecha_entrega" not in inm_cols:
        op.add_column("inmuebles", sa.Column("fecha_entrega", sa.String(), nullable=True))
        op.create_index("ix_inmuebles_fecha_entrega", "inmuebles", ["fecha_entrega"])
    if "avance_obra" not in inm_cols:
        op.add_column("inmuebles", sa.Column("avance_obra", sa.Integer(), nullable=True))
    if "fase_obra" not in inm_cols:
        op.add_column("inmuebles", sa.Column("fase_obra", sa.String(), nullable=True))
    if "subtipo_comercial" not in inm_cols:
        op.add_column("inmuebles", sa.Column("subtipo_comercial", sa.String(), nullable=True))
        op.create_index("ix_inmuebles_subtipo_comercial", "inmuebles", ["subtipo_comercial"])
    if "dimensiones" not in inm_cols:
        op.add_column("inmuebles", sa.Column("dimensiones", sa.String(), nullable=True))
    if "servicios_basicos" not in inm_cols:
        op.add_column("inmuebles", sa.Column("servicios_basicos", sa.String(), nullable=True))
    if "datos_especificos_json" not in inm_cols:
        op.add_column("inmuebles", sa.Column("datos_especificos_json", sa.Text(), nullable=True))


def downgrade() -> None:
    pass
