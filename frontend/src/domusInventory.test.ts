import test from "node:test";
import assert from "node:assert/strict";
import {
  DOMUS_PROJECTS_CONFIG,
  DOMUS_BASELINE_UNITS,
  formatDomusUsd,
  parseDomusLiveCsv,
} from "./domusInventory";

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
  assert.equal(parsed[0].status, "disponible");
  assert.equal(parsed[0].cashTotal, 71423);
  assert.equal(parsed[1].unitNumber, "302");
  assert.equal(parsed[1].status, "vendido");
  assert.equal(parsed[1].cashTotal, 45602);
});
