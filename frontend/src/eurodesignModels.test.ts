import test from "node:test";
import assert from "node:assert/strict";
import { EURODESIGN_UNITS } from "./eurodesignInventory";
import { EURODESIGN_MODELOS, availableEurodesignModelUnits, matchesEurodesignModel } from "./eurodesignModels";

test("cada departamento pertenece a un solo modelo con el metraje de su ficha", () => {
  for (const unit of EURODESIGN_UNITS.filter((item) => item.rooms === 1 || item.rooms === 2)) {
    const matches = EURODESIGN_MODELOS.filter((model) => matchesEurodesignModel(model, unit));
    assert.equal(matches.length, 1, `Unidad ${unit.unitNumber}`);
    const area = Number.parseFloat(matches[0].area.replace(",", "."));
    assert.ok(Math.abs(area - unit.areaM2) < 0.01, `Unidad ${unit.unitNumber}: ${matches[0].area}`);
  }
});

test("el modelo 03 del piso 4 y el de pisos superiores mantienen fichas y unidades diferentes", () => {
  const terrace = EURODESIGN_MODELOS.find((model) => model.id === "d03p4")!;
  const standard = EURODESIGN_MODELOS.find((model) => model.id === "d03")!;
  const unit403 = EURODESIGN_UNITS.find((unit) => unit.unitNumber === "403")!;
  const unit503 = EURODESIGN_UNITS.find((unit) => unit.unitNumber === "503")!;
  assert.ok(matchesEurodesignModel(terrace, unit403));
  assert.ok(!matchesEurodesignModel(terrace, unit503));
  assert.ok(matchesEurodesignModel(standard, unit503));
  assert.ok(!matchesEurodesignModel(standard, unit403));
  assert.notEqual(terrace.preview, standard.preview);
  assert.notEqual(terrace.full, standard.full);
});

test("la cotización excluye vendidos, reservados y unidades de otros modelos", () => {
  const model = EURODESIGN_MODELOS.find((item) => item.id === "d03")!;
  const liveUnits = EURODESIGN_UNITS.map((unit) => ({
    ...unit,
    status: unit.unitNumber === "503" ? "disponible" as const
      : unit.unitNumber === "603" ? "reservado" as const
      : matchesEurodesignModel(model, unit) ? "vendido" as const : unit.status,
  }));
  assert.deepEqual(availableEurodesignModelUnits(model, liveUnits).map((unit) => unit.unitNumber), ["503"]);
  const soldOut = liveUnits.map((unit) => unit.unitNumber === "503" ? { ...unit, status: "vendido" as const } : unit);
  assert.equal(availableEurodesignModelUnits(model, soldOut).length, 0);
});
