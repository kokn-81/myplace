const https = require('https');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1WcpH2mpmyoIjcK2pslIhazFH8741bHstNJk10Eg2qdE';
const TOWER_GID = '0';
const DREI_GID = '1613277342';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCsvLines(csv) {
  const lines = csv.split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const rawCols = [];
    let insideQuote = false;
    let entry = '';
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        insideQuote = !insideQuote;
      } else if (ch === ',' && !insideQuote) {
        rawCols.push(entry.trim());
        entry = '';
      } else {
        entry += ch;
      }
    }
    rawCols.push(entry.trim());
    rows.push(rawCols.map(v => (v || '').replace(/^"|"$/g, '').trim()));
  }
  return rows;
}

const num = (str) => {
  if (!str) return 0;
  const cleanStr = str.replace(/[^\d.]/g, '');
  return parseFloat(cleanStr) || 0;
};

async function syncAltaVida() {
  console.log('Synchronizing Alta Vida Santa Cruz projects (Bless Tower & Bless Drei)...');

  // 1. Bless Tower
  console.log('Fetching Bless Tower live CSV...');
  const towerUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${TOWER_GID}`;
  const towerCsv = await fetchUrl(towerUrl);
  const towerRows = parseCsvLines(towerCsv);

  let currentPiso = '';
  const towerUnits = [];
  for (let i = 1; i < towerRows.length; i++) {
    const row = towerRows[i];
    const nivelCol = row[0] || '';
    if (nivelCol && (nivelCol.startsWith('PISO') || nivelCol.startsWith('-1') || nivelCol.startsWith('PB'))) {
      currentPiso = nivelCol;
    }
    const modelo = row[1] || '';
    const modLetter = row[2] || '';
    const nro = row[3] || '';
    const estadoRaw = (row[4] || '').toUpperCase();
    const precioListaStr = row[5] || '';
    const precioCuotasStr = row[6] || '';
    const precioContadoStr = row[7] || '';
    const superficieStr = row[8] || '';

    if (modelo.includes('MONOAMBIENTE') || modelo.includes('DORMITORIO')) {
      const tipologia = modelo.includes('MONOAMBIENTE') ? 'Monoambiente' :
                        modelo.includes('2 DORMITORIO') ? '2 Dormitorios' : '1 Dormitorio';
      const pisoNum = parseInt(currentPiso.replace(/[^\d]/g, ''), 10) || 0;
      const estado = estadoRaw === 'VENDIDO' ? 'VENDIDO' : estadoRaw === 'RESERVADO' ? 'RESERVADO' : 'LIBRE';

      towerUnits.push({
        id: `BT-${currentPiso.replace(/\s+/g, '')}-${nro}`,
        codigo: `${pisoNum}${nro.padStart(2, '0')}`,
        piso: currentPiso,
        pisoNumero: pisoNum,
        nro,
        tipologia,
        modelo: modLetter || modelo,
        estado,
        precioLista: num(precioListaStr),
        precioCuotas: num(precioCuotasStr),
        precioContado: num(precioContadoStr),
        superficieM2: num(superficieStr)
      });
    }
  }

  // 2. Bless Drei
  console.log('Fetching Bless Drei live CSV...');
  const dreiUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${DREI_GID}`;
  const dreiCsv = await fetchUrl(dreiUrl);
  const dreiRows = parseCsvLines(dreiCsv);

  currentPiso = '';
  const dreiUnits = [];
  for (let i = 1; i < dreiRows.length; i++) {
    const row = dreiRows[i];
    const nivelCol = row[0] || '';
    if (nivelCol && (nivelCol.startsWith('PISO') || nivelCol.startsWith('PB') || nivelCol.startsWith('SUB') || nivelCol.startsWith('-1'))) {
      currentPiso = nivelCol;
    }
    const modelo = row[1] || '';
    const fachada = row[2] || '';
    const nro = row[3] || '';
    const modLetter = row[4] || '';
    const estadoRaw = (row[5] || '').toUpperCase();
    const precioCuotasStr = row[6] || '';
    const precioContadoStr = row[7] || '';
    const superficieStr = row[8] || '';

    if (modelo.includes('MONOAMBIENTE') || modelo.includes('DORMITORIO')) {
      const tipologia = modelo.includes('MONOAMBIENTE') ? 'Monoambiente' : '1 Dormitorio';
      const pisoNum = parseInt(currentPiso.replace(/[^\d]/g, ''), 10) || 0;
      const estado = estadoRaw === 'VENDIDO' ? 'VENDIDO' : estadoRaw === 'RESERVADO' ? 'RESERVADO' : 'LIBRE';

      dreiUnits.push({
        id: `BD-${currentPiso.replace(/\s+/g, '')}-${nro}`,
        codigo: `${pisoNum}${nro.padStart(2, '0')}`,
        piso: currentPiso,
        pisoNumero: pisoNum,
        nro,
        tipologia,
        modelo: modLetter || modelo,
        fachada,
        estado,
        precioCuotas: num(precioCuotasStr),
        precioContado: num(precioContadoStr),
        superficieM2: num(superficieStr)
      });
    }
  }

  const pubDir = path.join(__dirname, '..', 'frontend', 'public');
  fs.writeFileSync(path.join(pubDir, 'bless-tower-inventory.json'), JSON.stringify(towerUnits, null, 2), 'utf8');
  fs.writeFileSync(path.join(pubDir, 'bless-drei-inventory.json'), JSON.stringify(dreiUnits, null, 2), 'utf8');

  console.log(`✓ Synchronized ${towerUnits.length} units for Bless Tower and ${dreiUnits.length} units for Bless Drei.`);
}

syncAltaVida().catch(console.error);
