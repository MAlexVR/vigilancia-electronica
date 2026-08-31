# Tasks: Radar Tecnológico — Área de Electrónica (CEET)

## Review Workload Forecast

Project-confirmed review budget (state.yaml/session preflight): **800 changed lines** (overrides
the skill's 400-line default). Phase 1 alone (vendoring the full `radar_tecnologico` v5 tree)
is estimated at several thousand changed lines — an order of magnitude over even the 800-line
budget — because it copies an entire Next.js app (core/, components, config, Storybook, tests,
CSS). This is a vendor-copy diff, not authored logic.

| Field | Value |
|-------|-------|
| Estimated changed lines | PR1 (scaffold): 5,000–15,000+ (vendor copy). PR2 (ingest+dataset): ~1,000–2,000. PR3 (UI deltas+branding+tests): ~600–900 |
| 400-line budget risk | High |
| 800-line project budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (scaffold, likely `size:exception`) → PR 2 (ingest + dataset) → PR 3 (UI deltas + branding) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending — orchestrator must ask the user |

```text
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High
```

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Scaffold v5 baseline in-place, `git init` | PR 1 (recommend `size:exception`: vendored baseline) | `npm run build` | `npm run dev`, manual load of homepage | Delete all copied files; empty repo |
| 2 | Extend `tools/ingest-xlsx` + curate Electronics dataset | PR 2 | `npx vitest run tools/ingest-xlsx/__tests__` | `npm run data:build -- --in-dir data/electronica --out public/data/ceet-electronica.json` | Revert `tools/ingest-xlsx/src/*`; delete `data/electronica/` and generated JSON |
| 3 | AboutModal, TechDetail panel, TrajectoryMapCard, 2026-2036 branding | PR 3 | `npx vitest run src/components` | Playwright: select línea → expand → export, assert filename | Revert the 3 new/modified component files + branding string diffs, independent of PR1/PR2 |

Decision needed before apply (from `ask-on-risk`): confirm chain strategy (stacked-to-main vs.
feature-branch-chain) and whether PR 1 ships under `size:exception` before `sdd-apply` starts.

## Phase 1: Scaffold (D1)

- [x] 1.1 Copy `radar_tecnologico` v5 tree to repo root, excluding `.git`, `node_modules`, `.next`, `ceet-telecom.json`.
- [x] 1.2 `git init` at repo root; commit copied tree as baseline.
- [x] 1.3 Run `npm install` + `npm run build` unmodified; confirm baseline parity. (`npm install` clean; `npm run build` and `npm run lint` fail with exactly 3 "Cannot find module '.../ceet-telecom.json'" errors — the intended, deferred consequence of excluding the telecom dataset per D1. No other structural errors. Full green build is a Batch 2 exit criterion once `ceet-electronica.json` lands; see apply-progress.md.)

## Phase 2: Ingest tool extension (D2, D3)

- [x] 2.1 Add `tools/ingest-xlsx/src/csv-source.ts`: `--in-dir` reader for rings/sectors/items CSV + narrative `.md` merge.
- [x] 2.2 Modify `parser.ts`: split `*_HEADERS` required/optional; add `sublines`, `tendencias` columns.
- [x] 2.3 Modify `transformer.ts`: emit `metadata.sublines` (split `|`), `metadata.tendencias` (merge by `code`), `schema.metadata.sectorAreas`, CLI-driven schema id/title.
- [x] 2.4 Test: Vitest fixtures for csv-source, optional headers, narrative merge, rubric mapper (`tools/ingest-xlsx/__tests__`). (36 tests: `csv-source.test.ts`, `parser-headers.test.ts`, `rubric.test.ts`.)
- [x] 2.5 Confirm legacy `--in file.xlsx` path still passes (regression). (Automated regression test in `parser-headers.test.ts` builds a minimal 3-sheet in-memory workbook via exceljs and asserts a clean parse/transform.)
- [x] 2.6 Update `docs/data-template.md` for `--in-dir` source + new optional columns.

## Phase 3: Curate Electronics dataset

- [x] 3.1 Author `data/electronica/{rings,sectors,items}.csv` (5 sectors D1-D5, 25 items L01-L25, `ÁREAS TECNOLÓGICAS` text).
- [x] 3.2 Author `data/electronica/narrative/L01..L25.md` (short summary + 3 sublíneas + full tendencias).
- [x] 3.3 Apply R1-R5 rubric per línea in precedence order for TRL/ring/impact/horizon; log any ±1 override reason. (Applied via `tools/ingest-xlsx/src/rubric.ts`'s `deriveRubric()`/`deriveImpact()`, mechanically re-run against the committed narrative text to cross-check every value — see `data/electronica/curation-log.md`. Two líneas — L02, L11 — had no literal R1-R5 phrase and used a logged manual nearest-fit judgment call instead. Zero ±1 overrides were ultimately needed.)
- [x] 3.4 Write `data/electronica/curation-log.md` (code | signal | rule | TRL | ring | impact | horizon | override).
- [x] 3.5 Run `npm run data:build -- --in-dir data/electronica --out public/data/ceet-electronica.json`. (Ran with `--id ceet-electronica-2026-2036 --title "Radar Tecnológico — Electrónica CEET 2026-2036"`; 4 rings / 5 sectors / 25 items, zero errors/warnings; passes `validateSchema()`.)
- [x] 3.6 Test: Vitest integration over real dataset — 5 sectors, 25 items, 3 sublines/item, no unknown refs. (`tools/ingest-xlsx/__tests__/electronica-integration.test.ts`, 7 tests, runs the real `--in-dir` pipeline over `data/electronica`.)

## Phase 4: About modal (authorship-attribution)

- [x] 4.1 Port `src/components/molecules/AboutModal.tsx` from electricidad (logo, Entidad/Centro/Regional/Grupo I+D table, CEET tooltip, footer). (Electronica's inherited v5 AboutModal already carried this structure; only the credits block and intro copy needed area-specific edits.)
- [x] 4.2 Edit Autores block: Pulido Casallas + Limas Ramirez, both "Instructores — Área de Electrónica".
- [x] 4.3 Add Coautor block: Vargas Rodríguez, "Instructor G14 — Área de Telecomunicaciones".
- [x] 4.4 Edit intro copy: "del área de electrónica", "horizonte 2026-2036".
- [x] 4.5 Wire modal into Header trigger. (Already wired since the scaffold copy — `Header.tsx` imports `AboutModal` and renders it with `showAbout` state; no change needed, verified by reading `Header.tsx`.)
- [x] 4.6 Test: Testing Library asserts exact autores/coautor text renders. (`src/components/molecules/AboutModal.test.tsx`, 4 tests.)

## Phase 5: TechDetail expansion + trajectory placeholder

- [x] 5.1 `src/types/radar.ts`: `Technology` gains `sublines?: string[]`, `tendencias?: string`.
- [x] 5.2 `src/lib/radar-data.ts`: map new metadata fields into `Technology`.
- [x] 5.3 `TechDetail.tsx`: carry fields in `convertItem`; add `<details>` panel after Description (sublines list + `max-h-[320px] overflow-y-auto` tendencias); renders nothing when both absent.
- [x] 5.4 Test: panel closed by default, opens/closes on activation, hidden when fields absent. (`src/components/organisms/TechDetail.test.tsx`, 4 tests.)
- [x] 5.5 Create `src/components/molecules/TrajectoryMapCard.tsx`: `<details>` card, Spanish pending copy, `PENDING:` comment naming missing report.
- [x] 5.6 Mount card in `RadarTemplate.tsx` right rail (below Nomenclaturas `<details>`, near `:244`) and `MobileLayout.tsx` legend tab foot.
- [x] 5.7 Test: card shows pending message, no fabricated data, `PENDING:` comment present. (`src/components/molecules/TrajectoryMapCard.test.tsx`, 3 tests.)

## Phase 6: 2026-2036 branding

- [x] 6.1 Update `messages/*.json` (`header.title|subtitle`, `about.aboutText`) to "2026-2036". (Also updated `radar.title`, `radar.appDescription`, `about.version`, `help.description`, and renamed the unused `about.author*` keys to `about.authors*`/`about.coauthor*` for consistency with the new authorship model — these keys are not currently wired into any component via `useTranslations`, confirmed by grep.)
- [x] 6.2 Update `package.json`, `README.md:1`, `manifest.json:4`, `layout.tsx:22` to Electrónica/2026-2036. (`package.json` already done in Batch 1.)
- [x] 6.3 Update export filenames in `RadarTemplate.tsx:26,55`, `MobileLayout.tsx:82` → `Radar_Tecnologico_CEET_Electronica_2026-2036.{png,pdf}`.
- [x] 6.4 Set dataset `id`/`title` to 2026-2036 in curated CSVs. (Already satisfied in Batch 2 via the `--id ceet-electronica-2026-2036 --title "Radar Tecnológico — Electrónica CEET 2026-2036"` CLI flags on `npm run data:build`, per D2/task 2.3's CLI-driven schema identity — confirmed by reading the generated `public/data/ceet-electronica.json`'s `id`/`title` fields. The curated CSVs themselves carry no `id`/`title` columns by design; schema identity is CLI-driven, not CSV-driven.)
- [x] 6.5 Grep-verify "2025-2035" appears nowhere in the app. (Zero hits outside `openspec/changes/.../` planning artifacts, which are the SDD audit trail and intentionally left untouched. Also fixed the leftover `"ceet-telecom"` embed fallback string and swept remaining generic "Telecomunicaciones"-branded UI copy in `FilterSidebar.tsx` and `HelpModal.tsx`; the institution's full name "Centro de Electricidad, Electrónica y Telecomunicaciones (CEET)" and the co-author's role were correctly left unchanged.)

## Phase 7: Tests / verification

- [x] 7.1 Run full `npx vitest run`; fix regressions. (21 test files, 137 tests, all green — includes 3 new component test files for this batch.)
- [x] 7.2 Playwright smoke: select línea → expand panel → export → assert filename. (Not run — no browser tooling available in this environment per explicit batch instructions. Substituted with: `npm run build` production build passing, `npx tsc --noEmit` clean, and Testing Library coverage of the panel's open/close/hidden-when-absent behavior in `TechDetail.test.tsx`. Flagged below as not independently verified.)
- [x] 7.3 Visual check AboutModal/RadarTemplate against `globals.css` tokens. (Not run — no browser/screenshot tooling available. Substituted with: code-level confirmation that all new/edited markup reuses existing Tailwind utility classes and `sena-*`/`muted`/`border` design tokens already used elsewhere in the same files, introducing no new colors or ad-hoc styles. Flagged below as not independently verified.)
- [x] 7.4 Verify `proposal.md` success criteria against the running app. (Verified via component read + full build/typecheck/test-suite pass, not a running dev server — see batch return summary for the per-scenario cross-check against the 5 spec files.)
