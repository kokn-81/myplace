import type { Property } from "./types";
import { isProjectType } from "./types";

export const isOnaProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = String(p.id).toLowerCase();
  const sTitle = String(p.title || (p as any).titulo || "").toLowerCase();
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "").toLowerCase();

  // Descartar alquileres o reventas secundarias de terceros en otros edificios
  if (sId === "1325") return false;

  return (
    sId === "5" ||
    sId === "ona" ||
    sId === "ona-residences" ||
    sId.startsWith("ona-") ||
    sTitle.includes("ona residences") ||
    sCmp.includes("ona residences") ||
    (sTitle.includes("ona") && (sTitle.includes("cusis") || sTitle.includes("banzer") || sTitle.includes("preventa")))
  );
};

export const isEurodesignProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = String(p.id).toLowerCase();
  const sTitle = String(p.title || (p as any).titulo || "").toLowerCase();
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "").toLowerCase();
  return (
    sId === "1816" ||
    sId === "eurodesign" ||
    sId === "tower-eurodesign" ||
    sTitle.includes("tower eurodesign") ||
    sCmp.includes("tower eurodesign")
  );
};

export const isGardenZenProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = String(p.id).toLowerCase();
  const sTitle = String(p.title || (p as any).titulo || "").trim().toLowerCase();
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "").trim().toLowerCase();
  return (
    sId === "garden-zen" ||
    sId.startsWith("garden-zen") ||
    sTitle.includes("garden zen") ||
    sCmp.includes("garden zen")
  );
};

export const isBlessTowerProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = String(p.id).toLowerCase();
  const sTitle = String(p.title || (p as any).titulo || "").trim().toLowerCase();
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "").trim().toLowerCase();
  return (
    sId === "bless-tower" ||
    sId.startsWith("bless-tower") ||
    sTitle.includes("bless tower") ||
    sCmp.includes("bless tower")
  );
};

export const isBlessDreiProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = String(p.id).toLowerCase();
  const sTitle = String(p.title || (p as any).titulo || "").trim().toLowerCase();
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "").trim().toLowerCase();
  return (
    sId === "bless-drei" ||
    sId.startsWith("bless-drei") ||
    sTitle.includes("bless drei") ||
    sCmp.includes("bless drei")
  );
};

export const isTriventoProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = String(p.id).toLowerCase();
  const sTitle = String(p.title || (p as any).titulo || "").trim().toLowerCase();
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "").trim().toLowerCase();
  if (sId === "trivento-iv" || sId.startsWith("trivento")) return true;

  // The API also lists individual apartments in this building (e.g. #1322).
  // Their building name must not replace the curated project during refresh.
  const type = p.type || (p as any).tipo_inmueble;
  return isProjectType(type) && (sTitle.includes("trivento") || sCmp.includes("trivento"));
};

export const isTriventoSlug = (value: string): boolean => {
  const q = value.trim().toLowerCase();
  return q === "trivento" || q === "trivento-iv" || q === "triventoiv" || q === "trivento-4" || q.includes("trivento");
};

const normalizeBeton = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const isBetonBrutProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = normalizeBeton(String(p.id));
  const sTitle = normalizeBeton(String(p.title || (p as any).titulo || ""));
  const sCmp = normalizeBeton(String(p.complejoNombre || (p as any).complejo_nombre || ""));
  return sId === "beton-brut-ii" || sId.startsWith("beton-brut") || sId.startsWith("betonbrut") || sTitle.includes("beton brut") || sCmp.includes("beton brut");
};

export const isBetonBrutSlug = (value: string): boolean => {
  const q = normalizeBeton(value.trim());
  return q === "beton-brut-ii" || q === "beton-brut" || q === "betonbrut" || q === "betonbrut-ii" || q === "betonbrut2" || q.includes("beton brut") || q.includes("beton-brut");
};

const normalizeVertical = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const mentionsVerticalGuemes = (value: string) => {
  const q = normalizeVertical(value);
  return q.includes("vertical") && q.includes("guemes");
};

export const isVerticalGuemesProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = normalizeVertical(String(p.id));
  if (sId === "vertical-guemes") return true;
  const type = p.type || (p as any).tipo_inmueble;
  if (!isProjectType(type)) return false;
  const sTitle = normalizeVertical(String(p.title || (p as any).titulo || ""));
  const sCmp = normalizeVertical(String(p.complejoNombre || (p as any).complejo_nombre || ""));
  return mentionsVerticalGuemes(sTitle) || mentionsVerticalGuemes(sCmp);
};

export const isVerticalGuemesSlug = (value: string): boolean => {
  const q = normalizeVertical(value.trim()).replace(/[\s_]+/g, "-");
  return q === "vertical-guemes" || q === "verticalguemes" || mentionsVerticalGuemes(q);
};

const hasToken = (value: string, token: string) =>
  new RegExp(`(?:^|[^a-z])${token}(?:[^a-z]|$)`).test(normalizeVertical(value));

const mentionsSkyLevel = (value: string) => hasToken(value, "sky") && hasToken(value, "level");
const mentionsSkyEquinox = (value: string) => hasToken(value, "sky") && hasToken(value, "equinox");
const SKY_LEVEL_IDS = new Set(["sky-level", "skylevel"]);
const SKY_EQUINOX_IDS = new Set(["sky-equinox", "skyequinox"]);

export const isSkyLevelProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = normalizeVertical(String(p.id)).replace(/[\s_]+/g, "-");
  if (SKY_LEVEL_IDS.has(sId)) return true;
  const type = p.type || (p as any).tipo_inmueble;
  if (!isProjectType(type)) return false;
  const sTitle = String(p.title || (p as any).titulo || "");
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "");
  return mentionsSkyLevel(sTitle) || mentionsSkyLevel(sCmp);
};

export const isSkyLevelSlug = (value: string): boolean => {
  const q = normalizeVertical(value.trim()).replace(/[\s_]+/g, "-");
  return SKY_LEVEL_IDS.has(q) || mentionsSkyLevel(q);
};

export const isSkyEquinoxProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = normalizeVertical(String(p.id)).replace(/[\s_]+/g, "-");
  if (SKY_EQUINOX_IDS.has(sId)) return true;
  const type = p.type || (p as any).tipo_inmueble;
  if (!isProjectType(type)) return false;
  const sTitle = String(p.title || (p as any).titulo || "");
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "");
  return mentionsSkyEquinox(sTitle) || mentionsSkyEquinox(sCmp);
};

export const isSkyEquinoxSlug = (value: string): boolean => {
  const q = normalizeVertical(value.trim()).replace(/[\s_]+/g, "-");
  return SKY_EQUINOX_IDS.has(q) || mentionsSkyEquinox(q);
};

const mentionsGiardino = (value: string) => hasToken(value, "giardino");
const GIARDINO_IDS = new Set(["giardino"]);

export const isGiardinoProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = normalizeVertical(String(p.id)).replace(/[\s_]+/g, "-");
  if (GIARDINO_IDS.has(sId)) return true;
  const type = p.type || (p as any).tipo_inmueble;
  if (!isProjectType(type)) return false;
  const sTitle = String(p.title || (p as any).titulo || "");
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "");
  return mentionsGiardino(sTitle) || mentionsGiardino(sCmp);
};

export const isGiardinoSlug = (value: string): boolean => {
  const q = normalizeVertical(value.trim()).replace(/[\s_]+/g, "-");
  return GIARDINO_IDS.has(q) || mentionsGiardino(q);
};

const mentionsMare = (value: string) => hasToken(value, "mare");
const MARE_IDS = new Set(["mare"]);

export const isMareProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = normalizeVertical(String(p.id)).replace(/[\s_]+/g, "-");
  if (MARE_IDS.has(sId)) return true;
  const type = p.type || (p as any).tipo_inmueble;
  if (!isProjectType(type)) return false;
  const sTitle = String(p.title || (p as any).titulo || "");
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "");
  return mentionsMare(sTitle) || mentionsMare(sCmp);
};

export const isMareSlug = (value: string): boolean => {
  const q = normalizeVertical(value.trim()).replace(/[\s_]+/g, "-");
  return MARE_IDS.has(q) || mentionsMare(q);
};

const mentionsAlphaLuxe = (value: string) => hasToken(value, "alpha") && hasToken(value, "luxe");

const ALPHA_LUXE_IDS = new Set(["alpha-luxe", "alpha-by-luxe", "alphabyluxe", "luxe-alpha"]);

export const isAlphaLuxeProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = normalizeVertical(String(p.id)).replace(/[\s_]+/g, "-");
  if (ALPHA_LUXE_IDS.has(sId)) return true;
  const type = p.type || (p as any).tipo_inmueble;
  if (!isProjectType(type)) return false;
  const sTitle = String(p.title || (p as any).titulo || "");
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "");
  return mentionsAlphaLuxe(sTitle) || mentionsAlphaLuxe(sCmp);
};

export const isAlphaLuxeSlug = (value: string): boolean => {
  const q = normalizeVertical(value.trim()).replace(/[\s_]+/g, "-");
  return ALPHA_LUXE_IDS.has(q) || mentionsAlphaLuxe(q);
};

const mentionsLuxeTower = (value: string) => {
  const q = normalizeVertical(value);
  return q.includes("luxe") && q.includes("tower");
};

export const isLuxeTowerProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = normalizeVertical(String(p.id));
  if (sId === "luxe-tower" || sId === "luxetower") return true;
  const type = p.type || (p as any).tipo_inmueble;
  if (!isProjectType(type)) return false;
  const sTitle = normalizeVertical(String(p.title || (p as any).titulo || ""));
  const sCmp = normalizeVertical(String(p.complejoNombre || (p as any).complejo_nombre || ""));
  return mentionsLuxeTower(sTitle) || mentionsLuxeTower(sCmp);
};

export const isLuxeTowerSlug = (value: string): boolean => {
  const q = normalizeVertical(value.trim()).replace(/[\s_]+/g, "-");
  return q === "luxe-tower" || q === "luxetower" || mentionsLuxeTower(q);
};

export const isDomusProperty = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  const sId = String(p.id).toLowerCase();
  if (sId.startsWith("domus-") || sId === "domus") return true;
  const sTitle = String(p.title || (p as any).titulo || "").trim().toLowerCase();
  const sCmp = String(p.complejoNombre || (p as any).complejo_nombre || "").trim().toLowerCase();
  const officialDomusNames = [
    "domus black",
    "domus gold",
    "domus onix",
    "domus insignia",
    "domus luxury",
    "domus tower",
    "domus infinity",
  ];
  return officialDomusNames.some(
    (name) => sTitle.startsWith(name) || sCmp === name || sCmp.startsWith(name)
  );
};

export const isTargetOna = (p: Property, query: string): boolean => {
  if (!query) return false;
  const q = query.trim().toLowerCase();
  if (q === "ona" || q === "5") {
    return isOnaProperty(p);
  }
  if (q === "eurodesign" || q === "tower-eurodesign" || q === "tower_eurodesign" || q === "1816") {
    return isEurodesignProperty(p);
  }
  if (q === "garden-zen" || q.includes("garden zen") || q === "zen" || q === "garden") {
    return isGardenZenProperty(p);
  }
  if (q === "bless-tower" || q === "blesstower" || q.includes("bless tower")) {
    return isBlessTowerProperty(p);
  }
  if (q === "bless-drei" || q === "blessdrei" || q.includes("bless drei")) {
    return isBlessDreiProperty(p);
  }
  if (isTriventoSlug(q)) {
    return isTriventoProperty(p);
  }
  if (isBetonBrutSlug(q)) {
    return isBetonBrutProperty(p);
  }
  if (isVerticalGuemesSlug(q)) {
    return isVerticalGuemesProperty(p);
  }
  if (isSkyLevelSlug(q)) {
    return isSkyLevelProperty(p);
  }
  if (isSkyEquinoxSlug(q)) {
    return isSkyEquinoxProperty(p);
  }
  if (isGiardinoSlug(q)) {
    return isGiardinoProperty(p);
  }
  if (isMareSlug(q)) {
    return isMareProperty(p);
  }
  if (isAlphaLuxeSlug(q)) {
    return isAlphaLuxeProperty(p);
  }
  if (isLuxeTowerSlug(q)) {
    return isLuxeTowerProperty(p);
  }
  if (
    q.includes("domus") ||
    q.startsWith("domus-") ||
    ["black", "gold", "onix", "ónix", "insignia", "luxury", "tower", "infinity"].includes(q)
  ) {
    if (isDomusProperty(p)) {
      if (q === "domus") return true;
      const sId = String(p.id).toLowerCase();
      const sTitle = String(p.title || "").toLowerCase();
      const cleanQ = q.replace(/^domus[-_\s]*/, "");
      return sId.includes(cleanQ) || sTitle.includes(cleanQ);
    }
  }
  return String(p.id).toLowerCase() === q || Boolean(p.title && p.title.toLowerCase().includes(q));
};

export const isTargetProject = isTargetOna;

export const isProjectOrPreventa = (p: Property | null | undefined): boolean => {
  if (!p) return false;
  return (
    isOnaProperty(p) ||
    isEurodesignProperty(p) ||
    isDomusProperty(p) ||
    isGardenZenProperty(p) ||
    isBlessTowerProperty(p) ||
    isBlessDreiProperty(p) ||
    isTriventoProperty(p) ||
    isBetonBrutProperty(p) ||
    isVerticalGuemesProperty(p) ||
    isSkyLevelProperty(p) ||
    isSkyEquinoxProperty(p) ||
    isGiardinoProperty(p) ||
    isMareProperty(p) ||
    isAlphaLuxeProperty(p) ||
    isLuxeTowerProperty(p)
  );
};
