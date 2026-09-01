# Project Presentation Specification

## Purpose

Defines how vigilancia-electronica presents itself publicly — the
`README.md` structure and the GitHub repository description — aligned with
sibling app vigilancia-telecomunicaciones' presentation conventions while
preserving Electrónica-specific content.

## Requirements

### Requirement: README Structure Alignment

The `README.md` MUST follow the same top-level section/heading structure as
vigilancia-telecomunicaciones' `README.md`, while preserving all
Electrónica-specific content (authors, area scope, links).

#### Scenario: README section headings match telecom's structure

- GIVEN vigilancia-electronica's `README.md`
- WHEN its top-level section headings are compared to
  vigilancia-telecomunicaciones' `README.md`
- THEN the same section structure is present, in the same order

#### Scenario: Electrónica-specific content is preserved

- GIVEN the restructured `README.md`
- WHEN its content is inspected
- THEN it retains Electrónica's own authors, area scope, and links exactly
  as before, only reorganized into the new structure

### Requirement: GitHub Repository Description Update

The GitHub repository description ("About" field) of
`MAlexVR/vigilancia-electronica` MUST be updated to the CEET-aligned wording
matching vigilancia-telecomunicaciones' description style.

#### Scenario: Repository description matches the CEET wording

- GIVEN the GitHub repository `MAlexVR/vigilancia-electronica`
- WHEN its "About" description is inspected via `gh repo view`
- THEN it reads "Aplicación web interactiva para la vigilancia
  científico-tecnológica y prospectiva del área de Electrónica del Centro de
  Electricidad, Electrónica y Telecomunicaciones (CEET) del SENA, Bogotá
  D.C."

### Requirement: Neutral Spanish in Presentation Content

The `README.md` and repository description MUST use neutral/standard
Spanish, with no voseo forms.

#### Scenario: Presentation text avoids voseo

- GIVEN the updated `README.md` and repository description
- WHEN scanned for voseo verb forms and pronouns
- THEN none are present
