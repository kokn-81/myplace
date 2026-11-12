const ROOT = "/domus/domus_insignia";

export const DOMUS_INSIGNIA_MEDIA = {
  hero: `${ROOT}/fachada-oficial.jpg`,
  portfolio: `${ROOT}/alborada-portafolio.jpg`,
  location: `${ROOT}/ubicacion-oficial.jpg`,
  distribution: `${ROOT}/distribucion-modelos.jpg`,
};

const MODEL_ROOMS: Record<string, number> = {
  A: 1, B1: 1, B2: 1, C: 2, D1: 0, D2: 0,
  E1: 1, E2: 1, F1: 1, F2: 1, G: 0, H1: 1, H2: 1,
  I: 1, J1: 1, J2: 1, K: 1,
};

function modelFamily(modelo: string, rooms: number): string | null {
  const key = modelo.toUpperCase().replace(/^MODELO\s*/, "").replace(/[\s_-]/g, "");
  return MODEL_ROOMS[key] === rooms ? key[0].toLowerCase() : null;
}

export function domusInsigniaModelArt(modelo: string, rooms: number) {
  const family = modelFamily(modelo, rooms);
  if (!family) return {};
  return {
    preview: `${ROOT}/modelos/familia-${family}.jpg`,
    plan: `${ROOT}/planos/planta-${family <= "g" ? "a-g" : "h-k"}.jpg`,
    full: `${ROOT}/fichas/familia-${family}.jpg`,
  };
}

export function domusInsigniaModelDetail(modelo: string, rooms: number): string {
  if (!modelFamily(modelo, rooms)) return "Consulta la distribución de tu unidad.";
  if (rooms === 0) return "Un espacio integrado para vivir a tu ritmo.";
  if (rooms === 2) return "Dos dormitorios para dar espacio a tu próxima etapa.";
  return "Un dormitorio separado para disfrutar más privacidad en casa.";
}

export const DOMUS_INSIGNIA_AMENITIES = [
  { category: "Piscina", name: "Tu pausa junto al agua empieza aquí.", description: "Refresca la tarde y disfruta de un espacio para descansar al aire libre en tu propio edificio.", image: `${ROOT}/amenidades/piscina.jpg` },
  { category: "Gimnasio", name: "Hazle lugar a tu mejor rutina.", description: "Entrena a unos pasos de tu departamento, con un ambiente equipado para moverte a tu ritmo.", image: `${ROOT}/amenidades/gimnasio.jpg` },
  { category: "Sala de TV", name: "Una película, una charla y tiempo para ti.", description: "Encuentra otro lugar para compartir y relajarte en los espacios comunes de Insignia.", image: `${ROOT}/amenidades/sala-tv.jpg` },
  { category: "Cowork", name: "Tus ideas también tienen su lugar.", description: "Separa el trabajo del descanso en un ambiente con puestos para concentrarte y avanzar con tus proyectos.", image: `${ROOT}/amenidades/cowork.jpg` },
  { category: "Sala de reuniones", name: "Reúnete sin cambiar de dirección.", description: "Recibe a tu equipo o comparte una conversación en un ambiente de encuentro del edificio.", image: `${ROOT}/amenidades/reuniones.jpg` },
  { category: "Churrasquera", name: "El próximo asado puede ser en casa.", description: "Reúne a los tuyos alrededor de la parrilla y disfruta un espacio para cocinar y compartir.", image: `${ROOT}/amenidades/churrasquera.jpg` },
  { category: "Salón multifuncional", name: "Haz espacio para tus mejores encuentros.", description: "Celebra, conversa y recibe a tus visitas en un ambiente que amplía las posibilidades de tu hogar.", image: `${ROOT}/amenidades/salon-multifuncional.jpg` },
  { category: "Galería junto a la piscina", name: "Disfruta el tiempo al aire libre.", description: "Suma una pausa, una caminata o una charla junto al agua a tus planes del día.", image: `${ROOT}/amenidades/galeria-piscina.jpg` },
  { category: "Lobby", name: "Llegar a casa también se disfruta.", description: "Un lobby amoblado para darte la bienvenida y recibir a quienes forman parte de tu vida.", image: `${ROOT}/amenidades/lobby.jpg` },
];

export const DOMUS_INSIGNIA_AMENITY_HIGHLIGHTS = [
  "Sauna en área green", "Sala de TV con mesa de billar",
  "Lounge exterior", "Lavandería con lavadora y secadora",
];

export const DOMUS_INSIGNIA_EQUIPMENT = [
  {
    title: "Un hogar inteligente, para tu día a día.",
    image: `${ROOT}/equipamiento-domotico.jpg`,
    imageLabel: "Domótica y equipamiento de Domus Insignia",
    items: [
      "Domótica en luces y aires, asistente Alexa y cerradura inteligente.",
      "Climatización inverter e iluminación LED.",
      "Cocina encimera y extractor CATA, microondas y mobiliario alto y bajo.",
      "Horno empotrado y roperos en departamentos de más de 50 m², según el brochure.",
      "Mobiliario de baño, box de vidrio templado y espejos Touch.",
      "El tipo de cocina y algunos equipos dependen de la superficie; confirma el alcance de tu modelo.",
    ],
  },
  {
    title: "Comodidad que sigue fuera de tu puerta.",
    image: `${ROOT}/equipamiento-condominio.jpg`,
    imageLabel: "Acabados y equipamiento del edificio Domus Insignia",
    items: [
      "Lobby y áreas sociales amoblados, con decoración y jardines.",
      "Dos ascensores con detalles en mármol y madera y tarjetas de acceso.",
      "Control de ingreso por códigos y tarjetas, intercomunicador y cámaras.",
      "Iluminación con sensores en circulaciones y parqueos.",
      "Sistema contra incendios con gabinetes, mangueras y extintores.",
      "Puertas con aislamiento acústico y carpintería de doble vidrio termoacústico.",
      "Porcelanatos de gran formato y mesones de granito negro absoluto.",
      "Parqueos cubiertos y de visitas; consulta disponibilidad y condiciones.",
    ],
  },
];
