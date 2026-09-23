export interface CountdownResult {
  label: string;
  shortLabel: string;
  targetFormatted: string;
  isImmediate: boolean;
  monthsLeft: number;
}

const MONTH_NAMES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const MONTH_MAP: Record<string, number> = {
  ene: 0,
  enero: 0,
  feb: 1,
  febrero: 1,
  mar: 2,
  marzo: 2,
  abr: 3,
  abril: 3,
  may: 4,
  mayo: 4,
  jun: 5,
  junio: 5,
  jul: 6,
  julio: 6,
  ago: 7,
  agosto: 7,
  sep: 8,
  sept: 8,
  septiembre: 8,
  set: 8,
  setiembre: 8,
  oct: 9,
  octubre: 9,
  nov: 10,
  noviembre: 10,
  dic: 11,
  diciembre: 11,
};

export const parseDeliveryDate = (value?: string | null): { year: number; month: number } | null => {
  if (!value) return null;
  const raw = value.trim().toLowerCase();
  if (!raw) return null;

  // Formato ISO: YYYY-MM o YYYY-MM-DD
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    if (year >= 2000 && year <= 2100 && month >= 0 && month <= 11) {
      return { year, month };
    }
  }

  // Formato texto: "Diciembre 2026", "dic 2026", "diciembre de 2026"
  const textMatch = raw.match(/([a-záéíóú]+)(?:\s+(?:de\s+)?(\d{4}))?/i);
  if (textMatch) {
    const monthToken = textMatch[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const month = MONTH_MAP[monthToken];
    if (month !== undefined) {
      const year = textMatch[2] ? Number(textMatch[2]) : new Date().getFullYear();
      if (year >= 2000 && year <= 2100) {
        return { year, month };
      }
    }
  }

  // Solo año: "2027" -> Diciembre de ese año
  const yearOnly = raw.match(/^(\d{4})$/);
  if (yearOnly) {
    const year = Number(yearOnly[1]);
    if (year >= 2000 && year <= 2100) {
      return { year, month: 11 };
    }
  }

  return null;
};

export const calculateDeliveryCountdown = (
  value?: string | null,
  referenceDate: Date = new Date(),
): CountdownResult | null => {
  const parsed = parseDeliveryDate(value);
  if (!parsed) return null;

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();

  const diffMonths = (parsed.year - refYear) * 12 + (parsed.month - refMonth);
  const targetFormatted = `${MONTH_NAMES_ES[parsed.month]} ${parsed.year}`;

  if (diffMonths <= 0) {
    return {
      label: `Entrega inmediata (${targetFormatted})`,
      shortLabel: "Entrega inmediata",
      targetFormatted,
      isImmediate: true,
      monthsLeft: 0,
    };
  }

  if (diffMonths === 1) {
    return {
      label: `Entrega en 1 mes (${targetFormatted})`,
      shortLabel: "En 1 mes",
      targetFormatted,
      isImmediate: false,
      monthsLeft: 1,
    };
  }

  return {
    label: `Entrega en ${diffMonths} meses (${targetFormatted})`,
    shortLabel: `En ${diffMonths} meses`,
    targetFormatted,
    isImmediate: false,
    monthsLeft: diffMonths,
  };
};

export const formatConstructionProgress = (
  avance?: number | null,
  fase?: string | null,
): string => {
  const hasAvance = avance !== undefined && avance !== null && !Number.isNaN(avance);
  const cleanFase = (fase || "").trim();

  if (hasAvance && cleanFase) {
    return `${avance}% · ${cleanFase}`;
  }
  if (hasAvance) {
    return `${avance}% de avance`;
  }
  if (cleanFase) {
    return cleanFase;
  }
  return "";
};
