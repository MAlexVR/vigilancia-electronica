/**
 * TrajectoryMap rendered with electronicaConfig + buildElectronicaTrajectory().
 *
 * Verifies the honest-empty-layer contract (spec: "Honest Empty State for
 * Unsourced Layers"): Layer 1 (Tecnologías) renders real nodes, while Layers
 * 2–4 render only the trajectory engine's own already-shipped (PR2) native
 * empty-state copy — no new component, badge, or "avance"/"pendiente" text is
 * introduced by this change.
 *
 * NOTE on the exact empty-state string: for electronica's real dataset every
 * driver (D1–D5) has at least one Layer-1 item (TECHNOLOGIES covers all 5
 * sectors), so the driver-level "No hay ítems para este driver." message in
 * TrajectoryMap.tsx never fires — that message only renders when a driver has
 * literally zero items across ALL layers. The per-layer emptiness of L2–L4
 * instead surfaces through TrajectoryLane's own already-shipped native
 * empty-layer copy, "Sin ítems en esta capa." This is still the engine's
 * native mechanism (unmodified since PR2) — no new UI surface was added for
 * this batch.
 *
 * NOTE on the expected count (6, not 3): TrajectoryMap instantiates two
 * separate <TrajectoryLane> trees per layer (one for the desktop grid
 * section, one for the phone accordion section), and each TrajectoryLane
 * always renders its own internal mobile-accordion copy of the empty-layer
 * text regardless of which section it was mounted from. That duplication is
 * pre-existing PR2 engine behavior, unmodified by this change — 3 empty
 * layers (L2, L3, L4) × 2 duplicate trees = 6 occurrences.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrajectoryMap } from "@/components/trajectory";
import {
  electronicaConfig,
  buildElectronicaTrajectory,
} from "./trajectory-data.electronica";

const dataset = buildElectronicaTrajectory();

/** Returns all rendered node buttons whose aria-label contains `title`. */
function findNodeButtons(title: string): HTMLElement[] {
  return screen
    .getAllByRole("button")
    .filter((btn) => btn.getAttribute("aria-label")?.includes(title));
}

function assertHonestEmptyLayerPattern(driverKey: string) {
  const driverL1Items = dataset.items.filter(
    (i) => i.driver === driverKey && i.layer === "L1"
  );
  expect(driverL1Items.length).toBeGreaterThan(0);

  // Layer 1 nodes are real, data-derived buttons.
  const firstTitle = driverL1Items[0].title;
  expect(findNodeButtons(firstTitle).length).toBeGreaterThan(0);

  // Layers 2–4 have zero items for every driver (see PENDING marker) — the
  // engine's own already-shipped per-layer empty copy renders instead.
  expect(screen.getAllByText("Sin ítems en esta capa.")).toHaveLength(6);

  // The driver-level empty state never fires because every driver has L1 items.
  expect(screen.queryByTestId("trajectory-empty-state")).toBeNull();

  // No electronica-specific "avance"/"pendiente" text exists anywhere in the
  // rendered map — the anti-fabrication guarantee from the spec.
  expect(screen.queryByText(/avance/i)).toBeNull();
  expect(screen.queryByText(/pendiente/i)).toBeNull();
}

describe("TrajectoryMap + electronicaConfig (honest empty-layer contract)", () => {
  it("renders real Layer 1 nodes for the initial driver (D1) and the native empty-layer copy for L2–L4, with no fabricated text", () => {
    render(<TrajectoryMap config={electronicaConfig} dataset={dataset} />);
    assertHonestEmptyLayerPattern("D1");
  });

  it("shows the same honest pattern after switching to a different driver (D3)", async () => {
    const user = userEvent.setup();
    render(<TrajectoryMap config={electronicaConfig} dataset={dataset} />);

    await user.click(screen.getByRole("tab", { name: /^D3/ }));

    assertHonestEmptyLayerPattern("D3");
  });
});
