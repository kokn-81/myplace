import test from "node:test";
import assert from "node:assert/strict";
import {
  EURODESIGN_UNITS,
  EURODESIGN_NAME,
  EURODESIGN_ZONE,
  EURODESIGN_DELIVERY,
  formatEurodesignUsd,
  parseEurodesignCsvText,
} from "./eurodesignInventory";

test("eurodesign inventory has baseline units", () => {
  assert.ok(EURODESIGN_UNITS.length >= 100, `Expected at least 100 units, got ${EURODESIGN_UNITS.length}`);
  const disponibles = EURODESIGN_UNITS.filter((u) => u.status === "disponible");
  const vendidos = EURODESIGN_UNITS.filter((u) => u.status === "vendido");
  const reservados = EURODESIGN_UNITS.filter((u) => u.status === "reservado");

  assert.ok(disponibles.length > 0, "Debe haber unidades disponibles");
  assert.ok(vendidos.length > 0, "Debe haber unidades vendidas");
  assert.equal(disponibles.length + vendidos.length + reservados.length, EURODESIGN_UNITS.length);
});

test("eurodesign constants are set correctly", () => {
  assert.equal(EURODESIGN_NAME, "Tower Eurodesign");
  assert.equal(EURODESIGN_ZONE, "Equipetrol");
  assert.equal(EURODESIGN_DELIVERY, "Junio 2027");
});

test("formatEurodesignUsd formats numbers properly", () => {
  const formatted = formatEurodesignUsd(125208);
  assert.ok(formatted.includes("125") && formatted.includes("208"));
});

test("parseEurodesignCsvText parses sample CSV", () => {
  const sample = `
PISO 5,MODELO,,MODELO 01,MODELO 02
,,TIPO,2 dorm / 82m2,1 dorm / 57m2
,,ESTADO,DISPONIBLE,VENDIDO
`;
  const units = parseEurodesignCsvText(sample);
  assert.equal(units.length, 2);
  assert.equal(units[0].floor, 5);
  assert.equal(units[0].rooms, 2);
  assert.equal(units[0].areaM2, 82);
  assert.equal(units[0].status, "disponible");
  assert.equal(units[0].cashPerM2, 1480);
  assert.equal(units[0].cashTotal, 82 * 1480);

  assert.equal(units[1].floor, 5);
  assert.equal(units[1].rooms, 1);
  assert.equal(units[1].areaM2, 57);
  assert.equal(units[1].status, "vendido");
});
