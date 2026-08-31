# Exploration: Radar Tecnológico del área de Electrónica

## Goal

Determine how to build a "Radar Tecnológico" for the Electronics area that faithfully
reuses the style, composition, and architecture of the reference project
(`E:\Repositorio\radar_tecnologico`), and reuses the authorship / "acerca de" pattern
from the sibling Electricity radar (`E:\Repositorio\radar_tecnologico_electricidad`),
populated with the Electronics area's own source data.

## Current State

### Reference project (`radar_tecnologico`, v2.1.0, "Blueprint v5" architecture)

- Next.js 16 App Router + React 19.2 + TypeScript strict + Tailwind CSS v4
  (`@theme` CSS-based, no `tailwind.config.ts`) + shadcn/ui (Radix) + Zustand +
  next-intl + jsPDF + Storybook + Vitest + Playwright.
- Domain model lives in `src/core/` (`types.ts`, `geometry.ts`, `store.tsx`,
  `hooks.ts`) as a polymorphic `RadarSchema` (rings/sectors/items/scales/layout,
  all with `LocalizedString` and a free `metadata: Record<string, unknown>`).
- Actual page rendering (`src/app/page.tsx` → `RadarTemplate.tsx`) still consumes
  the **legacy** flat shapes (`Technology`/`Ring`/`Sector` from
  `src/types/radar.ts`) via `src/lib/radar-data.ts`, a backward-compat adapter
  that imports `public/data/ceet-telecom.json` (the v5 `RadarSchema`) and maps
  it down to the legacy arrays that `RadarChart`, `TechDetail`,
  `NomenclatureTable`, `RadarLegend`, `FilterSidebar` etc. actually render.
- `tools/ingest-xlsx/` (parser.ts + transformer.ts + CLI index.ts, run via
  `npm run data:build -- --in x.xlsx --out public/data/x.json`) turns a 3-sheet
  Excel workbook into the v5 JSON. The sheet/column contract is documented in
  `docs/data-template.md`: sheets must be named exactly `rings`, `sectors`,
  `items` with fixed headers (`id/label/order/innerRadius/outerRadius/color/...`
  for rings; `id/label/shortLabel/startAngle/color/...` for sectors;
  `id/name/code/sectorId/ringId/angleOff/trlValue/description/impact/horizon`
  for items).
- Composition: `Header` (green SENA bar, Help/About buttons + modals) →
  `MobileLayout` (mobile) / `FilterSidebar` + `RadarChart` (SVG, zoom/pan) +
  right rail (`TechDetail`, `RadarLegend`, collapsible `NomenclatureTable`)
  (desktop) → `Footer`. PNG/PDF export via `svgToCanvas` + `jsPDF`. `/embed`
  route exists for iframe use.
- **No "mapa de trayectoria tecnológica" route/component/concept exists
  anywhere in this codebase** (grep for `trayectoria|roadmap` returns zero
  matches). The rings/sectors/items radar is the only visualization; there is
  no separate trajectory-map artifact type in the schema, UI, or docs.
- `AboutModal.tsx` (single author: Mauricio Vargas Rodríguez) and
  `HelpModal.tsx` live in `src/components/molecules/`.

### Sibling project (`radar_tecnologico_electricidad`, v1.0.0 — a pre-v5 snapshot of the same template)

- Next.js 16.1 + React 19.2, but **no** `core/`, **no** Zustand, **no**
  `next-intl`, **no** Storybook, **no** `tools/ingest-xlsx`. Uses the flat
  legacy types directly (`src/types/radar.ts`), populated by a static,
  checked-in `src/lib/radar-data.ts` hand-generated once by `generate_radar.py`
  (a throwaway script, not a repeatable pipeline) from a manually curated
  `techs_config` array — the script does **not** programmatically parse
  TRL/ring/impact/horizon out of the source Excel; a human read the sheet and
  hard-coded those judgments per technology.
- `excel_output.json` is a raw row/values dump of the source spreadsheet, and
  its header row is column-for-column identical to the Electronics CSV:
  `Regional, Centro de Formación, Visión, DIRECCIONADORES DEL DESARROLLO,
  ÁREAS TECNOLÓGICAS, LÍNEAS TECNOLÓGICAS, SUBLÍNEAS TECNOLÓGICAS, PRINCIPALES
  TENDENCIAS`. This confirms the Electronics source data follows the exact
  same raw shape/methodology electricidad's source did.
- **No trajectory-map concept here either** (grep clean).
- `AboutModal.tsx` here is the **canonical authorship pattern** to replicate.
  Current structure (`src/components/molecules/AboutModal.tsx`, lines 75–90):

  ```tsx
  <p className="text-xs font-semibold text-sena-green mb-1">Autora:</p>
  <p className="text-[11px] text-sena-gray-dark leading-tight">
    Ing. Luz Mayerly Amaya Romero <br />
    Instructora — Área de Electricidad
  </p>
  {/* ...border-t... */}
  <p className="text-xs font-semibold text-sena-green mb-1">Coautor:</p>
  <p className="text-[11px] text-sena-gray-dark leading-tight">
    Ing. Mauricio Alexander Vargas Rodríguez, MSc., MBA Esp. PM. <br />
    Instructor G14 — Área de Telecomunicaciones
  </p>
  ```

  Everything else in the modal (logo, "Entidad/Centro/Regional/Grupo I+D"
  table with `CEET` + tooltip "Centro de Electricidad, Electrónica y
  Telecomunicaciones", intro paragraph, footer copyright) is byte-for-byte
  identical to `radar_tecnologico`'s `AboutModal.tsx` except the area name in
  the intro paragraph and the version badge. This component is **untouched by
  the v5 core/ migration** — both repos' `AboutModal.tsx` are
  structurally/class-for-class identical today, so it is safe to port into a
  v5-based Electronics app without adaptation risk.

### Electronics source data (already extracted from the binaries in `docs/`)

- `Vigilancia_Cientifico_-_Tecnológica-Electronica.xlsx`: 27 rows × 8 columns,
  same raw single-sheet shape as electricidad's source (header row + a
  metadata/definitions row + one row per D1–D5 direccionador block, each block
  spanning multiple merged-cell "línea" rows). Content: 5 `DIRECCIONADORES`
  (D1 Inteligencia distribuida y automatización industrial … D5 Electrónica de
  consumo masivo), each expanding into `ÁREAS TECNOLÓGICAS` (1 per
  direccionador), `LÍNEAS TECNOLÓGICAS` (25 total, L01–L25), `SUBLÍNEAS
  TECNOLÓGICAS` (75 total, 3 per línea, formatted as `SL0Na/b/c` free text
  inside each línea's cell), and `PRINCIPALES TENDENCIAS` (very long narrative
  per línea covering TECNOLÓGICA/DE MERCADO/REGULATORIA/INFORMES SECTORIALES
  angles, with maturity phrases like "ALZA FUERTE (TRL: corto plazo <3 años)",
  "SEÑAL DÉBIL EMERGENTE (TRL temprano)", "ESTABLE-MADURA (TRL 9...)" embedded
  in prose rather than as a discrete field).
- `Vigilancia_Cientifico-Tecnologica_Electronica_2026.pptx` (10 slides):
  confirms scope — "Prospectiva 2026–2036" (not 2025-2035 like the two
  existing radars), authorship as "Instructores – Oscar Andrés Pulido y Diana
  Cristina Limas" — and, critically, **slide 2's agenda explicitly lists item
  4 "Mapas de trayectoria tecnológica"**, but slide 10 (which should hold that
  content) is empty. This is direct, primary-source confirmation that the
  trajectory-map section is planned but its source content does not exist yet.

## Affected Areas (files that drive the design)

- `radar_tecnologico\docs\data-template.md` — exact xlsx contract for
  `tools/ingest-xlsx` (3 sheets: `rings`, `sectors`, `items`).
- `radar_tecnologico\tools\ingest-xlsx\src\transformer.ts` — `RadarItem.metadata`
  is a free-form bag (currently used only for `impact`/`horizon`) — natural
  home for extra Electronics fields (sublíneas, tendencias excerpt).
- `radar_tecnologico\src\lib\radar-data.ts` — backward-compat adapter that all
  rendering components depend on; any Electronics build must either produce a
  compatible `RadarSchema` JSON or fork this adapter.
- `radar_tecnologico\src\components\templates\RadarTemplate.tsx` and
  `Header.tsx` — composition/nav pattern to imitate.
- `radar_tecnologico_electricidad\src\components\molecules\AboutModal.tsx` and
  `generate_radar.py` — authorship wording pattern and the precedent for
  manual curation of TRL/ring/impact/horizon from narrative source text.
- `radar_tecnologico_electricidad\excel_output.json` — proves the raw source
  shape is identical to Electronics' CSV, validating the mapping below.

## Data Mapping (Electronics source → template's `RadarSchema`)

Neither `tools/ingest-xlsx` (needs 3 pre-shaped sheets) nor a raw
`excel_output.json`-style dump can be consumed directly — a curation/transform
step is required, mirroring what electricidad's `generate_radar.py` did:

| Electronics source column | Template target | Notes |
|---|---|---|
| *(none — institutional convention)* | `rings` (4: ADOPTAR/PROBAR/EVALUAR/MONITOREAR) | Not derivable from source; author manually, same as electricidad precedent. |
| `DIRECCIONADORES DEL DESARROLLO` (D1–D5) | `sectors[]` (id `D1`..`D5`) | Direccionador title → `sector.label`; narrative paragraph → `sector.description`/metadata; colors assigned by convention. |
| `ÁREAS TECNOLÓGICAS` (1 per direccionador) | no direct field | Extra taxonomy tier not modeled by `RadarSector`/`RadarItem`. Options: fold into `sector.description`, or store in `RadarSchema.metadata`. Needs a design decision. |
| `LÍNEAS TECNOLÓGICAS` (25, L01–L25) | `items[]` (id `T01`..`T25`, `code: "L01".."L25"`) | `sectorId` = owning direccionador; `ringId`/`trlValue`/`impact`/`horizon` must be manually inferred from the `PRINCIPALES TENDENCIAS` prose — same manual-judgment step electricidad's author performed. |
| `SUBLÍNEAS TECNOLÓGICAS` (75, `SL0Na/b/c`) | no direct field | Candidate: `item.metadata.sublines: string[]`, surfaced in `TechDetail`. |
| `PRINCIPALES TENDENCIAS` (long narrative) | `item.description` (too long as-is) | Needs summarization into a short `description` + full text stashed in `metadata` (e.g. `metadata.tendencias`) for an expandable panel — full text (often 2,000+ chars per línea) will break the current `TechDetail` layout if used verbatim. |

Cardinality (25 items / 5 sectors) is close enough to telecom's (24/5) and
electricidad's (18/5) that no changes to the SVG geometry/angle-distribution
code (`getTechPosition`, `angleOff`) should be needed.

## "Mapa de trayectoria tecnológica" — placeholder strategy

No existing route, component, schema field, or UI pattern for this exists in
either reference project — it must be designed net-new, not adapted from an
existing pattern. The pptx's own agenda promises it (item 4) but slide 10 (its
content slide) is blank, so the Electronics source report itself doesn't have
this content yet.

Recommendation for `sdd-propose`/`sdd-design`: add a clearly-labeled
placeholder section (e.g., a `Card`/`Dialog` reusing existing UI primitives,
or a disabled nav entry) with visible Spanish copy stating it is pending the
corresponding source report, plus a code comment such as:

```tsx
{/* PENDING: "Mapa de trayectoria tecnológica" — agenda item 4 of the source
   pptx (Vigilancia_Cientifico-Tecnologica_Electronica_2026.pptx, slide 10)
   has no content yet. Populate this section once that report/data is
   delivered. */}
```

## Authorship / "Acerca de" — target content for Electronics

Reuse electricidad's exact structure/wording, extended to 2 authors + 1
co-author:

- **Autores:** Ing. Óscar Andrés Pulido Casallas / Ing. Diana Cristina Limas
  Ramirez — "Instructores — Área de Electrónica" (pluralized, matching
  electricidad's singular "Instructora — Área de Electricidad" pattern).
- **Coautor:** Ing. Mauricio Alexander Vargas Rodríguez, MSc., MBA Esp. PM. —
  "Instructor G14 — Área de Telecomunicaciones" (verbatim, unchanged from both
  existing radars).
- "Centro" field ("CEET" / tooltip) is reusable verbatim (same institution).
  Intro paragraph needs "...del área de electrónica." and a decision on
  displayed horizon year (see Risks).
- **Open discrepancy**: the pptx's slide 1 spells the instructors as "Oscar
  Andrés Pulido" and "Diana Cristina Limas" (no surnames Casallas/Ramirez, no
  accent on "Óscar"). The user's task text gives full names with second
  surnames — those are authoritative per the user's explicit instruction; flag
  the discrepancy for confirmation before finalizing copy.

## Approaches Considered

1. **Fork the current v5 `radar_tecnologico` architecture wholesale** (core/,
   ingest-xlsx, Storybook, i18n) and hand-curate a 3-sheet intermediate xlsx
   per `docs/data-template.md`, then run `npm run data:build`.
   - Pros: most faithful match to the reference project's current
     architecture; keeps a re-runnable ingest pipeline for future data
     updates; test/Storybook infra included.
   - Cons: heaviest lift — requires forking `core/`, `RadarProvider`, Zustand
     store, Storybook config; largest surface area; arguably overkill given
     electricidad (the actual shipped precedent) used something simpler.
   - Effort: High

2. **Fork `radar_tecnologico_electricidad`'s simpler pre-v5 snapshot** and
   write one hand-curation script mapping the CSV/pptx into a static
   `radar-data.ts`.
   - Pros: lowest effort; proven, already-shipped precedent; the requested
     AboutModal reuse becomes a near-literal copy+edit; smallest review
     surface.
   - Cons: diverges from `radar_tecnologico`'s current architecture
     (electricidad is a stale pre-v5 fork); conflicts with "faithfully reuse
     the architecture of the reference project"; no repeatable data pipeline;
     no automated tests/Storybook; leaves three sibling radars on three
     different architectures.
   - Effort: Low–Medium

3. **Hybrid** (recommended): base the new app on the current v5
   `radar_tecnologico` skeleton (core/, ingest-xlsx pipeline,
   Header/Footer/i18n/Storybook) for architecture fidelity, but port
   `AboutModal.tsx` from electricidad essentially verbatim (content-only
   edits) — justified because that file is confirmed byte-for-byte identical
   in both repos today and untouched by the v5 schema migration.
   - Pros: satisfies both explicit requirements (architecture fidelity to the
     reference project + authorship-pattern fidelity to electricidad) without
     a real tradeoff, since the two constraints apply to non-overlapping
     parts of the codebase; converges the sibling radars toward one
     architecture over time. The manual línea→ring/TRL curation step is
     unavoidable in any approach.
   - Cons: still inherits Approach 1's setup cost for the ingest/core
     pipeline; needs a small compatibility check that v5's current
     `globals.css`/theme tokens still match the classes hard-coded in the
     ported `AboutModal.tsx` (verified low-risk today, should be re-checked at
     implementation time).
   - Effort: Medium–High

## Recommendation

Approach 3 (hybrid). It resolves the open "target output format" question in
`openspec/config.yaml` in favor of a Next.js generator app (not a static
docx/pdf), matching both siblings, while reusing electricidad's
`AboutModal.tsx` near-verbatim per the user's explicit instruction.

## Risks

- Manual TRL/ring/impact/horizon inference for 25 líneas from long narrative
  text (no structured columns) is the single largest content-curation effort
  and a source of subjective error; needs an explicit, documented heuristic in
  `sdd-design` (electricidad set the precedent of doing this by hand).
- `SUBLÍNEAS TECNOLÓGICAS` (75) and the full `PRINCIPALES TENDENCIAS`
  narrative have no ready home in the existing `RadarItem`/`TechDetail` UI;
  dumping raw multi-thousand-character text into `description` will break
  layout — needs a UX decision (truncate/expand, or a new panel).
- `ÁREAS TECNOLÓGICAS` is an extra taxonomy tier the schema doesn't model;
  needs an explicit decision (fold into sector or drop) before `sdd-spec`.
- Time-horizon inconsistency: source pptx says "Prospectiva 2026–2036" while
  both existing radars brand "2025-2035" — must decide and confirm before
  writing copy/exports (filenames like `Radar_Tecnologico_CEET_2025-2035.png`
  are hard-coded in `RadarTemplate.tsx` and would need an Electronics-specific
  equivalent).
- No source content exists yet for "Mapa de trayectoria tecnológica"
  (confirmed empty slide 10) — must ship as an explicit, honest placeholder,
  never fabricated data.
- Author full-name spelling discrepancy between the user's task text (Pulido
  Casallas / Limas Ramirez) and the pptx (Pulido / Limas) — user's task text
  is authoritative; confirm before finalizing About modal copy if any doubt
  remains.

## Ready for Proposal

Yes — architecture direction, data-mapping approach, authorship content, and
the trajectory-map placeholder strategy are resolved enough to proceed to
`sdd-propose`, provided the open risks above (ring/TRL inference heuristic,
sublíneas/tendencias UX, áreas tecnológicas modeling, horizon-year branding)
are called out as explicit decisions in that phase.
