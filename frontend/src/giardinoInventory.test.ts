import assert from "node:assert/strict";
import test from "node:test";
import {
  GIARDINO_MODELS,
  GIARDINO_UNITS,
  areaRangeForRooms,
  minCash,
  minCashForRooms,
  quoteGiardinoUnit,
  unitsForModel,
} from "./giardinoInventory.js";
import { getProjectAvailableUnits } from "./projectInventory";
import { catalogPrice } from "./catalogPresentation";
import { localSearchCatalog } from "./localSearch";
import type { Property } from "./types";

test("Giardino publica solo las 20 unidades visibles en la disponibilidad del 27/11/2026", () => {
  assert.equal(GIARDINO_UNITS.length, 20);
  assert.equal(new Set(GIARDINO_UNITS.map(unit => unit.codigo)).size, 20);
  const expectedFloors: Record<string, number[]> = {
    "01": [6], "02": [18, 11, 6], "03": [16, 14, 13, 9, 8], "04": [11, 8, 6],
    "05": [8, 6], "06": [9, 7, 6], "08": [23], "09": [26, 19],
  };
  for (const [model, floors] of Object.entries(expectedFloors)) {
    assert.deepEqual(unitsForModel(model).map(unit => unit.piso), floors, model);
  }
  assert.equal(minCash(), 134948);
  assert.equal(minCashForRooms("1"), 134948);
  assert.equal(minCashForRooms("2"), 251134);
  assert.equal(minCashForRooms("3"), 333505);
  assert.deepEqual(areaRangeForRooms("3"), { low: 149.09, high: 154.98 });
  const cheap = GIARDINO_UNITS.find((unit) => unit.codigo === "06-6");
  assert.ok(cheap);
  assert.equal(cheap.cash, 134948);
  assert.equal(cheap.totalM2, 60.87);
  const ground = GIARDINO_UNITS.find((unit) => unit.codigo === "01-6");
  assert.ok(ground);
  assert.equal(ground.cash, 411049);
  assert.equal(ground.terraceM2, 74.95);
  assert.equal(ground.totalM2, 185.45);
});

test("Giardino calcula la reserva del 15% sin inventar un plan ni un precio por m²", () => {
  const unit = GIARDINO_UNITS.find((item) => item.codigo === "06-6");
  assert.ok(unit);
  const quote = quoteGiardinoUnit(unit);
  assert.equal(quote.total, 134948);
  assert.equal(quote.reserve, 20242.2);
  assert.equal(quote.balance, 114705.8);
  assert.equal(quote.percent, 15);
  assert.equal(GIARDINO_UNITS.every((item) => item.cash > 0), true);
  for (const available of GIARDINO_UNITS) {
    const result = quoteGiardinoUnit(available);
    assert.equal(Math.round(result.reserve * 100) + Math.round(result.balance * 100), available.cashCents);
  }
});

test("las superficies de las unidades vigentes suman interior y terraza", () => {
  for (const unit of GIARDINO_UNITS) {
    const model = GIARDINO_MODELS.find(model => model.id === unit.modelId);
    assert.ok(model);
    assert.equal(unit.rooms, model.rooms);
    assert.equal(Math.round((model.internalM2 + unit.terraceM2) * 100), Math.round(unit.totalM2 * 100), unit.codigo);
  }
});

test("los filtros y el precio de portada excluyen las unidades retiradas", () => {
  const project = { id: "giardino", title: "Giardino", type: "Proyecto (preventa)", operation: "Venta", rooms: 1, price: 132990, images: [], amenities: [] } as unknown as Property;
  assert.equal(getProjectAvailableUnits(project.id)?.length, 20);
  assert.equal(catalogPrice(project), 134948);
  assert.equal(catalogPrice(project, "3 Dorms"), 333505);
  assert.deepEqual(localSearchCatalog("", [project], { bedrooms: "3 Dorms", maxBudget: 331000 }).ids, []);
  assert.deepEqual(localSearchCatalog("", [project], { bedrooms: "3 Dorms", maxBudget: 334000 }).ids, [project.id]);
  assert.deepEqual(localSearchCatalog("", [project], { bedrooms: "1 Dorm", maxBudget: 133000 }).ids, []);
});
