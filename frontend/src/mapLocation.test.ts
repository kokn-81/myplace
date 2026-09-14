import assert from "node:assert/strict";
import test from "node:test";

import {
  extractRequestedLocation,
  focusFromProperties,
  getMarkerTone,
  isInBolivia,
  resolveLocalMapFocus,
} from "./mapLocation";

test("extrae Equipetrol y descarta el presupuesto de la consulta guiada", () => {
  assert.equal(
    extractRequestedLocation("quiero alquilar en Equipetrol menos de 5.000 Bs"),
    "Equipetrol",
  );
  assert.equal(
    extractRequestedLocation("quiero comprar para vivir en Equipetrol más de 150.000$"),
    "Equipetrol",
  );
  assert.equal(
    extractRequestedLocation("quiero alquilar en Urubo entre 5.000 y 8.000"),
    "Urubo",
  );
});

test("Equipetrol se ancla en Santa Cruz de la Sierra, no en Europa", () => {
  const resolution = resolveLocalMapFocus("Equipetrol");
  assert.equal(resolution?.requestedLocation, "Equipetrol");
  assert.ok(resolution?.focus);
  assert.equal(isInBolivia(resolution!.focus!.longitude, resolution!.focus!.latitude), true);
  assert.ok(resolution!.focus!.longitude < -63);
  assert.ok(resolution!.focus!.latitude < -17);
  assert.match(resolution!.focus!.label || "", /Santa Cruz de la Sierra/);
});

test("Norte y Centro quedan en Santa Cruz, no en otra ciudad homonima", () => {
  for (const zone of ["Norte", "Centro", "Urubo"]) {
    const resolution = resolveLocalMapFocus(zone);
    assert.ok(resolution?.focus, zone);
    assert.equal(isInBolivia(resolution!.focus!.longitude, resolution!.focus!.latitude), true);
    assert.ok(Math.abs(resolution!.focus!.longitude - -63.18) < 0.3, zone);
  }
});

test("Santa Cruz ambiguo sigue pidiendo cual ciudad", () => {
  const resolution = resolveLocalMapFocus("Santa Cruz");
  assert.ok(resolution?.choices && resolution.choices.length > 1);
  assert.ok(resolution.choices.some((choice) => choice.id === "santa-cruz-bo"));
  assert.ok(resolution.choices.some((choice) => choice.id === "santa-cruz-tf"));
});

test("los pines del carrusel se destacan del resto del catalogo", () => {
  assert.equal(getMarkerTone("1", ["1"], ["1", "2"], null), "active");
  assert.equal(getMarkerTone("2", ["1"], ["1", "2"], null), "match");
  assert.equal(getMarkerTone("9", ["1"], ["1", "2"], null), "muted");
  assert.equal(getMarkerTone("1", ["1"], ["1", "2"], "1"), "selected");
  assert.equal(getMarkerTone("3", ["3"], null, null), "active");
  assert.equal(getMarkerTone("4", ["3"], null, null), "muted");
});

test("el mapa usa los pines bolivianos y ignora coordenadas fuera del pais", () => {
  const focus = focusFromProperties([
    { lat: -17.7655, lng: -63.1951, area: "Equipetrol" },
    { lat: 42.5063, lng: 1.5218, area: "Andorra" },
  ], "Equipetrol");

  assert.ok(focus);
  assert.equal(isInBolivia(focus.longitude, focus.latitude), true);
  assert.ok(Math.abs(focus.longitude - -63.1951) < 0.01);
});
