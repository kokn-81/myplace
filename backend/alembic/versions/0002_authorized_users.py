"""authorized users

Revision ID: 0002_authorized_users
Revises: 0001_initial_schema
Create Date: 2026-06-24
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002_authorized_users"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "usuarios_autorizados",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_usuarios_autorizados_email"), "usuarios_autorizados", ["email"], unique=False)
    op.create_index(op.f("ix_usuarios_autorizados_id"), "usuarios_autorizados", ["id"], unique=False)
    op.create_index(op.f("ix_usuarios_autorizados_role"), "usuarios_autorizados", ["role"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_usuarios_autorizados_role"), table_name="usuarios_autorizados")
    op.drop_index(op.f("ix_usuarios_autorizados_id"), table_name="usuarios_autorizados")
    op.drop_index(op.f("ix_usuarios_autorizados_email"), table_name="usuarios_autorizados")
    op.drop_table("usuarios_autorizados")
