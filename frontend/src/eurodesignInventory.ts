/* Generated baseline and live sync for Tower Eurodesign.
 * Google Sheet Live URL: https://docs.google.com/spreadsheets/d/1Q_xIcd1ta6cac89jDJdYgm87l0saHrBzbtxay32_SMA/export?format=csv
 * Last synchronized baseline: 2026-10-20T02:05:30.479Z
 */

export interface EurodesignCuotasPlan {
  perM2: number;
  total: number;
  initial40: number;
  cuota20: number;
  balance40: number;
}

export interface EurodesignUnit {
  floor: number;
  floorLabel: string;
  unitNumber: string;
  tipoLabel: string;
  rooms: number;
  areaM2: number;
  status: "disponible" | "vendido" | "reservado";
  cashPerM2: number;
  cashTotal: number;
  cuotas: EurodesignCuotasPlan;
}

export const EURODESIGN_NAME = "Tower Eurodesign";
export const EURODESIGN_ZONE = "Equipetrol";
export const EURODESIGN_ADDRESS = "Calle Enrique Finot esq. La Plata / 9 Oeste, Equipetrol Norte";
export const EURODESIGN_CITY = "Santa Cruz de la Sierra";
export const EURODESIGN_DELIVERY = "Junio 2027";
export const EURODESIGN_CONSTRUCTION_STATUS = "Obra gruesa al 100% en loza piso 18 (visitas a obra martes y viernes)";
export const EURODESIGN_PARKING_USD = 12500;
export const EURODESIGN_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/1Q_xIcd1ta6cac89jDJdYgm87l0saHrBzbtxay32_SMA/export?format=csv";

export function formatEurodesignUsd(val: number): string {
  return Math.round(val).toLocaleString("es-BO");
}

export const EURODESIGN_UNITS: EurodesignUnit[] = [
  {
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "401",
    "tipoLabel": "2 dorm / 81.2m2",
    "rooms": 2,
    "areaM2": 81.2,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 120176,
    "cuotas": {
      "perM2": 1580,
      "total": 128296,
      "initial40": 51318,
      "cuota20": 25659,
      "balance40": 51319
    }
  },
  {
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "402",
    "tipoLabel": "2 dorm / 128.5m2",
    "rooms": 2,
    "areaM2": 128.5,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 190180,
    "cuotas": {
      "perM2": 1580,
      "total": 203030,
      "initial40": 81212,
      "cuota20": 40606,
      "balance40": 81212
    }
  },
  {
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "403",
    "tipoLabel": "1 dorm / 92.2m2",
    "rooms": 1,
    "areaM2": 92.2,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 136456,
    "cuotas": {
      "perM2": 1580,
      "total": 145676,
      "initial40": 58270,
      "cuota20": 29135,
      "balance40": 58271
    }
  },
  {
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "404",
    "tipoLabel": "1 dorm / 92.8m2",
    "rooms": 1,
    "areaM2": 92.8,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 137344,
    "cuotas": {
      "perM2": 1580,
      "total": 146624,
      "initial40": 58650,
      "cuota20": 29325,
      "balance40": 58649
    }
  },
  {
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "405",
    "tipoLabel": "1 dorm / 58m2",
    "rooms": 1,
    "areaM2": 58,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 85840,
    "cuotas": {
      "perM2": 1580,
      "total": 91640,
      "initial40": 36656,
      "cuota20": 18328,
      "balance40": 36656
    }
  },
  {
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "406",
    "tipoLabel": "1 dorm / 97.6m2",
    "rooms": 1,
    "areaM2": 97.6,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 144448,
    "cuotas": {
      "perM2": 1580,
      "total": 154208,
      "initial40": 61683,
      "cuota20": 30842,
      "balance40": 61683
    }
  },
  {
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "407",
    "tipoLabel": "1 dorm / 64m2",
    "rooms": 1,
    "areaM2": 64,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 94720,
    "cuotas": {
      "perM2": 1580,
      "total": 101120,
      "initial40": 40448,
      "cuota20": 20224,
      "balance40": 40448
    }
  },
  {
    "floor": 4,
    "floorLabel": "Piso 4",
    "unitNumber": "408",
    "tipoLabel": "2 dorm / 100m2",
    "rooms": 2,
    "areaM2": 100,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 148000,
    "cuotas": {
      "perM2": 1580,
      "total": 158000,
      "initial40": 63200,
      "cuota20": 31600,
      "balance40": 63200
    }
  },
  {
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "501",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "502",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "503",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "504",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "505",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "506",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "507",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 5,
    "floorLabel": "Piso 5",
    "unitNumber": "508",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "601",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "602",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "603",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "604",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "605",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "606",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "607",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 6,
    "floorLabel": "Piso 6",
    "unitNumber": "608",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "701",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "702",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "703",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "704",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "705",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "706",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "707",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 7,
    "floorLabel": "Piso 7",
    "unitNumber": "708",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "801",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "802",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "803",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "804",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "805",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "806",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "807",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 8,
    "floorLabel": "Piso 8",
    "unitNumber": "808",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "901",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "902",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "903",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "904",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "905",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "906",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "907",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 9,
    "floorLabel": "Piso 9",
    "unitNumber": "908",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1001",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1002",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1003",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1004",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1005",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1006",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1007",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 10,
    "floorLabel": "Piso 10",
    "unitNumber": "1008",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1101",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1102",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1103",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1104",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1105",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1106",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1107",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 11,
    "floorLabel": "Piso 11",
    "unitNumber": "1108",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 12,
    "floorLabel": "Piso 12",
    "unitNumber": "1201",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 12,
    "floorLabel": "Piso 12",
    "unitNumber": "1202",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 12,
    "floorLabel": "Piso 12",
    "unitNumber": "1203",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 12,
    "floorLabel": "Piso 12",
    "unitNumber": "1204",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 12,
    "floorLabel": "Piso 12",
    "unitNumber": "1205",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 12,
    "floorLabel": "Piso 12",
    "unitNumber": "1206",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 12,
    "floorLabel": "Piso 12",
    "unitNumber": "1207",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 12,
    "floorLabel": "Piso 12",
    "unitNumber": "1208",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1301",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1302",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1303",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1304",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1305",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1306",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1307",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 13,
    "floorLabel": "Piso 13",
    "unitNumber": "1308",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 14,
    "floorLabel": "Piso 14",
    "unitNumber": "1401",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 14,
    "floorLabel": "Piso 14",
    "unitNumber": "1402",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 14,
    "floorLabel": "Piso 14",
    "unitNumber": "1403",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 14,
    "floorLabel": "Piso 14",
    "unitNumber": "1404",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 14,
    "floorLabel": "Piso 14",
    "unitNumber": "1405",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 14,
    "floorLabel": "Piso 14",
    "unitNumber": "1406",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 14,
    "floorLabel": "Piso 14",
    "unitNumber": "1407",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 14,
    "floorLabel": "Piso 14",
    "unitNumber": "1408",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 15,
    "floorLabel": "Piso 15",
    "unitNumber": "1501",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 15,
    "floorLabel": "Piso 15",
    "unitNumber": "1502",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 15,
    "floorLabel": "Piso 15",
    "unitNumber": "1503",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 15,
    "floorLabel": "Piso 15",
    "unitNumber": "1504",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 15,
    "floorLabel": "Piso 15",
    "unitNumber": "1505",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 15,
    "floorLabel": "Piso 15",
    "unitNumber": "1506",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 15,
    "floorLabel": "Piso 15",
    "unitNumber": "1507",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "reservado",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 15,
    "floorLabel": "Piso 15",
    "unitNumber": "1508",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "disponible",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 16,
    "floorLabel": "Piso 16",
    "unitNumber": "1601",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 16,
    "floorLabel": "Piso 16",
    "unitNumber": "1602",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 16,
    "floorLabel": "Piso 16",
    "unitNumber": "1603",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 16,
    "floorLabel": "Piso 16",
    "unitNumber": "1604",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 16,
    "floorLabel": "Piso 16",
    "unitNumber": "1605",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 16,
    "floorLabel": "Piso 16",
    "unitNumber": "1606",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 16,
    "floorLabel": "Piso 16",
    "unitNumber": "1607",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 16,
    "floorLabel": "Piso 16",
    "unitNumber": "1608",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 17,
    "floorLabel": "Piso 17",
    "unitNumber": "1701",
    "tipoLabel": "2 dorm / 82m2",
    "rooms": 2,
    "areaM2": 82,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 121360,
    "cuotas": {
      "perM2": 1580,
      "total": 129560,
      "initial40": 51824,
      "cuota20": 25912,
      "balance40": 51824
    }
  },
  {
    "floor": 17,
    "floorLabel": "Piso 17",
    "unitNumber": "1702",
    "tipoLabel": "2 dorm / 84.3m2",
    "rooms": 2,
    "areaM2": 84.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 124764,
    "cuotas": {
      "perM2": 1580,
      "total": 133194,
      "initial40": 53278,
      "cuota20": 26639,
      "balance40": 53277
    }
  },
  {
    "floor": 17,
    "floorLabel": "Piso 17",
    "unitNumber": "1703",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 17,
    "floorLabel": "Piso 17",
    "unitNumber": "1704",
    "tipoLabel": "1 dorm / 48.5m2",
    "rooms": 1,
    "areaM2": 48.5,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71780,
    "cuotas": {
      "perM2": 1580,
      "total": 76630,
      "initial40": 30652,
      "cuota20": 15326,
      "balance40": 30652
    }
  },
  {
    "floor": 17,
    "floorLabel": "Piso 17",
    "unitNumber": "1705",
    "tipoLabel": "1 dorm / 35m2",
    "rooms": 1,
    "areaM2": 35,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 51800,
    "cuotas": {
      "perM2": 1580,
      "total": 55300,
      "initial40": 22120,
      "cuota20": 11060,
      "balance40": 22120
    }
  },
  {
    "floor": 17,
    "floorLabel": "Piso 17",
    "unitNumber": "1706",
    "tipoLabel": "1 dorm / 48.3m2",
    "rooms": 1,
    "areaM2": 48.3,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 71484,
    "cuotas": {
      "perM2": 1580,
      "total": 76314,
      "initial40": 30526,
      "cuota20": 15263,
      "balance40": 30525
    }
  },
  {
    "floor": 17,
    "floorLabel": "Piso 17",
    "unitNumber": "1707",
    "tipoLabel": "1 dorm / 57m2",
    "rooms": 1,
    "areaM2": 57,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 84360,
    "cuotas": {
      "perM2": 1580,
      "total": 90060,
      "initial40": 36024,
      "cuota20": 18012,
      "balance40": 36024
    }
  },
  {
    "floor": 17,
    "floorLabel": "Piso 17",
    "unitNumber": "1708",
    "tipoLabel": "2 dorm / 84.6m2",
    "rooms": 2,
    "areaM2": 84.6,
    "status": "vendido",
    "cashPerM2": 1480,
    "cashTotal": 125208,
    "cuotas": {
      "perM2": 1580,
      "total": 133668,
      "initial40": 53467,
      "cuota20": 26734,
      "balance40": 53467
    }
  },
  {
    "floor": 0,
    "floorLabel": "Planta Baja",
    "unitNumber": "Oficina 1",
    "tipoLabel": "129m2",
    "rooms": 0,
    "areaM2": 129,
    "status": "disponible",
    "cashPerM2": 2300,
    "cashTotal": 296700,
    "cuotas": {
      "perM2": 2400,
      "total": 309600,
      "initial40": 123840,
      "cuota20": 61920,
      "balance40": 123840
    }
  },
  {
    "floor": 0,
    "floorLabel": "Planta Baja",
    "unitNumber": "Oficina 2",
    "tipoLabel": "123m2",
    "rooms": 0,
    "areaM2": 123,
    "status": "disponible",
    "cashPerM2": 2300,
    "cashTotal": 282900,
    "cuotas": {
      "perM2": 2400,
      "total": 295200,
      "initial40": 118080,
      "cuota20": 59040,
      "balance40": 118080
    }
  }
];

export function parseEurodesignCsvText(text: string): EurodesignUnit[] {
  const lines = text.split(/\r?\n/).map((l) => l.split(",").map((c) => c.trim()));
  const units: EurodesignUnit[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = lines[i];
    if (row[0] && (row[0].startsWith("PISO") || row[0].startsWith("PLANTA BAJA"))) {
      const floorLabel = row[0];
      const isPlantaBaja = floorLabel === "PLANTA BAJA";
      const floorNum = isPlantaBaja ? 0 : parseInt(floorLabel.replace("PISO", "").trim(), 10);

      const modelRow = lines[i];
      const tipoRow = lines[i + 1];
      const estadoRow = lines[i + 2];

      if (!tipoRow || !estadoRow) continue;

      for (let c = 2; c < modelRow.length; c++) {
        const modelName = modelRow[c];
        const tipoVal = tipoRow[c];
        const estadoVal = estadoRow[c];

        if (!modelName || !tipoVal || !estadoVal) continue;

        let rooms = 1;
        let area = 0;

        if (isPlantaBaja) {
          rooms = 0;
          const areaM = tipoVal.match(/(\d+(\.\d+)?)/);
          if (areaM) area = parseFloat(areaM[1]);
        } else {
          if (tipoVal.includes("2 dorm")) rooms = 2;
          else if (tipoVal.includes("1 dorm")) rooms = 1;

          const areaM = tipoVal.match(/(\d+(\.\d+)?)\s*m2/i);
          if (areaM) area = parseFloat(areaM[1]);
        }

        let status: "disponible" | "vendido" | "reservado" = "disponible";
        const upperEst = estadoVal.toUpperCase();
        if (upperEst.includes("VENDID")) status = "vendido";
        else if (upperEst.includes("RESERV")) status = "reservado";

        const isCommercial = rooms === 0;
        const cashPerM2 = isCommercial ? 2300 : 1480;
        const cuotasPerM2 = isCommercial ? 2400 : 1580;

        const cashTotal = Math.round(area * cashPerM2);
        const cuotasTotal = Math.round(area * cuotasPerM2);
        const initial40 = Math.round(cuotasTotal * 0.4);
        const cuota20 = Math.round(cuotasTotal * 0.2);
        const balance40 = cuotasTotal - initial40 - cuota20;

        units.push({
          floor: floorNum,
          floorLabel: isPlantaBaja ? "Planta Baja" : `Piso ${floorNum}`,
          unitNumber: modelName,
          tipoLabel: tipoVal,
          rooms,
          areaM2: area,
          status,
          cashPerM2,
          cashTotal,
          cuotas: {
            perM2: cuotasPerM2,
            total: cuotasTotal,
            initial40,
            cuota20,
            balance40,
          },
        });
      }
    }
  }

  return units.length > 0 ? units : EURODESIGN_UNITS;
}

const EURODESIGN_LIVE_CACHE_KEY = "eurodesign.live_inventory_cache.v1";

export async function fetchEurodesignLiveUnits(): Promise<{
  units: EurodesignUnit[];
  source: "live_sheet" | "cached" | "snapshot";
}> {
  if (typeof window === "undefined") {
    return { units: EURODESIGN_UNITS, source: "snapshot" };
  }

  try {
    const raw = window.localStorage.getItem(EURODESIGN_LIVE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed?.units) &&
        parsed.units.length > 0 &&
        Date.now() - (parsed.time || 0) < 3600000
      ) {
        fetchFreshSheetInBackground();
        return { units: parsed.units, source: "cached" };
      }
    }
  } catch {
    // ignore
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(EURODESIGN_SHEETS_CSV_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const text = await res.text();
      const units = parseEurodesignCsvText(text);
      if (units.length > 0) {
        try {
          window.localStorage.setItem(
            EURODESIGN_LIVE_CACHE_KEY,
            JSON.stringify({ time: Date.now(), units })
          );
        } catch {}
        return { units, source: "live_sheet" };
      }
    }
  } catch (err) {
    console.warn("Live Google Sheets fetch failed, falling back to snapshot:", err);
  }

  try {
    const res = await fetch("/eurodesign-inventory.json");
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.units) && json.units.length > 0) {
        return { units: json.units, source: "cached" };
      }
    }
  } catch {}

  return { units: EURODESIGN_UNITS, source: "snapshot" };
}

function fetchFreshSheetInBackground() {
  if (typeof window === "undefined") return;
  setTimeout(async () => {
    try {
      const res = await fetch(EURODESIGN_SHEETS_CSV_URL);
      if (res.ok) {
        const text = await res.text();
        const units = parseEurodesignCsvText(text);
        if (units.length > 0) {
          window.localStorage.setItem(
            EURODESIGN_LIVE_CACHE_KEY,
            JSON.stringify({ time: Date.now(), units })
          );
        }
      }
    } catch {}
  }, 1000);
}
