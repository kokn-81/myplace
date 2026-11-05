import assert from "node:assert/strict";
import test from "node:test";
import {
  TRIVENTO_UNITS,
  availableUnits,
  cheapestAvailable,
  minRate,
} from "./triventoInventory.ts";

test("trivento inventory matches the 28 Oct 2026 chart", () => {
  assert.equal(TRIVENTO_UNITS.length, 25);
  assert.equal(availableUnits().length, 7);
  assert.equal(TRIVENTO_UNITS.filter((unit) => unit.estado === "RESERVADO").map((unit) => unit.codigo).join(","), "103,104");
  assert.equal(cheapestAvailable().codigo, "204");
  assert.equal(cheapestAvailable().precioContado, 51562);
  assert.equal(minRate("contado"), 1300);
  assert.equal(minRate("credito"), 1500);

  const expected = {
    "201": [59234, 67696],
    "204": [51562, 58928],
    "303": [62398, 71312],
    "305": [61334, 70770],
    "401": [61349.5, 69811.5],
    "404": [51562, 58928],
    "405": [63693, 70770],
  };
  for (const [codigo, [contado, credito]] of Object.entries(expected)) {
    const unit = TRIVENTO_UNITS.find((item) => item.codigo === codigo);
    assert.ok(unit);
    assert.equal(unit.estado, "LIBRE");
    assert.equal(unit.precioContado, contado);
    assert.equal(unit.precioCredito, credito);
  }

  for (const unit of TRIVENTO_UNITS) {
    if (unit.estado !== "LIBRE") {
      assert.equal(unit.precioContado, null);
      assert.equal(unit.precioCredito, null);
    }
  }
});
