import assert from "node:assert/strict";
import test from "node:test";

import { detectSearchIntent } from "./searchIntent";


const INTENT_CASES = [
  ["quiero alquilar", "rent"],
  ["quiero arrendar", "rent"],
  ["quiero comprar", "buy"],
  ["quiero vender", "buy"],
  ["quiero alquilar o comprar", "both"],
  ["arrendar o comprar", "both"],
  ["alquilar, comprar", "both"],
  ["quiero vender o arrendar", "both"],
  ["quiero adquirir o alquilar", "both"],
  ["  QUIERO   ALQUILAR... O, COMPRAR  ", "both"],
] as const;

test("detecta la matriz de intencion compartida con el backend", () => {
  for (const [query, expected] of INTENT_CASES) {
    assert.equal(detectSearchIntent([query]), expected, query);
  }
});

test("no detecta terminos de operacion dentro de otras palabras", () => {
  for (const query of ["compraventa", "realquilar", "arrendamiento"]) {
    assert.equal(detectSearchIntent([query]), null, query);
  }
});
