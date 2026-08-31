# Trajectory Map Placeholder Specification

## Purpose

Defines the honest, visible placeholder for "Mapa de trayectoria tecnológica"
(source pptx agenda item 4, whose content slide is empty), ensuring no
fabricated trajectory data ships before the source report is delivered.

## Requirements

### Requirement: Visible Pending-Content Placeholder

The application MUST include a visible "Mapa de trayectoria tecnológica"
section or entry point. The system MUST NOT hide, omit, or disable this
section without explanation.

#### Scenario: User finds the trajectory map section

- GIVEN a user browsing the Electronics radar app
- WHEN they look for the "Mapa de trayectoria tecnológica" section
- THEN a visible section or entry point with that label exists and is reachable

### Requirement: Honest Pending-Content Message

The trajectory map section MUST display Spanish copy explicitly stating that
the corresponding source report has not been delivered yet. The system MUST
NOT render any fabricated, placeholder-generated, or estimated trajectory
data in its place.

#### Scenario: User opens the section and sees the pending message

- GIVEN a user opens the "Mapa de trayectoria tecnológica" section
- WHEN the section content renders
- THEN it displays Spanish text stating the source report has not been delivered yet, and no trajectory chart, timeline, or fabricated data is shown

### Requirement: Code Comment Marking Future Completion

The source code implementing the placeholder MUST include a code comment
identifying it as pending and referencing what unblocks it (the missing
source report / pptx agenda item), so a future contributor can find and
complete it.

#### Scenario: Developer finds the pending marker in source

- GIVEN a developer reads the trajectory-map placeholder's source file
- WHEN they inspect the placeholder implementation
- THEN a `PENDING:` (or equivalent) code comment is present, naming the missing source report as the blocker for completion
