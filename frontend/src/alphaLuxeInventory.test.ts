import assert from "node:assert/strict";
import test from "node:test";

import {
  ALPHA_LUXE_CONFIG,
  ALPHA_MODELS,
  ALPHA_UNITS,
  formatAlphaUsd,
  minCash,
  minCashForRooms,
  minRate,
  quoteAlphaUnit,
} from "./alphaLuxeInventory";
import { getProjectAvailableUnits } from "./projectInventory";

const unit = (codigo: string) => {
  const found = ALPHA_UNITS.find((item) => item.codigo === codigo);
  if (!found) throw new Error(codigo);
  return found;
};

test("la lista del 27/10/2026 publica 62 departamentos con el precio al contado", () => {
  assert.equal(ALPHA_UNITS.length, 62);
  assert.equal(ALPHA_MODELS.length, 9);
  assert.equal(ALPHA_UNITS.every((item) => item.estado === "LIBRE"), true);
  assert.equal(ALPHA_UNITS.every((item) => item.cashCents > 0), true);
  assert.equal(ALPHA_LUXE_CONFIG.delivery, "Febrero 2028");
  assert.equal(ALPHA_LUXE_CONFIG.builder, "Luxe Design");
  assert.equal(ALPHA_LUXE_CONFIG.homes, 102);
  assert.equal(ALPHA_LUXE_CONFIG.listed, 62);
  assert.equal(ALPHA_LUXE_CONFIG.lat, -17.7692349);
  assert.equal(ALPHA_LUXE_CONFIG.lng, -63.1782311);
  assert.equal(ALPHA_LUXE_CONFIG.parkingUsd, 12000);
  assert.equal(ALPHA_LUXE_CONFIG.parkingStorageUsd, 16000);
  assert.equal(ALPHA_LUXE_CONFIG.storageUsd, 4000);

  const counts = Object.fromEntries(ALPHA_MODELS.map((model) => [model.tipo, model.floors.length]));
  assert.deepEqual(counts, { 1: 12, 2: 1, 3: 5, 4: 13, 5: 13, 6: 12, 7: 2, 8: 2, 9: 2 });
  assert.equal(unit("4-1").rooms, "2");
  assert.equal(unit("4-2").rooms, "1");
  assert.equal(ALPHA_MODELS.find((model) => model.tipo === 1)?.where, "Con balcón");
  assert.equal(ALPHA_MODELS.find((model) => model.tipo === 7)?.where, "1 dormitorio");
  assert.equal(ALPHA_UNITS.some((item) => item.codigo === "4-3"), false);
  assert.equal(ALPHA_UNITS.some((item) => item.codigo === "16-5"), false);
  assert.equal(unit("17-5").piso, 17);
  assert.equal(unit("18-1").piso, 18);

  assert.equal(formatAlphaUsd(unit("4-1").plan40), "129.940,80");
  assert.equal(formatAlphaUsd(unit("4-1").plan50), "124.291,20");
  assert.equal(formatAlphaUsd(unit("4-1").cash), "115.816,80");
  assert.equal(formatAlphaUsd(unit("4-2").cash), "70.491,30");
  assert.equal(formatAlphaUsd(unit("4-7").cash), "50.479,50");
  assert.equal(formatAlphaUsd(unit("4-8").cash), "47.436,90");
  assert.equal(formatAlphaUsd(unit("4-9").cash), "47.436,90");
  assert.equal(formatAlphaUsd(unit("11-6").cash), "70.187,90");
  assert.equal(formatAlphaUsd(unit("17-5").cash), "69.281,80");
  assert.equal(formatAlphaUsd(unit("18-1").cash), "119.326,40");
  assert.equal(formatAlphaUsd(minCash()), "47.436,90");
  assert.equal(formatAlphaUsd(minCashForRooms("1") as number), "47.436,90");
  assert.equal(formatAlphaUsd(minCashForRooms("2") as number), "115.816,80");
  assert.equal(minRate("contado"), 1353);
  assert.equal(minRate("aporte50"), 1452);
  assert.equal(minRate("aporte40"), 1518);

  const cash = quoteAlphaUnit(unit("4-1"), "contado", "none");
  assert.equal(cash.balance, null);
  assert.equal(formatAlphaUsd(cash.total), "115.816,80");
  assert.equal(formatAlphaUsd(cash.initial), "115.816,80");

  const plan = quoteAlphaUnit(unit("4-1"), "aporte40", "parking");
  assert.equal(formatAlphaUsd(plan.department), "129.940,80");
  assert.equal(formatAlphaUsd(plan.initial), "63.976,32");
  assert.equal(formatAlphaUsd(plan.balance as number), "77.964,48");
  assert.equal(formatAlphaUsd(plan.total), "141.940,80");
  assert.equal(plan.percent, 40);

  const half = quoteAlphaUnit(unit("4-1"), "aporte50", "none");
  assert.equal(formatAlphaUsd(half.initial), "62.145,60");
  assert.equal(formatAlphaUsd(half.balance as number), "62.145,60");

  const catalog = getProjectAvailableUnits("alpha-luxe");
  assert.equal(catalog?.length, 62);
  assert.equal(catalog?.every((item) => item.price > 0), true);
  assert.equal(formatAlphaUsd(Math.min(...(catalog || []).map((item) => item.price))), "47.436,90");
  assert.equal(getProjectAvailableUnits("luxe-alpha")?.length, 62);
});
