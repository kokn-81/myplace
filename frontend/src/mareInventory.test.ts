import assert from "node:assert/strict";
import test from "node:test";
import { MARE_UNITS, minCash, minCashForRooms, quoteMareUnit } from "./mareInventory.js";

test("Mare solo publica las unidades de la lista y el mínimo es el tipo 16", () => {
  assert.equal(MARE_UNITS.length, 8);
  assert.equal(minCash(), 101210);
  assert.equal(minCashForRooms("1"), 101210);
  assert.equal(minCashForRooms("2"), 156430);
  assert.equal(minCashForRooms("3"), 279620);
  assert.equal(MARE_UNITS.every((unit) => unit.rooms === "1" || unit.rooms === "2" || unit.rooms === "3"), true);
  const duplex = MARE_UNITS.find((unit) => unit.modelId === "20");
  assert.ok(duplex);
  assert.equal(duplex.cash, 160000);
  assert.equal(duplex.parkingIncluded, true);
  assert.equal(duplex.piso, "25 y 26");
  const vestidor = MARE_UNITS.find((unit) => unit.codigo === "16-12");
  assert.equal(vestidor?.note, "Vestidor incluido");
});

test("Mare cobra el precio publicado y no suma el parqueo", () => {
  const duplex = MARE_UNITS.find((unit) => unit.modelId === "20");
  assert.ok(duplex);
  const quote = quoteMareUnit(duplex);
  assert.equal(quote.total, 160000);
  assert.equal(quote.initial, 160000);
  assert.equal(quote.balance, null);
  assert.equal(quote.percent, 100);
  const low = MARE_UNITS.find((unit) => unit.codigo === "16-10");
  assert.ok(low);
  assert.equal(quoteMareUnit(low).total, 101210);
});
