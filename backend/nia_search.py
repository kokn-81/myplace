import hashlib
import json
import os
import re
import time
import unicodedata
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta
from typing import Iterable, Optional

from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from models import InmuebleDB, SearchCacheDB, SearchLogDB

USD_TO_BS = 6.96
CACHE_TTL_GENERAL_MINUTES = 24 * 60
CACHE_TTL_REFINED_MINUTES = 5
MAX_RESULTS = 40


def read_float_env(name: str, default: float = 0.0) -> float:
    try:
        return float(os.getenv(name, str(default)) or default)
    except ValueError:
        return default


LLM_INPUT_COST_PER_1M = read_float_env("NIA_LLM_INPUT_COST_PER_1M")
LLM_OUTPUT_COST_PER_1M = read_float_env("NIA_LLM_OUTPUT_COST_PER_1M")


def estimate_llm_cost(input_tokens: int, output_tokens: int) -> float:
    return round(
        (float(input_tokens or 0) / 1_000_000) * LLM_INPUT_COST_PER_1M
        + (float(output_tokens or 0) / 1_000_000) * LLM_OUTPUT_COST_PER_1M,
        8,
    )

STOPWORDS = {
    "a", "al", "algo", "con", "de", "del", "el", "en", "la", "las", "los", "me",
    "para", "por", "que", "quiero", "un", "una", "unos", "unas", "y", "o", "hasta",
    "menos", "mas", "maso", "cerca", "busco", "necesito", "opcion", "opciones",
}

TYPE_SYNONYMS = {
    "Departamento": ("departamento", "depa", "monoambiente", "garzonier"),
    "Casa": ("casa", "quinta"),
    "Terreno": ("terreno", "lote"),
    "Oficina": ("oficina",),
    "Local Comercial": ("local", "comercial", "tienda"),
}

AMENITY_SYNONYMS = {
    "amoblado": ("amoblado", "amoblada", "muebles", "equipado", "equipada"),
    "parqueo": ("parqueo", "garaje", "garage", "estacionamiento"),
    "baulera": ("baulera", "deposito", "depósito"),
    "piscina": ("piscina",),
    "churrasquera": ("churrasquera", "churrasco", "parrillero"),
    "gimnasio": ("gimnasio", "gym"),
    "seguridad 24 horas": ("seguridad 24", "porteria", "portería", "vigilancia"),
    "mascotas": ("mascota", "mascotas", "pet friendly", "perro", "gato"),
    "lavanderia": ("lavanderia", "lavandería", "area de lavanderia", "área de lavandería"),
    "sauna": ("sauna",),
}

KNOWN_ZONES = (
    "equipetrol", "equipetrol norte", "urubo", "norte", "sur", "este", "oeste", "centro",
    "sirari", "las palmas", "av san martin", "san martin", "banzer", "alemana", "doble via la guardia",
)

COMPLEX_TERMS = (
    "compar", "conviene", "recomienda", "recomend", "mejor", "por que", "por qué",
    "explica", "invertir", "inversion", "inversión", "renta", "rentabilidad",
)


@dataclass
class SearchFilters:
    reference_id: Optional[int] = None
    operation: Optional[str] = None
    property_type: Optional[str] = None
    max_price: Optional[float] = None
    currency: Optional[str] = None
    rooms_min: Optional[int] = None
    bathrooms_min: Optional[int] = None
    zone: Optional[str] = None
    amenities: list[str] = field(default_factory=list)
    amoblado: Optional[bool] = None
    acepta_mascotas: Optional[bool] = None
    parqueos_min: Optional[int] = None
    baulera: Optional[bool] = None
    complex_reasoning: bool = False

    def has_structured_filters(self) -> bool:
        return any([
            self.reference_id,
            self.operation,
            self.property_type,
            self.max_price is not None,
            self.rooms_min is not None,
            self.bathrooms_min is not None,
            self.zone,
            self.amenities,
            self.amoblado is not None,
            self.acepta_mascotas is not None,
            self.parqueos_min is not None,
            self.baulera is not None,
        ])


def normalize_text(value: object) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(char for char in text if not unicodedata.combining(char))
    text = re.sub(r"[^a-zA-Z0-9#.$, ]+", " ", text)
    return " ".join(text.lower().strip().split())


def normalize_query(value: str) -> str:
    return normalize_text(value)


def parse_number(raw: str) -> Optional[float]:
    cleaned = re.sub(r"[^0-9.,]", "", raw or "")
    if not cleaned:
        return None
    cleaned = cleaned.replace(".", "").replace(",", "")
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_currency(text: str) -> Optional[str]:
    if re.search(r"\b(bs|boliviano|bolivianos)\b", text):
        return "Bs"
    if "$" in text or re.search(r"\b(usd|dolar|dolares)\b", text):
        return "$ (USD)"
    return None


def parse_budget(text: str) -> tuple[Optional[float], Optional[str]]:
    currency = parse_currency(text)
    patterns = [
        r"(?:hasta|menos de|maximo|max|tope|presupuesto de|presupuesto)\s*(?:bs|usd|\$)?\s*([0-9][0-9., ]+)",
        r"(?:bs|usd|\$)\s*([0-9][0-9., ]+)",
        r"([0-9][0-9., ]+)\s*(?:bs|bolivianos|usd|dolares|dolar)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            value = parse_number(match.group(1))
            if value is not None:
                return value, currency
    return None, currency


def parse_search_filters(message: str) -> SearchFilters:
    text = normalize_query(message)
    filters = SearchFilters(complex_reasoning=any(term in text for term in COMPLEX_TERMS))

    ref = re.search(r"(?:#|id|ref|referencia|inmueble)\s*(\d+)", text)
    if ref:
        filters.reference_id = int(ref.group(1))

    if re.search(r"\b(alquiler|alquilar|renta|rentar)\b", text):
        filters.operation = "Alquiler"
    elif re.search(r"\b(venta|comprar|compra)\b", text):
        filters.operation = "Venta"
    elif re.search(r"\b(inversion|inversión)\b", text):
        filters.operation = "Inversion"

    for canonical, synonyms in TYPE_SYNONYMS.items():
        if any(term in text for term in synonyms):
            filters.property_type = canonical
            break

    filters.max_price, filters.currency = parse_budget(text)

    rooms = re.search(r"(\d+)\s*(?:dormitorio|dormitorios|habitacion|habitaciones|hab)\b", text)
    if rooms:
        filters.rooms_min = int(rooms.group(1))

    baths = re.search(r"(\d+)\s*(?:bano|banos|baño|baños)\b", text)
    if baths:
        filters.bathrooms_min = int(baths.group(1))

    for zone in KNOWN_ZONES:
        if zone in text:
            filters.zone = zone
            break

    for canonical, synonyms in AMENITY_SYNONYMS.items():
        if any(term in text for term in synonyms):
            filters.amenities.append(canonical)
    filters.amenities = list(dict.fromkeys(filters.amenities))

    if "amoblado" in filters.amenities:
        filters.amoblado = True
    if "mascotas" in filters.amenities:
        filters.acepta_mascotas = True
    if "parqueo" in filters.amenities:
        filters.parqueos_min = 1
    if "baulera" in filters.amenities:
        filters.baulera = True

    return filters


def normalize_amenities_text(amenities: object) -> str:
    if isinstance(amenities, list):
        raw = ",".join(str(item) for item in amenities)
    else:
        raw = str(amenities or "")
    values = [normalize_text(item) for item in raw.split(",")]
    return ",".join(item for item in values if item)


def build_property_search_text(inm: InmuebleDB) -> str:
    parts = [
        inm.titulo,
        inm.tipo_inmueble,
        inm.operacion,
        inm.ciudad,
        getattr(inm, "zona", None),
        getattr(inm, "direccion", None),
        f"{inm.habitaciones} dormitorios" if inm.habitaciones else None,
        f"{getattr(inm, 'banos', None)} banos" if getattr(inm, "banos", None) else None,
        f"{getattr(inm, 'superficie_m2', None)} m2" if getattr(inm, "superficie_m2", None) else None,
        "amoblado" if getattr(inm, "amoblado", False) else None,
        "mascotas" if getattr(inm, "acepta_mascotas", False) else None,
        "parqueo" if getattr(inm, "parqueos", 0) else None,
        "baulera" if getattr(inm, "baulera", False) else None,
        inm.amenidades,
    ]
    return normalize_text(" ".join(str(part) for part in parts if part))


def to_usd(price: float, currency: Optional[str]) -> float:
    if (currency or "").lower().startswith("bs"):
        return float(price or 0) / USD_TO_BS
    return float(price or 0)


def price_matches(price: float, currency: Optional[str], filters: SearchFilters) -> bool:
    if filters.max_price is None:
        return True
    if filters.currency == "Bs":
        offer_price = float(price or 0) * USD_TO_BS if not (currency or "").lower().startswith("bs") else float(price or 0)
    else:
        offer_price = to_usd(price, currency)
    return offer_price <= float(filters.max_price)


def offer_matches(inm: InmuebleDB, filters: SearchFilters) -> bool:
    offers = [offer for offer in inm.ofertas if (offer.estado or "Publicado") == "Publicado"]
    if not offers:
        offers = []

    if not offers:
        if filters.operation and normalize_text(filters.operation) not in normalize_text(inm.operacion):
            return False
        return price_matches(inm.precio_usd or 0, inm.moneda, filters)

    for offer in offers:
        if filters.operation and normalize_text(filters.operation) not in normalize_text(offer.operacion):
            continue
        if not price_matches(offer.precio, offer.moneda, filters):
            continue
        return True
    return False


def property_matches(inm: InmuebleDB, filters: SearchFilters) -> bool:
    if filters.reference_id and inm.id != filters.reference_id:
        return False
    if filters.property_type and filters.property_type != inm.tipo_inmueble:
        return False
    if filters.rooms_min is not None and (inm.habitaciones or 0) < filters.rooms_min:
        return False
    if filters.bathrooms_min is not None and (getattr(inm, "banos", 0) or 0) < filters.bathrooms_min:
        return False
    if filters.amoblado is True and not getattr(inm, "amoblado", False):
        return False
    if filters.acepta_mascotas is True and not getattr(inm, "acepta_mascotas", False):
        return False
    if filters.parqueos_min is not None and (getattr(inm, "parqueos", 0) or 0) < filters.parqueos_min:
        return False
    if filters.baulera is True and not getattr(inm, "baulera", False):
        return False

    haystack = build_property_search_text(inm)
    if filters.zone and filters.zone not in haystack:
        return False
    if any(amenity not in haystack for amenity in filters.amenities):
        return False
    return offer_matches(inm, filters)


def score_property(inm: InmuebleDB, filters: SearchFilters, query_tokens: Optional[set[str]] = None) -> float:
    score = 0.0
    haystack = build_property_search_text(inm)
    if filters.reference_id and inm.id == filters.reference_id:
        score += 1000
    if filters.operation and normalize_text(filters.operation) in haystack:
        score += 40
    if filters.property_type and normalize_text(filters.property_type) in haystack:
        score += 35
    if filters.zone and filters.zone in haystack:
        score += 30
    if filters.rooms_min is not None:
        score += min((inm.habitaciones or 0) - filters.rooms_min + 1, 3) * 5
    if filters.bathrooms_min is not None:
        score += min((getattr(inm, "banos", 0) or 0) - filters.bathrooms_min + 1, 3) * 4
    score += len([amenity for amenity in filters.amenities if amenity in haystack]) * 8
    if filters.max_price is not None:
        score += 20
    if query_tokens:
        score += len(query_tokens.intersection(set(haystack.split()))) * 3
    return score


def base_property_query(db: Session, candidate_ids: Optional[list[int]]):
    query = db.query(InmuebleDB).filter(InmuebleDB.estado == "Publicado")
    if candidate_ids:
        query = query.filter(InmuebleDB.id.in_(candidate_ids))
    return query


def apply_broad_sql_filters(query, filters: SearchFilters):
    if filters.reference_id:
        query = query.filter(InmuebleDB.id == filters.reference_id)
    if filters.property_type:
        query = query.filter(InmuebleDB.tipo_inmueble == filters.property_type)
    if filters.rooms_min is not None:
        query = query.filter(InmuebleDB.habitaciones >= filters.rooms_min)
    if filters.bathrooms_min is not None:
        query = query.filter(InmuebleDB.banos >= filters.bathrooms_min)
    if filters.amoblado is True:
        query = query.filter(InmuebleDB.amoblado == True)  # noqa: E712
    if filters.acepta_mascotas is True:
        query = query.filter(InmuebleDB.acepta_mascotas == True)  # noqa: E712
    if filters.parqueos_min is not None:
        query = query.filter(InmuebleDB.parqueos >= filters.parqueos_min)
    if filters.baulera is True:
        query = query.filter(InmuebleDB.baulera == True)  # noqa: E712
    if filters.zone:
        like = f"%{filters.zone}%"
        query = query.filter(or_(InmuebleDB.ciudad.ilike(like), InmuebleDB.zona.ilike(like), InmuebleDB.direccion.ilike(like)))
    return query


def semantic_tokens(message: str) -> set[str]:
    return {token for token in normalize_query(message).split() if len(token) > 2 and token not in STOPWORDS}


def run_sql_layer(db: Session, message: str, candidate_ids: Optional[list[int]], filters: SearchFilters) -> list[int]:
    query = apply_broad_sql_filters(base_property_query(db, candidate_ids), filters)
    candidates = query.all()
    matches = [inm for inm in candidates if property_matches(inm, filters)]
    tokens = semantic_tokens(message)
    matches.sort(key=lambda inm: score_property(inm, filters, tokens), reverse=True)
    return [inm.id for inm in matches[:MAX_RESULTS]]


def run_semantic_lite_layer(db: Session, message: str, candidate_ids: Optional[list[int]], filters: SearchFilters) -> list[int]:
    tokens = semantic_tokens(message)
    if not tokens:
        return []
    candidates = base_property_query(db, candidate_ids).all()
    scored = []
    for inm in candidates:
        haystack = set(build_property_search_text(inm).split())
        overlap = tokens.intersection(haystack)
        if overlap:
            scored.append((len(overlap) * 10 + score_property(inm, filters, tokens), inm.id))
    scored.sort(reverse=True)
    return [inm_id for _, inm_id in scored[:MAX_RESULTS]]


def compact_catalog_for_llm(db: Session, candidate_ids: Optional[list[int]]) -> str:
    candidates = base_property_query(db, candidate_ids).limit(25).all()
    rows = []
    for inm in candidates:
        offers = "; ".join(
            f"{offer.operacion} {offer.precio} {offer.moneda or '$ (USD)'}"
            for offer in inm.ofertas
            if (offer.estado or "Publicado") == "Publicado"
        )
        rows.append(
            f"ID:{inm.id} | {inm.tipo_inmueble} | {inm.ciudad} | {getattr(inm, 'zona', '') or ''} | "
            f"{inm.habitaciones} dorm | {getattr(inm, 'banos', 1) or 1} banos | {offers} | {getattr(inm, 'amenidades_normalizadas', '') or normalize_amenities_text(inm.amenidades)}"
        )
    return "\n".join(rows)


def call_llm_for_explanation(db: Session, message: str, ids: list[int], llm_client, llm_model: str) -> tuple[str, int, int]:
    if llm_client is None or not ids:
        return "", 0, 0
    catalog = compact_catalog_for_llm(db, ids[:10])
    if not catalog:
        return "", 0, 0
    prompt = f"""
Explica brevemente por que estos inmuebles fueron seleccionados para la busqueda del usuario.
No agregues propiedades nuevas, no cambies IDs y no inventes datos.
Maximo 3 frases, tono claro y comercial.

RESULTADOS SELECCIONADOS POR EL MOTOR:
{catalog}

BUSQUEDA: {message}
"""
    last_exc = None
    for attempt in range(3):
        try:
            response = llm_client.models.generate_content(model=llm_model, contents=prompt)
            usage = getattr(response, "usage_metadata", None)
            input_tokens = int(getattr(usage, "prompt_token_count", 0) or 0)
            output_tokens = int(getattr(usage, "candidates_token_count", 0) or 0)
            return (response.text or "").strip(), input_tokens, output_tokens
        except Exception as exc:
            last_exc = exc
            if attempt < 2:
                time.sleep(1 + attempt * 2)
    print(f"NIA LLM explanation failed: {last_exc}")
    return "", 0, 0

def call_llm_for_ids(db: Session, message: str, candidate_ids: Optional[list[int]], llm_client, llm_model: str) -> tuple[list[int], int, int]:
    if llm_client is None:
        return [], 0, 0
    catalog = compact_catalog_for_llm(db, candidate_ids)
    if not catalog:
        return [], 0, 0
    prompt = f"""
Devuelve solo JSON con IDs numericos que coincidan con la busqueda. No expliques.
Usa solo este catalogo resumido, no inventes propiedades.

CATALOGO:
{catalog}

BUSQUEDA: {message}

Respuesta esperada: [1, 2]
"""
    last_exc = None
    for attempt in range(3):
        try:
            response = llm_client.models.generate_content(model=llm_model, contents=prompt)
            text = (response.text or "").replace("```json", "").replace("```", "").strip()
            ids = json.loads(text)
            if not isinstance(ids, list):
                return [], 0, 0
            usage = getattr(response, "usage_metadata", None)
            input_tokens = int(getattr(usage, "prompt_token_count", 0) or 0)
            output_tokens = int(getattr(usage, "candidates_token_count", 0) or 0)
            return [int(item) for item in ids if str(item).isdigit()], input_tokens, output_tokens
        except Exception as exc:  # provider failures must not break basic search
            last_exc = exc
            if attempt < 2:
                time.sleep(1 + attempt * 2)
    print(f"NIA LLM fallback failed: {last_exc}")
    return [], 0, 0


def candidate_hash(candidate_ids: Optional[list[int]]) -> str:
    if not candidate_ids:
        return "all"
    raw = ",".join(str(item) for item in sorted(set(candidate_ids)))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def get_cached_result(db: Session, query_normalized: str, candidates_hash: str) -> Optional[dict]:
    try:
        row = (
            db.query(SearchCacheDB)
            .filter(SearchCacheDB.query_normalized == query_normalized)
            .filter(SearchCacheDB.candidate_ids_hash == candidates_hash)
            .filter(SearchCacheDB.expires_at > datetime.utcnow())
            .order_by(SearchCacheDB.created_at.desc())
            .first()
        )
        if not row:
            return None
        return {
            "ids": json.loads(row.result_ids or "[]"),
            "layer": row.layer,
            "filters": json.loads(row.filters_json or "{}"),
        }
    except SQLAlchemyError:
        db.rollback()
        return None


def save_cache(db: Session, query_normalized: str, candidates_hash: str, ids: list[int], layer: str, filters: dict, refined: bool) -> None:
    try:
        ttl = CACHE_TTL_REFINED_MINUTES if refined else CACHE_TTL_GENERAL_MINUTES
        db.add(SearchCacheDB(
            query_normalized=query_normalized,
            candidate_ids_hash=candidates_hash,
            result_ids=json.dumps(ids),
            layer=layer,
            filters_json=json.dumps(filters),
            expires_at=datetime.utcnow() + timedelta(minutes=ttl),
        ))
        db.flush()
    except SQLAlchemyError:
        db.rollback()


def log_search(db: Session, **kwargs) -> None:
    try:
        db.add(SearchLogDB(**kwargs))
        db.commit()
    except SQLAlchemyError:
        db.rollback()


def invalidate_search_cache(db: Session) -> None:
    try:
        db.query(SearchCacheDB).delete()
        db.flush()
    except SQLAlchemyError:
        db.rollback()


def efficient_property_search(
    db: Session,
    message: str,
    candidate_ids: Optional[list[int]],
    llm_client=None,
    llm_model: str = "",
) -> dict:
    started = time.perf_counter()
    query_normalized = normalize_query(message)
    candidates_hash = candidate_hash(candidate_ids)
    filters = parse_search_filters(message)
    filters_dict = asdict(filters)

    cached = get_cached_result(db, query_normalized, candidates_hash)
    if cached:
        latency_ms = int((time.perf_counter() - started) * 1000)
        log_search(
            db,
            query_text=message,
            query_normalized=query_normalized,
            filters_json=json.dumps(cached.get("filters") or {}),
            layer_used=cached.get("layer") or "CACHE",
            llm_used=False,
            embedding_used=False,
            cache_hit=True,
            result_count=len(cached.get("ids") or []),
            latency_ms=latency_ms,
            tokens_input=0,
            tokens_output=0,
            estimated_cost=0,
        )
        return {"ids": cached["ids"], "layer": cached["layer"], "filters": cached["filters"], "cache_hit": True, "latency_ms": latency_ms, "llm_used": False, "explanation": ""}

    layer = "A_SQL"
    llm_used = False
    embedding_used = False
    tokens_input = 0
    tokens_output = 0

    if filters.has_structured_filters():
        ids = run_sql_layer(db, message, candidate_ids, filters)
    else:
        ids = run_semantic_lite_layer(db, message, candidate_ids, filters)
        layer = "B_SEMANTIC_LITE"

    explanation = ""
    if filters.complex_reasoning and ids:
        explanation, tokens_input, tokens_output = call_llm_for_explanation(db, message, ids, llm_client, llm_model)
        if explanation:
            layer = "C_LLM_EXPLAIN"
            llm_used = True
    elif not ids and filters.complex_reasoning:
        ids, tokens_input, tokens_output = call_llm_for_ids(db, message, candidate_ids, llm_client, llm_model)
        if ids:
            layer = "C_LLM_MINIMAL"
            llm_used = True

    latency_ms = int((time.perf_counter() - started) * 1000)
    estimated_cost = estimate_llm_cost(tokens_input, tokens_output)
    save_cache(db, query_normalized, candidates_hash, ids, layer, filters_dict, refined=bool(candidate_ids))
    log_search(
        db,
        query_text=message,
        query_normalized=query_normalized,
        filters_json=json.dumps(filters_dict),
        layer_used=layer,
        llm_used=llm_used,
        embedding_used=embedding_used,
        cache_hit=False,
        result_count=len(ids),
        latency_ms=latency_ms,
        tokens_input=tokens_input,
        tokens_output=tokens_output,
        estimated_cost=estimated_cost,
    )

    return {"ids": ids, "layer": layer, "filters": filters_dict, "cache_hit": False, "latency_ms": latency_ms, "llm_used": llm_used, "explanation": explanation, "estimated_cost": estimated_cost}
