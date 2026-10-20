const https = require('https');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '15lzhDdyVY83KGl311yOAVSaJdhssyM6dv4jcEZsNvnk';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

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
  console.log('Fetching Garden Zen live sheet...');
  const csv = await fetchSheet(CSV_URL);
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
  const units = [];

  for (const r of rows) {
    const tipoStr = r[0] || '';
    const modelo = (r[1] || '').trim().toUpperCase();
    const unitNumber = (r[2] || '').trim();
    const floor = parseInt(r[3], 10) || 0;
    const areaM2 = parseFloat(r[4]) || 0;
    const price30 = cleanPrice(r[5]);
    const price70 = cleanPrice(r[6]);
    const priceContado = cleanPrice(r[7]);
    const pm30 = cleanPrice(r[8]);
    const pm70 = cleanPrice(r[9]);
    const pmContado = cleanPrice(r[10]);
    const benefitStatus = (r[11] || '').trim().toUpperCase();

    const isVendido = benefitStatus.includes('VENDIDO') || benefitStatus.includes('RESERVADO');
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

    let finalContado = priceContado;
    let final70 = price70;
    let final30 = price30;

    if (!finalContado && areaM2 > 0) {
      if (pmContado > 0) finalContado = Math.round(areaM2 * pmContado);
      else if (final30 > 0) finalContado = Math.round(final30 * 0.95);
    }
    if (!final70 && areaM2 > 0) {
      if (pm70 > 0) final70 = Math.round(areaM2 * pm70);
      else if (final30 > 0) final70 = Math.round(final30 * 0.98);
    }
    if (!final30 && areaM2 > 0) {
      if (pm30 > 0) final30 = Math.round(areaM2 * pm30);
      else if (finalContado > 0) final30 = Math.round(finalContado * 1.05);
    }

    const cuotaInicial30 = Math.round(final30 * 0.3);
    const cuotaInicial70 = Math.round(final70 * 0.7);

    units.push({
      projectId: 'garden-zen',
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
      cashPerM2: pmContado || (areaM2 > 0 ? Math.round(finalContado / areaM2) : 0),
      initial70PerM2: pm70 || (areaM2 > 0 ? Math.round(final70 / areaM2) : 0),
      initial30PerM2: pm30 || (areaM2 > 0 ? Math.round(final30 / areaM2) : 0),
      cuotaInicial30,
      cuotaInicial70,
      planoUrl: PLANO_MAP[modelo] || '/garden_zen/fachada.jpg'
    });
  }

  const targetPath = path.join(__dirname, '../frontend/public/garden-zen-inventory.json');
  fs.writeFileSync(targetPath, JSON.stringify(units, null, 2));
  console.log(`Garden Zen synchronized: ${units.length} units (${units.filter(u => u.status === 'disponible').length} disponibles) saved to ${targetPath}`);
}

syncGardenZen().catch(err => {
  console.error('Error syncing Garden Zen:', err);
  process.exit(1);
});
