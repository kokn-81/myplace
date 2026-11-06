/* Generated baseline and live sync for BLESS DREI - Alta Vida Santa Cruz.
 * Google Sheet Live URL: https://docs.google.com/spreadsheets/d/1WcpH2mpmyoIjcK2pslIhazFH8741bHstNJk10Eg2qdE/export?format=csv&gid=1613277342
 */

export interface BlessDreiUnit {
  id: string;
  codigo: string;
  piso: string;
  pisoNumero: number;
  nro: string;
  tipologia: "Monoambiente" | "1 Dormitorio";
  modelo: string;
  fachada: string;
  estado: "LIBRE" | "RESERVADO" | "VENDIDO";
  precioCuotas: number;
  precioContado: number;
  superficieM2: number;
  planoUrl: string;
}

export interface BlessDreiParking {
  id: string;
  tipo: "Parqueo Vehicular";
  nivel: string;
  nro: string;
  estado: "LIBRE" | "RESERVADO" | "VENDIDO";
  precioCuotas: number;
  precioContado: number;
  superficieM2: number;
}

export interface BlessDreiStorage {
  id: string;
  nivel: string;
  nro: string;
  estado: "LIBRE" | "RESERVADO" | "VENDIDO";
  precioCuotas: number;
  precioContado: number;
  superficieM2: number;
}

export const BLESS_DREI_CONFIG = {
  id: "bless-drei",
  name: "Bless Drei",
  builder: "Alta Vida Santa Cruz",
  zone: "Equipetrol",
  address: "Calle Alejandro Ramírez entre 3° y 4° Anillo (a metros de Av. San Martín)",
  city: "Santa Cruz de la Sierra",
  delivery: "Febrero 2028",
  constructionStatus: "En construcción",
  totalUnits: 41,
  floorsCount: 16,
  reservaUsd: 2000,
  minPriceUsd: 38168,
  driveUrl: "https://drive.google.com/drive/folders/164jTeNTet9gdGaaduJLXBIfIxU6UrBrR",
  sheetUrl: "https://docs.google.com/spreadsheets/d/1WcpH2mpmyoIjcK2pslIhazFH8741bHstNJk10Eg2qdE/edit?usp=sharing",
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/1WcpH2mpmyoIjcK2pslIhazFH8741bHstNJk10Eg2qdE/export?format=csv&gid=1613277342",
  brochurePdfUrl: "https://drive.google.com/file/d/1s7IbOql4AMQaHjAX0kAUnrr-r8s-kolF/view",
  modelosPdfUrl: "/bless_drei/modelos_bless_drei.pdf",
  amenities: [
    "Piscina panorámica con vista a Equipetrol",
    "Gimnasio al aire libre y fitness studio",
    "Coworking climatizado y sala de reuniones",
    "Churrasquera moderna y salón de eventos",
    "Lobby de acceso con seguridad y cerraduras inteligentes",
    "Ubicación privilegiada en el corazón de Equipetrol"
  ]
};

export const BLESS_DREI_PLANO_MAP: Record<string, string> = {
  "A": "/bless_drei/modelos_pages/page_2.jpg",
  "B": "/bless_drei/modelos_pages/page_2.jpg",
  "C": "/bless_drei/modelos_pages/page_3.jpg",
  "D": "/bless_drei/modelos_pages/page_3.jpg",
  "E": "/bless_drei/modelos_pages/page_4.jpg",
  "F": "/bless_drei/modelos_pages/page_4.jpg",
  "G": "/bless_drei/modelos_pages/page_6.jpg",
  "H": "/bless_drei/modelos_pages/page_6.jpg",
  "I": "/bless_drei/modelos_pages/page_7.jpg"
};

export function formatBlessUsd(val: number): string {
  return Math.round(val).toLocaleString("es-BO");
}

export const BLESS_DREI_PARKINGS: BlessDreiParking[] = [
  {
    "id": "PK-BD-2",
    "tipo": "Parqueo Vehicular",
    "nivel": "PB",
    "nro": "2",
    "estado": "LIBRE",
    "precioCuotas": 14750,
    "precioContado": 14000,
    "superficieM2": 12.5
  },
  {
    "id": "PK-BD-3",
    "tipo": "Parqueo Vehicular",
    "nivel": "PB",
    "nro": "3",
    "estado": "LIBRE",
    "precioCuotas": 14750,
    "precioContado": 14000,
    "superficieM2": 12.5
  },
  {
    "id": "PK-BD-4",
    "tipo": "Parqueo Vehicular",
    "nivel": "PB",
    "nro": "4",
    "estado": "LIBRE",
    "precioCuotas": 19765,
    "precioContado": 18760,
    "superficieM2": 16.75
  },
  {
    "id": "PK-BD-5",
    "tipo": "Parqueo Vehicular",
    "nivel": "PB",
    "nro": "5",
    "estado": "LIBRE",
    "precioCuotas": 19765,
    "precioContado": 18760,
    "superficieM2": 16.75
  },
  {
    "id": "PK-BD-6",
    "tipo": "Parqueo Vehicular",
    "nivel": "PB",
    "nro": "6",
    "estado": "LIBRE",
    "precioCuotas": 20945,
    "precioContado": 19880,
    "superficieM2": 17.75
  },
  {
    "id": "PK-BD-1",
    "tipo": "Parqueo Vehicular",
    "nivel": "PB PLANTA BAJA",
    "nro": "1",
    "estado": "VENDIDO",
    "precioCuotas": 18089,
    "precioContado": 17170,
    "superficieM2": 15.33
  },
  {
    "id": "PK-BD-7",
    "tipo": "Parqueo Vehicular",
    "nivel": "PB PLANTA BAJA",
    "nro": "7",
    "estado": "LIBRE",
    "precioCuotas": 19765,
    "precioContado": 18760,
    "superficieM2": 16.75
  },
  {
    "id": "PK-BD-8",
    "tipo": "Parqueo Vehicular",
    "nivel": "PB PLANTA BAJA",
    "nro": "8",
    "estado": "LIBRE",
    "precioCuotas": 14750,
    "precioContado": 14000,
    "superficieM2": 12.5
  },
  {
    "id": "PK-BD-9",
    "tipo": "Parqueo Vehicular",
    "nivel": "PB PLANTA BAJA",
    "nro": "9",
    "estado": "LIBRE",
    "precioCuotas": 14750,
    "precioContado": 14000,
    "superficieM2": 12.5
  },
  {
    "id": "PK-BD-10",
    "tipo": "Parqueo Vehicular",
    "nivel": "PB PLANTA BAJA",
    "nro": "10",
    "estado": "LIBRE",
    "precioCuotas": 19765,
    "precioContado": 18760,
    "superficieM2": 16.75
  }
];
export const BLESS_DREI_STORAGES: BlessDreiStorage[] = [
  {
    "id": "BL-BD-1",
    "nivel": "PB",
    "nro": "1",
    "estado": "LIBRE",
    "precioCuotas": 3882,
    "precioContado": 3685,
    "superficieM2": 3.29
  },
  {
    "id": "BL-BD-2",
    "nivel": "PB",
    "nro": "2",
    "estado": "LIBRE",
    "precioCuotas": 3882,
    "precioContado": 3685,
    "superficieM2": 3.29
  },
  {
    "id": "BL-BD-3",
    "nivel": "PB",
    "nro": "3",
    "estado": "LIBRE",
    "precioCuotas": 3587,
    "precioContado": 3405,
    "superficieM2": 3.04
  },
  {
    "id": "BL-BD-4",
    "nivel": "PB",
    "nro": "4",
    "estado": "LIBRE",
    "precioCuotas": 3623,
    "precioContado": 3438,
    "superficieM2": 3.07
  }
];

export const BLESS_DREI_BASELINE_UNITS: BlessDreiUnit[] = [
  {
    "id": "BD-PISO1-1",
    "codigo": "101",
    "piso": "PISO 1",
    "pisoNumero": 1,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "I",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 63484,
    "precioContado": 60344,
    "superficieM2": 46.17,
    "planoUrl": "/bless_drei/modelos_pages/page_7.jpg"
  },
  {
    "id": "BD-PISO1-2",
    "codigo": "102",
    "piso": "PISO 1",
    "pisoNumero": 1,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "H",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 61971,
    "precioContado": 58906,
    "superficieM2": 45.07,
    "planoUrl": "/bless_drei/modelos_pages/page_6.jpg"
  },
  {
    "id": "BD-PISO1-3",
    "codigo": "103",
    "piso": "PISO 1",
    "pisoNumero": 1,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "G",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 55267,
    "precioContado": 52260,
    "superficieM2": 42.35,
    "planoUrl": "/bless_drei/modelos_pages/page_6.jpg"
  },
  {
    "id": "BD-PISO1-4",
    "codigo": "104",
    "piso": "PISO 1",
    "pisoNumero": 1,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "A",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 40364,
    "precioContado": 38168,
    "superficieM2": 30.93,
    "planoUrl": "/bless_drei/modelos_pages/page_2.jpg"
  },
  {
    "id": "BD-PISO1-5",
    "codigo": "105",
    "piso": "PISO 1",
    "pisoNumero": 1,
    "nro": "5",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 43300,
    "precioContado": 40944,
    "superficieM2": 33.18,
    "planoUrl": "/bless_drei/modelos_pages/page_2.jpg"
  },
  {
    "id": "BD-PISO2-1",
    "codigo": "201",
    "piso": "PISO 2",
    "pisoNumero": 2,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "I",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 63484,
    "precioContado": 60344,
    "superficieM2": 46.17,
    "planoUrl": "/bless_drei/modelos_pages/page_7.jpg"
  },
  {
    "id": "BD-PISO2-2",
    "codigo": "202",
    "piso": "PISO 2",
    "pisoNumero": 2,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "H",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 61971,
    "precioContado": 58906,
    "superficieM2": 45.07,
    "planoUrl": "/bless_drei/modelos_pages/page_6.jpg"
  },
  {
    "id": "BD-PISO2-3",
    "codigo": "203",
    "piso": "PISO 2",
    "pisoNumero": 2,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "G",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 55267,
    "precioContado": 52260,
    "superficieM2": 42.35,
    "planoUrl": "/bless_drei/modelos_pages/page_6.jpg"
  },
  {
    "id": "BD-PISO2-4",
    "codigo": "204",
    "piso": "PISO 2",
    "pisoNumero": 2,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "A",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 40364,
    "precioContado": 38168,
    "superficieM2": 30.93,
    "planoUrl": "/bless_drei/modelos_pages/page_2.jpg"
  },
  {
    "id": "BD-PISO2-5",
    "codigo": "205",
    "piso": "PISO 2",
    "pisoNumero": 2,
    "nro": "5",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "fachada": "POSTERIOR",
    "estado": "VENDIDO",
    "precioCuotas": 43300,
    "precioContado": 40944,
    "superficieM2": 33.18,
    "planoUrl": "/bless_drei/modelos_pages/page_2.jpg"
  },
  {
    "id": "BD-PISO3-1",
    "codigo": "301",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "I",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 63484,
    "precioContado": 60344,
    "superficieM2": 46.17,
    "planoUrl": "/bless_drei/modelos_pages/page_7.jpg"
  },
  {
    "id": "BD-PISO3-2",
    "codigo": "302",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "H",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 61971,
    "precioContado": 58906,
    "superficieM2": 45.07,
    "planoUrl": "/bless_drei/modelos_pages/page_6.jpg"
  },
  {
    "id": "BD-PISO3-3",
    "codigo": "303",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "G",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 55267,
    "precioContado": 52260,
    "superficieM2": 42.35,
    "planoUrl": "/bless_drei/modelos_pages/page_6.jpg"
  },
  {
    "id": "BD-PISO3-4",
    "codigo": "304",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "A",
    "fachada": "POSTERIOR",
    "estado": "VENDIDO",
    "precioCuotas": 40364,
    "precioContado": 38168,
    "superficieM2": 30.93,
    "planoUrl": "/bless_drei/modelos_pages/page_2.jpg"
  },
  {
    "id": "BD-PISO3-5",
    "codigo": "305",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "5",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "fachada": "POSTERIOR",
    "estado": "RESERVADO",
    "precioCuotas": 43300,
    "precioContado": 40944,
    "superficieM2": 33.18,
    "planoUrl": "/bless_drei/modelos_pages/page_2.jpg"
  },
  {
    "id": "BD-PISO4-1",
    "codigo": "401",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "I",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 63484,
    "precioContado": 60344,
    "superficieM2": 46.17,
    "planoUrl": "/bless_drei/modelos_pages/page_7.jpg"
  },
  {
    "id": "BD-PISO4-2",
    "codigo": "402",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "H",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 61971,
    "precioContado": 58906,
    "superficieM2": 45.07,
    "planoUrl": "/bless_drei/modelos_pages/page_6.jpg"
  },
  {
    "id": "BD-PISO4-3",
    "codigo": "403",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "G",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 55267,
    "precioContado": 52260,
    "superficieM2": 42.35,
    "planoUrl": "/bless_drei/modelos_pages/page_6.jpg"
  },
  {
    "id": "BD-PISO4-4",
    "codigo": "404",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "A",
    "fachada": "POSTERIOR",
    "estado": "VENDIDO",
    "precioCuotas": 40364,
    "precioContado": 38168,
    "superficieM2": 30.93,
    "planoUrl": "/bless_drei/modelos_pages/page_2.jpg"
  },
  {
    "id": "BD-PISO4-5",
    "codigo": "405",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "5",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "fachada": "POSTERIOR",
    "estado": "VENDIDO",
    "precioCuotas": 43300,
    "precioContado": 40944,
    "superficieM2": 33.18,
    "planoUrl": "/bless_drei/modelos_pages/page_2.jpg"
  },
  {
    "id": "BD-PISO5-1",
    "codigo": "501",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "I",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 63484,
    "precioContado": 60344,
    "superficieM2": 46.17,
    "planoUrl": "/bless_drei/modelos_pages/page_7.jpg"
  },
  {
    "id": "BD-PISO5-2",
    "codigo": "502",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "H",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 61971,
    "precioContado": 58906,
    "superficieM2": 45.07,
    "planoUrl": "/bless_drei/modelos_pages/page_6.jpg"
  },
  {
    "id": "BD-PISO5-3",
    "codigo": "503",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "G",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 55267,
    "precioContado": 52260,
    "superficieM2": 42.35,
    "planoUrl": "/bless_drei/modelos_pages/page_6.jpg"
  },
  {
    "id": "BD-PISO5-4",
    "codigo": "504",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "A",
    "fachada": "POSTERIOR",
    "estado": "VENDIDO",
    "precioCuotas": 40364,
    "precioContado": 38168,
    "superficieM2": 30.93,
    "planoUrl": "/bless_drei/modelos_pages/page_2.jpg"
  },
  {
    "id": "BD-PISO5-5",
    "codigo": "505",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "5",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "fachada": "POSTERIOR",
    "estado": "VENDIDO",
    "precioCuotas": 43300,
    "precioContado": 40944,
    "superficieM2": 33.18,
    "planoUrl": "/bless_drei/modelos_pages/page_2.jpg"
  },
  {
    "id": "BD-PISO7-1",
    "codigo": "701",
    "piso": "PISO 7",
    "pisoNumero": 7,
    "nro": "1",
    "tipologia": "Monoambiente",
    "modelo": "E",
    "fachada": "FRONTAL",
    "estado": "LIBRE",
    "precioCuotas": 57283,
    "precioContado": 54450,
    "superficieM2": 41.66,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO7-2",
    "codigo": "702",
    "piso": "PISO 7",
    "pisoNumero": 7,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "F",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 57475,
    "precioContado": 54633,
    "superficieM2": 41.8,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO8-1",
    "codigo": "801",
    "piso": "PISO 8",
    "pisoNumero": 8,
    "nro": "1",
    "tipologia": "Monoambiente",
    "modelo": "E",
    "fachada": "FRONTAL",
    "estado": "VENDIDO",
    "precioCuotas": 57283,
    "precioContado": 54450,
    "superficieM2": 41.66,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO8-2",
    "codigo": "802",
    "piso": "PISO 8",
    "pisoNumero": 8,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "F",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 57475,
    "precioContado": 54633,
    "superficieM2": 41.8,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO9-1",
    "codigo": "901",
    "piso": "PISO 9",
    "pisoNumero": 9,
    "nro": "1",
    "tipologia": "Monoambiente",
    "modelo": "E",
    "fachada": "FRONTAL",
    "estado": "VENDIDO",
    "precioCuotas": 57283,
    "precioContado": 54450,
    "superficieM2": 41.66,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO9-2",
    "codigo": "902",
    "piso": "PISO 9",
    "pisoNumero": 9,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "F",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 57475,
    "precioContado": 54633,
    "superficieM2": 41.8,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO10-1",
    "codigo": "1001",
    "piso": "PISO 10",
    "pisoNumero": 10,
    "nro": "1",
    "tipologia": "Monoambiente",
    "modelo": "E",
    "fachada": "FRONTAL",
    "estado": "VENDIDO",
    "precioCuotas": 57283,
    "precioContado": 54450,
    "superficieM2": 41.66,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO10-2",
    "codigo": "1002",
    "piso": "PISO 10",
    "pisoNumero": 10,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "F",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 57475,
    "precioContado": 54633,
    "superficieM2": 41.8,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO11-1",
    "codigo": "1101",
    "piso": "PISO 11",
    "pisoNumero": 11,
    "nro": "1",
    "tipologia": "Monoambiente",
    "modelo": "E",
    "fachada": "FRONTAL",
    "estado": "VENDIDO",
    "precioCuotas": 57283,
    "precioContado": 54450,
    "superficieM2": 41.66,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO11-2",
    "codigo": "1102",
    "piso": "PISO 11",
    "pisoNumero": 11,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "F",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 57475,
    "precioContado": 54633,
    "superficieM2": 41.8,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO12-1",
    "codigo": "1201",
    "piso": "PISO 12",
    "pisoNumero": 12,
    "nro": "1",
    "tipologia": "Monoambiente",
    "modelo": "E",
    "fachada": "FRONTAL",
    "estado": "VENDIDO",
    "precioCuotas": 57283,
    "precioContado": 54450,
    "superficieM2": 41.66,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO12-2",
    "codigo": "1202",
    "piso": "PISO 12",
    "pisoNumero": 12,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "F",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 57475,
    "precioContado": 54633,
    "superficieM2": 41.8,
    "planoUrl": "/bless_drei/modelos_pages/page_4.jpg"
  },
  {
    "id": "BD-PISO13-1",
    "codigo": "1301",
    "piso": "PISO 13",
    "pisoNumero": 13,
    "nro": "1",
    "tipologia": "Monoambiente",
    "modelo": "D",
    "fachada": "FRONTAL",
    "estado": "VENDIDO",
    "precioCuotas": 52044,
    "precioContado": 49470,
    "superficieM2": 37.85,
    "planoUrl": "/bless_drei/modelos_pages/page_3.jpg"
  },
  {
    "id": "BD-PISO13-2",
    "codigo": "1302",
    "piso": "PISO 13",
    "pisoNumero": 13,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "C",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 51521,
    "precioContado": 48973,
    "superficieM2": 37.47,
    "planoUrl": "/bless_drei/modelos_pages/page_3.jpg"
  },
  {
    "id": "BD-PISO14-1",
    "codigo": "1401",
    "piso": "PISO 14",
    "pisoNumero": 14,
    "nro": "1",
    "tipologia": "Monoambiente",
    "modelo": "D",
    "fachada": "FRONTAL",
    "estado": "VENDIDO",
    "precioCuotas": 52044,
    "precioContado": 49470,
    "superficieM2": 37.85,
    "planoUrl": "/bless_drei/modelos_pages/page_3.jpg"
  },
  {
    "id": "BD-PISO14-2",
    "codigo": "1402",
    "piso": "PISO 14",
    "pisoNumero": 14,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "C",
    "fachada": "POSTERIOR",
    "estado": "LIBRE",
    "precioCuotas": 51521,
    "precioContado": 48973,
    "superficieM2": 37.47,
    "planoUrl": "/bless_drei/modelos_pages/page_3.jpg"
  }
];

export function parseBlessDreiCsv(csv: string): BlessDreiUnit[] {
  const lines = csv.split(/\r?\n/);
  const units: BlessDreiUnit[] = [];
  let currentPiso = "";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const rawCols: string[] = [];
    let insideQuote = false;
    let entry = "";
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        insideQuote = !insideQuote;
      } else if (ch === ',' && !insideQuote) {
        rawCols.push(entry.trim());
        entry = "";
      } else {
        entry += ch;
      }
    }
    rawCols.push(entry.trim());

    const clean = (val: string) => (val || "").replace(/^"|"$/g, "").trim();
    const nivelCol = clean(rawCols[0]);
    if (nivelCol && (nivelCol.startsWith("PISO") || nivelCol.startsWith("PB") || nivelCol.startsWith("SUB") || nivelCol.startsWith("-1"))) {
      currentPiso = nivelCol;
    }

    const modelo = clean(rawCols[1]);
    const fachada = clean(rawCols[2]);
    const nro = clean(rawCols[3]);
    const modLetter = clean(rawCols[4]);
    const estadoRaw = clean(rawCols[5]).toUpperCase();
    const precioCuotasStr = clean(rawCols[6]);
    const precioContadoStr = clean(rawCols[7]);
    const superficieStr = clean(rawCols[8]);

    const num = (str: string) => {
      if (!str) return 0;
      const cleanStr = str.replace(/[^\d.]/g, "");
      return parseFloat(cleanStr) || 0;
    };

    if (modelo.includes("MONOAMBIENTE") || modelo.includes("DORMITORIO")) {
      const tipologia: "Monoambiente" | "1 Dormitorio" =
        modelo.includes("MONOAMBIENTE") ? "Monoambiente" : "1 Dormitorio";

      const pisoNum = parseInt((currentPiso || "").replace(/[^\d]/g, ""), 10) || 0;
      const unitCode = `${pisoNum}${nro.padStart(2, "0")}`;
      const estado: "LIBRE" | "RESERVADO" | "VENDIDO" =
        estadoRaw === "VENDIDO" ? "VENDIDO" : estadoRaw === "RESERVADO" ? "RESERVADO" : "LIBRE";

      const pCuotas = num(precioCuotasStr);
      const pContado = num(precioContadoStr);
      const sup = num(superficieStr);

      const mKey = modLetter || modelo;
      units.push({
        id: `BD-${currentPiso.replace(/\s+/g, "")}-${nro}`,
        codigo: unitCode,
        piso: currentPiso,
        pisoNumero: pisoNum,
        nro,
        tipologia,
        modelo: mKey,
        fachada,
        estado,
        precioCuotas: pCuotas,
        precioContado: pContado,
        superficieM2: sup,
        planoUrl: BLESS_DREI_PLANO_MAP[mKey] || "/bless_drei/fachada_principal.jpg"
      });
    }
  }

  return units.length > 0 ? units : BLESS_DREI_BASELINE_UNITS;
}

export async function fetchBlessDreiLiveUnits(): Promise<BlessDreiUnit[]> {
  try {
    const res = await fetch(BLESS_DREI_CONFIG.sheetCsvUrl, { cache: "no-cache" });
    if (res.ok) {
      const csv = await res.text();
      const parsed = parseBlessDreiCsv(csv);
      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("[BlessDrei] Fallback a JSON estatico por error en live CSV:", err);
  }

  try {
    const res = await fetch("/bless-drei-inventory.json");
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) return json;
    }
  } catch (err) {
    console.warn("[BlessDrei] Fallback a baseline units:", err);
  }

  return BLESS_DREI_BASELINE_UNITS;
}
