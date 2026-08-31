# Tech Detail Expansion Specification

## Purpose

Defines how sublíneas and the full tendencias narrative are revealed for a
selected item, inside the existing `TechDetail` component, without
introducing a new route or screen.

## Requirements

### Requirement: Short Summary in Normal View

When a user selects an item, `TechDetail` MUST display the item's short
curated `description` by default. The full tendencias narrative and the
sublíneas list MUST NOT be shown until the user explicitly expands the panel.

#### Scenario: Selecting an item shows only the short summary

- GIVEN a user selects one of the 25 items on the radar
- WHEN `TechDetail` renders
- THEN only the short `description` summary is visible, and the full tendencias text and sublíneas list are not shown

### Requirement: Expandable Panel Reveals Sublíneas and Tendencias

`TechDetail` MUST provide an expandable panel that, when opened, displays the
item's 3 sublíneas (`metadata.sublines`) and the complete, unabridged
tendencias narrative (`metadata.tendencias`). The panel MUST be collapsible
back to the summary view.

#### Scenario: Expanding the panel reveals full content

- GIVEN a user has selected an item and `TechDetail` is showing the short summary
- WHEN the user activates the expand control
- THEN the panel shows all 3 sublíneas entries and the complete tendencias narrative text

#### Scenario: Collapsing the panel hides the full content again

- GIVEN the expandable panel is open and showing sublíneas/tendencias
- WHEN the user activates the collapse control
- THEN the panel closes and only the short summary remains visible

### Requirement: No New Route or Screen

The sublíneas/tendencias reveal MUST be implemented as an in-place expansion
of the existing `TechDetail` component. The system MUST NOT introduce a new
page route, modal-as-navigation, or separate screen for this content.

#### Scenario: Expansion does not navigate away

- GIVEN a user is viewing an item's `TechDetail` panel
- WHEN the user expands the panel to see sublíneas/tendencias
- THEN the browser URL/route does not change and the user remains on the same radar page
