from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class AgenteDB(Base):
    __tablename__ = "agentes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    whatsapp = Column(String)
    email = Column(String, index=True, nullable=True, unique=True)
    inmuebles = relationship("InmuebleDB", back_populates="agente", cascade="all, delete-orphan")
    ofertas = relationship("OfertaDB", back_populates="agente", cascade="all, delete-orphan")


class InmuebleDB(Base):
    __tablename__ = "inmuebles"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    precio_usd = Column(Float)
    moneda = Column(String, default="$ (USD)")
    habitaciones = Column(Integer)
    banos = Column(Integer, default=1)
    ciudad = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    operacion = Column(String)
    tipo_inmueble = Column(String)
    estado = Column(String, default="Borrador", index=True)
    superficie_m2 = Column(Float, nullable=True, index=True)
    zona = Column(String, nullable=True, index=True)
    direccion = Column(String, nullable=True)
    piso = Column(String, nullable=True)
    amoblado = Column(Boolean, default=False, index=True)
    acepta_mascotas = Column(Boolean, default=False, index=True)
    parqueos = Column(Integer, default=0, index=True)
    baulera = Column(Boolean, default=False, index=True)
    amenidades_normalizadas = Column(Text, nullable=True)
    search_text = Column(Text, nullable=True)
    embedding_json = Column(Text, nullable=True)
    embedding_model = Column(String, nullable=True)
    embedding_updated_at = Column(DateTime, nullable=True)
    descripcion = Column(String)
    amenidades = Column(String)
    keywords = Column(Text, nullable=True)
    imagenes = Column(String)
    agente_id = Column(Integer, ForeignKey("agentes.id", ondelete="CASCADE"), nullable=False)
    agente = relationship("AgenteDB", back_populates="inmuebles")
    ofertas = relationship("OfertaDB", back_populates="inmueble", cascade="all, delete-orphan")


class OfertaDB(Base):
    __tablename__ = "ofertas"

    id = Column(Integer, primary_key=True, index=True)
    inmueble_id = Column(Integer, ForeignKey("inmuebles.id", ondelete="CASCADE"), nullable=False, index=True)
    operacion = Column(String, index=True, nullable=False)
    precio = Column(Float, nullable=False, default=0)
    moneda = Column(String, default="$ (USD)")
    estado = Column(String, default="Publicado", index=True)
    agente_id = Column(Integer, ForeignKey("agentes.id", ondelete="CASCADE"), nullable=False, index=True)

    inmueble = relationship("InmuebleDB", back_populates="ofertas")
    agente = relationship("AgenteDB", back_populates="ofertas")


class UsuarioAutorizadoDB(Base):
    __tablename__ = "usuarios_autorizados"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False, unique=True)
    role = Column(String, index=True, nullable=False, default="user")
class SearchCacheDB(Base):
    __tablename__ = "search_cache"

    id = Column(Integer, primary_key=True, index=True)
    query_normalized = Column(String, index=True, nullable=False)
    candidate_ids_hash = Column(String, index=True, nullable=False, default="all")
    result_ids = Column(Text, nullable=False, default="[]")
    layer = Column(String, index=True, nullable=False)
    filters_json = Column(Text, nullable=True)
    expires_at = Column(DateTime, index=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), index=True)


class SearchLogDB(Base):
    __tablename__ = "search_logs"

    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(Text, nullable=False)
    query_normalized = Column(String, index=True, nullable=False)
    filters_json = Column(Text, nullable=True)
    layer_used = Column(String, index=True, nullable=False)
    llm_used = Column(Boolean, default=False, index=True)
    embedding_used = Column(Boolean, default=False, index=True)
    cache_hit = Column(Boolean, default=False, index=True)
    result_count = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    tokens_input = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    estimated_cost = Column(Float, default=0)
    user_id = Column(String, nullable=True, index=True)
    contacted_agent = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)
