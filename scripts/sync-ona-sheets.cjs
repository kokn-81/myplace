const https = require('https');
const fs = require('fs');
const path = require('path');

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/14-g7f0tzOYfTX9KejkPa4enDf7pi1Kl2ytZaxB-qH6U/export?format=csv';

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

function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let cur = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(cur.trim());
      cur = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(cur.trim());
      if (row.some(cell => cell !== '')) lines.push(row);
      row = [];
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur.trim());
    if (row.some(cell => cell !== '')) lines.push(row);
  }
  return lines;
}

function parseNum(val) {
  if (!val) return null;
  const clean = val.replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '.');
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

async function sync() {
  console.log('[ONA SYNC] Descargando disponibilidad desde Google Sheets...');
  const csvText = await fetchSheet(SHEET_CSV_URL);
  const rows = parseCSV(csvText);

  const units = [];
  for (const r of rows) {
    if (r[0] && r[0].includes('Piso') && r[1] && r[1].startsWith('TIPO')) {
      const floorMatch = r[0].match(/(\d+)/);
      const floor = floorMatch ? parseInt(floorMatch[1], 10) : 0;
      const tipo = r[1].replace('TIPO', '').trim();
      const rooms = r[2].includes('1') ? 1 : 2;
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
      const view = r[14] || '';
      const rawStatus = (r[15] || '').toUpperCase();
      const status = rawStatus.includes('VENDID') ? 'vendido' : rawStatus.includes('RESERV') ? 'reservado' : 'disponible';
      
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
        plan40: { perM2: plan40PerM2, initial: plan40Initial, total: plan40Total }
      });
    }
  }

  const disponibles = units.filter(u => u.status === 'disponible').length;
  const vendidos = units.filter(u => u.status === 'vendido').length;
  const reservados = units.filter(u => u.status === 'reservado').length;

  console.log(`[ONA SYNC] ${units.length} unidades procesadas.`);
  console.log(`[ONA SYNC] Disponibles: ${disponibles} | Vendidos: ${vendidos} | Reservados: ${reservados}`);

  // Write JSON to frontend/public/ona-inventory.json
  const publicJsonPath = path.resolve(__dirname, '../frontend/public/ona-inventory.json');
  fs.writeFileSync(publicJsonPath, JSON.stringify({
    lastSync: new Date().toISOString(),
    sheetUrl: SHEET_CSV_URL,
    totalUnits: units.length,
    disponibles,
    vendidos,
    reservados,
    units
  }, null, 2), 'utf8');
  console.log(`[ONA SYNC] Guardado JSON en: ${publicJsonPath}`);

  return { units, disponibles, vendidos, reservados };
}

if (require.main === module) {
  sync().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('[ONA SYNC ERROR]', err);
    process.exit(1);
  });
}

module.exports = { sync, fetchSheet, parseCSV, parseNum, SHEET_CSV_URL };
