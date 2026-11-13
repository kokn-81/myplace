import assert from "node:assert/strict";
import test from "node:test";

import { LUXE_MODELS, LUXE_TOWER_CONFIG, LUXE_UNITS, areaRangeForRooms, hasFreeRooms } from "./luxeTowerInventory";

test("el brochure de Luxe Tower conserva plantas, metros y agotados", () => {
  assert.equal(LUXE_UNITS.length, 140);
  assert.equal(LUXE_MODELS.length, 24);
  assert.equal(LUXE_UNITS.filter((unit) => unit.estado === "LIBRE").length, 78);
  assert.equal(LUXE_UNITS.filter((unit) => unit.estado === "AGOTADO").length, 62);
  assert.equal(LUXE_TOWER_CONFIG.delivery, "Noviembre 2026");
  assert.equal(LUXE_TOWER_CONFIG.builder, "Luxe Design SRL");
  assert.equal(LUXE_TOWER_CONFIG.lat, -17.7712594);
  assert.equal(LUXE_TOWER_CONFIG.lng, -63.1929074);

  const terraceG = LUXE_UNITS.find((unit) => unit.codigo === "4G");
  assert.equal(terraceG?.superficieM2, 160);
  assert.equal(terraceG?.estado, "LIBRE");
  assert.equal(LUXE_UNITS.find((unit) => unit.codigo === "4A")?.estado, "AGOTADO");
  assert.equal(LUXE_UNITS.find((unit) => unit.codigo === "5A")?.estado, "LIBRE");
  assert.equal(LUXE_UNITS.find((unit) => unit.codigo === "6A")?.estado, "AGOTADO");
  assert.equal(LUXE_UNITS.find((unit) => unit.codigo === "5E")?.estado, "AGOTADO");
  assert.equal(LUXE_UNITS.find((unit) => unit.codigo === "4E")?.estado, "LIBRE");
  assert.equal(LUXE_UNITS.find((unit) => unit.codigo === "17J")?.estado, "AGOTADO");
  assert.equal(LUXE_UNITS.find((unit) => unit.codigo === "4H")?.estado, "AGOTADO");
  assert.equal(LUXE_UNITS.find((unit) => unit.codigo === "12C")?.estado, "AGOTADO");
  assert.equal(LUXE_UNITS.find((unit) => unit.codigo === "4C")?.estado, "LIBRE");

  const oneBed = areaRangeForRooms("1");
  const twoBed = areaRangeForRooms("2");
  assert.equal(oneBed?.low, 63);
  assert.equal(oneBed?.high, 102.5);
  assert.equal(twoBed?.low, 79.9);
  assert.equal(twoBed?.high, 183);
  assert.equal(hasFreeRooms("1"), true);
  assert.equal(hasFreeRooms("2"), true);
  assert.equal(LUXE_UNITS.filter((unit) => unit.rooms === "1" && unit.estado === "LIBRE").length, 2);
});
