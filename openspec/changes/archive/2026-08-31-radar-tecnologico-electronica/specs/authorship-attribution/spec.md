# Authorship Attribution Specification

## Purpose

Defines the "Acerca de" (About) modal content for the Electronics radar,
ported from `radar_tecnologico_electricidad`'s `AboutModal.tsx` structure with
Electronics-specific authorship text.

## Requirements

### Requirement: Modal Structure Fidelity

The About modal MUST reuse the structure of
`radar_tecnologico_electricidad`'s `AboutModal.tsx` (logo, Entidad/Centro/
Regional/Grupo I+D table with "CEET" and its tooltip, intro paragraph, footer
copyright), content-edited only where authorship or area-specific text
requires it.

#### Scenario: Modal shows the shared institutional structure

- GIVEN a user opens the About modal
- WHEN the modal content is inspected
- THEN it shows the logo, the Entidad/Centro/Regional/Grupo I+D table with "CEET", and a footer copyright, matching the ported structure

### Requirement: Autores Content

The About modal MUST list exactly two autores, verbatim: "Ing. Óscar Andrés
Pulido Casallas" and "Ing. Diana Cristina Limas Ramirez", each attributed as
"Instructores — Área de Electrónica". This spelling is authoritative
regardless of any differing spelling in the source pptx.

#### Scenario: Both autores appear with exact spelling and role

- GIVEN a user opens the About modal
- WHEN the "Autores" section is read
- THEN it lists exactly "Ing. Óscar Andrés Pulido Casallas" and "Ing. Diana Cristina Limas Ramirez", both labeled "Instructores — Área de Electrónica"

### Requirement: Coautor Content

The About modal MUST list exactly one coautor, verbatim: "Ing. Mauricio
Alexander Vargas Rodríguez, MSc., MBA Esp. PM." attributed as "Instructor
G14 — Área de Telecomunicaciones".

#### Scenario: Coautor appears with exact spelling and role

- GIVEN a user opens the About modal
- WHEN the "Coautor" section is read
- THEN it shows exactly "Ing. Mauricio Alexander Vargas Rodríguez, MSc., MBA Esp. PM." labeled "Instructor G14 — Área de Telecomunicaciones"
