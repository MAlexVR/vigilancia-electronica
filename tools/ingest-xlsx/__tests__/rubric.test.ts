import { describe, it, expect } from "vitest";
import { deriveRubric, deriveImpact, ringForTrl, horizonForTrl, applyOverride } from "../src/rubric";

describe("deriveRubric — R1 explicit TRL", () => {
  it("uses the upper bound of an explicit TRL range", () => {
    const result = deriveRubric("ESTABLE-MADURA (TRL 9, en evolución continua).");
    expect(result).toEqual({ rule: "R1", trl: 9, ring: "adopt", horizon: "Corto (1-2 años)", matchedSignal: "TRL 9" });
  });

  it("takes the upper bound when a range is given", () => {
    const result = deriveRubric("ALZA (TRL 6-9 según aplicación).");
    expect(result?.rule).toBe("R1");
    expect(result?.trl).toBe(9);
    expect(result?.ring).toBe("adopt");
  });

  it("does not match a bare 'TRL' word with no digit", () => {
    const result = deriveRubric("SEÑAL DÉBIL EMERGENTE (TRL temprano).");
    expect(result?.rule).toBe("R5");
  });
});

describe("deriveRubric — R2-R5 keyword precedence", () => {
  it("matches R2 (ESTABLE/MADURA/CONSOLIDADA) at TRL 9", () => {
    const result = deriveRubric("Tecnología ESTABLE y de adopción amplia en el sector.");
    expect(result).toMatchObject({ rule: "R2", trl: 9, ring: "adopt" });
  });

  it("matches R3 (ALZA FUERTE) at TRL 7", () => {
    const result = deriveRubric("ALZA FUERTE en el mercado, sin mención explícita de TRL numérico.");
    expect(result).toMatchObject({ rule: "R3", trl: 7, ring: "trial" });
  });

  it("matches R4 (EN CRECIMIENTO) at TRL 5", () => {
    const result = deriveRubric("Tecnología EN CRECIMIENTO con adopción parcial.");
    expect(result).toMatchObject({ rule: "R4", trl: 5, ring: "assess" });
  });

  it("matches R5 (SEÑAL DÉBIL / EMERGENTE) at TRL 2", () => {
    const result = deriveRubric("SEÑAL DÉBIL EMERGENTE, en fase de investigación.");
    expect(result).toMatchObject({ rule: "R5", trl: 2, ring: "monitor" });
  });

  it("returns null when no rule signal is present", () => {
    const result = deriveRubric("ALZA moderada sin calificador adicional.");
    expect(result).toBeNull();
  });

  it("does not treat 'maduración' (horizon noun) as the R2 'MADURA' signal", () => {
    // Regression: L09's real narrative says "Horizonte de maduración largo
    // (>7 años)" — a substring match on "madura" inside "maduración" must
    // not shadow the correct R5 "SEÑAL DÉBIL" classification.
    const result = deriveRubric(
      "SEÑAL DÉBIL EMERGENTE (TRL temprano). Horizonte de maduración largo (>7 años); no prioritario para formación inmediata."
    );
    expect(result).toMatchObject({ rule: "R5", trl: 2, ring: "monitor" });
  });
});

describe("ringForTrl / horizonForTrl bands", () => {
  it.each([
    [9, "adopt"],
    [8, "adopt"],
    [7, "trial"],
    [6, "trial"],
    [5, "assess"],
    [4, "assess"],
    [3, "monitor"],
    [1, "monitor"],
  ])("TRL %i maps to ring %s", (trl, ring) => {
    expect(ringForTrl(trl)).toBe(ring);
  });

  it("derives a horizon label consistent with the ring band", () => {
    expect(horizonForTrl(9)).toBe("Corto (1-2 años)");
    expect(horizonForTrl(2)).toBe("Largo (5-10 años)");
  });
});

describe("deriveImpact", () => {
  it("returns Disruptivo for disrup*/transform*/paradigma signals", () => {
    expect(deriveImpact("Transformación acelerada del sector.")).toBe("Disruptivo");
  });

  it("returns Alto for transversal/cross-sector signals", () => {
    expect(deriveImpact("Tecnología habilitadora transversal a varios sectores.")).toBe("Alto");
  });

  it("defaults to Medio otherwise", () => {
    expect(deriveImpact("Crecimiento moderado sin mayor impacto declarado.")).toBe("Medio");
  });
});

describe("applyOverride", () => {
  it("bumps the ring by +1 band and logs the reason", () => {
    const base = deriveRubric("SEÑAL DÉBIL EN TRANSICIÓN A EMERGENTE (TRL medio).")!;
    expect(base.ring).toBe("monitor");
    const overridden = applyOverride(base, 1, "Narrative explicitly states 'TRL medio' contradicting the R5 keyword match.");
    expect(overridden.ring).toBe("assess");
    expect(overridden.overrideReason).toContain("TRL medio");
  });

  it("caps the override at the adopt band even when pushed further", () => {
    const base = deriveRubric("ESTABLE-MADURA (TRL 9).")!;
    const overridden = applyOverride(base, 1, "test cap");
    expect(overridden.ring).toBe("adopt");
  });
});
