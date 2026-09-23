import assert from "node:assert/strict";
import test from "node:test";

import {
  getCities,
  getCity,
  getCountries,
  getZoneNamesForCity,
  getZonesForCity,
  normalizeGeoText,
  resolveLocationCenter,
} from "./geographicLocations";

test("obtiene paises y ciudades estructuradas", () => {
  const countries = getCountries();
  assert.equal(countries.length >= 1, true);
  assert.equal(countries[0].name, "Bolivia");

  const cities = getCities("BO");
  const cityNames = cities.map((c) => c.name);
  assert.equal(cities.length, 9);
  assert.deepEqual(cityNames, [
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
});

test("obtiene zonas especificas por ciudad sin cruzarse", () => {
  const sczZones = getZoneNamesForCity("Santa Cruz");
  assert.equal(sczZones.includes("Equipetrol"), true);
  assert.equal(sczZones.includes("Cala Cala"), false);

  const cbbaZones = getZoneNamesForCity("Cochabamba");
  assert.equal(cbbaZones.includes("Zona Norte"), true);
  assert.equal(cbbaZones.includes("Cala Cala"), true);
  assert.equal(cbbaZones.includes("Equipetrol"), false);

  const lpzZones = getZoneNamesForCity("La Paz");
  assert.equal(lpzZones.includes("Zona Sur"), true);
  assert.equal(lpzZones.includes("Calacoto"), true);
  assert.equal(lpzZones.includes("Equipetrol"), false);
});

test("resuelve centro geografico de ciudad y zona", () => {
  const sczCenter = resolveLocationCenter("Santa Cruz");
  assert.ok(sczCenter);
  assert.equal(Math.round(sczCenter.lat), -18);
  assert.equal(Math.round(sczCenter.lng), -63);

  const calacotoCenter = resolveLocationCenter("La Paz", "Calacoto");
  assert.ok(calacotoCenter);
  assert.equal(Math.round(calacotoCenter.lat), -17);
  assert.equal(Math.round(calacotoCenter.lng), -68);

  const tarijaCenter = resolveLocationCenter("Tarija");
  assert.ok(tarijaCenter);
  assert.equal(Math.round(tarijaCenter.lat), -22);
});

test("normaliza alias y acentos de ciudades", () => {
  assert.equal(getCity("santa cruz de la sierra")?.name, "Santa Cruz");
  assert.equal(getCity("cbba")?.name, "Cochabamba");
  assert.equal(getCity("lpz")?.name, "La Paz");
  assert.equal(getCity("sucre")?.name, "Chuquisaca");
  assert.equal(getCity("trinidad")?.name, "Beni");
  assert.equal(getCity("cobija")?.name, "Pando");
  assert.equal(getCity("San Carlos / Ichilo")?.name, "Santa Cruz");
  // Coincidencia por prefijo
  assert.equal(getCity("co")?.name, "Cochabamba");
  assert.equal(getCity("poto")?.name, "Potosí");
});
