import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BLESS_DREI_CONFIG,
  BLESS_DREI_BASELINE_UNITS,
  BLESS_DREI_PARKINGS,
  BLESS_DREI_STORAGES,
  formatBlessUsd,
  parseBlessDreiCsv,
} from "./blessDreiInventory";

test("Bless Drei config is valid", () => {
  assert.equal(BLESS_DREI_CONFIG.id, "bless-drei");
  assert.equal(BLESS_DREI_CONFIG.name, "Bless Drei");
  assert.equal(BLESS_DREI_CONFIG.builder, "Alta Vida Santa Cruz");
  assert.equal(BLESS_DREI_CONFIG.zone, "Equipetrol");
  assert.equal(BLESS_DREI_CONFIG.delivery, "Octubre 2026");
  assert.equal(BLESS_DREI_CONFIG.floorsCount, 16);
  assert.equal(BLESS_DREI_CONFIG.reservaUsd, 2000);
  assert.ok(BLESS_DREI_CONFIG.amenities.length >= 5);
});

test("Bless Drei baseline contains all 41 units with correct models", () => {
  assert.equal(BLESS_DREI_BASELINE_UNITS.length, 41);
  const libres = BLESS_DREI_BASELINE_UNITS.filter((u) => u.estado === "LIBRE");
  const reservados = BLESS_DREI_BASELINE_UNITS.filter((u) => u.estado === "RESERVADO");
  const vendidos = BLESS_DREI_BASELINE_UNITS.filter((u) => u.estado === "VENDIDO");

  assert.equal(libres.length, 27);
  assert.ok(reservados.length > 0);
  assert.ok(vendidos.length > 0);
  assert.equal(libres.length + reservados.length + vendidos.length, 41);
});

test("Bless Drei parkings and storages are parsed", () => {
  assert.equal(BLESS_DREI_PARKINGS.length, 10);
  assert.equal(BLESS_DREI_STORAGES.length, 4);
});

test("Bless Drei floor plan maps to valid files", () => {
  for (const u of BLESS_DREI_BASELINE_UNITS) {
    assert.ok(u.planoUrl.startsWith("/bless_drei/"));
  }
});

test("formatBlessUsd formats accurately", () => {
  const formatted = formatBlessUsd(38168);
  assert.ok(formatted.includes("38") && formatted.includes("168"));
});

test("parseBlessDreiCsv parses sample rows accurately", () => {
  const sample = `BLESS DREI,,,,,,,,,,,
NIVEL,MODELO,FACHADA,NRO.,MOD.,ESTADO,PRECIO $us CUOTAS 50% INICIAL,PRECIO $us CONTADO,"SUPERFICIE TOTAL m²",Área Interna / Área Balcón Según título / No Titulado,,
PISO 1,1 DORMITORIO,FRONTAL,1,I,LIBRE,"$63,484","$60,344",46.17 m²,46.17 m²,,
,MONOAMBIENTE,FRONTAL,2,H,LIBRE,"$61,971","$58,906",45.07 m²,45.07 m²,,"$1,375"`;

  const parsed = parseBlessDreiCsv(sample);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].codigo, "101");
  assert.equal(parsed[0].estado, "LIBRE");
  assert.equal(parsed[0].precioContado, 60344);
  assert.equal(parsed[1].codigo, "102");
  assert.equal(parsed[1].tipologia, "Monoambiente");
});
