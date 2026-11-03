import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBinOrigen(
  binOrigen: string | null | undefined,
  max = 2,
): string {
  const bins = (binOrigen || "")
    .split("|")
    .map((b) => b.trim())
    .filter(Boolean);
  if (bins.length === 0) return "";
  const mostrados = bins.slice(0, max);
  const extras = bins.length - mostrados.length;
  return extras > 0
    ? `${mostrados.join(" | ")} (+${extras} más)`
    : mostrados.join(" | ");
}

type Result<T> = [T, null] | [null, unknown];
export async function catchError<T>(
  promise: Promise<T>,
  loadinState?: () => void,
): Promise<Result<T>> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error];
  } finally {
    if (loadinState) loadinState();
  }
}

export function numeroALetras(num: number): string {
  // ────────────────── 1. Separar entero y centavos ──────────────────
  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100); // 0‒99
  const centavosTexto = `${String(centavos).padStart(2, "0")}/100`;

  // ────────────────── 2. Conversión de la parte entera ──────────────
  const unidades = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
  ];
  const especiales = [
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ];
  const decenas = [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];
  const centenas = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];

  const convertirMenorAMil = (n: number): string => {
    let texto = "";
    const c = Math.floor(n / 100);
    const r = n % 100;

    if (c) texto += centenas[c];

    if (r < 10) {
      texto += (texto && r ? " " : "") + unidades[r];
    } else if (r < 20) {
      texto += (texto ? " " : "") + especiales[r - 10];
    } else {
      const d = Math.floor(r / 10);
      const u = r % 10;
      if (d === 2 && u !== 0) {
        texto += (texto ? " " : "") + "veinti" + unidades[u];
      } else {
        texto += (texto ? " " : "") + decenas[d];
        if (u !== 0) texto += " y " + unidades[u];
      }
    }

    return texto;
  };

  let resultado = "";
  let n = entero;

  const millones = Math.floor(n / 1_000_000);
  if (millones) {
    resultado +=
      millones === 1 ? "un millón" : numeroALetras(millones) + " millones";
    n = n % 1_000_000;
  }

  const miles = Math.floor(n / 1_000);
  if (miles) {
    resultado +=
      (resultado ? " " : "") +
      (miles === 1 ? "mil" : numeroALetras(miles) + " mil");
    n = n % 1_000;
  }

  if (n) {
    resultado += (resultado ? " " : "") + convertirMenorAMil(n);
  } else if (!resultado) {
    resultado = "cero";
  }

  // ────────────────── 3. Añadir SIEMPRE los centavos ────────────────
  resultado += ` con ${centavosTexto}`;

  return resultado.trim();
}
export function aniosALetras(num: number): string {
  // 1. Tomamos solo la parte entera (los años)
  const n_original = Math.floor(num);
  let n = n_original;

  if (n === 0) return "cero";

  // 2. Diccionarios de palabras
  const unidades = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
  ];
  const especiales = [
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ];
  const decenas = [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];
  const centenas = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];

  // 3. Función auxiliar para procesar bloques de tres dígitos
  const convertirMenorAMil = (v: number): string => {
    let texto = "";
    const c = Math.floor(v / 100);
    const r = v % 100;

    if (c === 1 && r === 0) return "cien"; // Caso especial 100 exacto
    if (c) texto += centenas[c];

    if (r < 10) {
      if (r > 0) texto += (texto ? " " : "") + unidades[r];
    } else if (r < 20) {
      texto += (texto ? " " : "") + especiales[r - 10];
    } else {
      const d = Math.floor(r / 10);
      const u = r % 10;
      if (d === 2 && u !== 0) {
        texto += (texto ? " " : "") + "veinti" + unidades[u];
      } else {
        texto += (texto ? " " : "") + decenas[d];
        if (u !== 0) texto += " y " + unidades[u];
      }
    }
    return texto;
  };

  let resultado = "";

  // 4. Procesar Millones
  const millones = Math.floor(n / 1_000_000);
  if (millones) {
    resultado +=
      millones === 1 ? "un millón" : aniosALetras(millones) + " millones";
    n = n % 1_000_000;
  }

  // 5. Procesar Miles
  const miles = Math.floor(n / 1_000);
  if (miles) {
    resultado +=
      (resultado ? " " : "") +
      (miles === 1 ? "mil" : aniosALetras(miles) + " mil");
    n = n % 1_000;
  }

  // 6. Procesar Resto
  if (n > 0) {
    resultado += (resultado ? " " : "") + convertirMenorAMil(n);
  }

  return resultado.trim();
}

export const getNombreEquipo = (): string => {
  try {
    let nombreEquipo = localStorage.getItem("nombreEquipo");
    if (!nombreEquipo) {
      const randomId = crypto.randomUUID();
      nombreEquipo = `PC-${randomId}`;
      localStorage.setItem("nombreEquipo", nombreEquipo);
      return nombreEquipo;
    }
    return nombreEquipo;
  } catch (error) {
    return "PC-UNKNOWN";
  }
};
