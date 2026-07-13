"""add property status

Revision ID: 0005_add_property_status
Revises: 0004_create_property_offers
Create Date: 2026-07-10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0005_add_property_status"
down_revision: Union[str, None] = "0004_create_property_offers"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("inmuebles")}

    if "estado" not in columns:
        op.add_column("inmuebles", sa.Column("estado", sa.String(), nullable=True, server_default="Publicado"))
        op.execute("UPDATE inmuebles SET estado = 'Publicado' WHERE estado IS NULL OR estado = ''")

    indexes = {index["name"] for index in inspector.get_indexes("inmuebles")}
    if "ix_inmuebles_estado" not in indexes:
        op.create_index("ix_inmuebles_estado", "inmuebles", ["estado"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    indexes = {index["name"] for index in inspector.get_indexes("inmuebles")}
    if "ix_inmuebles_estado" in indexes:
        op.drop_index("ix_inmuebles_estado", table_name="inmuebles")

    columns = {column["name"] for column in inspector.get_columns("inmuebles")}
    if "estado" in columns:
        op.drop_column("inmuebles", "estado")
