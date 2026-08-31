# Design: Radar Tecnológico — Área de Electrónica (CEET)

## Technical Approach

Fork the `radar_tecnologico` v5 tree in-place at the repo root, keep `src/core/` + the
`radar-data.ts` legacy adapter untouched, and carry all Electronics-specific content through the
existing free-form `metadata` bags. Only three UI files gain behaviour; everything else is
branding text.

## Architecture Decisions

| # | Decision | Choice | Rejected | Rationale |
|---|---|---|---|---|
| D1 | Scaffolding | Copy the reference tree (minus `.git`, `node_modules`, `.next`, `ceet-telecom.json`), then `git init` + baseline commit | `create-next-app` + re-add Tailwind v4 `@theme`, shadcn, next-intl, Storybook, Vitest, Playwright | Fidelity is the requirement; rewiring 8 toolchains by hand guarantees drift. Copy is byte-identical and reviews as one vendored baseline. |
| D2 | Curated intermediate | Text-first: `data/electronica/{rings,sectors,items}.csv` + `narrative/L01..L25.md` | Hand-built 3-sheet `.xlsx`; hand-authored `RadarSchema` JSON | Source xlsx is a 27×8 single-sheet dump, so curation is mandatory either way. A binary intermediate is not diff-reviewable, and the 25 subjective ring/TRL calls are exactly what the user must review. Hand-written JSON loses the pipeline. |
| D3 | Ingest tool | Extend the fork with a `--in-dir` CSV source + optional headers; keep `--in file.xlsx` working | Bespoke replacement script | The institutional team keeps Excel; agents author text. |
| D4 | Áreas tecnológicas | `schema.metadata.sectorAreas: Record<SectorId, string>` | New `RadarSector.description` field | `RadarSector` has no description; `metadata` is the existing bag, so no schema change. |
| D5 | Sublíneas / tendencias | `item.metadata.sublines: string[]` (3) + `item.metadata.tendencias: string` | Long text in `description` | 2,000+ char cells break the `TechDetail` layout. `description` keeps a ≤240-char summary. |
| D6 | Trajectory placeholder | New `molecules/TrajectoryMapCard.tsx`; a `<details>` card in the desktop right rail below Nomenclaturas and at the foot of MobileLayout's `legend` tab | Header modal (5th button); 5th mobile tab | Reuses the right rail's existing `<details>/<summary>` pattern (`RadarTemplate.tsx:244`). Header modals are app-meta (Help/About); this is radar content. Avoids `grid-cols-4` → 5 crowding. |
| D7 | Testing | Keep inherited Vitest; unit-test the CSV source, the rubric mapper, and the panel. No strict TDD over ported code | Full strict TDD | Supersedes `config.yaml testing.strict_tdd: false`, which asked for re-evaluation once a generator app existed. |

## Data Flow

    docs/*.xlsx|pptx (read-only)
         │  manual curation + rubric (below)
         ▼
    data/electronica/{rings,sectors,items}.csv + narrative/L01..L25.md
    data/electronica/curation-log.md   ← 25-row user review surface
         │  npm run data:build -- --in-dir data/electronica --out public/data/ceet-electronica.json
         ▼
    public/data/ceet-electronica.json  (RadarSchema)
         │  src/lib/radar-data.ts (adapter, unchanged shape)
         ▼
    RadarTemplate ─→ RadarChart / TechDetail / NomenclatureTable / TrajectoryMapCard

## Curation Rubric (ring / TRL / impact / horizon)

Applied per línea by `sdd-apply`, in strict precedence order; every decision is logged.

| Rule | Narrative signal (case-insensitive) | TRL | Horizon |
|---|---|---|---|
| R1 | Explicit `TRL <n>` / `TRL n-m` | `n` (upper bound) | from band |
| R2 | `ESTABLE`, `MADURA`, `CONSOLIDADA`, `adopción masiva` | 9 | Corto (1-2 años) |
| R3 | `ALZA FUERTE`, `crecimiento acelerado`, `corto plazo <3 años` | 7 | Corto (1-3 años) |
| R4 | `EN CRECIMIENTO`, `piloto`, `mediano plazo (3-5 años)` | 5 | Medio (3-5 años) |
| R5 | `SEÑAL DÉBIL`, `EMERGENTE`, `TRL temprano`, `largo plazo >5 años` | 2 | Largo (5-10 años) |

- **Ring is derived, never guessed**: TRL 8-9 → `adopt`; 6-7 → `trial`; 4-5 → `assess`; 1-3 → `monitor`.
- **Impact**: `Disruptivo` if the text says disrup*/transform*/paradigma; `Alto` if it names cross-sector or explicit alto impacto; else `Medio`.
- **Override**: at most ±1 ring, only when the narrative names a regulatory/market blocker, and the reason MUST be logged.
- **`angleOff`**: 5 items per 72° sector at `-26, -13, 0, +13, +26`, in L-code order.
- **`curation-log.md`**: one row per línea — `code | quoted signal | rule | TRL | ring | impact | horizon | override reason`.

## File Changes

| File | Action | Description |
|---|---|---|
| repo root (forked tree) | Create | v5 baseline per D1; `git init` |
| `data/electronica/*.csv`, `narrative/L01..L25.md`, `curation-log.md` | Create | Curated intermediate + audit log |
| `tools/ingest-xlsx/src/csv-source.ts` | Create | `--in-dir` reader → 3 named sheets |
| `tools/ingest-xlsx/src/parser.ts` | Modify | Split `*_HEADERS` required/optional; add `sublines`, `tendencias` |
| `tools/ingest-xlsx/src/transformer.ts` | Modify | Emit `metadata.sublines` (split `\|`), `metadata.tendencias` (merge by `code`), `schema.metadata.sectorAreas`, schema identity from CLI flags |
| `public/data/ceet-electronica.json` | Create | Generated dataset (5 sectors / 25 items) |
| `src/types/radar.ts` | Modify | `Technology` gains `sublines?`, `tendencias?` |
| `src/lib/radar-data.ts` | Modify | Import Electronics JSON; map the two new fields |
| `src/components/organisms/TechDetail.tsx` | Modify | Same fields in `convertItem`; collapsed panel after Description |
| `src/components/molecules/AboutModal.tsx` | Create | Ported from electricidad; `Autores:` block |
| `src/components/molecules/TrajectoryMapCard.tsx` | Create | Placeholder + `PENDING:` comment |
| `src/components/templates/RadarTemplate.tsx`, `MobileLayout.tsx` | Modify | Mount the card; export filenames |
| `messages/*.json`, `package.json`, `README.md`, `public/manifest.json`, `src/app/layout.tsx` | Modify | `2026-2036` + Electrónica branding |
| `docs/data-template.md` | Modify | Document the `--in-dir` source and new optional columns |

## Interfaces / Contracts

```ts
// item.metadata (free-form bag — no RadarItem schema change)
{ impact: string; horizon: string; sublines: string[]; tendencias: string }
// schema.metadata
{ sectorAreas: Record<SectorId, string>; horizonLabel: "2026-2036" }
```

**TechDetail panel**: native `<details>`, closed by default, chevron + uppercase label matching
`RadarTemplate.tsx:244`; renders the 3 sublíneas as a list then `tendencias` in a
`max-h-[320px] overflow-y-auto` block. Renders nothing when both fields are absent.

**AboutModal delta** vs. electricidad: `Autora:` → `Autores:` with `Ing. Óscar Andrés Pulido
Casallas` + `Ing. Diana Cristina Limas Ramirez` / `Instructores — Área de Electrónica`; coautor
block verbatim; intro says `del área de electrónica`, `horizonte 2026-2036`.

**`2026-2036` sites** (reference grep): `messages/es.json` `header.title|subtitle`,
`about.aboutText` (+ locale mirrors); `package.json`; `README.md:1`; `manifest.json:4`;
`layout.tsx:22`; `AboutModal.tsx`; `MobileLayout.tsx:82`; `RadarTemplate.tsx:26,55` →
`Radar_Tecnologico_CEET_Electronica_2026-2036.{png,pdf}`; dataset `id`/`title`.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | CSV source, optional headers, narrative merge, rubric→ring/TRL mapper | Vitest fixtures in `tools/ingest-xlsx/__tests__` |
| Unit | Panel renders/hides; `TrajectoryMapCard` copy | Testing Library |
| Integration | `data:build` yields 5 sectors / 25 items, no unknown refs | Vitest over real `data/electronica` |
| E2E | Select línea → expand → export filename | Inherited Playwright smoke |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or
process-integration boundary. `data:build` is a developer-invoked local file transform; the app is
static-rendered with no server input.

## Migration / Rollout

No migration (greenfield). Three chained PR slices to respect the 800-line budget: (1) forked
baseline + `git init`, (2) ingest extension + dataset, (3) UI deltas. Rollback = delete generated
files; `docs/` is opened read-only and never written.

## Open Questions

- [ ] Author surname spelling (`Pulido Casallas` / `Limas Ramirez`) differs from the pptx cover; user's text is authoritative unless corrected.
- [ ] Sector colors/icons/`startAngle` for D1–D5 are not in the source — reuse telecom's five by convention?
