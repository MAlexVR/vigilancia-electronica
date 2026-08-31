import { describe, it, expect } from "vitest";
import * as path from "node:path";
import { readInDir } from "../src/csv-source";
import { transform } from "../src/transformer";
import { validateSchema } from "../../../src/core/validation";

/**
 * Integration test (design.md Testing Strategy row 3): runs the real
 * `--in-dir` pipeline over the actual curated `data/electronica` directory
 * and asserts the invariants required by specs/radar-dataset/spec.md.
 */

const DATA_DIR = path.resolve(__dirname, "..", "..", "..", "data", "electronica");

describe("data/electronica --in-dir integration", () => {
  it("ingests with zero errors and zero warnings", () => {
    const parsed = readInDir(DATA_DIR);
    expect(parsed.errors).toEqual([]);
    expect(parsed.warnings).toEqual([]);
  });

  it("produces exactly 5 sectors (D1-D5) and 25 items (L01-L25)", () => {
    const parsed = readInDir(DATA_DIR);
    const { schema, errors } = transform(parsed, {
      id: "ceet-electronica-2026-2036",
      title: "Radar Tecnológico — Electrónica CEET 2026-2036",
    });
    expect(errors).toEqual([]);
    expect(schema.sectors).toHaveLength(5);
    expect(schema.items).toHaveLength(25);
    expect(schema.sectors.map((s) => s.id).sort()).toEqual(["D1", "D2", "D3", "D4", "D5"]);
    const codes = schema.items.map((i) => i.code).sort();
    expect(codes).toEqual(Array.from({ length: 25 }, (_, i) => `L${String(i + 1).padStart(2, "0")}`));
  });

  it("assigns every item to one of the 4 institutional rings, with no unknown references", () => {
    const parsed = readInDir(DATA_DIR);
    const { schema, warnings } = transform(parsed, { id: "t", title: "t" });
    expect(warnings.filter((w) => w.message.includes("unknown"))).toEqual([]);
    const ringIds = new Set(schema.rings.map((r) => r.id));
    expect(ringIds).toEqual(new Set(["adopt", "trial", "assess", "monitor"]));
    schema.items.forEach((item) => {
      expect(ringIds.has(item.ringId)).toBe(true);
    });
  });

  it("gives every item exactly 3 sublines and a non-empty full tendencias narrative", () => {
    const parsed = readInDir(DATA_DIR);
    const { schema } = transform(parsed, { id: "t", title: "t" });
    schema.items.forEach((item) => {
      const sublines = item.metadata?.sublines as string[] | undefined;
      expect(sublines).toHaveLength(3);
      expect(typeof item.metadata?.tendencias).toBe("string");
      expect((item.metadata?.tendencias as string).length).toBeGreaterThan(0);
    });
  });

  it("keeps item.description short (curated summary, not the full narrative)", () => {
    const parsed = readInDir(DATA_DIR);
    const { schema } = transform(parsed, { id: "t", title: "t" });
    schema.items.forEach((item) => {
      expect(typeof item.description).toBe("string");
      expect((item.description as string).length).toBeLessThanOrEqual(240);
    });
  });

  it("folds ÁREAS TECNOLÓGICAS into schema.metadata.sectorAreas for all 5 sectors, without adding fields to RadarSector", () => {
    const parsed = readInDir(DATA_DIR);
    const { schema } = transform(parsed, { id: "t", title: "t" });
    const sectorAreas = schema.metadata?.sectorAreas as Record<string, string>;
    expect(Object.keys(sectorAreas).sort()).toEqual(["D1", "D2", "D3", "D4", "D5"]);
    Object.values(sectorAreas).forEach((text) => expect(text.length).toBeGreaterThan(0));
    schema.sectors.forEach((sector) => {
      expect(sector).not.toHaveProperty("description");
      expect(sector).not.toHaveProperty("metadata");
    });
  });

  it("produces a schema that passes the project's zod validator", () => {
    const parsed = readInDir(DATA_DIR);
    const { schema } = transform(parsed, {
      id: "ceet-electronica-2026-2036",
      title: "Radar Tecnológico — Electrónica CEET 2026-2036",
    });
    const result = validateSchema(schema);
    expect(result.valid).toBe(true);
  });
});
