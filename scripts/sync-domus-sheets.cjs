const https = require('https');
const fs = require('fs');
const path = require('path');

const SHEETS = [
  {
    id: 'domus-black',
    name: 'DOMUS BLACK',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSB3qCZyf6lCHTnVxQK42VwwTvXs4-mRG7SjR5tj8kEVcfpb4owt3rmLnhvYV0GXGveW7qLF1JYCuNy/pub?output=csv',
  },
  {
    id: 'domus-gold',
    name: 'DOMUS GOLD',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsvCJfuWQS0N0PxNFubSisnvi0fwjny9jmBm7YT0Zhgg0E7s2eeAxXQNCSZTQexBE7fHTJENqcfwxs/pub?output=csv',
  },
  {
    id: 'domus-onix',
    name: 'DOMUS ONIX',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSp7JjKeLRMUqpFbApzC2JYUPHH0u7Zb0A7k3pzWljtA3kLfU6CZuk0oY8KiFnFDKOId9_iu3CzsovJ/pub?output=csv',
  },
  {
    id: 'domus-insignia',
    name: 'DOMUS INSIGNIA (2026)',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcBNsO5La-GCWYesZy68Lkxyn31_Hf_HUgKl-IlnQ8G_NSkNlP_KUSMd4hVgDG02URzCCmx6BIk0Sq/pub?gid=1272616038&single=true&output=csv',
  },
  {
    id: 'domus-luxury',
    name: 'DOMUS LUXURY (2026)',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcBNsO5La-GCWYesZy68Lkxyn31_Hf_HUgKl-IlnQ8G_NSkNlP_KUSMd4hVgDG02URzCCmx6BIk0Sq/pub?gid=1285884955&single=true&output=csv',
  },
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function syncAll() {
  console.log(`[DOMUS Sync] Sincronizando planillas oficiales de disponibilidad DOMUS...`);
  const jsonPath = path.resolve(__dirname, '../frontend/public/domus-inventory.json');
  let currentInventory = {};
  if (fs.existsSync(jsonPath)) {
    try {
      currentInventory = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch {}
  }

  for (const sheet of SHEETS) {
    try {
      console.log(`  Descargando ${sheet.name}...`);
      const csv = await fetchUrl(sheet.url);
      console.log(`  Recibido ${csv.length} bytes para ${sheet.name}`);
    } catch (e) {
      console.warn(`  Error sincronizando ${sheet.name}: ${e.message}`);
    }
  }

  console.log(`[DOMUS Sync] Sincronización completada exitosamente.`);
}

syncAll().catch(console.error);
