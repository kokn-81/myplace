import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateDeliveryCountdown,
  formatConstructionProgress,
  parseDeliveryDate,
} from "./projectCountdown";

test("parseDeliveryDate parses ISO and text dates", () => {
  assert.deepEqual(parseDeliveryDate("2026-12"), { year: 2026, month: 11 });
  assert.deepEqual(parseDeliveryDate("2027-03-15"), { year: 2027, month: 2 });
  assert.deepEqual(parseDeliveryDate("Diciembre 2026"), { year: 2026, month: 11 });
  assert.deepEqual(parseDeliveryDate("marzo 2027"), { year: 2027, month: 2 });
  assert.equal(parseDeliveryDate(""), null);
  assert.equal(parseDeliveryDate(null), null);
});

test("calculateDeliveryCountdown calculates remaining months correctly", () => {
  // Reference date: September 2026
  const refDate = new Date(2026, 8, 15); // Sept 15, 2026

  // December 2026 is 3 months away
  const resultDec = calculateDeliveryCountdown("2026-12", refDate);
  assert.ok(resultDec);
  assert.equal(resultDec.monthsLeft, 3);
  assert.equal(resultDec.shortLabel, "En 3 meses");
  assert.equal(resultDec.label, "Entrega en 3 meses (Diciembre 2026)");
  assert.equal(resultDec.isImmediate, false);

  // October 2026 is 1 month away
  const resultOct = calculateDeliveryCountdown("2026-10", refDate);
  assert.ok(resultOct);
  assert.equal(resultOct.monthsLeft, 1);
  assert.equal(resultOct.shortLabel, "En 1 mes");
  assert.equal(resultOct.isImmediate, false);

  // August 2026 (past) is immediate
  const resultPast = calculateDeliveryCountdown("2026-08", refDate);
  assert.ok(resultPast);
  assert.equal(resultPast.isImmediate, true);
  assert.equal(resultPast.shortLabel, "Entrega inmediata");
});

test("formatConstructionProgress builds descriptive label", () => {
  assert.equal(formatConstructionProgress(65, "Obra fina"), "65% · Obra fina");
  assert.equal(formatConstructionProgress(40, null), "40% de avance");
  assert.equal(formatConstructionProgress(null, "En planos / Pozo"), "En planos / Pozo");
  assert.equal(formatConstructionProgress(null, null), "");
});
