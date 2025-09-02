// src/utils/date-helpers.js
const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Convierte múltiples formatos de entrada a "dd-mm-yyyy".
 * Acepta: "yyyy-mm-dd", "yyyy/mm/dd", "dd-mm-yyyy", "dd/mm/yyyy", Date, timestamp.
 * Devuelve: "dd-mm-yyyy" o null si inválido.
 */
export function toDMY(input) {
  if (input == null || input === "") return null;

  // Date object o timestamp
  if (input instanceof Date || typeof input === "number") {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  const s = String(input).trim();

  // Si ya viene dd-mm-yyyy o dd/mm/yyyy -> normalizo a yyyy-mm-dd
  let m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) {
    const dd = pad2(Number(m[1]));
    const MM = pad2(Number(m[2]));
    const yyyy = m[3];
    // Validación básica de rangos
    const d = new Date(`${yyyy}-${MM}-${dd}`);
    if (Number.isNaN(d.getTime())) return null;
    return `${yyyy}-${MM}-${dd}`;
  }

  // yyyy-mm-dd o yyyy/mm/dd -> ya está bien
  m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const yyyy = m[1];
    const MM = pad2(Number(m[2]));
    const dd = pad2(Number(m[3]));
    const d = new Date(`${yyyy}-${MM}-${dd}`);
    if (Number.isNaN(d.getTime())) return null;
    return `${yyyy}-${MM}-${dd}`;
  }

  // Último recurso: intentar new Date(string)
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Convierte ""/undefined a null (útil para payload limpio) */
export const nullIfEmpty = (v) => (v === "" || v === undefined ? null : v);

/** Limpia objetos/arrays dejando null si quedan vacíos */
export function cleanEmpty(obj) {
  if (Array.isArray(obj)) {
    const a = obj
      .map(cleanEmpty)
      .filter((v) => v != null && (typeof v !== "object" || Object.keys(v).length));
    return a.length ? a : null;
  }
  if (obj && typeof obj === "object") {
    const o = {};
    for (const [k, v] of Object.entries(obj)) {
      const n = cleanEmpty(v);
      if (n != null && (typeof n !== "object" || Object.keys(n).length)) o[k] = n;
    }
    return Object.keys(o).length ? o : null;
  }
  return vIsEmpty(obj) ? null : obj;
}

function vIsEmpty(v) {
  return v === "" || v === undefined;
}
