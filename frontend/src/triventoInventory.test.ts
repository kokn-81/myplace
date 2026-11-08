import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import {
  TRIVENTO_UNITS,
  availableUnits,
  cheapestAvailable,
  minRate,
} from "./triventoInventory.ts";
import { firstAvailableTriventoSelection, quoteTriventoUnit, triventoSlidesForRooms } from "./triventoPresentation";

test("trivento inventory matches the 28 Oct 2026 chart", () => {
  assert.equal(TRIVENTO_UNITS.length, 25);
  assert.equal(availableUnits().length, 7);
  assert.equal(TRIVENTO_UNITS.filter((unit) => unit.estado === "RESERVADO").map((unit) => unit.codigo).join(","), "103,104");
  assert.equal(cheapestAvailable().codigo, "204");
  assert.equal(cheapestAvailable().precioContado, 51562);
  assert.equal(minRate("contado"), 1300);
  assert.equal(minRate("credito"), 1500);

  const expected = {
    "201": [59234, 67696],
    "204": [51562, 58928],
    "303": [62398, 71312],
    "305": [61334, 70770],
    "401": [61349.5, 69811.5],
    "404": [51562, 58928],
    "405": [63693, 70770],
  };
  for (const [codigo, [contado, credito]] of Object.entries(expected)) {
    const unit = TRIVENTO_UNITS.find((item) => item.codigo === codigo);
    assert.ok(unit);
    assert.equal(unit.estado, "LIBRE");
    assert.equal(unit.precioContado, contado);
    assert.equal(unit.precioCredito, credito);
  }

  for (const unit of TRIVENTO_UNITS) {
    if (unit.estado !== "LIBRE") {
      assert.equal(unit.precioContado, null);
      assert.equal(unit.precioCredito, null);
    }
  }
});

test("Trivento separates studios and one-bedroom models, with complete apartment and official sheet assets", () => {
  const studios = triventoSlidesForRooms("0");
  const apartments = triventoSlidesForRooms("1");
  assert.deepEqual(studios.map((slide) => slide.id), ["02"]);
  assert.deepEqual(apartments.map((slide) => slide.id), ["01", "03", "04", "05"]);
  for (const slide of [...studios, ...apartments]) {
    assert.equal(slide.preview, `/trivento/iso_${slide.id}.jpg`);
    assert.equal(slide.plan, `/trivento/planos/${slide.id}.png`);
    assert.equal(slide.ficha, `/trivento/fichas/${slide.id}.jpg`);
    for (const asset of [slide.preview, slide.plan, slide.ficha]) {
      assert.ok(existsSync(new URL(`../public${asset}`, import.meta.url)), `Existe el recurso ${asset}`);
    }
  }
  assert.equal(firstAvailableTriventoSelection(studios).unit, null);
  assert.equal(firstAvailableTriventoSelection(apartments).unit?.codigo, "201");
  const cheapest = cheapestAvailable();
  assert.equal(apartments.find((slide) => slide.id === cheapest.modelo)?.id, "04");
});

test("Trivento quotes keep the published cash and 50/50 credit prices and exclude unavailable units", () => {
  const unit = TRIVENTO_UNITS.find((item) => item.codigo === "204")!;
  assert.deepEqual(quoteTriventoUnit(unit, "contado"), { total: 51562, initial: 51562, balance: null, rate: 1400 });
  assert.deepEqual(quoteTriventoUnit(unit, "credito"), { total: 58928, initial: 29464, balance: 29464, rate: 1600 });
  const cents = quoteTriventoUnit(TRIVENTO_UNITS.find((item) => item.codigo === "401")!, "credito")!;
  assert.equal(cents.initial, 34905.75);
  assert.equal(cents.initial + cents.balance!, cents.total);
  for (const unavailable of TRIVENTO_UNITS.filter((item) => item.estado !== "LIBRE")) {
    assert.equal(quoteTriventoUnit(unavailable, "contado"), null);
    assert.equal(quoteTriventoUnit(unavailable, "credito"), null);
  }
  assert.equal(quoteTriventoUnit(null, "credito"), null);
});
