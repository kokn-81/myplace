import assert from "node:assert/strict";
import test from "node:test";

import { ONA_BUILDER, ONA_DELIVERY, ONA_PARKINGS, ONA_RESERVE_USD, ONA_UNITS, formatOnaUsd } from "./onaInventory";

test("la tabla de ONA es la 1.a fase, sin precios inventados", () => {
  assert.equal(ONA_UNITS.length, 54);
  assert.equal(ONA_UNITS.filter((unit) => unit.status === "disponible").length, 38);
  assert.equal(ONA_UNITS.filter((unit) => unit.status === "vendido").length, 16);
  assert.equal(ONA_PARKINGS.length, 26);
  assert.equal(ONA_PARKINGS.filter((spot) => spot.status === "disponible").length, 22);
  assert.deepEqual(
    ONA_PARKINGS.filter((spot) => spot.status === "vendido").map((spot) => spot.code),
    ["1", "2", "3", "4"],
  );
  assert.ok(ONA_PARKINGS.filter((spot) => spot.kind === "simple").every((spot) => spot.price === 15000));
  assert.ok(ONA_PARKINGS.filter((spot) => spot.kind === "doble").every((spot) => spot.price === 22000 && spot.status === "disponible"));
  assert.equal(ONA_RESERVE_USD, 2000);
  assert.equal(ONA_DELIVERY, "Junio 2028");
  assert.equal(ONA_BUILDER, "Palacios Antunez");

  const entry = ONA_UNITS.find((unit) => unit.floor === 2 && unit.tipo === "3");
  assert.equal(entry?.cash, 40375);
  assert.equal(entry?.plan60.initial, 25194);
  assert.equal(entry?.plan60.total, 41990);
  assert.equal(entry?.plan40.initial, 17442);
  assert.equal(entry?.plan40.total, 43605);
  assert.equal(formatOnaUsd(40375), "40.375");
  assert.equal(formatOnaUsd(67687.5), "67.687,50");
  assert.ok(ONA_PARKINGS.every((spot) => spot.includesStorage));
  assert.ok(ONA_UNITS.every((unit) => Math.abs(unit.plan40.initial / unit.plan40.total - 0.4) < 0.01));
});
