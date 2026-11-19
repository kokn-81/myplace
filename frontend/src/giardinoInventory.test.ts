import assert from "node:assert/strict";
import test from "node:test";
import {
  GIARDINO_UNITS,
  minCash,
  minCashForRooms,
  quoteGiardinoUnit,
  unitsForModel,
} from "./giardinoInventory.js";

test("Giardino publica el piso más bajo y deja fuera los pisos en reserva", () => {
  assert.equal(GIARDINO_UNITS.length, 180);
  assert.equal(minCash(), 132990);
  assert.equal(minCashForRooms("1"), 132990);
  assert.equal(minCashForRooms("2"), 251134);
  assert.equal(minCashForRooms("3"), 330412);
  const cheap = GIARDINO_UNITS.find((unit) => unit.codigo === "06-8");
  assert.ok(cheap);
  assert.equal(cheap.cash, 132990);
  assert.equal(cheap.totalM2, 59.72);
  assert.equal(unitsForModel("02").some((unit) => unit.piso >= 26), false);
  assert.equal(unitsForModel("01").some((unit) => unit.piso === 30), true);
  const ground = GIARDINO_UNITS.find((unit) => unit.codigo === "01-6");
  assert.ok(ground);
  assert.equal(ground.cash, 390515);
  assert.equal(ground.terraceM2, 74.27);
  assert.equal(ground.totalM2, 184.77);
});

test("Giardino calcula la reserva del 15% sin inventar un plan ni un precio por m²", () => {
  const unit = GIARDINO_UNITS.find((item) => item.codigo === "06-8");
  assert.ok(unit);
  const quote = quoteGiardinoUnit(unit);
  assert.equal(quote.total, 132990);
  assert.equal(quote.reserve, 19948.5);
  assert.equal(quote.balance, 113041.5);
  assert.equal(quote.percent, 15);
  assert.equal(GIARDINO_UNITS.every((item) => item.cash > 0), true);
});
