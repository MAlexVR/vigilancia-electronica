import type {
  RadarSchema,
  RadarRing,
  RadarSector,
  RadarItem,
  MaturityScale,
  IngestError,
  IngestWarning,
} from "./types";
import type { ParsedRows } from "./parser";

function parseNumber(val: unknown, fallback = 0): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const parsed = Number(val.replace(/,/g, "."));
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function parseOptionalString(val: unknown): string | undefined {
  if (val === undefined || val === null) return undefined;
  const str = String(val).trim();
  return str.length > 0 ? str : undefined;
}

// D5: sublines arrive either as a string[] (--in-dir narrative merge) or as a
// "|"-delimited string (inline xlsx column authored by the institutional team).
function parseSublines(val: unknown): string[] | undefined {
  if (Array.isArray(val)) {
    const arr = val.map((v) => String(v).trim()).filter((v) => v.length > 0);
    return arr.length > 0 ? arr : undefined;
  }
  if (typeof val === "string" && val.trim().length > 0) {
    const arr = val
      .split("|")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    return arr.length > 0 ? arr : undefined;
  }
  return undefined;
}

// SVG label robustness (Batch 4 / CRITICAL-1 fix): word-wrap into a bounded
// number of narrow lines instead of a single fixed 2-way split, so labels
// stay legible and don't blow up the on-radar bounding box regardless of how
// long the source dataset's item/sector names are (telecom avg 39.8/max 56
// chars vs. electronics avg 77/max 125 chars — a fixed 2-line split leaves
// electronics labels roughly twice as wide as telecom's, which is what
// caused reproducible label-overlap/click-interception in RadarChart).
const MAX_LABEL_LINE_CHARS = 26;
const MAX_LABEL_LINES = 3;

export function generateNameLines(name: string): string[] | undefined {
  if (!name) return undefined;
  if (name.length <= MAX_LABEL_LINE_CHARS) return undefined;

  const words = name.split(/\s+/);
  const allLines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > MAX_LABEL_LINE_CHARS && current) {
      allLines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) allLines.push(current);

  if (allLines.length <= MAX_LABEL_LINES) return allLines;

  // Too many lines even at the narrow width — truncate and ellipsize the
  // last visible line. The full, untruncated name remains available via
  // `tech.name` (TechDetail's full-name display) and the SVG `<title>`
  // tooltip; only the inline chart label is shortened.
  const visible = allLines.slice(0, MAX_LABEL_LINES);
  const lastIdx = visible.length - 1;
  let lastLine = visible[lastIdx];
  if (lastLine.length > MAX_LABEL_LINE_CHARS - 1) {
    lastLine = lastLine.slice(0, MAX_LABEL_LINE_CHARS - 1).trimEnd();
  }
  visible[lastIdx] = `${lastLine}…`;
  return visible;
}

function transformRings(raw: Record<string, unknown>[], errors: IngestError[]): RadarRing[] {
  return raw
    .map((row, idx) => {
      const id = parseOptionalString(row.id);
      if (!id) {
        errors.push({ row: idx + 2, sheet: "rings", message: "Missing id" });
        return null;
      }
      return {
        id,
        label: parseOptionalString(row.label) || id,
        order: parseNumber(row.order, 0),
        innerRadius: parseNumber(row.innerRadius, 0),
        outerRadius: parseNumber(row.outerRadius, 100),
        color: parseOptionalString(row.color) || "#000000",
        fillColor: parseOptionalString(row.fillColor) || "#FFFFFF",
        borderColor: parseOptionalString(row.borderColor) || "#CCCCCC",
        labelColor: parseOptionalString(row.labelColor) || "#000000",
        description: parseOptionalString(row.description),
        recommendedAction: parseOptionalString(row.recommendedAction),
        maturityHint: parseOptionalString(row.maturityHint),
      } satisfies RadarRing;
    })
    .filter((r) => r !== null) as RadarRing[];
}

function transformSectors(raw: Record<string, unknown>[], errors: IngestError[]): RadarSector[] {
  return raw
    .map((row, idx) => {
      const id = parseOptionalString(row.id);
      if (!id) {
        errors.push({ row: idx + 2, sheet: "sectors", message: "Missing id" });
        return null;
      }
      const label = parseOptionalString(row.label) || id;
      return {
        id,
        label,
        shortLabel: parseOptionalString(row.shortLabel),
        labelLines: generateNameLines(label),
        startAngle: parseNumber(row.startAngle, 0),
        color: parseOptionalString(row.color) || "#000000",
        bgLight: parseOptionalString(row.bgLight),
        bgDark: parseOptionalString(row.bgDark),
        icon: parseOptionalString(row.icon),
      } satisfies RadarSector;
    })
    .filter((s) => s !== null) as RadarSector[];
}

function transformItems(raw: Record<string, unknown>[], errors: IngestError[]): RadarItem[] {
  return raw
    .map((row, idx) => {
      const id = parseOptionalString(row.id);
      if (!id) {
        errors.push({ row: idx + 2, sheet: "items", message: "Missing id" });
        return null;
      }
      const name = parseOptionalString(row.name) || id;
      const trlValue = parseNumber(row.trlValue, 0);
      const impact = parseOptionalString(row.impact);
      const horizon = parseOptionalString(row.horizon);
      const sublines = parseSublines(row.sublines);
      const tendencias = parseOptionalString(row.tendencias);
      const metadata: Record<string, unknown> = {};
      if (impact) metadata.impact = impact;
      if (horizon) metadata.horizon = horizon;
      if (sublines) metadata.sublines = sublines;
      if (tendencias) metadata.tendencias = tendencias;

      return {
        id,
        name,
        nameLines: generateNameLines(name),
        code: parseOptionalString(row.code),
        sectorId: parseOptionalString(row.sectorId) || "",
        ringId: parseOptionalString(row.ringId) || "",
        angleOff: parseNumber(row.angleOff, 0),
        maturity: { scaleId: "trl", value: trlValue },
        description: parseOptionalString(row.description),
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      } satisfies RadarItem;
    })
    .filter((i) => i !== null) as RadarItem[];
}

function generateTrlScale(items: RadarItem[]): MaturityScale[] {
  const values = items.map((i) => i.maturity?.value ?? 0);
  const min = values.length > 0 ? Math.min(...values) : 1;
  const max = values.length > 0 ? Math.max(...values) : 9;

  return [
    {
      id: "trl",
      label: "TRL — Technology Readiness Level",
      min: 1,
      max: 9,
      buckets: [
        { rangeStart: 1, rangeEnd: 2, label: "TRL 1-2 (Inicial)", color: "#4FC3F7" },
        { rangeStart: 3, rangeEnd: 4, label: "TRL 3-4 (Bajo)", color: "#FDC300" },
        { rangeStart: 5, rangeEnd: 6, label: "TRL 5-6 (Medio)", color: "#E65100" },
        { rangeStart: 7, rangeEnd: 9, label: "TRL 7-9 (Alto)", color: "#C62828" },
      ],
    },
  ];
}

export interface TransformResult {
  schema: RadarSchema;
  errors: IngestError[];
  warnings: IngestWarning[];
}

export interface TransformOptions {
  id?: string;
  title?: string;
}

// D4: Áreas Tecnológicas Folding — the `areaTecnologica` optional sector
// column (one per direccionador) is folded into schema.metadata.sectorAreas,
// keyed by sector id. `RadarSector` itself gains no new field.
function buildSectorAreas(rawSectors: Record<string, unknown>[]): Record<string, string> {
  const sectorAreas: Record<string, string> = {};
  rawSectors.forEach((row) => {
    const id = parseOptionalString(row.id);
    const area = parseOptionalString(row.areaTecnologica);
    if (id && area) sectorAreas[id] = area;
  });
  return sectorAreas;
}

export function transform(parsed: ParsedRows, options: TransformOptions = {}): TransformResult {
  const errors: IngestError[] = [...parsed.errors];
  const warnings: IngestWarning[] = [...parsed.warnings];

  const rings = transformRings(parsed.rings, errors);
  const sectors = transformSectors(parsed.sectors, errors);
  const items = transformItems(parsed.items, errors);
  const sectorAreas = buildSectorAreas(parsed.sectors);

  // Validation cross-references
  const ringIds = new Set(rings.map((r) => r.id));
  const sectorIds = new Set(sectors.map((s) => s.id));

  items.forEach((item, idx) => {
    if (item.ringId && !ringIds.has(item.ringId)) {
      warnings.push({
        row: idx + 2,
        sheet: "items",
        message: `Item references unknown ringId: ${item.ringId}`,
      });
    }
    if (item.sectorId && !sectorIds.has(item.sectorId)) {
      warnings.push({
        row: idx + 2,
        sheet: "items",
        message: `Item references unknown sectorId: ${item.sectorId}`,
      });
    }
  });

  const schema: RadarSchema = {
    $schemaVersion: "1.0.0",
    id: options.id || "generated-radar",
    title: options.title || "Radar Tecnológico",
    rings,
    sectors,
    items,
    scales: generateTrlScale(items),
    layout: {
      viewBoxWidth: 1200,
      viewBoxHeight: 1060,
      centerX: 600,
      centerY: 520,
      outerRadius: 400,
    },
    ...(Object.keys(sectorAreas).length > 0 ? { metadata: { sectorAreas } } : {}),
  };

  return { schema, errors, warnings };
}
