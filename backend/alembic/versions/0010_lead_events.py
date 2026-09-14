"""lead events for contact_tap and share

Revision ID: 0010_lead_events
Revises: 0009_unassigned_drafts
Create Date: 2026-09-13
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0010_lead_events"
down_revision: Union[str, None] = "0009_unassigned_drafts"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "lead_events" in inspector.get_table_names():
        return
    op.create_table(
        "lead_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=16), nullable=False),
        sa.Column("action", sa.String(length=32), nullable=False),
        sa.Column("property_ref", sa.Integer(), nullable=True),
        sa.Column("operacion", sa.String(), nullable=True),
        sa.Column("zona", sa.String(), nullable=True),
        sa.Column("presupuesto", sa.String(), nullable=True),
        sa.Column("extra_filters_json", sa.Text(), nullable=True),
        sa.Column("plazo", sa.String(), nullable=True),
        sa.Column("session_id", sa.String(), nullable=True),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("contacted_agent", sa.Boolean(), nullable=True, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_lead_events_slug", "lead_events", ["slug"], unique=True)
    op.create_index("ix_lead_events_action", "lead_events", ["action"])
    op.create_index("ix_lead_events_property_ref", "lead_events", ["property_ref"])
    op.create_index("ix_lead_events_session_id", "lead_events", ["session_id"])
    op.create_index("ix_lead_events_user_id", "lead_events", ["user_id"])
    op.create_index("ix_lead_events_contacted_agent", "lead_events", ["contacted_agent"])
    op.create_index("ix_lead_events_created_at", "lead_events", ["created_at"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "lead_events" not in inspector.get_table_names():
        return
    op.drop_index("ix_lead_events_created_at", table_name="lead_events")
    op.drop_index("ix_lead_events_contacted_agent", table_name="lead_events")
    op.drop_index("ix_lead_events_user_id", table_name="lead_events")
    op.drop_index("ix_lead_events_session_id", table_name="lead_events")
    op.drop_index("ix_lead_events_property_ref", table_name="lead_events")
    op.drop_index("ix_lead_events_action", table_name="lead_events")
    op.drop_index("ix_lead_events_slug", table_name="lead_events")
    op.drop_table("lead_events")
