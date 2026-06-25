"""add bathrooms to properties

Revision ID: 0003_add_bathrooms_to_properties
Revises: 0002_authorized_users
Create Date: 2026-06-25
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003_add_bathrooms_to_properties"
down_revision: Union[str, None] = "0002_authorized_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("inmuebles", sa.Column("banos", sa.Integer(), nullable=True, server_default="1"))
    op.execute("UPDATE inmuebles SET banos = 1 WHERE banos IS NULL")


def downgrade() -> None:
    op.drop_column("inmuebles", "banos")
