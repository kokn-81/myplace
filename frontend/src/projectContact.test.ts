import assert from "node:assert/strict";
import test from "node:test";
import { buildProjectContactMessage, projectContactLeadInput } from "./projectContact";

const inquiryText = "Hola, vengo de N.I.A. Quiero la unidad 411, piso 4, modelo elegido en Westgate Tower.\nPlan: Inicial 30%, con parqueo.\n¿Sigue disponible?";
const context = { projectName: "Westgate Tower", inquiryText, canReserve: true };

test("reservar conserva la unidad, piso, plan y adicionales del cotizador sin añadir importes", () => {
  const result = buildProjectContactMessage({ ...context, intent: "reserve" })!;
  assert.equal(result.split("\n").length, 3);
  assert.deepEqual(result.split("\n").slice(0, 2), inquiryText.split("\n").slice(0, 2));
  assert.match(result, /Quiero reservar esta unidad/);
  assert.match(result, /confirmar disponibilidad/);
  assert.doesNotMatch(result, /USD|reserva confirmada/i);
});

test("asesoría pide un horario para el proyecto y funciona sin una unidad elegida", () => {
  for (const projectName of ["Garden Zen", "DOMUS GOLD", "DOMUS BLACK", "Bless Tower", "Sky Level", "Mare"]) {
    const result = buildProjectContactMessage({ intent: "advice", projectName, inquiryText: "", canReserve: false })!;
    assert.equal(result.split("\n").length, 3);
    assert.ok(result.includes(`sobre ${projectName}.`));
    assert.match(result, /horarios tienen disponibles para conversar/);
    assert.doesNotMatch(result, /unidad 411|Plan:|Quiero reservar/);
  }
});

test("la reserva no genera un mensaje para una selección no disponible o incompleta", () => {
  assert.equal(buildProjectContactMessage({ ...context, intent: "reserve", canReserve: false }), null);
  assert.equal(buildProjectContactMessage({ ...context, intent: "reserve", inquiryText: "" }), null);
  assert.equal(buildProjectContactMessage({ ...context, intent: "reserve", inquiryText: "Solo una línea" }), null);
  assert.equal(buildProjectContactMessage({ ...context, intent: "inquiry" }), inquiryText);
});

test("las opciones publicadas por modelo o banda conservan sus límites y el precio a consulta", () => {
  const inquiry = "Hola, me interesa Modelo B, pisos 4 al 16, en Sky Equinox.\nPlan: al contado. Parqueo y baulera incluidos.\n¿Sigue disponible?";
  const result = buildProjectContactMessage({ intent: "reserve", projectName: "Sky Equinox", inquiryText: inquiry, canReserve: true })!;
  assert.ok(result.startsWith(inquiry.split("\n").slice(0, 2).join("\n")));
  const noPrice = "Hola, quiero la unidad 5A, piso 5, en Luxe Tower.\nPido la cotización de esta unidad.\n¿Sigue disponible?";
  assert.ok(buildProjectContactMessage({ intent: "reserve", projectName: "Luxe Tower", inquiryText: noPrice, canReserve: true })!.includes("Pido la cotización de esta unidad."));
});

test("los leads distinguen reserva y asesoría sin atribuirle una unidad o presupuesto a la asesoría", () => {
  const input = { action: "contact_tap" as const, propertyRef: "domus-black", zona: "Equipetrol", presupuesto: "USD 100000", extraFilters: { unidad: "504", piso: 5, plan: "plan30", furnished: true, adicional: "parqueo" } };
  const original = structuredClone(input);
  const reservation = projectContactLeadInput("reserve", input);
  assert.deepEqual(reservation.extraFilters, { ...input.extraFilters, proyecto: "domus-black", intencion: "reserva" });
  assert.equal(reservation.presupuesto, input.presupuesto);
  const advice = projectContactLeadInput("advice", input);
  assert.equal(advice.propertyRef, input.propertyRef);
  assert.equal(advice.presupuesto, undefined);
  assert.deepEqual(advice.extraFilters, { proyecto: "domus-black", intencion: "asesoria" });
  assert.equal(projectContactLeadInput("inquiry", input).extraFilters?.intencion, "consulta_unidad");
  assert.deepEqual(input, original);
});
