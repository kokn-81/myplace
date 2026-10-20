import { test } from "node:test";
import assert from "node:assert/strict";
import { isOnaProperty, isEurodesignProperty, isDomusProperty, isProjectOrPreventa } from "./pages/MapPage";
import catalogSnapshot from "../public/catalog-snapshot.json";
import { Property } from "./types";

test("isOnaProperty: reconoce ONA Residences pero no propiedades con la palabra 'ZONA'", () => {
  const onaProp: Partial<Property> = { id: "5", title: "ONA Residences Preventa - Av. Los Cusis" };
  assert.equal(isOnaProperty(onaProp as Property), true);

  const falseZona1: Partial<Property> = { id: "101", title: "Hermoso Depto en ZONA Norte" };
  const falseZona2: Partial<Property> = { id: "102", title: "Casa en venta Zona Equipetrol" };
  const falseZona3: Partial<Property> = { id: "103", title: "Terreno en Zona Sur" };
  const falseOnaListing: Partial<Property> = { id: "1325", title: "Depto 2 Dorm. · Edificio Ona Residence" };

  assert.equal(isOnaProperty(falseZona1 as Property), false);
  assert.equal(isOnaProperty(falseZona2 as Property), false);
  assert.equal(isOnaProperty(falseZona3 as Property), false);
  assert.equal(isOnaProperty(falseOnaListing as Property), false);
});

test("isEurodesignProperty: reconoce Tower Eurodesign pero no Soho ni alquileres secundarios", () => {
  const eurodesign: Partial<Property> = { id: "1816", title: "Tower Eurodesign · Equipetrol Norte" };
  assert.equal(isEurodesignProperty(eurodesign as Property), true);

  const eurodesignSohoRent: Partial<Property> = {
    id: "661",
    title: "Depto Amoblado 3 Dorm. - Eurodesign Soho",
    operation: "Alquiler",
  };
  assert.equal(isEurodesignProperty(eurodesignSohoRent as Property), false);
});

test("isDomusProperty: reconoce los 7 desarrollos DOMUS pero no reventas ni alquileres individuales", () => {
  const domusBlack: Partial<Property> = { id: "domus-black", title: "DOMUS BLACK · Equipetrol Norte" };
  const domusGold: Partial<Property> = { id: "domus-gold", title: "DOMUS GOLD · Equipetrol San Martín" };
  const domusOnix: Partial<Property> = { id: "domus-onix", title: "DOMUS ONIX · Av. Radial 23 & Sirari" };
  const domusInsignia: Partial<Property> = { id: "domus-insignia", title: "DOMUS INSIGNIA · Plaza Italia" };
  const domusLuxury: Partial<Property> = { id: "domus-luxury", title: "DOMUS LUXURY · Zona Norte Las Brisas" };
  const domusTower: Partial<Property> = { id: "domus-tower", title: "DOMUS TOWER · Equipetrol Norte" };
  const domusInfinity: Partial<Property> = { id: "domus-infinity", title: "DOMUS INFINITY · Los Tajibos" };

  assert.equal(isDomusProperty(domusBlack as Property), true);
  assert.equal(isDomusProperty(domusGold as Property), true);
  assert.equal(isDomusProperty(domusOnix as Property), true);
  assert.equal(isDomusProperty(domusInsignia as Property), true);
  assert.equal(isDomusProperty(domusLuxury as Property), true);
  assert.equal(isDomusProperty(domusTower as Property), true);
  assert.equal(isDomusProperty(domusInfinity as Property), true);

  // Alquileres / reventas individuales de departamentos en edificios Domus
  const rentalDomus: Partial<Property> = { id: "63", title: "Depto 1 Dorm. en Alquiler · Domus Equipetrol" };
  const resaleDomus: Partial<Property> = { id: "126", title: "Depto 1 Dorm. Amoblado · Domus Equipetrol" };
  assert.equal(isDomusProperty(rentalDomus as Property), false);
  assert.equal(isDomusProperty(resaleDomus as Property), false);
});

test("isProjectOrPreventa: en el catalogo completo filtra exactamente los 9 proyectos registrados", () => {
  const catalog = (catalogSnapshot as any[]).map((raw) => ({
    ...raw,
    title: raw.title || raw.titulo,
    operation: raw.operation || raw.operacion,
    type: raw.type || raw.tipo,
  }));

  const projects = catalog.filter((p) => isProjectOrPreventa(p));
  assert.equal(projects.length, 9, `Esperado 9 proyectos registrados pero encontro ${projects.length}`);

  const projectIds = new Set(projects.map((p) => String(p.id)));
  const expectedIds = [
    "5",
    "1816",
    "domus-black",
    "domus-gold",
    "domus-onix",
    "domus-insignia",
    "domus-luxury",
    "domus-tower",
    "domus-infinity",
  ];

  for (const expectedId of expectedIds) {
    assert.ok(projectIds.has(expectedId), `El proyecto con ID ${expectedId} no fue encontrado en los resultados`);
  }
});
