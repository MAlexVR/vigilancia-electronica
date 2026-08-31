import type { Workbook, Worksheet, CellValue } from "exceljs";
import type { IngestError, IngestWarning } from "./types";

export interface ParsedRows {
  rings: Record<string, unknown>[];
  sectors: Record<string, unknown>[];
  items: Record<string, unknown>[];
  errors: IngestError[];
  warnings: IngestWarning[];
}

// -- Header definitions, split into required (must be present in the sheet,
// otherwise a "missing header" error is raised) and optional (read when
// present, silently skipped when absent). This split is what lets the
// legacy `--in file.xlsx` path keep working for workbooks that don't carry
// the new sublines/tendencias/areaTecnologica columns, while still allowing
// an institutional-team xlsx to opt into them.

export const RING_REQUIRED_HEADERS = [
  "id",
  "label",
  "order",
  "innerRadius",
  "outerRadius",
  "color",
  "fillColor",
  "borderColor",
  "labelColor",
];
export const RING_OPTIONAL_HEADERS = ["description", "recommendedAction", "maturityHint"];
export const RING_HEADERS = [...RING_REQUIRED_HEADERS, ...RING_OPTIONAL_HEADERS];

export const SECTOR_REQUIRED_HEADERS = ["id", "label", "color"];
export const SECTOR_OPTIONAL_HEADERS = [
  "shortLabel",
  "startAngle",
  "bgLight",
  "bgDark",
  "icon",
  // D4: folded into schema.metadata.sectorAreas, one entry per sector.
  "areaTecnologica",
];
export const SECTOR_HEADERS = [...SECTOR_REQUIRED_HEADERS, ...SECTOR_OPTIONAL_HEADERS];

export const ITEM_REQUIRED_HEADERS = ["id", "name", "sectorId", "ringId", "angleOff"];
export const ITEM_OPTIONAL_HEADERS = [
  "code",
  "trlValue",
  "description",
  "impact",
  "horizon",
  // D5: 3 sublineas (pipe-delimited when supplied inline via xlsx) and the
  // full tendencias narrative. When ingesting via --in-dir these are instead
  // populated by the narrative/*.md merge in csv-source.ts.
  "sublines",
  "tendencias",
];
export const ITEM_HEADERS = [...ITEM_REQUIRED_HEADERS, ...ITEM_OPTIONAL_HEADERS];

const BOM = String.fromCharCode(0xfeff);

export function cellValueToString(value: CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "richText" in value) {
    return (value as { richText: Array<{ text: string }> }).richText
      .map((rt) => rt.text)
      .join("");
  }
  return "";
}

export function normalizeHeader(header: string): string {
  const stripped = header.startsWith(BOM) ? header.slice(1) : header;
  return stripped.trim().replace(/\s+/g, "").toLowerCase();
}

/**
 * Pure, source-agnostic row builder: turns a raw header row + data-row matrix
 * of strings into the same `Record<string, unknown>[]` shape produced from an
 * xlsx worksheet. Shared by the xlsx (`readSheet`) and CSV (`csv-source.ts`)
 * ingestion paths so both apply identical required/optional header rules.
 */
export function rowsFromMatrix(
  rawHeaders: string[],
  dataRows: string[][],
  requiredHeaders: string[],
  optionalHeaders: string[],
  sheetName: string,
  errors: IngestError[],
  _warnings: IngestWarning[],
  verbose?: boolean
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  const expectedHeaders = [...requiredHeaders, ...optionalHeaders];

  if (verbose) {
    console.log(`[${sheetName}] Detected headers: ${rawHeaders.join(", ")}`);
  }

  const headerMap = new Map<string, number>();
  rawHeaders.forEach((h, idx) => {
    const normalized = normalizeHeader(h);
    if (normalized) {
      headerMap.set(normalized, idx);
    }
  });

  const missingHeaders = requiredHeaders.filter((h) => !headerMap.has(normalizeHeader(h)));
  if (missingHeaders.length > 0) {
    errors.push({
      row: 1,
      sheet: sheetName,
      message: `Missing required headers: ${missingHeaders.join(", ")}`,
    });
  }

  dataRows.forEach((dataRow, rowIdx) => {
    const rowNumber = rowIdx + 2; // header is row 1

    const hasData = dataRow.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== "");
    if (!hasData) return;

    const obj: Record<string, unknown> = {};
    expectedHeaders.forEach((header) => {
      const colIndex = headerMap.get(normalizeHeader(header));
      if (colIndex !== undefined) {
        const cellVal = dataRow[colIndex];
        obj[header] = (cellVal ?? "").trim();
      }
    });

    if ((sheetName === "rings" || sheetName === "sectors" || sheetName === "items") && !obj.id) {
      errors.push({ row: rowNumber, sheet: sheetName, message: "Missing required field: id" });
      return;
    }

    rows.push(obj);
  });

  return rows;
}

function readSheet(
  sheet: Worksheet,
  requiredHeaders: string[],
  optionalHeaders: string[],
  sheetName: string,
  errors: IngestError[],
  warnings: IngestWarning[],
  verbose?: boolean
): Record<string, unknown>[] {
  if (sheet.rowCount < 1) {
    errors.push({ row: 0, sheet: sheetName, message: "Sheet is empty" });
    return [];
  }

  const headerRow = sheet.getRow(1);
  const rawHeaders: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    rawHeaders.push(cellValueToString(cell.value));
  });

  const dataRows: string[][] = [];
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const values: string[] = [];
    for (let col = 1; col <= rawHeaders.length; col++) {
      values.push(cellValueToString(row.getCell(col).value));
    }
    dataRows.push(values);
  }

  return rowsFromMatrix(
    rawHeaders,
    dataRows,
    requiredHeaders,
    optionalHeaders,
    sheetName,
    errors,
    warnings,
    verbose
  );
}

export async function parseWorkbook(
  workbook: Workbook,
  verbose?: boolean
): Promise<ParsedRows> {
  const errors: IngestError[] = [];
  const warnings: IngestWarning[] = [];

  const ringSheet = workbook.getWorksheet("rings");
  const sectorSheet = workbook.getWorksheet("sectors");
  const itemSheet = workbook.getWorksheet("items");

  if (!ringSheet) errors.push({ row: 0, sheet: "rings", message: "Sheet 'rings' not found" });
  if (!sectorSheet) errors.push({ row: 0, sheet: "sectors", message: "Sheet 'sectors' not found" });
  if (!itemSheet) errors.push({ row: 0, sheet: "items", message: "Sheet 'items' not found" });

  const rings = ringSheet
    ? readSheet(ringSheet, RING_REQUIRED_HEADERS, RING_OPTIONAL_HEADERS, "rings", errors, warnings, verbose)
    : [];
  const sectors = sectorSheet
    ? readSheet(sectorSheet, SECTOR_REQUIRED_HEADERS, SECTOR_OPTIONAL_HEADERS, "sectors", errors, warnings, verbose)
    : [];
  const items = itemSheet
    ? readSheet(itemSheet, ITEM_REQUIRED_HEADERS, ITEM_OPTIONAL_HEADERS, "items", errors, warnings, verbose)
    : [];

  return { rings, sectors, items, errors, warnings };
}
