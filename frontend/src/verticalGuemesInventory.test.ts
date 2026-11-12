import assert from "node:assert/strict";
import test from "node:test";

import {
  VERTICAL_GUEMES_CONFIG,
  VERTICAL_MODELS,
  VERTICAL_UNITS,
  formatVerticalUsd,
  minCash,
  minCashForRooms,
  minRate,
  quoteVerticalUnit,
} from "./verticalGuemesInventory";

test("la lista de Vertical Güemes conserva precios, estados y el mínimo libre", () => {
  assert.equal(VERTICAL_UNITS.length, 59);
  assert.equal(VERTICAL_MODELS.length, 7);
  assert.equal(VERTICAL_UNITS.filter((unit) => unit.estado === "LIBRE").length, 23);
  assert.equal(VERTICAL_UNITS.filter((unit) => unit.estado === "NO_DISPONIBLE").length, 36);
  assert.equal(VERTICAL_GUEMES_CONFIG.delivery, "2028");
  assert.equal(VERTICAL_GUEMES_CONFIG.builder, "Constructora Mediterráneo");
  assert.equal(VERTICAL_GUEMES_CONFIG.lat, -17.7699027);
  assert.equal(VERTICAL_GUEMES_CONFIG.lng, -63.1910632);

  const terraza = VERTICAL_UNITS.find((unit) => unit.codigo === "3A");
  assert.equal(terraza?.cash, 87692.8);
  assert.equal(terraza?.estado, "LIBRE");
  assert.equal(VERTICAL_UNITS.find((unit) => unit.codigo === "3C")?.estado, "NO_DISPONIBLE");
  assert.equal(VERTICAL_UNITS.find((unit) => unit.codigo === "4B")?.cash, 72369.5);
  assert.equal(VERTICAL_UNITS.find((unit) => unit.codigo === "13B")?.cash, 119226.25);
  assert.equal(VERTICAL_UNITS.find((unit) => unit.codigo === "19B")?.estado, "NO_DISPONIBLE");

  assert.equal(minCash(), 72369.5);
  assert.equal(minCashForRooms("1"), 72369.5);
  assert.equal(minCashForRooms("2"), 119226.25);
  assert.equal(minCashForRooms("3"), null);
  assert.equal(minRate("contado"), 1425);
  assert.equal(minRate("aporte75"), 1450);
  assert.equal(minRate("aporte50"), 1475);
  assert.equal(formatVerticalUsd(72369.5), "72.369,50");
  assert.equal(formatVerticalUsd(1425), "1.425");

  const unit = VERTICAL_UNITS.find((item) => item.codigo === "4B");
  assert.ok(unit);
  const quote = quoteVerticalUnit(unit, "aporte75", "none");
  assert.ok(quote);
  assert.equal(quote.percent, 75);
  assert.equal(money(quote.initial + (quote.balance ?? 0)), quote.total);
  assert.equal(quote.total, 73617.25);

  const withParking = quoteVerticalUnit(unit, "contado", "parking");
  assert.equal(withParking?.total, 72369.5 + 13580);
  assert.equal(withParking?.balance, null);
});

function money(value: number) {
  return Math.round(value * 100) / 100;
}
