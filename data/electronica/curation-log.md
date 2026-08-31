# Curation Log — Radar Tecnológico Electrónica CEET (2026-2036)

User review surface for the 25 curated `trlValue`/`ringId`/`impact`/`horizon` values
(design.md "Curation Rubric"). Each row quotes the exact source-text signal that
drove the decision, per the rubric's strict precedence order:

- **R1** — explicit `TRL n` / `TRL n-m` anywhere in the línea's PRINCIPALES
  TENDENCIAS text wins outright (upper bound of a range). Ring/horizon are
  always *derived* from that TRL, never guessed: 8-9→adopt, 6-7→trial,
  4-5→assess, 1-3→monitor.
- **R2** ESTABLE/MADURA/CONSOLIDADA/adopción masiva → TRL 9
- **R3** ALZA FUERTE/crecimiento acelerado/corto plazo <3 años → TRL 7
- **R4** EN CRECIMIENTO/piloto/mediano plazo (3-5 años) → TRL 5
- **R5** SEÑAL DÉBIL/EMERGENTE/TRL temprano/largo plazo >5 años → TRL 2
- **Manual** — used only when none of R1-R5's literal phrases are present in
  the narrative; the nearest-fit rule and supporting evidence are quoted.
- **Impact** heuristic: disrup*/transform*/paradigma → Disruptivo;
  transversal/cross-sector/alto impacto → Alto; else Medio.

All 25 rows below were computed by running `tools/ingest-xlsx/src/rubric.ts`'s
`deriveRubric()`/`deriveImpact()` against the exact narrative text now stored
in `narrative/L01.md`..`L25.md` (verbatim copies of the source `PRINCIPALES
TENDENCIAS` column), so every value is reproducible from the committed text.

| Code | Signal (quoted excerpt) | Rule | TRL | Ring | Impact | Horizon | Override |
|------|--------------------------|------|-----|------|--------|---------|----------|
| L01 | "ALZA FUERTE" | R3 | 7 | trial | Medio | Corto (1-3 años) | — |
| L02 | "ALZA (TRL corto a medio plazo, 1-5 años según instrumentación disponible)" + "transita de la novedad a la consolidación comercial" (no literal R1-R5 phrase) | Manual (nearest fit R4) | 5 | assess | Medio | Medio (3-5 años) | — |
| L03 | "TRL 9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L04 | "ya en TRL 9" (visión artificial submarket within L04; edge AI/MEMS core is less mature per "EMERGENTE con escalamiento comercial") | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L05 | "TRL 8-9" (robótica/drones ya maduros; humanoides quedan en TRL 4-6 per source) | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L06 | "EMERGENTE" ("EMERGENTE con impulso pesado") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L07 | "TRL 8-9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L08 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L09 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L10 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L11 | "ALZA (TRL corto a medio plazo)" + "Caída de precios de baterías de litio de 20% en 2024" + "Brecha ALTA" (no literal R1-R5 phrase) | Manual (nearest fit R3) | 7 | trial | Medio | Corto (1-3 años) | — |
| L12 | "TRL 9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L13 | "TRL 6-9" + "Tecnología habilitadora transversal a potencia industrial, electromovilidad y consumo" | R1 | 9 | adopt | Alto | Corto (1-2 años) | — |
| L14 | "piloto" ("varios fabricantes automotrices anuncian plantas piloto") | R4 | 5 | assess | Medio | Medio (3-5 años) | — |
| L15 | "TRL 7-9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L16 | "TRL 7-9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L17 | "TRL 6-9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L18 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L19 | "TRL 8-9" + "Transformación acelerada del sector automotriz" | R1 | 9 | adopt | Disruptivo | Corto (1-2 años) | — |
| L20 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L21 | "TRL 9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L22 | "TRL 9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L23 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L24 | "TRL 6-8" + "Requisito transversal emergente sobre toda la línea de consumo conectado" | R1 | 8 | adopt | Alto | Corto (1-2 años) | — |
| L25 | "TRL 6-9" + "Tema transversal creciente de sostenibilidad de producto electrónico" | R1 | 9 | adopt | Alto | Corto (1-2 años) | — |

## Notes for reviewer

- **L02, L11 (Manual)**: neither línea's narrative contains a literal R1-R5
  phrase from the rubric table — both use plain "ALZA" without a qualifying
  word ("FUERTE", "EN CRECIMIENTO", etc.). The nearest-fit rule was chosen
  from the surrounding evidence (market consolidation signals for L02 vs.
  accelerating price/patent/share signals plus a stated "Brecha ALTA" for
  L11) and is flagged here for override if the reviewer disagrees.
- **L04, L05, L07, L13, L16, L17, L19** (R1 hits at TRL 8-9): in several of
  these the matched explicit TRL describes one commercially mature
  sub-component of the línea (e.g. L04's "ya en TRL 9" refers specifically to
  the visión artificial submarket, not the Edge AI/MEMS core), while the
  línea's own `IMPLICACIÓN CEET` note still reports a high institutional
  training gap. This is read as "globally mature technology, locally
  uncovered training" rather than a rubric error — R1 is applied literally
  and mechanically per design.md's precedence rule — but is called out here
  so the CEET team can downgrade any specific case on review if the buried
  TRL reference is judged unrepresentative of the línea as a whole.
- **No ±1 ring override was applied to any of the 25 líneas.** L14 was
  initially expected to need one (its leading classifier "SEÑAL DÉBIL EN
  TRANSICIÓN A EMERGENTE" reads as R5), but design.md's rule R4 outranks R5
  in strict precedence, and L14's text separately contains the literal word
  "piloto" ("varios fabricantes automotrices anuncian plantas piloto") —
  an R4 signal — so R4 applies directly and correctly without needing the
  discretionary override clause. `tools/ingest-xlsx/src/rubric.ts` still
  exports `applyOverride()` (unit-tested) for the CEET team to invoke by hand
  during review if they want to adjust any row by ±1 ring for a logged
  regulatory/market reason.
- Sector-level `ÁREAS TECNOLÓGICAS` texts (folded into
  `schema.metadata.sectorAreas`) and sector colors/icons/`startAngle` are not
  part of this per-línea rubric; sector visual identity reuses telecom's five
  slots by convention (open question in design.md, not resolved by the
  source pptx/xlsx).
