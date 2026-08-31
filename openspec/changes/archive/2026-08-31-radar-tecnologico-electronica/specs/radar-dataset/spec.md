# Radar Dataset Specification

## Purpose

Defines the manually-curated Electronics tech-watch dataset (5 direccionadores,
25 líneas tecnológicas, 75 sublíneas) and its mapping into the reference
project's `RadarSchema` (rings/sectors/items/metadata).

## Requirements

### Requirement: Sector Mapping

The system MUST represent each of the 5 `DIRECCIONADORES DEL DESARROLLO`
(D1–D5) from the Electronics source as one `RadarSchema` sector, with the
direccionador title as `sector.label`.

#### Scenario: All five direccionadores render as sectors

- GIVEN the generated Electronics dataset JSON
- WHEN the radar chart renders
- THEN exactly 5 sectors are present, labeled D1 through D5 per the source pptx/xlsx

### Requirement: Item Mapping with Curated Ring/TRL/Impact/Horizon

The system MUST represent each of the 25 `LÍNEAS TECNOLÓGICAS` (L01–L25) as one
`RadarSchema` item, assigned to its owning direccionador's sector, with
`ringId`, `trlValue`, `impact`, and `horizon` values manually curated from that
línea's `PRINCIPALES TENDENCIAS` narrative (no automated NLP extraction).

#### Scenario: All 25 líneas render as items with a ring assignment

- GIVEN the generated Electronics dataset JSON
- WHEN the radar chart renders
- THEN exactly 25 items are present, each assigned to one of the 4 rings and one of the 5 sectors

#### Scenario: Curated values are traceable, not fabricated

- GIVEN a línea's curated `ringId`/`trlValue`/`impact`/`horizon`
- WHEN the curation rationale is inspected
- THEN each value MUST be justifiable by evidence in that línea's `PRINCIPALES TENDENCIAS` text (e.g. an explicit TRL/maturity phrase)

### Requirement: Ring Taxonomy

The system MUST use exactly the 4 institutional rings shared with the sibling
radars: ADOPTAR, PROBAR, EVALUAR, MONITOREAR. The system MUST NOT introduce
additional or renamed rings.

#### Scenario: Legend lists the 4 institutional rings

- GIVEN the rendered radar legend
- WHEN a user reads the ring names
- THEN the 4 rings shown are exactly ADOPTAR, PROBAR, EVALUAR, MONITOREAR

### Requirement: Sublíneas and Tendencias Metadata

Each item's `metadata` MUST include a `sublines` array of the 3 `SUBLÍNEAS
TECNOLÓGICAS` text entries belonging to that línea, and a `tendencias` field
holding the full, unabridged `PRINCIPALES TENDENCIAS` narrative for that línea.
`item.description` MUST hold only a short curated summary, not the full
narrative.

#### Scenario: Item metadata carries 3 sublines and full narrative

- GIVEN any of the 25 items in the dataset
- WHEN `item.metadata` is inspected
- THEN `metadata.sublines` contains exactly 3 entries and `metadata.tendencias` contains the complete, unabridged source narrative text for that línea

#### Scenario: Description stays short

- GIVEN any of the 25 items in the dataset
- WHEN `item.description` length is checked
- THEN it MUST be a short summary suitable for the normal (non-expanded) `TechDetail` view, not the full tendencias text

### Requirement: Áreas Tecnológicas Folding

The `ÁREAS TECNOLÓGICAS` source column (one per direccionador) MUST be folded
into `schema.metadata.sectorAreas`, a schema-level `Record<SectorId, string>`
map keyed by each sector's id, using the existing `RadarSchema.metadata`
free-form bag. `RadarSector` MUST NOT gain new fields (it has neither
`description` nor `metadata`), and the system MUST NOT introduce any other new
top-level schema fields to represent this tier.

#### Scenario: Área tecnológica text is retrievable per sector via schema metadata

- GIVEN a direccionador's `ÁREAS TECNOLÓGICAS` source text
- WHEN the generated dataset JSON is inspected
- THEN that text is present at `schema.metadata.sectorAreas[sectorId]` for the corresponding sector's id, `RadarSector` itself gained no new field, and no other new schema field was added to hold it
