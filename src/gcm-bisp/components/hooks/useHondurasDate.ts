import { useCallback, useMemo } from "react";

export const HONDURAS_TIMEZONE = "America/Tegucigalpa";

/**
 * Obtiene la fecha actual en Honduras (UTC-6) en formato 'YYYY-MM-DD'.
 * Garantiza que a partir de las 6:00 PM locales no se salte al día de mañana.
 */
export const getHondurasToday = (): string => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: HONDURAS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

/**
 * Muestra una fecha ISO de la API (ej: "2026-04-10T00:00:00.000Z") como
 * fecha local sin restar días por desfase de zona horaria.
 */
export const formatHondurasDisplay = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString();
  } catch {
    return dateStr;
  }
};

/**
 * Formatea una hora a 12 horas (hh:mm AM/PM).
 * Limpia correctamente strings con fechas ISO (ej: '1970-01-01T10:07:00.000Z')
 * para evitar el error donde parseInt("1970-...") evalúa a 1970 % 12 = 2.
 */
export const formatHondurasTimeDisplay = (timeStr?: string | null): string => {
  if (!timeStr) return "---";
  let clean = timeStr;
  if (clean.includes("T")) {
    clean = clean.split("T")[1];
  }
  clean = clean.split(".")[0];
  const parts = clean.split(":");
  if (parts.length < 2) return clean;
  const hh = parseInt(parts[0], 10);
  const mm = parts[1];
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 || 12;
  return `${h12}:${mm} ${ampm}`;
};

/**
 * Obtiene la hora actual en Honduras (UTC-6) formateada para nombres de archivo seguros:
 * 'HH-mm-ss' (sin dos puntos para evitar errores en Windows).
 */
export const getHondurasTimeForFileName = (): string => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: HONDURAS_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date()).replace(/:/g, "-");
};

/**
 * Obtiene la fecha y hora actual en Honduras (UTC-6) formateada para nombres de archivo seguros:
 * 'YYYY-MM-DD_HH-mm-ss' (sin dos puntos para evitar errores en Windows).
 */
export const getHondurasFileNameTimestamp = (): string => {
  return `${getHondurasToday()}_${getHondurasTimeForFileName()}`;
};

/**
 * Formatea una fecha y hora completa en formato legible de Honduras:
 * 'DD/MM/YYYY hh:mm AM/PM'
 */
export const formatHondurasDateTimeDisplay = (dateTimeStr?: string | null): string => {
  if (!dateTimeStr) return "---";
  const datePart = formatHondurasDisplay(dateTimeStr);
  const timePart = formatHondurasTimeDisplay(dateTimeStr);
  if (!timePart || timePart === "---") return datePart;
  return `${datePart} ${timePart}`;
};

/**
 * Obtiene la fecha y hora actual en Honduras (UTC-6) formateada para reportes y visualización:
 * 'DD/MM/YYYY hh:mm:ss AM/PM' o 'DD/MM/YYYY hh:mm AM/PM'
 */
export const getHondurasFormattedDateTime = (includeSeconds = true): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: HONDURAS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: true,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const date = `${get("day")}/${get("month")}/${get("year")}`;
  const sec = includeSeconds ? `:${get("second")}` : "";
  const time = `${get("hour")}:${get("minute")}${sec} ${get("dayPeriod").toUpperCase()}`;
  return `${date} ${time}`;
};

export const useHondurasDate = () => {
  const timeZone = HONDURAS_TIMEZONE;

  // convertir YYYY-MM-DD a Date sin problemas de timezone
  const parse = useCallback((date: string): Date => {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, []);

  // obtener fecha de hoy en Honduras
  const today = useCallback((): string => {
    return getHondurasToday();
  }, []);

  // formatear Date → YYYY-MM-DD
  const format = useCallback((date: Date): string => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }, []);

  // convertir para Flatpickr
  const toPicker = useCallback((date?: string) => {
    if (!date) return [];
    return [parse(date)];
  }, [parse]);

  /**
   * Muestra una fecha ISO de la API (ej: "2026-04-10T00:00:00.000Z") como
   * fecha local sin desfase de zona horaria. Extrae año/mes/día antes de la
   * T para evitar que la conversión UTC→local cambie el día.
   */
  const formatDisplay = useCallback((dateStr?: string | null): string => {
    if (!dateStr) return "";
    try {
      const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }, []);

  /**
   * Muestra una hora almacenada como ISO en base 1970-01-01 o 1900-01-01
   * (patrón de SQL Server) en formato 12h con AM/PM, sin desfase UTC.
   * Retorna null si el valor es nulo o inválido.
   */
  const formatTime = useCallback((timeStr?: string | null): string | null => {
    if (!timeStr) return null;
    try {
      const clean =
        timeStr.startsWith("1970-01-01") || timeStr.startsWith("1900-01-01")
          ? timeStr.replace("Z", "").replace("+00:00", "")
          : timeStr;
      const d = new Date(clean);
      return d.toLocaleTimeString("es-HN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return null;
    }
  }, []);

  return useMemo(() => ({
    today,
    parse,
    format,
    toPicker,
    formatDisplay,
    formatTime,
    formatTimeDisplay: formatHondurasTimeDisplay,
  }), [today, parse, format, toPicker, formatDisplay, formatTime]);
};