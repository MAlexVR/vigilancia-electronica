import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HelpModal } from "./HelpModal";

describe("HelpModal — Trajectory Map education section", () => {
  it("shows the 'Mapa de Trayectoria Tecnológica' section with the 4-layer legend", () => {
    render(<HelpModal open onOpenChange={() => {}} />);

    expect(
      screen.getByRole("heading", { name: /Mapa de Trayectoria Tecnológica/ }),
    ).toBeInTheDocument();

    expect(screen.getByText("Tecnologías")).toBeInTheDocument();
    expect(screen.getByText("Infraestructura")).toBeInTheDocument();
    expect(screen.getByText("Talento & I+D+i")).toBeInTheDocument();
    expect(screen.getByText("Alianzas")).toBeInTheDocument();
  });

  it("explains how to use it, mentioning the Header entry point and PDF export, with no apology/pending language", () => {
    render(<HelpModal open onOpenChange={() => {}} />);

    expect(screen.getByText(/Cómo usarlo/)).toBeInTheDocument();
    expect(screen.getByText(/haz clic en el botón/)).toBeInTheDocument();
    expect(screen.getByText(/en el encabezado\./)).toBeInTheDocument();
    expect(screen.getByText(/Exportar:/)).toBeInTheDocument();
    expect(screen.queryByText(/pendiente/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/avance/i)).not.toBeInTheDocument();
  });
});
