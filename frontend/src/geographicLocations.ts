export type ZoneLocation = {
  id: string;
  name: string;
  aliases: string[];
  lat: number;
  lng: number;
  zoom: number;
};

export type CityLocation = {
  id: string;
  name: string;
  fullName: string;
  aliases: string[];
  countryId: string;
  center: {
    lat: number;
    lng: number;
    zoom: number;
  };
  zones: ZoneLocation[];
};

export type CountryLocation = {
  id: string;
  name: string;
  code: string;
  cities: CityLocation[];
};

export const normalizeGeoText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const BOLIVIA_DEPARTMENTS = [
  "Santa Cruz",
  "Cochabamba",
  "La Paz",
  "Chuquisaca",
  "Tarija",
  "Oruro",
  "Potosí",
  "Beni",
  "Pando",
] as const;

export const GEOGRAPHIC_REGIONS: CountryLocation[] = [
  {
    id: "bo",
    name: "Bolivia",
    code: "BO",
    cities: [
      {
        id: "santa-cruz",
        name: "Santa Cruz",
        fullName: "Santa Cruz de la Sierra",
        aliases: ["santa cruz", "scz", "santa cruz de la sierra", "santacruz", "ichilo", "san carlos", "san carlos / ichilo", "montero", "warnes"],
        countryId: "bo",
        center: { lat: -17.7833, lng: -63.1821, zoom: 12.5 },
        zones: [
          { id: "equipetrol", name: "Equipetrol", aliases: ["equipetrol", "equipetrol norte"], lat: -17.766, lng: -63.195, zoom: 14 },
          { id: "norte", name: "Norte", aliases: ["zona norte", "norte", "banzer", "av banzer"], lat: -17.745, lng: -63.170, zoom: 13.5 },
          { id: "urubo", name: "Urubó", aliases: ["urubo", "el urubo"], lat: -17.760, lng: -63.220, zoom: 13.5 },
          { id: "centro", name: "Centro", aliases: ["centro", "casco viejo", "mercado los pozos", "los pozos"], lat: -17.783, lng: -63.182, zoom: 14 },
          { id: "las-palmas", name: "Las Palmas", aliases: ["las palmas"], lat: -17.805, lng: -63.200, zoom: 14 },
          { id: "sirari", name: "Sirari", aliases: ["sirari"], lat: -17.762, lng: -63.190, zoom: 14 },
          { id: "canal-isuto", name: "Canal Isuto", aliases: ["canal isuto", "radial 26"], lat: -17.760, lng: -63.185, zoom: 14 },
          { id: "sur", name: "Sur", aliases: ["zona sur", "sur", "santos dumont", "san aurelio", "av san aurelio"], lat: -17.820, lng: -63.185, zoom: 13.5 },
          { id: "san-carlos", name: "San Carlos", aliases: ["san carlos", "buen retiro", "ichilo", "san carlos / ichilo"], lat: -17.335, lng: -63.725, zoom: 13 },
        ],
      },
      {
        id: "cochabamba",
        name: "Cochabamba",
        fullName: "Cochabamba",
        aliases: ["cochabamba", "cbba", "cocha", "sacaba", "quillacollo"],
        countryId: "bo",
        center: { lat: -17.3895, lng: -66.1568, zoom: 12.8 },
        zones: [
          { id: "cbba-norte", name: "Zona Norte", aliases: ["zona norte", "norte", "tupuraya"], lat: -17.365, lng: -66.155, zoom: 14 },
          { id: "cala-cala", name: "Cala Cala", aliases: ["cala cala"], lat: -17.370, lng: -66.160, zoom: 14 },
          { id: "queru-queru", name: "Queru Queru", aliases: ["queru queru"], lat: -17.360, lng: -66.148, zoom: 14 },
          { id: "tiquipaya", name: "Tiquipaya", aliases: ["tiquipaya"], lat: -17.335, lng: -66.215, zoom: 13.5 },
          { id: "cbba-centro", name: "Centro", aliases: ["centro", "la cancha"], lat: -17.395, lng: -66.158, zoom: 14 },
          { id: "sarco", name: "Sarco", aliases: ["sarco", "sarco norte"], lat: -17.378, lng: -66.175, zoom: 14 },
        ],
      },
      {
        id: "la-paz",
        name: "La Paz",
        fullName: "Nuestra Señora de La Paz",
        aliases: ["la paz", "lpz", "el alto", "nuestra senora de la paz"],
        countryId: "bo",
        center: { lat: -16.5000, lng: -68.1500, zoom: 12.5 },
        zones: [
          { id: "zona-sur", name: "Zona Sur", aliases: ["zona sur"], lat: -16.540, lng: -68.085, zoom: 13.5 },
          { id: "calacoto", name: "Calacoto", aliases: ["calacoto"], lat: -16.538, lng: -68.088, zoom: 14 },
          { id: "san-miguel", name: "San Miguel", aliases: ["san miguel"], lat: -16.542, lng: -68.082, zoom: 14.5 },
          { id: "achumani", name: "Achumani", aliases: ["achumani"], lat: -16.535, lng: -68.065, zoom: 14 },
          { id: "sopocachi", name: "Sopocachi", aliases: ["sopocachi"], lat: -16.512, lng: -68.128, zoom: 14 },
          { id: "miraflores", name: "Miraflores", aliases: ["miraflores"], lat: -16.500, lng: -68.120, zoom: 14 },
          { id: "lpz-centro", name: "Centro", aliases: ["centro", "el prado"], lat: -16.495, lng: -68.133, zoom: 14 },
        ],
      },
      {
        id: "chuquisaca",
        name: "Chuquisaca",
        fullName: "Sucre, Chuquisaca",
        aliases: ["chuquisaca", "sucre"],
        countryId: "bo",
        center: { lat: -19.0431, lng: -65.2592, zoom: 13 },
        zones: [
          { id: "sucre-centro", name: "Centro Histórico", aliases: ["centro", "centro historico"], lat: -19.048, lng: -65.260, zoom: 14.5 },
          { id: "sucre-san-matias", name: "San Matías", aliases: ["san matias"], lat: -19.038, lng: -65.255, zoom: 14 },
          { id: "sucre-petrolero", name: "Barrio Petrolero", aliases: ["barrio petrolero", "petrolero"], lat: -19.032, lng: -65.250, zoom: 14 },
          { id: "sucre-zona-sur", name: "Zona Sur", aliases: ["zona sur", "sur"], lat: -19.060, lng: -65.265, zoom: 13.5 },
        ],
      },
      {
        id: "tarija",
        name: "Tarija",
        fullName: "San Bernardo de Tarija",
        aliases: ["tarija", "san bernardo de tarija", "bermejo", "yacuiba"],
        countryId: "bo",
        center: { lat: -21.5355, lng: -64.7296, zoom: 13 },
        zones: [
          { id: "tarija-centro", name: "Centro", aliases: ["centro", "casco viejo"], lat: -21.533, lng: -64.733, zoom: 14.5 },
          { id: "tarija-senac", name: "Senac", aliases: ["senac"], lat: -21.520, lng: -64.745, zoom: 14 },
          { id: "tarija-san-jeronimo", name: "San Jerónimo", aliases: ["san jeronimo"], lat: -21.545, lng: -64.720, zoom: 14 },
          { id: "tarija-miraflores", name: "Miraflores", aliases: ["miraflores"], lat: -21.528, lng: -64.725, zoom: 14 },
          { id: "tarija-tabladita", name: "Tabladita", aliases: ["tabladita"], lat: -21.550, lng: -64.740, zoom: 14 },
        ],
      },
      {
        id: "oruro",
        name: "Oruro",
        fullName: "Oruro",
        aliases: ["oruro"],
        countryId: "bo",
        center: { lat: -17.9667, lng: -67.1167, zoom: 13 },
        zones: [
          { id: "oruro-centro", name: "Centro", aliases: ["centro"], lat: -17.968, lng: -67.115, zoom: 14.5 },
          { id: "oruro-norte", name: "Zona Norte", aliases: ["zona norte", "norte"], lat: -17.950, lng: -67.110, zoom: 13.5 },
          { id: "oruro-sud", name: "Zona Sud", aliases: ["zona sud", "sud", "sur"], lat: -17.985, lng: -67.120, zoom: 13.5 },
        ],
      },
      {
        id: "potosi",
        name: "Potosí",
        fullName: "Villa Imperial de Potosí",
        aliases: ["potosi", "villa imperial de potosi", "uyuni"],
        countryId: "bo",
        center: { lat: -19.5836, lng: -65.7531, zoom: 13 },
        zones: [
          { id: "potosi-centro", name: "Centro Histórico", aliases: ["centro", "centro historico"], lat: -19.588, lng: -65.755, zoom: 14.5 },
          { id: "potosi-satelite", name: "Ciudad Satélite", aliases: ["ciudad satelite", "satelite"], lat: -19.575, lng: -65.765, zoom: 14 },
          { id: "potosi-san-roque", name: "San Roque", aliases: ["san Roque"], lat: -19.580, lng: -65.748, zoom: 14 },
        ],
      },
      {
        id: "beni",
        name: "Beni",
        fullName: "Trinidad, Beni",
        aliases: ["beni", "trinidad", "riberalta", "guayaramerin"],
        countryId: "bo",
        center: { lat: -14.8333, lng: -64.9000, zoom: 13 },
        zones: [
          { id: "beni-centro", name: "Centro", aliases: ["centro"], lat: -14.833, lng: -64.900, zoom: 14.5 },
          { id: "beni-pompeya", name: "Pompeya", aliases: ["pompeya"], lat: -14.825, lng: -64.895, zoom: 14 },
          { id: "beni-carmen", name: "El Carmen", aliases: ["el carmen"], lat: -14.840, lng: -64.908, zoom: 14 },
        ],
      },
      {
        id: "pando",
        name: "Pando",
        fullName: "Cobija, Pando",
        aliases: ["pando", "cobija"],
        countryId: "bo",
        center: { lat: -11.0267, lng: -68.7692, zoom: 13 },
        zones: [
          { id: "pando-centro", name: "Centro", aliases: ["centro"], lat: -11.028, lng: -68.768, zoom: 14.5 },
          { id: "pando-mapajo", name: "Mapajo", aliases: ["mapajo"], lat: -11.020, lng: -68.760, zoom: 14 },
          { id: "pando-cataratas", name: "Cataratas", aliases: ["cataratas"], lat: -11.035, lng: -68.775, zoom: 14 },
        ],
      },
    ],
  },
];

export const getCountries = (): CountryLocation[] => GEOGRAPHIC_REGIONS;

export const getCities = (countryCode = "BO"): CityLocation[] => {
  const norm = countryCode.trim().toUpperCase();
  const country = GEOGRAPHIC_REGIONS.find((c) => c.code === norm || c.id.toUpperCase() === norm);
  return country ? country.cities : GEOGRAPHIC_REGIONS[0].cities;
};

export const getCity = (cityNameOrAlias: string): CityLocation | undefined => {
  const queryNorm = normalizeGeoText(cityNameOrAlias);
  if (!queryNorm) return undefined;
  for (const country of GEOGRAPHIC_REGIONS) {
    // 1. Coincidencia exacta por nombre, nombre completo o alias
    for (const city of country.cities) {
      if (normalizeGeoText(city.name) === queryNorm || normalizeGeoText(city.fullName) === queryNorm) {
        return city;
      }
      if (city.aliases.some((alias) => normalizeGeoText(alias) === queryNorm)) {
        return city;
      }
    }
    // 2. Coincidencia por prefijo (ej. "co" -> Cochabamba, "santa" -> Santa Cruz, "sucre" -> Chuquisaca)
    for (const city of country.cities) {
      if (normalizeGeoText(city.name).startsWith(queryNorm)) {
        return city;
      }
      if (city.aliases.some((alias) => normalizeGeoText(alias).startsWith(queryNorm))) {
        return city;
      }
    }
    // 3. Coincidencia parcial (subcadena)
    for (const city of country.cities) {
      if (normalizeGeoText(city.name).includes(queryNorm)) {
        return city;
      }
      if (city.aliases.some((alias) => normalizeGeoText(alias).includes(queryNorm))) {
        return city;
      }
    }
  }
  return undefined;
};

export const getZonesForCity = (cityNameOrAlias: string): ZoneLocation[] => {
  const city = getCity(cityNameOrAlias);
  return city ? city.zones : [];
};

export const getZoneNamesForCity = (cityNameOrAlias: string): string[] => {
  return getZonesForCity(cityNameOrAlias).map((z) => z.name);
};

export const resolveLocationCenter = (
  cityName?: string,
  zoneName?: string
): { lat: number; lng: number; zoom: number } | null => {
  if (!cityName && !zoneName) return null;

  if (cityName) {
    const city = getCity(cityName);
    if (city) {
      if (zoneName) {
        const normZone = normalizeGeoText(zoneName);
        const zone = city.zones.find(
          (z) => normalizeGeoText(z.name) === normZone || z.aliases.some((a) => normalizeGeoText(a) === normZone)
        );
        if (zone) {
          return { lat: zone.lat, lng: zone.lng, zoom: zone.zoom };
        }
      }
      return { lat: city.center.lat, lng: city.center.lng, zoom: city.center.zoom };
    }
  }

  if (zoneName) {
    const normZone = normalizeGeoText(zoneName);
    for (const country of GEOGRAPHIC_REGIONS) {
      for (const city of country.cities) {
        const zone = city.zones.find(
          (z) => normalizeGeoText(z.name) === normZone || z.aliases.some((a) => normalizeGeoText(a) === normZone)
        );
        if (zone) {
          return { lat: zone.lat, lng: zone.lng, zoom: zone.zoom };
        }
      }
    }
  }

  return null;
};
