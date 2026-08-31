import { describe, it, expect } from "vitest";
import { Workbook } from "exceljs";
import {
  rowsFromMatrix,
  parseWorkbook,
  SECTOR_REQUIRED_HEADERS,
  SECTOR_OPTIONAL_HEADERS,
} from "../src/parser";
import { transform } from "../src/transformer";
import type { IngestError, IngestWarning } from "../src/types";

describe("rowsFromMatrix — required vs optional headers", () => {
  it("does not error when optional headers are absent from the sheet", () => {
    const errors: IngestError[] = [];
    const warnings: IngestWarning[] = [];
    const rows = rowsFromMatrix(
      ["id", "label", "color"],
      [["D1", "Sector Uno", "#1565C0"]],
      SECTOR_REQUIRED_HEADERS,
      SECTOR_OPTIONAL_HEADERS,
      "sectors",
      errors,
      warnings
    );
    expect(errors).toEqual([]);
    expect(rows).toEqual([{ id: "D1", label: "Sector Uno", color: "#1565C0" }]);
  });

  it("reads optional headers when present without requiring all of them", () => {
    const errors: IngestError[] = [];
    const warnings: IngestWarning[] = [];
    const rows = rowsFromMatrix(
      ["id", "label", "color", "areaTecnologica"],
      [["D1", "Sector Uno", "#1565C0", "Texto de área."]],
      SECTOR_REQUIRED_HEADERS,
      SECTOR_OPTIONAL_HEADERS,
      "sectors",
      errors,
      warnings
    );
    expect(errors).toEqual([]);
    expect(rows[0].areaTecnologica).toBe("Texto de área.");
  });

  it("errors when a required header is missing", () => {
    const errors: IngestError[] = [];
    const warnings: IngestWarning[] = [];
    rowsFromMatrix(
      ["id", "label"], // missing required "color"
      [["D1", "Sector Uno"]],
      SECTOR_REQUIRED_HEADERS,
      SECTOR_OPTIONAL_HEADERS,
      "sectors",
      errors,
      warnings
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("color");
  });
});

describe("legacy --in file.xlsx regression", () => {
  it("still parses a minimal 3-sheet workbook without the new optional columns", async () => {
    const workbook = new Workbook();
    const ringSheet = workbook.addWorksheet("rings");
    ringSheet.addRow([
      "id",
      "label",
      "order",
      "innerRadius",
      "outerRadius",
      "color",
      "fillColor",
      "borderColor",
      "labelColor",
    ]);
    ringSheet.addRow(["adopt", "ADOPTAR", 0, 0, 110, "#2E7D32", "#C8E6C9", "#81C784", "#2E7D32"]);
    ringSheet.addRow(["monitor", "MONITOREAR", 3, 305, 400, "#E64A19", "#FFE0D2", "#FFAB91", "#BE643C"]);

    const sectorSheet = workbook.addWorksheet("sectors");
    sectorSheet.addRow(["id", "label", "color"]);
    sectorSheet.addRow(["D1", "Sector Uno", "#1565C0"]);

    const itemSheet = workbook.addWorksheet("items");
    itemSheet.addRow(["id", "name", "sectorId", "ringId", "angleOff"]);
    itemSheet.addRow(["T01", "Tecnología Uno", "D1", "adopt", 0]);

    const parsed = await parseWorkbook(workbook);
    expect(parsed.errors).toEqual([]);

    const { schema, errors } = transform(parsed);
    expect(errors).toEqual([]);
    expect(schema.rings).toHaveLength(2);
    expect(schema.sectors).toHaveLength(1);
    expect(schema.items).toHaveLength(1);
    expect(schema.metadata).toBeUndefined();
  });
});
