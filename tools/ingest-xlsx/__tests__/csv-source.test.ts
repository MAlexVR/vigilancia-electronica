import { describe, it, expect } from "vitest";
import * as path from "node:path";
import { parseCsv, parseNarrativeMarkdown, readInDir } from "../src/csv-source";

const FIXTURE_DIR = path.join(__dirname, "fixtures", "in-dir");

describe("parseCsv", () => {
  it("parses a simple header + data matrix", () => {
    const rows = parseCsv("id,label\nD1,Sector Uno\n");
    expect(rows).toEqual([
      ["id", "label"],
      ["D1", "Sector Uno"],
    ]);
  });

  it("handles quoted fields with embedded commas and newlines", () => {
    const rows = parseCsv('id,areaTecnologica\nD1,"Texto con, coma\ny salto de línea"\n');
    expect(rows[1][1]).toBe("Texto con, coma\ny salto de línea");
  });

  it("unescapes doubled quotes inside quoted fields", () => {
    const rows = parseCsv('id,label\nD1,"Dice ""hola"""\n');
    expect(rows[1][1]).toBe('Dice "hola"');
  });
});

describe("parseNarrativeMarkdown", () => {
  it("extracts Resumen, Sublíneas, and Tendencias sections", () => {
    const content = `# L01. Título\n\n## Resumen\nResumen corto.\n\n## Sublíneas\n- Uno\n- Dos\n- Tres\n\n## Tendencias\nTexto completo de tendencias.\n`;
    const parsed = parseNarrativeMarkdown(content);
    expect(parsed.description).toBe("Resumen corto.");
    expect(parsed.sublines).toEqual(["Uno", "Dos", "Tres"]);
    expect(parsed.tendencias).toBe("Texto completo de tendencias.");
  });
});

describe("readInDir", () => {
  it("parses rings/sectors/items from CSV and reports zero errors", () => {
    const result = readInDir(FIXTURE_DIR);
    expect(result.errors).toEqual([]);
    expect(result.rings).toHaveLength(2);
    expect(result.sectors).toHaveLength(1);
    expect(result.items).toHaveLength(2);
  });

  it("carries the sector's areaTecnologica field through", () => {
    const result = readInDir(FIXTURE_DIR);
    expect(result.sectors[0].areaTecnologica).toContain("Área tecnológica de prueba.");
  });

  it("merges narrative/{code}.md into the matching item row", () => {
    const result = readInDir(FIXTURE_DIR);
    const t01 = result.items.find((i) => i.id === "T01")!;
    expect(t01.description).toBe("Resumen corto de prueba para la línea L01.");
    expect(t01.sublines).toEqual(["Primera sublínea", "Segunda sublínea", "Tercera sublínea"]);
    expect(t01.tendencias).toContain("TRL 8-9");
  });

  it("warns (not errors) when an item's narrative file is missing", () => {
    const result = readInDir(FIXTURE_DIR);
    expect(result.errors).toEqual([]);
    expect(result.warnings.some((w) => w.message.includes("L99"))).toBe(true);
    const t02 = result.items.find((i) => i.id === "T02")!;
    expect(t02.description).toBeUndefined();
  });

  it("reports an error for a missing --in-dir directory", () => {
    const result = readInDir(path.join(FIXTURE_DIR, "does-not-exist"));
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
