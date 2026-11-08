import assert from "node:assert/strict";
import test from "node:test";
import { extractSearchCriteria, localSearchCatalog } from "./localSearch";
import { catalogPrice, propertyPath, propertyIdFromLocation, sortCatalogResults } from "./catalogPresentation";
import { onaInventory, blessTowerInventory } from "./projectInventory";
import type { Property } from "./types";

const property = (id: string, extra: Partial<Property> = {}): Property => ({ id, title: id, description: "", operation: "Venta", type: "Proyecto", price: 1, currency: "USD", rooms: 0, bathrooms: 1, area: "Equipetrol", zone: "Equipetrol", lat: -17.7, lng: -63.1, amenities: ["Piscina"], images: [], ...extra });
const catalog = [property("5", { title: "ONA", area: "Los Cusis", zone: "Los Cusis" }), property("bless-tower", { area: "Banzer", zone: "Banzer" }), property("garden-zen"), property("4", { title: "La Riviera", type: "Departamento", rooms: 2, price: 185000 }), property("3", { title: "Swissôtel", type: "Departamento", rooms: 2, price: 230000 })];

test("natural language parses currency before amount, separators, thousands and delivery", () => {
  assert.equal(extractSearchCriteria("2 dormitorios hasta USD 200.000").maxBudget, 200000);
  const result = extractSearchCriteria("2 dormitorios hasta 100 mil en Equipetrol");
  assert.equal(result.maxBudget, 100000);
  assert.equal(result.zone, "equipetrol");
  assert.equal(result.bedrooms, "2 Dorms");
  assert.equal(result.keywords, undefined);
  assert.equal(extractSearchCriteria("departamento con piscina cerca del 4to anillo").ring, "4");
  assert.equal(extractSearchCriteria("entrega 2028").deliveryYear, "2028");
});

test("named and empty searches never reinsert recommended projects", () => {
  assert.deepEqual(sortCatalogResults(localSearchCatalog("La Riviera", catalog).matchedProperties, "recommended").map(p => p.id), ["4"]);
  assert.deepEqual(sortCatalogResults(localSearchCatalog("Un edificio inexistente", catalog).matchedProperties, "recommended"), []);
  const apartments = catalog.filter(p => p.type === "Departamento");
  assert.deepEqual(sortCatalogResults(apartments, "recommended").map(p => p.id), ["4", "3"]);
});

test("delivery-only and ring-only phrases apply their criteria", () => {
  const listings = [property("a", { fechaEntrega: "Junio 2028", area: "4to anillo" }), property("b", { fechaEntrega: "Junio 2027", area: "Equipetrol" })];
  assert.deepEqual(localSearchCatalog("entrega 2028", listings).ids, ["a"]);
  assert.deepEqual(localSearchCatalog("cerca del 4to anillo", listings).ids, ["a"]);
});

test("bedroom and budget must match the same available unit; removable criteria recompute results", () => {
  const previous = onaInventory.get();
  try {
    onaInventory.set([{ ...previous[0], rooms: 1, cash: 60000, status: "disponible" }, { ...previous[0], rooms: 2, cash: 160000, status: "disponible" }]);
    assert.deepEqual(localSearchCatalog("2 dormitorios hasta USD 100000", [catalog[0]]).ids, []);
    const criteria = extractSearchCriteria("2 dormitorios hasta USD 200.000");
    assert.ok(localSearchCatalog("", catalog, criteria).ids.includes("5"));
    assert.ok(localSearchCatalog("", catalog, { ...criteria, maxBudget: undefined }).ids.includes("3"));
  } finally { onaInventory.set(previous); }
});

test("prices exclude sold units and share the inventory used by the quote", () => {
  const old = blessTowerInventory.get();
  try {
    blessTowerInventory.set([{ ...old[0], tipologia: "2 Dormitorios", estado: "LIBRE", precioContado: 102978 }, { ...old[0], tipologia: "2 Dormitorios", estado: "VENDIDO", precioContado: 90000 }]);
    assert.equal(catalogPrice(property("bless-tower"), "2 Dorms"), 102978);
    blessTowerInventory.set([]);
    assert.equal(catalogPrice(property("bless-tower")), null);
  } finally { blessTowerInventory.set(old); }
});

test("3 bedrooms is exact and more than 3 uses the matching unit prices", () => {
  const previous = onaInventory.get();
  const project = property("5");
  const listings = [project, property("three", { rooms: 3 }), property("four", { rooms: 4 }), property("five", { rooms: 5 })];
  try {
    onaInventory.set([
      { ...previous[0], rooms: 3, cash: 160000, status: "disponible" },
      { ...previous[0], rooms: 4, cash: 140000, status: "disponible" },
      { ...previous[0], rooms: 5, cash: 180000, status: "disponible" },
    ]);
    assert.deepEqual(localSearchCatalog("", listings, { bedrooms: "3 Dorms" }).ids, ["5", "three"]);
    assert.deepEqual(localSearchCatalog("", listings, { bedrooms: "4+ Dorms" }).ids, ["5", "four", "five"]);
    assert.equal(catalogPrice(project, "3 Dorms"), 160000);
    assert.equal(catalogPrice(project, "4+ Dorms"), 140000);
    assert.deepEqual(localSearchCatalog("", [project], { bedrooms: "3 Dorms", maxBudget: 150000 }).ids, []);
    assert.deepEqual(localSearchCatalog("", [project], { bedrooms: "4+ Dorms", maxBudget: 150000 }).ids, ["5"]);
  } finally { onaInventory.set(previous); }
});

test("apartment and project links round-trip and browser Back/Forward reads route paths", () => {
  for (const id of ["3", "4", "5", "bless-tower", "bless-drei", "domus-black"]) {
    const path = propertyPath({ id });
    const target = propertyIdFromLocation(new URL(path, "https://nia-web.com"));
    assert.equal(target, id === "5" ? "ona" : id);
  }
  assert.equal(propertyIdFromLocation(new URL("https://nia-web.com/")), null);
});

test("price and delivery sorting preserve filtered membership and unknown prices sort last", () => {
  const listings = [property("a", { price: 200000, fechaEntrega: "Junio 2028" }), property("b", { price: 100000, fechaEntrega: "Marzo 2027" }), property("c", { price: 0 })];
  assert.deepEqual(sortCatalogResults(listings, "price-asc").map(p => p.id), ["b", "a", "c"]);
  assert.deepEqual(sortCatalogResults(listings, "price-desc").map(p => p.id), ["a", "b", "c"]);
  assert.deepEqual(sortCatalogResults(listings, "delivery").map(p => p.id), ["b", "a", "c"]);
});
