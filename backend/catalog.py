from typing import Optional

from sqlalchemy.orm import Session

from models import AgenteDB, ComplejoDB, OficinaDB

OCUPACIONES_PUBLICAS = {"Disponible", "Reservado"}
OCUPACIONES = {"Disponible", "Reservado", "Alquilado", "Vendido", "Pausado"}
DEFAULT_OFFICE_NAME = "REMAX Patrimonio"


def normalizar_ocupacion(valor: Optional[str]) -> str:
    texto = (valor or "Disponible").strip().capitalize()
    return texto if texto in OCUPACIONES else "Disponible"


def es_publicable(ocupacion: Optional[str], estado: Optional[str]) -> bool:
    return (estado or "Borrador") == "Publicado" and (ocupacion or "Disponible") in OCUPACIONES_PUBLICAS


def find_or_create_oficina(db: Session, nombre: Optional[str] = None, ciudad: Optional[str] = None) -> OficinaDB:
    label = (nombre or DEFAULT_OFFICE_NAME).strip() or DEFAULT_OFFICE_NAME
    oficina = db.query(OficinaDB).filter(OficinaDB.nombre == label).first()
    if oficina:
        return oficina
    oficina = OficinaDB(nombre=label, ciudad=(ciudad or "Santa Cruz").strip())
    db.add(oficina)
    db.flush()
    return oficina


def find_or_create_complejo(
    db: Session,
    *,
    complejo_id: Optional[int] = None,
    nombre: Optional[str] = None,
    ciudad: Optional[str] = None,
    zona: Optional[str] = None,
    direccion: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
) -> Optional[ComplejoDB]:
    if complejo_id:
        existente = db.query(ComplejoDB).filter(ComplejoDB.id == complejo_id).first()
        if existente:
            return existente
    label = (nombre or "").strip()
    if not label:
        return None
    zona_label = (zona or ciudad or "").strip()
    query = db.query(ComplejoDB).filter(ComplejoDB.nombre == label)
    if zona_label:
        query = query.filter((ComplejoDB.zona == zona_label) | (ComplejoDB.ciudad == zona_label))
    existente = query.first()
    if existente:
        if lat is not None and lng is not None:
            existente.lat = lat
            existente.lng = lng
        if zona_label and not existente.zona:
            existente.zona = zona_label
        if ciudad and not existente.ciudad:
            existente.ciudad = ciudad
        if direccion and not existente.direccion:
            existente.direccion = direccion
        return existente
    complejo = ComplejoDB(
        nombre=label,
        ciudad=(ciudad or zona_label or None),
        zona=zona_label or None,
        direccion=(direccion or "").strip() or None,
        lat=lat,
        lng=lng,
    )
    db.add(complejo)
    db.flush()
    return complejo


def find_or_create_captador(db: Session, nombre: Optional[str], whatsapp: Optional[str], oficina_id: Optional[int] = None) -> Optional[AgenteDB]:
    label = (nombre or "").strip()
    phone = "".join(ch for ch in str(whatsapp or "") if ch.isdigit())
    if not label and not phone:
        return None
    if phone:
        existente = db.query(AgenteDB).filter(AgenteDB.whatsapp.contains(phone[-8:])).first()
        if existente:
            if label:
                existente.nombre = label
            if oficina_id:
                existente.oficina_id = oficina_id
            return existente
    if label:
        existente = db.query(AgenteDB).filter(AgenteDB.nombre == label, AgenteDB.email.is_(None)).first()
        if existente:
            if phone:
                existente.whatsapp = phone
            if oficina_id:
                existente.oficina_id = oficina_id
            return existente
    agente = AgenteDB(nombre=label or "Captador", whatsapp=phone or "", oficina_id=oficina_id)
    db.add(agente)
    db.flush()
    return agente


def serializar_agente_min(agente: Optional[AgenteDB]) -> Optional[dict]:
    if not agente:
        return None
    return {
        "id": str(agente.id),
        "name": agente.nombre,
        "whatsapp": agente.whatsapp,
        "oficina": agente.oficina.nombre if getattr(agente, "oficina", None) else None,
    }
