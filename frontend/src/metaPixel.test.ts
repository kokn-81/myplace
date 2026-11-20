import assert from "node:assert/strict";
import test from "node:test";
import { createMetaViewTracker, trackMetaLead } from "./metaPixel";

function withPixel(t: { after: (cleanup: () => void) => void }, fbq?: (...args: unknown[]) => void) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { fbq } });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  });
}

test("la ficha y su consulta identifican el mismo proyecto; abrir la ficha no genera un lead", (t) => {
  const events: unknown[][] = [];
  withPixel(t, (...args) => events.push(args));
  const content = { id: "garden-zen", title: "Garden Zen" };
  createMetaViewTracker()(content);
  assert.equal(events.length, 1);
  assert.equal(events[0][1], "ViewContent");
  trackMetaLead(content);
  assert.equal(events[1][1], "Lead");
  const view = events[0][2] as Record<string, unknown>;
  const lead = events[1][2] as Record<string, unknown>;
  assert.deepEqual(lead.content_ids, view.content_ids);
  assert.equal(lead.content_name, "Garden Zen");
  assert.equal(lead.contact_method, "whatsapp");
  assert.equal(lead.lead_source, "website_cta");
});

test("los cambios de inventario y la repetición de efectos no duplican visitas; reabrir sí cuenta", (t) => {
  const events: unknown[][] = [];
  withPixel(t, (...args) => events.push(args));
  const trackView = createMetaViewTracker();
  const project = { id: "5", title: "ONA Residences" };
  trackView(null);
  trackView(project);
  trackView(project);
  const updatedInventory = { ...project, unidadesDisponibles: 20 };
  trackView(updatedInventory);
  assert.equal(events.length, 1);
  trackView(null);
  trackView(project);
  assert.equal(events.length, 2);
});

test("cambiar de proyecto y volver conserva la atribución de cada visita", (t) => {
  const events: unknown[][] = [];
  withPixel(t, (...args) => events.push(args));
  const trackView = createMetaViewTracker();
  const ona = { id: "5", title: "ONA Residences" };
  const domus = { id: "domus-black", title: "DOMUS Black" };
  trackView(ona);
  trackView(domus);
  trackView(ona);
  assert.deepEqual(events.map((event) => (event[2] as Record<string, unknown>).content_ids), [["5"], ["domus-black"], ["5"]]);
});

test("un píxel ausente o que falla no interrumpe la consulta", (t) => {
  withPixel(t);
  const project = { id: "1816", title: "Tower Eurodesign" };
  assert.equal(trackMetaLead(project), false);
  (window as unknown as { fbq: () => void }).fbq = () => { throw new Error("SDK no disponible"); };
  assert.doesNotThrow(() => createMetaViewTracker()(project));
  assert.equal(trackMetaLead(project), false);
});

test("el payload solo lleva identidad pública del proyecto y el origen del clic", (t) => {
  const events: unknown[][] = [];
  withPixel(t, (...args) => events.push(args));
  const property = { id: "bless-tower", title: "Bless Tower", email: "visitante@example.com", presupuesto: 150000, firebaseUid: "private-user" };
  trackMetaLead(property);
  const payload = events[0][2] as Record<string, unknown>;
  for (const key of ["email", "presupuesto", "firebaseUid", "value", "currency"]) assert.equal(key in payload, false);
});
