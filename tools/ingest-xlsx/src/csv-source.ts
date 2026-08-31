import * as fs from "node:fs";
import * as path from "node:path";
import type { IngestError, IngestWarning } from "./types";
import type { ParsedRows } from "./parser";
import {
  RING_REQUIRED_HEADERS,
  RING_OPTIONAL_HEADERS,
  SECTOR_REQUIRED_HEADERS,
  SECTOR_OPTIONAL_HEADERS,
  ITEM_REQUIRED_HEADERS,
  ITEM_OPTIONAL_HEADERS,
  rowsFromMatrix,
} from "./parser";

/**
 * `--in-dir` text intermediate reader (design.md D2/D3): reads
 * `rings.csv` / `sectors.csv` / `items.csv` from a directory, and merges each
 * item's `narrative/{code}.md` (short summary + 3 sublíneas + full
 * tendencias) into that item's row by matching the `code` column.
 */

const BOM = String.fromCharCode(0xfeff);

/** Minimal RFC4180 CSV parser: quoted fields, embedded commas/newlines, "" escapes. */
export function parseCsv(content: string): string[][] {
  const text = content.startsWith(BOM) ? content.slice(1) : content;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (char === "\r") {
      i++;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += char;
    i++;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

interface NarrativeSections {
  description?: string;
  sublines?: string[];
  tendencias?: string;
}

/**
 * Parses the narrative markdown convention:
 *   # <code>. <title>
 *   ## Resumen
 *   ...
 *   ## Sublíneas
 *   - ...
 *   - ...
 *   - ...
 *   ## Tendencias
 *   ...
 */
export function parseNarrativeMarkdown(content: string): NarrativeSections {
  const sections: Record<string, string> = {};
  const headingRe = /^##\s+(.+?)\s*$/gm;
  const matches = [...content.matchAll(headingRe)];

  matches.forEach((m, idx) => {
    const heading = m[1].trim().toLowerCase();
    const start = (m.index ?? 0) + m[0].length;
    const end = idx + 1 < matches.length ? (matches[idx + 1].index ?? content.length) : content.length;
    sections[heading] = content.slice(start, end).trim();
  });

  const description = sections["resumen"];
  const tendencias = sections["tendencias"];
  const sublineHeading = sections["sublíneas"] ?? sections["sublineas"];
  const sublines = sublineHeading
    ? sublineHeading
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("- "))
        .map((l) => l.slice(2).trim())
        .filter((l) => l.length > 0)
    : undefined;

  return { description, sublines, tendencias };
}

function readCsvFile(
  dirPath: string,
  fileName: string,
  sheetName: string,
  requiredHeaders: string[],
  optionalHeaders: string[],
  errors: IngestError[],
  warnings: IngestWarning[],
  verbose?: boolean
): Record<string, unknown>[] {
  const filePath = path.join(dirPath, fileName);
  if (!fs.existsSync(filePath)) {
    errors.push({ row: 0, sheet: sheetName, message: `File not found: ${fileName}` });
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const matrix = parseCsv(content);
  if (matrix.length < 1) {
    errors.push({ row: 0, sheet: sheetName, message: `${fileName} is empty` });
    return [];
  }

  const [rawHeaders, ...dataRows] = matrix;
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

function mergeNarrative(
  items: Record<string, unknown>[],
  dirPath: string,
  warnings: IngestWarning[],
  verbose?: boolean
): void {
  const narrativeDir = path.join(dirPath, "narrative");

  items.forEach((item, idx) => {
    const code = typeof item.code === "string" ? item.code.trim() : "";
    if (!code) return;

    const narrativePath = path.join(narrativeDir, `${code}.md`);
    if (!fs.existsSync(narrativePath)) {
      warnings.push({
        row: idx + 2,
        sheet: "items",
        message: `Narrative file not found for code ${code}: narrative/${code}.md`,
      });
      return;
    }

    if (verbose) {
      console.log(`[items] Merging narrative/${code}.md into row with code=${code}`);
    }

    const content = fs.readFileSync(narrativePath, "utf-8");
    const { description, sublines, tendencias } = parseNarrativeMarkdown(content);

    if (description && !item.description) item.description = description;
    if (sublines && sublines.length > 0) item.sublines = sublines;
    if (tendencias) item.tendencias = tendencias;
  });
}

export function readInDir(dirPath: string, verbose?: boolean): ParsedRows {
  const errors: IngestError[] = [];
  const warnings: IngestWarning[] = [];

  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    errors.push({ row: 0, sheet: "in-dir", message: `Directory not found: ${dirPath}` });
    return { rings: [], sectors: [], items: [], errors, warnings };
  }

  const rings = readCsvFile(
    dirPath,
    "rings.csv",
    "rings",
    RING_REQUIRED_HEADERS,
    RING_OPTIONAL_HEADERS,
    errors,
    warnings,
    verbose
  );
  const sectors = readCsvFile(
    dirPath,
    "sectors.csv",
    "sectors",
    SECTOR_REQUIRED_HEADERS,
    SECTOR_OPTIONAL_HEADERS,
    errors,
    warnings,
    verbose
  );
  const items = readCsvFile(
    dirPath,
    "items.csv",
    "items",
    ITEM_REQUIRED_HEADERS,
    ITEM_OPTIONAL_HEADERS,
    errors,
    warnings,
    verbose
  );

  mergeNarrative(items, dirPath, warnings, verbose);

  return { rings, sectors, items, errors, warnings };
}
