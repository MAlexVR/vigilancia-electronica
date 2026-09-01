# Proposal: Align Trajectory Map and Radar drift with vigilancia-telecomunicaciones

## Intent

`vigilancia-electronica` ships a 37-line pending card where its sibling `vigilancia-telecomunicaciones` ships a full Trajectory Map, so CEET area apps look inconsistent. Electrónica has **no GOR report yet** for layers L2–L4, so the real component must ship with *avance* content only — never fabricated data.

## Scope

### In Scope

- Port engine `src/lib/trajectory/*` and UI `src/components/trajectory/*` verbatim, with tests/stories.
- New `src/lib/trajectory-data.electronica.ts`: **L1 Tecnologías populated 1:1 from the real `TECHNOLOGIES`** (telecom's technique); **L2–L4 EMPTY**, using the engine's native per-driver empty state. No engine or type change.
- Replace the inline `TrajectoryMapCard` (`RadarTemplate.tsx` ~L265, `MobileLayout.tsx` ~L186) with a Header-triggered `TrajectoryModal` matching telecom; delete card + test.
- `HelpModal.tsx` trajectory section; `messages/es.json` `header.trajectory` + `trajectory` namespace.
- `html-to-image` dependency and `downloadElementAsPDF` in `src/core/{export,index}.ts`.
- Restructure `README.md` to telecom's section format, keeping Electrónica's own content (authors, area scope, links).
- Update the GitHub repo **description** (About) of `MAlexVR/vigilancia-electronica` via `gh repo edit --description` to the CEET wording.
- All Spanish output: neutral register, **no voseo**.

### Out of Scope

- Fabricating L2–L4 content before Electrónica's GOR report exists.
- Editing `AboutModal.tsx` author/attribution content.
- Changing the shared `TrajectoryItem` type (no `status/avance` field).
- Changing telecom/electricidad repos, or the repo homepage field.

## Capabilities

### New Capabilities
- `technology-trajectory-map`: real map (engine + modal + Header entry) rendering L1 from radar data and honest empty states for unsourced layers.
- `project-presentation`: README structure and GitHub repository description.

### Modified Capabilities
- `trajectory-map-placeholder`: Requirement 2 ("no trajectory chart… is shown") **REMOVED** — it conflicts directly with shipping the real chart. Requirement 1 **MODIFIED** (entry point moves to Header). Requirement 3 (`PENDING:` marker) **REMOVED** or narrowed to unpopulated layers.

## Approach

Exploration Approach 1: copy the proven, domain-free engine/components and isolate all domain knowledge in one adapter. Honesty comes from *absence of data*, not new code paths — the engine already renders `"No hay ítems para este driver."`. Zero shared-contract change keeps Electrónica consistent with telecom and electricidad.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/trajectory/*`, `src/components/trajectory/*` | New | Engine + UI ported verbatim |
| `src/lib/trajectory-data.electronica.ts` | New | Adapter: L1 real, L2–L4 empty |
| `src/components/molecules/TrajectoryModal.tsx` | New | Dialog + PDF export |
| `src/components/molecules/TrajectoryMapCard.tsx` (+ test) | Removed | Superseded |
| `organisms/Header.tsx`, `templates/{RadarTemplate,MobileLayout}.tsx`, `molecules/HelpModal.tsx` | Modified | Modal entry point, drop card, education section |
| `messages/es.json`, `src/core/{export,index}.ts`, `package.json` | Modified | i18n, PDF plumbing, `html-to-image` |
| `README.md`, GitHub About | Modified | Structure/wording alignment |
| `molecules/AboutModal.tsx` | **Untouched** | Authorship preserved |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Blind port overwrites Electrónica authorship | Med | `AboutModal.tsx` explicit non-goal in tasks.md |
| Placeholder-spec contradiction unresolved | Med | Explicit REMOVED/MODIFIED delta with Reason/Migration |
| Empty L2–L4 read as a bug | Med | Testable requirement: empty state is correct and honest |
| Voseo leaks into Spanish copy | Low | Constraint restated in spec/design/tasks |
| Stale `openspec/config.yaml` context | Med | Ignore its "not a codebase" claim |

## Rollback Plan

Feature branch; revert the chained PRs to restore `TrajectoryMapCard.tsx` + test and template usages, run `npm remove html-to-image` with lockfile restore, and reset `gh repo edit --description` to the previous string. The placeholder delta merges into `openspec/specs/` only at archive, so an unarchived rollback leaves main specs intact.

## Dependencies

- `html-to-image@^1.11.13`.
- Read access to `E:\Repositorio\radar_tecnologico` for the port.
- Electrónica GOR report — external, **not** blocking; unblocks L2–L4 later.

## Success Criteria

- [ ] Map opens from the Header (desktop + mobile) with telecom's component/visual system.
- [ ] L1 shows one node per real `TECHNOLOGIES` entry; L2–L4 show the empty state; zero fabricated items.
- [ ] `TrajectoryMapCard` + test removed, no template references remain.
- [ ] `AboutModal.tsx` diff is empty.
- [ ] PDF export works; tests and build pass.
- [ ] `README.md` matches telecom's section structure with Electrónica's content; GitHub About updated.
- [ ] No voseo in any Spanish string, comment, or doc.
