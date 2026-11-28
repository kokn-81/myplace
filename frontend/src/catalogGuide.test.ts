import assert from "node:assert/strict";
import test from "node:test";
import { skipCatalogQuestion } from "./catalogGuide";
import type { LocalSearchCriteria } from "./localSearch";

test("permite llegar al presupuesto sin elegir dormitorios ni zona", () => {
  const bedrooms = skipCatalogQuestion("bedrooms", {}, true)!;
  assert.equal(bedrooms.nextStep, "zone");
  const zone = skipCatalogQuestion(bedrooms.nextStep, bedrooms.criteria, true)!;
  assert.equal(zone.nextStep, "budget");
  const criteria = { ...zone.criteria, maxBudget: 100000 };
  const delivery = skipCatalogQuestion("delivery", criteria, true)!;
  assert.equal(delivery.nextStep, "results");
  assert.equal(delivery.criteria.maxBudget, 100000);
  assert.equal(delivery.criteria.bedrooms, undefined);
  assert.equal(delivery.criteria.zone, undefined);
  assert.equal(delivery.criteria.deliveryYear, undefined);
});

test("saltar una pregunta borra su respuesta anterior y conserva los demás filtros", () => {
  const criteria: LocalSearchCriteria = { bedrooms: "2 Dorms", zone: "equipetrol", minBudget: 70000, maxBudget: 150000, budgetCurrency: "USD", deliveryYear: "2028", amenities: ["piscina"] };
  const original = structuredClone(criteria);
  for (const [step, cleared] of [
    ["bedrooms", ["bedrooms"]], ["zone", ["zone"]],
    ["budget", ["minBudget", "maxBudget"]], ["delivery", ["deliveryYear"]],
  ] as const) {
    const result = skipCatalogQuestion(step, criteria, true)!;
    for (const key of Object.keys(criteria) as (keyof LocalSearchCriteria)[]) {
      if ((cleared as readonly string[]).includes(key)) assert.equal(result.criteria[key], undefined);
      else assert.deepEqual(result.criteria[key], criteria[key]);
    }
    assert.deepEqual(criteria, original);
  }
});

test("se puede saltar todo lo opcional y terminar sin restricciones", () => {
  let result = skipCatalogQuestion("bedrooms", {}, true)!;
  result = skipCatalogQuestion(result.nextStep, result.criteria, true)!;
  result = skipCatalogQuestion(result.nextStep, result.criteria, true)!;
  assert.equal(result.nextStep, "delivery");
  result = skipCatalogQuestion(result.nextStep, result.criteria, true)!;
  assert.equal(result.nextStep, "results");
  assert.equal(Object.values(result.criteria).some(value => value !== undefined), false);
});

test("sin pregunta de entrega, saltar presupuesto termina directamente en resultados", () => {
  const result = skipCatalogQuestion("budget", { zone: "norte", maxBudget: 100000 }, false)!;
  assert.equal(result.nextStep, "results");
  assert.equal(result.criteria.zone, "norte");
  assert.equal(result.criteria.maxBudget, undefined);
  for (const step of ["category", "results", "sort"] as const) assert.equal(skipCatalogQuestion(step, {}, true), null);
});
