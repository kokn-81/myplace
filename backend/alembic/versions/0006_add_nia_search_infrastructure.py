"""add nia search infrastructure

Revision ID: 0006_add_nia_search_infrastructure
Revises: 0005_add_property_status
Create Date: 2026-07-12
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0006_add_nia_search_infrastructure"
down_revision: Union[str, None] = "0005_add_property_status"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(inspector, table_name: str) -> set[str]:
    return {column["name"] for column in inspector.get_columns(table_name)}


def _index_names(inspector, table_name: str) -> set[str]:
    return {index["name"] for index in inspector.get_indexes(table_name)}


def _add_column_if_missing(table_name: str, columns: set[str], column: sa.Column) -> None:
    if column.name not in columns:
        op.add_column(table_name, column)
        columns.add(column.name)


def _create_index_if_missing(inspector, name: str, table_name: str, columns: list[str]) -> None:
    if name not in _index_names(inspector, table_name):
        op.create_index(name, table_name, columns)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = inspector.get_table_names()

    if "inmuebles" in table_names:
        columns = _column_names(inspector, "inmuebles")
        _add_column_if_missing("inmuebles", columns, sa.Column("superficie_m2", sa.Float(), nullable=True))
        _add_column_if_missing("inmuebles", columns, sa.Column("zona", sa.String(), nullable=True))
        _add_column_if_missing("inmuebles", columns, sa.Column("direccion", sa.String(), nullable=True))
        _add_column_if_missing("inmuebles", columns, sa.Column("piso", sa.String(), nullable=True))
        _add_column_if_missing("inmuebles", columns, sa.Column("amoblado", sa.Boolean(), nullable=True, server_default=sa.false()))
        _add_column_if_missing("inmuebles", columns, sa.Column("acepta_mascotas", sa.Boolean(), nullable=True, server_default=sa.false()))
        _add_column_if_missing("inmuebles", columns, sa.Column("parqueos", sa.Integer(), nullable=True, server_default="0"))
        _add_column_if_missing("inmuebles", columns, sa.Column("baulera", sa.Boolean(), nullable=True, server_default=sa.false()))
        _add_column_if_missing("inmuebles", columns, sa.Column("amenidades_normalizadas", sa.Text(), nullable=True))
        _add_column_if_missing("inmuebles", columns, sa.Column("search_text", sa.Text(), nullable=True))

        inspector = sa.inspect(bind)
        _create_index_if_missing(inspector, "ix_inmuebles_superficie_m2", "inmuebles", ["superficie_m2"])
        _create_index_if_missing(inspector, "ix_inmuebles_zona", "inmuebles", ["zona"])
        _create_index_if_missing(inspector, "ix_inmuebles_amoblado", "inmuebles", ["amoblado"])
        _create_index_if_missing(inspector, "ix_inmuebles_acepta_mascotas", "inmuebles", ["acepta_mascotas"])
        _create_index_if_missing(inspector, "ix_inmuebles_parqueos", "inmuebles", ["parqueos"])
        _create_index_if_missing(inspector, "ix_inmuebles_baulera", "inmuebles", ["baulera"])

        op.execute(
            """
            UPDATE inmuebles
               SET zona = COALESCE(NULLIF(zona, ''), ciudad),
                   amoblado = CASE WHEN LOWER(COALESCE(amenidades, '') || ' ' || COALESCE(descripcion, '')) LIKE '%amoblad%' THEN TRUE ELSE COALESCE(amoblado, FALSE) END,
                   acepta_mascotas = CASE WHEN LOWER(COALESCE(amenidades, '') || ' ' || COALESCE(descripcion, '')) LIKE '%mascota%' THEN TRUE ELSE COALESCE(acepta_mascotas, FALSE) END,
                   parqueos = CASE WHEN LOWER(COALESCE(amenidades, '') || ' ' || COALESCE(descripcion, '')) LIKE '%parqueo%' THEN COALESCE(NULLIF(parqueos, 0), 1) ELSE COALESCE(parqueos, 0) END,
                   baulera = CASE WHEN LOWER(COALESCE(amenidades, '') || ' ' || COALESCE(descripcion, '')) LIKE '%baulera%' THEN TRUE ELSE COALESCE(baulera, FALSE) END,
                   amenidades_normalizadas = LOWER(COALESCE(amenidades, '')),
                   search_text = LOWER(COALESCE(titulo, '') || ' ' || COALESCE(tipo_inmueble, '') || ' ' || COALESCE(operacion, '') || ' ' || COALESCE(ciudad, '') || ' ' || COALESCE(zona, '') || ' ' || COALESCE(amenidades, ''))
             WHERE search_text IS NULL OR search_text = ''
            """
        )

    if "search_cache" not in table_names:
        op.create_table(
            "search_cache",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("query_normalized", sa.String(), nullable=False),
            sa.Column("candidate_ids_hash", sa.String(), nullable=False, server_default="all"),
            sa.Column("result_ids", sa.Text(), nullable=False, server_default="[]"),
            sa.Column("layer", sa.String(), nullable=False),
            sa.Column("filters_json", sa.Text(), nullable=True),
            sa.Column("expires_at", sa.DateTime(), nullable=False),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_search_cache_id", "search_cache", ["id"])
        op.create_index("ix_search_cache_query_normalized", "search_cache", ["query_normalized"])
        op.create_index("ix_search_cache_candidate_ids_hash", "search_cache", ["candidate_ids_hash"])
        op.create_index("ix_search_cache_layer", "search_cache", ["layer"])
        op.create_index("ix_search_cache_expires_at", "search_cache", ["expires_at"])
        op.create_index("ix_search_cache_created_at", "search_cache", ["created_at"])

    if "search_logs" not in table_names:
        op.create_table(
            "search_logs",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("query_text", sa.Text(), nullable=False),
            sa.Column("query_normalized", sa.String(), nullable=False),
            sa.Column("filters_json", sa.Text(), nullable=True),
            sa.Column("layer_used", sa.String(), nullable=False),
            sa.Column("llm_used", sa.Boolean(), nullable=True, server_default=sa.false()),
            sa.Column("embedding_used", sa.Boolean(), nullable=True, server_default=sa.false()),
            sa.Column("cache_hit", sa.Boolean(), nullable=True, server_default=sa.false()),
            sa.Column("result_count", sa.Integer(), nullable=True, server_default="0"),
            sa.Column("latency_ms", sa.Integer(), nullable=True, server_default="0"),
            sa.Column("tokens_input", sa.Integer(), nullable=True, server_default="0"),
            sa.Column("tokens_output", sa.Integer(), nullable=True, server_default="0"),
            sa.Column("estimated_cost", sa.Float(), nullable=True, server_default="0"),
            sa.Column("user_id", sa.String(), nullable=True),
            sa.Column("contacted_agent", sa.Boolean(), nullable=True, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_search_logs_id", "search_logs", ["id"])
        op.create_index("ix_search_logs_query_normalized", "search_logs", ["query_normalized"])
        op.create_index("ix_search_logs_layer_used", "search_logs", ["layer_used"])
        op.create_index("ix_search_logs_llm_used", "search_logs", ["llm_used"])
        op.create_index("ix_search_logs_embedding_used", "search_logs", ["embedding_used"])
        op.create_index("ix_search_logs_cache_hit", "search_logs", ["cache_hit"])
        op.create_index("ix_search_logs_user_id", "search_logs", ["user_id"])
        op.create_index("ix_search_logs_contacted_agent", "search_logs", ["contacted_agent"])
        op.create_index("ix_search_logs_created_at", "search_logs", ["created_at"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = inspector.get_table_names()

    if "search_logs" in table_names:
        for index in [
            "ix_search_logs_created_at", "ix_search_logs_contacted_agent", "ix_search_logs_user_id",
            "ix_search_logs_cache_hit", "ix_search_logs_embedding_used", "ix_search_logs_llm_used",
            "ix_search_logs_layer_used", "ix_search_logs_query_normalized", "ix_search_logs_id",
        ]:
            if index in _index_names(inspector, "search_logs"):
                op.drop_index(index, table_name="search_logs")
        op.drop_table("search_logs")

    if "search_cache" in table_names:
        for index in [
            "ix_search_cache_created_at", "ix_search_cache_expires_at", "ix_search_cache_layer",
            "ix_search_cache_candidate_ids_hash", "ix_search_cache_query_normalized", "ix_search_cache_id",
        ]:
            if index in _index_names(inspector, "search_cache"):
                op.drop_index(index, table_name="search_cache")
        op.drop_table("search_cache")

    if "inmuebles" in table_names:
        inspector = sa.inspect(bind)
        for index in [
            "ix_inmuebles_baulera", "ix_inmuebles_parqueos", "ix_inmuebles_acepta_mascotas",
            "ix_inmuebles_amoblado", "ix_inmuebles_zona", "ix_inmuebles_superficie_m2",
        ]:
            if index in _index_names(inspector, "inmuebles"):
                op.drop_index(index, table_name="inmuebles")
        columns = _column_names(inspector, "inmuebles")
        for column in [
            "search_text", "amenidades_normalizadas", "baulera", "parqueos", "acepta_mascotas",
            "amoblado", "piso", "direccion", "zona", "superficie_m2",
        ]:
            if column in columns:
                op.drop_column("inmuebles", column)