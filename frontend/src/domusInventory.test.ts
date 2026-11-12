import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { domusBlackModelArt } from "./domusBlackContent";
import { domusGoldModelArt } from "./domusGoldContent";
import { domusOnixModelArt } from "./domusOnixContent";
import { quoteAlboradaFurnished, supportsAlboradaFurnished, formatAlboradaUsd } from "./alboradaServices";
import {
  DOMUS_PROJECTS_CONFIG,
  DOMUS_BASELINE_UNITS,
  formatDomusUsd,
  parseDomusLiveCsv,
} from "./domusInventory";

const onixCsv = readFileSync(new URL("./fixtures/domus-onix-2026-11-12.csv", import.meta.url), "utf8");

test("Onix covers all 17 inventory models with eight official visual families", () => {
  const previews = new Set<string>();
  const models = new Set<string>();
  for (const unit of DOMUS_BASELINE_UNITS["domus-onix"]) {
    const art = domusOnixModelArt(unit.modelo, unit.rooms);
    for (const kind of ["preview", "plan", "full"] as const) {
      assert.ok(art[kind], `${unit.modelo} needs ${kind}`);
      assert.ok(existsSync(new URL(`../public${art[kind]}`, import.meta.url)), `${unit.modelo}: missing ${kind}`);
    }
    previews.add(art.preview!);
    models.add(`${unit.modelo}:${unit.rooms}`);
  }
  assert.equal(previews.size, 8);
  assert.equal(models.size, 17);
  assert.match(domusOnixModelArt("PH - G2", 3).preview!, /familia-g\.jpg$/);
  assert.match(domusOnixModelArt("PH - H", 2).preview!, /familia-h\.jpg$/);
  for (const [id, rooms] of [["A6", 0], ["B3", 1], ["A1", 1], ["PH - G1", 2], ["PH - H", 3], ["Unknown", 0]] as const) {
    assert.deepEqual(domusOnixModelArt(id, rooms), {});
  }
});

test("Onix uses the supplied pin and exact published availability tab", () => {
  const config = DOMUS_PROJECTS_CONFIG["domus-onix"];
  assert.equal(config.lat, -17.7666139);
  assert.equal(config.lng, -63.2044674);
  assert.equal(config.mapsUrl, "https://maps.app.goo.gl/UzmjCM2J1xXhhKS39");
  assert.equal(new URL(config.sheetCsvUrl).searchParams.get("gid"), "875386348");
});

test("Onix uses the 156 real rows and 14 available units, not the sheet's 158 header", () => {
  const parsed = parseDomusLiveCsv(onixCsv, "domus-onix");
  assert.equal(parsed.length, 156);
  assert.equal(new Set(parsed.map(unit => unit.unitNumber)).size, 156);
  const available = parsed.filter(unit => unit.status === "disponible");
  assert.equal(available.length, 14);
  assert.equal(Math.min(...available.map(unit => unit.cashTotal)), 68255);
  assert.equal(Math.max(...available.map(unit => unit.cashTotal)), 156512);
  assert.deepEqual(parsed, DOMUS_BASELINE_UNITS["domus-onix"]);
});

test("Onix preserves published cents and computes percentage deposits without whole-dollar rounding", () => {
  const parsed = parseDomusLiveCsv(onixCsv, "domus-onix");
  const b1 = parsed.find(unit => unit.unitNumber === "502")!;
  assert.equal(b1.cashTotal, 68255);
  assert.equal(b1.initial60Total, 70592.5);
  assert.equal(b1.cuotaInicial60, 42355.5);
  assert.equal(b1.initial60Total! - b1.cuotaInicial60!, 28237);
  const c2 = parsed.find(unit => unit.unitNumber === "507")!;
  assert.equal(c2.initial60Total, 81615.5);
  assert.equal(c2.cuotaInicial60, 48969.3);
  assert.equal(formatAlboradaUsd(c2.cuotaInicial60!), "48.969,3");
});

test("Onix preserves floor-4 exterior areas and never invents prices for unavailable models", () => {
  const parsed = parseDomusLiveCsv(onixCsv, "domus-onix");
  const e2 = parsed.find(unit => unit.unitNumber === "404")!;
  assert.equal(e2.areaM2, 136.7);
  assert.equal(e2.slabAreaM2, 59);
  assert.equal(e2.cashTotal, 156512);
  assert.equal(e2.cuotaInicial40, 66892.8);
  const d2 = parsed.find(unit => unit.unitNumber === "405")!;
  assert.equal(d2.areaM2, 136.9);
  assert.equal(d2.slabAreaM2, 72);
  const sold = parsed.find(unit => unit.unitNumber === "501")!;
  assert.equal(sold.status, "vendido");
  assert.equal(sold.cashTotal, 0);
  assert.equal(sold.initial40Total, 0);
  assert.equal(sold.initial60Total, undefined);
  assert.equal(parsed.find(unit => unit.modelo === "PH - G1")!.areaM2, 155.85);
});

test("Gold maps all 38 inventory models to the nine official apartment families", () => {
  const previews = new Set<string>();
  const models = new Set<string>();
  for (const unit of DOMUS_BASELINE_UNITS["domus-gold"]) {
    const art = domusGoldModelArt(unit.modelo, unit.rooms);
    for (const kind of ["preview", "plan", "full"] as const) {
      assert.ok(art[kind], `${unit.modelo} needs ${kind}`);
      assert.ok(existsSync(new URL(`../public${art[kind]}`, import.meta.url)), `${unit.modelo}: missing ${kind}`);
    }
    previews.add(art.preview!);
    models.add(`${unit.modelo}:${unit.rooms}`);
  }
  assert.equal(previews.size, 9);
  assert.equal(models.size, 38);
});

test("Gold uses model identity and inventory bedrooms rather than incorrect brochure captions", () => {
  assert.match(domusGoldModelArt("B12", 0).preview!, /familia-b\.jpg$/);
  assert.match(domusGoldModelArt("C2", 0).preview!, /familia-c\.jpg$/);
  assert.match(domusGoldModelArt("E4", 0).preview!, /familia-e\.jpg$/);
  assert.match(domusGoldModelArt("H2", 3).preview!, /familia-h\.jpg$/);
  assert.match(domusGoldModelArt("Modelo I-2", 2).preview!, /familia-i\.jpg$/);
  for (const [model, rooms] of [["B13", 0], ["A13", 1], ["B1", 1], ["E1", 1], ["H1", 2], ["Unknown", 0]] as const) {
    assert.deepEqual(domusGoldModelArt(model, rooms), {});
  }
});

test("Gold uses the precise location provided by the owner", () => {
  const config = DOMUS_PROJECTS_CONFIG["domus-gold"];
  assert.equal(config.lat, -17.7702451);
  assert.equal(config.lng, -63.1970063);
  assert.equal(config.mapsUrl, "https://maps.app.goo.gl/PW67vhEjAJqrMzPb8");
});

test("furnished is an optional extra only for Gold and Black", () => {
  for (const id of Object.keys(DOMUS_PROJECTS_CONFIG)) {
    assert.equal(supportsAlboradaFurnished(id), id === "domus-gold" || id === "domus-black");
    const unit = { areaM2: 47.3, status: "disponible" };
    assert.equal(quoteAlboradaFurnished(id, unit, false), null);
    if (!supportsAlboradaFurnished(id)) assert.equal(quoteAlboradaFurnished(id, unit, true), null);
  }
});

test("furnished follows the selected unit's exact area and preserves cents", () => {
  assert.deepEqual(quoteAlboradaFurnished("domus-black", { areaM2: 47.3, status: "disponible" }, true), { areaM2: 47.3, rate: 150, amount: 7095 });
  assert.equal(quoteAlboradaFurnished("domus-gold", { areaM2: 47.75, status: "disponible" }, true)!.amount, 7162.5);
  const i1 = DOMUS_BASELINE_UNITS["domus-gold"].find((unit) => unit.modelo === "I1")!;
  assert.equal(i1.areaM2, 74.7);
  // Simulate this model becoming available without changing its real area.
  assert.equal(quoteAlboradaFurnished("domus-gold", { ...i1, status: "disponible" }, true)!.amount, 11205);
  assert.equal(formatAlboradaUsd(7162.5), "7.162,5");
});

test("furnished cannot be quoted for unavailable units or invalid areas", () => {
  assert.equal(quoteAlboradaFurnished("domus-gold", null, true), null);
  for (const status of ["vendido", "reservado"]) assert.equal(quoteAlboradaFurnished("domus-gold", { areaM2: 50, status }, true), null);
  for (const areaM2 of [0, -1, NaN, Infinity]) assert.equal(quoteAlboradaFurnished("domus-black", { areaM2, status: "disponible" }, true), null);
});

test("Black assigns apartment images by model family instead of bedroom count", () => {
  const a = domusBlackModelArt("A1", 1);
  const d = domusBlackModelArt("D1", 1);
  assert.match(a.preview!, /familia-a\.jpg$/);
  assert.match(d.preview!, /familia-d\.jpg$/);
  assert.notEqual(a.preview, d.preview);
  assert.equal(domusBlackModelArt("A4", 1).preview, a.preview);
  assert.match(domusBlackModelArt("E2", 0).preview!, /familia-e\.jpg$/);
  assert.match(domusBlackModelArt("I1", 2).preview!, /familia-i\.jpg$/);
  assert.match(domusBlackModelArt("L", 3).preview!, /familia-l\.jpg$/);
  assert.match(domusBlackModelArt("M1", 3).preview!, /familia-m\.jpg$/);
});

test("Black never substitutes an unrelated apartment when model or bedrooms do not match", () => {
  assert.deepEqual(domusBlackModelArt("A5", 1), {});
  assert.deepEqual(domusBlackModelArt("A1", 2), {});
  assert.deepEqual(domusBlackModelArt("E1", 1), {});
  assert.deepEqual(domusBlackModelArt("Unknown", 0), {});
  assert.deepEqual(domusBlackModelArt("A10", 1), {});
});

test("every Black inventory model has an existing complete apartment, floor diagram and reference sheet", () => {
  const previews = new Set<string>();
  for (const unit of DOMUS_BASELINE_UNITS["domus-black"]) {
    const art = domusBlackModelArt(unit.modelo, unit.rooms);
    for (const kind of ["preview", "plan", "full"] as const) {
      assert.ok(art[kind], `${unit.modelo} needs ${kind}`);
      assert.ok(existsSync(new URL(`../public${art[kind]}`, import.meta.url)), `${unit.modelo}: missing ${kind} file`);
    }
    previews.add(art.preview!);
  }
  assert.equal(previews.size, 13, "the 31 models belong to 13 official visual families");
});

test("Black uses the location provided by the owner", () => {
  const config = DOMUS_PROJECTS_CONFIG["domus-black"];
  assert.equal(config.lat, -17.7592768);
  assert.equal(config.lng, -63.1938648);
  assert.equal(config.mapsUrl, "https://maps.app.goo.gl/YT5FEU6qL7Z43ohC8");
  assert.doesNotMatch(config.address, /Enrique Finot/);
});

test("domus inventory has valid project configurations", () => {
  const projectIds = ["domus-black", "domus-gold", "domus-onix", "domus-insignia", "domus-luxury", "domus-tower", "domus-infinity"];
  
  for (const id of projectIds) {
    const config = DOMUS_PROJECTS_CONFIG[id];
    assert.ok(config, `Config for ${id} must exist`);
    assert.equal(config.id, id);
    assert.ok(config.name.startsWith("DOMUS"));
    assert.ok(config.lat < 0 && config.lng < 0, "Coordinates must be valid in Santa Cruz");
    assert.ok(config.galleryImages.length > 0, "Must have images");
    assert.ok(config.amenities.length > 0, "Must have amenities");
    assert.ok(config.typologies.length > 0, "Must have typologies");
  }
});

test("domus inventory baseline contains parsed units for active projects", () => {
  const black = DOMUS_BASELINE_UNITS["domus-black"];
  const gold = DOMUS_BASELINE_UNITS["domus-gold"];
  const onix = DOMUS_BASELINE_UNITS["domus-onix"];
  const insignia = DOMUS_BASELINE_UNITS["domus-insignia"];
  const luxury = DOMUS_BASELINE_UNITS["domus-luxury"];

  assert.equal(black.length, 141, "Domus Black must have 141 units");
  assert.equal(gold.length, 170, "Domus Gold must have 170 units");
  assert.equal(onix.length, 156, "Domus Onix must have 156 units");
  assert.equal(insignia.length, 76, "Domus Insignia must have 76 units");
  assert.equal(luxury.length, 83, "Domus Luxury must have 83 units");

  // Check unit properties
  const sample = black[0];
  assert.equal(sample.projectId, "domus-black");
  assert.ok(sample.unitNumber);
  assert.ok(sample.areaM2 > 0);
  assert.ok(["disponible", "vendido", "reservado"].includes(sample.status));
  assert.ok(sample.cashTotal > 20000);
});

test("formatDomusUsd formats numbers properly", () => {
  assert.equal(formatDomusUsd(75000), "75.000");
  assert.equal(formatDomusUsd(123456.78), "123.457");
});

test("parseDomusLiveCsv parses live CSV format correctly", () => {
  const sampleCsv = `DOMUS BLACK - ETAPA 2,,,,,,,,,,,,
PAGOS EN: USA - USD - USDT,,,,,,,,,,,,
Piso,NRO D,MODELO,N. DORM,M2 TOTAL *,40% INICIAL *,60% INICIAL *,100% CONTADO *,40% $/M2 *,60% $/M2 *,100% $/M2 *,ESTADO *,M2 LOZA
Piso 3,301,A1,1 Dorm.,"47,30  m²","76.153,00","73.788,00","71.423,00",1.610,1.560,1.510,DISPONIBLE,
,302,B1,Mono.,"30,20  m²","48.622,00","47.112,00","45.602,00",1.610,1.560,1.510,VENDIDO,
`;

  const parsed = parseDomusLiveCsv(sampleCsv, "domus-black");
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].unitNumber, "301");
  assert.equal(parsed[0].modelo, "A1");
  assert.equal(parsed[0].rooms, 1);
  assert.equal(parsed[0].status, "disponible");
  assert.equal(parsed[0].cashTotal, 71423);
  assert.equal(parsed[0].cuotaInicial40, 30461);
  assert.equal(parsed[1].unitNumber, "302");
  assert.equal(parsed[1].modelo, "B1");
  assert.equal(parsed[1].rooms, 0);
  assert.equal(parsed[1].status, "vendido");
  assert.equal(parsed[1].cashTotal, 45602);
});

test("parseDomusLiveCsv reads the current sheet column order and does not invent blank prices", () => {
  const sampleCsv = `BLACK2,144,DOMUS BLACK
Piso,NRO D,N. DORM,MODELO,M2 TOTAL,40% INICIAL,60% INICIAL,100% CONTADO,40% $/M2,60% $/M2,100% $/M2,ESTADO,M2 LOZA
Piso 3,310,1 Dorm.,A3,"45,90  m²","73.899,00","71.604,00","69.309,00",1.610,1.560,1.510,DISPONIBLE,
Piso 3,311,2 Dorm.,D1,"74,70  m²",,,,, ,,,NO DISPONIBLE,
`;
  const parsed = parseDomusLiveCsv(sampleCsv, "domus-black");
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].modelo, "A3");
  assert.equal(parsed[0].rooms, 1);
  assert.equal(parsed[0].cashTotal, 69309);
  assert.equal(parsed[0].initial60Total, 71604);
  assert.equal(parsed[0].cashPerM2, 1510);
  assert.equal(parsed[1].modelo, "D1");
  assert.equal(parsed[1].rooms, 2);
  assert.equal(parsed[1].status, "vendido");
  assert.equal(parsed[1].cashTotal, 0);
});

test("parseDomusLiveCsv keeps the cash column when Plan de Pagos and Contado share one header", () => {
  const sampleCsv = `DOMUS LUXURY,Entrega del proyecto Noviembre 2026
Plan de pagos: 40% inicial y saldo hasta la entrega del proyecto
Piso,Nro.,Modelo,N° Dorm.,Sup. Dpto.,Balcon/Área de Servicio,Sup. Total,Plan de Pagos | Contado,,ESTADO,PRECIO POR M² PLAN DE PAGOS,
Piso 1,101,A,1 Dorm.,"45,00  m²","Balcón  1,95 ","46,95  m²","69.251,25","68.077,50",VENDIDO ,1475,1450
Piso 2,214,G2,Mono.,"35,00  m²","A. de Serv.  3,10","38,10  m²","55.245,00",,LIBRE,1450,
`;
  const parsed = parseDomusLiveCsv(sampleCsv, "domus-luxury");
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].cashTotal, 68078);
  assert.equal(parsed[0].initial40Total, 69251);
  assert.equal(parsed[0].initial60Total, undefined);
  assert.equal(parsed[0].cashPerM2, 1450);
  assert.equal(parsed[0].initial40PerM2, 1475);
  assert.equal(parsed[1].status, "disponible");
  assert.equal(parsed[1].cashTotal, 0);
  assert.equal(parsed[1].initial40Total, 55245);
});
