import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTACT_WHATSAPP_NUMBER,
  buildWhatsappMessage,
  buildWhatsappUrl,
  plazoToPhrase,
} from "./whatsappMessage";

test("mensaje con REF omite campos vacios y no inventa plazo", () => {
  const text = buildWhatsappMessage({
    propertyRef: 3,
    zona: "Equipetrol",
    operacion: "Alquiler",
    presupuesto: "menos de 5.000 Bs",
    slug: "k7m2npq4",
  });
  assert.equal(
    text,
    [
      "Hola, vengo de NIA.",
      "Me interesa la REF 3 en Equipetrol (Alquiler, menos de 5.000 Bs):",
      "https://nia-web.com/c/k7m2npq4",
    ].join("\n"),
  );
  assert.doesNotMatch(text, /NIA-A4K2|plazo|esta semana/i);
});

test("mensaje solo filtros omite presupuesto si no hay", () => {
  const text = buildWhatsappMessage({
    operacion: "Alquiler",
    zona: "Equipetrol",
    slug: "ab12cd34",
  });
  assert.equal(
    text,
    [
      "Hola, vengo de NIA.",
      "Busco Alquiler en Equipetrol:",
      "https://nia-web.com/c/ab12cd34",
    ].join("\n"),
  );
});

test("30 dias se traduce a para este mes solo si el usuario lo eligio", () => {
  assert.equal(plazoToPhrase("30 días"), "para este mes");
  const text = buildWhatsappMessage({
    propertyRef: "8",
    zona: "Norte",
    operacion: "Venta",
    presupuesto: "más de 150.000$",
    plazo: "30 días",
    slug: "xy98zt12",
  });
  assert.match(text, /para este mes:/);
  assert.equal(plazoToPhrase(""), "");
  assert.equal(plazoToPhrase(undefined), "");
});

test("wa.me apunta al numero unico y deja el envio al usuario", () => {
  const text = buildWhatsappMessage({
    operacion: "Alquiler",
    zona: "Equipetrol",
    presupuesto: "menos de 5.000 Bs",
    slug: "k7m2npq4",
  });
  const url = buildWhatsappUrl(text);
  assert.ok(url.startsWith(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=`));
  assert.match(url, /Hola%2C%20vengo%20de%20NIA/);
});
