import assert from "node:assert/strict";
import test from "node:test";

import { ONA_BUILDER, ONA_DELIVERY, ONA_PARKINGS, ONA_RESERVE_USD, ONA_UNITS, formatOnaUsd, parseOnaCsvText } from "./onaInventory";

test("la tabla de ONA refleja la disponibilidad y tarifas oficiales actualizadas", () => {
  assert.equal(ONA_UNITS.length, 54);
  assert.equal(ONA_UNITS.filter((unit) => unit.status === "disponible").length, 22);
  assert.equal(ONA_UNITS.filter((unit) => unit.status === "vendido").length, 25);
  assert.equal(ONA_UNITS.filter((unit) => unit.status === "reservado").length, 7);
  assert.equal(ONA_PARKINGS.length, 26);
  assert.equal(ONA_PARKINGS.filter((spot) => spot.status === "disponible").length, 22);
  assert.deepEqual(
    ONA_PARKINGS.filter((spot) => spot.status === "vendido").map((spot) => spot.code),
    ["1", "2", "3", "4"],
  );
  assert.ok(ONA_PARKINGS.filter((spot) => spot.kind === "simple").every((spot) => spot.price === 15000));
  assert.ok(ONA_PARKINGS.filter((spot) => spot.kind === "doble").every((spot) => spot.price === 22000 && spot.status === "disponible"));
  assert.equal(ONA_RESERVE_USD, 1000);
  assert.equal(ONA_DELIVERY, "Junio 2028");
  assert.equal(ONA_BUILDER, "Palacios Antunez");

  const entry = ONA_UNITS.find((unit) => unit.floor === 2 && unit.tipo === "3");
  assert.equal(entry?.cash, 41990);
  assert.equal(entry?.plan60.initial, 26163);
  assert.equal(entry?.plan60.total, 43605);
  assert.equal(entry?.plan40.initial, 18088);
  assert.equal(entry?.plan40.total, 45220);
  assert.equal(formatOnaUsd(40375), "40.375");
  assert.equal(formatOnaUsd(67687.5), "67.687,50");
  assert.ok(ONA_PARKINGS.every((spot) => spot.includesStorage));
  assert.ok(ONA_UNITS.every((unit) => Math.abs(unit.plan40.initial / unit.plan40.total - 0.4) < 0.01));
});

test("parseOnaCsvText keeps the departments that share a merged floor cell", () => {
  const csv = [
    "Piso,Depto.,Tipo,m2,Balcon,Total m2,$us m2,Total $us.,$us m2,60%,TOTAL,$us m2,40%,TOTAL,Vista,Estado",
    '2.º Piso,TIPO 1,2 dorm,"54,14",,"54,14","$ 1.300,00","$ 70.382,00","$ 1.350,00","$ 43.853,40","$ 73.089,00","$ 1.400,00","$ 30.318,40","$ 75.796,00",Vista Lateral,DISPONIBLE',
    ',TIPO 3,1 dorm,"32,30",,"32,30","$ 1.350,00","$ 43.605,00","$ 1.400,00","$ 27.132,00","$ 45.220,00","$ 1.450,00","$ 18.734,00","$ 46.835,00",Vista Lateral,DISPONIBLE',
    ',TIPO 5,2 dorm,"86,50","5,55","92,05","$ 1.300,00","$ 119.665,00","$ 1.350,00","$ 74.560,50","$ 124.267,50","$ 1.400,00","$ 51.548,00","$ 128.870,00",Vista posterior,DISPONIBLE',
  ].join("\n");
  const units = parseOnaCsvText(csv);
  assert.equal(units.length, 3);
  assert.deepEqual(units.map((unit) => [unit.floor, unit.tipo, unit.rooms, unit.status, unit.cash]), [
    [2, "1", 2, "disponible", 70382],
    [2, "3", 1, "disponible", 43605],
    [2, "5", 2, "disponible", 119665],
  ]);
});
