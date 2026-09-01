# Delta for Trajectory Map Placeholder

## REMOVED Requirements

### Requirement: Honest Pending-Content Message

(Reason: Superseded. The real Trajectory Map component now renders for every
user. Layer 1 ("Tecnologías") is populated with genuinely real data from
electronica's existing `TECHNOLOGIES` array — no fabricated, placeholder-
generated, or estimated data is ever introduced. The absolute prohibition on
rendering "any trajectory chart, timeline" is no longer accurate: a real
chart now ships, honestly, alongside empty layers where no source data
exists yet.)
(Migration: See the new `technology-trajectory-map` capability's "Real Layer
1 Data" and "Honest Empty State for Unsourced Layers" requirements, which
replace this prohibition with a data-honesty guarantee that does not require
withholding the chart itself.)

## RENAMED Requirements

### Requirement: Visible Pending-Content Placeholder → Trajectory Map Entry Point

(Reason: The entry point is no longer a "pending-content placeholder"; it is
a real, working feature entry point that moved from an inline card to a
Header-triggered action, matching telecomunicaciones' integration pattern.)
(Migration: See the MODIFIED "Trajectory Map Entry Point" requirement below
for the updated behavior.)

## MODIFIED Requirements

### Requirement: Trajectory Map Entry Point

The application MUST include a visible "Trayectoria" entry point in the
Header, reachable on both desktop and mobile layouts, that opens the
Trajectory Map modal. The system MUST NOT hide, omit, or disable this entry
point without explanation.

(Previously: "Visible Pending-Content Placeholder" — an inline "Mapa de
trayectoria tecnológica" card/details element embedded in `RadarTemplate.tsx`
and `MobileLayout.tsx`. Behavior is now a Header-triggered modal.)

#### Scenario: User opens the trajectory map from the Header (desktop)

- GIVEN a user browsing the Electronics radar app on a desktop viewport
- WHEN they open the Header and select the "Trayectoria" action
- THEN the Trajectory Map modal opens

#### Scenario: User opens the trajectory map from the Header (mobile)

- GIVEN a user browsing the Electronics radar app on a mobile viewport
- WHEN they open the Header mobile menu and select the "Trayectoria" action
- THEN the Trajectory Map modal opens

#### Scenario: Inline placeholder card no longer exists

- GIVEN the RadarTemplate desktop sidebar and MobileLayout mobile tabs
- WHEN the templates render
- THEN no inline `TrajectoryMapCard` element is present in either template

### Requirement: Code Comment Marking Future Completion

The source file providing Layer 2–4 trajectory data
(`src/lib/trajectory-data.electronica.ts`) MUST include a `PENDING:` (or
equivalent) code comment identifying which layers remain unpopulated and
naming the missing Electrónica GOR source report that unblocks them, so a
future contributor or AI agent can find and complete it. Layer 1
(Tecnologías) is exempt from this marker because it is fully populated from
real data.

(Previously: the `PENDING:` marker lived in the now-removed
`TrajectoryMapCard.tsx` placeholder component and referenced the missing
pptx content slide directly.)

#### Scenario: Developer finds the pending marker in the data adapter

- GIVEN a developer reads `src/lib/trajectory-data.electronica.ts`
- WHEN they inspect the file for Layers 2–4 (Infraestructura, Talento e
  I+D+i, Alianzas)
- THEN a `PENDING:` (or equivalent) code comment is present, naming the
  missing Electrónica GOR source report as the blocker and stating where
  Layer 2–4 items should be added once it is delivered

#### Scenario: Layer 1 has no pending marker

- GIVEN a developer reads `src/lib/trajectory-data.electronica.ts`
- WHEN they inspect the Layer 1 (Tecnologías) section
- THEN no `PENDING:` marker is attached to it, since Layer 1 is populated
  from real `TECHNOLOGIES` data
