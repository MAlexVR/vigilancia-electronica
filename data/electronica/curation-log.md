# Curation Log — Radar Tecnológico Electrónica CEET (2026-2036)

> **Revision Oct 2026** — re-ingested from `docs/Mapa_TT_Electronica_Plantilla_FINAL_2026.xlsx`.
> Direccionadores renumbered (D1 microelectrónica, D2 potencia/energía, D3 automatización, D4, D5) and
> líneas renumbered so that D1=L01-L05 … D5=L21-L24. The rubric was re-run over the updated narratives:
> every ring/TRL/impact/horizon value is unchanged except where the signal text changed (none changed a ring).
> Rows below use the NEW codes. Old→new: L06-L10→L01-L05, L11-L15→L06-L10, L01-L05→L11-L15; L16-L22 unchanged;
> old L23 (renderizado gráfico neuronal) was removed from the xlsx; old L24→L23 and old L25→L24.
> The Word report (V04) Table 8 differs from these values for several líneas; this log follows the rubric, not Table 8.

User review surface for the 24 curated `trlValue`/`ringId`/`impact`/`horizon` values
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

All 24 rows below were computed by running `tools/ingest-xlsx/src/rubric.ts`'s
`deriveRubric()`/`deriveImpact()` against the exact narrative text now stored
in `narrative/L01.md`..`L24.md` (verbatim copies of the source `PRINCIPALES
TENDENCIAS` column), so every value is reproducible from the committed text.

| Code | Signal (quoted excerpt) | Rule | TRL | Ring | Impact | Horizon | Override |
|------|--------------------------|------|-----|------|--------|---------|----------|
| L01 | "EMERGENTE" ("EMERGENTE con impulso pesado") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L02 | "ALZA con componentes emergentes (...); TRL 8-9 en EDA/PCB flexibles; TRL 6-8 en empaquetado 3DIC" | R3 (override — was R1) manual nearest-fit | 7 | trial | Medio | Corto (1-3 años) | ±ring, Batch 4: no literal R1-R5 phrase governs the whole línea (bare "ALZA con componentes emergentes"); "TRL 8-9" covers only EDA/PCB flexible (2 of 3 sublíneas), while empaquetado 3DIC (the barrier-driven transition sub-línea) sits at TRL 6-8 "con escalamiento proyectado". Note: IMPLICACIÓN CEET's "Formación en diseño de PCB ya consolidada" describes CEET's own training-program maturity, not the technology's TRL, so it was not used as an R2 signal |
| L03 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L04 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L05 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L06 | "ALZA (TRL corto a medio plazo)" + "Caída de precios de baterías de litio de 20% en 2024" + "Brecha ALTA" (no literal R1-R5 phrase) | Manual (nearest fit R3) | 7 | trial | Medio | Corto (1-3 años) | — |
| L07 | "TRL 9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L08 | "ALZA (TRL 6-9 según aplicación; SMPS de silicio ya en TRL 9; SMPS basados en GaN en TRL 6-8)" | R3 (override — was R1) manual nearest-fit | 7 | trial | Alto | Corto (1-3 años) | ±ring, Batch 4: no literal R1-R5 phrase governs the whole línea (bare "ALZA"); "TRL 9" is the SMPS-de-silicio submarket ceiling, while GaN (the actual subject of this línea) sits at TRL 6-8. Nearest-fit uses the ~42% CAGR GaN-power-market growth (USD 355M en 2024 → USD 3.000M en 2030) as the R3 accelerated-growth signal |
| L09 | "piloto" ("varios fabricantes automotrices anuncian plantas piloto") | R4 | 5 | assess | Medio | Medio (3-5 años) | — |
| L10 | "TRL 7-9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L11 | "ALZA FUERTE" | R3 | 7 | trial | Medio | Corto (1-3 años) | — |
| L12 | "ALZA (TRL corto a medio plazo, 1-5 años según instrumentación disponible)" + "transita de la novedad a la consolidación comercial" (no literal R1-R5 phrase) | Manual (nearest fit R4) | 5 | assess | Medio | Medio (3-5 años) | — |
| L13 | "TRL 9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L14 | "EMERGENTE con escalamiento comercial (TRL medio plazo 3-7 años...)" | R4 (override — was R1) | 5 | assess | Medio | Medio (3-5 años) | ±ring, Batch 4: R1's "ya en TRL 9" describes only the visión artificial submarket (1 of 3 sublíneas); the línea's own governing descriptor is "EMERGENTE con escalamiento comercial", closest to R4 (EN CRECIMIENTO / mediano plazo), not R1's mechanically-hijacked adopt tier |
| L15 | "ALZA (...); TRL 8-9 en robótica/drones ya maduros; TRL 4-6 en robots humanoides, fase temprana" | R3 (override — was R1) manual nearest-fit | 7 | trial | Medio | Corto (1-3 años) | ±ring, Batch 4: no literal R1-R5 phrase governs the whole línea (bare "ALZA"); "TRL 8-9" describes only robótica/drones, while robots humanoides (1 of 3 sublíneas) sit at TRL 4-6. Nearest-fit uses the accelerating-unit-growth evidence (5,5M robots instalados en 2026; 15.000 humanoides comercializados con precios en caída acelerada), the same class of signal used for L06's manual R3 call |
| L16 | "ALZA en consolidación (TRL 7-9 en wearables comerciales; TRL 4-6 en bioelectrónica implantable multimodal, horizonte 3-7 años)" | R4 (override — was R1) manual nearest-fit | 5 | assess | Medio | Medio (3-5 años) | ±ring, Batch 4: no literal R1-R5 phrase governs the whole línea ("consolidación" is not the literal "CONSOLIDADA" trigger); "TRL 7-9" describes only wearables comerciales, while bioelectrónica implantable multimodal (1 of 3 sublíneas) sits at TRL 4-6. "Brecha MODERADA-ALTA" (updated in the FINAL xlsx, Oct 2026; still lower urgency than the ALTA cases) supports a mid-tier EN CRECIMIENTO placement |
| L17 | "ALZA con vectores emergentes (TRL 6-9 en aviónica modular/COTS, ya operacionales; TRL 4-7 en enjambres de drones y nanosatélites, horizonte 3-8 años)" | R4 (override — was R1) manual nearest-fit | 5 | assess | Medio | Medio (3-5 años) | ±ring, Batch 4: no literal R1-R5 phrase governs the whole línea (bare "ALZA con vectores emergentes"); "TRL 6-9" covers only aviónica modular/COTS (1 of 3 sublíneas), while enjambres de drones y aviónica de nanosatélites (2 of 3 sublíneas) sit at TRL 4-7. IMPLICACIÓN CEET explicitly frames this as a niche/early-specialization opportunity ("oportunidad de nicho... escasa oferta formativa regional"), supporting a mid-tier placement |
| L18 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L19 | "ALZA en transformación acelerada (TRL 8-9 en ECU/ADAS niveles 1-2, ya comerciales; TRL 5-7 en arquitecturas zonales y conducción niveles 3-4)" | R3 (override — was R1) manual nearest-fit | 7 | trial | Disruptivo | Corto (1-3 años) | ±ring, Batch 4: "transformación acelerada" (reinforced verbatim in IMPLICACIÓN CEET: "Transformación acelerada del sector automotriz demanda actualización curricular urgente") maps directly to R3's "crecimiento acelerado" concept; "TRL 8-9" covers only ECU/ADAS niveles 1-2 (1 of 3 sublíneas), while arquitecturas zonales y conducción niveles 3-4 (2 of 3 sublíneas) sit at TRL 5-7 |
| L20 | "SEÑAL DÉBIL" ("SEÑAL DÉBIL EMERGENTE") | R5 | 2 | monitor | Medio | Largo (5-10 años) | — |
| L21 | "TRL 9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L22 | "TRL 9" | R1 | 9 | adopt | Medio | Corto (1-2 años) | — |
| L23 | "TRL 6-8" + "Requisito transversal emergente sobre toda la línea de consumo conectado" | R1 | 8 | adopt | Alto | Corto (1-2 años) | — |
| L24 | "TRL 6-9" + "Tema transversal creciente de sostenibilidad de producto electrónico" | R1 | 9 | adopt | Alto | Corto (1-2 años) | — |

## Notes for reviewer

- **L12, L06 (Manual)**: neither línea's narrative contains a literal R1-R5
  phrase from the rubric table — both use plain "ALZA" without a qualifying
  word ("FUERTE", "EN CRECIMIENTO", etc.). The nearest-fit rule was chosen
  from the surrounding evidence (market consolidation signals for L12 vs.
  accelerating price/patent/share signals plus a stated "Brecha ALTA" for
  L06) and is flagged here for override if the reviewer disagrees.
- **L14, L15, L02, L08, L16, L17, L19 — CORRECTED in Batch 4** (originally R1
  hits at TRL 8-9, flagged by Batch 2 as borderline, now overridden): in each
  of these the matched explicit TRL described one commercially mature
  sub-component of the línea (e.g. L14's "ya en TRL 9" refers specifically to
  the visión artificial submarket, not the Edge AI/MEMS core; L08's "TRL 9"
  is the SMPS-de-silicio ceiling, not the GaN/SiC technology the línea is
  actually about), while the línea's own governing narrative language
  ("EMERGENTE con escalamiento comercial", bare "ALZA", "ALZA en
  consolidación", etc.) never literally matched R1-R5's precedence table for
  the línea as a whole — R1's mechanical `TRL\s*n` regex simply matched the
  first TRL-shaped substring in the text regardless of which sub-component it
  described. `sdd-verify` independently reproduced this as a real functional
  defect: 14/25 items (56%) landing in the innermost "ADOPTAR" ring caused
  label bounding-box overlap that broke radar-dot click interactivity
  (Playwright e2e). Each of the 7 rows above was re-derived using R2-R5's
  literal precedence against the línea's OVERALL governing descriptor (not
  the buried submarket TRL), falling back to a manual nearest-fit call —
  using the same evidentiary method as L12/L06's original manual calls —
  when no rule's literal phrase matched. Every correction is logged in the
  `Override` column with its specific reasoning, per design.md's "override
  only with a logged reason" mechanism. Net effect: the "adopt" ring drops
  from 14/25 (56%) to 7/25 (28%), closer to the telecom reference's 4/24
  (17%).
- **No ±1 ring override was applied to any of the other 18 líneas.** L09 was
  initially expected to need one (its leading classifier "SEÑAL DÉBIL EN
  TRANSICIÓN A EMERGENTE" reads as R5), but design.md's rule R4 outranks R5
  in strict precedence, and L09's text separately contains the literal word
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

## Revision Oct 2026 — content changes carried by the FINAL xlsx

- **L02 (was L07)**: sublínea SL02d (circularidad y gestión de e-waste de PCB) is
  part of the línea. The latest xlsx (second revision, Oct 2026) no longer marks
  it as a proposal and records it as validated by the CEET vigía tecnológico, so
  the narrative now follows the xlsx verbatim. Rubric signals unchanged, so
  ring/TRL are unchanged.
- **Old L23 removed**: "Renderizado gráfico neuronal e IA generativa aplicada a
  gráficos" (monitor, TRL 2) no longer exists in the xlsx. D5 now has 4 líneas
  (L21-L24); the radar and trajectory maps show 24 tecnologías.
- **L16**: new sublíneas SL16d (regulación y tecnovigilancia) and SL16e
  (neurotecnología/BCI), a TRL 3-5 clause for bioimpresión, and
  "Brecha MODERADA-ALTA". The first explicit TRL (7-9) still hits R1; the
  existing R4 override stands.
- **L21**: new sublíneas SL21e (climatización residencial inverter) and SL21f
  (gasodomésticos); the previous "Nota de curación" (4→3 sublíneas merge) was
  dropped because the xlsx now lists all sublíneas. R1 (TRL 9) unchanged.
- **L01, L04, L11, L14**: only the "[Nota de triangulación]" tails were removed
  from the narrative; no rubric signal changed.
- **Excel, correcciones de forma (second pass, Oct 2026)**: the xlsx now fixes the
  L02 closing sentence, restores the "(artículos científicos y patentes)" suffix
  on every area text and updates the stale cross-references (L03→L14, L04→L02,
  L21 D3→D2). The narratives are therefore verbatim from the xlsx again; no
  rubric signal changed.
