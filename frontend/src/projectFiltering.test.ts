import { test } from "node:test";
import assert from "node:assert/strict";
import { isOnaProperty, isEurodesignProperty, isDomusProperty, isGardenZenProperty, isTriventoProperty, isProjectOrPreventa, isTargetProject } from "./projectIdentity";
import { isCatalogPropertyVisible } from "./catalogVisibility";
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

test("isGardenZenProperty: reconoce el proyecto Garden Zen en Equipetrol", () => {
  const gardenZen: Partial<Property> = { id: "garden-zen", title: "GARDEN ZEN · Equipetrol Norte" };
  assert.equal(isGardenZenProperty(gardenZen as Property), true);

  const randomProperty: Partial<Property> = { id: "999", title: "Casa con amplio jardin y estilo rustico" };
  assert.equal(isGardenZenProperty(randomProperty as Property), false);
});

test("Trivento keeps its project identity when the API refresh includes an individual apartment", () => {
  const project = { id: "trivento-iv", title: "TRIVENTO IV", type: "Proyecto (preventa)" } as Property;
  // Actual record returned by /inmuebles/resumen; it previously replaced the project.
  const apartment = { id: "1322", title: "Monoambiente · Trivento Iv Equipetrol", type: "Departamento", operation: "Venta" } as Property;

  assert.equal(isTriventoProperty(project), true);
  assert.equal(isTriventoProperty(apartment), false);
  assert.equal(isProjectOrPreventa(apartment), false);
  assert.equal(isCatalogPropertyVisible(apartment), false);
  assert.equal(isTargetProject(apartment, "trivento-iv"), false);
  assert.equal([apartment, project].find(isTriventoProperty), project);
  assert.equal([apartment].find(isTriventoProperty), undefined);
});

test("Trivento recognizes project aliases and typed projects without treating the building name alone as a project", () => {
  for (const id of ["trivento-iv", "trivento", "triventoiv", "trivento-4"]) {
    assert.equal(isTriventoProperty({ id } as Property), true);
  }
  assert.equal(isTriventoProperty({ id: "new-project", title: "Trivento IV", type: "Proyecto" } as Property), true);
  assert.equal(isTriventoProperty({ id: "new-project", titulo: "Trivento IV", tipo_inmueble: "Proyecto (preventa)" } as unknown as Property), true);
  for (const operation of ["Venta", "Alquiler"]) {
    const apartment = { id: "other-unit", title: "Departamento", complejoNombre: "TRIVENTO IV", type: "Departamento", operation } as Property;
    assert.equal(isTriventoProperty(apartment), false);
  }
  assert.equal(isTriventoProperty({ id: "unknown", title: "Trivento IV" } as Property), false);
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

test("isProjectOrPreventa: en el catalogo completo filtra exactamente los 14 proyectos registrados", () => {
  const catalog = (catalogSnapshot as any[]).map((raw) => ({
    ...raw,
    title: raw.title || raw.titulo,
    operation: raw.operation || raw.operacion,
    type: raw.type || raw.tipo,
  }));

  const projects = catalog.filter((p) => isProjectOrPreventa(p));
  assert.equal(projects.length, 14, `Esperado 14 proyectos registrados pero encontro ${projects.length}`);

  const projectIds = new Set(projects.map((p) => String(p.id)));
  const expectedIds = [
    "5",
    "1816",
    "garden-zen",
    "domus-black",
    "domus-gold",
    "domus-onix",
    "domus-insignia",
    "domus-luxury",
    "domus-tower",
    "domus-infinity",
    "bless-tower",
    "bless-drei",
    "trivento-iv",
    "beton-brut-ii",
  ];

  for (const expectedId of expectedIds) {
    assert.ok(projectIds.has(expectedId), `El proyecto con ID ${expectedId} no fue encontrado en los resultados`);
  }
});
