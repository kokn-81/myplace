import { DOMUS_BLACK_EQUIPMENT } from "./domusBlackContent";

const ROOT = "/domus/domus_gold";
export const DOMUS_GOLD_MEDIA = {
  portfolio: `${ROOT}/alborada-portafolio.jpg`,
  location: `${ROOT}/ubicacion-oficial.jpg`,
  building: `${ROOT}/distribucion-edificio.jpg`,
};

const MODEL_FAMILIES: Record<string, { variants: number; rooms: number; detail: string }> = {
  A: { variants: 4, rooms: 1, detail: "Un dormitorio independiente, cocina integrada y balcón." },
  B: { variants: 12, rooms: 0, detail: "Un ambiente integrado para vivir a tu ritmo." },
  C: { variants: 2, rooms: 0, detail: "Espacio abierto con cocina y baño independiente." },
  D: { variants: 4, rooms: 1, detail: "Un dormitorio separado y un balcón para tu pausa." },
  E: { variants: 4, rooms: 0, detail: "Un monoambiente amplio, con espacio para compartir." },
  F: { variants: 4, rooms: 1, detail: "Un dormitorio para ganar privacidad en casa." },
  G: { variants: 4, rooms: 2, detail: "Dos dormitorios y tres baños para tu día a día." },
  H: { variants: 2, rooms: 3, detail: "Tres dormitorios y cuatro baños para tu próxima etapa." },
  I: { variants: 2, rooms: 2, detail: "Dos dormitorios y tres baños para compartir tu hogar." },
};

function modelFamily(modelo: string, rooms: number) {
  const key = modelo.toUpperCase().replace(/^MODELO\s*/, "").replace(/[\s_-]/g, "");
  const match = /^([A-I])(\d{1,2})$/.exec(key);
  if (!match) return null;
  const family = MODEL_FAMILIES[match[1]];
  const variant = Number(match[2]);
  if (!family || family.rooms !== rooms || variant < 1 || variant > family.variants) return null;
  return { key: match[1].toLowerCase(), ...family };
}

export function domusGoldModelArt(modelo: string, rooms: number) {
  const family = modelFamily(modelo, rooms);
  if (!family) return {};
  return {
    preview: `${ROOT}/modelos/familia-${family.key}.jpg`,
    plan: `${ROOT}/planos/familia-${family.key}.jpg`,
    full: `${ROOT}/fichas/familia-${family.key}.jpg`,
  };
}

export function domusGoldModelDetail(modelo: string, rooms: number): string {
  return modelFamily(modelo, rooms)?.detail || "Consulta la distribución de tu unidad.";
}

export const DOMUS_GOLD_AMENITIES = [
  { name: "Tu tarde junto al agua empieza aquí.", category: "Piscina exterior", description: "Refresca el día, descansa junto a la piscina y disfruta de más espacio para hacer una pausa en casa.", image: `${ROOT}/amenidades/piscina-exterior.jpg` },
  { name: "Hazle un lugar al descanso.", category: "Piscina con jacuzzi", description: "Disfruta el ambiente de piscina y jacuzzi que suma bienestar a la propuesta de Domus Gold.", image: `${ROOT}/amenidades/piscina-jacuzzi.jpg` },
  { name: "Tu entrenamiento, a unos pasos.", category: "Gimnasio", description: "Encuentra tiempo para moverte en un gimnasio que forma parte de tu propio edificio.", image: `${ROOT}/amenidades/gimnasio.jpg` },
  { name: "Un espacio para avanzar con tus ideas.", category: "Cowork y reuniones", description: "Trabaja o reúnete en un ambiente que te permite separar tus proyectos de tus momentos de descanso.", image: `${ROOT}/amenidades/cowork.jpg` },
  { name: "Que la próxima partida sea en casa.", category: "Billar y futbolín", description: "Comparte una partida con amigos y disfruta el tiempo libre en los espacios de encuentro del edificio.", image: `${ROOT}/amenidades/juegos.jpg` },
  { name: "El asado ya tiene su lugar.", category: "Churrasquera", description: "Reúne a los tuyos alrededor de la mesa en un ambiente con parrilla, barra y vistas al entorno.", image: `${ROOT}/amenidades/churrasquera.jpg` },
  { name: "Desconecta a tu manera.", category: "Sala de TV", description: "Disfruta una película o una charla en un ambiente que amplía las posibilidades de tu hogar.", image: `${ROOT}/amenidades/sala-tv.jpg` },
  { name: "Haz espacio para celebrar.", category: "Salón de eventos", description: "Recibe a quienes quieres y comparte tus ocasiones especiales en un espacio del propio edificio.", image: `${ROOT}/amenidades/eventos.jpg` },
  { name: "Un café, un libro y tu momento.", category: "Coffee & Book", description: "Encuentra una pausa o un punto de encuentro en la cafetería-librería de la propuesta Gold.", image: `${ROOT}/amenidades/cafeteria.jpg` },
  { name: "Una bienvenida que invita a quedarse.", category: "Lobby", description: "Un lobby de inspiración hotelera para disfrutar la llegada a tu departamento y recibir a tus visitas.", image: `${ROOT}/amenidades/lobby.jpg` },
];

export const DOMUS_GOLD_AMENITY_HIGHLIGHTS = [
  "Spa e hidromasajes", "Sauna seco y vapor", "Cocina gourmet",
  "Bar y póker", "Área verde y lounge exterior", "Lavandería con lavadora y secadora",
];

export const DOMUS_GOLD_EQUIPMENT = DOMUS_BLACK_EQUIPMENT.map((group, index) => ({
  ...group,
  image: `${ROOT}/equipamiento-${index === 0 ? "departamentos" : "condominio"}.jpg`,
  imageLabel: index === 0 ? "Equipamiento de los departamentos Domus Gold" : "Equipamiento del condominio Domus Gold",
}));
