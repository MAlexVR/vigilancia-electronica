# Exploration: Align Trajectory Map + sync Radar drift — vigilancia-electronica vs vigilancia-telecomunicaciones

## SDD Session Preflight

- execution_mode: auto
- artifact_store: openspec
- delivery_strategy: auto-chain
- review_budget_lines: 800

## Current State

### Reference (`E:\Repositorio\radar_tecnologico`, telecomunicaciones v2.3.0) — full Trajectory Map feature

Engine, data-agnostic (`src/lib/trajectory/`):
- `types.ts` — `HorizonBucket` (`ahora|corto|medio1|medio2|largo`), `TrajectoryItem` `{id, layer, driver, horizon, title, detail, metric?, gap?, relatedIds?, source?, meta?}` — **no "status/avance" flag exists in the type today**; `TrajectoryConfig` `{drivers, layers, horizonBuckets, colorFor, labelFor, metricBadge?, detailRenderer?}`; `TrajectoryDataset` `{items}`.
- `config.ts` — `validateTrajectoryConfig` (non-empty/unique-key invariants), `defaultColorFor`, `defaultLabelFor`.
- `layout.ts` — `normalizeHorizon`, `byDriver`, `byLayer`, `byHorizon`.
- `index.ts` (barrel), `arch.test.ts` (enforces the engine never imports domain symbols), `config.test.ts`, `layout.test.ts`.

UI components (`src/components/trajectory/`), all config/dataset driven via props+context, zero domain coupling:
- `TrajectoryProvider.tsx` — React context for `TrajectoryConfig`.
- `TrajectoryMap.tsx` — root component: Radix Tabs driver selector, CSS grid (1 label col + N horizon cols) per layer lane, desktop grid + mobile vertical accordion, legend sidebar (lg+), and a **built-in empty state** (`"No hay ítems para este driver."`) rendered whenever a driver has 0 items. This is the key mechanism that already lets a partially-populated dataset render honestly with zero engine changes.
- `TrajectoryLane.tsx`, `TrajectoryNode.tsx`, `TrajectoryDetail.tsx`, `TrajectoryLegend.tsx`, `index.ts` barrel.
- Stories: `TrajectoryDetail/Legend/Map/Node.stories.tsx`. Tests: `TrajectoryMap.test.tsx`, `TrajectoryNode.test.tsx`.

Domain adapter: `src/lib/trajectory-data.telecom.ts` (1300 lines) builds `telecomConfig` (drivers = `SECTORS` D1–D5 with radar-matching colors; 4 layers L1 Tecnologías/L2 Infraestructura/L3 Talento&I+D+i/L4 Alianzas; 5 horizon buckets with a teal→purple gradient; `colorFor` keyed by gap severity then driver; `metricBadge` shows TRL for L1 only) and `buildTelecomTrajectory()` — 72 items total: L1 (24 items, one per `TECHNOLOGIES` entry — real radar data) + L2–L4 (48 items across D1–D5, transcribed from GOR Tablas 8/9/10/11 with explicit `// JUICIO:` and `Fundamento:` provenance comments — a strict anti-fabrication discipline already established as convention). `trajectory-data.telecom.test.ts` covers it.

Integration: `src/components/molecules/TrajectoryModal.tsx` — Radix Dialog, full-screen on mobile / `98vw×92vh` on desktop, header with title + PDF export button (`downloadElementAsPDF` from `@/core`, dynamically imports `html-to-image` + `jspdf`), intro text block, `<TrajectoryMap>` body, APA theoretical-sources footer, side detail panel. Wired into `src/components/organisms/Header.tsx` (imports `TrajectoryModal`, `showTrajectory` state, a `Route`-icon nav button in both the desktop bar and mobile menu with `t("trajectory")` label, and mounts `<TrajectoryModal open={showTrajectory} onOpenChange={setShowTrajectory} />` at the end).

`src/components/molecules/HelpModal.tsx` in telecom has an added "Mapa de Trayectoria Tecnológica" education section (MT icon, 4-layer legend, "Cómo usarlo" steps, gap-color indicators) that electronica's `HelpModal.tsx` completely lacks.

i18n: `messages/es.json` telecom has `header.trajectory` plus a full `trajectory` namespace (title, description, introTitle, introText, sourcesTitle, exportPDF, exportingPDF, exportError, close, emptyState).

`package.json`: telecom has `"html-to-image": "^1.11.13"` (used only by PDF export) which electronica's `package.json` **lacks**. `src/core/export.ts`/`index.ts` in telecom export `downloadElementAsPDF`/`DownloadElementAsPDFOptions`; electronica's `src/core/export.ts` header comment literally reads "Export (PNG/SVG, no PDF)" — the PDF-export capability does not exist there at all.

### Target (`E:\Repositorio\vigilancia-electronica`) — current state

Trajectory: only `src/components/molecules/TrajectoryMapCard.tsx` (37 lines) — an inline `<details>` collapsible card, "Pendiente" badge, honest Spanish pending-message, `PENDING:` code comment referencing `Vigilancia_Cientifico-Tecnologica_Electronica_2026.pptx`. Its test `TrajectoryMapCard.test.tsx` (36 lines) asserts: visible entry-point text, honest pending-copy with no `img`/`figure` role rendered, and the `PENDING:` comment + pptx filename present in source.

**Integration-pattern gap (important):** `TrajectoryMapCard` is **not** header-triggered like telecom's modal — it's embedded inline in `src/components/templates/RadarTemplate.tsx` (~line 265, desktop sidebar, after a `<Separator/>`) and `src/components/templates/MobileLayout.tsx` (~line 186, inside a mobile Tabs panel wrapped in `<Card>`). electronica's `Header.tsx` currently has only 2 actions (Ayuda/Help, Acerca de/About) — no `TrajectoryModal` import, no "Trayectoria" button, no `Route` icon usage anywhere.

electronica's `messages/es.json` `header` namespace has only `title, subtitle, help, about, menu` — no `trajectory` key and no `trajectory` namespace at all.

Directory structure otherwise matches telecom closely — same `src/core/*`, `src/lib/{utils,version,i18n,radar-data}.ts`, same `organisms/{RadarChart,RadarLegend,TechDetail,NomenclatureTable,Header,Footer}.tsx`, same `templates/{RadarTemplate,MobileLayout}.tsx`. `version.ts` is byte-identical (dynamic from `package.json`) — no drift. `radar-data.ts` exports `SECTORS`/`TECHNOLOGIES` from the same schema shape as telecom, so the same driver-mapping pattern is directly portable.

**Authorship / attribution (must NOT be overwritten):** electronica's `AboutModal.tsx` hardcodes (not i18n-translated): "Autores: Ing. Óscar Andrés Pulido Casallas / Ing. Diana Cristina Limas Ramirez — Instructores Área de Electrónica" and "Coautor: Ing. Mauricio Alexander Vargas Rodríguez, MSc., MBA Esp. PM. — Instructor G14 Área de Telecomunicaciones", plus its own title/description. `Footer.tsx` is fully i18n-driven (`footer.*` keys) and structurally identical to telecom's — no author names there, safe to leave untouched/re-sync structurally if ever needed. Telecom's own `AboutModal.tsx` has parallel but different content — confirms the modal's *layout/classes* are portable, its *content* is per-app and not.

**Archived placeholder spec conflict:** `openspec/specs/trajectory-map-placeholder/spec.md` is the **active** current main spec (also mirrored under `openspec/changes/archive/2026-08-31-radar-tecnologico-electronica/specs/`). It has 3 requirements: (1) "Visible Pending-Content Placeholder" — compatible in spirit, needs a MODIFIED delta once the entry point moves to Header nav; (2) "Honest Pending-Content Message" — states literally "no trajectory chart, timeline, or fabricated data is shown" — **directly conflicts** with rendering a real chart/grid (even with only avance content); (3) "Code Comment Marking Future Completion" (`PENDING:` marker) — likely superseded/removed, or narrowed to whichever layers/drivers remain unpopulated.

**`openspec/config.yaml` staleness:** its context block still describes the project as "content-authoring deliverable, NOT a software codebase (no git, no package manager, no build/test tooling)" — stale, since a full Next.js codebase now exists post the archived change. Not this phase's job to fix, but sdd-propose/sdd-spec should not trust that context block literally.

**Electricidad sibling (secondary reference, `E:\Repositorio\vigilancia-electricidad`):** `src/lib/trajectory-data.electricidad.ts` confirms the adapter pattern is a clean per-domain clone of telecom's file (same imports, same `GAP_COLORS`/`DRIVER_COLORS` palette, own `FUENTE_GOR` constant citing its own GOR report). Validates that electronica should get its own `trajectory-data.electronica.ts` following the identical contract — but today it lacks the GOR report electricidad and telecom both have, which is the central constraint of this change.

## Additional scope requested by the user mid-session (outside the original explore brief)

1. Update GitHub repo description ("About" field) of `vigilancia-electronica` from
   "Radar Tecnológico de Vigilancia Científico-Tecnológica del área de Electrónica — CEET, SENA. Prospectiva 2026-2036."
   to
   "Aplicación web interactiva para la vigilancia científico-tecnológica y prospectiva del área de Electrónica del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET) del SENA, Bogotá D.C."
   (mirrors telecomunicaciones' current description style).
2. Update `README.md` of `vigilancia-electronica` to follow the structure/format of telecomunicaciones' `README.md` (sections, headings), while preserving electronica's own content (authors, area, scope, links).
3. **Language constraint (applies to ALL generated Spanish text in this change — UI copy, comments, docs, README, commit messages):** neutral/standard Spanish only. No voseo ("vos", "tenés", "podés", etc.) anywhere in code or generated artifacts.

## Affected Areas (target repo: vigilancia-electronica)

- `src/lib/trajectory/*` — NEW: port engine (types/config/layout/index) verbatim + `arch.test.ts`/`config.test.ts`/`layout.test.ts`.
- `src/components/trajectory/*` — NEW: port TrajectoryMap/Lane/Node/Detail/Legend/Provider + `index.ts` + stories + tests verbatim (data-agnostic).
- `src/lib/trajectory-data.electronica.ts` — NEW domain adapter. Central design call for sdd-propose: L1 populated honestly from electronica's existing real `TECHNOLOGIES`; L2–L4 left empty (engine's native per-driver empty state already handles this with zero schema change).
- `src/components/molecules/TrajectoryModal.tsx` — NEW, ported/adapted from telecom, keep PDF export.
- `src/components/molecules/TrajectoryMapCard.tsx` + `.test.tsx` — REMOVE (superseded).
- `src/components/templates/RadarTemplate.tsx` (~line 265) and `MobileLayout.tsx` (~line 186) — remove `TrajectoryMapCard` usages.
- `src/components/organisms/Header.tsx` — add `TrajectoryModal` import/state/nav button (Route icon, `t("trajectory")`) desktop+mobile, mount `<TrajectoryModal>`.
- `src/components/molecules/HelpModal.tsx` — add trajectory education section (ported, adapted to avance scope).
- `messages/es.json` — add `header.trajectory` + full `trajectory` namespace (neutral Spanish, no voseo).
- `src/core/export.ts` + `src/core/index.ts` — add `downloadElementAsPDF`/`DownloadElementAsPDFOptions`.
- `package.json` — add `"html-to-image": "^1.11.13"`.
- `src/components/molecules/AboutModal.tsx` — DO NOT touch author content.
- `openspec/specs/trajectory-map-placeholder/spec.md` — needs explicit REMOVED/MODIFIED delta (Requirement 2 conflicts directly).
- `README.md` — restructure to telecom's format, preserving electronica's own content.
- GitHub repo description (About field) — update via `gh repo edit --description`.

## Approaches

1. **Full port with "avance" adapter (recommended)** — Port engine + UI verbatim; new `trajectory-data.electronica.ts` populates L1 from existing real TECHNOLOGIES and leaves L2–L4 empty via the engine's native empty state; replace inline `TrajectoryMapCard` with Header+Modal integration matching telecom; add missing i18n/deps/PDF plumbing; supersede the conflicting placeholder-spec requirement via an explicit delta.
   - Pros: matches user's explicit "same real component/visual system, avance content only" requirement; zero fabrication risk (engine unmodified, proven, tested); no new type/status field needed; electronica's authorship untouched.
   - Cons: non-trivial multi-file change (~12+ files); some judgment calls (what, if anything, populates L2–L4 as avance notes) need explicit sdd-propose resolution.
   - Effort: Medium.

2. **Add a "status: avance/pendiente" field to `TrajectoryItem`** — Extend the shared engine type so a few draft items can be shown but visually flagged non-authoritative, instead of relying purely on the per-driver empty state.
   - Pros: richer per-item avance messaging.
   - Cons: mutates a type shared unmodified today by telecom + electricidad — risks scope creep beyond electronica and diverges from the "align" goal; not needed if the empty-state approach is accepted as sufficient.
   - Effort: Medium-High.

3. **Keep the current honest placeholder; only sync unrelated Radar drift** (PDF export, HelpModal, deps).
   - Pros: zero risk/effort for trajectory itself.
   - Cons: directly contradicts the user's explicit requirement to ship the real component now.
   - Effort: Low, but rejected by stated requirements.

## Recommendation

Approach 1 — full port plus an avance adapter that relies on the trajectory engine's existing empty-state behavior. It satisfies "same real component, no fabricated data" without touching the shared engine contract (keeping electronica consistent with telecom/electricidad), and gives sdd-propose/sdd-spec a clear, bounded file list.

## Risks

- Placeholder spec Requirement 2 ("no trajectory chart... is shown") is in direct textual conflict with shipping a real chart; sdd-spec MUST supersede it via an explicit REMOVED/MODIFIED delta with Reason/Migration, not silently ignore it.
- Integration pattern differs today (inline card vs. Header-triggered modal) — sdd-propose must explicitly decide to relocate the entry point to Header.
- `openspec/config.yaml` context block is stale and may mislead downstream phases if taken literally.
- `AboutModal.tsx` author content is hardcoded, not i18n-driven — any blind file-level port risks silently overwriting electronica's own author names; must be an explicit exclusion in tasks.md.
- `html-to-image` is a new runtime dependency requiring a `package.json`/lockfile update task.
- No source GOR report exists for electronica — any L2–L4 content beyond what `TECHNOLOGIES` already covers would be fabrication; sdd-spec/sdd-design must make "empty state is acceptable and honest" an explicit, testable requirement for sdd-verify.

## Open Decision for Proposal

Confirm L1 is populated 1:1 from `TECHNOLOGIES` (matching telecom's technique) and that L2–L4 stay empty (native empty state) until electronica's own GOR report is delivered.

## Ready for Proposal

Yes.
