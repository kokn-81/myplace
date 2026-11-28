import assert from "node:assert/strict";
import test from "node:test";
import { ONA_UNITS } from "./onaInventory";
import { buildOnaContactMessage } from "./onaContactMessage";

const unit = ONA_UNITS.find(unit => unit.status === "disponible")!;
const context = { unit, modelName: "Modelo elegido", planLabel: "Inicial 60% y saldo 40% contra entrega", extra: ", con parqueo simple y baulera" };

test("reservar envía la unidad, piso, plan y adicional elegidos en tres líneas", () => {
  assert.ok(unit);
  const message = buildOnaContactMessage({ ...context, intent: "reserve" })!;
  assert.equal(message.split("\n").length, 3);
  assert.ok(message.includes(`Quiero reservar la unidad T${unit.tipo}, piso ${unit.floor}`));
  assert.ok(message.includes(context.modelName));
  assert.ok(message.includes(`Plan: ${context.planLabel}${context.extra}.`));
  assert.match(message, /confirmar disponibilidad y coordinar la reserva/);
});

test("agendar asesoría no exige una unidad y pide horarios en un mensaje independiente", () => {
  const message = buildOnaContactMessage({ ...context, intent: "advice", unit: null })!;
  assert.equal(message.split("\n").length, 3);
  assert.match(message, /agendar una asesoría por WhatsApp sobre ONA Residences/);
  assert.match(message, /horarios tienen disponibles/);
  assert.doesNotMatch(message, /Quiero reservar|Plan:|unidad T/);
  assert.equal(buildOnaContactMessage({ ...context, intent: "advice" }), message);
});

test("no permite solicitar la reserva de unidades vendidas, reservadas o sin selección", () => {
  for (const invalid of [null, { ...unit, status: "vendido" as const }, { ...unit, status: "reservado" as const }]) {
    assert.equal(buildOnaContactMessage({ ...context, unit: invalid, intent: "reserve" }), null);
  }
});

test("la consulta del cotizador mantiene su intención y los datos de la selección", () => {
  const message = buildOnaContactMessage({ ...context, intent: "inquiry" })!;
  assert.equal(message.split("\n").length, 3);
  assert.ok(message.includes(`Quiero la unidad T${unit.tipo}, piso ${unit.floor}`));
  assert.match(message, /Sigue disponible y cuáles son los pasos para reservar/);
});
