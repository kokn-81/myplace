import assert from "node:assert/strict";
import test from "node:test";

import {
  GUIDED_BUY_BUDGET_OPTIONS,
  GUIDED_OPERATIONS,
  GUIDED_RENT_BUDGET_OPTIONS,
  SELL_WHATSAPP_NUMBER,
  buildGuidedSearchQuery,
  buildSellWhatsappUrl,
  filterGuidedChoiceOptions,
  formatCompactSearchLabel,
  getGuidedChoiceOptions,
  nextGuidedStageFromOperation,
  normalizeGuidedBudget,
  previousGuidedStage,
} from "./guidedSearch";

test("las 3 opciones iniciales son Comprar, Alquilar y Vender", () => {
  assert.deepEqual(GUIDED_OPERATIONS, ["Comprar", "Alquilar", "Vender"]);
  assert.deepEqual(getGuidedChoiceOptions("operation", ""), ["Comprar", "Alquilar", "Vender"]);
});

test("Comprar pide tipo de inmueble (Casa, Departamento, Preventa), ciudad, zona y presupuesto", () => {
  assert.equal(nextGuidedStageFromOperation("Comprar"), "propertyType");
  assert.deepEqual(getGuidedChoiceOptions("propertyType", "Comprar"), ["Casa", "Departamento", "Preventa"]);
  assert.deepEqual(getGuidedChoiceOptions("city", "Comprar"), [
    "Santa Cruz",
    "Cochabamba",
    "La Paz",
    "Chuquisaca",
    "Tarija",
    "Oruro",
    "Potosí",
    "Beni",
    "Pando",
  ]);
  assert.equal(previousGuidedStage("city", "Comprar"), "propertyType");
  assert.equal(previousGuidedStage("zone", "Comprar"), "city");
  assert.deepEqual(getGuidedChoiceOptions("budget", "Comprar"), ["100.000 $", "200.000 $", "350.000 $"]);
  assert.deepEqual([...GUIDED_BUY_BUDGET_OPTIONS], ["100.000 $", "200.000 $", "350.000 $"]);
  assert.equal(
    buildGuidedSearchQuery({
      operation: "Comprar",
      propertyType: "Casa",
      city: "Santa Cruz",
      zone: "Equipetrol",
      budget: "menos de 150.000$",
    }),
    "quiero comprar casa en Equipetrol, Santa Cruz menos de 150.000$",
  );
  assert.equal(
    buildGuidedSearchQuery({
      operation: "Comprar",
      propertyType: "Preventa",
      city: "Cochabamba",
      zone: "Zona Norte",
      budget: "más de 150.000$",
    }),
    "quiero comprar preventa en Zona Norte, Cochabamba más de 150.000$",
  );
});

test("Alquilar pide tipo de inmueble (Casa, Departamento, Comercial), ciudad, zona y presupuesto en Bs", () => {
  assert.equal(nextGuidedStageFromOperation("Alquilar"), "propertyType");
  assert.deepEqual(getGuidedChoiceOptions("propertyType", "Alquilar"), ["Casa", "Departamento", "Comercial"]);
  assert.equal(previousGuidedStage("city", "Alquilar"), "propertyType");
  assert.equal(previousGuidedStage("propertyType", "Alquilar"), "operation");
  assert.deepEqual(getGuidedChoiceOptions("budget", "Alquilar"), [...GUIDED_RENT_BUDGET_OPTIONS]);
  assert.equal(
    buildGuidedSearchQuery({
      operation: "Alquilar",
      propertyType: "Departamento",
      city: "Santa Cruz",
      zone: "Equipetrol",
      budget: "menos de 5.000 Bs",
    }),
    "quiero alquilar departamento en Equipetrol, Santa Cruz menos de 5.000 Bs",
  );
});

test("Vender abre WhatsApp al 57015854", () => {
  assert.equal(nextGuidedStageFromOperation("Vender"), "sell");
  assert.deepEqual(getGuidedChoiceOptions("sell", "Vender"), []);
  assert.equal(previousGuidedStage("sell", "Vender"), "operation");
  assert.equal(SELL_WHATSAPP_NUMBER, "57015854");
  const url = buildSellWhatsappUrl();
  assert.match(url, /^https:\/\/wa\.me\/59157015854\?text=/);
  assert.match(url, /vengo%20de%20N\.I\.A/);
});

test("el resumen compacto de la busqueda no repite la frase completa", () => {
  assert.equal(
    formatCompactSearchLabel({
      operation: "Alquilar",
      propertyType: "Departamento",
      zone: "Equipetrol",
      budget: "menos de 5.000 Bs",
    }),
    "Alquilar · Departamento · Equipetrol · menos de 5.000 Bs",
  );
  assert.equal(
    formatCompactSearchLabel({
      operation: "Comprar",
      propertyType: "Casa",
      zone: "Norte",
      budget: "más de 150.000$",
    }),
    "Comprar · Casa · Norte · más de 150.000$",
  );
});

test("un monto escrito en el buscador se trata como presupuesto de esa operacion", () => {
  assert.equal(normalizeGuidedBudget("Comprar", "120000"), "120000$");
  assert.equal(normalizeGuidedBudget("Alquilar", "4500"), "4500 Bs");
  assert.equal(
    buildGuidedSearchQuery({
      operation: "Comprar",
      purpose: "Vivir",
      zone: "Centro",
      budget: "180000",
    }),
    "quiero comprar para vivir en Centro 180000$",
  );
});

test("filtra opciones dinamicamente en tiempo real mientras el usuario escribe", () => {
  const departments = [
    "Santa Cruz",
    "Cochabamba",
    "La Paz",
    "Chuquisaca",
    "Tarija",
    "Oruro",
    "Potosí",
    "Beni",
    "Pando",
  ];

  // Si no escribe nada, devuelve todas
  assert.equal(filterGuidedChoiceOptions({ options: departments, query: "", stage: "city" }).length, 9);

  // Si escribe "co", filtra a Cochabamba
  const coResults = filterGuidedChoiceOptions({ options: departments, query: "co", stage: "city" });
  assert.deepEqual(coResults, ["Cochabamba"]);

  // Si escribe "scz" con alias resolver, filtra a Santa Cruz
  const aliasMap: Record<string, string[]> = {
    "Santa Cruz": ["scz", "santa cruz de la sierra"],
    "Cochabamba": ["cbba", "cocha"],
    "Chuquisaca": ["sucre"],
  };
  const sczResults = filterGuidedChoiceOptions({
    options: departments,
    query: "scz",
    stage: "city",
    aliasResolver: (opt) => aliasMap[opt] || [],
  });
  assert.deepEqual(sczResults, ["Santa Cruz"]);

  // Si busca en zonas
  const zones = ["Todas", "Equipetrol", "Norte", "Urubó", "Centro", "Las Palmas"];
  assert.deepEqual(
    filterGuidedChoiceOptions({ options: zones, query: "eq", stage: "zone" }),
    ["Equipetrol"],
  );
  assert.deepEqual(
    filterGuidedChoiceOptions({ options: zones, query: "todas", stage: "zone" }),
    ["Todas"],
  );
});

test("soporta multiples zonas en el resumen compacto y la consulta guiada", () => {
  assert.equal(
    formatCompactSearchLabel({
      operation: "Comprar",
      propertyType: "Departamento",
      zone: "Equipetrol, Sirari",
      budget: "100.000$ - 150.000$",
    }),
    "Comprar · Departamento · Equipetrol, Sirari · 100.000$ - 150.000$",
  );
  assert.equal(
    buildGuidedSearchQuery({
      operation: "Comprar",
      propertyType: "Departamento",
      city: "Santa Cruz",
      zone: "Equipetrol, Sirari",
      budget: "100.000$ - 150.000$",
    }),
    "quiero comprar departamento en Equipetrol, Sirari, Santa Cruz 100.000$ - 150.000$",
  );
});
