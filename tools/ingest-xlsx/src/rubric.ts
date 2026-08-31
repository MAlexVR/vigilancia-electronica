/**
 * Curation rubric mapper (design.md "Curation Rubric" section, R1-R5).
 *
 * Maps a línea's PRINCIPALES TENDENCIAS narrative text onto a curated
 * TRL/ring/horizon triple, in strict precedence order. This is a pure,
 * deterministic helper used to derive a reproducible first-pass value for
 * each of the 25 curated Electronics items; results are transcribed (with
 * evidence quotes) into `data/electronica/curation-log.md` for human review,
 * per the "traceable, not fabricated" requirement in specs/radar-dataset.
 *
 * Ring is always derived from the TRL band, never guessed:
 *   TRL 8-9 -> adopt | TRL 6-7 -> trial | TRL 4-5 -> assess | TRL 1-3 -> monitor
 */

export type RubricRule = "R1" | "R2" | "R3" | "R4" | "R5";

export interface RubricResult {
  rule: RubricRule;
  trl: number;
  ring: "adopt" | "trial" | "assess" | "monitor";
  horizon: string;
  matchedSignal: string;
}

const TRL_EXPLICIT_RE = /TRL\s*:?\s*(\d+)(?:\s*[-–—]\s*(\d+))?/i;

const KEYWORD_RULES: Array<{ rule: RubricRule; pattern: RegExp; trl: number; horizon: string }> = [
  { rule: "R2", pattern: /ESTABLE|\bMADURA\b|CONSOLIDADA|adopci[oó]n masiva/i, trl: 9, horizon: "Corto (1-2 años)" },
  {
    rule: "R3",
    pattern: /ALZA FUERTE|crecimiento acelerado|corto plazo\s*<\s*3\s*años/i,
    trl: 7,
    horizon: "Corto (1-3 años)",
  },
  {
    rule: "R4",
    pattern: /EN CRECIMIENTO|\bpiloto\b|mediano plazo\s*\(3-5\s*años\)/i,
    trl: 5,
    horizon: "Medio (3-5 años)",
  },
  {
    rule: "R5",
    pattern: /SE[ÑN]AL D[EÉ]BIL|EMERGENTE|TRL temprano|largo plazo\s*>\s*5\s*años/i,
    trl: 2,
    horizon: "Largo (5-10 años)",
  },
];

export function ringForTrl(trl: number): RubricResult["ring"] {
  if (trl >= 8) return "adopt";
  if (trl >= 6) return "trial";
  if (trl >= 4) return "assess";
  return "monitor";
}

export function horizonForTrl(trl: number): string {
  if (trl >= 8) return "Corto (1-2 años)";
  if (trl >= 6) return "Corto (1-3 años)";
  if (trl >= 4) return "Medio (3-5 años)";
  return "Largo (5-10 años)";
}

/**
 * Applies R1-R5 in precedence order against the full narrative text.
 * Returns `null` when no rule's signal is present, so the caller
 * (curation-log authoring) can fall back to a logged manual judgment call.
 */
export function deriveRubric(narrative: string): RubricResult | null {
  const explicit = narrative.match(TRL_EXPLICIT_RE);
  if (explicit) {
    const lower = Number(explicit[1]);
    const upper = explicit[2] ? Number(explicit[2]) : lower;
    const trl = Math.max(lower, upper);
    return {
      rule: "R1",
      trl,
      ring: ringForTrl(trl),
      horizon: horizonForTrl(trl),
      matchedSignal: explicit[0].trim(),
    };
  }

  for (const { rule, pattern, trl, horizon } of KEYWORD_RULES) {
    const match = narrative.match(pattern);
    if (match) {
      return { rule, trl, ring: ringForTrl(trl), horizon, matchedSignal: match[0] };
    }
  }

  return null;
}

// Impact heuristic per design.md: disrup-/transform-/paradigma -> Disruptivo; cross-sector/transversal/alto impacto -> Alto; else Medio.
export function deriveImpact(narrative: string): "Disruptivo" | "Alto" | "Medio" {
  if (/disrup|transform|paradigma/i.test(narrative)) return "Disruptivo";
  if (/transversal|cross-sector|alto impacto/i.test(narrative)) return "Alto";
  return "Medio";
}

/**
 * Applies an at-most-±1 ring override. Callers MUST only invoke this when
 * the narrative names a regulatory/market blocker (design.md rubric rule),
 * and MUST log the returned `reason` verbatim in curation-log.md.
 */
export function applyOverride(
  base: RubricResult,
  direction: 1 | -1,
  reason: string
): RubricResult & { overrideReason: string } {
  const bandFloor = [1, 4, 6, 8]; // monitor, assess, trial, adopt lower bounds
  const currentBandIdx = bandFloor.filter((f) => base.trl >= f).length - 1;
  const targetBandIdx = Math.min(3, Math.max(0, currentBandIdx + direction));
  const trl = bandFloor[targetBandIdx];
  return {
    rule: base.rule,
    trl,
    ring: ringForTrl(trl),
    horizon: horizonForTrl(trl),
    matchedSignal: base.matchedSignal,
    overrideReason: reason,
  };
}
