# Technology Trajectory Map Specification

## Purpose

Defines the real Trajectory Map feature for vigilancia-electronica: the
ported engine/UI (from vigilancia-telecomunicaciones), a domain adapter that
populates Layer 1 ("Tecnologías") from real `TECHNOLOGIES` data, and honest
empty states for Layers 2–4 (Infraestructura, Talento e I+D+i, Alianzas)
until Electrónica's own GOR report exists. No fabricated data is ever
rendered.

Non-goal: this capability does not modify `AboutModal.tsx` author or
attribution content — that content is governed by the existing
`authorship-attribution` specification and stays untouched.

## Requirements

### Requirement: Real Layer 1 Data

The system MUST populate Layer 1 ("Tecnologías") of the Trajectory Map with
exactly one trajectory item per entry in electronica's existing
`TECHNOLOGIES` array. The system MUST NOT include any fabricated, estimated,
or externally sourced item in Layer 1.

#### Scenario: Layer 1 item count matches TECHNOLOGIES

- GIVEN electronica's `TECHNOLOGIES` array with N entries
- WHEN the Trajectory Map dataset for Layer 1 is built
- THEN it contains exactly N items, one per `TECHNOLOGIES` entry, traceable
  back to that entry

#### Scenario: No fabricated Layer 1 content

- GIVEN the Trajectory Map dataset for Layer 1
- WHEN any item's fields are inspected
- THEN every field derives from an existing `TECHNOLOGIES` entry, with no
  invented sectors, gaps, or metrics

### Requirement: Honest Empty State for Unsourced Layers

The system MUST render Layers 2–4 using only the trajectory engine's
existing generic per-driver empty state when a driver has zero items. The
system MUST NOT render any additional "avance"/"pendiente" banner, badge, or
explanatory copy for these layers anywhere in the rendered UI.

#### Scenario: Empty layer shows only the engine's generic empty state

- GIVEN a user selects any driver on Layer 2, 3, or 4
- WHEN that layer has no items for the selected driver
- THEN the engine's generic empty-state text renders (the same text used by
  telecomunicaciones' TrajectoryMap for a zero-item driver) and no
  additional pending/avance copy, badge, or banner is shown anywhere in the
  modal

#### Scenario: No app-specific empty-state override exists

- GIVEN the rendered Trajectory Map UI for Layers 2–4
- WHEN the DOM/markup is inspected
- THEN no electronica-specific "avance" or "pendiente" text node exists
  outside the engine's own empty-state element

### Requirement: PDF Export Availability

The Trajectory Modal MUST offer a PDF export action that functions
regardless of how many layers currently contain data, matching
telecomunicaciones' export behavior and using the same underlying
`downloadElementAsPDF` utility.

#### Scenario: Export succeeds with partially empty data

- GIVEN the Trajectory Modal is open with Layer 1 populated and Layers 2–4
  empty
- WHEN the user clicks the export action
- THEN a PDF download of the visible map is produced with no error and no
  gating on data completeness

### Requirement: Attribution Non-Regression

This change MUST NOT modify the About modal's authorship or attribution
content.

#### Scenario: About modal content is unchanged

- GIVEN the repository's version control history for this change
- WHEN `src/components/molecules/AboutModal.tsx` is diffed against its
  pre-change state
- THEN the diff is empty

### Requirement: Neutral Spanish, No Voseo

Any new Spanish UI copy or code comment introduced by this change MUST use
neutral/standard Spanish register and MUST NOT use voseo forms ("vos",
"tenés", "podés", "sos", or equivalents).

#### Scenario: New Spanish strings avoid voseo

- GIVEN all new or modified Spanish strings introduced by this change (UI
  copy, `messages/es.json` entries, code comments)
- WHEN they are scanned for voseo verb forms and pronouns
- THEN none are present
