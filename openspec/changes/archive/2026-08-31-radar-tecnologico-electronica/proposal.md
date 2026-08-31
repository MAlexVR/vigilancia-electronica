# Proposal: Radar Tecnológico — Área de Electrónica (CEET)

## Intent

The Electronics area of CEET has completed its 2026–2036 tech-watch study (5 direccionadores, 25 líneas, 75 sublíneas) but it exists only as a pptx/xlsx, unusable for instructors, curriculum committees, and stakeholders. Telecom and Electricity already ship interactive radars; Electronics has none. Deliver an equivalent Next.js radar so the study is explorable, exportable, and institutionally consistent.

**Target output format**: Next.js web app (not a static document), matching both sibling radars.

## Scope

### In Scope
- New Next.js app forked from `radar_tecnologico` v5 architecture (core/, ingest-xlsx, Header/Footer, i18n, Storybook, Vitest).
- Electronics dataset: 5 sectors (D1–D5), 25 items (L01–L25), 4 institutional rings; ring/TRL/impact/horizon manually curated from `PRINCIPALES TENDENCIAS` prose with a documented heuristic.
- `2026-2036` branding across UI copy and export filenames.
- Expandable panel in existing `TechDetail` exposing `metadata.sublines` + full `metadata.tendencias`; short summary stays in `description`.
- `ÁREAS TECNOLÓGICAS` folded into sector description/metadata — no new schema fields.
- `AboutModal` ported from `radar_tecnologico_electricidad`, content-edited to 2 autores (Óscar Andrés Pulido Casallas, Diana Cristina Limas Ramirez — Instructores, Área de Electrónica) + coautor (Mauricio Alexander Vargas Rodríguez).
- Visible Spanish placeholder for "Mapa de trayectoria tecnológica" stating content is pending, plus a `PENDING:` code comment.

### Out of Scope
- Trajectory-map **data/visualization** — only the placeholder ships.
- Backporting v5 architecture into the two sibling radars.
- Automated NLP extraction of TRL/ring from narrative text.
- Modifying the source pptx/xlsx.
- New geometry/layout code (25/5 fits existing SVG math).

## Capabilities

### New Capabilities
- `radar-dataset`: Electronics domain data, curation rules, and schema mapping.
- `radar-application`: app shell, composition, exports, `2026-2036` branding.
- `tech-detail-expansion`: sublíneas + full tendencias reveal inside `TechDetail`.
- `authorship-attribution`: About modal authorship content and structure.
- `trajectory-map-placeholder`: honest pending-content section.

### Modified Capabilities
- None (no existing specs in `openspec/specs/`).

## Approach

Exploration Approach 3 (hybrid): fork v5 for architecture fidelity; port electricidad's `AboutModal.tsx` near-verbatim for authorship fidelity. The two constraints touch disjoint files, so no tradeoff. Data flows: source xlsx → hand-curated 3-sheet intermediate xlsx (`docs/data-template.md` contract) → `npm run data:build` → `public/data/ceet-electronica.json` → existing `radar-data.ts` adapter.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| repo root | New | Next.js app scaffolded in-place |
| `public/data/ceet-electronica.json` | New | Generated dataset |
| `src/components/molecules/AboutModal.tsx` | New | Ported + content-edited |
| `src/components/organisms/TechDetail.tsx` | Modified | Expandable panel |
| `src/components/templates/RadarTemplate.tsx` | Modified | Branding, export names, placeholder |
| `docs/` | Existing | Sources kept read-only |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Subjective ring/TRL curation across 25 líneas | High | Documented heuristic in design; author review before archive |
| Long tendencias text breaks layout | Med | Summary in `description`, full text only in expandable panel |
| Ported AboutModal classes drift from v5 theme tokens | Low | Visual check against `globals.css` at apply time |
| Author name spelling differs from pptx | Low | User-provided spelling is authoritative |
| Placeholder mistaken for missing feature | Med | Explicit Spanish copy naming the pending source report |
| >800-line review budget | High | Chained PR slices: scaffold → dataset → UI deltas |

## Rollback Plan

App is greenfield and additive: delete the generated app files to revert. Source `docs/*.pptx|xlsx` are never written; if any curation script must read them, it opens read-only. Dataset regressions revert by restoring the prior `public/data/ceet-electronica.json`.

## Dependencies

- Read access to `E:\Repositorio\radar_tecnologico` (v5 skeleton) and `..._electricidad` (AboutModal).
- Node/npm toolchain (absent today — repo has no package manager yet).
- Trajectory-map source report (blocks only the deferred follow-up, not this change).

## Success Criteria

- [ ] App builds and renders 5 sectors / 25 líneas with 2026–2036 branding.
- [ ] Every línea exposes its 3 sublíneas and full tendencias via the expandable panel.
- [ ] About modal shows exactly the 2 autores + 1 coautor strings specified.
- [ ] Trajectory-map placeholder is visible, honest, and code-commented; no fabricated data.
- [ ] Composition, theme, and export flows visually match the reference radar.
