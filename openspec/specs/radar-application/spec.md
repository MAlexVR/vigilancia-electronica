# Radar Application Specification

## Purpose

Defines the Next.js app shell for the Electronics radar: architecture fidelity
to the `radar_tecnologico` v5 reference project, and the 2026–2036 time-horizon
branding that replaces the reference's 2025–2035 branding everywhere it
appears.

## Requirements

### Requirement: Reference Architecture Fidelity

The system MUST be scaffolded in-place at the repository root by forking the
`radar_tecnologico` v5 architecture (Next.js App Router, `src/core/`
`RadarSchema`, `tools/ingest-xlsx` pipeline) and MUST reuse the same
composition: `Header` → `RadarChart` + `TechDetail` + `NomenclatureTable` +
`RadarLegend` (desktop rail) → `Footer`.

#### Scenario: App composition matches the reference project

- GIVEN the running Electronics radar app
- WHEN the page renders on desktop
- THEN Header, RadarChart, TechDetail, NomenclatureTable, RadarLegend, and Footer are all present and composed the same way as in `radar_tecnologico`

#### Scenario: App is scaffolded at the repository root

- GIVEN the repository `E:\Repositorio\radar_tecnologico_electronica`
- WHEN the file tree is inspected after scaffolding
- THEN Next.js app files sit alongside the existing `docs/` and `openspec/` directories, not inside a new subdirectory

### Requirement: 2026–2036 Time Horizon Branding

The system MUST display "2026-2036" everywhere the reference project displays
"2025-2035", including UI header/footer copy and generated export filenames.
The system MUST NOT display "2025-2035" anywhere in the Electronics app.

#### Scenario: Header/footer show the correct horizon

- GIVEN the rendered Electronics radar app
- WHEN a user reads the header and footer copy
- THEN the displayed time horizon reads "2026-2036" and "2025-2035" does not appear anywhere

#### Scenario: Exported file names use the correct horizon

- GIVEN a user triggers a PNG or PDF export
- WHEN the exported file name is inspected
- THEN it contains "2026-2036" and does not contain "2025-2035"
