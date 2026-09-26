import assert from "node:assert/strict";
import test from "node:test";
import { extractSearchCriteria, localSearchCatalog } from "./localSearch";
import { Property } from "./types";

const mockCatalog: Property[] = [
  {
    id: "1",
    title: "Departamento 2 Dorms · Equipetrol",
    description: "Hermoso departamento de 2 dormitorios con piscina y churrasquera en Equipetrol.",
    price: 4500,
    currency: "Bs",
    rooms: 2,
    bathrooms: 2,
    area: "Equipetrol",
    zone: "Equipetrol",
    city: "Santa Cruz",
    lat: -17.77,
    lng: -63.19,
    operation: "Alquiler",
    type: "Departamento",
    amenities: ["piscina", "churrasquera", "garaje"],
    images: [],
    offers: [
      {
        id: "o1",
        operation: "Alquiler",
        price: 4500,
        currency: "Bs",
      },
    ],
  },
  {
    id: "2",
    title: "Casa 4 Dorms en Urubo con piscina",
    description: "Amplia casa en venta en el Urubo con churrasquera.",
    price: 320000,
    currency: "$ (USD)",
    rooms: 4,
    bathrooms: 5,
    area: "Urubó",
    zone: "Urubó",
    city: "Santa Cruz",
    lat: -17.76,
    lng: -63.22,
    operation: "Venta",
    type: "Casa",
    amenities: ["piscina", "churrasquera"],
    images: [],
    offers: [
      {
        id: "o2",
        operation: "Venta",
        price: 320000,
        currency: "$ (USD)",
      },
    ],
  },
  {
    id: "3",
    title: "Monoambiente amoblado en Sirari",
    description: "Monoambiente moderno amoblado con garaje cerca a Equipetrol.",
    price: 500,
    currency: "$ (USD)",
    rooms: 0,
    bathrooms: 1,
    area: "Sirari",
    zone: "Sirari",
    city: "Santa Cruz",
    lat: -17.765,
    lng: -63.195,
    operation: "Alquiler",
    type: "Departamento",
    amenities: ["amoblado", "garaje"],
    images: [],
    offers: [
      {
        id: "o3",
        operation: "Alquiler",
        price: 500,
        currency: "$ (USD)",
      },
    ],
  },
];

test("extractSearchCriteria extrae operacion, tipo, dormitorios, zona y presupuesto", () => {
  const criteria1 = extractSearchCriteria("alquiler departamento 2 dormitorios en equipetrol menos de 5000 bs");
  assert.equal(criteria1.operation, "rent");
  assert.equal(criteria1.propertyType, "Departamento");
  assert.equal(criteria1.bedrooms, "2 Dorms");
  assert.equal(criteria1.zone, "equipetrol");
  assert.equal(criteria1.maxBudget, 5000);

  const criteria2 = extractSearchCriteria("comprar casa en urubo con piscina");
  assert.equal(criteria2.operation, "buy");
  assert.equal(criteria2.propertyType, "Casa");
  assert.equal(criteria2.zone, "urubo");
  assert.deepEqual(criteria2.amenities, ["piscina"]);

  const criteria3 = extractSearchCriteria("monoambiente amoblado en sirari");
  assert.equal(criteria3.propertyType, "Departamento");
  assert.equal(criteria3.bedrooms, "Monoambiente");
  assert.equal(criteria3.zone, "sirari");
  assert.deepEqual(criteria3.amenities, ["amoblado"]);
});

test("localSearchCatalog filtra el catalogo instantaneamente con multiples criterios", () => {
  // 1. Busqueda de alquiler de 2 dorms en Equipetrol
  const res1 = localSearchCatalog("alquiler departamento 2 dorms en equipetrol", mockCatalog);
  assert.equal(res1.intent, "rent");
  assert.deepEqual(res1.ids, ["1"]);

  // 2. Busqueda de venta en Urubo
  const res2 = localSearchCatalog("casa en venta urubo", mockCatalog);
  assert.equal(res2.intent, "buy");
  assert.deepEqual(res2.ids, ["2"]);

  // 3. Busqueda de monoambiente amoblado
  const res3 = localSearchCatalog("monoambiente amoblado", mockCatalog);
  assert.deepEqual(res3.ids, ["3"]);

  // 4. Si busca algo que no coincide presupuesto
  const res4 = localSearchCatalog("casa en venta urubo menos de 200000", mockCatalog);
  assert.equal(res4.ids.length, 0);
});
