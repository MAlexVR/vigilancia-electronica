/**
 * Adaptador de dominio Electrónica para el motor de trayectoria.
 *
 * Este archivo ES el límite de dominio: puede importar @/lib/radar-data.
 * El motor (src/lib/trajectory/ y src/components/trajectory/) NO importa
 * este archivo — la dependencia es unidireccional:
 *   dominio → adaptador → motor
 *
 * Fuente de datos:
 *   - radar-data.ts: TECHNOLOGIES, SECTORS (D1–D5)
 *
 * REGLA ANTI-FABRICACIÓN: solo se transcriben datos presentes en
 * TECHNOLOGIES. No existe (todavía) un informe GOR del área de Electrónica
 * del que transcribir las capas L2 (Infraestructura), L3 (Talento & I+D+i)
 * y L4 (Alianzas) — ver el bloque PENDING más abajo.
 */

import { TECHNOLOGIES, SECTORS } from "@/lib/radar-data";
import { normalizeHorizon } from "@/lib/trajectory";
import type {
  TrajectoryConfig,
  TrajectoryDataset,
  TrajectoryItem,
} from "@/lib/trajectory";

// ── Paleta SENA / semántica de brecha ────────────────────────────────────────
// Reservada para cuando existan ítems L2–L4 con brecha (gap) asignada; L1 no
// asigna gap en esta entrega (ver bloque PENDING).

const GAP_COLORS: Record<string, string> = {
  "Crítica": "bg-red-700 text-white",
  "Alta": "bg-amber-500 text-white",
  "Moderada": "bg-green-300 text-green-900",
};

const DRIVER_COLORS: Record<string, string> = {
  D1: "bg-blue-100 text-blue-900",
  D2: "bg-red-100 text-red-900",
  D3: "bg-orange-100 text-orange-900",
  D4: "bg-purple-100 text-purple-900",
  D5: "bg-teal-100 text-teal-900",
};

const NEUTRAL_COLOR = "bg-gray-100 text-gray-800";

// ── electronicaConfig: TrajectoryConfig ──────────────────────────────────────

/**
 * Configuración del mapa de trayectoria para el dominio Electrónica CEET.
 * Los strings son en español; el motor es agnóstico.
 */
export const electronicaConfig: TrajectoryConfig = {
  // ── Drivers: derivados de SECTORS (D1..D5) con color institucional ───────
  drivers: SECTORS.map((s) => ({
    key: s.id,
    label: s.label,
    icon: s.icon,
    color: s.color,
  })),

  // ── Layers: 4 swimlanes fijadas por la spec, mismas que telecom ──────────
  layers: [
    { key: "L1", label: "Tecnologías", order: 1, color: "#1565C0" }, // azul SENA
    { key: "L2", label: "Infraestructura", order: 2, color: "#2E7D32" }, // verde SENA
    { key: "L3", label: "Talento & I+D+i", order: 3, color: "#6A1B9A" }, // púrpura
    { key: "L4", label: "Alianzas", order: 4, color: "#00838F" }, // cian/teal
  ],

  // ── Horizon buckets: 5 columnas de tiempo, gradiente teal → púrpura ──────
  horizonBuckets: [
    { key: "ahora", label: "Ya / Ahora", order: 1, color: "#14B8A6" }, // teal
    { key: "corto", label: "0–12 meses", order: 2, color: "#3B82F6" }, // azul
    { key: "medio1", label: "1–3 años", order: 3, color: "#6366F1" }, // índigo
    { key: "medio2", label: "3–5 años", order: 4, color: "#8B5CF6" }, // violeta
    { key: "largo", label: "5–10 años", order: 5, color: "#A855F7" }, // púrpura
  ],

  // ── colorFor: por gap (semántica de brecha); L1 por driver si no hay gap ─
  colorFor: (item) => {
    if (item.gap && GAP_COLORS[item.gap]) return GAP_COLORS[item.gap];
    if (item.layer === "L1") {
      return DRIVER_COLORS[item.driver] ?? NEUTRAL_COLOR;
    }
    return NEUTRAL_COLOR;
  },

  // ── labelFor: devuelve item.title ─────────────────────────────────────────
  labelFor: (item) => item.title,

  // ── metricBadge: solo para L1 (TRL) ──────────────────────────────────────
  metricBadge: (item) => {
    if (item.metric && item.layer === "L1") {
      return `TRL ${item.metric.value}`;
    }
    return null;
  },
};

/**
 * PENDING: capas L2 (Infraestructura), L3 (Talento & I+D+i) y L4 (Alianzas)
 * no tienen contenido porque el informe GOR del área de Electrónica
 * (Vigilancia_Cientifico-Tecnologica_Electronica_2026.pptx) todavía no ha sido
 * entregado. El motor de trayectoria muestra su estado vacío nativo para esas
 * capas; no se debe fabricar contenido.
 *
 * Cuando el informe esté disponible: agregar los ítems L2/L3/L4 en
 * buildElectronicaTrajectory() siguiendo la convención de procedencia de
 * trajectory-data.telecom.ts — comentario "// JUICIO:" para cada juicio de
 * mapeo y "Fundamento:" para la evidencia, con source apuntando a la tabla GOR
 * correspondiente. Definir entonces la constante FUENTE_GOR y las brechas
 * (gap) de L1 a partir de la tabla de brechas.
 */

/**
 * Construye el TrajectoryDataset para el mapa de trayectoria de Electrónica.
 *
 * Capa L1 — Tecnologías: derivada de TODOS los ítems de TECHNOLOGIES.
 * Capas L2/L3/L4 — Infraestructura, Talento & I+D+i, Alianzas: sin ítems
 * (ver bloque PENDING arriba); el motor renderiza su estado vacío nativo.
 */
export function buildElectronicaTrajectory(): TrajectoryDataset {
  const items: TrajectoryItem[] = [];

  // ── L1: Tecnologías (todos los direccionadores) ───────────────────────────
  // Fuente: TECHNOLOGIES de radar-data.ts. El horizonte se normaliza con el
  // helper del motor (normalizeHorizon). Sin asignación de gap (ver PENDING).
  for (const tech of TECHNOLOGIES) {
    items.push({
      id: `tech-${tech.code}`,
      layer: "L1",
      driver: `D${tech.sector + 1}`,
      horizon: normalizeHorizon(tech.horizon),
      title: tech.name,
      detail: tech.desc,
      metric: { label: "TRL", value: tech.trl },
      relatedIds: [],
      source: "Radar tecnológico — Electrónica CEET",
      meta: { Código: tech.code, Tipo: "tecnologia" },
    });
  }

  // L2–L4: sin ítems (ver PENDING arriba).

  return { items };
}
