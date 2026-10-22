/**
 * Tests for the Electrónica trajectory adapter.
 *
 * Verifies:
 *   1. electronicaConfig passes validateTrajectoryConfig without throwing.
 *   2. Drivers match SECTORS (D1–D5) from radar-data.
 *   3. 4 layers (L1–L4) and 5 horizon buckets are defined.
 *   4. buildElectronicaTrajectory() returns one Layer-1 item per TECHNOLOGIES
 *      entry, traceable to it.
 *   5. Layers 2, 3 and 4 hold only items transcribed from the informe (each
 *      names its table in `source`, links to an existing línea and inherits
 *      that línea's horizon unless the informe gives an explicit date).
 *   6. The source file documents the horizon/gap criteria and the
 *      anti-fabrication rule.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  electronicaConfig,
  buildElectronicaTrajectory,
} from "./trajectory-data.electronica";
import { validateTrajectoryConfig, normalizeHorizon } from "./trajectory";
import { TECHNOLOGIES, SECTORS, techShortLabel } from "./radar-data";

// ── Valid sets derived from config ────────────────────────────────────────────

const validHorizons = new Set(
  electronicaConfig.horizonBuckets.map((b) => b.key)
);
const validDrivers = new Set(electronicaConfig.drivers.map((d) => d.key));

// ── Suite: electronicaConfig ─────────────────────────────────────────────────

describe("electronicaConfig", () => {
  it("passes validateTrajectoryConfig without throwing", () => {
    expect(() => validateTrajectoryConfig(electronicaConfig)).not.toThrow();
  });

  it("drivers match SECTORS from radar-data (same count and keys)", () => {
    expect(electronicaConfig.drivers).toHaveLength(SECTORS.length);
    expect(electronicaConfig.drivers.map((d) => d.key)).toEqual(
      SECTORS.map((s) => s.id)
    );
  });

  it("has 4 layers (L1–L4) in order", () => {
    expect(electronicaConfig.layers).toHaveLength(4);
    expect(electronicaConfig.layers.map((l) => l.key)).toEqual([
      "L1",
      "L2",
      "L3",
      "L4",
    ]);
  });

  it("has 5 horizon buckets", () => {
    expect(electronicaConfig.horizonBuckets).toHaveLength(5);
    expect(electronicaConfig.horizonBuckets.map((b) => b.key)).toEqual([
      "ahora",
      "corto",
      "medio1",
      "medio2",
      "largo",
    ]);
  });

  it("metricBadge returns a TRL string for L1 items with a metric", () => {
    const item = {
      id: "t",
      layer: "L1",
      driver: "D1",
      horizon: "corto" as const,
      title: "X",
      detail: "",
      metric: { label: "TRL", value: 6 },
    };
    expect(electronicaConfig.metricBadge!(item)).toBe("TRL 6");
  });

  it("metricBadge returns null for non-L1 items", () => {
    const item = {
      id: "t",
      layer: "L2",
      driver: "D1",
      horizon: "corto" as const,
      title: "X",
      detail: "",
      metric: { label: "TRL", value: 6 },
    };
    expect(electronicaConfig.metricBadge!(item)).toBeNull();
  });
});

// ── Suite: buildElectronicaTrajectory() ──────────────────────────────────────

describe("buildElectronicaTrajectory()", () => {
  const dataset = buildElectronicaTrajectory();

  const l1 = dataset.items.filter((i) => i.layer === "L1");
  const support = dataset.items.filter((i) => i.layer !== "L1");

  it("returns exactly one Layer-1 item per TECHNOLOGIES entry", () => {
    expect(l1).toHaveLength(TECHNOLOGIES.length);
  });

  it("populates Layers 2, 3 and 4 with items transcribed from the informe", () => {
    for (const layer of ["L2", "L3", "L4"]) {
      expect(support.filter((i) => i.layer === layer).length).toBeGreaterThan(0);
    }
    for (const item of support) {
      expect(item.source).toMatch(/Informe GOR-F-012/);
      expect(item.source).toMatch(/Tabla (9|10|11)|Numeral 6\.5/);
    }
  });

  it("every L2–L4 item links to an existing línea and inherits its horizon unless the informe gives an explicit date", () => {
    for (const item of support) {
      const linkId = item.relatedIds?.[0];
      expect(linkId, `relatedIds for ${item.id}`).toBeDefined();
      const tech = TECHNOLOGIES.find((t) => `tech-${t.code}` === linkId);
      expect(tech, `línea vinculada de ${item.id}`).toBeDefined();
      const explicit = String(item.meta?.Fundamento).startsWith("Horizonte explícito");
      if (!explicit) expect(item.horizon).toBe(normalizeHorizon(tech!.horizon));
    }
  });

  it("only two items advance their horizon, both with a dated or already-installed evidence in the informe", () => {
    const explicit = support.filter((i) => String(i.meta?.Fundamento).startsWith("Horizonte explícito"));
    expect(explicit.map((i) => i.id).sort()).toEqual(["d2-l2-centros-refrigerantes", "d3-l3-talento-colombia"]);
    explicit.forEach((i) => expect(i.horizon).toBe("ahora"));
  });

  it("alliances carry no gap; L1 gaps come from the línea narrative (Brecha CRÍTICA/ALTA)", () => {
    support.filter((i) => i.layer === "L4").forEach((i) => expect(i.gap).toBeUndefined());
    const gaps = new Set(l1.map((i) => i.gap).filter(Boolean));
    expect([...gaps].every((g) => ["Crítica", "Alta"].includes(g as string))).toBe(true);
    expect(gaps.size).toBeGreaterThan(0);
  });

  it("every item has non-empty core fields and a valid horizon/driver", () => {
    for (const item of dataset.items) {
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.detail.length).toBeGreaterThan(0);
      expect(validHorizons.has(item.horizon)).toBe(true);
      expect(validDrivers.has(item.driver)).toBe(true);
    }
  });

  it("all items have unique ids", () => {
    const ids = dataset.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every Layer-1 field traces back to an existing TECHNOLOGIES entry (no invented data)", () => {
    for (const item of dataset.items.filter((i) => i.layer === "L1")) {
      const code = item.meta?.Código;
      const tech = TECHNOLOGIES.find((t) => t.code === code);
      expect(tech, `Expected a TECHNOLOGIES entry for code ${code}`).toBeDefined();
      expect(item.title).toBe(techShortLabel(tech!));
      expect(item.meta?.Línea).toBe(tech!.name);
      expect(item.detail).toBe(tech!.desc);
      expect(item.metric?.value).toBe(tech!.trl);
      expect(item.driver).toBe(`D${tech!.sector + 1}`);
    }
  });
});

// ── Suite: criteria documented in the source ────────────────────────────────

describe("trajectory-data.electronica.ts source file", () => {
  it("documents the horizon and gap criteria and the anti-fabrication rule", () => {
    const filePath = path.join(process.cwd(), "src/lib/trajectory-data.electronica.ts");
    const source = readFileSync(filePath, "utf-8");

    expect(source).toMatch(/REGLA ANTI-FABRICACIÓN/);
    expect(source).toMatch(/CRITERIO DE HORIZONTE/);
    expect(source).toMatch(/CRITERIO DE BRECHA/);
    expect(source).toMatch(/JUICIO:/);
  });
});
