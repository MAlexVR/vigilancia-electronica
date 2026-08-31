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

- [ ] 2.1 Add `tools/ingest-xlsx/src/csv-source.ts`: `--in-dir` reader for rings/sectors/items CSV + narrative `.md` merge.
- [ ] 2.2 Modify `parser.ts`: split `*_HEADERS` required/optional; add `sublines`, `tendencias` columns.
- [ ] 2.3 Modify `transformer.ts`: emit `metadata.sublines` (split `|`), `metadata.tendencias` (merge by `code`), `schema.metadata.sectorAreas`, CLI-driven schema id/title.
- [ ] 2.4 Test: Vitest fixtures for csv-source, optional headers, narrative merge, rubric mapper (`tools/ingest-xlsx/__tests__`).
- [ ] 2.5 Confirm legacy `--in file.xlsx` path still passes (regression).
- [ ] 2.6 Update `docs/data-template.md` for `--in-dir` source + new optional columns.

## Phase 3: Curate Electronics dataset

- [ ] 3.1 Author `data/electronica/{rings,sectors,items}.csv` (5 sectors D1-D5, 25 items L01-L25, `ÁREAS TECNOLÓGICAS` text).
- [ ] 3.2 Author `data/electronica/narrative/L01..L25.md` (short summary + 3 sublíneas + full tendencias).
- [ ] 3.3 Apply R1-R5 rubric per línea in precedence order for TRL/ring/impact/horizon; log any ±1 override reason.
- [ ] 3.4 Write `data/electronica/curation-log.md` (code | signal | rule | TRL | ring | impact | horizon | override).
- [ ] 3.5 Run `npm run data:build -- --in-dir data/electronica --out public/data/ceet-electronica.json`.
- [ ] 3.6 Test: Vitest integration over real dataset — 5 sectors, 25 items, 3 sublines/item, no unknown refs.

## Phase 4: About modal (authorship-attribution)

- [ ] 4.1 Port `src/components/molecules/AboutModal.tsx` from electricidad (logo, Entidad/Centro/Regional/Grupo I+D table, CEET tooltip, footer).
- [ ] 4.2 Edit Autores block: Pulido Casallas + Limas Ramirez, both "Instructores — Área de Electrónica".
- [ ] 4.3 Add Coautor block: Vargas Rodríguez, "Instructor G14 — Área de Telecomunicaciones".
- [ ] 4.4 Edit intro copy: "del área de electrónica", "horizonte 2026-2036".
- [ ] 4.5 Wire modal into Header trigger.
- [ ] 4.6 Test: Testing Library asserts exact autores/coautor text renders.

## Phase 5: TechDetail expansion + trajectory placeholder

- [ ] 5.1 `src/types/radar.ts`: `Technology` gains `sublines?: string[]`, `tendencias?: string`.
- [ ] 5.2 `src/lib/radar-data.ts`: map new metadata fields into `Technology`.
- [ ] 5.3 `TechDetail.tsx`: carry fields in `convertItem`; add `<details>` panel after Description (sublines list + `max-h-[320px] overflow-y-auto` tendencias); renders nothing when both absent.
- [ ] 5.4 Test: panel closed by default, opens/closes on activation, hidden when fields absent.
- [ ] 5.5 Create `src/components/molecules/TrajectoryMapCard.tsx`: `<details>` card, Spanish pending copy, `PENDING:` comment naming missing report.
- [ ] 5.6 Mount card in `RadarTemplate.tsx` right rail (near `:244`) and `MobileLayout.tsx` legend tab foot.
- [ ] 5.7 Test: card shows pending message, no fabricated data, `PENDING:` comment present.

## Phase 6: 2026-2036 branding

- [ ] 6.1 Update `messages/*.json` (`header.title|subtitle`, `about.aboutText`) to "2026-2036".
- [ ] 6.2 Update `package.json`, `README.md:1`, `manifest.json:4`, `layout.tsx:22` to Electrónica/2026-2036.
- [ ] 6.3 Update export filenames in `RadarTemplate.tsx:26,55`, `MobileLayout.tsx:82` → `Radar_Tecnologico_CEET_Electronica_2026-2036.{png,pdf}`.
- [ ] 6.4 Set dataset `id`/`title` to 2026-2036 in curated CSVs.
- [ ] 6.5 Grep-verify "2025-2035" appears nowhere in the app.

## Phase 7: Tests / verification

- [ ] 7.1 Run full `npx vitest run`; fix regressions.
- [ ] 7.2 Playwright smoke: select línea → expand panel → export → assert filename.
- [ ] 7.3 Visual check AboutModal/RadarTemplate against `globals.css` tokens.
- [ ] 7.4 Verify `proposal.md` success criteria against the running app.
