const ROOT = "/domus/domus_onix";

export const DOMUS_ONIX_MEDIA = {
  hero: `${ROOT}/fachada-oficial.jpg`,
  portfolio: `${ROOT}/alborada-portafolio.jpg`,
  location: `${ROOT}/ubicacion-oficial.jpg`,
  distribution: `${ROOT}/distribucion-modelos.jpg`,
};

const MODELS: Record<string, { family: string; rooms: number; detail: string }> = {
  A1: { family: "a", rooms: 0, detail: "Un ambiente integrado con balcón para disfrutar tu espacio." },
  A2: { family: "a", rooms: 0, detail: "Un ambiente integrado con balcón para disfrutar tu espacio." },
  A3: { family: "a", rooms: 0, detail: "Un ambiente integrado con balcón para disfrutar tu espacio." },
  A4: { family: "a", rooms: 0, detail: "Un ambiente integrado con balcón para disfrutar tu espacio." },
  A5: { family: "a", rooms: 0, detail: "Un ambiente integrado con balcón para disfrutar tu espacio." },
  B1: { family: "b", rooms: 1, detail: "Un dormitorio separado, cocina integrada y balcón." },
  B2: { family: "b", rooms: 1, detail: "Un dormitorio separado, cocina integrada y balcón." },
  C1: { family: "c", rooms: 1, detail: "Más espacio para vivir, recibir y descansar a tu manera." },
  C2: { family: "c", rooms: 1, detail: "Más espacio para vivir, recibir y descansar a tu manera." },
  D1: { family: "d", rooms: 2, detail: "Dos dormitorios para dar espacio a tu próxima etapa." },
  D2: { family: "d", rooms: 2, detail: "Dos dormitorios; la unidad del piso 4 incluye losa exterior." },
  E1: { family: "e", rooms: 2, detail: "Dos dormitorios y ambientes para compartir en casa." },
  E2: { family: "e", rooms: 2, detail: "Dos dormitorios; la unidad del piso 4 incluye losa exterior." },
  F: { family: "f", rooms: 2, detail: "Dos dormitorios, balcón y un espacio propio para cada momento." },
  PHG1: { family: "g", rooms: 3, detail: "Tres dormitorios y sala de doble altura para vivir en grande." },
  PHG2: { family: "g", rooms: 3, detail: "Tres dormitorios y sala de doble altura para vivir en grande." },
  PHH: { family: "h", rooms: 2, detail: "Dos dormitorios en la propuesta de penthouse de Onix." },
};

function modelFor(modelo: string, rooms: number) {
  const key = modelo.toUpperCase().replace(/^MODELO\s*/, "").replace(/[\s_-]/g, "");
  const model = MODELS[key];
  return model?.rooms === rooms ? model : null;
}

export function domusOnixModelArt(modelo: string, rooms: number) {
  const model = modelFor(modelo, rooms);
  if (!model) return {};
  return {
    preview: `${ROOT}/modelos/familia-${model.family}.jpg`,
    plan: `${ROOT}/planos/familia-${model.family}.jpg`,
    full: `${ROOT}/fichas/familia-${model.family}.jpg`,
  };
}

export function domusOnixModelDetail(modelo: string, rooms: number): string {
  return modelFor(modelo, rooms)?.detail || "Consulta la distribución de tu unidad.";
}

export const DOMUS_ONIX_AMENITIES = [
  { category: "Piscina y Sky Bar", name: "Tus tardes, con otra perspectiva.", description: "Disfruta la piscina panorámica y encuentra un nuevo lugar para hacer una pausa, conversar y ver caer la tarde.", image: `${ROOT}/amenidades/piscina-panoramica.jpg` },
  { category: "Jacuzzi y bienestar", name: "Baja el ritmo. Vuelve a ti.", description: "Dedica un momento al descanso en el ambiente de hidromasajes y bienestar que propone Onix.", image: `${ROOT}/amenidades/jacuzzi.jpg` },
  { category: "Sauna seco y vapor", name: "Tu momento de desconexión, cerca de casa.", description: "Suma una pausa de bienestar a tu rutina en los espacios de sauna del edificio.", image: `${ROOT}/amenidades/saunas.jpg` },
  { category: "Gimnasio", name: "Hazle espacio a tu mejor rutina.", description: "Entrena en tu propio edificio y aprovecha un ambiente equipado para moverte a tu ritmo.", image: `${ROOT}/amenidades/gimnasio.jpg` },
  { category: "Cowork y reuniones", name: "Un lugar para avanzar con tus ideas.", description: "Encuentra un ambiente para trabajar o reunirte y deja que tu departamento conserve su espacio de descanso.", image: `${ROOT}/amenidades/cowork.jpg` },
  { category: "Billar y futbolín", name: "Que el próximo encuentro sea en casa.", description: "Comparte una partida y disfruta el tiempo libre en un espacio pensado para encontrarte con otros.", image: `${ROOT}/amenidades/juegos.jpg` },
  { category: "Churrasquera exterior", name: "El asado ya tiene dónde empezar.", description: "Reúne a los tuyos alrededor de la mesa y disfruta de un ambiente con parrilla y vistas al entorno.", image: `${ROOT}/amenidades/churrasquera.jpg` },
  { category: "Cocina gourmet", name: "Cocina, comparte y celebra.", description: "Dale a tus encuentros un escenario propio con la cocina gourmet de las áreas sociales.", image: `${ROOT}/amenidades/cocina-gourmet.jpg` },
  { category: "Salón de eventos", name: "Haz espacio para tus ocasiones especiales.", description: "Recibe a quienes quieres en un ambiente que amplía las posibilidades de tu hogar.", image: `${ROOT}/amenidades/eventos.jpg` },
  { category: "Terraza Zen", name: "Tu pausa también puede ser al aire libre.", description: "Disfruta de un espacio exterior para conversar, descansar y cambiar el ritmo de tu día.", image: `${ROOT}/amenidades/terraza-zen.jpg` },
  { category: "Onix Coffee & Books", name: "Un café, un libro y tu momento.", description: "Encuentra un punto de encuentro en la cafetería-librería que forma parte de la propuesta del edificio.", image: `${ROOT}/amenidades/cafeteria.jpg` },
  { category: "Lobby", name: "Una bienvenida que invita a quedarse.", description: "Llega a tu departamento y recibe a tus visitas en un lobby que acompaña la experiencia Onix.", image: `${ROOT}/amenidades/lobby.jpg` },
];

export const DOMUS_ONIX_AMENITY_HIGHLIGHTS = [
  "Salas de TV y usos múltiples", "Mesas de póker", "Green y lounge exterior",
  "Lavandería con lavadora y secadora", "Seis churrasqueras en distintos niveles",
];

export const DOMUS_ONIX_EQUIPMENT = [
  {
    title: "Un hogar que acompaña tu día.",
    image: `${ROOT}/equipamiento-departamentos.jpg`,
    imageLabel: "Equipamiento de los departamentos Domus Onix",
    items: [
      "Cocina eléctrica, extractor, horno, heladera y microondas de empotrar.",
      "Mesones y mobiliario alto y bajo de cocina.",
      "Climatización inverter y domótica en luces y aires, con parlante Alexa.",
      "Lavadora-secadora e intercomunicador en cada departamento.",
      "Box de baño, accesorios de ducha y espejo con iluminación LED.",
      "Luminarias decorativas, spots LED y sistema contra incendios.",
    ],
  },
  {
    title: "Comodidad que continúa fuera de tu puerta.",
    image: `${ROOT}/equipamiento-condominio.jpg`,
    imageLabel: "Equipamiento del condominio Domus Onix",
    items: [
      "Lobby y Coffee & Book Store amoblados, con decoración y jardines.",
      "Tres ascensores con tarjetas de seguridad y pisos de mármol.",
      "Control de ingreso por códigos y tarjetas, y cámaras de vigilancia.",
      "Iluminación de circulaciones y parqueos, y sensores de movimiento.",
      "Seis churrasqueras y cocina gourmet.",
      "Sistema contra incendios con gabinetes, mangueras y extintores.",
      "Parqueos cubiertos y cargador para vehículos eléctricos; consulta su disponibilidad y condiciones.",
    ],
  },
];
