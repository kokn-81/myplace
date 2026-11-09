const ROOT = "/domus/domus_black";

export const DOMUS_BLACK_MEDIA = {
  portfolio: `${ROOT}/alborada-portafolio.jpg`,
  location: `${ROOT}/ubicacion-oficial.jpg`,
  building: `${ROOT}/distribucion-edificio.jpg`,
};

const MODEL_FAMILIES: Record<string, { variants: number; rooms: number; detail: string }> = {
  A: { variants: 4, rooms: 1, detail: "Cocina integrada, balcón y dormitorio independiente." },
  B: { variants: 5, rooms: 0, detail: "Un espacio integrado para vivir a tu ritmo." },
  C: { variants: 4, rooms: 0, detail: "Cocina abierta y ambiente integrado." },
  D: { variants: 2, rooms: 1, detail: "Un dormitorio separado para tu descanso." },
  E: { variants: 2, rooms: 0, detail: "Un monoambiente con cocina y balcón." },
  F: { variants: 3, rooms: 1, detail: "Un dormitorio y dos baños para más comodidad." },
  G: { variants: 2, rooms: 0, detail: "Distribución abierta con espacio para compartir." },
  H: { variants: 2, rooms: 1, detail: "Un dormitorio para ganar privacidad." },
  I: { variants: 2, rooms: 2, detail: "Dos dormitorios y tres baños." },
  J: { variants: 2, rooms: 1, detail: "Un dormitorio, con tus espacios bien definidos." },
  K: { variants: 1, rooms: 2, detail: "Dos dormitorios y dos baños para tu día a día." },
  L: { variants: 1, rooms: 3, detail: "Tres dormitorios y tres baños para tu próxima etapa." },
  M: { variants: 1, rooms: 3, detail: "Tres dormitorios y tres baños para compartir tu hogar." },
};

function modelFamily(modelo: string, rooms: number) {
  const key = modelo.toUpperCase().replace(/^MODELO\s*/, "").replace(/[\s_-]/g, "");
  const match = /^([A-M])(\d?)$/.exec(key);
  if (!match) return null;
  const family = MODEL_FAMILIES[match[1]];
  const variant = Number(match[2] || 1);
  if (!family || family.rooms !== rooms || variant < 1 || variant > family.variants) return null;
  if (!match[2] && family.variants > 1) return null;
  return { key: match[1].toLowerCase(), ...family };
}

export function domusBlackModelArt(modelo: string, rooms: number) {
  const family = modelFamily(modelo, rooms);
  if (!family) return {};
  return {
    preview: `${ROOT}/modelos/familia-${family.key}.jpg`,
    plan: `${ROOT}/planos/familia-${family.key}.jpg`,
    full: `${ROOT}/fichas/familia-${family.key}.jpg`,
  };
}

export function domusBlackModelDetail(modelo: string, rooms: number): string {
  return modelFamily(modelo, rooms)?.detail || "Consulta la distribución de tu unidad.";
}

export const DOMUS_BLACK_AMENITIES = [
  { name: "Tu pausa favorita, dentro de casa.", category: "Piscina interior y spa", description: "Desconecta en la piscina temperada y disfruta un ambiente de descanso pensado para bajar el ritmo.", image: `${ROOT}/amenidades/piscina-interior.jpg` },
  { name: "Haz del agua parte de tu rutina.", category: "Piscina exterior", description: "Una piscina de 25 metros, jacuzzi integrado y camastros para refrescar la tarde y disfrutar el tiempo libre.", image: `${ROOT}/amenidades/piscina-exterior.jpg` },
  { name: "Vuelve a ti, sin salir del edificio.", category: "Sauna seco y vapor", description: "Encuentra tu momento de bienestar en los ambientes de sauna que complementan la propuesta de spa.", image: `${ROOT}/amenidades/saunas.jpg` },
  { name: "Tu entrenamiento tiene lugar en casa.", category: "Gimnasio", description: "Dale continuidad a tu rutina con un espacio de entrenamiento dentro de Domus Black.", image: `${ROOT}/amenidades/gimnasio.jpg` },
  { name: "El próximo asado puede ser aquí.", category: "Churrasqueras", description: "Reúne a los tuyos alrededor de la mesa. El proyecto contempla seis churrasqueras distribuidas en sus áreas sociales.", image: `${ROOT}/amenidades/churrasquera.jpg` },
  { name: "Haz espacio para tus próximas ideas.", category: "Cowork y reuniones", description: "Separa el trabajo del descanso con un ambiente compartido para concentrarte y reunirte.", image: `${ROOT}/amenidades/cowork.jpg` },
  { name: "Una partida más, un buen momento más.", category: "Billar y juegos", description: "Comparte una partida de billar o futbolín y encuentra otra forma de disfrutar el tiempo en tu edificio.", image: `${ROOT}/amenidades/juegos.jpg` },
  { name: "Celebra con espacio para compartir.", category: "Salón de eventos", description: "Un ambiente para reunirte, celebrar y convertir tus encuentros en parte de la experiencia de vivir en Black.", image: `${ROOT}/amenidades/eventos.jpg` },
  { name: "Un café también puede cambiar tu día.", category: "Coffee & Book", description: "Disfruta una pausa en la cafetería-librería o encuentra un punto de encuentro a unos pasos de tu departamento.", image: `${ROOT}/amenidades/cafeteria.jpg` },
  { name: "El gusto de llegar a tu propia dirección.", category: "Lobby", description: "Una bienvenida de inspiración hotelera para recibirte y recibir a quienes forman parte de tu vida.", image: `${ROOT}/amenidades/lobby.jpg` },
];

export const DOMUS_BLACK_AMENITY_HIGHLIGHTS = [
  "Área de yoga", "Salas de TV y bar", "Billar y póker",
  "Juegos infantiles", "Cocina gourmet", "Mirador verde",
];

export const DOMUS_BLACK_EQUIPMENT = [
  {
    title: "Tu departamento, listo para acompañarte.",
    image: `${ROOT}/equipamiento-departamentos.jpg`,
    imageLabel: "Equipamiento de los departamentos Domus Black",
    items: [
      "Cocina eléctrica, extractor, horno, heladera y microondas de empotrar.",
      "Mesones y mobiliario alto y bajo de cocina.",
      "Aires inverter, domótica en luces y climatización, y parlante Alexa.",
      "Lavadora-secadora e intercomunicador en cada departamento.",
      "Baños con box de ducha, accesorios y espejo con iluminación LED.",
      "Luminarias decorativas, spots LED y sistema contra incendios.",
    ],
  },
  {
    title: "Un edificio que suma comodidad a tu día.",
    image: `${ROOT}/equipamiento-condominio.jpg`,
    imageLabel: "Equipamiento del condominio Domus Black",
    items: [
      "Lobby y cafetería-librería amoblados, con decoración y jardines en las áreas comunes.",
      "Tres ascensores con tarjetas de seguridad y pisos de mármol.",
      "Control de acceso por códigos y tarjetas, y cámaras de vigilancia en el edificio.",
      "Iluminación y sensores de movimiento en circulaciones y parqueos.",
      "Seis churrasqueras y cocina gourmet para compartir.",
      "Sistema contra incendios con gabinetes, mangueras y extintores.",
      "Parqueos cubiertos, cargador eléctrico y estaciones de inflado y lavado de vehículos.",
    ],
  },
];
