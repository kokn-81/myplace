import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BLESS_TOWER_CONFIG,
  BLESS_TOWER_BASELINE_UNITS,
  BLESS_TOWER_PARKINGS,
  BLESS_TOWER_STORAGES,
  formatBlessUsd,
  parseBlessTowerCsv,
} from "./blessTowerInventory";

test("Bless Tower config is valid", () => {
  assert.equal(BLESS_TOWER_CONFIG.id, "bless-tower");
  assert.equal(BLESS_TOWER_CONFIG.name, "Bless Tower");
  assert.equal(BLESS_TOWER_CONFIG.builder, "Alta Vida Santa Cruz");
  assert.equal(BLESS_TOWER_CONFIG.delivery, "Diciembre 2027");
  assert.equal(BLESS_TOWER_CONFIG.floorsCount, 30);
  assert.equal(BLESS_TOWER_CONFIG.reservaUsd, 2000);
  assert.ok(BLESS_TOWER_CONFIG.amenities.length >= 6);
});

test("Bless Tower baseline contains all 110 units with correct models", () => {
  assert.equal(BLESS_TOWER_BASELINE_UNITS.length, 110);
  const libres = BLESS_TOWER_BASELINE_UNITS.filter((u) => u.estado === "LIBRE");
  const reservados = BLESS_TOWER_BASELINE_UNITS.filter((u) => u.estado === "RESERVADO");
  const vendidos = BLESS_TOWER_BASELINE_UNITS.filter((u) => u.estado === "VENDIDO");

  assert.equal(libres.length, 30);
  assert.ok(reservados.length > 0);
  assert.ok(vendidos.length > 0);
  assert.equal(libres.length + reservados.length + vendidos.length, 110);
});

test("Bless Tower parkings and storages are parsed", () => {
  assert.ok(BLESS_TOWER_PARKINGS.length >= 25);
  assert.ok(BLESS_TOWER_STORAGES.length >= 8);
});

test("Bless Tower floor plan maps to valid files", () => {
  for (const u of BLESS_TOWER_BASELINE_UNITS) {
    assert.ok(u.planoUrl.startsWith("/bless_tower/"));
  }
});

test("formatBlessUsd formats accurately", () => {
  const formatted = formatBlessUsd(43026);
  assert.ok(formatted.includes("43") && formatted.includes("026"));
});

test("parseBlessTowerCsv parses sample rows accurately", () => {
  const sample = `BLESS TOWER,,,,,,,,,,,,
NIVEL,MODELO,MOD.,NRO.,ESTADO,PRECIO $us,PRECIO $us CUOTAS 40% INICIAL,PRECIO $us CONTADO,"SUPERFICIE TOTAL m²",Área Interna / Área Balcón Según título / No Titulado,,,
PISO 3,1 DORMITORIO,U,1,LIBRE,"$103,322","$81,570","$69,987",54.38 m²,50.50 m²,3.88 m²,54.38,103322
,MONOAMBIENTE,B,2,VENDIDO,"$66,120","$50,582","$43,540",33.06 m²,30.00 m²,3.06 m²,,0`;

  const parsed = parseBlessTowerCsv(sample);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].codigo, "301");
  assert.equal(parsed[0].estado, "LIBRE");
  assert.equal(parsed[0].precioContado, 69987);
  assert.equal(parsed[1].codigo, "302");
  assert.equal(parsed[1].estado, "VENDIDO");
});
