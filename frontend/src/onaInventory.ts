/* Generated from the 1.a fase price sheets in Ona Residences. Updated from Google Sheets. */

export type OnaPayPlan = { perM2: number; initial: number; total: number };

export type OnaUnit = {
  floor: number;
  tipo: string;
  rooms: number;
  interiorM2: number;
  balconyM2: number | null;
  totalM2: number;
  view: string;
  status: "disponible" | "vendido" | "reservado";
  cashPerM2: number;
  cash: number;
  plan60: OnaPayPlan;
  plan40: OnaPayPlan;
};

export type OnaParking = {
  code: string;
  level: "Planta baja" | "Subsuelo";
  kind: "simple" | "doble";
  includesStorage: boolean;
  price: number;
  status: "disponible" | "vendido";
};

export const ONA_RESERVE_USD = 2000;
export const ONA_ZONE = "Los Cusis";
export const ONA_ADDRESS = "Av. Los Cusis";
export const ONA_DELIVERY = "Junio 2028";
export const ONA_BUILDER = "Palacios Antunez";
export const ONA_BROCHURE_URL = "/ona/brochure.pdf";
export const ONA_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/14-g7f0tzOYfTX9KejkPa4enDf7pi1Kl2ytZaxB-qH6U/export?format=csv";

export const ONA_UNITS: OnaUnit[] = [
  { floor: 1, tipo: '1', rooms: 2, interiorM2: 54.15, balconyM2: null, totalM2: 54.15, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1250, cash: 67687.5, plan60: { perM2: 1300, initial: 42237, total: 70395 }, plan40: { perM2: 1350, initial: 29241, total: 73102.5 } },
  { floor: 1, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'disponible', cashPerM2: 1250, cash: 115000, plan60: { perM2: 1300, initial: 71760, total: 119600 }, plan40: { perM2: 1350, initial: 49680, total: 124200 } },
  { floor: 2, tipo: '1', rooms: 2, interiorM2: 54.14, balconyM2: null, totalM2: 54.14, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1250, cash: 67675, plan60: { perM2: 1300, initial: 42229.2, total: 70382 }, plan40: { perM2: 1350, initial: 29235.6, total: 73089 } },
  { floor: 2, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'disponible', cashPerM2: 1250, cash: 115000, plan60: { perM2: 1300, initial: 71760, total: 119600 }, plan40: { perM2: 1350, initial: 49680, total: 124200 } },
  { floor: 2, tipo: '3', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1250, cash: 40375, plan60: { perM2: 1300, initial: 25194, total: 41990 }, plan40: { perM2: 1350, initial: 17442, total: 43605 } },
  { floor: 2, tipo: '4', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1250, cash: 40375, plan60: { perM2: 1300, initial: 25194, total: 41990 }, plan40: { perM2: 1350, initial: 17442, total: 43605 } },
  { floor: 2, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'disponible', cashPerM2: 1250, cash: 115062.5, plan60: { perM2: 1300, initial: 71799, total: 119665 }, plan40: { perM2: 1350, initial: 49707, total: 124267.5 } },
  { floor: 3, tipo: '1', rooms: 2, interiorM2: 54.14, balconyM2: null, totalM2: 54.14, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1250, cash: 67675, plan60: { perM2: 1300, initial: 42229.2, total: 70382 }, plan40: { perM2: 1350, initial: 29235.6, total: 73089 } },
  { floor: 3, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'disponible', cashPerM2: 1250, cash: 115000, plan60: { perM2: 1300, initial: 71760, total: 119600 }, plan40: { perM2: 1350, initial: 49680, total: 124200 } },
  { floor: 3, tipo: '3', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1250, cash: 40375, plan60: { perM2: 1300, initial: 25194, total: 41990 }, plan40: { perM2: 1350, initial: 17442, total: 43605 } },
  { floor: 3, tipo: '4', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1250, cash: 40375, plan60: { perM2: 1300, initial: 25194, total: 41990 }, plan40: { perM2: 1350, initial: 17442, total: 43605 } },
  { floor: 3, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'disponible', cashPerM2: 1250, cash: 115062.5, plan60: { perM2: 1300, initial: 71799, total: 119665 }, plan40: { perM2: 1350, initial: 49707, total: 124267.5 } },
  { floor: 4, tipo: '1', rooms: 2, interiorM2: 54.14, balconyM2: null, totalM2: 54.14, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1260, cash: 68216.4, plan60: { perM2: 1310, initial: 42554.04, total: 70923.4 }, plan40: { perM2: 1360, initial: 29452.16, total: 73630.4 } },
  { floor: 4, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'vendido', cashPerM2: 1265, cash: 116380, plan60: { perM2: 1315, initial: 72588, total: 120980 }, plan40: { perM2: 1365, initial: 50232, total: 125580 } },
  { floor: 4, tipo: '3', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1265, cash: 40859.5, plan60: { perM2: 1315, initial: 25484.7, total: 42474.5 }, plan40: { perM2: 1365, initial: 17635.8, total: 44089.5 } },
  { floor: 4, tipo: '4', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1265, cash: 40859.5, plan60: { perM2: 1315, initial: 25484.7, total: 42474.5 }, plan40: { perM2: 1365, initial: 17635.8, total: 44089.5 } },
  { floor: 4, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'disponible', cashPerM2: 1260, cash: 115983, plan60: { perM2: 1310, initial: 72351.3, total: 120585.5 }, plan40: { perM2: 1360, initial: 50075.2, total: 125188 } },
  { floor: 5, tipo: '1', rooms: 2, interiorM2: 54.14, balconyM2: null, totalM2: 54.14, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1270, cash: 68757.8, plan60: { perM2: 1320, initial: 42878.88, total: 71464.8 }, plan40: { perM2: 1370, initial: 29668.72, total: 74171.8 } },
  { floor: 5, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'disponible', cashPerM2: 1280, cash: 117760, plan60: { perM2: 1330, initial: 73416, total: 122360 }, plan40: { perM2: 1380, initial: 50784, total: 126960 } },
  { floor: 5, tipo: '3', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1280, cash: 41344, plan60: { perM2: 1330, initial: 25775.4, total: 42959 }, plan40: { perM2: 1380, initial: 17829.6, total: 44574 } },
  { floor: 5, tipo: '4', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1280, cash: 41344, plan60: { perM2: 1330, initial: 25775.4, total: 42959 }, plan40: { perM2: 1380, initial: 17829.6, total: 44574 } },
  { floor: 5, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'disponible', cashPerM2: 1270, cash: 116903.5, plan60: { perM2: 1320, initial: 72903.6, total: 121506 }, plan40: { perM2: 1370, initial: 50443.4, total: 126108.5 } },
  { floor: 6, tipo: '1', rooms: 2, interiorM2: 54.14, balconyM2: null, totalM2: 54.14, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1280, cash: 69299.2, plan60: { perM2: 1330, initial: 43203.72, total: 72006.2 }, plan40: { perM2: 1380, initial: 29885.28, total: 74713.2 } },
  { floor: 6, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'disponible', cashPerM2: 1295, cash: 119140, plan60: { perM2: 1345, initial: 74244, total: 123740 }, plan40: { perM2: 1395, initial: 51336, total: 128340 } },
  { floor: 6, tipo: '3', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1295, cash: 41828.5, plan60: { perM2: 1345, initial: 26066.1, total: 43443.5 }, plan40: { perM2: 1395, initial: 18023.4, total: 45058.5 } },
  { floor: 6, tipo: '4', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1295, cash: 41828.5, plan60: { perM2: 1345, initial: 26066.1, total: 43443.5 }, plan40: { perM2: 1395, initial: 18023.4, total: 45058.5 } },
  { floor: 6, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'disponible', cashPerM2: 1280, cash: 117824, plan60: { perM2: 1330, initial: 73455.9, total: 122426.5 }, plan40: { perM2: 1380, initial: 50811.6, total: 127029 } },
  { floor: 7, tipo: '1', rooms: 2, interiorM2: 54.14, balconyM2: null, totalM2: 54.14, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1290, cash: 69840.6, plan60: { perM2: 1340, initial: 43528.56, total: 72547.6 }, plan40: { perM2: 1390, initial: 30101.84, total: 75254.6 } },
  { floor: 7, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'vendido', cashPerM2: 1305, cash: 120060, plan60: { perM2: 1355, initial: 74796, total: 124660 }, plan40: { perM2: 1405, initial: 51704, total: 129260 } },
  { floor: 7, tipo: '3', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1305, cash: 42151.5, plan60: { perM2: 1355, initial: 26259.9, total: 43766.5 }, plan40: { perM2: 1405, initial: 18152.6, total: 45381.5 } },
  { floor: 7, tipo: '4', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1305, cash: 42151.5, plan60: { perM2: 1355, initial: 26259.9, total: 43766.5 }, plan40: { perM2: 1405, initial: 18152.6, total: 45381.5 } },
  { floor: 7, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'disponible', cashPerM2: 1290, cash: 118744.5, plan60: { perM2: 1340, initial: 74008.2, total: 123347 }, plan40: { perM2: 1390, initial: 51179.8, total: 127949.5 } },
  { floor: 8, tipo: '1', rooms: 2, interiorM2: 54.14, balconyM2: null, totalM2: 54.14, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1300, cash: 70382, plan60: { perM2: 1350, initial: 43853.4, total: 73089 }, plan40: { perM2: 1400, initial: 30318.4, total: 75796 } },
  { floor: 8, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'disponible', cashPerM2: 1315, cash: 120980, plan60: { perM2: 1365, initial: 75348, total: 125580 }, plan40: { perM2: 1415, initial: 52072, total: 130180 } },
  { floor: 8, tipo: '3', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1315, cash: 42474.5, plan60: { perM2: 1365, initial: 26453.7, total: 44089.5 }, plan40: { perM2: 1415, initial: 18281.8, total: 45704.5 } },
  { floor: 8, tipo: '4', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1315, cash: 42474.5, plan60: { perM2: 1365, initial: 26453.7, total: 44089.5 }, plan40: { perM2: 1415, initial: 18281.8, total: 45704.5 } },
  { floor: 8, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'disponible', cashPerM2: 1300, cash: 119665, plan60: { perM2: 1350, initial: 74560.5, total: 124267.5 }, plan40: { perM2: 1400, initial: 51548, total: 128870 } },
  { floor: 9, tipo: '1', rooms: 2, interiorM2: 54.14, balconyM2: null, totalM2: 54.14, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1310, cash: 70923.4, plan60: { perM2: 1360, initial: 44178.24, total: 73630.4 }, plan40: { perM2: 1410, initial: 30534.96, total: 76337.4 } },
  { floor: 9, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'disponible', cashPerM2: 1325, cash: 121900, plan60: { perM2: 1375, initial: 75900, total: 126500 }, plan40: { perM2: 1425, initial: 52440, total: 131100 } },
  { floor: 9, tipo: '3', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1325, cash: 42797.5, plan60: { perM2: 1375, initial: 26647.5, total: 44412.5 }, plan40: { perM2: 1425, initial: 18411, total: 46027.5 } },
  { floor: 9, tipo: '4', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1325, cash: 42797.5, plan60: { perM2: 1375, initial: 26647.5, total: 44412.5 }, plan40: { perM2: 1425, initial: 18411, total: 46027.5 } },
  { floor: 9, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'disponible', cashPerM2: 1310, cash: 120585.5, plan60: { perM2: 1360, initial: 75112.8, total: 125188 }, plan40: { perM2: 1410, initial: 51916.2, total: 129790.5 } },
  { floor: 10, tipo: '1', rooms: 2, interiorM2: 54.14, balconyM2: null, totalM2: 54.14, view: 'Vista Lateral', status: 'disponible', cashPerM2: 1320, cash: 71464.8, plan60: { perM2: 1370, initial: 44503.08, total: 74171.8 }, plan40: { perM2: 1420, initial: 30751.52, total: 76878.8 } },
  { floor: 10, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'disponible', cashPerM2: 1335, cash: 122820, plan60: { perM2: 1385, initial: 76452, total: 127420 }, plan40: { perM2: 1435, initial: 52808, total: 132020 } },
  { floor: 10, tipo: '3', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1335, cash: 43120.5, plan60: { perM2: 1385, initial: 26841.3, total: 44735.5 }, plan40: { perM2: 1435, initial: 18540.2, total: 46350.5 } },
  { floor: 10, tipo: '4', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1335, cash: 43120.5, plan60: { perM2: 1385, initial: 26841.3, total: 44735.5 }, plan40: { perM2: 1435, initial: 18540.2, total: 46350.5 } },
  { floor: 10, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'disponible', cashPerM2: 1320, cash: 121506, plan60: { perM2: 1370, initial: 75665.1, total: 126108.5 }, plan40: { perM2: 1420, initial: 52284.4, total: 130711 } },
  { floor: 11, tipo: '1', rooms: 2, interiorM2: 54.14, balconyM2: null, totalM2: 54.14, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1330, cash: 72006.2, plan60: { perM2: 1380, initial: 44827.92, total: 74713.2 }, plan40: { perM2: 1430, initial: 30968.08, total: 77420.2 } },
  { floor: 11, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'vendido', cashPerM2: 1345, cash: 123740, plan60: { perM2: 1395, initial: 77004, total: 128340 }, plan40: { perM2: 1445, initial: 53176, total: 132940 } },
  { floor: 11, tipo: '3', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1345, cash: 43443.5, plan60: { perM2: 1395, initial: 27035.1, total: 45058.5 }, plan40: { perM2: 1445, initial: 18669.4, total: 46673.5 } },
  { floor: 11, tipo: '4', rooms: 1, interiorM2: 32.3, balconyM2: null, totalM2: 32.3, view: 'Vista Lateral', status: 'vendido', cashPerM2: 1345, cash: 43443.5, plan60: { perM2: 1395, initial: 27035.1, total: 45058.5 }, plan40: { perM2: 1445, initial: 18669.4, total: 46673.5 } },
  { floor: 11, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'vendido', cashPerM2: 1330, cash: 122426.5, plan60: { perM2: 1380, initial: 76217.4, total: 127029 }, plan40: { perM2: 1430, initial: 52652.6, total: 131631.5 } },
  { floor: 12, tipo: '2', rooms: 2, interiorM2: 86.45, balconyM2: 5.55, totalM2: 92, view: 'Vista Av. Los Cusis', status: 'vendido', cashPerM2: 1355, cash: 124660, plan60: { perM2: 1405, initial: 77556, total: 129260 }, plan40: { perM2: 1455, initial: 53544, total: 133860 } },
  { floor: 12, tipo: '5', rooms: 2, interiorM2: 86.5, balconyM2: 5.55, totalM2: 92.05, view: 'Vista posterior', status: 'vendido', cashPerM2: 1340, cash: 123347, plan60: { perM2: 1390, initial: 76769.7, total: 127949.5 }, plan40: { perM2: 1440, initial: 53020.8, total: 132552 } }
];

export const ONA_PARKINGS: OnaParking[] = [
  { code: '1', level: 'Planta baja', kind: 'simple', includesStorage: true, price: 15000, status: 'vendido' },
  { code: '2', level: 'Planta baja', kind: 'simple', includesStorage: true, price: 15000, status: 'vendido' },
  { code: '3', level: 'Planta baja', kind: 'simple', includesStorage: true, price: 15000, status: 'vendido' },
  { code: '4', level: 'Planta baja', kind: 'simple', includesStorage: true, price: 15000, status: 'vendido' },
  { code: '5', level: 'Planta baja', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '6', level: 'Planta baja', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '7', level: 'Planta baja', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '8', level: 'Planta baja', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '9', level: 'Planta baja', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '10 A y B', level: 'Planta baja', kind: 'doble', includesStorage: true, price: 22000, status: 'disponible' },
  { code: '11 A y B', level: 'Planta baja', kind: 'doble', includesStorage: true, price: 22000, status: 'disponible' },
  { code: '12 A y B', level: 'Planta baja', kind: 'doble', includesStorage: true, price: 22000, status: 'disponible' },
  { code: '13 A y B', level: 'Planta baja', kind: 'doble', includesStorage: true, price: 22000, status: 'disponible' },
  { code: '14 A y B', level: 'Planta baja', kind: 'doble', includesStorage: true, price: 22000, status: 'disponible' },
  { code: '15', level: 'Subsuelo', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '16', level: 'Subsuelo', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '17', level: 'Subsuelo', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '18', level: 'Subsuelo', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '19', level: 'Subsuelo', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '20', level: 'Subsuelo', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '21', level: 'Subsuelo', kind: 'simple', includesStorage: true, price: 15000, status: 'disponible' },
  { code: '22 A y B', level: 'Subsuelo', kind: 'doble', includesStorage: true, price: 22000, status: 'disponible' },
  { code: '23 A y B', level: 'Subsuelo', kind: 'doble', includesStorage: true, price: 22000, status: 'disponible' },
  { code: '24 A y B', level: 'Subsuelo', kind: 'doble', includesStorage: true, price: 22000, status: 'disponible' },
  { code: '25 A y B', level: 'Subsuelo', kind: 'doble', includesStorage: true, price: 22000, status: 'disponible' },
  { code: '26 A y B', level: 'Subsuelo', kind: 'doble', includesStorage: true, price: 22000, status: 'disponible' },
];

export const formatOnaM2 = (value: number) => {
  const [whole, frac] = value.toFixed(2).split(".");
  return `${whole},${frac}`;
};

export const formatOnaUsd = (value: number) => {
  const negative = value < 0;
  const abs = Math.abs(value);
  const [whole, frac] = abs.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const body = frac === "00" ? grouped : `${grouped},${frac}`;
  return `${negative ? "-" : ""}${body}`;
};

export function parseOnaCsvText(csvText: string): OnaUnit[] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let cur = "";
  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    const next = csvText[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      row.push(cur.trim());
      cur = "";
    } else if ((c === "\r" || c === "\n") && !inQuotes) {
      if (c === "\r" && next === "\n") i++;
      row.push(cur.trim());
      if (row.some((cell) => cell !== "")) lines.push(row);
      row = [];
      cur = "";
    } else {
      cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur.trim());
    if (row.some((cell) => cell !== "")) lines.push(row);
  }

  const parseNum = (val?: string) => {
    if (!val) return null;
    const clean = val.replace(/\$/g, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
    const n = parseFloat(clean);
    return isNaN(n) ? null : n;
  };

  const units: OnaUnit[] = [];
  for (const r of lines) {
    if (r[0] && r[0].includes("Piso") && r[1] && r[1].startsWith("TIPO")) {
      const floorMatch = r[0].match(/(\d+)/);
      const floor = floorMatch ? parseInt(floorMatch[1], 10) : 0;
      const tipo = r[1].replace("TIPO", "").trim();
      const rooms = r[2]?.includes("1") ? 1 : 2;
      const interiorM2 = parseNum(r[3]) || 0;
      const balconyM2 = parseNum(r[4]);
      const totalM2 = parseNum(r[5]) || 0;
      const cashPerM2 = parseNum(r[6]) || 0;
      const cash = parseNum(r[7]) || 0;
      const plan60PerM2 = parseNum(r[8]) || 0;
      const plan60Initial = parseNum(r[9]) || 0;
      const plan60Total = parseNum(r[10]) || 0;
      const plan40PerM2 = parseNum(r[11]) || 0;
      const plan40Initial = parseNum(r[12]) || 0;
      const plan40Total = parseNum(r[13]) || 0;
      const view = r[14] || "";
      const rawStatus = (r[15] || "").toUpperCase();
      const status: "disponible" | "vendido" | "reservado" = rawStatus.includes("VENDID")
        ? "vendido"
        : rawStatus.includes("RESERV")
        ? "reservado"
        : "disponible";

      units.push({
        floor,
        tipo,
        rooms,
        interiorM2,
        balconyM2,
        totalM2,
        view,
        status,
        cashPerM2,
        cash,
        plan60: { perM2: plan60PerM2, initial: plan60Initial, total: plan60Total },
        plan40: { perM2: plan40PerM2, initial: plan40Initial, total: plan40Total },
      });
    }
  }
  return units.length > 0 ? units : ONA_UNITS;
}

const ONA_LIVE_CACHE_KEY = "ona.live_inventory_cache.v1";

export async function fetchOnaLiveUnits(): Promise<{ units: OnaUnit[]; source: "live_sheet" | "cached" | "snapshot" }> {
  if (typeof window === "undefined") {
    return { units: ONA_UNITS, source: "snapshot" };
  }

  try {
    const raw = window.localStorage.getItem(ONA_LIVE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.units) && parsed.units.length > 0 && Date.now() - (parsed.time || 0) < 3600000) {
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
    const res = await fetch(ONA_SHEETS_CSV_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const text = await res.text();
      const units = parseOnaCsvText(text);
      if (units.length > 0) {
        try {
          window.localStorage.setItem(ONA_LIVE_CACHE_KEY, JSON.stringify({ time: Date.now(), units }));
        } catch {}
        return { units, source: "live_sheet" };
      }
    }
  } catch (err) {
    console.warn("Live Google Sheets fetch failed, falling back to snapshot:", err);
  }

  try {
    const res = await fetch("/ona-inventory.json");
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.units) && json.units.length > 0) {
        return { units: json.units, source: "cached" };
      }
    }
  } catch {}

  return { units: ONA_UNITS, source: "snapshot" };
}

function fetchFreshSheetInBackground() {
  if (typeof window === "undefined") return;
  setTimeout(async () => {
    try {
      const res = await fetch(ONA_SHEETS_CSV_URL);
      if (res.ok) {
        const text = await res.text();
        const units = parseOnaCsvText(text);
        if (units.length > 0) {
          window.localStorage.setItem(ONA_LIVE_CACHE_KEY, JSON.stringify({ time: Date.now(), units }));
        }
      }
    } catch {}
  }, 1000);
}
