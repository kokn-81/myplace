import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GARDEN_ZEN_CONFIG,
  GARDEN_ZEN_BASELINE_UNITS,
  formatGardenZenUsd,
  parseGardenZenLiveCsv,
} from "./gardenZenInventory";

test("Garden Zen config is valid", () => {
  assert.equal(GARDEN_ZEN_CONFIG.id, "garden-zen");
  assert.equal(GARDEN_ZEN_CONFIG.name, "Garden Zen");
  assert.equal(GARDEN_ZEN_CONFIG.zone, "Equipetrol Norte");
  assert.equal(GARDEN_ZEN_CONFIG.delivery, "Marzo 2027");
  assert.equal(GARDEN_ZEN_CONFIG.reservaUsd, 5000);
  assert.ok(GARDEN_ZEN_CONFIG.amenities.length >= 8);
});

test("Garden Zen baseline contains 61 units with correct statuses", () => {
  assert.equal(GARDEN_ZEN_BASELINE_UNITS.length, 61);
  const disponibles = GARDEN_ZEN_BASELINE_UNITS.filter((u) => u.status === "disponible");
  const vendidos = GARDEN_ZEN_BASELINE_UNITS.filter((u) => u.status === "vendido");

  assert.equal(disponibles.length, 29);
  assert.equal(vendidos.length, 32);
});

test("Garden Zen floor plans and typologies are mapped properly", () => {
  const monos = GARDEN_ZEN_BASELINE_UNITS.filter((u) => u.rooms === 0);
  const dorms1 = GARDEN_ZEN_BASELINE_UNITS.filter((u) => u.rooms === 1);
  const dorms2 = GARDEN_ZEN_BASELINE_UNITS.filter((u) => u.rooms === 2);
  const dorms3 = GARDEN_ZEN_BASELINE_UNITS.filter((u) => u.rooms === 3);

  assert.equal(monos.length, 23);
  assert.equal(dorms1.length, 28);
  assert.equal(dorms2.length, 8);
  assert.equal(dorms3.length, 2);
  assert.equal(new Set(GARDEN_ZEN_BASELINE_UNITS.map(unit => unit.unitNumber)).size, GARDEN_ZEN_BASELINE_UNITS.length);

  // Check plans
  for (const u of GARDEN_ZEN_BASELINE_UNITS) {
    assert.ok(u.planoUrl.startsWith("/garden_zen/"));
  }
});

test("official exchange-rate heading cannot become an apartment or a USD 70 price", () => {
  const csv = `GARDEN ZEN,,,,,PRECIOS OFICIAL,,,,PRECIOS USD,,
ENTREGA MARZO 2027,,,,,Tipo de cambio Bs. 6.97,,,,9.73,,
TIPO,MODELO,NRO.,PISO,ÁREA FÍSICA TOTAL,PRECIO 30%,PRECIO 50%,PRECIO 70%,PRECIO CONTADO,PRECIO USD 30%,PRECIO USD 70%,PRECIO USD CONTADO
Monoambiente,MP,205,2,52.58,"$105,700","$103,100","$100,500","$97,800","$95,700","$93,600","$91,600"`;
  const units = parseGardenZenLiveCsv(csv);
  assert.equal(units.length, 1);
  assert.equal(units[0].unitNumber, "205");
  assert.equal(units[0].cashTotal, 91600);
  assert.equal(units[0].cashPerM2, 1742);
});

test("formatGardenZenUsd formats numbers properly", () => {
  const formatted = formatGardenZenUsd(59600);
  assert.ok(formatted.includes("59") && formatted.includes("600"));
});

test("parseGardenZenLiveCsv parses sample CSV accurately", () => {
  const sampleCsv = `GARDEN ZEN,,,,,PRECIOS USD,,,PRECIO POR M2 INVERSIÓN,,,OPEN HOUSE
ENTREGA MARZO 2027,,,,,UBICACIÓN,,,,,,
TIPO,MODELO,NRO.,PISO,ÁREA FÍSICA TOTAL, PRECIO 30% DE ANTICIPO ,PRECIO 70% DE ANTICIPO,PRECIO CONTADO,PM² 30%,PM² 70%,PM² CONTADO,BENEFICIO EXCLUSIVO CON PREFERENCIA DE PRECIO
Monoambiente,MP,205,2,52.58,"$92,000","$90,000","$88,000",,,,
3 Dormitorios,B3,201,2,133.49,"$183,813","$177,686","$171,559","$1,500","$1,450","$1,400",SI
1 Dormitorio,B1,203,2,58.95,"$80,727","$78,036","$75,345","$1,500","$1,450","$1,400",VENDIDO`;

  const parsed = parseGardenZenLiveCsv(sampleCsv);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].unitNumber, "205");
  assert.equal(parsed[0].status, "disponible");
  assert.equal(parsed[0].cashTotal, 88000);
  assert.equal(parsed[2].unitNumber, "203");
  assert.equal(parsed[2].status, "vendido");
});
