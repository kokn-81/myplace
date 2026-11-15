import assert from "node:assert/strict";
import test from "node:test";
import {
  SKY_LEVEL_UNITS,
  minApartmentCash,
  minCashForRooms,
  minRate,
  quoteSkyLevelUnit,
} from "./skyLevelInventory.js";

test("Sky Level cotiza el modelo 2 al contado y al 20% con parqueo", () => {
  const unit = SKY_LEVEL_UNITS.find((item) => item.codigo === "m2");
  assert.ok(unit);
  const cash = quoteSkyLevelUnit(unit, "contado", "none");
  assert.equal(cash.department, 132750);
  assert.equal(cash.total, 132750);
  assert.equal(cash.initial, 132750);
  assert.equal(cash.balance, null);
  assert.equal(cash.rate, 1500);

  const plan = quoteSkyLevelUnit(unit, "aporte20", "parkingStorage");
  assert.equal(plan.department, 141600);
  assert.equal(plan.initial, 43320);
  assert.equal(plan.balance, 113280);
  assert.equal(plan.total, 156600);
  assert.equal(plan.parking, 15000);
  assert.equal(plan.percent, 20);
});

test("Sky Level no usa una tipología vendida como precio mínimo", () => {
  assert.equal(minApartmentCash(), 78000);
  assert.equal(minCashForRooms("1"), 78000);
  assert.equal(minCashForRooms("2"), 132750);
  assert.equal(minCashForRooms("local"), 265000);
  assert.equal(minRate("contado"), 1500);
  assert.equal(minRate("aporte20"), 1600);
  assert.equal(SKY_LEVEL_UNITS.filter((unit) => unit.estado === "LIBRE" && unit.rooms !== "local").length, 3);
  const sold = SKY_LEVEL_UNITS.find((unit) => unit.codigo === "m5");
  assert.ok(sold);
  assert.throws(() => quoteSkyLevelUnit(sold, "contado", "none"));
});

test("Sky Level mantiene el local de 106 m² fuera del mínimo de departamentos", () => {
  const local = SKY_LEVEL_UNITS.find((unit) => unit.codigo === "c106");
  assert.ok(local);
  const quote = quoteSkyLevelUnit(local, "aporte20", "none");
  assert.equal(quote.department, 275600);
  assert.equal(quote.initial, 55120);
  assert.equal(quote.balance, 220480);
  assert.equal(quote.rate, 2600);
  assert.ok(minApartmentCash() < local.cash);
});
