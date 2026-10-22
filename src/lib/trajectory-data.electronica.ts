/**
 * Adaptador de dominio Electrónica para el motor de trayectoria.
 *
 * Este archivo ES el límite de dominio: puede importar @/lib/radar-data.
 * El motor (src/lib/trajectory/ y src/components/trajectory/) NO importa
 * este archivo — la dependencia es unidireccional:
 *   dominio → adaptador → motor
 *
 * Fuentes de datos:
 *   - radar-data.ts: TECHNOLOGIES, SECTORS (D1–D5) → capa L1.
 *   - Informe GOR-F-012 Electrónica (V5.1): Tabla 9 (programas y acciones
 *     curriculares), Tabla 10 (aliados), Tabla 11 (proyectos por
 *     direccionador) y numeral 6.5 (contexto colombiano) → capas L2–L4.
 *
 * REGLA ANTI-FABRICACIÓN: solo se transcriben textos presentes en esas tablas
 * del informe o en radar-data. Los juicios de mapeo se marcan "// JUICIO:" y
 * la evidencia con "Fundamento:", igual que en el mapa de Telecomunicaciones.
 *
 * CRITERIO DE HORIZONTE: el informe no trae prioridades ni plazos por ítem.
 * Cada ítem L2–L4 hereda el horizonte de la línea tecnológica a la que se
 * vincula; solo se adelanta cuando el propio informe da una fecha explícita.
 *
 * CRITERIO DE BRECHA: la brecha de cada línea es la que su narrativa declara
 * ("IMPLICACIÓN CEET: Brecha ..."); los ítems L2/L3 heredan la de su línea y
 * solo se marcan Crítica y Alta (las que distingue la leyenda del mapa).
 * La calificación de brecha por programa (numeral 6.1) sigue a cargo del
 * vigía y no se transcribe aquí.
 */

import { TECHNOLOGIES, SECTORS, techShortLabel } from "@/lib/radar-data";
import { normalizeHorizon } from "@/lib/trajectory";
import type {
  HorizonBucket,
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
  // Etiqueta corta curada (sin el prefijo "Dn:", que el tab ya muestra), igual
  // que el mapa de Telecomunicaciones; el nombre completo vive en el radar.
  drivers: SECTORS.map((s) => ({
    key: s.id,
    label: (s.labelLines?.join(" ") ?? s.label).replace(/^D\d:\s*/, ""),
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

// ── Fuente documental ────────────────────────────────────────────────────────

const FUENTE_GOR =
  "Informe GOR-F-012 — Vigilancia científico-tecnológica del área de Electrónica del CEET 2026-2036 (V5.1)";

// ── Brecha heredada de la narrativa de cada línea ────────────────────────────

/**
 * Extrae la brecha que la narrativa de la línea declara en su bloque
 * "IMPLICACIÓN CEET: Brecha ..." y la traduce a la semántica del mapa.
 * Solo se marcan las severidades que la leyenda del mapa distingue (Crítica y
 * Alta, igual que en Telecomunicaciones): MODERADA-ALTA se marca como Alta y
 * MODERADA, BAJA y BAJA-MODERADA no se marcan.
 */
function gapFromTendencias(tendencias: string | undefined): string | undefined {
  const m = tendencias?.match(/Brecha\s+([A-ZÁÉÍÓÚ]+(?:-[A-ZÁÉÍÓÚ]+)?)/);
  switch (m?.[1]) {
    case "CRÍTICA":
      return "Crítica";
    case "ALTA":
    case "MODERADA-ALTA":
      return "Alta";
    default:
      return undefined;
  }
}

function findTech(code: string) {
  const tech = TECHNOLOGIES.find((t) => t.code === code);
  if (!tech) throw new Error(`Línea tecnológica desconocida: ${code}`);
  return tech;
}

// ── Ítems L2–L4 transcritos del informe ──────────────────────────────────────

type SupportLayer = "L2" | "L3" | "L4";

interface SupportSpec {
  id: string;
  layer: SupportLayer;
  driver: string;
  /** Línea tecnológica (código del radar) de la que hereda horizonte y brecha. */
  link: string;
  /** Horizonte explícito del informe; si falta, se hereda de la línea. */
  horizon?: HorizonBucket;
  /** Evidencia del informe que justifica el horizonte explícito. */
  horizonFundamento?: string;
  title: string;
  detail: string;
  /** Tabla o numeral del informe de donde se transcribe. */
  fuente: string;
  /** Las alianzas no llevan brecha; L2/L3 heredan la de su línea. */
  inheritGap: boolean;
  meta?: Record<string, unknown>;
}

// Textos de aliados que la Tabla 10 asigna a más de un direccionador: se
// transcriben una sola vez para que no diverjan entre copias.
const MINCIENCIAS_DETAIL =
  "Cofinanciamiento de proyectos de I+D+i aplicables a las líneas de microelectrónica y potencia (D1/D2). Alianza sugerida: cofinanciación de proyectos SENNOVA / semilleros de investigación.";
const C4IR_DETAIL =
  "Nodo colombiano de referencia en IA, IoT y manufactura avanzada aplicable a D1/D3. Alianza sugerida: co-diseño de proyectos piloto de IIoT/Edge AI.";
const MINAMBIENTE_DETAIL =
  "Autoridad nacional del Protocolo de Montreal/Enmienda de Kigali; regula la transición de refrigerantes (D2/D5). Alianza sugerida: proyectos de transición de refrigerantes naturales / cumplimiento normativo.";

const SUPPORT_ITEMS: SupportSpec[] = [
  // ═══ L2 — Infraestructura ═════════════════════════════════════════════════

  // Tabla 11, fila D1 (Modernización de Ambientes); Tabla 9, nota de equipos
  // pendientes ("kits de desarrollo RISC-V para D1").
  {
    id: "d1-l2-ambiente-riscv",
    layer: "L2",
    driver: "D1",
    link: "L01",
    title: "Ambiente de diseño electrónico y prototipado con arquitecturas abiertas (RISC-V)",
    detail:
      "Actualizar el laboratorio de diseño electrónico (EDA/CAD, PCB) con kits de desarrollo de arquitecturas abiertas para introducir a los aprendices en el ecosistema de semiconductores post-propietarios.",
    fuente: "Tabla 11 (D1) y Tabla 9 (equipos de ambientes)",
    inheritGap: true,
    meta: { Tipo: "ambiente", "Tipo de proyecto": "Modernización de Ambientes" },
  },
  // Tabla 11, fila D2 (Modernización de Ambientes / I+D+i Aplicada).
  // JUICIO: el informe tipifica el piloto como L2 y L3 a la vez; se registra
  //   una sola vez, en L2 (ambiente de formación), para no duplicarlo.
  {
    id: "d2-l2-piloto-refrigerantes",
    layer: "L2",
    driver: "D2",
    link: "L10",
    title: "Piloto de transición a refrigerantes naturales y climatización inverter",
    detail:
      "Actualizar el entrenador didáctico de refrigeración del programa de Aire Acondicionado y Refrigeración hacia equipos inverter (VRV/VRF) y refrigerantes naturales de baja huella (R290, R744, R717), en línea con el calendario del Protocolo de Montreal/Kigali.",
    fuente: "Tabla 11 (D2) y Tabla 9 (programa 837501)",
    inheritGap: true,
    meta: { Tipo: "ambiente", "Tipo de proyecto": "Modernización de Ambientes / I+D+i Aplicada", Programa: "Técnico en Mantenimiento de Equipos de Aire Acondicionado y Refrigeración (837501)" },
  },
  // Numeral 6.5 (D2): capacidad instalada propia del CEET.
  // Fundamento: el informe la describe como capacidad que el CEET "ya" opera,
  //   por eso es el único ítem L2 en horizonte "ahora".
  {
    id: "d2-l2-centros-refrigerantes",
    layer: "L2",
    driver: "D2",
    link: "L10",
    horizon: "ahora",
    horizonFundamento: "Numeral 6.5 (D2): el CEET ya opera ambos centros (capacidad instalada)",
    title: "Centro de Regeneración de Gases Refrigerantes y Centro de Entrenamiento en Gases Naturales",
    detail:
      "Capacidad instalada propia del CEET: el Centro de Regeneración de Gases Refrigerantes, orientado a la recuperación y regeneración de refrigerantes y a la aplicación práctica de los protocolos de manejo (Montreal/Kigali), y el Centro de Entrenamiento en Gases Naturales (amoníaco y CO2), orientado a fortalecer la oferta educativa de los técnicos de refrigeración.",
    fuente: "Numeral 6.5 (D2)",
    inheritGap: false,
    meta: { Tipo: "ambiente", Estado: "Capacidad instalada" },
  },
  // Tabla 11, fila D5 (Modernización de Ambientes).
  {
    id: "d5-l2-ambiente-hogar-inteligente",
    layer: "L2",
    driver: "D5",
    link: "L21",
    title: "Ambiente de hogar inteligente e IoT de consumo con ciberseguridad por diseño",
    detail:
      "Implementar un ambiente de práctica con dispositivos de hogar inteligente (electrodomésticos conectados, protocolos de interoperabilidad tipo Thread) e incorporar principios de ciberseguridad por diseño y actualización OTA.",
    fuente: "Tabla 11 (D5) y Tabla 9 (equipos de ambientes)",
    inheritGap: true,
    meta: { Tipo: "ambiente", "Tipo de proyecto": "Modernización de Ambientes" },
  },

  // ═══ L3 — Talento & I+D+i ═════════════════════════════════════════════════

  // Tabla 9, programa 224201: acción curricular sugerida.
  {
    id: "d1-l3-actualizacion-224201",
    layer: "L3",
    driver: "D1",
    link: "L01",
    title: "Actualización curricular: Tecnólogo en Desarrollo de Sistemas Electrónicos Industriales",
    detail:
      "Se sugiere reforzar semiconductores abiertos y Edge AI (L01, L03) en la actualización del programa.",
    fuente: "Tabla 9 (programa 224201)",
    inheritGap: true,
    meta: { Tipo: "formación", Programa: "Tecnólogo en Desarrollo de Sistemas Electrónicos Industriales (224201)" },
  },
  // Tabla 9, programa 839317: acción curricular sugerida.
  {
    id: "d1-l3-actualizacion-839317",
    layer: "L3",
    driver: "D1",
    link: "L01",
    title: "Actualización curricular: Técnico en Mantenimiento y Ensamble de Equipos Electrónicos",
    detail:
      "Se sugiere incorporar fundamentos de semiconductores abiertos (L01) en la actualización del programa. Aplicación normas IPC.",
    fuente: "Tabla 9 (programa 839317)",
    inheritGap: true,
    meta: { Tipo: "formación", Programa: "Técnico en Mantenimiento y Ensamble de Equipos Electrónicos (839317)" },
  },
  // Tabla 11, fila D3 (I+D+i Aplicada SENNOVA).
  {
    id: "d3-l3-lab-mantenimiento-predictivo",
    layer: "L3",
    driver: "D3",
    link: "L12",
    title: "Laboratorio de mantenimiento predictivo con IA/ML sobre plataformas IIoT",
    detail:
      "Diseñar un ambiente de aprendizaje donde los aprendices entrenen modelos de mantenimiento predictivo (ML) y modernicen prácticas de SCADA sobre datasets reales de planta.",
    fuente: "Tabla 11 (D3)",
    inheritGap: true,
    meta: { Tipo: "proyecto", "Tipo de proyecto": "I+D+i Aplicada (SENNOVA)", Aliado: "Rockwell Automation / C4IR Medellín" },
  },
  // Numeral 6.5 (D3): Talento ColombIA.
  // Fundamento: el informe fecha el anuncio (13 de octubre de 2026) y lo
  //   califica de "vía de articulación institucional inmediata".
  {
    id: "d3-l3-talento-colombia",
    layer: "L3",
    driver: "D3",
    link: "L12",
    horizon: "ahora",
    horizonFundamento: "Numeral 6.5 (D3): anuncio del 13 de octubre de 2026, «vía de articulación institucional inmediata»",
    title: "Talento ColombIA: becas de IA de Google y Career Launchpad (SENA)",
    detail:
      "15.000 becas para el Certificado Profesional de Inteligencia Artificial de Google y acceso a Google Career Launchpad (formación en IA y computación en la nube), gestionado por el SENA. Permite canalizar estudiantes hacia estas rutas de certificación gratuitas mientras se desarrolla la oferta formativa propia en IA/ML de los programas D1/D3.",
    fuente: "Numeral 6.5 (D3)",
    inheritGap: false,
    meta: { Tipo: "formación" },
  },
  // Tabla 9, programa 224206: acción curricular sugerida.
  // JUICIO: la tabla remite a "L16-L17"; el monitoreo wearable de salud es L16,
  //   que es la línea de la que se hereda el horizonte.
  {
    id: "d4-l3-actualizacion-224206",
    layer: "L3",
    driver: "D4",
    link: "L16",
    title: "Actualización curricular: Tecnólogo en Mantenimiento de Equipo Biomédico",
    detail:
      "Se sugiere incorporar monitoreo wearable de salud y mantenimiento predictivo con IA (L16-L17) en el desarrollo curricular del programa.",
    fuente: "Tabla 9 (programa 224206)",
    inheritGap: true,
    meta: { Tipo: "formación", Programa: "Tecnólogo en Mantenimiento de Equipo Biomédico (224206)" },
  },
  // Tabla 11, fila D4 (I+D+i Aplicada, semillero / SENNOVA).
  {
    id: "d4-l3-semillero-biomedica",
    layer: "L3",
    driver: "D4",
    link: "L16",
    title: "Semillero de electrónica biomédica y monitoreo wearable de salud",
    detail:
      "Desarrollar prototipos de monitoreo wearable de salud (signos vitales) articulados con el programa de Mantenimiento de Equipo Biomédico, incorporando el marco de tecnovigilancia colombiano (Res. 4816/2008, Decreto 4725/2005).",
    fuente: "Tabla 11 (D4)",
    inheritGap: true,
    meta: { Tipo: "proyecto", "Tipo de proyecto": "I+D+i Aplicada (Semillero / SENNOVA)", Aliado: "Instituciones de salud regionales / fabricantes de dispositivos biomédicos" },
  },

  // ═══ L4 — Alianzas ════════════════════════════════════════════════════════
  // Tabla 10. El informe las propone y no documenta convenios vigentes; las
  // alianzas no llevan brecha. JUICIO: cuando la tabla asigna una entidad a
  // dos direccionadores (p. ej. D1/D3), se registra en cada uno y se vincula
  // a la línea de ese direccionador que su texto menciona.
  {
    id: "d1-l4-riscv-international",
    layer: "L4",
    driver: "D1",
    link: "L01",
    title: "RISC-V International",
    detail:
      "Arquitecturas abiertas de semiconductores (D1); 129 millones de chips RISC-V proyectados en IA de borde para 2030. Alianza sugerida: membresía académica / acceso a especificaciones y currícula abierta.",
    fuente: "Tabla 10",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Consorcio", "País / Origen": "Global" },
  },
  {
    id: "d1-l4-minciencias",
    layer: "L4",
    driver: "D1",
    link: "L01",
    title: "Minciencias / CIDEI",
    detail: MINCIENCIAS_DETAIL,
    fuente: "Tabla 10",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Gobierno / cofinanciador", "País / Origen": "Colombia" },
  },
  {
    id: "d1-l4-c4ir",
    layer: "L4",
    driver: "D1",
    link: "L03",
    title: "Centro de la Cuarta Revolución Industrial (C4IR) Medellín",
    detail: C4IR_DETAIL,
    fuente: "Tabla 10",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Centro de innovación", "País / Origen": "Colombia" },
  },
  {
    id: "d2-l4-minciencias",
    layer: "L4",
    driver: "D2",
    link: "L08",
    title: "Minciencias / CIDEI",
    detail: MINCIENCIAS_DETAIL,
    fuente: "Tabla 10",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Gobierno / cofinanciador", "País / Origen": "Colombia" },
  },
  {
    id: "d2-l4-ashrae-iec",
    layer: "L4",
    driver: "D2",
    link: "L10",
    title: "ASHRAE / IEC",
    detail:
      "Normas técnicas citadas en los programas de climatización (D2) para instalación y eficiencia energética de sistemas HVACR. Alianza sugerida: actualización normativa curricular / certificación técnica.",
    fuente: "Tabla 10",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Organismo normativo", "País / Origen": "Global" },
  },
  {
    id: "d2-l4-minambiente",
    layer: "L4",
    driver: "D2",
    link: "L10",
    title: "Ministerio de Ambiente y Desarrollo Sostenible (MinAmbiente)",
    detail: MINAMBIENTE_DETAIL,
    fuente: "Tabla 10 y Tabla 11 (D2)",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Gobierno", "País / Origen": "Colombia" },
  },
  {
    id: "d2-l4-fabricantes-piloto",
    layer: "L4",
    driver: "D2",
    link: "L10",
    title: "Daikin / Midea (aliados potenciales del piloto de refrigerantes naturales e inverter)",
    detail:
      "Aliados potenciales del proyecto «Piloto de transición a refrigerantes naturales y climatización inverter». Alianza sugerida: donación de equipos / entrenadores didácticos / certificación técnica de servicio.",
    fuente: "Tabla 11 (D2) y Tabla 10",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Fabricantes" },
  },
  // Tabla 10: ICONTEC referido en programas de climatización → D2 (JUICIO).
  {
    id: "d2-l4-icontec",
    layer: "L4",
    driver: "D2",
    link: "L10",
    title: "ICONTEC",
    detail:
      "Normalización técnica nacional referida en varios programas de formación del área (p. ej. instalación de sistemas de climatización). Alianza sugerida: actualización de normas técnicas colombianas aplicables al currículo — pendiente de confirmación de convenio vigente.",
    fuente: "Tabla 10",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Organismo de normalización", "País / Origen": "Colombia", Estado: "Pendiente de confirmación de convenio vigente" },
  },
  {
    id: "d3-l4-rockwell",
    layer: "L4",
    driver: "D3",
    link: "L11",
    title: "Rockwell Automation",
    detail:
      "Referente en encuesta de adopción de IA/ML industrial citada en D3 (95% de fabricantes invirtiendo en IA/ML). Alianza sugerida: certificaciones / co-creación de contenidos IIoT-IA.",
    fuente: "Tabla 10 y Tabla 11 (D3)",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Empresa", "País / Origen": "EE. UU." },
  },
  {
    id: "d3-l4-c4ir",
    layer: "L4",
    driver: "D3",
    link: "L11",
    title: "Centro de la Cuarta Revolución Industrial (C4IR) Medellín",
    detail: C4IR_DETAIL,
    fuente: "Tabla 10 y Tabla 11 (D3)",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Centro de innovación", "País / Origen": "Colombia" },
  },
  // Tabla 11, fila D4: único aliado del direccionador (la Tabla 10 no trae uno).
  {
    id: "d4-l4-salud-biomedicos",
    layer: "L4",
    driver: "D4",
    link: "L16",
    title: "Instituciones de salud regionales / fabricantes de dispositivos biomédicos",
    detail:
      "Aliados potenciales del semillero de electrónica biomédica y monitoreo wearable de salud (Tabla 11, D4).",
    fuente: "Tabla 11 (D4)",
    inheritGap: false,
    meta: { Tipo: "alianza" },
  },
  {
    id: "d5-l4-fabricantes",
    layer: "L4",
    driver: "D5",
    link: "L21",
    title: "Fabricantes de climatización inverter y electrodomésticos conectados",
    detail:
      "Daikin, Midea, Gree, Haier, Mitsubishi Electric, LG, Samsung, Whirlpool y Bosch: líderes del mercado de climatización inverter y electrodomésticos conectados citados en D5. Alianza sugerida: donación de equipos / entrenadores didácticos / certificación técnica de servicio.",
    fuente: "Tabla 10 y Tabla 11 (D5)",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Fabricantes", "País / Origen": "Japón / China / Corea del Sur / EE. UU. / Alemania" },
  },
  {
    id: "d5-l4-minambiente",
    layer: "L4",
    driver: "D5",
    link: "L21",
    title: "Ministerio de Ambiente y Desarrollo Sostenible (MinAmbiente)",
    detail: MINAMBIENTE_DETAIL,
    fuente: "Tabla 10",
    inheritGap: false,
    meta: { Tipo: "alianza", "Tipo de aliado": "Gobierno", "País / Origen": "Colombia" },
  },
];

/**
 * Construye el TrajectoryDataset para el mapa de trayectoria de Electrónica.
 *
 * Capa L1 — Tecnologías: derivada de TODOS los ítems de TECHNOLOGIES.
 * Capas L2/L3/L4 — Infraestructura, Talento & I+D+i, Alianzas: ítems
 * transcritos del informe (SUPPORT_ITEMS); el horizonte y la brecha se heredan
 * de la línea tecnológica vinculada. Donde un direccionador no tiene ítems en
 * una capa, el motor renderiza su estado vacío nativo.
 */
export function buildElectronicaTrajectory(): TrajectoryDataset {
  const items: TrajectoryItem[] = [];

  // ── L1: Tecnologías (todos los direccionadores) ───────────────────────────
  // Fuente: TECHNOLOGIES de radar-data.ts. El horizonte se normaliza con el
  // helper del motor (normalizeHorizon). La brecha es la que declara la
  // narrativa de la línea ("IMPLICACIÓN CEET").
  for (const tech of TECHNOLOGIES) {
    items.push({
      id: `tech-${tech.code}`,
      layer: "L1",
      driver: `D${tech.sector + 1}`,
      horizon: normalizeHorizon(tech.horizon),
      // Título corto curado (el mismo del radar); el nombre completo de la
      // línea se conserva en meta para el panel de detalle.
      title: techShortLabel(tech),
      detail: tech.desc,
      metric: { label: "TRL", value: tech.trl },
      gap: gapFromTendencias(tech.tendencias),
      relatedIds: [],
      source: "Radar tecnológico — Electrónica CEET",
      meta: { Código: tech.code, Línea: tech.name, Tipo: "tecnologia" },
    });
  }

  // ── L2–L4: ítems transcritos del informe ─────────────────────────────────
  for (const spec of SUPPORT_ITEMS) {
    const tech = findTech(spec.link);
    const inherited = normalizeHorizon(tech.horizon);
    const horizon = spec.horizon ?? inherited;
    items.push({
      id: spec.id,
      layer: spec.layer,
      driver: spec.driver,
      horizon,
      title: spec.title,
      detail: spec.detail,
      gap: spec.inheritGap ? gapFromTendencias(tech.tendencias) : undefined,
      relatedIds: [`tech-${spec.link}`],
      source: `${FUENTE_GOR}, ${spec.fuente}`,
      meta: {
        ...spec.meta,
        "Línea vinculada": `${spec.link} — ${techShortLabel(tech)}`,
        Fundamento: spec.horizonFundamento
          ? `Horizonte explícito: ${spec.horizonFundamento}`
          : `Horizonte heredado de la línea ${spec.link} (${tech.horizon})`,
      },
    });
  }

  return { items };
}
