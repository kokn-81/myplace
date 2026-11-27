import assert from "node:assert/strict";
import test from "node:test";
import { WESTGATE_CONFIG, WESTGATE_MODELS, WESTGATE_PLANS, WESTGATE_UNITS, quoteWestgateUnit, westgateAvailableAreaRange, westgateContactText, westgateMinCash } from "./westgateTower";
import { isProjectOrPreventa, isTargetProject, isWestgateTowerProperty, isWestgateTowerSlug } from "./projectIdentity";
import { getProjectAvailableUnits } from "./projectInventory";
import { catalogPrice, propertyIdFromLocation, propertyPath } from "./catalogPresentation";
import { localSearchCatalog } from "./localSearch";
import { getProjectCardSummary } from "./projectCardSummary";
import type { Property } from "./types";

const project: Property = { id: "westgate-tower", title: "Westgate Tower", description: "Frente a Fexpocruz", type: "Proyecto (preventa)", operation: "Venta", rooms: 1, bathrooms: 1, price: westgateMinCash()!, currency: "USD", area: WESTGATE_CONFIG.address, zone: WESTGATE_CONFIG.zone, lat: WESTGATE_CONFIG.lat, lng: WESTGATE_CONFIG.lng, images: [], amenities: ["Piscina"], fechaEntrega: WESTGATE_CONFIG.delivery };

test("Westgate conserva las 76 filas del PDF, cuatro unidades de un dormitorio y la reserva 703", () => {
  assert.equal(WESTGATE_UNITS.length, 76);
  assert.equal(new Set(WESTGATE_UNITS.map(unit => unit.code)).size, 76);
  const free = WESTGATE_UNITS.filter(unit => unit.status === "LIBRE");
  assert.equal(free.length, 75);
  assert.deepEqual(free.filter(unit => unit.rooms === 1).map(unit => unit.code), ["401", "402", "411", "412"]);
  assert.deepEqual(WESTGATE_UNITS.filter(unit => unit.status === "RESERVADO").map(unit => unit.code), ["703"]);
  assert.equal(westgateMinCash(1), 68040);
  assert.equal(westgateMinCash(2), 78960);
  assert.equal(westgateMinCash(0), null);
  assert.deepEqual(westgateAvailableAreaRange(1), { low: 56.7, high: 58 });
  assert.equal(WESTGATE_UNITS.some(unit => unit.floor > 14), false);
});

test("los modelos sin filas no se inventan disponibles y cada unidad coincide con su planta", () => {
  assert.equal(WESTGATE_MODELS.length, 20);
  for (const unit of WESTGATE_UNITS) {
    const model = WESTGATE_MODELS.find(model => model.id === unit.modelId);
    assert.ok(model, unit.code);
    assert.equal(model.areaM2, unit.areaM2, unit.code);
    assert.equal(model.rooms, unit.rooms, unit.code);
    assert.ok(model.floors.includes(unit.floor), unit.code);
  }
  for (const id of ["m01", "m06", "m07", "m12", "d403", "d404", "d409", "d410"]) assert.equal(westgateMinCash(undefined, id), null);
});

test("el cotizador usa el total propio de cada plan, conserva centavos y excluye la reserva", () => {
  const unit = WESTGATE_UNITS.find(unit => unit.code === "411")!;
  assert.deepEqual(quoteWestgateUnit(unit, "contado"), { total: 68040, initial: 68040, balance: null, percent: 100, rate: 1200 });
  assert.deepEqual(quoteWestgateUnit(unit, "aporte50"), { total: 73710, initial: 36855, balance: 36855, percent: 50, rate: 1300 });
  assert.deepEqual(quoteWestgateUnit(unit, "aporte30"), { total: 76545, initial: 22963.5, balance: 53581.5, percent: 30, rate: 1350 });
  assert.equal(quoteWestgateUnit(WESTGATE_UNITS.find(unit => unit.code === "502")!, "aporte30").total, 90240);
  assert.equal(quoteWestgateUnit(WESTGATE_UNITS.find(unit => unit.code === "1302")!, "contado").total, 86480);
  assert.throws(() => quoteWestgateUnit(WESTGATE_UNITS.find(unit => unit.code === "703")!, "contado"));
  for (const available of WESTGATE_UNITS.filter(unit => unit.status === "LIBRE")) for (const plan of WESTGATE_PLANS) {
    const quote = quoteWestgateUnit(available, plan.id);
    assert.equal(Math.round(quote.initial * 100) + Math.round((quote.balance || 0) * 100), Math.round(quote.total * 100));
  }
});

test("el catálogo y los filtros usan las unidades libres y el precio del dormitorio elegido", () => {
  assert.equal(getProjectAvailableUnits(project.id)?.length, 75);
  assert.equal(catalogPrice(project, "1 Dorm"), 68040);
  assert.equal(catalogPrice(project, "2 Dorms"), 78960);
  assert.deepEqual(localSearchCatalog("", [project], { bedrooms: "2 Dorms", maxBudget: 78000 }).ids, []);
  assert.deepEqual(localSearchCatalog("", [project], { bedrooms: "2 Dorms", maxBudget: 80000 }).ids, [project.id]);
  assert.equal(getProjectCardSummary(project)?.delivery, "Septiembre 2028");
  assert.deepEqual(getProjectCardSummary(project)?.bedrooms, [1, 2]);
});

test("Westgate abre como proyecto con ruta propia y no captura otros proyectos de la marca", () => {
  assert.ok(isWestgateTowerProperty(project));
  assert.ok(isWestgateTowerSlug("WESTGATE TOWER"));
  assert.ok(isWestgateTowerSlug("westgate"));
  assert.ok(isProjectOrPreventa(project));
  assert.ok(isTargetProject(project, "westgate-tower"));
  assert.equal(isWestgateTowerProperty({ ...project, id: "otra", title: "Westgate Boutique" }), false);
  assert.equal(isWestgateTowerProperty({ ...project, id: "reventa", type: "Departamento" }), false);
  assert.equal(propertyPath(project), "/westgate-tower");
  assert.equal(propertyIdFromLocation(new URL(propertyPath(project), "https://nia-web.com")), project.id);
});

test("WhatsApp tiene tres líneas con la unidad y el plan elegidos", () => {
  const unit = WESTGATE_UNITS.find(unit => unit.code === "411")!;
  const model = WESTGATE_MODELS.find(model => model.id === unit.modelId)!;
  const text = westgateContactText(model, unit, "aporte30");
  assert.equal(text.split("\n").length, 3);
  assert.match(text, /unidad 411, piso 4/);
  assert.match(text, /Plan: Inicial 30%/);
  assert.equal(westgateContactText(WESTGATE_MODELS.find(model => model.id === "m06")!, null, "contado").split("\n").length, 3);
});
