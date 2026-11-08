/* Generated baseline and live sync for GARDEN ZEN.
 * Google Sheet Live URL: https://docs.google.com/spreadsheets/d/131d0GDjOhvHerSya1izI1CS6qIBkBV6a/export?format=csv&gid=1727984128
 * Last synchronized: 2026-11-04
 */

export interface GardenZenUnit {
  projectId: string;
  floor: number;
  floorLabel: string;
  unitNumber: string;
  modelo: string;
  rooms: number;
  roomsLabel: string;
  areaM2: number;
  status: "disponible" | "vendido" | "reservado";
  cashTotal: number;
  initial70Total: number;
  initial30Total: number;
  cashPerM2: number;
  initial70PerM2: number;
  initial30PerM2: number;
  cuotaInicial30: number;
  cuotaInicial70: number;
  planoUrl: string;
}

export interface GardenZenParking {
  code: string;
  floor: string;
  price: number;
  areaM2: number;
  kind: "techado" | "exterior" | "moto" | "baulera";
  status: "disponible" | "vendido" | "bloqueado";
  comment?: string;
}

export const GARDEN_ZEN_CONFIG = {
  id: "garden-zen",
  name: "Garden Zen",
  builder: "Garden Buildings",
  builderUrl: "https://gardenbuildings.com.bo/",
  zone: "Equipetrol Norte",
  address: "Calle Dra. María de Oliveira, Equipetrol Norte (Barrio Brígida)",
  city: "Santa Cruz de la Sierra",
  delivery: "Marzo 2027",
  constructionStatus: "En etapa de obra fina",
  totalUnits: 61,
  floorsCount: 16,
  reservaUsd: 5000,
  minPriceUsd: 59600,
  driveUrl: "https://drive.google.com/drive/folders/15ckBWfu8u0HOc4RR-VjhJsrD37G2a8ig",
  mapsUrl: "https://maps.app.goo.gl/zfLxQ9cxuLfJZuQ67?g_st=ic",
  sheetUrl: "https://docs.google.com/spreadsheets/d/131d0GDjOhvHerSya1izI1CS6qIBkBV6a/edit?usp=sharing",
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/131d0GDjOhvHerSya1izI1CS6qIBkBV6a/export?format=csv&gid=1727984128",
  parkingsCsvUrl: "https://docs.google.com/spreadsheets/d/131d0GDjOhvHerSya1izI1CS6qIBkBV6a/export?format=csv&gid=2088384023",
  brochurePdfUrl: "/garden_zen/presentacion_garden_zen.pdf",
  amenities: [
    "Piscina Izumi sinfín con deck panorámico (Piso 17)",
    "Doble sauna: Sauna Seco Ki & Sauna Vapor Mizu",
    "Gimnasio Tecnológico Kinō",
    "Espacio Co-Work Nōka climatizado",
    "Salón Haku de uso múltiple",
    "Doble churrasquera gourmet Ensō & Kōen",
    "Área de Calistenia & Pet Spa",
    "Lobby Zen con ingreso inteligente automatizado",
    "Paneles solares ON-GRID (60% menos energía comunal)",
    "Cosecha y reutilización de agua pluvial (30% ahorro)",
    "Reducción del 50% en expensas de por vida"
  ]
};

export const GARDEN_ZEN_PARKINGS: GardenZenParking[] = [
  {
    "code": "PB01",
    "floor": "Planta Baja",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "exterior",
    "status": "disponible"
  },
  {
    "code": "PB02",
    "floor": "Planta Baja",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "exterior",
    "status": "disponible"
  },
  {
    "code": "PB03",
    "floor": "Planta Baja",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "exterior",
    "status": "disponible",
    "comment": "Lo compra el local 2 en Enero."
  },
  {
    "code": "PB05",
    "floor": "Planta Baja",
    "price": 16000,
    "areaM2": 18.07,
    "kind": "exterior",
    "status": "disponible"
  },
  {
    "code": "PB10",
    "floor": "Planta Baja",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "exterior",
    "status": "disponible"
  },
  {
    "code": "P01",
    "floor": "Subsuelo",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "techado",
    "status": "disponible"
  },
  {
    "code": "P02",
    "floor": "Subsuelo",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "techado",
    "status": "disponible"
  },
  {
    "code": "P03",
    "floor": "Subsuelo",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "techado",
    "status": "disponible"
  },
  {
    "code": "P04",
    "floor": "Subsuelo",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "techado",
    "status": "disponible"
  },
  {
    "code": "P05",
    "floor": "Subsuelo",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "techado",
    "status": "disponible"
  },
  {
    "code": "P14",
    "floor": "Subsuelo",
    "price": 13000,
    "areaM2": 14,
    "kind": "techado",
    "status": "disponible"
  },
  {
    "code": "P15",
    "floor": "Subsuelo",
    "price": 13000,
    "areaM2": 14,
    "kind": "techado",
    "status": "disponible"
  },
  {
    "code": "P17",
    "floor": "Subsuelo",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "techado",
    "status": "disponible"
  },
  {
    "code": "P19",
    "floor": "Subsuelo",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "techado",
    "status": "disponible"
  },
  {
    "code": "P20",
    "floor": "Subsuelo",
    "price": 12000,
    "areaM2": 12.5,
    "kind": "techado",
    "status": "disponible"
  },
  {
    "code": "PM01",
    "floor": "Subsuelo",
    "price": 7500,
    "areaM2": 3.75,
    "kind": "moto",
    "status": "disponible"
  },
  {
    "code": "PM02",
    "floor": "Subsuelo",
    "price": 7500,
    "areaM2": 3.75,
    "kind": "moto",
    "status": "disponible"
  },
  {
    "code": "P25",
    "floor": "Piso 1",
    "price": 12000,
    "areaM2": 12,
    "kind": "techado",
    "status": "disponible",
    "comment": "Parqueo P25 + Baulera 03"
  },
  {
    "code": "B03",
    "floor": "Piso 1",
    "price": 3700,
    "areaM2": 7.22,
    "kind": "baulera",
    "status": "disponible"
  },
  {
    "code": "PM03",
    "floor": "Piso 1",
    "price": 7500,
    "areaM2": 3.75,
    "kind": "moto",
    "status": "disponible"
  },
  {
    "code": "PM04",
    "floor": "Piso 1",
    "price": 7500,
    "areaM2": 3.75,
    "kind": "moto",
    "status": "disponible"
  },
  {
    "code": "PM05",
    "floor": "Piso 1",
    "price": 7500,
    "areaM2": 3.75,
    "kind": "moto",
    "status": "disponible"
  },
  {
    "code": "PM06",
    "floor": "Piso 1",
    "price": 7500,
    "areaM2": 3.75,
    "kind": "moto",
    "status": "disponible"
  }
];

export function formatGardenZenUsd(val: number): string {
  return Math.round(val).toLocaleString("es-BO");
}

export const PLANO_MODELO_MAP: Record<string, string> = {
  MP: "/garden_zen/plano_mono_mp.jpg",
  M1: "/garden_zen/plano_mono_m1.jpg",
  ML: "/garden_zen/plano_mono_ml.jpg",
  B1: "/garden_zen/plano_1dorm_b1.jpg",
  I1: "/garden_zen/plano_1dorm_i1.jpg",
  D2: "/garden_zen/plano_2dorm_d2.jpg",
  E2: "/garden_zen/plano_2dorm_e2.jpg",
  B3: "/garden_zen/plano_3dorm_b3.jpg",
};

export const GARDEN_ZEN_BASELINE_UNITS: GardenZenUnit[] = [
  {
    "projectId": "garden-zen",
    "floor": 2,
    "floorLabel": "Piso 2",
    "unitNumber": "205",
    "modelo": "MP",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 52.58,
    "status": "disponible",
    "cashTotal": 91600,
    "initial70Total": 93600,
    "initial30Total": 95700,
    "cashPerM2": 1742,
    "initial70PerM2": 1780,
    "initial30PerM2": 1820,
    "cuotaInicial30": 28710,
    "cuotaInicial70": 65520,
    "planoUrl": "/garden_zen/plano_mono_mp.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 2,
    "floorLabel": "Piso 2",
    "unitNumber": "201",
    "modelo": "B3",
    "rooms": 3,
    "roomsLabel": "3 Dormitorios",
    "areaM2": 133.49,
    "status": "disponible",
    "cashTotal": 180303,
    "initial70Total": 185174,
    "initial30Total": 194916,
    "cashPerM2": 1351,
    "initial70PerM2": 1387,
    "initial30PerM2": 1460,
    "cuotaInicial30": 58475,
    "cuotaInicial70": 129622,
    "planoUrl": "/garden_zen/plano_3dorm_b3.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 2,
    "floorLabel": "Piso 2",
    "unitNumber": "203",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 58.95,
    "status": "vendido",
    "cashTotal": 75345,
    "initial70Total": 78036,
    "initial30Total": 80727,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 24218,
    "cuotaInicial70": 54625,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 2,
    "floorLabel": "Piso 2",
    "unitNumber": "204",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 58.57,
    "status": "vendido",
    "cashTotal": 83462,
    "initial70Total": 84927,
    "initial30Total": 87855,
    "cashPerM2": 1425,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 26357,
    "cuotaInicial70": 59449,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 2,
    "floorLabel": "Piso 2",
    "unitNumber": "206",
    "modelo": "E2",
    "rooms": 2,
    "roomsLabel": "2 Dormitorios",
    "areaM2": 107.61,
    "status": "vendido",
    "cashTotal": 144460,
    "initial70Total": 149620,
    "initial30Total": 154779,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 46434,
    "cuotaInicial70": 104734,
    "planoUrl": "/garden_zen/plano_2dorm_e2.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 2,
    "floorLabel": "Piso 2",
    "unitNumber": "207",
    "modelo": "I1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 69.96,
    "status": "vendido",
    "cashTotal": 90244,
    "initial70Total": 93467,
    "initial30Total": 96690,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 29007,
    "cuotaInicial70": 65427,
    "planoUrl": "/garden_zen/plano_1dorm_i1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 3,
    "floorLabel": "Piso 3",
    "unitNumber": "301",
    "modelo": "B3",
    "rooms": 3,
    "roomsLabel": "3 Dormitorios",
    "areaM2": 106.12,
    "status": "disponible",
    "cashTotal": 156162,
    "initial70Total": 160460,
    "initial30Total": 168770,
    "cashPerM2": 1472,
    "initial70PerM2": 1512,
    "initial30PerM2": 1590,
    "cuotaInicial30": 50631,
    "cuotaInicial70": 112322,
    "planoUrl": "/garden_zen/plano_3dorm_b3.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 3,
    "floorLabel": "Piso 3",
    "unitNumber": "303",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.12,
    "status": "vendido",
    "cashTotal": 64568,
    "initial70Total": 66874,
    "initial30Total": 69180,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20754,
    "cuotaInicial70": 46812,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1006",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.48,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1591,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1106",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.48,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1591,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1306",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.48,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1591,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1506",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.48,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1591,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 3,
    "floorLabel": "Piso 3",
    "unitNumber": "304",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.1,
    "status": "vendido",
    "cashTotal": 64540,
    "initial70Total": 66845,
    "initial30Total": 69150,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20745,
    "cuotaInicial70": 46792,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 3,
    "floorLabel": "Piso 3",
    "unitNumber": "305",
    "modelo": "MP",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.15,
    "status": "vendido",
    "cashTotal": 56210,
    "initial70Total": 58218,
    "initial30Total": 60225,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 18068,
    "cuotaInicial70": 40753,
    "planoUrl": "/garden_zen/plano_mono_mp.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 3,
    "floorLabel": "Piso 3",
    "unitNumber": "306",
    "modelo": "E2",
    "rooms": 2,
    "roomsLabel": "2 Dormitorios",
    "areaM2": 107.61,
    "status": "disponible",
    "cashTotal": 152437,
    "initial70Total": 156521,
    "initial30Total": 164758,
    "cashPerM2": 1417,
    "initial70PerM2": 1455,
    "initial30PerM2": 1531,
    "cuotaInicial30": 49427,
    "cuotaInicial70": 109565,
    "planoUrl": "/garden_zen/plano_2dorm_e2.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 3,
    "floorLabel": "Piso 3",
    "unitNumber": "307",
    "modelo": "I1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 56.21,
    "status": "disponible",
    "cashTotal": 82737,
    "initial70Total": 84958,
    "initial30Total": 89399,
    "cashPerM2": 1472,
    "initial70PerM2": 1511,
    "initial30PerM2": 1590,
    "cuotaInicial30": 26820,
    "cuotaInicial70": 59471,
    "planoUrl": "/garden_zen/plano_1dorm_i1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "403",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.12,
    "status": "vendido",
    "cashTotal": 64568,
    "initial70Total": 66874,
    "initial30Total": 69180,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20754,
    "cuotaInicial70": 46812,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1007",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.49,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1590,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1107",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.49,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1590,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 12,
    "floorLabel": "Piso 12",
    "unitNumber": "1207",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.49,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1590,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1307",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.49,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1590,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "602",
    "modelo": "ML",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 37.84,
    "status": "vendido",
    "cashTotal": 57193,
    "initial70Total": 54868,
    "initial30Total": 56760,
    "cashPerM2": 1511,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 17028,
    "cuotaInicial70": 38408,
    "planoUrl": "/garden_zen/plano_mono_ml.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "702",
    "modelo": "ML",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 37.84,
    "status": "vendido",
    "cashTotal": 57193,
    "initial70Total": 54868,
    "initial30Total": 56760,
    "cashPerM2": 1511,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 17028,
    "cuotaInicial70": 38408,
    "planoUrl": "/garden_zen/plano_mono_ml.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "406",
    "modelo": "E2",
    "rooms": 2,
    "roomsLabel": "2 Dormitorios",
    "areaM2": 107.61,
    "status": "disponible",
    "cashTotal": 152437,
    "initial70Total": 156521,
    "initial30Total": 164758,
    "cashPerM2": 1417,
    "initial70PerM2": 1455,
    "initial30PerM2": 1531,
    "cuotaInicial30": 49427,
    "cuotaInicial70": 109565,
    "planoUrl": "/garden_zen/plano_2dorm_e2.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "407",
    "modelo": "I1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 56.21,
    "status": "disponible",
    "cashTotal": 82737,
    "initial70Total": 84958,
    "initial30Total": 89399,
    "cashPerM2": 1472,
    "initial70PerM2": 1511,
    "initial30PerM2": 1590,
    "cuotaInicial30": 26820,
    "cuotaInicial70": 59471,
    "planoUrl": "/garden_zen/plano_1dorm_i1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "501",
    "modelo": "B2",
    "rooms": 2,
    "roomsLabel": "2 Dormitorios",
    "areaM2": 83.34,
    "status": "vendido",
    "cashTotal": 115388,
    "initial70Total": 119509,
    "initial30Total": 123630,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 37089,
    "cuotaInicial70": 83656,
    "planoUrl": "/garden_zen/fachada.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "503",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.98,
    "status": "vendido",
    "cashTotal": 65772,
    "initial70Total": 68121,
    "initial30Total": 70470,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 21141,
    "cuotaInicial70": 47685,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "504",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.12,
    "status": "vendido",
    "cashTotal": 64568,
    "initial70Total": 66874,
    "initial30Total": 69180,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20754,
    "cuotaInicial70": 46812,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "505",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.1,
    "status": "vendido",
    "cashTotal": 64540,
    "initial70Total": 66845,
    "initial30Total": 69150,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20745,
    "cuotaInicial70": 46792,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "506",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.48,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1591,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "507",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.49,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1590,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "601",
    "modelo": "B2",
    "rooms": 2,
    "roomsLabel": "2 Dormitorios",
    "areaM2": 83.34,
    "status": "disponible",
    "cashTotal": 121778,
    "initial70Total": 124643,
    "initial30Total": 131090,
    "cashPerM2": 1461,
    "initial70PerM2": 1496,
    "initial30PerM2": 1573,
    "cuotaInicial30": 39327,
    "cuotaInicial70": 87250,
    "planoUrl": "/garden_zen/fachada.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1003",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.98,
    "status": "vendido",
    "cashTotal": 73553,
    "initial70Total": 68121,
    "initial30Total": 70470,
    "cashPerM2": 1566,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 21141,
    "cuotaInicial70": 47685,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1103",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.98,
    "status": "vendido",
    "cashTotal": 69127,
    "initial70Total": 70989,
    "initial30Total": 74714,
    "cashPerM2": 1471,
    "initial70PerM2": 1511,
    "initial30PerM2": 1590,
    "cuotaInicial30": 22414,
    "cuotaInicial70": 49692,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 12,
    "floorLabel": "Piso 12",
    "unitNumber": "1203",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.98,
    "status": "vendido",
    "cashTotal": 73553,
    "initial70Total": 68121,
    "initial30Total": 70470,
    "cashPerM2": 1566,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 21141,
    "cuotaInicial70": 47685,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1303",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.98,
    "status": "vendido",
    "cashTotal": 73553,
    "initial70Total": 68121,
    "initial30Total": 70470,
    "cashPerM2": 1566,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 21141,
    "cuotaInicial70": 47685,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "603",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.98,
    "status": "vendido",
    "cashTotal": 65772,
    "initial70Total": 68121,
    "initial30Total": 70470,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 21141,
    "cuotaInicial70": 47685,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "604",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.12,
    "status": "vendido",
    "cashTotal": 64568,
    "initial70Total": 66874,
    "initial30Total": 69180,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20754,
    "cuotaInicial70": 46812,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "605",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.1,
    "status": "vendido",
    "cashTotal": 64540,
    "initial70Total": 66845,
    "initial30Total": 69150,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20745,
    "cuotaInicial70": 46792,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "606",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.48,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1591,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "607",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.49,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1590,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "701",
    "modelo": "B2",
    "rooms": 2,
    "roomsLabel": "2 Dormitorios",
    "areaM2": 83.34,
    "status": "disponible",
    "cashTotal": 121778,
    "initial70Total": 124643,
    "initial30Total": 131090,
    "cashPerM2": 1461,
    "initial70PerM2": 1496,
    "initial30PerM2": 1573,
    "cuotaInicial30": 39327,
    "cuotaInicial70": 87250,
    "planoUrl": "/garden_zen/fachada.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "703",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.98,
    "status": "vendido",
    "cashTotal": 65772,
    "initial70Total": 68121,
    "initial30Total": 70470,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 21141,
    "cuotaInicial70": 47685,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "704",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.12,
    "status": "vendido",
    "cashTotal": 64568,
    "initial70Total": 66874,
    "initial30Total": 69180,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20754,
    "cuotaInicial70": 46812,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "705",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.1,
    "status": "vendido",
    "cashTotal": 64540,
    "initial70Total": 66845,
    "initial30Total": 69150,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20745,
    "cuotaInicial70": 46792,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "706",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.48,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1591,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "707",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.49,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1590,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "803",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.98,
    "status": "vendido",
    "cashTotal": 65772,
    "initial70Total": 68121,
    "initial30Total": 70470,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 21141,
    "cuotaInicial70": 47685,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1005",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.1,
    "status": "vendido",
    "cashTotal": 72213,
    "initial70Total": 66845,
    "initial30Total": 69150,
    "cashPerM2": 1566,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20745,
    "cuotaInicial70": 46792,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1305",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.1,
    "status": "vendido",
    "cashTotal": 72213,
    "initial70Total": 66845,
    "initial30Total": 69150,
    "cashPerM2": 1566,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20745,
    "cuotaInicial70": 46792,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "804",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.12,
    "status": "vendido",
    "cashTotal": 64568,
    "initial70Total": 66874,
    "initial30Total": 69180,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20754,
    "cuotaInicial70": 46812,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "806",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.48,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1591,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "807",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.49,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1590,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "903",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.98,
    "status": "vendido",
    "cashTotal": 65772,
    "initial70Total": 68121,
    "initial30Total": 70470,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 21141,
    "cuotaInicial70": 47685,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "904",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.12,
    "status": "vendido",
    "cashTotal": 64568,
    "initial70Total": 66874,
    "initial30Total": 69180,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20754,
    "cuotaInicial70": 46812,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "905",
    "modelo": "B1",
    "rooms": 1,
    "roomsLabel": "1 Dormitorio",
    "areaM2": 46.1,
    "status": "vendido",
    "cashTotal": 64540,
    "initial70Total": 66845,
    "initial30Total": 69150,
    "cashPerM2": 1400,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 20745,
    "cuotaInicial70": 46792,
    "planoUrl": "/garden_zen/plano_1dorm_b1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "801",
    "modelo": "B2",
    "rooms": 2,
    "roomsLabel": "2 Dormitorios",
    "areaM2": 83.34,
    "status": "disponible",
    "cashTotal": 121778,
    "initial70Total": 124643,
    "initial30Total": 131090,
    "cashPerM2": 1461,
    "initial70PerM2": 1496,
    "initial30PerM2": 1573,
    "cuotaInicial30": 39327,
    "cuotaInicial70": 87250,
    "planoUrl": "/garden_zen/fachada.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "901",
    "modelo": "B2",
    "rooms": 2,
    "roomsLabel": "2 Dormitorios",
    "areaM2": 83.34,
    "status": "vendido",
    "cashTotal": 129100,
    "initial70Total": 120843,
    "initial30Total": 125010,
    "cashPerM2": 1549,
    "initial70PerM2": 1450,
    "initial30PerM2": 1500,
    "cuotaInicial30": 37503,
    "cuotaInicial70": 84590,
    "planoUrl": "/garden_zen/fachada.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "906",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.48,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1591,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "907",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.49,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1590,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  },
  {
    "projectId": "garden-zen",
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1206",
    "modelo": "M1",
    "rooms": 0,
    "roomsLabel": "Monoambiente",
    "areaM2": 40.48,
    "status": "disponible",
    "cashTotal": 59600,
    "initial70Total": 61247,
    "initial30Total": 64399,
    "cashPerM2": 1472,
    "initial70PerM2": 1513,
    "initial30PerM2": 1591,
    "cuotaInicial30": 19320,
    "cuotaInicial70": 42873,
    "planoUrl": "/garden_zen/plano_mono_m1.jpg"
  }
];

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let current = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function cleanPrice(str?: string): number {
  if (!str) return 0;
  const num = Number(str.replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? Math.round(num) : 0;
}

export function parseGardenZenLiveCsv(csvText: string): GardenZenUnit[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    if (cells.some((c) => c.trim().toLowerCase() === "modelo") && cells.some((c) => c.trim().toLowerCase().startsWith("nro"))) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return [];

  const rows = lines.slice(headerIdx + 1).map(splitCsvLine).filter((r) => r.length >= 5 && r[2]);
  const parsed: GardenZenUnit[] = [];

  for (const r of rows) {
    const tipoStr = r[0] || "";
    const modelo = (r[1] || "").trim().toUpperCase();
    const unitNumber = (r[2] || "").trim();
    const floor = parseInt(r[3], 10) || 0;
    const areaM2 = parseFloat(r[4]) || 0;
    // Never interpret headings, exchange-rate notes or other tables as apartments.
    if (!/^\d{3,4}$/.test(unitNumber) || floor < 1 || areaM2 <= 0) continue;

    let price30 = 0;
    let price70 = 0;
    let priceContado = 0;
    let pm30 = 0;
    let pm70 = 0;
    let pmContado = 0;
    let isVendido = false;

    if (r.length >= 12 && cleanPrice(r[11]) >= 10000) {
      // Formato oficial USD (Cols 9, 10, 11)
      price30 = cleanPrice(r[9]);
      price70 = cleanPrice(r[10]);
      priceContado = cleanPrice(r[11]);
      isVendido = r.some((c) => {
        const up = c.toUpperCase();
        return up.includes("VENDIDO") || up.includes("RESERVADO");
      });
    } else {
      // Formato clasico de hoja de calculo
      price30 = cleanPrice(r[5]);
      price70 = cleanPrice(r[6]);
      priceContado = cleanPrice(r[7]);
      pm30 = cleanPrice(r[8]);
      pm70 = cleanPrice(r[9]);
      pmContado = cleanPrice(r[10]);
      const benefitStatus = (r[11] || "").trim().toUpperCase();
      isVendido = benefitStatus.includes("VENDIDO") || benefitStatus.includes("RESERVADO");
    }

    const status: "disponible" | "vendido" | "reservado" = isVendido ? "vendido" : "disponible";

    let rooms = 1;
    let roomsLabel = "1 Dormitorio";
    const tLower = tipoStr.toLowerCase();
    if (tLower.includes("monoambiente") || tLower.includes("studio") || modelo.startsWith("M")) {
      rooms = 0;
      roomsLabel = "Monoambiente";
    } else if (tLower.includes("2 dorm") || modelo.endsWith("2")) {
      rooms = 2;
      roomsLabel = "2 Dormitorios";
    } else if (tLower.includes("3 dorm") || modelo.endsWith("3")) {
      rooms = 3;
      roomsLabel = "3 Dormitorios";
    }

    const baseline = GARDEN_ZEN_BASELINE_UNITS.find((b) => b.unitNumber === unitNumber);

    let finalContado = priceContado;
    let final70 = price70;
    let final30 = price30;

    if (!finalContado && baseline && baseline.cashTotal > 0) {
      finalContado = baseline.cashTotal;
    }
    if (!final70 && baseline && baseline.initial70Total > 0) {
      final70 = baseline.initial70Total;
    }
    if (!final30 && baseline && baseline.initial30Total > 0) {
      final30 = baseline.initial30Total;
    }

    if (!finalContado && areaM2 > 0) {
      if (pmContado > 0) finalContado = Math.round(areaM2 * pmContado);
      else if (final30 > 0) finalContado = Math.round(final30 * 0.95);
      else finalContado = Math.round(areaM2 * 1400);
    }
    if (!final70 && areaM2 > 0) {
      if (pm70 > 0) final70 = Math.round(areaM2 * pm70);
      else if (final30 > 0) final70 = Math.round(final30 * 0.98);
      else final70 = Math.round(areaM2 * 1450);
    }
    if (!final30 && areaM2 > 0) {
      if (pm30 > 0) final30 = Math.round(areaM2 * pm30);
      else if (finalContado > 0) final30 = Math.round(finalContado * 1.05);
      else final30 = Math.round(areaM2 * 1500);
    }

    const finalCashPerM2 = pmContado || (areaM2 > 0 ? Math.round(finalContado / areaM2) : (baseline?.cashPerM2 || 1400));
    const final70PerM2 = pm70 || (areaM2 > 0 ? Math.round(final70 / areaM2) : (baseline?.initial70PerM2 || 1450));
    const final30PerM2 = pm30 || (areaM2 > 0 ? Math.round(final30 / areaM2) : (baseline?.initial30PerM2 || 1500));

    const cuotaInicial30 = Math.round(final30 * 0.3);
    const cuotaInicial70 = Math.round(final70 * 0.7);

    parsed.push({
      projectId: "garden-zen",
      floor,
      floorLabel: `Piso ${floor}`,
      unitNumber,
      modelo,
      rooms,
      roomsLabel,
      areaM2,
      status,
      cashTotal: finalContado,
      initial70Total: final70,
      initial30Total: final30,
      cashPerM2: finalCashPerM2,
      initial70PerM2: final70PerM2,
      initial30PerM2: final30PerM2,
      cuotaInicial30,
      cuotaInicial70,
      planoUrl: PLANO_MODELO_MAP[modelo] || "/garden_zen/fachada.jpg"
    });
  }

  return parsed.length > 0 ? parsed : GARDEN_ZEN_BASELINE_UNITS;
}

export async function fetchGardenZenLiveUnits(): Promise<GardenZenUnit[]> {
  try {
    const res = await fetch(GARDEN_ZEN_CONFIG.sheetCsvUrl, { cache: "no-cache" });
    if (res.ok) {
      const csv = await res.text();
      const parsed = parseGardenZenLiveCsv(csv);
      if (parsed.length > 0) {
        if (parsed.length < GARDEN_ZEN_BASELINE_UNITS.length) {
          const liveMap = new Map(parsed.map((u) => [u.unitNumber, u]));
          return GARDEN_ZEN_BASELINE_UNITS.map((base) => {
            const live = liveMap.get(base.unitNumber);
            if (live) return live;
            return { ...base, status: "vendido" as const };
          });
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[GardenZen] Fallback a JSON estatico por error en live CSV:", err);
  }

  try {
    const res = await fetch("/garden-zen-inventory.json");
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) return json;
    }
  } catch (err) {
    console.warn("[GardenZen] Fallback a baseline units:", err);
  }

  return GARDEN_ZEN_BASELINE_UNITS;
}
