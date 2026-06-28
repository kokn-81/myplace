from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

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
    descripcion = Column(String)
    amenidades = Column(String)
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
