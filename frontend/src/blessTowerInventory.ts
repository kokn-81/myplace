/* Generated baseline and live sync for BLESS TOWER - Alta Vida Santa Cruz.
 * Google Sheet Live URL: https://docs.google.com/spreadsheets/d/1WcpH2mpmyoIjcK2pslIhazFH8741bHstNJk10Eg2qdE/export?format=csv&gid=0
 */

export interface BlessTowerUnit {
  id: string;
  codigo: string;
  piso: string;
  pisoNumero: number;
  nro: string;
  tipologia: "Monoambiente" | "1 Dormitorio" | "2 Dormitorios";
  modelo: string;
  estado: "LIBRE" | "RESERVADO" | "VENDIDO";
  precioLista: number;
  precioCuotas: number;
  precioContado: number;
  superficieM2: number;
  planoUrl: string;
}

export interface BlessTowerParking {
  id: string;
  tipo: "Parqueo Simple" | "Parqueo + Baulera";
  nivel: string;
  nro: string;
  estado: "LIBRE" | "RESERVADO" | "VENDIDO";
  precioLista: number;
  precioCuotas: number;
  precioContado: number;
  superficieM2: number;
}

export interface BlessTowerStorage {
  id: string;
  nivel: string;
  nro: string;
  estado: "LIBRE" | "RESERVADO" | "VENDIDO";
  precioLista: number;
  precioCuotas: number;
  precioContado: number;
  superficieM2: number;
}

export const BLESS_TOWER_CONFIG = {
  id: "bless-tower",
  name: "Bless Tower",
  builder: "Alta Vida Santa Cruz",
  zone: "Av. Cristo Redentor (2° a 3° Anillo)",
  address: "Av. Cristo Redentor entre 2° y 3° Anillo Interno",
  city: "Santa Cruz de la Sierra",
  delivery: "Diciembre 2026",
  constructionStatus: "En construcción",
  totalUnits: 110,
  floorsCount: 30,
  reservaUsd: 2000,
  minPriceUsd: 43026,
  driveUrl: "https://drive.google.com/drive/folders/1ABpNQMEryl0BLSFHgcPfPeNzf5U-WtN4",
  sheetUrl: "https://docs.google.com/spreadsheets/d/1WcpH2mpmyoIjcK2pslIhazFH8741bHstNJk10Eg2qdE/edit?usp=sharing",
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/1WcpH2mpmyoIjcK2pslIhazFH8741bHstNJk10Eg2qdE/export?format=csv&gid=0",
  brochurePdfUrl: "/bless_tower/brochure_bless_tower.pdf",
  modelosPdfUrl: "/bless_tower/modelos_bless_tower.pdf",
  amenities: [
    "Piscina sin fin en rooftop con vistas panorámicas",
    "Lobby de ingreso exclusivo de doble altura",
    "Doble churrasquera gourmet y lounge social",
    "Área de fogatero para noches al aire libre",
    "Sala de juegos / Espacio gamer",
    "Coworking de alta productividad",
    "Gimnasio premium con tecnología y diseño",
    "Seguridad 24/7 con control de accesos inteligente",
    "Equipamiento: cerradura digital y A/C instalados"
  ]
};

export const BLESS_TOWER_PLANO_MAP: Record<string, string> = {
  "A": "/bless_tower/modelos_pages/page_2.jpg",
  "B": "/bless_tower/modelos_pages/page_2.jpg",
  "C": "/bless_tower/modelos_pages/page_3.jpg",
  "D": "/bless_tower/modelos_pages/page_3.jpg",
  "E": "/bless_tower/modelos_pages/page_4.jpg",
  "F": "/bless_tower/modelos_pages/page_4.jpg",
  "G": "/bless_tower/modelos_pages/page_5.jpg",
  "H": "/bless_tower/modelos_pages/page_5.jpg",
  "I": "/bless_tower/modelos_pages/page_6.jpg",
  "J": "/bless_tower/modelos_pages/page_6.jpg",
  "K": "/bless_tower/modelos_pages/page_8.jpg",
  "L": "/bless_tower/modelos_pages/page_8.jpg",
  "M": "/bless_tower/modelos_pages/page_9.jpg",
  "N": "/bless_tower/modelos_pages/page_9.jpg",
  "O": "/bless_tower/modelos_pages/page_10.jpg",
  "P": "/bless_tower/modelos_pages/page_10.jpg",
  "Q": "/bless_tower/modelos_pages/page_11.jpg",
  "R": "/bless_tower/modelos_pages/page_11.jpg",
  "S": "/bless_tower/modelos_pages/page_12.jpg",
  "T": "/bless_tower/modelos_pages/page_12.jpg",
  "U": "/bless_tower/modelos_pages/page_13.jpg",
  "V": "/bless_tower/modelos_pages/page_13.jpg",
  "W": "/bless_tower/modelos_pages/page_14.jpg",
  "X": "/bless_tower/modelos_pages/page_16.jpg",
  "Y": "/bless_tower/modelos_pages/page_16.jpg"
};

export function formatBlessUsd(val: number): string {
  return Math.round(val).toLocaleString("es-BO");
}

export const BLESS_TOWER_PARKINGS: BlessTowerParking[] = [
  {
    "id": "PK-BT-1",
    "tipo": "Parqueo + Baulera",
    "nivel": "-1 SUB",
    "nro": "1",
    "estado": "RESERVADO",
    "precioLista": 21090,
    "precioCuotas": 17997,
    "precioContado": 16591,
    "superficieM2": 14.06
  },
  {
    "id": "PK-BT-2",
    "tipo": "Parqueo + Baulera",
    "nivel": "-1 SUB",
    "nro": "2",
    "estado": "RESERVADO",
    "precioLista": 21090,
    "precioCuotas": 17997,
    "precioContado": 16591,
    "superficieM2": 14.06
  },
  {
    "id": "PK-BT-3",
    "tipo": "Parqueo + Baulera",
    "nivel": "-1 SUB",
    "nro": "3",
    "estado": "VENDIDO",
    "precioLista": 22245,
    "precioCuotas": 18982,
    "precioContado": 17499,
    "superficieM2": 14.83
  },
  {
    "id": "PK-BT-4",
    "tipo": "Parqueo + Baulera",
    "nivel": "-1 SUB",
    "nro": "4",
    "estado": "VENDIDO",
    "precioLista": 22245,
    "precioCuotas": 18982,
    "precioContado": 17499,
    "superficieM2": 14.83
  },
  {
    "id": "PK-BT-5",
    "tipo": "Parqueo + Baulera",
    "nivel": "-1 SUB",
    "nro": "5",
    "estado": "VENDIDO",
    "precioLista": 21090,
    "precioCuotas": 17997,
    "precioContado": 16591,
    "superficieM2": 14.06
  },
  {
    "id": "PK-BT-6",
    "tipo": "Parqueo + Baulera",
    "nivel": "-1 SUB",
    "nro": "6",
    "estado": "RESERVADO",
    "precioLista": 21090,
    "precioCuotas": 17997,
    "precioContado": 16591,
    "superficieM2": 14.06
  },
  {
    "id": "PK-BT-7",
    "tipo": "Parqueo Simple",
    "nivel": "-1 SUB",
    "nro": "7",
    "estado": "RESERVADO",
    "precioLista": 18000,
    "precioCuotas": 15360,
    "precioContado": 14160,
    "superficieM2": 12
  },
  {
    "id": "PK-BT-8",
    "tipo": "Parqueo Simple",
    "nivel": "-1 SUB",
    "nro": "8",
    "estado": "RESERVADO",
    "precioLista": 18000,
    "precioCuotas": 15360,
    "precioContado": 14160,
    "superficieM2": 12
  },
  {
    "id": "PK-BT-9",
    "tipo": "Parqueo Simple",
    "nivel": "-1 SUB",
    "nro": "9",
    "estado": "VENDIDO",
    "precioLista": 17250,
    "precioCuotas": 14720,
    "precioContado": 13570,
    "superficieM2": 11.5
  },
  {
    "id": "PK-BT-10-A",
    "tipo": "Parqueo Simple",
    "nivel": "-1 SUB",
    "nro": "10-A",
    "estado": "VENDIDO",
    "precioLista": 20250,
    "precioCuotas": 17280,
    "precioContado": 15930,
    "superficieM2": 13.5
  },
  {
    "id": "PK-BT-10-B",
    "tipo": "Parqueo Simple",
    "nivel": "-1 SUB",
    "nro": "10-B",
    "estado": "VENDIDO",
    "precioLista": 20250,
    "precioCuotas": 17280,
    "precioContado": 15930,
    "superficieM2": 13.5
  },
  {
    "id": "PK-BT-11",
    "tipo": "Parqueo Simple",
    "nivel": "-1 SUB",
    "nro": "11",
    "estado": "VENDIDO",
    "precioLista": 17760,
    "precioCuotas": 15155,
    "precioContado": 13971,
    "superficieM2": 11.84
  },
  {
    "id": "PK-BT-12",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 1",
    "nro": "12",
    "estado": "RESERVADO",
    "precioLista": 20250,
    "precioCuotas": 17280,
    "precioContado": 15930,
    "superficieM2": 13.5
  },
  {
    "id": "PK-BT-13",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 1",
    "nro": "13",
    "estado": "VENDIDO",
    "precioLista": 17250,
    "precioCuotas": 14720,
    "precioContado": 13570,
    "superficieM2": 11.5
  },
  {
    "id": "PK-BT-14",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 1",
    "nro": "14",
    "estado": "VENDIDO",
    "precioLista": 17250,
    "precioCuotas": 14720,
    "precioContado": 13570,
    "superficieM2": 11.5
  },
  {
    "id": "PK-BT-15",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 1",
    "nro": "15",
    "estado": "RESERVADO",
    "precioLista": 19125,
    "precioCuotas": 16320,
    "precioContado": 15045,
    "superficieM2": 12.75
  },
  {
    "id": "PK-BT-16",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 1",
    "nro": "16",
    "estado": "VENDIDO",
    "precioLista": 22695,
    "precioCuotas": 19366,
    "precioContado": 17853,
    "superficieM2": 15.13
  },
  {
    "id": "PK-BT-17",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 1",
    "nro": "17",
    "estado": "VENDIDO",
    "precioLista": 19125,
    "precioCuotas": 16320,
    "precioContado": 15045,
    "superficieM2": 12.75
  },
  {
    "id": "PK-BT-18",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 1",
    "nro": "18",
    "estado": "VENDIDO",
    "precioLista": 22125,
    "precioCuotas": 18880,
    "precioContado": 17405,
    "superficieM2": 14.75
  },
  {
    "id": "PK-BT-19",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 1",
    "nro": "19",
    "estado": "VENDIDO",
    "precioLista": 17250,
    "precioCuotas": 14720,
    "precioContado": 13570,
    "superficieM2": 11.5
  },
  {
    "id": "PK-BT-20",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 2",
    "nro": "20",
    "estado": "VENDIDO",
    "precioLista": 20250,
    "precioCuotas": 17280,
    "precioContado": 15930,
    "superficieM2": 13.5
  },
  {
    "id": "PK-BT-21",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 2",
    "nro": "21",
    "estado": "VENDIDO",
    "precioLista": 17250,
    "precioCuotas": 14720,
    "precioContado": 13570,
    "superficieM2": 11.5
  },
  {
    "id": "PK-BT-22",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 2",
    "nro": "22",
    "estado": "VENDIDO",
    "precioLista": 17250,
    "precioCuotas": 14720,
    "precioContado": 13570,
    "superficieM2": 11.5
  },
  {
    "id": "PK-BT-23",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 2",
    "nro": "23",
    "estado": "RESERVADO",
    "precioLista": 19125,
    "precioCuotas": 16320,
    "precioContado": 15045,
    "superficieM2": 12.75
  },
  {
    "id": "PK-BT-24",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 2",
    "nro": "24",
    "estado": "VENDIDO",
    "precioLista": 22695,
    "precioCuotas": 19366,
    "precioContado": 17853,
    "superficieM2": 15.13
  },
  {
    "id": "PK-BT-25",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 2",
    "nro": "25",
    "estado": "VENDIDO",
    "precioLista": 19125,
    "precioCuotas": 16320,
    "precioContado": 15045,
    "superficieM2": 12.75
  },
  {
    "id": "PK-BT-26",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 2",
    "nro": "26",
    "estado": "VENDIDO",
    "precioLista": 22125,
    "precioCuotas": 18880,
    "precioContado": 17405,
    "superficieM2": 14.75
  },
  {
    "id": "PK-BT-27",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 2",
    "nro": "27",
    "estado": "VENDIDO",
    "precioLista": 17250,
    "precioCuotas": 14720,
    "precioContado": 13570,
    "superficieM2": 11.5
  },
  {
    "id": "PK-BT-28",
    "tipo": "Parqueo Simple",
    "nivel": "PISO 2",
    "nro": "28",
    "estado": "VENDIDO",
    "precioLista": 18750,
    "precioCuotas": 16000,
    "precioContado": 14750,
    "superficieM2": 12.5
  }
];
export const BLESS_TOWER_STORAGES: BlessTowerStorage[] = [
  {
    "id": "BL-BT-7",
    "nivel": "-1 SUB",
    "nro": "7",
    "estado": "LIBRE",
    "precioLista": 8010,
    "precioCuotas": 6835,
    "precioContado": 6301,
    "superficieM2": 5.34
  },
  {
    "id": "BL-BT-8",
    "nivel": "-1 SUB",
    "nro": "8",
    "estado": "LIBRE",
    "precioLista": 8775,
    "precioCuotas": 7488,
    "precioContado": 6903,
    "superficieM2": 5.85
  },
  {
    "id": "BL-BT-9",
    "nivel": "-1 SUB",
    "nro": "9",
    "estado": "VENDIDO",
    "precioLista": 5265,
    "precioCuotas": 4493,
    "precioContado": 4142,
    "superficieM2": 3.51
  },
  {
    "id": "BL-BT-10",
    "nivel": "-1 SUB",
    "nro": "10",
    "estado": "VENDIDO",
    "precioLista": 4440,
    "precioCuotas": 3789,
    "precioContado": 3493,
    "superficieM2": 2.96
  },
  {
    "id": "BL-BT-11",
    "nivel": "-1 SUB",
    "nro": "11",
    "estado": "VENDIDO",
    "precioLista": 7020,
    "precioCuotas": 5990,
    "precioContado": 5522,
    "superficieM2": 4.68
  },
  {
    "id": "BL-BT-12",
    "nivel": "PISO 1",
    "nro": "12",
    "estado": "LIBRE",
    "precioLista": 6225,
    "precioCuotas": 5312,
    "precioContado": 4897,
    "superficieM2": 4.15
  },
  {
    "id": "BL-BT-13",
    "nivel": "PISO 1",
    "nro": "13",
    "estado": "LIBRE",
    "precioLista": 6375,
    "precioCuotas": 5440,
    "precioContado": 5015,
    "superficieM2": 4.25
  },
  {
    "id": "BL-BT-14",
    "nivel": "PISO 2",
    "nro": "14",
    "estado": "LIBRE",
    "precioLista": 6225,
    "precioCuotas": 5312,
    "precioContado": 4897,
    "superficieM2": 4.15
  },
  {
    "id": "BL-BT-15",
    "nivel": "PISO 2",
    "nro": "15",
    "estado": "LIBRE",
    "precioLista": 6375,
    "precioCuotas": 5440,
    "precioContado": 5015,
    "superficieM2": 4.25
  }
];

export const BLESS_TOWER_BASELINE_UNITS: BlessTowerUnit[] = [
  {
    "id": "BT-PISO3-1",
    "codigo": "301",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "U",
    "estado": "LIBRE",
    "precioLista": 103322,
    "precioCuotas": 81570,
    "precioContado": 69987,
    "superficieM2": 54.38,
    "planoUrl": "/bless_tower/modelos_pages/page_13.jpg"
  },
  {
    "id": "BT-PISO3-2",
    "codigo": "302",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "estado": "VENDIDO",
    "precioLista": 66120,
    "precioCuotas": 50582,
    "precioContado": 43540,
    "superficieM2": 33.06,
    "planoUrl": "/bless_tower/modelos_pages/page_2.jpg"
  },
  {
    "id": "BT-PISO3-3",
    "codigo": "303",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "3",
    "tipologia": "Monoambiente",
    "modelo": "C",
    "estado": "VENDIDO",
    "precioLista": 68840,
    "precioCuotas": 52663,
    "precioContado": 45331,
    "superficieM2": 34.42,
    "planoUrl": "/bless_tower/modelos_pages/page_3.jpg"
  },
  {
    "id": "BT-PISO3-4",
    "codigo": "304",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "C",
    "estado": "VENDIDO",
    "precioLista": 68840,
    "precioCuotas": 52663,
    "precioContado": 45331,
    "superficieM2": 34.42,
    "planoUrl": "/bless_tower/modelos_pages/page_3.jpg"
  },
  {
    "id": "BT-PISO3-5",
    "codigo": "305",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "5",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "estado": "VENDIDO",
    "precioLista": 66120,
    "precioCuotas": 50582,
    "precioContado": 43540,
    "superficieM2": 33.06,
    "planoUrl": "/bless_tower/modelos_pages/page_2.jpg"
  },
  {
    "id": "BT-PISO3-6",
    "codigo": "306",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "6",
    "tipologia": "Monoambiente",
    "modelo": "H",
    "estado": "VENDIDO",
    "precioLista": 74380,
    "precioCuotas": 56901,
    "precioContado": 48979,
    "superficieM2": 37.19,
    "planoUrl": "/bless_tower/modelos_pages/page_5.jpg"
  },
  {
    "id": "BT-PISO3-7",
    "codigo": "307",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "7",
    "tipologia": "Monoambiente",
    "modelo": "I",
    "estado": "LIBRE",
    "precioLista": 75600,
    "precioCuotas": 57834,
    "precioContado": 49783,
    "superficieM2": 37.8,
    "planoUrl": "/bless_tower/modelos_pages/page_6.jpg"
  },
  {
    "id": "BT-PISO3-8",
    "codigo": "308",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "8",
    "tipologia": "1 Dormitorio",
    "modelo": "K",
    "estado": "RESERVADO",
    "precioLista": 79040,
    "precioCuotas": 62400,
    "precioContado": 53539,
    "superficieM2": 41.6,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO3-9",
    "codigo": "309",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "9",
    "tipologia": "Monoambiente",
    "modelo": "J",
    "estado": "LIBRE",
    "precioLista": 81020,
    "precioCuotas": 61980,
    "precioContado": 53352,
    "superficieM2": 40.51,
    "planoUrl": "/bless_tower/modelos_pages/page_6.jpg"
  },
  {
    "id": "BT-PISO3-10",
    "codigo": "310",
    "piso": "PISO 3",
    "pisoNumero": 3,
    "nro": "10",
    "tipologia": "Monoambiente",
    "modelo": "E",
    "estado": "LIBRE",
    "precioLista": 72400,
    "precioCuotas": 55386,
    "precioContado": 47675,
    "superficieM2": 36.2,
    "planoUrl": "/bless_tower/modelos_pages/page_4.jpg"
  },
  {
    "id": "BT-PISO4-1",
    "codigo": "401",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "U",
    "estado": "VENDIDO",
    "precioLista": 103322,
    "precioCuotas": 81570,
    "precioContado": 69987,
    "superficieM2": 54.38,
    "planoUrl": "/bless_tower/modelos_pages/page_13.jpg"
  },
  {
    "id": "BT-PISO4-2",
    "codigo": "402",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "estado": "VENDIDO",
    "precioLista": 66120,
    "precioCuotas": 50582,
    "precioContado": 43540,
    "superficieM2": 33.06,
    "planoUrl": "/bless_tower/modelos_pages/page_2.jpg"
  },
  {
    "id": "BT-PISO4-3",
    "codigo": "403",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "3",
    "tipologia": "Monoambiente",
    "modelo": "C",
    "estado": "RESERVADO",
    "precioLista": 68840,
    "precioCuotas": 52663,
    "precioContado": 45331,
    "superficieM2": 34.42,
    "planoUrl": "/bless_tower/modelos_pages/page_3.jpg"
  },
  {
    "id": "BT-PISO4-4",
    "codigo": "404",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "C",
    "estado": "LIBRE",
    "precioLista": 68840,
    "precioCuotas": 52663,
    "precioContado": 45331,
    "superficieM2": 34.42,
    "planoUrl": "/bless_tower/modelos_pages/page_3.jpg"
  },
  {
    "id": "BT-PISO4-5",
    "codigo": "405",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "5",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "estado": "VENDIDO",
    "precioLista": 66120,
    "precioCuotas": 50582,
    "precioContado": 43540,
    "superficieM2": 33.06,
    "planoUrl": "/bless_tower/modelos_pages/page_2.jpg"
  },
  {
    "id": "BT-PISO4-6",
    "codigo": "406",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "6",
    "tipologia": "Monoambiente",
    "modelo": "H",
    "estado": "LIBRE",
    "precioLista": 74380,
    "precioCuotas": 56901,
    "precioContado": 48979,
    "superficieM2": 37.19,
    "planoUrl": "/bless_tower/modelos_pages/page_5.jpg"
  },
  {
    "id": "BT-PISO4-7",
    "codigo": "407",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "7",
    "tipologia": "Monoambiente",
    "modelo": "I",
    "estado": "RESERVADO",
    "precioLista": 75600,
    "precioCuotas": 57834,
    "precioContado": 49783,
    "superficieM2": 37.8,
    "planoUrl": "/bless_tower/modelos_pages/page_6.jpg"
  },
  {
    "id": "BT-PISO4-8",
    "codigo": "408",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "8",
    "tipologia": "1 Dormitorio",
    "modelo": "K",
    "estado": "RESERVADO",
    "precioLista": 79040,
    "precioCuotas": 62400,
    "precioContado": 53539,
    "superficieM2": 41.6,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO4-9",
    "codigo": "409",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "9",
    "tipologia": "Monoambiente",
    "modelo": "J",
    "estado": "VENDIDO",
    "precioLista": 81020,
    "precioCuotas": 61980,
    "precioContado": 53352,
    "superficieM2": 40.51,
    "planoUrl": "/bless_tower/modelos_pages/page_6.jpg"
  },
  {
    "id": "BT-PISO4-10",
    "codigo": "410",
    "piso": "PISO 4",
    "pisoNumero": 4,
    "nro": "10",
    "tipologia": "Monoambiente",
    "modelo": "E",
    "estado": "LIBRE",
    "precioLista": 72400,
    "precioCuotas": 55386,
    "precioContado": 47675,
    "superficieM2": 36.2,
    "planoUrl": "/bless_tower/modelos_pages/page_4.jpg"
  },
  {
    "id": "BT-PISO5-1",
    "codigo": "501",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "U",
    "estado": "LIBRE",
    "precioLista": 103322,
    "precioCuotas": 81570,
    "precioContado": 69987,
    "superficieM2": 54.38,
    "planoUrl": "/bless_tower/modelos_pages/page_13.jpg"
  },
  {
    "id": "BT-PISO5-2",
    "codigo": "502",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "estado": "VENDIDO",
    "precioLista": 66120,
    "precioCuotas": 50582,
    "precioContado": 43540,
    "superficieM2": 33.06,
    "planoUrl": "/bless_tower/modelos_pages/page_2.jpg"
  },
  {
    "id": "BT-PISO5-3",
    "codigo": "503",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "3",
    "tipologia": "Monoambiente",
    "modelo": "C",
    "estado": "LIBRE",
    "precioLista": 68840,
    "precioCuotas": 52663,
    "precioContado": 45331,
    "superficieM2": 34.42,
    "planoUrl": "/bless_tower/modelos_pages/page_3.jpg"
  },
  {
    "id": "BT-PISO5-4",
    "codigo": "504",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "C",
    "estado": "RESERVADO",
    "precioLista": 68840,
    "precioCuotas": 52663,
    "precioContado": 45331,
    "superficieM2": 34.42,
    "planoUrl": "/bless_tower/modelos_pages/page_3.jpg"
  },
  {
    "id": "BT-PISO5-5",
    "codigo": "505",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "5",
    "tipologia": "Monoambiente",
    "modelo": "B",
    "estado": "VENDIDO",
    "precioLista": 66120,
    "precioCuotas": 50582,
    "precioContado": 43540,
    "superficieM2": 33.06,
    "planoUrl": "/bless_tower/modelos_pages/page_2.jpg"
  },
  {
    "id": "BT-PISO5-6",
    "codigo": "506",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "6",
    "tipologia": "Monoambiente",
    "modelo": "H",
    "estado": "RESERVADO",
    "precioLista": 74380,
    "precioCuotas": 56901,
    "precioContado": 48979,
    "superficieM2": 37.19,
    "planoUrl": "/bless_tower/modelos_pages/page_5.jpg"
  },
  {
    "id": "BT-PISO5-7",
    "codigo": "507",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "7",
    "tipologia": "Monoambiente",
    "modelo": "I",
    "estado": "LIBRE",
    "precioLista": 75600,
    "precioCuotas": 57834,
    "precioContado": 49783,
    "superficieM2": 37.8,
    "planoUrl": "/bless_tower/modelos_pages/page_6.jpg"
  },
  {
    "id": "BT-PISO5-8",
    "codigo": "508",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "8",
    "tipologia": "1 Dormitorio",
    "modelo": "K",
    "estado": "LIBRE",
    "precioLista": 79040,
    "precioCuotas": 62400,
    "precioContado": 53539,
    "superficieM2": 41.6,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO5-9",
    "codigo": "509",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "9",
    "tipologia": "Monoambiente",
    "modelo": "J",
    "estado": "VENDIDO",
    "precioLista": 81020,
    "precioCuotas": 61980,
    "precioContado": 53352,
    "superficieM2": 40.51,
    "planoUrl": "/bless_tower/modelos_pages/page_6.jpg"
  },
  {
    "id": "BT-PISO5-10",
    "codigo": "510",
    "piso": "PISO 5",
    "pisoNumero": 5,
    "nro": "10",
    "tipologia": "Monoambiente",
    "modelo": "E",
    "estado": "LIBRE",
    "precioLista": 72400,
    "precioCuotas": 55386,
    "precioContado": 47675,
    "superficieM2": 36.2,
    "planoUrl": "/bless_tower/modelos_pages/page_4.jpg"
  },
  {
    "id": "BT-PISO7-1",
    "codigo": "701",
    "piso": "PISO 7",
    "pisoNumero": 7,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "-",
    "estado": "VENDIDO",
    "precioLista": 0,
    "precioCuotas": 0,
    "precioContado": 0,
    "superficieM2": 0,
    "planoUrl": "/bless_tower/fachada_principal.jpg"
  },
  {
    "id": "BT-PISO7-2",
    "codigo": "702",
    "piso": "PISO 7",
    "pisoNumero": 7,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "-",
    "estado": "VENDIDO",
    "precioLista": 0,
    "precioCuotas": 0,
    "precioContado": 0,
    "superficieM2": 0,
    "planoUrl": "/bless_tower/fachada_principal.jpg"
  },
  {
    "id": "BT-PISO7-3",
    "codigo": "703",
    "piso": "PISO 7",
    "pisoNumero": 7,
    "nro": "3",
    "tipologia": "Monoambiente",
    "modelo": "-",
    "estado": "VENDIDO",
    "precioLista": 0,
    "precioCuotas": 0,
    "precioContado": 0,
    "superficieM2": 0,
    "planoUrl": "/bless_tower/fachada_principal.jpg"
  },
  {
    "id": "BT-PISO7-4",
    "codigo": "704",
    "piso": "PISO 7",
    "pisoNumero": 7,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "F",
    "estado": "VENDIDO",
    "precioLista": 69540,
    "precioCuotas": 53198,
    "precioContado": 45792,
    "superficieM2": 34.77,
    "planoUrl": "/bless_tower/modelos_pages/page_4.jpg"
  },
  {
    "id": "BT-PISO7-5",
    "codigo": "705",
    "piso": "PISO 7",
    "pisoNumero": 7,
    "nro": "5",
    "tipologia": "1 Dormitorio",
    "modelo": "T",
    "estado": "VENDIDO",
    "precioLista": 102030,
    "precioCuotas": 80550,
    "precioContado": 69112,
    "superficieM2": 53.7,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO8-1",
    "codigo": "801",
    "piso": "PISO 8",
    "pisoNumero": 8,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "Q",
    "estado": "LIBRE",
    "precioLista": 96064,
    "precioCuotas": 75840,
    "precioContado": 65071,
    "superficieM2": 50.56,
    "planoUrl": "/bless_tower/modelos_pages/page_11.jpg"
  },
  {
    "id": "BT-PISO8-2",
    "codigo": "802",
    "piso": "PISO 8",
    "pisoNumero": 8,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "G",
    "estado": "VENDIDO",
    "precioLista": 70680,
    "precioCuotas": 54070,
    "precioContado": 46543,
    "superficieM2": 35.34,
    "planoUrl": "/bless_tower/modelos_pages/page_5.jpg"
  },
  {
    "id": "BT-PISO8-3",
    "codigo": "803",
    "piso": "PISO 8",
    "pisoNumero": 8,
    "nro": "3",
    "tipologia": "Monoambiente",
    "modelo": "A",
    "estado": "VENDIDO",
    "precioLista": 65340,
    "precioCuotas": 49985,
    "precioContado": 43026,
    "superficieM2": 32.67,
    "planoUrl": "/bless_tower/modelos_pages/page_2.jpg"
  },
  {
    "id": "BT-PISO8-4",
    "codigo": "804",
    "piso": "PISO 8",
    "pisoNumero": 8,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "F",
    "estado": "VENDIDO",
    "precioLista": 69540,
    "precioCuotas": 53198,
    "precioContado": 45792,
    "superficieM2": 34.77,
    "planoUrl": "/bless_tower/modelos_pages/page_4.jpg"
  },
  {
    "id": "BT-PISO8-5",
    "codigo": "805",
    "piso": "PISO 8",
    "pisoNumero": 8,
    "nro": "5",
    "tipologia": "1 Dormitorio",
    "modelo": "T",
    "estado": "VENDIDO",
    "precioLista": 102030,
    "precioCuotas": 80550,
    "precioContado": 69112,
    "superficieM2": 53.7,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO9-1",
    "codigo": "901",
    "piso": "PISO 9",
    "pisoNumero": 9,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "Q",
    "estado": "LIBRE",
    "precioLista": 96064,
    "precioCuotas": 75840,
    "precioContado": 65071,
    "superficieM2": 50.56,
    "planoUrl": "/bless_tower/modelos_pages/page_11.jpg"
  },
  {
    "id": "BT-PISO9-2",
    "codigo": "902",
    "piso": "PISO 9",
    "pisoNumero": 9,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "G",
    "estado": "LIBRE",
    "precioLista": 70680,
    "precioCuotas": 54070,
    "precioContado": 46543,
    "superficieM2": 35.34,
    "planoUrl": "/bless_tower/modelos_pages/page_5.jpg"
  },
  {
    "id": "BT-PISO9-3",
    "codigo": "903",
    "piso": "PISO 9",
    "pisoNumero": 9,
    "nro": "3",
    "tipologia": "Monoambiente",
    "modelo": "A",
    "estado": "VENDIDO",
    "precioLista": 65340,
    "precioCuotas": 49985,
    "precioContado": 43026,
    "superficieM2": 32.67,
    "planoUrl": "/bless_tower/modelos_pages/page_2.jpg"
  },
  {
    "id": "BT-PISO9-4",
    "codigo": "904",
    "piso": "PISO 9",
    "pisoNumero": 9,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "F",
    "estado": "VENDIDO",
    "precioLista": 69540,
    "precioCuotas": 53198,
    "precioContado": 45792,
    "superficieM2": 34.77,
    "planoUrl": "/bless_tower/modelos_pages/page_4.jpg"
  },
  {
    "id": "BT-PISO9-5",
    "codigo": "905",
    "piso": "PISO 9",
    "pisoNumero": 9,
    "nro": "5",
    "tipologia": "1 Dormitorio",
    "modelo": "T",
    "estado": "VENDIDO",
    "precioLista": 102030,
    "precioCuotas": 80550,
    "precioContado": 69112,
    "superficieM2": 53.7,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO10-1",
    "codigo": "1001",
    "piso": "PISO 10",
    "pisoNumero": 10,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "Q",
    "estado": "LIBRE",
    "precioLista": 96064,
    "precioCuotas": 75840,
    "precioContado": 65071,
    "superficieM2": 50.56,
    "planoUrl": "/bless_tower/modelos_pages/page_11.jpg"
  },
  {
    "id": "BT-PISO10-2",
    "codigo": "1002",
    "piso": "PISO 10",
    "pisoNumero": 10,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "G",
    "estado": "VENDIDO",
    "precioLista": 70680,
    "precioCuotas": 54070,
    "precioContado": 46543,
    "superficieM2": 35.34,
    "planoUrl": "/bless_tower/modelos_pages/page_5.jpg"
  },
  {
    "id": "BT-PISO10-3",
    "codigo": "1003",
    "piso": "PISO 10",
    "pisoNumero": 10,
    "nro": "3",
    "tipologia": "Monoambiente",
    "modelo": "A",
    "estado": "VENDIDO",
    "precioLista": 65340,
    "precioCuotas": 49985,
    "precioContado": 43026,
    "superficieM2": 32.67,
    "planoUrl": "/bless_tower/modelos_pages/page_2.jpg"
  },
  {
    "id": "BT-PISO10-4",
    "codigo": "1004",
    "piso": "PISO 10",
    "pisoNumero": 10,
    "nro": "4",
    "tipologia": "Monoambiente",
    "modelo": "F",
    "estado": "VENDIDO",
    "precioLista": 69540,
    "precioCuotas": 53198,
    "precioContado": 45792,
    "superficieM2": 34.77,
    "planoUrl": "/bless_tower/modelos_pages/page_4.jpg"
  },
  {
    "id": "BT-PISO10-5",
    "codigo": "1005",
    "piso": "PISO 10",
    "pisoNumero": 10,
    "nro": "5",
    "tipologia": "1 Dormitorio",
    "modelo": "T",
    "estado": "VENDIDO",
    "precioLista": 102030,
    "precioCuotas": 80550,
    "precioContado": 69112,
    "superficieM2": 53.7,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO11-1",
    "codigo": "1101",
    "piso": "PISO 11",
    "pisoNumero": 11,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "W",
    "estado": "VENDIDO",
    "precioLista": 120061,
    "precioCuotas": 94785,
    "precioContado": 81326,
    "superficieM2": 63.19,
    "planoUrl": "/bless_tower/modelos_pages/page_14.jpg"
  },
  {
    "id": "BT-PISO11-2",
    "codigo": "1102",
    "piso": "PISO 11",
    "pisoNumero": 11,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO11-3",
    "codigo": "1103",
    "piso": "PISO 11",
    "pisoNumero": 11,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "N",
    "estado": "VENDIDO",
    "precioLista": 80560,
    "precioCuotas": 63600,
    "precioContado": 54569,
    "superficieM2": 42.4,
    "planoUrl": "/bless_tower/modelos_pages/page_9.jpg"
  },
  {
    "id": "BT-PISO11-4",
    "codigo": "1104",
    "piso": "PISO 11",
    "pisoNumero": 11,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "V",
    "estado": "VENDIDO",
    "precioLista": 106343,
    "precioCuotas": 83955,
    "precioContado": 72033,
    "superficieM2": 55.97,
    "planoUrl": "/bless_tower/modelos_pages/page_13.jpg"
  },
  {
    "id": "BT-PISO12-1",
    "codigo": "1201",
    "piso": "PISO 12",
    "pisoNumero": 12,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "W",
    "estado": "VENDIDO",
    "precioLista": 120061,
    "precioCuotas": 94785,
    "precioContado": 81326,
    "superficieM2": 63.19,
    "planoUrl": "/bless_tower/modelos_pages/page_14.jpg"
  },
  {
    "id": "BT-PISO12-2",
    "codigo": "1202",
    "piso": "PISO 12",
    "pisoNumero": 12,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO12-3",
    "codigo": "1203",
    "piso": "PISO 12",
    "pisoNumero": 12,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "N",
    "estado": "VENDIDO",
    "precioLista": 80560,
    "precioCuotas": 63600,
    "precioContado": 54569,
    "superficieM2": 42.4,
    "planoUrl": "/bless_tower/modelos_pages/page_9.jpg"
  },
  {
    "id": "BT-PISO12-4",
    "codigo": "1204",
    "piso": "PISO 12",
    "pisoNumero": 12,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "V",
    "estado": "VENDIDO",
    "precioLista": 106343,
    "precioCuotas": 83955,
    "precioContado": 72033,
    "superficieM2": 55.97,
    "planoUrl": "/bless_tower/modelos_pages/page_13.jpg"
  },
  {
    "id": "BT-PISO13-1",
    "codigo": "1301",
    "piso": "PISO 13",
    "pisoNumero": 13,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "W",
    "estado": "VENDIDO",
    "precioLista": 120061,
    "precioCuotas": 94785,
    "precioContado": 81326,
    "superficieM2": 63.19,
    "planoUrl": "/bless_tower/modelos_pages/page_14.jpg"
  },
  {
    "id": "BT-PISO13-2",
    "codigo": "1302",
    "piso": "PISO 13",
    "pisoNumero": 13,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO13-3",
    "codigo": "1303",
    "piso": "PISO 13",
    "pisoNumero": 13,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "N",
    "estado": "VENDIDO",
    "precioLista": 80560,
    "precioCuotas": 63600,
    "precioContado": 54569,
    "superficieM2": 42.4,
    "planoUrl": "/bless_tower/modelos_pages/page_9.jpg"
  },
  {
    "id": "BT-PISO13-4",
    "codigo": "1304",
    "piso": "PISO 13",
    "pisoNumero": 13,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "V",
    "estado": "VENDIDO",
    "precioLista": 106343,
    "precioCuotas": 83955,
    "precioContado": 72033,
    "superficieM2": 55.97,
    "planoUrl": "/bless_tower/modelos_pages/page_13.jpg"
  },
  {
    "id": "BT-PISO14-1",
    "codigo": "1401",
    "piso": "PISO 14",
    "pisoNumero": 14,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "S",
    "estado": "LIBRE",
    "precioLista": 97432,
    "precioCuotas": 76920,
    "precioContado": 65997,
    "superficieM2": 51.28,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO14-2",
    "codigo": "1402",
    "piso": "PISO 14",
    "pisoNumero": 14,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO14-3",
    "codigo": "1403",
    "piso": "PISO 14",
    "pisoNumero": 14,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "L",
    "estado": "VENDIDO",
    "precioLista": 79591,
    "precioCuotas": 62835,
    "precioContado": 53912,
    "superficieM2": 41.89,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO14-4",
    "codigo": "1404",
    "piso": "PISO 14",
    "pisoNumero": 14,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "P",
    "estado": "RESERVADO",
    "precioLista": 91143,
    "precioCuotas": 71955,
    "precioContado": 61737,
    "superficieM2": 47.97,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO15-1",
    "codigo": "1501",
    "piso": "PISO 15",
    "pisoNumero": 15,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "S",
    "estado": "LIBRE",
    "precioLista": 97432,
    "precioCuotas": 76920,
    "precioContado": 65997,
    "superficieM2": 51.28,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO15-2",
    "codigo": "1502",
    "piso": "PISO 15",
    "pisoNumero": 15,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO15-3",
    "codigo": "1503",
    "piso": "PISO 15",
    "pisoNumero": 15,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "L",
    "estado": "VENDIDO",
    "precioLista": 79591,
    "precioCuotas": 62835,
    "precioContado": 53912,
    "superficieM2": 41.89,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO15-4",
    "codigo": "1504",
    "piso": "PISO 15",
    "pisoNumero": 15,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "P",
    "estado": "RESERVADO",
    "precioLista": 91143,
    "precioCuotas": 71955,
    "precioContado": 61737,
    "superficieM2": 47.97,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO16-1",
    "codigo": "1601",
    "piso": "PISO 16",
    "pisoNumero": 16,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "S",
    "estado": "LIBRE",
    "precioLista": 97432,
    "precioCuotas": 76920,
    "precioContado": 65997,
    "superficieM2": 51.28,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO16-2",
    "codigo": "1602",
    "piso": "PISO 16",
    "pisoNumero": 16,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO16-3",
    "codigo": "1603",
    "piso": "PISO 16",
    "pisoNumero": 16,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "L",
    "estado": "VENDIDO",
    "precioLista": 79591,
    "precioCuotas": 62835,
    "precioContado": 53912,
    "superficieM2": 41.89,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO16-4",
    "codigo": "1604",
    "piso": "PISO 16",
    "pisoNumero": 16,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "P",
    "estado": "LIBRE",
    "precioLista": 91143,
    "precioCuotas": 71955,
    "precioContado": 61737,
    "superficieM2": 47.97,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO17-1",
    "codigo": "1701",
    "piso": "PISO 17",
    "pisoNumero": 17,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "S",
    "estado": "LIBRE",
    "precioLista": 97432,
    "precioCuotas": 76920,
    "precioContado": 65997,
    "superficieM2": 51.28,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO17-2",
    "codigo": "1702",
    "piso": "PISO 17",
    "pisoNumero": 17,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO17-3",
    "codigo": "1703",
    "piso": "PISO 17",
    "pisoNumero": 17,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "L",
    "estado": "RESERVADO",
    "precioLista": 79591,
    "precioCuotas": 62835,
    "precioContado": 53912,
    "superficieM2": 41.89,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO17-4",
    "codigo": "1704",
    "piso": "PISO 17",
    "pisoNumero": 17,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "P",
    "estado": "LIBRE",
    "precioLista": 91143,
    "precioCuotas": 71955,
    "precioContado": 61737,
    "superficieM2": 47.97,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO18-1",
    "codigo": "1801",
    "piso": "PISO 18",
    "pisoNumero": 18,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "S",
    "estado": "LIBRE",
    "precioLista": 97432,
    "precioCuotas": 76920,
    "precioContado": 65997,
    "superficieM2": 51.28,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO18-2",
    "codigo": "1802",
    "piso": "PISO 18",
    "pisoNumero": 18,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO18-3",
    "codigo": "1803",
    "piso": "PISO 18",
    "pisoNumero": 18,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "L",
    "estado": "VENDIDO",
    "precioLista": 79591,
    "precioCuotas": 62835,
    "precioContado": 53912,
    "superficieM2": 41.89,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO18-4",
    "codigo": "1804",
    "piso": "PISO 18",
    "pisoNumero": 18,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "P",
    "estado": "LIBRE",
    "precioLista": 91143,
    "precioCuotas": 71955,
    "precioContado": 61737,
    "superficieM2": 47.97,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO19-1",
    "codigo": "1901",
    "piso": "PISO 19",
    "pisoNumero": 19,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "S",
    "estado": "LIBRE",
    "precioLista": 97432,
    "precioCuotas": 76920,
    "precioContado": 65997,
    "superficieM2": 51.28,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO19-2",
    "codigo": "1902",
    "piso": "PISO 19",
    "pisoNumero": 19,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO19-3",
    "codigo": "1903",
    "piso": "PISO 19",
    "pisoNumero": 19,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "L",
    "estado": "VENDIDO",
    "precioLista": 79591,
    "precioCuotas": 62835,
    "precioContado": 53912,
    "superficieM2": 41.89,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO19-4",
    "codigo": "1904",
    "piso": "PISO 19",
    "pisoNumero": 19,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "P",
    "estado": "LIBRE",
    "precioLista": 91143,
    "precioCuotas": 71955,
    "precioContado": 61737,
    "superficieM2": 47.97,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO20-1",
    "codigo": "2001",
    "piso": "PISO 20",
    "pisoNumero": 20,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "S",
    "estado": "LIBRE",
    "precioLista": 97432,
    "precioCuotas": 76920,
    "precioContado": 65997,
    "superficieM2": 51.28,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO20-2",
    "codigo": "2002",
    "piso": "PISO 20",
    "pisoNumero": 20,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO20-3",
    "codigo": "2003",
    "piso": "PISO 20",
    "pisoNumero": 20,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "L",
    "estado": "VENDIDO",
    "precioLista": 79591,
    "precioCuotas": 62835,
    "precioContado": 53912,
    "superficieM2": 41.89,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO20-4",
    "codigo": "2004",
    "piso": "PISO 20",
    "pisoNumero": 20,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "P",
    "estado": "VENDIDO",
    "precioLista": 91143,
    "precioCuotas": 71955,
    "precioContado": 61737,
    "superficieM2": 47.97,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO21-1",
    "codigo": "2101",
    "piso": "PISO 21",
    "pisoNumero": 21,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "S",
    "estado": "VENDIDO",
    "precioLista": 97432,
    "precioCuotas": 76920,
    "precioContado": 65997,
    "superficieM2": 51.28,
    "planoUrl": "/bless_tower/modelos_pages/page_12.jpg"
  },
  {
    "id": "BT-PISO21-2",
    "codigo": "2102",
    "piso": "PISO 21",
    "pisoNumero": 21,
    "nro": "2",
    "tipologia": "1 Dormitorio",
    "modelo": "O",
    "estado": "VENDIDO",
    "precioLista": 87419,
    "precioCuotas": 69015,
    "precioContado": 59215,
    "superficieM2": 46.01,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO21-3",
    "codigo": "2103",
    "piso": "PISO 21",
    "pisoNumero": 21,
    "nro": "3",
    "tipologia": "1 Dormitorio",
    "modelo": "L",
    "estado": "VENDIDO",
    "precioLista": 79591,
    "precioCuotas": 62835,
    "precioContado": 53912,
    "superficieM2": 41.89,
    "planoUrl": "/bless_tower/modelos_pages/page_8.jpg"
  },
  {
    "id": "BT-PISO21-4",
    "codigo": "2104",
    "piso": "PISO 21",
    "pisoNumero": 21,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "P",
    "estado": "VENDIDO",
    "precioLista": 91143,
    "precioCuotas": 71955,
    "precioContado": 61737,
    "superficieM2": 47.97,
    "planoUrl": "/bless_tower/modelos_pages/page_10.jpg"
  },
  {
    "id": "BT-PISO22-1",
    "codigo": "2201",
    "piso": "PISO 22",
    "pisoNumero": 22,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "R",
    "estado": "LIBRE",
    "precioLista": 100434,
    "precioCuotas": 79290,
    "precioContado": 68031,
    "superficieM2": 52.86,
    "planoUrl": "/bless_tower/modelos_pages/page_11.jpg"
  },
  {
    "id": "BT-PISO22-2",
    "codigo": "2202",
    "piso": "PISO 22",
    "pisoNumero": 22,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "D",
    "estado": "VENDIDO",
    "precioLista": 69200,
    "precioCuotas": 52938,
    "precioContado": 45568,
    "superficieM2": 34.6,
    "planoUrl": "/bless_tower/modelos_pages/page_3.jpg"
  },
  {
    "id": "BT-PISO22-3",
    "codigo": "2203",
    "piso": "PISO 22",
    "pisoNumero": 22,
    "nro": "3",
    "tipologia": "Monoambiente",
    "modelo": "D",
    "estado": "VENDIDO",
    "precioLista": 69200,
    "precioCuotas": 52938,
    "precioContado": 45568,
    "superficieM2": 34.6,
    "planoUrl": "/bless_tower/modelos_pages/page_3.jpg"
  },
  {
    "id": "BT-PISO22-4",
    "codigo": "2204",
    "piso": "PISO 22",
    "pisoNumero": 22,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "M",
    "estado": "VENDIDO",
    "precioLista": 80275,
    "precioCuotas": 63375,
    "precioContado": 54376,
    "superficieM2": 42.25,
    "planoUrl": "/bless_tower/modelos_pages/page_9.jpg"
  },
  {
    "id": "BT-PISO23-1",
    "codigo": "2301",
    "piso": "PISO 23",
    "pisoNumero": 23,
    "nro": "1",
    "tipologia": "1 Dormitorio",
    "modelo": "R",
    "estado": "RESERVADO",
    "precioLista": 100434,
    "precioCuotas": 79290,
    "precioContado": 68031,
    "superficieM2": 52.86,
    "planoUrl": "/bless_tower/modelos_pages/page_11.jpg"
  },
  {
    "id": "BT-PISO23-2",
    "codigo": "2302",
    "piso": "PISO 23",
    "pisoNumero": 23,
    "nro": "2",
    "tipologia": "Monoambiente",
    "modelo": "D",
    "estado": "VENDIDO",
    "precioLista": 69200,
    "precioCuotas": 52938,
    "precioContado": 45568,
    "superficieM2": 34.6,
    "planoUrl": "/bless_tower/modelos_pages/page_3.jpg"
  },
  {
    "id": "BT-PISO23-3",
    "codigo": "2303",
    "piso": "PISO 23",
    "pisoNumero": 23,
    "nro": "3",
    "tipologia": "Monoambiente",
    "modelo": "D",
    "estado": "VENDIDO",
    "precioLista": 69200,
    "precioCuotas": 52938,
    "precioContado": 45568,
    "superficieM2": 34.6,
    "planoUrl": "/bless_tower/modelos_pages/page_3.jpg"
  },
  {
    "id": "BT-PISO23-4",
    "codigo": "2304",
    "piso": "PISO 23",
    "pisoNumero": 23,
    "nro": "4",
    "tipologia": "1 Dormitorio",
    "modelo": "M",
    "estado": "VENDIDO",
    "precioLista": 80275,
    "precioCuotas": 63375,
    "precioContado": 54376,
    "superficieM2": 42.25,
    "planoUrl": "/bless_tower/modelos_pages/page_9.jpg"
  },
  {
    "id": "BT-PISO24-1",
    "codigo": "2401",
    "piso": "PISO 24",
    "pisoNumero": 24,
    "nro": "1",
    "tipologia": "2 Dormitorios",
    "modelo": "Y",
    "estado": "VENDIDO",
    "precioLista": 166174,
    "precioCuotas": 131190,
    "precioContado": 112561,
    "superficieM2": 87.46,
    "planoUrl": "/bless_tower/modelos_pages/page_16.jpg"
  },
  {
    "id": "BT-PISO24-2",
    "codigo": "2402",
    "piso": "PISO 24",
    "pisoNumero": 24,
    "nro": "2",
    "tipologia": "2 Dormitorios",
    "modelo": "X",
    "estado": "VENDIDO",
    "precioLista": 145255,
    "precioCuotas": 114675,
    "precioContado": 98391,
    "superficieM2": 76.45,
    "planoUrl": "/bless_tower/modelos_pages/page_16.jpg"
  },
  {
    "id": "BT-PISO25-1",
    "codigo": "2501",
    "piso": "PISO 25",
    "pisoNumero": 25,
    "nro": "1",
    "tipologia": "2 Dormitorios",
    "modelo": "Y",
    "estado": "VENDIDO",
    "precioLista": 166174,
    "precioCuotas": 131190,
    "precioContado": 112561,
    "superficieM2": 87.46,
    "planoUrl": "/bless_tower/modelos_pages/page_16.jpg"
  },
  {
    "id": "BT-PISO25-2",
    "codigo": "2502",
    "piso": "PISO 25",
    "pisoNumero": 25,
    "nro": "2",
    "tipologia": "2 Dormitorios",
    "modelo": "X",
    "estado": "VENDIDO",
    "precioLista": 145255,
    "precioCuotas": 114675,
    "precioContado": 98391,
    "superficieM2": 76.45,
    "planoUrl": "/bless_tower/modelos_pages/page_16.jpg"
  },
  {
    "id": "BT-PISO26-1",
    "codigo": "2601",
    "piso": "PISO 26",
    "pisoNumero": 26,
    "nro": "1",
    "tipologia": "2 Dormitorios",
    "modelo": "Y",
    "estado": "VENDIDO",
    "precioLista": 166174,
    "precioCuotas": 136438,
    "precioContado": 117809,
    "superficieM2": 87.46,
    "planoUrl": "/bless_tower/modelos_pages/page_16.jpg"
  },
  {
    "id": "BT-PISO26-2",
    "codigo": "2602",
    "piso": "PISO 26",
    "pisoNumero": 26,
    "nro": "2",
    "tipologia": "2 Dormitorios",
    "modelo": "X",
    "estado": "LIBRE",
    "precioLista": 0,
    "precioCuotas": 119262,
    "precioContado": 102978,
    "superficieM2": 76.45,
    "planoUrl": "/bless_tower/modelos_pages/page_16.jpg"
  },
  {
    "id": "BT-PISO27-1",
    "codigo": "2701",
    "piso": "PISO 27",
    "pisoNumero": 27,
    "nro": "1",
    "tipologia": "2 Dormitorios",
    "modelo": "Y",
    "estado": "RESERVADO",
    "precioLista": 166174,
    "precioCuotas": 136438,
    "precioContado": 117809,
    "superficieM2": 87.46,
    "planoUrl": "/bless_tower/modelos_pages/page_16.jpg"
  },
  {
    "id": "BT-PISO27-2",
    "codigo": "2702",
    "piso": "PISO 27",
    "pisoNumero": 27,
    "nro": "2",
    "tipologia": "2 Dormitorios",
    "modelo": "X",
    "estado": "LIBRE",
    "precioLista": 0,
    "precioCuotas": 119262,
    "precioContado": 102978,
    "superficieM2": 76.45,
    "planoUrl": "/bless_tower/modelos_pages/page_16.jpg"
  }
];

export function parseBlessTowerCsv(csv: string): BlessTowerUnit[] {
  const lines = csv.split(/\r?\n/);
  const units: BlessTowerUnit[] = [];
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
    if (nivelCol && (nivelCol.startsWith("PISO") || nivelCol.startsWith("-1") || nivelCol.startsWith("PB"))) {
      currentPiso = nivelCol;
    }

    const modelo = clean(rawCols[1]);
    const modLetter = clean(rawCols[2]);
    const nro = clean(rawCols[3]);
    const estadoRaw = clean(rawCols[4]).toUpperCase();
    const precioListaStr = clean(rawCols[5]);
    const precioCuotasStr = clean(rawCols[6]);
    const precioContadoStr = clean(rawCols[7]);
    const superficieStr = clean(rawCols[8]);

    const num = (str: string) => {
      if (!str) return 0;
      const cleanStr = str.replace(/[^\d.]/g, "");
      return parseFloat(cleanStr) || 0;
    };

    if (modelo.includes("MONOAMBIENTE") || modelo.includes("DORMITORIO")) {
      const tipologia: "Monoambiente" | "1 Dormitorio" | "2 Dormitorios" =
        modelo.includes("MONOAMBIENTE") ? "Monoambiente" :
        modelo.includes("2 DORMITORIO") ? "2 Dormitorios" : "1 Dormitorio";

      const pisoNum = parseInt((currentPiso || "").replace(/[^\d]/g, ""), 10) || 0;
      const unitCode = `${pisoNum}${nro.padStart(2, "0")}`;
      const estado: "LIBRE" | "RESERVADO" | "VENDIDO" =
        estadoRaw === "VENDIDO" ? "VENDIDO" : estadoRaw === "RESERVADO" ? "RESERVADO" : "LIBRE";

      const pLista = num(precioListaStr);
      const pCuotas = num(precioCuotasStr);
      const pContado = num(precioContadoStr);
      const sup = num(superficieStr);

      const mKey = modLetter || modelo;
      units.push({
        id: `BT-${currentPiso.replace(/\s+/g, "")}-${nro}`,
        codigo: unitCode,
        piso: currentPiso,
        pisoNumero: pisoNum,
        nro,
        tipologia,
        modelo: mKey,
        estado,
        precioLista: pLista,
        precioCuotas: pCuotas,
        precioContado: pContado,
        superficieM2: sup,
        planoUrl: BLESS_TOWER_PLANO_MAP[mKey] || "/bless_tower/fachada_principal.jpg"
      });
    }
  }

  return units.length > 0 ? units : BLESS_TOWER_BASELINE_UNITS;
}

export async function fetchBlessTowerLiveUnits(): Promise<BlessTowerUnit[]> {
  try {
    const res = await fetch(BLESS_TOWER_CONFIG.sheetCsvUrl, { cache: "no-cache" });
    if (res.ok) {
      const csv = await res.text();
      const parsed = parseBlessTowerCsv(csv);
      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("[BlessTower] Fallback a JSON estatico por error en live CSV:", err);
  }

  try {
    const res = await fetch("/bless-tower-inventory.json");
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) return json;
    }
  } catch (err) {
    console.warn("[BlessTower] Fallback a baseline units:", err);
  }

  return BLESS_TOWER_BASELINE_UNITS;
}
