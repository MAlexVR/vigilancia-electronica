import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { TrajectoryMapCard } from "./TrajectoryMapCard";

describe("TrajectoryMapCard", () => {
  it("shows a visible entry point labeled 'Mapa de trayectoria tecnológica'", () => {
    render(<TrajectoryMapCard />);

    expect(
      screen.getByText("Mapa de trayectoria tecnológica"),
    ).toBeInTheDocument();
  });

  it("displays Spanish copy stating the source report has not been delivered yet, and no fabricated data", () => {
    render(<TrajectoryMapCard />);

    expect(
      screen.getByText(/aún no ha sido\s*entregado/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  });

  it("includes a PENDING code comment naming the missing source report as the blocker", () => {
    const filePath = path.join(
      process.cwd(),
      "src/components/molecules/TrajectoryMapCard.tsx",
    );
    const source = readFileSync(filePath, "utf-8");

    expect(source).toMatch(/PENDING:/);
    expect(source).toMatch(/Vigilancia_Cientifico-Tecnologica_Electronica_2026\.pptx/);
  });
});
