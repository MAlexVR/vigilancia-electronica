/**
 * Tests for the Electrónica trajectory adapter.
 *
 * Verifies:
 *   1. electronicaConfig passes validateTrajectoryConfig without throwing.
 *   2. Drivers match SECTORS (D1–D5) from radar-data.
 *   3. 4 layers (L1–L4) and 5 horizon buckets are defined.
 *   4. buildElectronicaTrajectory() returns exactly TECHNOLOGIES.length items,
 *      one per TECHNOLOGIES entry, all assigned to Layer 1.
 *   5. buildElectronicaTrajectory() returns ZERO items for Layers 2, 3, and 4
 *      (the anti-fabrication / honesty guarantee — no invented content).
 *   6. The source file contains the PENDING marker naming the missing report.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  electronicaConfig,
  buildElectronicaTrajectory,
} from "./trajectory-data.electronica";
import { validateTrajectoryConfig } from "./trajectory";
import { TECHNOLOGIES, SECTORS } from "./radar-data";

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

  it("returns exactly one item per TECHNOLOGIES entry", () => {
    expect(dataset.items).toHaveLength(TECHNOLOGIES.length);
  });

  it("every returned item belongs to Layer 1 (Tecnologías)", () => {
    expect(dataset.items.length).toBeGreaterThan(0);
    for (const item of dataset.items) {
      expect(item.layer).toBe("L1");
    }
  });

  it("returns ZERO items for Layers 2, 3, and 4 — honesty guarantee, no fabricated content", () => {
    const nonL1 = dataset.items.filter((i) => i.layer !== "L1");
    expect(nonL1).toEqual([]);
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

  it("every field traces back to an existing TECHNOLOGIES entry (no invented data)", () => {
    for (const item of dataset.items) {
      const code = item.meta?.Código;
      const tech = TECHNOLOGIES.find((t) => t.code === code);
      expect(tech, `Expected a TECHNOLOGIES entry for code ${code}`).toBeDefined();
      expect(item.title).toBe(tech!.name);
      expect(item.detail).toBe(tech!.desc);
      expect(item.metric?.value).toBe(tech!.trl);
      expect(item.driver).toBe(`D${tech!.sector + 1}`);
    }
  });
});

// ── Suite: PENDING marker (source inspection) ────────────────────────────────

describe("trajectory-data.electronica.ts source file", () => {
  it("contains the PENDING marker naming the missing GOR report", () => {
    const filePath = path.join(
      process.cwd(),
      "src/lib/trajectory-data.electronica.ts"
    );
    const source = readFileSync(filePath, "utf-8");

    expect(source).toMatch(/PENDING:/);
    expect(source).toMatch(
      /Vigilancia_Cientifico-Tecnologica_Electronica_2026\.pptx/
    );
  });
});
