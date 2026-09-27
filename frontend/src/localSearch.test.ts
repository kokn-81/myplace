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

test("extractSearchCriteria y extractReferenceId extraen correctamente referencias #ref, REF, # y evitan falsos presupuestos", () => {
  const c1 = extractSearchCriteria("REF 3");
  assert.equal(c1.referenceId, "3");
  assert.equal(c1.maxBudget, undefined);

  const c2 = extractSearchCriteria("#ref 3");
  assert.equal(c2.referenceId, "3");
  assert.equal(c2.maxBudget, undefined);

  const c3 = extractSearchCriteria("ref #3");
  assert.equal(c3.referenceId, "3");

  const c4 = extractSearchCriteria("#3");
  assert.equal(c4.referenceId, "3");

  const c5 = extractSearchCriteria("ref 448");
  assert.equal(c5.referenceId, "448");
  // Important: 448 must NOT be captured as maxBudget!
  assert.equal(c5.maxBudget, undefined);

  const c6 = extractSearchCriteria("depto en la riviera");
  assert.equal(c6.propertyType, "Departamento");
  assert.deepEqual(c6.keywords, ["riviera"]);
});

test("localSearchCatalog soporta busqueda por referencia REF 3 y nombres de edificio como La Riviera", () => {
  const extendedCatalog: Property[] = [
    ...mockCatalog,
    {
      id: "4",
      complejoId: "3",
      complejoNombre: "La Riviera & Beauty Plaza",
      title: "Depto 3 Dorm. · La Riviera Equipetrol",
      description: "Espectacular departamento en piso alto torre La Riviera.",
      price: 185000,
      currency: "$ (USD)",
      rooms: 3,
      bathrooms: 3,
      area: "Equipetrol Norte",
      zone: "Equipetrol",
      city: "Santa Cruz",
      lat: -17.7601,
      lng: -63.2017,
      operation: "Venta",
      type: "Departamento",
      amenities: ["piscina", "garaje"],
      images: [],
    },
    {
      id: "448",
      title: "Depto 1 Dorm. a Estrenar · Equipetrol",
      description: "Excelente inversion en Equipetrol.",
      price: 68000,
      currency: "$ (USD)",
      rooms: 1,
      bathrooms: 1,
      area: "Equipetrol",
      zone: "Equipetrol",
      city: "Santa Cruz",
      lat: -17.765,
      lng: -63.195,
      operation: "Venta",
      type: "Departamento",
      amenities: ["amoblado"],
      images: [],
    },
  ];

  // Busqueda por REF 3: debe retornar el inmueble con id 3 y los inmuebles del complejo 3 (La Riviera)
  const resRef3 = localSearchCatalog("REF 3", extendedCatalog);
  assert.ok(resRef3.ids.includes("3"), "Debe incluir el inmueble con id 3");
  assert.ok(resRef3.ids.includes("4"), "Debe incluir el inmueble con complejoId 3");

  const resHashRef3 = localSearchCatalog("#ref 3", extendedCatalog);
  assert.ok(resHashRef3.ids.includes("3"));
  assert.ok(resHashRef3.ids.includes("4"));

  const resHash3 = localSearchCatalog("#3", extendedCatalog);
  assert.ok(resHash3.ids.includes("3"));
  assert.ok(resHash3.ids.includes("4"));

  // Busqueda por ref 448: no debe ser descartado por presupuesto (68000 > 448)
  const resRef448 = localSearchCatalog("ref 448", extendedCatalog);
  assert.deepEqual(resRef448.ids, ["448"]);

  // Busqueda por edificio "riviera" o "la riviera"
  const resRiviera = localSearchCatalog("la riviera", extendedCatalog);
  assert.deepEqual(resRiviera.ids, ["4"]);

  // Busqueda combinada "departamento en riviera"
  const resDepRiviera = localSearchCatalog("departamento en riviera", extendedCatalog);
  assert.deepEqual(resDepRiviera.ids, ["4"]);
});
