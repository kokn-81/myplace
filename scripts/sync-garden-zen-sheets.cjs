const https = require('https');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '131d0GDjOhvHerSya1izI1CS6qIBkBV6a';
const GID_DEPTOS = '1727984128';
const GID_PARKINGS = '2088384023';

const CSV_DEPTOS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_DEPTOS}`;
const CSV_PARKINGS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_PARKINGS}`;

function fetchSheet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchSheet(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function splitCsv(line) {
  const result = [];
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function cleanPrice(str) {
  if (!str) return 0;
  const num = Number(str.replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? Math.round(num) : 0;
}

const PLANO_MAP = {
  MP: '/garden_zen/plano_mono_mp.jpg',
  M1: '/garden_zen/plano_mono_m1.jpg',
  ML: '/garden_zen/plano_mono_ml.jpg',
  B1: '/garden_zen/plano_1dorm_b1.jpg',
  I1: '/garden_zen/plano_1dorm_i1.jpg',
  D2: '/garden_zen/plano_2dorm_d2.jpg',
  E2: '/garden_zen/plano_2dorm_e2.jpg',
  B3: '/garden_zen/plano_3dorm_b3.jpg'
};

async function syncGardenZen() {
  console.log('Fetching Garden Zen live sheet (Departamentos)...');
  const csv = await fetchSheet(CSV_DEPTOS_URL);
  const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);

  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const cells = splitCsv(lines[i]);
    if (cells.some(c => c.toLowerCase().includes('tipo') || c.toLowerCase().includes('modelo') || c.toLowerCase().includes('nro'))) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    throw new Error('No se encontro la fila de encabezados en la hoja de Garden Zen');
  }

  const rows = lines.slice(headerIdx + 1).map(splitCsv).filter(r => r.length >= 5 && r[2]);
  const liveMap = new Map();

  for (const r of rows) {
    const tipoStr = r[0] || '';
    const modelo = (r[1] || '').trim().toUpperCase();
    const unitNumber = (r[2] || '').trim();
    const floor = parseInt(r[3], 10) || 0;
    const areaM2 = parseFloat(r[4]) || 0;

    let price30 = 0;
    let price70 = 0;
    let priceContado = 0;
    let isVendido = false;

    if (r.length >= 12 && cleanPrice(r[11]) >= 10000) {
      price30 = cleanPrice(r[9]);
      price70 = cleanPrice(r[10]);
      priceContado = cleanPrice(r[11]);
      isVendido = r.some(c => {
        const up = c.toUpperCase();
        return up.includes('VENDIDO') || up.includes('RESERVADO');
      });
    } else {
      price30 = cleanPrice(r[5]);
      price70 = cleanPrice(r[6]);
      priceContado = cleanPrice(r[7]);
      const benefit = (r[11] || '').toUpperCase();
      isVendido = benefit.includes('VENDIDO') || benefit.includes('RESERVADO');
    }

    const status = isVendido ? 'vendido' : 'disponible';

    let rooms = 1;
    let roomsLabel = '1 Dormitorio';
    const tLower = tipoStr.toLowerCase();
    if (tLower.includes('monoambiente') || tLower.includes('studio') || modelo.startsWith('M')) {
      rooms = 0;
      roomsLabel = 'Monoambiente';
    } else if (tLower.includes('2 dorm') || modelo.endsWith('2')) {
      rooms = 2;
      roomsLabel = '2 Dormitorios';
    } else if (tLower.includes('3 dorm') || modelo.endsWith('3')) {
      rooms = 3;
      roomsLabel = '3 Dormitorios';
    }

    const finalCashPerM2 = areaM2 > 0 ? Math.round(priceContado / areaM2) : 1400;
    const final70PerM2 = areaM2 > 0 ? Math.round(price70 / areaM2) : 1450;
    const final30PerM2 = areaM2 > 0 ? Math.round(price30 / areaM2) : 1500;

    const cuotaInicial30 = Math.round(price30 * 0.3);
    const cuotaInicial70 = Math.round(price70 * 0.7);

    liveMap.set(unitNumber, {
      projectId: 'garden-zen',
      floor,
      floorLabel: `Piso ${floor}`,
      unitNumber,
      modelo,
      rooms,
      roomsLabel,
      areaM2,
      status,
      cashTotal: priceContado,
      initial70Total: price70,
      initial30Total: price30,
      cashPerM2: finalCashPerM2,
      initial70PerM2: final70PerM2,
      initial30PerM2: final30PerM2,
      cuotaInicial30,
      cuotaInicial70,
      planoUrl: PLANO_MAP[modelo] || '/garden_zen/fachada.jpg'
    });
  }

  // Load baseline units
  const tsContent = fs.readFileSync(path.join(__dirname, '../frontend/src/gardenZenInventory.ts'), 'utf8');
  const baselineMatch = tsContent.match(/export const GARDEN_ZEN_BASELINE_UNITS: GardenZenUnit\[\] = (\[[\s\S]*?\]);\r?\n\r?\nfunction/);
  const baselineUnits = baselineMatch ? eval(baselineMatch[1]) : [];

  const finalUnits = baselineUnits.map(base => {
    const live = liveMap.get(base.unitNumber);
    if (live) return live;
    return { ...base, status: 'vendido' };
  });

  const targetPath = path.join(__dirname, '../frontend/public/garden-zen-inventory.json');
  fs.writeFileSync(targetPath, JSON.stringify(finalUnits, null, 2));
  console.log(`Garden Zen synchronized: ${finalUnits.length} total units (${finalUnits.filter(u => u.status === 'disponible').length} disponibles, ${finalUnits.filter(u => u.status === 'vendido').length} vendidos) saved to ${targetPath}`);
}

syncGardenZen().catch(err => {
  console.error('Error syncing Garden Zen:', err);
  process.exit(1);
});
