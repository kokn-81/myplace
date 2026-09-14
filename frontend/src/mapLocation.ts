export type MapFocusTarget = {
  longitude: number;
  latitude: number;
  zoom?: number;
  key?: number;
  label?: string;
  source?: "user" | "search";
};

export type MapLocationChoice = MapFocusTarget & {
  id: string;
  name: string;
};

export type MapLocationResolution = {
  focus?: MapFocusTarget | null;
  choices?: MapLocationChoice[];
  requestedLocation?: string;
};

const LOCATION_STOP_WORDS = new Set([
  "alquiler",
  "alquilar",
  "renta",
  "rentar",
  "venta",
  "vender",
  "comprar",
  "compra",
  "menos",
  "mas",
  "hasta",
  "entre",
  "con",
  "sin",
  "zona",
  "inmueble",
  "depa",
  "departamento",
  "casa",
  "vivir",
  "invertir",
]);

const BUDGET_SPLIT_PATTERN =
  /\s+(?:con|hasta|por menos|por m[aá]s|menos de|m[aá]s de|entre|menor a|mayor a|que tenga|y que|para|aprox)\s+/i;

export const SANTA_CRUZ_BO: MapLocationChoice = {
  id: "santa-cruz-bo",
  name: "Santa Cruz de la Sierra, Bolivia",
  longitude: -63.1812,
  latitude: -17.7833,
  zoom: 12.2,
  source: "search",
};

const BOLIVIA_BBOX = {
  minLng: -69.8,
  maxLng: -57.3,
  minLat: -23.1,
  maxLat: -9.6,
};

const SANTA_CRUZ_METRO = {
  minLng: -63.36,
  maxLng: -63.04,
  minLat: -17.92,
  maxLat: -17.64,
};

export const LOCAL_ZONE_FOCUS: Record<string, MapFocusTarget> = {
  equipetrol: { longitude: -63.1951, latitude: -17.7655, zoom: 14.2, source: "search" },
  urubo: { longitude: -63.365, latitude: -17.76, zoom: 13.2, source: "search" },
  centro: { longitude: -63.1812, latitude: -17.7833, zoom: 13.6, source: "search" },
  "el centro": { longitude: -63.1812, latitude: -17.7833, zoom: 13.6, source: "search" },
  "zona centro": { longitude: -63.1812, latitude: -17.7833, zoom: 13.6, source: "search" },
  norte: { longitude: -63.1698, latitude: -17.7563, zoom: 13.4, source: "search" },
  sur: { longitude: -63.1812, latitude: -17.81, zoom: 13.2, source: "search" },
  este: { longitude: -63.14, latitude: -17.78, zoom: 13.2, source: "search" },
  oeste: { longitude: -63.22, latitude: -17.78, zoom: 13.2, source: "search" },
  sirari: { longitude: -63.198, latitude: -17.768, zoom: 14, source: "search" },
  "las palmas": { longitude: -63.21, latitude: -17.76, zoom: 13.6, source: "search" },
};

export const LOCAL_ZONE_TERMS = new Set(Object.keys(LOCAL_ZONE_FOCUS));

export const KNOWN_CITY_CHOICES: MapLocationChoice[] = [
  SANTA_CRUZ_BO,
  {
    id: "santa-cruz-tf",
    name: "Santa Cruz de Tenerife, Espana",
    longitude: -16.2518,
    latitude: 28.4636,
    zoom: 12.2,
    source: "search",
  },
  {
    id: "cochabamba-bo",
    name: "Cochabamba, Bolivia",
    longitude: -66.1568,
    latitude: -17.3895,
    zoom: 12.2,
    source: "search",
  },
  {
    id: "la-paz-bo",
    name: "La Paz, Bolivia",
    longitude: -68.1193,
    latitude: -16.4897,
    zoom: 12.2,
    source: "search",
  },
  {
    id: "medellin-co",
    name: "Medellin, Colombia",
    longitude: -75.5812,
    latitude: 6.2442,
    zoom: 12.2,
    source: "search",
  },
];

export const normalizePlainText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export type MarkerTone = "muted" | "match" | "active" | "selected";

export const getMarkerTone = (
  id: string,
  highlightedIds: string[],
  matchedIds: string[] | null,
  selectedId?: string | null,
): MarkerTone => {
  if (selectedId && id === selectedId) return "selected";
  if (highlightedIds.includes(id)) return "active";
  if (matchedIds !== null && matchedIds.includes(id)) return "match";
  return "muted";
};

export const isInBolivia = (longitude: number, latitude: number) =>
  longitude >= BOLIVIA_BBOX.minLng &&
  longitude <= BOLIVIA_BBOX.maxLng &&
  latitude >= BOLIVIA_BBOX.minLat &&
  latitude <= BOLIVIA_BBOX.maxLat;

const isInSantaCruzMetro = (longitude: number, latitude: number) =>
  longitude >= SANTA_CRUZ_METRO.minLng &&
  longitude <= SANTA_CRUZ_METRO.maxLng &&
  latitude >= SANTA_CRUZ_METRO.minLat &&
  latitude <= SANTA_CRUZ_METRO.maxLat;

export const normalizeLocationCandidate = (value: string) => {
  const cleaned = value
    .replace(/[?!.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned
    .split(BUDGET_SPLIT_PATTERN)[0]
    .replace(/\s+\d[\d.,]*\s*(?:bs|usd|\$|bolivianos|dolares)?\s*$/i, "")
    .replace(/\s+\$\s*\d[\d.,]*\s*$/i, "")
    .replace(/[,:;]+$/g, "")
    .replace(/^(?:el|la|los|las)\s+/i, "")
    .replace(/[,:;]+$/g, "")
    .trim();
};

export const extractRequestedLocation = (query: string) => {
  const normalized = query.replace(/\s+/g, " ").trim();
  const matches = [...normalized.matchAll(/\ben\s+([^?!.]+)/gi)];
  if (matches.length === 0) return "";

  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const candidate = normalizeLocationCandidate(matches[i][1] || "");
    const firstWord = candidate.toLowerCase().split(/\s+/)[0];
    if (
      candidate.length >= 3 &&
      !LOCATION_STOP_WORDS.has(firstWord) &&
      !/^\d/.test(firstWord)
    ) {
      return candidate;
    }
  }

  return "";
};

export const findKnownCityChoices = (location: string): MapLocationChoice[] => {
  const normalized = normalizePlainText(location);
  if (normalized.length < 2) return [];

  return KNOWN_CITY_CHOICES.filter((choice) => {
    const normalizedName = normalizePlainText(choice.name);
    const normalizedCity = normalizePlainText(choice.name.split(",")[0] || choice.name);
    return normalizedName.includes(normalized) || normalizedCity.includes(normalized);
  });
};

export const getKnownLocationChoices = (location: string): MapLocationChoice[] => {
  const normalized = normalizePlainText(location);
  if (normalized === "santa cruz") return findKnownCityChoices(location);

  const matches = findKnownCityChoices(location);
  return matches.length === 1 ? matches : [];
};

export const getDefaultSantaCruzChoice = () => SANTA_CRUZ_BO;

export const findKnownCityInQueries = (queries: string[]): MapLocationChoice | null => {
  for (let i = queries.length - 1; i >= 0; i -= 1) {
    const location = extractRequestedLocation(queries[i] || "");
    if (!location) continue;
    const normalized = normalizePlainText(location);
    if (normalized === "santa cruz") return getDefaultSantaCruzChoice();
    const matches = getKnownLocationChoices(location);
    if (matches.length === 1) return matches[0];
  }
  return null;
};

const withFocusMeta = (focus: MapFocusTarget, label: string): MapFocusTarget => ({
  ...focus,
  label,
  key: Date.now(),
  source: "search",
});

export const resolveLocalMapFocus = (
  location: string,
  contextQueries: string[] = [],
): MapLocationResolution | null => {
  if (!location) return null;
  const normalizedLocation = normalizePlainText(location);
  const zoneFocus = LOCAL_ZONE_FOCUS[normalizedLocation];
  if (zoneFocus) {
    const contextualCity = findKnownCityInQueries(contextQueries) || getDefaultSantaCruzChoice();
    return {
      focus: withFocusMeta(zoneFocus, `${location}, ${contextualCity.name}`),
      requestedLocation: location,
    };
  }

  const knownChoices = getKnownLocationChoices(location);
  if (knownChoices.length > 1) {
    return { choices: knownChoices, requestedLocation: location };
  }
  if (knownChoices.length === 1) {
    const choice = knownChoices[0];
    return {
      focus: withFocusMeta(choice, choice.name),
      requestedLocation: location,
    };
  }

  return { requestedLocation: location };
};

export const focusFromProperties = (
  properties: Array<{ lat?: number | null; lng?: number | null; area?: string | null }>,
  locationLabel = "",
): MapFocusTarget | null => {
  const points = properties.filter(
    (property) =>
      Number.isFinite(property.lat) &&
      Number.isFinite(property.lng) &&
      isInBolivia(Number(property.lng), Number(property.lat)),
  );
  if (points.length === 0) return null;

  const santaCruzPoints = points.filter((property) =>
    isInSantaCruzMetro(Number(property.lng), Number(property.lat)),
  );
  const use = santaCruzPoints.length >= Math.max(1, Math.ceil(points.length / 2)) ? santaCruzPoints : points;
  const longitude = use.reduce((sum, property) => sum + Number(property.lng), 0) / use.length;
  const latitude = use.reduce((sum, property) => sum + Number(property.lat), 0) / use.length;

  return withFocusMeta(
    {
      longitude,
      latitude,
      zoom: use.length === 1 ? 14.6 : 13.4,
      source: "search",
    },
    locationLabel,
  );
};

export const geocodeRequestedLocation = async (
  query: string,
  contextQueries: string[] = [],
  mapboxToken = "",
): Promise<MapLocationResolution | null> => {
  const location = extractRequestedLocation(query);
  if (!location) return null;

  const local = resolveLocalMapFocus(location, contextQueries);
  if (local?.focus || (local?.choices && local.choices.length > 1)) return local;
  if (!mapboxToken) return local;

  const proximity = `${SANTA_CRUZ_BO.longitude},${SANTA_CRUZ_BO.latitude}`;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${encodeURIComponent(mapboxToken)}&limit=5&language=es&country=BO&proximity=${encodeURIComponent(proximity)}`;
  const res = await fetch(url);
  if (!res.ok) return local;

  const data = await res.json();
  const feature = (data?.features || []).find((item: { center?: number[] }) => {
    const center = item?.center;
    return Array.isArray(center) && center.length >= 2 && isInBolivia(Number(center[0]), Number(center[1]));
  });
  const center = feature?.center;
  if (!Array.isArray(center) || center.length < 2) return local;

  return {
    focus: withFocusMeta(
      {
        longitude: Number(center[0]),
        latitude: Number(center[1]),
        zoom: 11.8,
        source: "search",
      },
      feature.place_name || location,
    ),
    requestedLocation: location,
  };
};
