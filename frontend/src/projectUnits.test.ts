import test from "node:test";
import assert from "node:assert/strict";
import {
  parseProjectUnitsJson,
  serializeProjectUnitsJson,
  getProjectUnitsSummary,
  parseProjectDetailsJson,
  serializeProjectDetailsJson,
  ProjectUnitOption,
  ProjectDetails,
} from "./projectUnits.js";

test("parseProjectUnitsJson parses JSON string and object format", () => {
  const rawJson = JSON.stringify({
    unidades: [
      { tipologia: "Monoambiente", superficie_m2: 32, precio: 38000, moneda: "$ (USD)" },
      { tipologia: "1 Dormitorio", superficie_m2: 48, precio: 54000, moneda: "$ (USD)" },
    ],
  });

  const units = parseProjectUnitsJson(rawJson);
  assert.equal(units.length, 2);
  assert.equal(units[0].tipologia, "Monoambiente");
  assert.equal(units[0].superficieM2, 32);
  assert.equal(units[0].precio, 38000);
  assert.equal(units[1].tipologia, "1 Dormitorio");
});

test("serializeProjectUnitsJson produces clean JSON string", () => {
  const units: ProjectUnitOption[] = [
    { tipologia: "Monoambiente", superficieM2: 32.5, precio: 39000, moneda: "$ (USD)" },
    { tipologia: "2 Dormitorios", superficieM2: 70, precio: 85000, moneda: "$ (USD)" },
  ];

  const jsonStr = serializeProjectUnitsJson(units);
  assert.ok(jsonStr);
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.unidades.length, 2);
  assert.equal(parsed.unidades[0].superficie_m2, 32.5);
  assert.equal(parsed.unidades[1].precio, 85000);
});

test("getProjectUnitsSummary calculates min and max correctly", () => {
  const units: ProjectUnitOption[] = [
    { tipologia: "Monoambiente", superficieM2: 32, precio: 38000 },
    { tipologia: "1 Dormitorio", superficieM2: 48, precio: 54000 },
    { tipologia: "2 Dormitorios", superficieM2: 72, precio: 85000 },
  ];

  const summary = getProjectUnitsSummary(units);
  assert.equal(summary.count, 3);
  assert.equal(summary.minSurface, 32);
  assert.equal(summary.maxSurface, 72);
  assert.equal(summary.minPrice, 38000);
  assert.equal(summary.maxPrice, 85000);
  assert.equal(summary.surfaceLabel, "Desde 32 m²");
  assert.equal(summary.priceLabel, "Desde $38,000");
});

test("parseProjectDetailsJson and serializeProjectDetailsJson roundtrip project metadata", () => {
  const details: ProjectDetails = {
    unidades: [
      { tipologia: "1 Dormitorio", superficieM2: 32, precio: 40375, moneda: "$ (USD)" },
      { tipologia: "2 Dormitorios", superficieM2: 54, precio: 70200, moneda: "$ (USD)" },
    ],
    mensajeUrgencia: "🔥 ¡Últimas 8 unidades disponibles en Lista Cero!",
    totalUnidades: 52,
    unidadesDisponibles: 8,
    pisos: 14,
    reservaUsd: 2000,
    precioM2Desde: 1250,
    brochureUrl: "https://drive.google.com/file/d/1Xx2m9oPS6laGXHF-_in8rslKjR3tZYvx/view",
    planesPago: "100% Contado / 60% Inicial / 40% Inicial",
  };

  const jsonStr = serializeProjectDetailsJson(details);
  assert.ok(jsonStr);

  const parsed = parseProjectDetailsJson(jsonStr);
  assert.equal(parsed.unidades.length, 2);
  assert.equal(parsed.mensajeUrgencia, "🔥 ¡Últimas 8 unidades disponibles en Lista Cero!");
  assert.equal(parsed.totalUnidades, 52);
  assert.equal(parsed.unidadesDisponibles, 8);
  assert.equal(parsed.pisos, 14);
  assert.equal(parsed.reservaUsd, 2000);
  assert.equal(parsed.precioM2Desde, 1250);
  assert.equal(parsed.brochureUrl, "https://drive.google.com/file/d/1Xx2m9oPS6laGXHF-_in8rslKjR3tZYvx/view");
});
