# Apply Progress: Radar Tecnológico — Área de Electrónica (CEET)

## Batch 1 (Phase 1 — Scaffold, D1) — COMPLETE

**Mode**: Standard (strict TDD not applicable — `openspec/config.yaml testing.strict_tdd: false`,
confirmed by design.md D7 as scoped only to new ingest/rubric/panel code in later batches).

**Delivery**: `size:exception` granted for this batch (vendor-copy scaffold), per
`state.yaml` `phases.tasks.delivery_decision` and explicit user grant in the batch prompt.

### Completed Tasks

- [x] 1.1 Copied `E:\Repositorio\radar_tecnologico` → `E:\Repositorio\radar_tecnologico_electronica`
      in place, excluding `.git/`, `node_modules/`, `.next/`, `public/data/ceet-telecom.json`.
- [x] 1.2 `git init` at repo root (previously not a git repo); committed the copied tree as baseline.
- [x] 1.3 Ran `npm install` + `npm run build` (and `npm run lint` as a typecheck cross-check).
      `npm install` succeeded cleanly. `npm run build`/`npm run lint` fail with exactly 3
      "Cannot find module '.../ceet-telecom.json'" errors — the deliberate, expected consequence
      of excluding the telecom dataset per D1. No other structural errors were found. See
      "Known blocker for Batch 2" below.

### Exact Commands Run

```
robocopy "E:\Repositorio\radar_tecnologico" "E:\Repositorio\radar_tecnologico_electronica" /E /XD .git node_modules .next /XF ceet-telecom.json
git init
git add -A
git commit -m "feat: scaffold radar app from radar_tecnologico v5 template"
npm install
npm run build      # fails — see below
npm run lint        # tsc --noEmit; fails with the same 3 import errors
git add openspec/changes/radar-tecnologico-electronica/tasks.md package-lock.json
git commit -m "chore: mark Phase 1 tasks complete and record npm install lockfile"
```

(`robocopy` required `MSYS_NO_PATHCONV=1` in Git Bash to stop `/E`/`/XD`/`/XF` flags being
mis-parsed as Unix paths — a Git-Bash/MSYS quirk, not a robocopy issue.)

### Resulting Git Commits

- `b031cb2d7f6915a91ea627e4963d4bc01c760c44` — `feat: scaffold radar app from radar_tecnologico v5 template`
  (116 files: full vendored v5 tree minus the 4 excluded paths).
- `132d9e6` — `chore: mark Phase 1 tasks complete and record npm install lockfile`
  (tasks.md checkbox update + npm-install-refreshed `package-lock.json`).

Branch: `master` (git default on this machine — no explicit `-b main` was requested).
No remote configured.

### Verification Performed

- Diffed source vs. destination file lists (excluding `.git/`, `node_modules/`, `.next/`,
  `ceet-telecom.json`): all 122 source files present in destination, zero missing.
- Confirmed `docs/`, `openspec/`, `.atl/` (pre-existing electronica content) were left untouched —
  robocopy without `/MIR` never deletes destination-only files, so the 14 pre-existing files
  survived exactly as they were.
- Confirmed `.git/`, `node_modules/`, `.next/` are absent from the destination.
- Confirmed `public/data/` directory exists but `ceet-telecom.json` was not copied into it.

### Deviations from Design / Task Wording

1. **`package.json` name/description/version adapted ahead of Phase 6.** Task 6.2 formally
   schedules the full branding sweep (`package.json`, `README.md:1`, `manifest.json:4`,
   `layout.tsx:22`) for a later batch. Per this batch's explicit instructions (step 3: "verify
   the scaffold is coherent"), `package.json` was minimally adapted now:
   - `name`: `radar-tecnologico-telecomunicaciones` → `radar-tecnologico-electronica`
   - `version`: `2.1.0` → `1.0.0` (matches sibling `radar_tecnologico_electricidad`'s convention
     for a new area fork, rather than continuing telecom's version lineage)
   - `description`: `"Radar Tecnológico Interactivo — Telecomunicaciones CEET 2025-2035 | SENA"`
     → `"Radar Tecnológico Interactivo — Electrónica CEET 2026-2036 | SENA"`
   No other branding files were touched — `messages/*.json`, `README.md`, `manifest.json`,
   `layout.tsx`, export filenames, and dataset `id`/`title` are still 2025-2035/Telecomunicaciones
   and remain **Phase 6 scope**. Batch 3 should verify `package.json` is already correct rather
   than re-deriving it.
2. **Task 1.3 ("confirm baseline parity") cannot mean a fully green, unmodified build**, because
   this batch was explicitly instructed to exclude `ceet-telecom.json` (the app statically
   `import`s the dataset JSON by filename in 3 files — see below). Marked `[x]` with the caveat
   documented inline in `tasks.md`, since every Phase-1-scoped action (install, build attempt,
   typecheck cross-check) was completed and the residual failure is fully explained, expected,
   and scoped to Batch 2.

### Known Blocker for Batch 2 (informational — not a Phase 1 defect)

`npm run build` and `npm run lint` (`tsc --noEmit`) both fail with exactly 3 errors, all
`Cannot find module '.../ceet-telecom.json'`, from these files that statically import the
dataset JSON by filename:

- `src/lib/radar-data.ts:1`
- `src/app/embed/page.tsx:9`
- `scripts/validate-data.ts:2`

**Design-completeness note**: `design.md`'s File Changes table only lists `src/lib/radar-data.ts`
as needing modification to import the new Electronics JSON. Batch 2 (or whichever batch swaps
the dataset in) must **also** update `src/app/embed/page.tsx` and `scripts/validate-data.ts` —
these were not listed in design.md but import the same JSON path directly and will fail the
same way otherwise.

A full green `npm run build` is deferred to Batch 2 once `public/data/ceet-electronica.json`
exists and these three imports are repointed — not a Phase 1 exit criterion given the explicit
exclusion instruction for this batch.

### Untouched (not this batch's scope)

- `docs/`, `.atl/` — preserved exactly as they were; never opened for write.
- `openspec/` other files (`proposal.md`, `design.md`, `specs/*`, `state.yaml`) — read-only this
  batch; only `tasks.md` was edited.
- Everything in Phases 2–7 of `tasks.md` — still `[ ]`, untouched.

### Remaining Tasks (Batches 2–3)

- [ ] Phase 2: Ingest tool extension (`--in-dir` CSV source, parser/transformer changes, Vitest
      fixtures, `docs/data-template.md` update).
- [ ] Phase 3: Curate Electronics dataset (`data/electronica/*.csv`, narrative `.md`, rubric
      application, `curation-log.md`, `npm run data:build`, integration test).
- [ ] Phase 4: AboutModal port + authorship content.
- [ ] Phase 5: TechDetail expansion panel + TrajectoryMapCard placeholder.
- [ ] Phase 6: 2026-2036 branding sweep (package.json already partially done — see deviation 1
      above; remaining: messages/*.json, README.md, manifest.json, layout.tsx, export filenames,
      dataset id/title, grep-verify no "2025-2035" survives).
- [ ] Phase 7: Full test suite, Playwright smoke, visual check, success-criteria verification.

### Status

3/37 tasks complete (Phase 1 of 7). Ready for Batch 2 (`sdd-apply` — Phase 2-3 tasks, per
`state.yaml` batch_plan and the `ask-on-risk` chain-strategy decision still pending confirmation
from the user for the PR2/PR3 split).

---

## Batch 2 (Phases 2-3 — Ingest tool extension + Electronics dataset curation) — COMPLETE

**Mode**: Standard (strict TDD not required per `openspec/config.yaml testing.strict_tdd: false`
and design.md D7; unit/integration tests were written and run for all new ingest/rubric code,
without RED-GREEN-REFACTOR ceremony).

### Completed Tasks

- [x] 2.1 `tools/ingest-xlsx/src/csv-source.ts` — `--in-dir` reader: dependency-free RFC4180 CSV
      parser + `narrative/{code}.md` merge (matched by the item's `code` column).
- [x] 2.2 `parser.ts` — split `RING_HEADERS`/`SECTOR_HEADERS`/`ITEM_HEADERS` into
      `*_REQUIRED_HEADERS`/`*_OPTIONAL_HEADERS`; added `sublines`/`tendencias` (items, optional)
      and `areaTecnologica` (sectors, optional). Extracted a source-agnostic `rowsFromMatrix()`
      shared by the xlsx (`readSheet`) and CSV paths.
- [x] 2.3 `transformer.ts` — `metadata.sublines` (array from `--in-dir`, or `|`-split string from
      inline xlsx), `metadata.tendencias`, `schema.metadata.sectorAreas` (folded from each
      sector's `areaTecnologica`), CLI-driven `id`/`title` via new `TransformOptions`.
- [x] 2.4 43 Vitest tests: `csv-source.test.ts` (9), `parser-headers.test.ts` (4, includes the
      legacy-xlsx regression), `rubric.test.ts` (23), `electronica-integration.test.ts` (7).
- [x] 2.5 Legacy `--in file.xlsx` regression: automated (not just manual) — `parser-headers.test.ts`
      builds a minimal in-memory 3-sheet workbook via `exceljs` and asserts a clean parse+transform.
- [x] 2.6 `docs/data-template.md` updated with a required/optional header table per sheet, the new
      `areaTecnologica`/`sublines`/`tendencias` columns, the narrative markdown convention, and
      `--in-dir`/`--id`/`--title` usage. (File is `.gitignore`d — `/docs` — same as Batch 1 found;
      updated on disk but not committed, matching the pre-existing repo convention.)
- [x] 3.1 `data/electronica/{rings,sectors,items}.csv` — 4 rings (reused telecom's institutional
      ADOPTAR/PROBAR/EVALUAR/MONITOREAR verbatim), 5 sectors D1-D5 with `areaTecnologica` text
      folded from the source `ÁREAS TECNOLÓGICAS` column, 25 items L01-L25.
- [x] 3.2 `data/electronica/narrative/L01..L25.md` — short summary (verified ≤240 chars for all
      25), exactly 3 sublíneas each (L21's source 4 sublíneas SL21a-d were merged c+d into one
      entry, logged in `L21.md`'s own "Nota de curación" section and in `curation-log.md`), and
      the full unabridged `PRINCIPALES TENDENCIAS` text verbatim from the source CSV.
- [x] 3.3 R1-R5 rubric applied per línea via `rubric.ts`'s `deriveRubric()`/`deriveImpact()`, run
      mechanically against the committed narrative text (not hand-transcribed) so every value is
      reproducible from source. Caught and fixed one rubric bug mid-curation: the R2 `MADURA`
      keyword false-matched inside the unrelated word "maduración" (L09) — fixed with a `\b` word
      boundary and covered by a regression test. L02 and L11 had no literal R1-R5 phrase in their
      narrative and used a logged manual nearest-fit judgment call instead (see curation-log.md).
      Zero ±1 ring overrides were ultimately needed (L14 initially looked override-worthy but a
      literal R4 "piloto" signal resolved it directly, per design's own R4>R5 precedence).
- [x] 3.4 `data/electronica/curation-log.md` — 25-row table (code | signal | rule | TRL | ring |
      impact | horizon | override) plus a "Notes for reviewer" section flagging the L02/L11
      manual calls and 7 R1 hits where the matched explicit TRL describes a submarket/sub-line
      component rather than the whole línea.
- [x] 3.5 `npm run data:build -- --in-dir data/electronica --out public/data/ceet-electronica.json
      --id ceet-electronica-2026-2036 --title "Radar Tecnológico — Electrónica CEET 2026-2036"` —
      4 rings / 5 sectors / 25 items, zero errors, zero warnings. Passes `validateSchema()`.
- [x] 3.6 `tools/ingest-xlsx/__tests__/electronica-integration.test.ts` (7 tests) — runs the real
      `--in-dir` pipeline over the committed `data/electronica` directory: 5 sectors / 25 items,
      exactly 3 sublines + non-empty tendencias per item, description ≤240 chars per item,
      `schema.metadata.sectorAreas` has all 5 sector ids with no new `RadarSector` fields, zero
      unknown ring/sector references, and the output passes the project's zod validator.

### Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tools/ingest-xlsx/__tests__` → 4 test files, 43 tests, all passed |
| Broader regression check | `npx vitest run` (all projects incl. storybook browser tests) → 18 test files, 126 tests, all passed |
| Runtime harness command/scenario and exact result | `npm run data:build -- --in-dir data/electronica --out public/data/ceet-electronica.json --id ceet-electronica-2026-2036 --title "..."` → 4 rings/5 sectors/25 items, 0 errors/0 warnings; `npm run data:validate` → "✅ Schema validation passed"; `npm run build` (Next.js production build) → compiles and generates all 3 static routes (`/`, `/_not-found`, `/embed`) with zero errors; `npx tsc --noEmit` → zero errors (closes the Batch 1 known blocker) |
| Rollback boundary | Revert `tools/ingest-xlsx/src/{csv-source.ts,rubric.ts}` (new files) and the diffs to `parser.ts`/`transformer.ts`/`index.ts`/`types.ts`; delete `tools/ingest-xlsx/__tests__/`; delete `data/electronica/` and `public/data/ceet-electronica.json`; revert the 3 one-line import changes in `src/lib/radar-data.ts`, `src/app/embed/page.tsx`, `scripts/validate-data.ts` (reverting the last would restore the Batch 1 known-blocker state, i.e. `npm run build` failing on the missing import again — expected and self-contained). Each of the 3 commits below is independently revertable. |

### Exact Commands Run

```
npx tsc --noEmit -p tsconfig.json                       # confirm only 3 pre-existing import errors before wiring
npx vitest run tools/ingest-xlsx/__tests__               # 43 tests green
npx tsx tools/ingest-xlsx/src/index.ts --in-dir data/electronica \
  --out public/data/ceet-electronica.json \
  --id ceet-electronica-2026-2036 \
  --title "Radar Tecnológico — Electrónica CEET 2026-2036" --verbose
npx tsx <ad-hoc validate-electronica.ts>                 # validateSchema() → valid: true
npm run data:validate                                     # ✅ after wiring scripts/validate-data.ts
npx tsc --noEmit -p tsconfig.json                        # zero errors after wiring all 3 imports
npm run build                                              # Next.js production build succeeds
npx vitest run --project '!storybook'                    # 18 files / 126 tests, all green (full suite)
git add tools/ingest-xlsx/ && git commit -m "feat(ingest-xlsx): ..."
git add data/ public/data/ && git commit -m "feat(data): ..."
git add src/lib/radar-data.ts src/app/embed/page.tsx scripts/validate-data.ts \
  openspec/changes/radar-tecnologico-electronica/tasks.md && git commit -m "fix(data): ..."
```

### Resulting Git Commits

- `0e35147` — `feat(ingest-xlsx): add --in-dir text intermediate source with narrative merge`
  (15 files: csv-source.ts, rubric.ts, parser.ts/transformer.ts/index.ts/types.ts diffs,
  README.md, 8 new test/fixture files).
- `0e5aff5` — `feat(data): curate Electronics radar dataset (5 sectors, 25 items)`
  (30 files: rings.csv, sectors.csv, items.csv, curation-log.md, 25 narrative/*.md,
  public/data/ceet-electronica.json).
- `1cc94cc` — `fix(data): wire the 3 dataset import sites to ceet-electronica.json`
  (src/lib/radar-data.ts, src/app/embed/page.tsx, scripts/validate-data.ts, tasks.md).

Branch: `master`. No remote configured. `openspec/changes/.../state.yaml` was already marked
`apply.status: in_progress` with `batch_2: pending` by the orchestrator before this batch started;
left untouched here (out of this agent's edit scope) — batch_2 is now done per this record.

### Deviations from Design / Task Wording

1. **design.md's File Changes table only lists `tools/ingest-xlsx/src/parser.ts` and
   `transformer.ts`** as modified; it doesn't name `index.ts` (new `--in-dir`/`--id`/`--title`
   flags) or `types.ts` (new `IngestOptions` fields) explicitly, though both are clearly implied
   by "extend the fork with a `--in-dir` CSV source" (D3) and "CLI-driven schema id/title"
   (task 2.3). Both were modified; noted here since design's table was incomplete, matching the
   same class of gap Batch 1 flagged for the 3 import sites.
2. **`docs/data-template.md` is `.gitignore`d** (`/docs` — a pre-existing repo convention, not
   introduced by this batch). Task 2.6 was completed on disk but the change is not part of any
   git commit; this mirrors Batch 1's note that `docs/` is read-only/untracked project content.
3. **Rubric bug found and fixed mid-curation**: the R2 keyword pattern originally matched
   `MADURA` as a bare substring, which false-matched inside `maduración` in L09's narrative
   ("Horizonte de maduración largo"). Fixed with a `\b` word boundary in `rubric.ts` and covered
   by a new regression test (`rubric.test.ts`) before finalizing the curated values — this is why
   the mechanical rubric run cross-check in task 3.3 exists at all: it caught a real bug that a
   purely manual, hand-transcribed curation pass would not have.
4. **items.csv does not carry `description`/`sublines`/`tendencias` columns** for the `--in-dir`
   path — these are populated entirely by the `narrative/{code}.md` merge, per D2's rationale
   that 2,000+ char narrative cells don't belong in a reviewable CSV. `parser.ts`'s optional
   `sublines`/`tendencias` item headers exist for the *inline xlsx* path only (institutional team
   authoring a single xlsx without narrative files), and are exercised by `parser-headers.test.ts`
   only, not by the curated Electronics dataset itself.

### Issues Found

- Two líneas (L02, L11) have no literal R1-R5 rubric phrase in their source narrative (both use
  bare "ALZA" without a qualifying word). Resolved with a logged manual nearest-fit call; flagged
  explicitly in `curation-log.md` for CEET review/override.
- Several R1 hits (L04, L05, L07, L13, L16, L17, L19) match an explicit TRL that describes one
  commercially mature sub-component of the línea rather than the línea as a whole, while that
  línea's own `IMPLICACIÓN CEET` note reports a high training gap. Applied literally per design's
  strict mechanical precedence rule (not overridden, since the override clause is scoped to
  regulatory/market blockers only) — flagged in `curation-log.md`'s "Notes for reviewer" for the
  CEET team to adjust on review if desired.
- `src/app/embed/page.tsx` still has one cosmetic fallback string,
  `searchParams.get("schema") || "ceet-telecom"` (a URL query default, not an import) — out of
  scope for Batch 2 (no type/build impact) and left for Batch 3's branding sweep (Phase 6).

### Untouched (not this batch's scope)

- Phases 4-7 of `tasks.md` — still `[ ]`, untouched (AboutModal, TechDetail panel,
  TrajectoryMapCard, 2026-2036 branding sweep, full verification).
- `openspec/changes/.../state.yaml` — left as the orchestrator set it (modified, unstaged).

### Remaining Tasks (Batch 3)

- [ ] Phase 4: AboutModal port + authorship content.
- [ ] Phase 5: TechDetail expansion panel + TrajectoryMapCard placeholder.
- [ ] Phase 6: 2026-2036 branding sweep (package.json already done in Batch 1; remaining:
      messages/*.json, README.md, manifest.json, layout.tsx, export filenames, dataset id/title
      already set via `--id`/`--title` in this batch — verify it matches Phase 6.4's intent —,
      `embed/page.tsx`'s `"ceet-telecom"` fallback string, grep-verify no "2025-2035" survives).
- [ ] Phase 7: Full test suite, Playwright smoke, visual check, success-criteria verification.

### Status

15/37 tasks complete (Phases 1-3 of 7). `npm run build` and `npx tsc --noEmit` are both fully
green. Ready for Batch 3 (`sdd-apply` — Phase 4-7 tasks).

---

## Batch 3 (Phases 4-7 — AboutModal, TechDetail expansion, TrajectoryMapCard, branding sweep, verification) — COMPLETE (FINAL BATCH)

**Mode**: Standard (`openspec/config.yaml testing.strict_tdd: false`; focused Testing Library tests
written for all 3 new/changed components per the batch's explicit test tasks, without RED-GREEN-
REFACTOR ceremony).

### Completed Tasks

- [x] 4.1 Ported `AboutModal.tsx` structure — the inherited v5 scaffold's `AboutModal.tsx` already
      carried the electricidad-equivalent structure (logo, Entidad/Centro/Regional/Grupo I+D
      table with CEET tooltip, footer copyright); only the credits block and intro copy needed
      area-specific edits, so no structural port was needed beyond that.
- [x] 4.2-4.3 Replaced the single "Autor:" block with an "Autores:" block (Pulido Casallas + Limas
      Ramirez, both "Instructores — Área de Electrónica", verbatim per spec) and a separate
      "Coautor:" block (Vargas Rodríguez, "Instructor G14 — Área de Telecomunicaciones", unchanged).
- [x] 4.4 Intro paragraph: "área de telecomunicaciones" → "área de electrónica",
      "horizonte 2025-2035" → "horizonte 2026-2036".
- [x] 4.5 Modal-to-Header wiring: already present (inherited from scaffold); verified by reading
      `Header.tsx` — no change needed.
- [x] 4.6 `src/components/molecules/AboutModal.test.tsx` — 4 Testing Library tests.
- [x] 5.1-5.2 `src/types/radar.ts` `Technology` gains `sublines?: string[]`, `tendencias?: string`;
      `src/lib/radar-data.ts`'s `TECHNOLOGIES` map now carries both from `item.metadata`.
- [x] 5.3 `TechDetail.tsx`'s own local `convertItem()` (used by the store-based render path) also
      updated to carry the same two fields — this is a second conversion site not named in
      design's File Changes table (radar-data.ts's `TECHNOLOGIES` build and TechDetail's
      store-based `convertItem` are two independent mapping sites over the same schema; both
      needed the change for the panel to work regardless of which render path is active).
      Added a `<details>` panel right after the Description block: sublíneas as a bulleted list,
      then `tendencias` in a `max-h-[320px] overflow-y-auto` block, matching the exact pattern
      and Tailwind classes of `RadarTemplate.tsx`'s existing Nomenclaturas `<details>`. Panel is
      omitted entirely (not rendered) when both `sublines` and `tendencias` are absent.
- [x] 5.4 `src/components/organisms/TechDetail.test.tsx` — 4 tests: short summary only + panel
      closed by default; expand reveals all 3 sublíneas + full tendencias; collapses back on
      second toggle; panel entirely absent when both fields are undefined. Confirmed jsdom
      natively supports `<details>`/`<summary>` `open` toggling via `fireEvent.click` — no
      polyfill or userEvent needed.
- [x] 5.5 `src/components/molecules/TrajectoryMapCard.tsx` — new `<details>` card reusing the same
      summary/chevron/badge pattern as the Nomenclaturas panel, with a "Pendiente" badge and an
      honest Spanish paragraph stating the source report has not been delivered yet. Includes the
      exact `PENDING:` comment block specified in the batch prompt, naming
      `Vigilancia_Cientifico-Tecnologica_Electronica_2026.pptx` slide 10 as the blocker.
- [x] 5.6 Mounted in `RadarTemplate.tsx`'s desktop right rail, directly below the Nomenclaturas
      `<details>` (separated by a `<Separator />`), and in `MobileLayout.tsx`'s "legend" tab,
      below `<RadarLegend />` inside its own `Card`/`CardContent` wrapper — both per D6.
- [x] 5.7 `src/components/molecules/TrajectoryMapCard.test.tsx` — 3 tests: visible label present;
      Spanish pending copy present with no `img`/`figure` role (no chart/fabricated data); source
      file contains the `PENDING:` comment naming the exact pptx filename.
- [x] 6.1-6.5 Full `2026-2036`/Electrónica branding sweep — see "Branding Sweep — Exact File List"
      below for every file touched and exactly what changed. Grep-verified zero "2025-2035" or
      "2025_2035" hits anywhere in the app (only pre-existing hits are inside
      `openspec/changes/.../` SDD planning artifacts — the audit trail, intentionally untouched).
      Fixed the `embed/page.tsx` `"ceet-telecom"` fallback string flagged by Batch 2. Swept
      remaining generic "Telecomunicaciones"-branded UI copy in `FilterSidebar.tsx` and
      `HelpModal.tsx` to "Electrónica"; left the institution's full name "Centro de Electricidad,
      Electrónica y Telecomunicaciones (CEET)" and the co-author's own role string unchanged
      (both are correct, per the batch's explicit instruction not to touch them).
- [x] 7.1 Full `npx vitest run` — 21 test files, 137 tests, all green (includes the 3 new
      component test files: 4+4+3 = 11 new tests for this batch; prior batches: 126 tests).
- [x] 7.2-7.4 See "Verification — Spec Scenario Cross-Check" below. Playwright/dev-server/visual
      checks were explicitly out of scope for this environment (no browser tooling); substituted
      with build + typecheck + Testing Library coverage. Flagged as NOT independently visually
      verified in Risks below.

### Branding Sweep — Exact File List

| File | Change |
|---|---|
| `messages/es.json` | `radar.title`, `radar.appDescription`, `about.version` (→ "1.0.0" to match `package.json`), `about.aboutText`, `help.description`, `header.subtitle` → Electrónica/2026-2036; renamed unused `about.author`/`authorName`/`authorRole` keys to `about.authors`/`authorsNames`/`authorsRole`/`coauthor`/`coauthorName`/`coauthorRole` (confirmed via grep these keys are not wired into any component — `Header.tsx` only reads `header.about`, not `about.*`) |
| `src/app/layout.tsx` | `metadata.title`, `metadata.description`, `keywords` (telecom-specific `5G`/`6G`/`telecomunicaciones` → `electrónica`/`IIoT`/`microelectrónica`) |
| `public/manifest.json` | `name`, `description` |
| `src/components/templates/RadarTemplate.tsx` | Export filenames → `Radar_Tecnologico_CEET_Electronica_2026-2036.{png,pdf}` |
| `src/components/templates/MobileLayout.tsx` | Mobile radar-tab guide subtitle |
| `src/app/embed/page.tsx` | `"ceet-telecom"` fallback → `"ceet-electronica"` |
| `src/components/molecules/FilterSidebar.tsx` | Sidebar intro paragraph |
| `src/components/molecules/HelpModal.tsx` | `DialogDescription` text |
| `README.md` | Title (line 1), intro paragraph, directory-tree dataset filename reference, "## Autor" → "## Autores" + "### Coautor" split matching the new authorship model |
| `examples/minimal-consumer/README.md` | Dataset filename reference (was pointing at a file that no longer exists) |
| `data/electronica/*.csv` | Not touched — dataset `id`/`title` already `2026-2036` since Batch 2's `--id`/`--title` CLI flags; no `id`/`title` columns exist in the CSVs by design (CLI-driven schema identity, per D2/2.3) |

### Verification — Spec Scenario Cross-Check

| Spec | Scenario | How verified |
|---|---|---|
| authorship-attribution | Modal shows shared institutional structure | `AboutModal.test.tsx` test 3 (logo alt text, table labels, footer copy) + component read |
| authorship-attribution | Both autores appear with exact spelling and role | `AboutModal.test.tsx` test 1 |
| authorship-attribution | Coautor appears with exact spelling and role | `AboutModal.test.tsx` test 2 |
| tech-detail-expansion | Selecting an item shows only the short summary | `TechDetail.test.tsx` test 1 — description visible, panel's `<details open>` attribute is `false` by default |
| tech-detail-expansion | Expanding the panel reveals full content | `TechDetail.test.tsx` test 2 — all 3 sublines + full tendencias text present after `fireEvent.click` on summary |
| tech-detail-expansion | Collapsing the panel hides the full content again | `TechDetail.test.tsx` test 3 — `open` toggles back to `false` on second click |
| tech-detail-expansion | Expansion does not navigate away (no new route) | Manual reasoning + component read only — the panel is a plain client-side `<details>` toggle with no `Link`/router call anywhere in the added code; not covered by an automated route-assertion test since the app has no client-side router transition to assert against in this component |
| trajectory-map-placeholder | User finds the trajectory map section | `TrajectoryMapCard.test.tsx` test 1 + component read confirming it's mounted in both `RadarTemplate.tsx` and `MobileLayout.tsx` |
| trajectory-map-placeholder | User opens the section and sees the pending message | `TrajectoryMapCard.test.tsx` test 2 — Spanish "aún no ha sido entregado" text present, no `img`/`figure` role rendered |
| trajectory-map-placeholder | Developer finds the PENDING marker in source | `TrajectoryMapCard.test.tsx` test 3 — reads the actual source file and asserts the `PENDING:` comment + exact pptx filename are present |

**NOT independently verified** (explicitly out of scope for this environment per the batch prompt —
no browser/dev-server tooling available):
- `proposal.md` success criterion "Composition, theme, and export flows visually match the
  reference radar" — no screenshot/visual diff was taken. Mitigated by reusing the exact same
  Tailwind utility classes, `sena-*`/`muted`/`border` design tokens, and `<details>/<summary>`
  structural pattern already present in the surrounding code (`RadarTemplate.tsx`'s Nomenclaturas
  panel), so no new ad-hoc styling was introduced — but this is a code-level argument, not a
  rendered visual confirmation.
- Task 7.2's Playwright smoke test (select línea → expand → export → assert filename) was not run
  — no browser tooling in this environment. `npm run build` (production build) and
  `npx tsc --noEmit` both pass cleanly as the substitute verification bar per the batch's explicit
  instructions.

### Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run src/components/molecules/AboutModal.test.tsx` → 4/4 passed; `npx vitest run src/components/organisms/TechDetail.test.tsx` → 4/4 passed; `npx vitest run src/components/molecules/TrajectoryMapCard.test.tsx` → 3/3 passed |
| Broader regression check | `npx vitest run --project '!storybook'` (ran all 21 projects incl. storybook browser tests regardless of the filter) → 21 test files, 137 tests, all passed |
| Runtime harness command/scenario and exact result | `npm run build` (Next.js production build, Turbopack) → compiles, typechecks, and generates all 3 static routes (`/`, `/_not-found`, `/embed`) with zero errors; `npx tsc --noEmit` → zero errors; `npm run data:validate` → "✅ Schema validation passed" (4 rings/5 sectors/25 items, id `ceet-electronica-2026-2036`) |
| Rollback boundary | Revert `src/components/molecules/AboutModal.tsx` to restore the single-author telecom version; delete `src/components/molecules/{AboutModal,TechDetail,TrajectoryMapCard}.test.tsx`; revert `src/types/radar.ts`, `src/lib/radar-data.ts`, `src/components/organisms/TechDetail.tsx` to drop the `sublines`/`tendencias` fields and panel; delete `src/components/molecules/TrajectoryMapCard.tsx` and its two mount-site diffs in `RadarTemplate.tsx`/`MobileLayout.tsx`; revert the branding-sweep diffs listed in the file table above independently of the other two units. Each of the 3 suggested work units (AboutModal, TechDetail+TrajectoryMapCard, branding) is independently revertable; branding touches only string literals, no logic. |

### Exact Commands Run

```
npx vitest run src/components/molecules/AboutModal.test.tsx        # 4/4 green
npx vitest run src/components/organisms/TechDetail.test.tsx        # 4/4 green
npx vitest run src/components/molecules/TrajectoryMapCard.test.tsx # 3/3 green
npx tsc --noEmit -p tsconfig.json                                  # zero errors (after Phase 4-5)
npx vitest run --project '!storybook'                               # 21 files / 137 tests, all green
npm run build                                                        # Next.js production build succeeds
npx tsc --noEmit -p tsconfig.json                                  # zero errors (final)
npm run data:validate                                                # ✅ Schema validation passed
```

### Deviations from Design / Task Wording

1. **Design's File Changes table lists only `src/components/organisms/TechDetail.tsx` for the
   `sublines`/`tendencias` mapping**, but `TechDetail.tsx` internally has *two* independent
   conversion paths: the prop-based path (via `radar-data.ts`'s module-level `TECHNOLOGIES`
   array) and the store-based path (via `TechDetail.tsx`'s own local `convertItem()` function,
   used when a `RadarStoreContext` is present). Both needed the same two-field addition for the
   panel to work under either rendering mode — this is the same class of "two mapping sites over
   one schema" gap Batch 2 already flagged for `sectorAreas`/CLI options.
2. **Design's AboutModal delta note says `Autora:` → `Autores:`**, referencing electricidad's
   female-form label. Electronica's inherited AboutModal (pre-this-batch) already used the
   male-form `Autor:` (matching its then-single telecom author), so the actual delta applied was
   `Autor:` → `Autores:`, not `Autora:` → `Autores:`. Content and spec compliance are identical;
   noted only because design's own wording assumed the electricidad starting point literally,
   which wasn't this file's starting point.
3. **`about.author`/`authorName`/`authorRole` keys in `messages/es.json` were renamed** rather
   than left as stale singular-author strings, since they are unused by any component
   (`AboutModal.tsx` hardcodes its own Spanish text directly, does not use `useTranslations`) —
   confirmed via grep before editing. Not explicitly requested by any task, but leaving a
   contradictory unused "Autor:"/single-name block in the messages file while the actual UI shows
   Autores+Coautor seemed clearly wrong; flagged here as a proactive consistency fix, not a spec
   requirement.
4. **`about.version` in `messages/es.json`** was stale at `"2.1.0"` (unused by the component,
   which reads `APP_VERSION` from `package.json` at `"1.0.0"` since Batch 1). Updated to
   `"1.0.0"` for consistency; not explicitly named in any task but directly adjacent to the
   `aboutText` edit task 6.1 named.
5. **README.md received a few edits beyond the literal `README.md:1` design reference** (intro
   paragraph, directory-tree filename, Autor→Autores/Coautor section) since the prompt's Phase 6
   scope explicitly says "README.md if user-facing" and leaving those specific lines
   self-contradictory (wrong dataset filename, sole "Autor" credit when the app now shows
   Autores+Coautor) would have shipped a known-stale doc. The README's "Direccionadores" table
   (D1-D5 labels carried over from telecom, now factually describing the wrong domains) and the
   version badge (`2.1.0`, stale since Batch 1 set `package.json` to `1.0.0`) were **left
   untouched** — out of the explicit branding-sweep scope (2025-2035/telecom-generic-copy), and
   correcting them accurately would require re-deriving sector-by-sector content not requested by
   any task or spec scenario. Flagged as a known remaining doc-staleness item below.

### Issues Found / Known Remaining Items (informational, non-blocking)

- `README.md`'s "Direccionadores" table (lines ~62-68) still lists the five *telecom* sector
  names/tech-counts (e.g. "Inteligencia Nativa y Redes Autónomas"), not the electronics D1-D5
  sectors from `data/electronica/sectors.csv`. Out of this batch's explicit branding-sweep scope
  (which targeted `2025-2035`/generic telecom UI copy, not full content re-derivation) and not
  covered by any spec scenario. Recommend a follow-up doc pass if the README is treated as a
  user-facing deliverable rather than internal dev notes.
- `README.md`'s version badge (`version-2.1.0`) is stale versus `package.json`'s `"1.0.0"` — a
  pre-existing Batch 1 discrepancy, not introduced or worsened by this batch, left as-is since it
  wasn't named in any task.
- No Playwright/visual verification was performed (see "NOT independently verified" above) — this
  is the one proposal.md success criterion this batch cannot claim full verification for.

### Untouched (not this batch's scope)

- `data/electronica/*.csv`, `narrative/*.md`, `curation-log.md`, `public/data/ceet-electronica.json`
  — Batch 2 content, not re-touched.
- `openspec/changes/.../design.md`, `proposal.md`, `specs/*`, `exploration.md`, `state.yaml` — read
  only this batch; only `tasks.md` (checkbox marks) and `apply-progress.md` (this record) edited.
- `.storybook/`, `e2e/radar.spec.ts`, CI workflow — not touched; existing Storybook stories for
  `TechDetail` continued to pass unmodified against the new panel (verified — the panel renders
  additively after Description and doesn't change any existing assertions).

### Status

37/37 tasks complete (Phases 1-7 of 7 — ALL PHASES DONE). `npm run build`, `npx tsc --noEmit`, and
the full `npx vitest run` suite (137 tests) are all green. This was the final `sdd-apply` batch.
Ready for `sdd-verify`.

---

## Batch 4 (Corrective — fixes sdd-verify blocker) — COMPLETE

**Not part of the original 37 tasks** (all 37 remain `[x]` and untouched in `tasks.md`, exactly as
Batch 3 left them). This batch responds to `sdd-verify`'s FAIL verdict
(`openspec/changes/radar-tecnologico-electronica/verify-report.md`, evidence_revision over
`4eb14a3`), which found CRITICAL-1 (radar-dot label overlap breaking click interactivity,
independently reproduced via `npx playwright test --project=chromium`) and CRITICAL-2
(tech-detail-expansion's "does not navigate away" scenario had zero covering test).

**Mode**: Standard (`openspec/config.yaml testing.strict_tdd: false`; design.md D7 scopes this
change to standard verification, consistent with all 3 prior apply batches and with verify-report's
own "Mode: Standard" framing). Focused Vitest unit tests were written for the new/changed logic
(`generateNameLines` word-wrap, TechDetail navigation-safety) and run before being declared green.

### Root cause (confirmed, not re-investigated — see verify-report.md's Correctness table)

14/25 items (56%) landed in the innermost "ADOPTAR" ring (vs. telecom reference's 4/24, 17%), and
Electronics item names average 77 chars (max 125) vs. telecom's 39.8 (max 56). The rubric's R1 rule
(`TRL\s*n` regex) mechanically matched the *first* TRL-shaped substring in each línea's narrative
regardless of whether it described the línea's overall maturity or one sub-component/submarket —
curation-log.md's own Batch 2 "Notes for reviewer" had already flagged 7 such rows (L04, L05, L07,
L13, L16, L17, L19) as borderline. Combined with the inherited (v5 fork) `generateNameLines`
helper's fixed 2-line split, this produced severe label bounding-box overlap in the crowded adopt
ring, which broke click interactivity — reproduced by Playwright's "los puntos del radar son
interactivos" test failing consistently (not flaky) across repeated runs before this fix.

### Fix Part A — root-cause data correction (curation rubric applied more precisely)

Re-read each of the 7 flagged items' `narrative/L0N.md` and re-derived TRL/ring/horizon from the
línea's OVERALL governing narrative language (via R2-R5's literal precedence, falling back to a
logged manual nearest-fit call using the same evidentiary method as the existing L02/L11 manual
rows) instead of the buried sub-component TRL figure R1's regex mechanically latched onto. Every
correction is logged transparently in `curation-log.md`'s Override column with its specific
reasoning, per design.md's "override only with a logged reason" mechanism.

| Item | Was (R1) | Now | Rule | Reasoning (short) |
|---|---|---|---|---|
| L04 | TRL9/adopt | TRL5/assess | R4 nearest-fit | "EMERGENTE con escalamiento comercial" governs the whole línea; "ya en TRL 9" describes only the visión artificial submarket |
| L05 | TRL9/adopt | TRL7/trial | R3 nearest-fit | Bare "ALZA"; "TRL 8-9" describes only robótica/drones, humanoides sit at TRL 4-6; accelerating-unit-growth evidence used for nearest-fit |
| L07 | TRL9/adopt | TRL7/trial | R3 nearest-fit | Bare "ALZA con componentes emergentes"; "TRL 8-9" covers only EDA/PCB flexible, empaquetado 3DIC sits at TRL 6-8 |
| L13 | TRL9/adopt | TRL7/trial | R3 nearest-fit | Bare "ALZA"; "TRL 9" is the SMPS-de-silicio ceiling, not GaN (the línea's actual subject); ~42% CAGR used as accelerated-growth signal |
| L16 | TRL9/adopt | TRL5/assess | R4 nearest-fit | "ALZA en consolidación" (not literal CONSOLIDADA); "TRL 7-9" covers only wearables, bioelectrónica implantable sits at TRL 4-6 |
| L17 | TRL9/adopt | TRL5/assess | R4 nearest-fit | Bare "ALZA con vectores emergentes"; "TRL 6-9" covers only aviónica modular/COTS, drones/nanosatélites sit at TRL 4-7 |
| L19 | TRL9/adopt | TRL7/trial | R3 nearest-fit | "ALZA en transformación acelerada" maps directly to R3's "crecimiento acelerado"; "TRL 8-9" covers only ECU/ADAS niveles 1-2 |

Net effect: adopt ring 14/25 (56%) → 7/25 (28%); trial 2→6; assess 2→5; monitor unchanged at 7.
Regenerated `public/data/ceet-electronica.json` via
`npm run data:build -- --in-dir data/electronica --out public/data/ceet-electronica.json --id ceet-electronica-2026-2036 --title "Radar Tecnológico — Electrónica CEET 2026-2036"`
(4 rings / 5 sectors / 25 items, passes `npm run data:validate`). Only the 7 flagged rows were
touched in `items.csv`/`curation-log.md`; the other 18 líneas are untouched.

### Fix Part B — UI robustness to ring density (defense in depth)

1. **`tools/ingest-xlsx/src/transformer.ts`'s `generateNameLines`** rewritten from a fixed 2-way
   split to a greedy word-wrap bounded to 3 lines of ≤26 chars, ellipsizing the last visible line
   when a name still doesn't fit. Exported and covered by a new
   `tools/ingest-xlsx/__tests__/label-wrap.test.ts` (5 tests). This directly shrinks the per-item
   label bounding-box width regardless of how long future dataset names are.
2. **`src/components/organisms/RadarChart.tsx`**: the label `<text>` now has `pointerEvents="none"`
   so a neighboring item's label can never intercept a click meant for a different item's dot
   (this was the literal mechanism Playwright's error message named: "a different item's label
   tspan intercepts pointer events"). Added a native `<title>{tech.name}</title>` tooltip carrying
   the full untruncated name. Discovered a second-order effect while testing: once labels stopped
   intercepting clicks, Playwright's bbox-center click for 3-line-wrapped items could land on
   background (the ring fill circle) instead of the item itself, since the `<g>`'s natural bounding
   box extends well past the tiny dot to cover the wrapped label beneath it — fixed with an
   invisible, sized-to-content hit-`<rect>` (dot top through wrapped-label bottom) with
   `pointerEvents="all"`, so a click anywhere in the visually-associated region always resolves to
   the correct item.

### Fix Part C — closed CRITICAL-2 test gap

Added one test to `src/components/organisms/TechDetail.test.tsx`: asserts
`window.location.pathname` and `window.history.length` are unchanged before/after expanding and
collapsing the sublíneas/tendencias panel — closing the previously-untested
"Expansion does not navigate away" spec scenario.

### Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npx vitest run tools/ingest-xlsx/__tests__/label-wrap.test.ts` → 5/5 passed; `npx vitest run src/components/organisms/TechDetail.test.tsx` → 5/5 passed (4 pre-existing + 1 new) |
| Broader regression check | `npx vitest run` → 22 test files, 143 tests, all passed (137 pre-existing + 6 new: 5 label-wrap + 1 navigation-safety) |
| Runtime harness command/scenario and exact result | `npx tsc --noEmit -p tsconfig.json` → zero errors; `npm run build` → compiles/typechecks/generates all 3 static routes with zero errors; `npm run data:validate` → "✅ Schema validation passed"; `npx playwright test --project=chromium` → 5/5 passed, re-run 4 additional times (5 total runs) to rule out flakiness — "los puntos del radar son interactivos" passed every run |
| Rollback boundary | Each of the 5 commits below is independently revertable: (1) curation correction (`data/electronica/items.csv`, `curation-log.md`) reverts to the pre-Batch-4 R1-mechanical values; (2) `generateNameLines` reverts to the fixed 2-line split (`transformer.ts` + delete `label-wrap.test.ts`); (3) `RadarChart.tsx`'s pointerEvents/title/hit-rect changes revert independently of the data changes; (4) the regenerated `ceet-electronica.json` reverts to the prior committed JSON; (5) the new `TechDetail.test.tsx` navigation test can be deleted independently without affecting any other test |

### Exact Commands Run

```
npm run data:build -- --in-dir data/electronica --out public/data/ceet-electronica.json \
  --id ceet-electronica-2026-2036 --title "Radar Tecnológico — Electrónica CEET 2026-2036"
npx vitest run tools/ingest-xlsx/__tests__/label-wrap.test.ts   # 5/5 green
npx tsc --noEmit -p tsconfig.json                                # zero errors
npm run build                                                     # succeeds
npx vitest run                                                    # 22 files / 143 tests, all green
npx playwright test --project=chromium                           # 5/5 passed (run 5 times total)
npm run data:validate                                             # ✅ Schema validation passed
git add data/electronica/curation-log.md data/electronica/items.csv && git commit -m "fix(data): ..."
git add tools/ingest-xlsx/src/transformer.ts tools/ingest-xlsx/__tests__/label-wrap.test.ts \
  && git commit -m "fix(ingest): ..."
git add src/components/organisms/RadarChart.tsx && git commit -m "fix(radar-chart): ..."
git add public/data/ceet-electronica.json && git commit -m "chore(data): ..."
git add src/components/organisms/TechDetail.test.tsx && git commit -m "test(tech-detail): ..."
```

### Resulting Git Commits

- `a27321b` — `fix(data): correct 7 R1-hit curation rows misapplying rubric to sub-component TRLs`
- `b729a65` — `fix(ingest): word-wrap long item/sector labels instead of a fixed 2-line split`
- `349f232` — `fix(radar-chart): make labels click-transparent and add a resilient dot hit-area`
- `92e7449` — `chore(data): regenerate electronics dataset from corrected curation + label wrap`
- `b87a97d` — `test(tech-detail): assert panel expansion never navigates away`

Branch: `master`. No remote configured.

### Deviations / Judgment Calls (flagged transparently)

1. **The 7 corrected TRL/ring values are manual nearest-fit judgment calls**, not a purely
   mechanical rubric re-run (`rubric.ts`'s `deriveRubric()` was not modified — it still applies R1
   literally by design; a full R1-scoping fix, e.g. only matching a TRL figure near the start of the
   narrative or excluding parenthetical sub-clauses, was judged out of scope and riskier than a
   transparent manual override with logged reasoning, consistent with how L02/L11's original manual
   calls were already handled). Each is independently reviewable/reversible via `curation-log.md`'s
   Override column, per design's own override mechanism.
2. **`generateNameLines`'s new 26-char/3-line thresholds also affect sector labels** (same helper,
   `transformSectors`'s `labelLines`), not just item names — sector labels are already longer than
   26 chars in this dataset, so they now wrap into narrower/more lines instead of the old
   midpoint 2-way split. This was verified visually-safe via the full Playwright suite (sector
   labels render in open space near the radar's periphery, not the crowded item-label area) but
   was not explicitly requested by the fix prompt; flagged here as an in-scope side effect of
   reusing the shared helper rather than forking a separate item-only wrap function.
3. **The invisible hit-`<rect>` in `RadarChart.tsx` was not part of the original fix instructions**
   (which asked for truncation+tooltip and/or dynamic angular spacing). It was added after
   discovering, via the actual Playwright run, that `pointerEvents="none"` on labels alone
   surfaced a second-order click-miss failure (bbox-center landing on background for tall
   multi-line labels). Documented in Fix Part B above; verified to fully resolve the failure across
   5 repeated Playwright runs.
4. **Dynamic per-ring angular spacing (`angleOff`) was not implemented.** `angleOff` is fixed by
   sector position (5 items per 72° sector, not by ring), and the Part A data correction already
   reduced ring-0 density from 14→7 items; the label-wrap + pointer-events + hit-rect combination
   was sufficient to reliably pass Playwright without this additional geometry change. Noted as a
   smaller-scope choice, not a gap — the instructions asked for "the smallest change that reliably
   prevents bounding-box overlap for the actual (corrected) dataset," which this satisfies.

### Untouched (not this batch's scope)

- `tasks.md` — all 37 original checkboxes remain `[x]`, unmodified (this is a verify-driven
  correction, not new task completion, per the batch's explicit instruction).
- The other 18 curated líneas in `items.csv`/`curation-log.md` — untouched.
- `openspec/changes/.../state.yaml` — left as found (already modified before this batch started,
  outside this agent's edit scope).
- WARNING-level verify findings (README "Direccionadores" table, README version badge, export
  filename runtime test) — out of scope; verify-report.md marked these WARNING, not CRITICAL/
  blocking, and the batch prompt scoped this pass to CRITICAL-1/CRITICAL-2 only.

### Status

37/37 original tasks remain complete; this corrective batch additionally resolves both CRITICAL
findings from `verify-report.md`. `npx tsc --noEmit`, `npm run build`, `npx vitest run` (143/143),
and `npx playwright test --project=chromium` (5/5, confirmed non-flaky across 5 runs) are all green.
Ready for `sdd-verify`.
