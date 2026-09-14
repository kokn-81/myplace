import html
import json
import secrets
from typing import Any, Optional
from urllib.parse import quote

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from models import InmuebleDB, LeadEventDB, OfertaDB

SLUG_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"
PUBLIC_SITE_URL = "https://nia-web.com"
CONTACT_WHATSAPP_NUMBER = "59157015854"


def generate_slug(length: int = 8) -> str:
    return "".join(secrets.choice(SLUG_ALPHABET) for _ in range(length))


def public_site_url() -> str:
    import os
    return (os.getenv("PUBLIC_SITE_URL") or PUBLIC_SITE_URL).rstrip("/")


def context_url(slug: str) -> str:
    return f"{public_site_url()}/c/{slug}"


def _clean(value: Any) -> str:
    return str(value or "").strip()


def _plazo_phrase(plazo: Optional[str]) -> str:
    value = _clean(plazo).lower().replace("í", "i")
    if value == "esta semana":
        return "para esta semana"
    if value in {"30 dias", "30 días"}:
        return "para este mes"
    if value == "3 meses":
        return "para los proximos 3 meses"
    if value == "sin apuro":
        return "sin apuro"
    return ""


def build_whatsapp_message(
    *,
    property_ref: Optional[str] = None,
    zona: Optional[str] = None,
    operacion: Optional[str] = None,
    presupuesto: Optional[str] = None,
    plazo: Optional[str] = None,
    slug: str,
) -> str:
    ref = _clean(property_ref).lstrip("#")
    zone = _clean(zona)
    operation = _clean(operacion)
    budget = _clean(presupuesto)
    phrase = _plazo_phrase(plazo)
    url = context_url(slug)
    lines = ["Hola, vengo de NIA."]

    def with_plazo(line: str) -> str:
        if not phrase:
            return f"{line}:"
        if phrase == "sin apuro":
            return f"{line}, {phrase}:"
        return f"{line} {phrase}:"

    if ref:
        line = f"Me interesa la REF {ref}"
        if zone:
            line += f" en {zone}"
        bits = [part for part in (operation, budget) if part]
        if bits:
            line += f" ({', '.join(bits)})"
        lines.append(with_plazo(line))
    else:
        line = f"Busco {operation}" if operation else "Busco un inmueble"
        if zone:
            line += f" en {zone}"
        if budget:
            line += f", presupuesto {budget}"
        lines.append(with_plazo(line))

    lines.append(url)
    return "\n".join(lines)


def first_image_url(inm: InmuebleDB) -> str:
    raw = str(inm.imagenes or "")
    for url in raw.split(","):
        candidate = url.strip()
        if candidate and not candidate.lower().startswith("https://collection.cloudinary.com/"):
            return candidate
    return ""


def property_snapshot(inm: Optional[InmuebleDB]) -> Optional[dict]:
    if inm is None:
        return None
    return {
        "ref": inm.id,
        "title": inm.titulo or "",
        "zona": (inm.zona or inm.ciudad or "").strip(),
        "operacion": inm.operacion or "",
        "image": first_image_url(inm),
        "type": inm.tipo_inmueble or "",
    }


def create_lead_event(
    db: Session,
    *,
    action: str,
    property_ref: Optional[int] = None,
    operacion: Optional[str] = None,
    zona: Optional[str] = None,
    presupuesto: Optional[str] = None,
    extra_filters: Optional[dict] = None,
    plazo: Optional[str] = None,
    session_id: Optional[str] = None,
    user_id: Optional[str] = None,
) -> LeadEventDB:
    if action not in {"contact_tap", "share"}:
        raise ValueError("invalid_action")

    contacted = action == "contact_tap"
    payload_filters = extra_filters if isinstance(extra_filters, dict) else {}
    last_error: Optional[Exception] = None
    for _ in range(6):
        event = LeadEventDB(
            slug=generate_slug(),
            action=action,
            property_ref=property_ref,
            operacion=_clean(operacion) or None,
            zona=_clean(zona) or None,
            presupuesto=_clean(presupuesto) or None,
            extra_filters_json=json.dumps(payload_filters, ensure_ascii=False) if payload_filters else None,
            plazo=_clean(plazo) or None,
            session_id=_clean(session_id) or None,
            user_id=_clean(user_id) or None,
            contacted_agent=contacted,
        )
        db.add(event)
        try:
            db.commit()
            db.refresh(event)
            return event
        except IntegrityError as exc:
            db.rollback()
            last_error = exc
            continue
    raise RuntimeError("slug_collision") from last_error


def get_lead_event_by_slug(db: Session, slug: str) -> Optional[LeadEventDB]:
    return db.query(LeadEventDB).filter(LeadEventDB.slug == slug).first()


def load_published_property(db: Session, property_ref: Optional[int]) -> Optional[InmuebleDB]:
    if not property_ref:
        return None
    return (
        db.query(InmuebleDB)
        .options(selectinload(InmuebleDB.ofertas).selectinload(OfertaDB.agente), selectinload(InmuebleDB.agente))
        .filter(InmuebleDB.id == property_ref, InmuebleDB.estado == "Publicado")
        .first()
    )


def public_lead_payload(event: LeadEventDB, inm: Optional[InmuebleDB] = None) -> dict:
    extra = {}
    if event.extra_filters_json:
        try:
            parsed = json.loads(event.extra_filters_json)
            extra = parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            extra = {}
    snapshot = property_snapshot(inm)
    return {
        "slug": event.slug,
        "action": event.action,
        "property_ref": event.property_ref,
        "operacion": event.operacion,
        "zona": event.zona or (snapshot or {}).get("zona") or "",
        "presupuesto": event.presupuesto,
        "plazo": event.plazo,
        "extra_filters": extra,
        "created_at": event.created_at.isoformat() if event.created_at else None,
        "property": snapshot,
        "url": context_url(event.slug),
    }


def serialize_lead_created(event: LeadEventDB) -> dict:
    text = build_whatsapp_message(
        property_ref=str(event.property_ref) if event.property_ref is not None else None,
        zona=event.zona,
        operacion=event.operacion,
        presupuesto=event.presupuesto,
        plazo=event.plazo,
        slug=event.slug,
    )
    return {
        "slug": event.slug,
        "url": context_url(event.slug),
        "action": event.action,
        "property_ref": event.property_ref,
        "contacted_agent": bool(event.contacted_agent),
        "session_id": event.session_id,
        "whatsapp_text": text,
        "whatsapp_url": f"https://wa.me/{CONTACT_WHATSAPP_NUMBER}?text={quote(text)}",
    }


def render_context_html(payload: dict) -> str:
    property_data = payload.get("property") or {}
    title = _clean(property_data.get("title")) or "Consulta NIA"
    zona = _clean(payload.get("zona")) or _clean(property_data.get("zona"))
    operacion = _clean(payload.get("operacion"))
    presupuesto = _clean(payload.get("presupuesto"))
    image = _clean(property_data.get("image"))
    ref = payload.get("property_ref")
    summary_bits = [bit for bit in (operacion, zona, presupuesto) if bit]
    description = " · ".join(summary_bits) or "Consulta de inmueble en NIA"
    og_image_tag = (
        f'<meta property="og:image" content="{html.escape(image, quote=True)}" />'
        if image else ""
    )
    photo_html = (
        f'<img src="{html.escape(image, quote=True)}" alt="{html.escape(title)}" style="width:100%;border-radius:16px;margin:0 0 1.25rem;" />'
        if image else ""
    )
    listing_html = ""
    if property_data:
        listing_html = f"""
        <p class="kicker">REF {html.escape(str(ref or property_data.get("ref") or ""))}</p>
        <h1>{html.escape(title)}</h1>
        """
    else:
        listing_html = "<h1>Consulta NIA</h1>"

    plazo = _clean(payload.get("plazo"))
    filter_rows = "".join(
        f"<li><span>{html.escape(label)}</span><strong>{html.escape(value)}</strong></li>"
        for label, value in (
            ("Operacion", operacion),
            ("Zona", zona),
            ("Presupuesto", presupuesto),
            ("Plazo", plazo),
        )
        if value
    )
    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(description)}" />
  <meta name="robots" content="noindex, nofollow" />
  <meta property="og:title" content="{html.escape(title)}" />
  <meta property="og:description" content="{html.escape(description)}" />
  <meta property="og:type" content="website" />
  {og_image_tag}
  <style>
    :root {{ color-scheme: light; }}
    body {{ margin:0; font-family: Montserrat, Arial, sans-serif; background:#F8F3E7; color:#2F241D; }}
    main {{ max-width: 36rem; margin: 0 auto; padding: 2rem 1.25rem 3rem; }}
    .kicker {{ letter-spacing:.18em; text-transform:uppercase; font-size:.72rem; color:#C49362; font-weight:800; }}
    h1 {{ font-family: "Playfair Display", Georgia, serif; font-size:1.8rem; margin:.35rem 0 1rem; }}
    ul {{ list-style:none; padding:0; margin:1.5rem 0 0; }}
    li {{ display:flex; justify-content:space-between; gap:1rem; padding:.75rem 0; border-bottom:1px solid #D7C29A; }}
    span {{ color:#6E6255; font-size:.8rem; text-transform:uppercase; letter-spacing:.12em; }}
  </style>
</head>
<body>
  <main>
    {photo_html}
    {listing_html}
    <p>Resumen de la consulta. Sin datos personales.</p>
    <ul>{filter_rows or "<li><span>Consulta</span><strong>Filtros de NIA</strong></li>"}</ul>
  </main>
</body>
</html>
"""
