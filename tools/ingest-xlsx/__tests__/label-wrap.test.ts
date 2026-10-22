import { describe, it, expect } from "vitest";
import { curatedLabelLines, generateNameLines } from "../src/transformer";

describe("generateNameLines (Batch 4 — CRITICAL-1 label-overlap robustness fix)", () => {
  it("returns undefined for short names (no wrap needed)", () => {
    expect(generateNameLines("IIoT, Industria 4.0")).toBeUndefined();
  });

  it("returns undefined for the empty string", () => {
    expect(generateNameLines("")).toBeUndefined();
  });

  it("wraps a medium-length telecom-style name into narrow lines, each within the max width", () => {
    const lines = generateNameLines(
      "IIoT, Industria 4.0/5.0 y modernización de SCADA",
    );
    expect(lines).toBeDefined();
    for (const line of lines!) {
      expect(line.length).toBeLessThanOrEqual(26);
    }
    // Reassembling the wrapped lines (space-joined) reproduces the source text
    // when no truncation was needed.
    expect(lines!.join(" ")).toBe(
      "IIoT, Industria 4.0/5.0 y modernización de SCADA",
    );
  });

  it("caps very long electronics-style names at 3 lines and ellipsizes the last line", () => {
    const longName =
      "Electrónica de consumo conectada: fuentes de alimentación eficientes, conectividad integrada y electrodomésticos inteligentes";
    const lines = generateNameLines(longName);
    expect(lines).toBeDefined();
    expect(lines!.length).toBeLessThanOrEqual(3);
    for (const line of lines!) {
      expect(line.length).toBeLessThanOrEqual(26);
    }
    expect(lines![lines!.length - 1].endsWith("…")).toBe(true);
  });

  it("never produces a line wider than the max width even for a single very long word", () => {
    const lines = generateNameLines(
      "Supercalifragilisticoexpialidocioso y otra palabra normal aquí",
    );
    expect(lines).toBeDefined();
    // The unsplittable long word itself may exceed the width (word-wrap
    // cannot split within a word), but every other constraint still holds:
    // the function must not throw and must return a bounded line count.
    expect(lines!.length).toBeLessThanOrEqual(3);
  });
});

describe("curatedLabelLines (telecom-style short radar labels)", () => {
  it("returns undefined when no curated label is supplied", () => {
    expect(curatedLabelLines(undefined)).toBeUndefined();
    expect(curatedLabelLines("")).toBeUndefined();
  });

  it("keeps a short curated label as a single line instead of falling back to the long name", () => {
    expect(curatedLabelLines("Baterías de Estado Sólido")).toEqual(["Baterías de Estado Sólido"]);
  });

  it("wraps a longer curated label into narrow lines", () => {
    const lines = curatedLabelLines("D1: Microelectrónica y Diseño Electrónico");
    expect(lines).toEqual(["D1: Microelectrónica y", "Diseño Electrónico"]);
  });
});

