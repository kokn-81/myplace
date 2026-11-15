import assert from "node:assert/strict";
import test from "node:test";
import {
  SKY_EQUINOX_UNITS,
  minCash,
  minCashForRooms,
  minRate,
  quoteSkyEquinoxUnit,
} from "./skyEquinoxInventory.js";

test("Sky Equinox usa el total publicado y no recalcula la banda alta", () => {
  const low = SKY_EQUINOX_UNITS.find((unit) => unit.codigo === "b-4-16");
  const high = SKY_EQUINOX_UNITS.find((unit) => unit.codigo === "b-17-20");
  assert.ok(low && high);
  assert.equal(low.cash, 74850);
  assert.equal(high.cash, 74850);
  assert.equal(high.superficieM2, 48.8);
  const quoted = quoteSkyEquinoxUnit(high, "contado");
  assert.equal(quoted.total, 74850);
  assert.equal(quoted.balance, null);
  assert.equal(quoted.rate, null);

  const plan = quoteSkyEquinoxUnit(low, "aporte20");
  assert.equal(plan.department, 79840);
  assert.equal(plan.initial, 15968);
  assert.equal(plan.balance, 63872);
  assert.equal(plan.rate, 1600);
});

test("Sky Equinox publica studio y un dormitorio, sin vendidos", () => {
  assert.equal(SKY_EQUINOX_UNITS.length, 5);
  assert.equal(minCash(), 52800);
  assert.equal(minCashForRooms("0"), 52800);
  assert.equal(minCashForRooms("1"), 74850);
  assert.equal(minRate("contado"), 1500);
  assert.equal(minRate("aporte20"), 1600);
  const studio = SKY_EQUINOX_UNITS.find((unit) => unit.codigo === "c-4-20");
  assert.ok(studio);
  assert.equal(quoteSkyEquinoxUnit(studio, "contado").total, 52800);
  const upperA = SKY_EQUINOX_UNITS.find((unit) => unit.codigo === "a-17-20");
  assert.ok(upperA);
  assert.equal(quoteSkyEquinoxUnit(upperA, "aporte20").total, 88480);
});
