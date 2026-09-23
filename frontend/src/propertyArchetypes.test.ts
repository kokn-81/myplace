import test from "node:test";
import assert from "node:assert/strict";
import {
  parseDepartamentoDetails,
  parseCasaDetails,
  parseTerrenoDetails,
  parseComercialDetails,
} from "./propertyArchetypes";

test("parseDepartamentoDetails correctly parses JSON and handles price discount", () => {
  const jsonStr = JSON.stringify({
    arquetipo: "Departamento",
    piso: "9",
    vista: "Calle principal",
    precio_anterior_usd: 85000,
    descuento_usd: 14100,
    equipamiento: ["Cocina integral", "Box templado"],
    perfil_inversion: { apto_airbnb: true, demanda_zona: "Alta" },
  });

  const parsed = parseDepartamentoDetails(jsonStr);
  assert.ok(parsed);
  assert.equal(parsed.piso, "9");
  assert.equal(parsed.precioAnteriorUsd, 85000);
  assert.equal(parsed.descuentoUsd, 14100);
  assert.equal(parsed.aptoAirbnb, true);
  assert.equal(parsed.equipamiento.length, 2);
});

test("parseCasaDetails correctly parses commercial house metrics and uses", () => {
  const jsonStr = JSON.stringify({
    arquetipo: "Casa",
    superficie_terreno_m2: 554.98,
    superficie_construida_m2: 355.90,
    tienda_calle_m2: 55.0,
    tienda_independiente: true,
    ambientes_totales: 7,
    patios_internos: 4,
    cocinas_independientes: 2,
    usos_recomendados: [
      { titulo: "Centro Médico", detalle: "7 salas de consulta" },
    ],
  });

  const parsed = parseCasaDetails(jsonStr);
  assert.ok(parsed);
  assert.equal(parsed.superficieTerrenoM2, 554.98);
  assert.equal(parsed.tiendaCalleM2, 55.0);
  assert.equal(parsed.tiendaIndependiente, true);
  assert.equal(parsed.patiosInternos, 4);
  assert.equal(parsed.cocinasIndependientes, 2);
  assert.equal(parsed.usosRecomendados.length, 1);
});

test("parseTerrenoDetails extracts lot metrics and utility checklist", () => {
  const jsonStr = JSON.stringify({
    arquetipo: "Terreno",
    superficie_total_m2: 3900.0,
    precio_m2: 10.26,
    servicios_disponibles: ["Luz", "Agua"],
    coordenadas_gps: "-17.335029, -63.724814",
  });

  const parsed = parseTerrenoDetails(jsonStr);
  assert.ok(parsed);
  assert.equal(parsed.superficieTotalM2, 3900.0);
  assert.equal(parsed.precioM2, 10.26);
  assert.equal(parsed.serviciosDisponibles.length, 2);
  assert.equal(parsed.coordenadasGps, "-17.335029, -63.724814");
});

test("parseComercialDetails extracts multi-level building structure", () => {
  const jsonStr = JSON.stringify({
    arquetipo: "Comercial",
    niveles: 3,
    planta_baja: {
      titulo: "Planta Baja",
      ambientes: ["Showroom", "Taller"],
    },
    planta_alta: {
      titulo: "Planta Alta",
      ambientes: ["3 Privados", "2 Baños"],
    },
    servicios_instalados: ["Gas domiciliario", "Alcantarillado"],
  });

  const parsed = parseComercialDetails(jsonStr);
  assert.ok(parsed);
  assert.equal(parsed.niveles, 3);
  assert.equal(parsed.plantaBaja?.ambientes.length, 2);
  assert.equal(parsed.plantaAlta?.ambientes.length, 2);
  assert.equal(parsed.serviciosInstalados.includes("Gas domiciliario"), true);
});
