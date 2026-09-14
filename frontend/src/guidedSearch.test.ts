import assert from "node:assert/strict";
import test from "node:test";

import {
  GUIDED_BUY_BUDGET_OPTIONS,
  GUIDED_OPERATIONS,
  GUIDED_RENT_BUDGET_OPTIONS,
  SELL_WHATSAPP_NUMBER,
  buildGuidedSearchQuery,
  buildSellWhatsappUrl,
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

test("Comprar pide motivo, zona y presupuesto en dolares", () => {
  assert.equal(nextGuidedStageFromOperation("Comprar"), "buyPurpose");
  assert.deepEqual(getGuidedChoiceOptions("buyPurpose", "Comprar"), ["Vivir", "Invertir", "Proyecto preventa"]);
  assert.equal(previousGuidedStage("zone", "Comprar"), "buyPurpose");
  assert.deepEqual(getGuidedChoiceOptions("budget", "Comprar"), ["menos de 150.000$", "más de 150.000$"]);
  assert.deepEqual([...GUIDED_BUY_BUDGET_OPTIONS], ["menos de 150.000$", "más de 150.000$"]);
  assert.equal(
    buildGuidedSearchQuery({
      operation: "Comprar",
      purpose: "Vivir",
      zone: "Equipetrol",
      budget: "menos de 150.000$",
    }),
    "quiero comprar para vivir en Equipetrol menos de 150.000$",
  );
  assert.equal(
    buildGuidedSearchQuery({
      operation: "Comprar",
      purpose: "Invertir",
      zone: "Norte",
      budget: "más de 150.000$",
    }),
    "quiero comprar para invertir en Norte más de 150.000$",
  );
});

test("Alquilar salta motivo de compra y usa presupuesto en Bs", () => {
  assert.equal(nextGuidedStageFromOperation("Alquilar"), "zone");
  assert.equal(previousGuidedStage("zone", "Alquilar"), "operation");
  assert.deepEqual(getGuidedChoiceOptions("budget", "Alquilar"), [...GUIDED_RENT_BUDGET_OPTIONS]);
  assert.equal(
    buildGuidedSearchQuery({
      operation: "Alquilar",
      zone: "Equipetrol",
      budget: "menos de 5.000 Bs",
    }),
    "quiero alquilar en Equipetrol menos de 5.000 Bs",
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
      zone: "Equipetrol",
      budget: "menos de 5.000 Bs",
    }),
    "Alquilar · Equipetrol · menos de 5.000 Bs",
  );
  assert.equal(
    formatCompactSearchLabel({
      operation: "Comprar",
      purpose: "Vivir",
      zone: "Norte",
      budget: "más de 150.000$",
    }),
    "Comprar · Vivir · Norte · más de 150.000$",
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
