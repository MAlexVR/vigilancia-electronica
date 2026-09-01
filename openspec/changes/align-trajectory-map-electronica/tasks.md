> Global Strict TDD Mode is authoritative. `openspec/config.yaml`'s `strict_tdd: false` is stale (design open question) — ignored.

# Tasks: Align Trajectory Map and Radar drift with vigilancia-telecomunicaciones

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2500 (Slice 2) is the driver; total ~3400-3700 across all slices |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1→PR2→PR3→PR4 sequential; PR5 independent |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Focused test | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | PDF plumbing (~150-250 ln) | PR1 | `npm test -- export.test.ts` | `npm run build` (dynamic `html-to-image` import) | Revert 3 files; `npm remove html-to-image` |
| 2 | Engine+UI verbatim port (~2500 ln, **size:exception candidate**) | PR2 | `npm test -- src/lib/trajectory src/components/trajectory` | Storybook render of ported stories | Delete `src/lib/trajectory/`, `src/components/trajectory/` |
| 3 | Domain adapter (~250-350 ln, TDD) | PR3 | `npm test -- trajectory-data.electronica` | N/A — pure data module, no runtime harness beyond unit test | Delete `trajectory-data.electronica.{ts,test.ts}` |
| 4 | Integration: Modal, Header, card removal, HelpModal, i18n (~450-550 ln; split into 4a/4b if diff exceeds 400) | PR4 | `npm test -- Header TrajectoryModal RadarTemplate MobileLayout` | Manual: open app, click header "Trayectoria" desktop+mobile | Revert Header/templates/HelpModal edits; restore `TrajectoryMapCard.tsx`+test |
| 5 | Docs/repo (independent, parallel-safe) | PR5 | N/A — doc/metadata only | `gh repo view MAlexVR/vigilancia-electronica` | Revert `README.md`; re-run `gh repo edit` with captured prior description |

PR2 exceeds the budget even chained; flag for maintainer `size:exception` approval on top of stacked delivery (verbatim mechanical copy, not authored risk).

## Phase 1: PDF Plumbing (PR1)

- [x] 1.1 RED: write `src/core/export.test.ts` cases for `downloadElementAsPDF` (see deviation note below — telecom's `export.test.ts` has no direct unit test for this function; authored equivalent-coverage tests instead); run, confirm failure (function missing).
- [x] 1.2 GREEN: add `DownloadElementAsPDFOptions` + `downloadElementAsPDF` to `src/core/export.ts` verbatim from telecom; export both from `src/core/index.ts`.
- [x] 1.3 Add `"html-to-image": "^1.11.13"` to `package.json`; update lockfile.
- [x] 1.4 `npm run build` passes (validates dynamic import).

## Phase 2: Engine + UI Port (PR2, verbatim)

- [x] 2.1 RED: copy `src/lib/trajectory/{config,layout}.test.ts` verbatim; confirm failing (missing source).
- [x] 2.2 GREEN: copy `src/lib/trajectory/{types,config,layout,index}.ts` verbatim; tests pass unchanged.
- [x] 2.3 Copy `arch.test.ts`, then swap forbidden token `"ceet-telecom"` → `"ceet-electronica"` (+ doc comment) — the one deliberate non-verbatim edit; run, confirm it passes against electronica's dataset guard.
- [x] 2.4 RED: copy `TrajectoryMap.test.tsx`, `TrajectoryNode.test.tsx` verbatim; confirm failing (missing components).
- [x] 2.5 GREEN: copy `src/components/trajectory/{TrajectoryProvider,TrajectoryMap,TrajectoryLane,TrajectoryNode,TrajectoryDetail,TrajectoryLegend,index}.tsx` + `*.stories.tsx` verbatim.

## Phase 3: Domain Adapter (PR3, TDD, new code)

- [ ] 3.1 RED: write `src/lib/trajectory-data.electronica.test.ts` — config validates via `validateTrajectoryConfig`; drivers match `SECTORS`; L1 count `=== TECHNOLOGIES.length`; `items.filter(i => i.layer !== "L1")` is empty (anti-fabrication); file text contains `PENDING:` and the pptx filename. Run, confirm failure.
- [ ] 3.2 GREEN: implement `electronicaConfig` + `buildElectronicaTrajectory()` per design's Interfaces section — L1 only, no `FUENTE_GOR`, no `gap` assignment.
- [ ] 3.3 Add the `PENDING:` block verbatim from design above `buildElectronicaTrajectory`, neutral Spanish, naming the missing GOR report and the `// JUICIO:`/`Fundamento:` convention for future completion.
- [ ] 3.4 Do NOT add any new component, badge, or copy for the L2-L4 "avance" state anywhere in this slice.
- [ ] 3.5 RED then GREEN: component test rendering `<TrajectoryMap config={electronicaConfig} dataset={buildElectronicaTrajectory()} />` — assert `No hay ítems para este driver.` for L2/L3/L4 lanes, L1 nodes render, and no electronica-specific empty-state text node exists.

## Phase 4: Integration (PR4)

- [ ] 4.1 Create `src/components/molecules/TrajectoryModal.tsx` from telecom's, swap import to `electronicaConfig`/`buildElectronicaTrajectory`; keep sources footer verbatim.
- [ ] 4.2 RED then GREEN: Header test asserting "Mapa de Trayectoria Tecnológica" button exists desktop+mobile and opens the modal; then wire `Header.tsx` (import, state, buttons, mount `TrajectoryModal`).
- [ ] 4.3 Delete `TrajectoryMapCard.tsx` + its test.
- [ ] 4.4 Verify RadarTemplate.tsx `<Separator/>` (~L264): remove only if it exclusively divided the removed card; else keep. Remove card import/usage from `RadarTemplate.tsx` and `MobileLayout.tsx` (drop wrapping `<Card>` only if it wrapped just the card).
- [ ] 4.5 Regression: confirm existing `RadarTemplate`/`MobileLayout` tests pass with no `TrajectoryMapCard` reference.
- [ ] 4.6 Insert trajectory education section into `HelpModal.tsx` (before content-closing `</div>` near L149), adapted intro to Electrónica + its horizon; no apology/pending language.
- [ ] 4.7 Add `header.trajectory` + `trajectory` namespace to `messages/es.json`; copy `sourcesTitle`/`exportPDF`/`exportingPDF`/`close`/`emptyState` verbatim; adapt `description`/`introTitle`/`introText` to Electrónica.
- [ ] 4.8 Set `trajectory.exportError` to `"Error al exportar. Intente de nuevo."` — do NOT copy telecom's `"Intenta de nuevo."` verbatim.
- [ ] 4.9 If PR4's diff exceeds ~400 lines, split into 4a (Modal+Header+card removal) and 4b (HelpModal+i18n) as separate stacked PRs.

## Phase 5: Guardrail Verification (gate before archive)

- [ ] 5.1 Diff-check `src/components/molecules/AboutModal.tsx` against pre-change HEAD across all slices — MUST be empty. No task in Phases 1-4 may open this file for writing.
- [ ] 5.2 Confirm no new component/badge/text exists for L2-L4 beyond the engine's native empty state (grep rendered DOM/test output for stray "avance"/"pendiente" strings outside the engine element).
- [ ] 5.3 Scan every new/changed Spanish string (UI, comments, `messages/es.json`, README, commit messages) for voseo forms (`vos`, `tenés`, `podés`, `sos`); none present.
- [ ] 5.4 Confirm `trajectory-data.electronica.ts` contains the `PENDING:` comment and no `PENDING:` marker on the L1 section.

## Phase 6: Docs & Repo Presentation (PR5, independent, parallel-safe)

- [ ] 6.1 Verify whether electronica has an XLSX→JSON pipeline script (check `scripts/`); only add README's `## Pipeline de Datos` section if one exists — do not fabricate.
- [ ] 6.2 Restructure `README.md` to telecom's section order (H1, Arquitectura, Radar Tecnológico, Mapa de Trayectoria Tecnológica, Paleta/Stack/Instalación/Testing/Storybook/Estructura/Changelog), preserving electronica's `## Autores`/`### Coautor`/`## Fuente` content unchanged; add new Changelog entry.
- [ ] 6.3 Capture the current GitHub repo description via `gh repo view MAlexVR/vigilancia-electronica` for rollback.
- [ ] 6.4 Run `gh repo edit --description "Aplicación web interactiva para la vigilancia científico-tecnológica y prospectiva del área de Electrónica del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET) del SENA, Bogotá D.C." MAlexVR/vigilancia-electronica`. Do not touch the homepage field.
