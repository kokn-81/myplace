import { test } from "node:test";
import assert from "node:assert/strict";
import { BETON_UNITS, minContado, quoteBetonUnit } from "./betonBrutInventory";

test("Béton Brut II conserva la lista del 25/10/2026", () => {
  assert.equal(BETON_UNITS.length, 40);
  const sold = BETON_UNITS.filter((unit) => unit.estado === "VENDIDO").map((unit) => unit.codigo).sort();
  assert.deepEqual(sold, ["5F", "6A", "6E", "7D"]);
  for (const codigo of sold) {
    const unit = BETON_UNITS.find((item) => item.codigo === codigo);
    assert.equal(unit?.precioContado, null);
    assert.equal(unit?.precioPlan, null);
  }
  const unit1D = BETON_UNITS.find((unit) => unit.codigo === "1D");
  assert.equal(unit1D?.precioContado, 97546);
  assert.equal(unit1D?.precioPlan, 103284);
  assert.equal(minContado(), 97546);
  const unit1A = BETON_UNITS.find((unit) => unit.codigo === "1A");
  assert.equal(unit1A?.superficieM2, 149.65);
  assert.equal(unit1A?.precioContado, 254405);
  assert.ok(unit1A);
  const cash = quoteBetonUnit(unit1A, "contado", "none");
  assert.equal(cash?.total, 254405);
  assert.equal(cash?.balance, null);
  const financed = quoteBetonUnit(unit1A, "plan", "auto");
  assert.equal(financed?.department, 269370);
  assert.equal(financed?.parking, 13000);
  assert.equal(financed?.total, 269370 + 13000);
  assert.equal((financed?.initial || 0) + (financed?.installments || 0) + (financed?.balance || 0), 269370);
});
