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

/**
 * How many times the engine renders its empty-layer copy per empty layer
 * (desktop grid + phone accordion). Measured on a throwaway map whose L2–L4
 * are all empty, so the test does not hard-code the engine's layout.
 */
function emptyCopiesPerLayer(): number {
  const l1Only = { items: dataset.items.filter((i) => i.layer === "L1") };
  const { unmount } = render(<TrajectoryMap config={electronicaConfig} dataset={l1Only} />);
  const copies = screen.queryAllByText("Sin ítems en esta capa.").length / 3;
  unmount();
  return copies;
}

function layerCount(driverKey: string, layer: string) {
  return dataset.items.filter((i) => i.driver === driverKey && i.layer === layer).length;
}

function assertDriverRendering(driverKey: string, copies: number) {
  const driverL1Items = dataset.items.filter(
    (i) => i.driver === driverKey && i.layer === "L1"
  );
  expect(driverL1Items.length).toBeGreaterThan(0);

  // Layer 1 nodes are real, data-derived buttons.
  expect(findNodeButtons(driverL1Items[0].title).length).toBeGreaterThan(0);

  // Every transcribed L2–L4 item of the driver renders as a node.
  for (const item of dataset.items.filter((i) => i.driver === driverKey && i.layer !== "L1")) {
    expect(findNodeButtons(item.title).length, item.id).toBeGreaterThan(0);
  }

  // Layers without items for this driver keep the engine's native empty copy
  // (each lane renders it twice: desktop grid + phone accordion).
  const emptyLayers = ["L2", "L3", "L4"].filter((l) => layerCount(driverKey, l) === 0).length;
  expect(screen.queryAllByText("Sin ítems en esta capa.")).toHaveLength(emptyLayers * copies);

  // The driver-level empty state never fires because every driver has L1 items.
  expect(screen.queryByTestId("trajectory-empty-state")).toBeNull();

  // No electronica-specific "avance"/"pendiente" text in the rendered map.
  expect(screen.queryByText(/avance/i)).toBeNull();
  expect(screen.queryByText(/pendiente/i)).toBeNull();
}

describe("TrajectoryMap + electronicaConfig (layers sourced from the informe)", () => {
  it("renders Layer 1 and the transcribed L2–L4 nodes for the initial driver (D1)", () => {
    const copies = emptyCopiesPerLayer();
    expect(copies).toBeGreaterThan(0);
    render(<TrajectoryMap config={electronicaConfig} dataset={dataset} />);
    assertDriverRendering("D1", copies);
  });

  it("keeps the native empty-layer copy where a driver has no items (D3 has no L2)", async () => {
    const user = userEvent.setup();
    const copies = emptyCopiesPerLayer();
    render(<TrajectoryMap config={electronicaConfig} dataset={dataset} />);

    await user.click(screen.getByRole("tab", { name: /^D3/ }));

    expect(layerCount("D3", "L2")).toBe(0);
    assertDriverRendering("D3", copies);
  });
});
