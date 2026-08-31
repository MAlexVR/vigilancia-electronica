import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TechDetail } from "./TechDetail";
import type { Technology } from "@/types/radar";

const BASE_TECH: Technology = {
  id: "T01",
  name: "IIoT, Industria 4.0/5.0 y modernización de SCADA",
  code: "L01",
  sector: 0,
  ring: 1,
  angleOff: -26,
  trl: 7,
  desc: "Resumen corto curado de la tecnología.",
  impact: "Medio",
  horizon: "Corto (1-3 años)",
};

const TECH_WITH_METADATA: Technology = {
  ...BASE_TECH,
  sublines: [
    "Sensórica y actuación conectada sobre redes 5G/TSN/OPC-UA",
    "Modernización de sistemas SCADA heredados hacia la nube y el borde",
    "Gemelos digitales orientados a la Industria 5.0",
  ],
  tendencias:
    "ALZA FUERTE. Narrativa completa y sin abreviar sobre las tendencias de la línea tecnológica.",
};

describe("TechDetail — sublíneas/tendencias expansion", () => {
  it("shows only the short description by default; full tendencias/sublíneas are not shown", () => {
    render(<TechDetail tech={TECH_WITH_METADATA} />);

    expect(screen.getByText(BASE_TECH.desc)).toBeInTheDocument();

    const panel = screen.getByText("Sublíneas y tendencias").closest("details");
    expect(panel).not.toBeNull();
    expect((panel as HTMLDetailsElement).open).toBe(false);
  });

  it("expands to reveal all sublíneas and the complete tendencias narrative", () => {
    render(<TechDetail tech={TECH_WITH_METADATA} />);

    const summary = screen.getByText("Sublíneas y tendencias");
    fireEvent.click(summary);

    const panel = summary.closest("details") as HTMLDetailsElement;
    expect(panel.open).toBe(true);

    for (const subline of TECH_WITH_METADATA.sublines!) {
      expect(screen.getByText(subline)).toBeInTheDocument();
    }
    expect(screen.getByText(TECH_WITH_METADATA.tendencias!)).toBeInTheDocument();
  });

  it("collapses back to the summary view when toggled again", () => {
    render(<TechDetail tech={TECH_WITH_METADATA} />);

    const summary = screen.getByText("Sublíneas y tendencias");
    const panel = summary.closest("details") as HTMLDetailsElement;

    fireEvent.click(summary);
    expect(panel.open).toBe(true);

    fireEvent.click(summary);
    expect(panel.open).toBe(false);
  });

  it("renders nothing for the panel when sublines and tendencias are both absent", () => {
    render(<TechDetail tech={BASE_TECH} />);

    expect(screen.queryByText("Sublíneas y tendencias")).not.toBeInTheDocument();
  });
});
