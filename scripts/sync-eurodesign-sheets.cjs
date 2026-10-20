const https = require('https');
const fs = require('fs');
const path = require('path');

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1Q_xIcd1ta6cac89jDJdYgm87l0saHrBzbtxay32_SMA/export?format=csv';

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
  const lines = text.split(/\r?\n/).map(l => l.split(',').map(c => c.trim()));
  const units = [];

  for (let i = 0; i < lines.length; i++) {
    const row = lines[i];
    if (row[0] && (row[0].startsWith('PISO') || row[0].startsWith('PLANTA BAJA'))) {
      const floorLabel = row[0];
      const isPlantaBaja = floorLabel === 'PLANTA BAJA';
      const floorNum = isPlantaBaja ? 0 : parseInt(floorLabel.replace('PISO', '').trim(), 10);

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
          if (tipoVal.includes('2 dorm')) rooms = 2;
          else if (tipoVal.includes('1 dorm')) rooms = 1;

          const areaM = tipoVal.match(/(\d+(\.\d+)?)\s*m2/i);
          if (areaM) area = parseFloat(areaM[1]);
        }

        let status = 'disponible';
        const upperEst = estadoVal.toUpperCase();
        if (upperEst.includes('VENDID')) status = 'vendido';
        else if (upperEst.includes('RESERV')) status = 'reservado';

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
          floorLabel: isPlantaBaja ? 'Planta Baja' : `Piso ${floorNum}`,
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

  return units;
}

async function sync() {
  console.log('[EURODESIGN SYNC] Descargando disponibilidad desde Google Sheets...');
  const csvText = await fetchSheet(SHEET_CSV_URL);
  const units = parseCSV(csvText);

  if (units.length === 0) {
    console.error('[EURODESIGN SYNC] Error: no se pudieron parsear unidades del CSV.');
    process.exit(1);
  }

  const disp = units.filter(u => u.status === 'disponible').length;
  const vend = units.filter(u => u.status === 'vendido').length;
  const res = units.filter(u => u.status === 'reservado').length;

  console.log(`[EURODESIGN SYNC] Parseadas ${units.length} unidades: ${disp} disp, ${vend} vend, ${res} res`);

  const publicJsonPath = path.resolve(__dirname, '../frontend/public/eurodesign-inventory.json');
  fs.writeFileSync(publicJsonPath, JSON.stringify({
    lastSync: new Date().toISOString(),
    sheetUrl: SHEET_CSV_URL,
    totalUnits: units.length,
    disponibles: disp,
    vendidos: vend,
    reservados: res,
    units,
  }, null, 2), 'utf8');
  console.log(`[EURODESIGN SYNC] Actualizado ${publicJsonPath}`);

  // Re-generar src/eurodesignInventory.ts
  const tsPath = path.resolve(__dirname, '../frontend/src/eurodesignInventory.ts');
  const existingTs = fs.readFileSync(tsPath, 'utf8');
  const updatedTs = existingTs.replace(
    /export const EURODESIGN_UNITS: EurodesignUnit\[\] = \[[\s\S]*?\n\];/,
    `export const EURODESIGN_UNITS: EurodesignUnit[] = ${JSON.stringify(units, null, 2)};`
  );
  fs.writeFileSync(tsPath, updatedTs, 'utf8');
  console.log(`[EURODESIGN SYNC] Actualizado ${tsPath}`);
}

sync().catch(err => {
  console.error('[EURODESIGN SYNC] Error fatal:', err);
  process.exit(1);
});
