import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import ProjectLandingPage from "./components/ProjectLandingPage";
import { ProjectContactActions, ProjectContactShortcut } from "./components/ProjectContactActions";
import type { Property } from "./types";

export const CONTACT_PROJECT_CASES = [
  ["5", "ONA Residences"], ["1816", "Tower Eurodesign"],
  ["garden-zen", "Garden Zen"], ["bless-tower", "Bless Tower"], ["bless-drei", "Bless Drei"],
  ["trivento-iv", "Trivento IV"], ["beton-brut-ii", "Béton Brut II"], ["vertical-guemes", "Vertical Güemes"],
  ["luxe-tower", "Luxe Tower"], ["alpha-luxe", "Alpha by Luxe Design"],
  ["sky-level", "Sky Level"], ["sky-equinox", "Sky Equinox"], ["giardino", "Giardino"],
  ["mare", "Mare"], ["westgate-tower", "Westgate Tower"],
  ...["black", "gold", "onix", "insignia", "luxury", "tower", "infinity"].map(name => [`domus-${name}`, `DOMUS ${name.toUpperCase()}`]),
];

for (const [id, title] of CONTACT_PROJECT_CASES) test(`${title}: el cierre ofrece reserva y asesoría y conserva las secciones del proyecto`, () => {
  const property: Property = { id, title, description: "", complejoNombre: title, price: 0, rooms: 1, bathrooms: 1, area: "Santa Cruz", zone: "Equipetrol", lat: -17.77, lng: -63.19, type: "Proyecto (preventa)", operation: "Venta", currency: "USD", images: [], amenities: [] };
  const html = renderToStaticMarkup(<ProjectLandingPage property={property} onClose={() => {}} />);
  const expectedSections = ["intro", "lugar", "amenidades", "tipologias", "equipamiento", "constructora", "pago", "disponibilidad", "cierre"].filter(section => id !== "giardino" || section !== "constructora");
  assert.deepEqual([...html.matchAll(/<section id="([^"]+)"/g)].map(match => match[1]), expectedSections);
  const closing = html.match(/<section id="cierre"[\s\S]*?<\/section>/)?.[0];
  assert.ok(closing);
  assert.equal((closing.match(/Reservar unidad elegida/g) || []).length, 1);
  assert.equal((closing.match(/Agendar asesoría por WhatsApp/g) || []).length, 1);
  assert.match(closing, /role="group" aria-label="Reserva y asesoría"/);
});

test("sin unidad disponible se deshabilita la reserva y se conserva el acceso a asesoría y al cotizador", () => {
  const html = renderToStaticMarkup(<ProjectContactActions canReserve={false} onReserve={() => {}} onAdvice={() => {}} onChooseUnit={() => {}} />);
  assert.match(html, /<button[^>]*disabled=""[^>]*>[\s\S]*?Reservar unidad elegida/);
  assert.match(html, /Agendar asesoría por WhatsApp/);
  assert.match(html, /Elige una unidad disponible para reservar/);
});

test("el acceso flotante apunta al cierre y conserva el icono y el tamaño táctil", () => {
  const html = renderToStaticMarkup(<ProjectContactShortcut onClick={() => {}} />);
  assert.match(html, /aria-controls="cierre"/);
  assert.match(html, /Ver opciones de reserva y asesoría/);
  assert.match(html, /h-11 w-11/);
  assert.match(html, /\/whatsapp.svg/);
  assert.doesNotMatch(html, /wa\.me|target="_blank"/);
});
