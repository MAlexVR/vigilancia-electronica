import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutModal } from "./AboutModal";

describe("AboutModal", () => {
  it("lists both autores verbatim, labeled as Instructores — Área de Electrónica", () => {
    render(<AboutModal open onOpenChange={() => {}} />);

    expect(
      screen.getByText(/Ing\. Óscar Andrés Pulido Casallas/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ing\. Diana Cristina Limas Ramirez/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Instructores — Área de Electrónica/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Autores:/)).toBeInTheDocument();
  });

  it("lists exactly one coautor verbatim, labeled Instructor G14 — Área de Telecomunicaciones", () => {
    render(<AboutModal open onOpenChange={() => {}} />);

    expect(screen.getByText(/Coautor:/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Ing\. Mauricio Alexander Vargas Rodríguez, MSc\., MBA Esp\. PM\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Instructor G14 — Área de Telecomunicaciones/),
    ).toBeInTheDocument();
  });

  it("shows the shared institutional structure: logo, Entidad/Centro/Regional/Grupo I+D table, footer copyright", () => {
    render(<AboutModal open onOpenChange={() => {}} />);

    expect(screen.getByAltText("GICS — CEET SENA")).toBeInTheDocument();
    expect(screen.getByText("Entidad")).toBeInTheDocument();
    expect(screen.getByText("Centro")).toBeInTheDocument();
    expect(screen.getByText("CEET")).toBeInTheDocument();
    expect(screen.getByText("Regional")).toBeInTheDocument();
    expect(screen.getByText("Grupo I+D")).toBeInTheDocument();
    expect(screen.getByText(/Todos los derechos reservados\./)).toBeInTheDocument();
  });

  it("updates the intro copy to reference the electrónica area and the 2026-2036 horizon", () => {
    render(<AboutModal open onOpenChange={() => {}} />);

    expect(screen.getByText(/del área de electrónica/)).toBeInTheDocument();
    expect(screen.getByText(/horizonte 2026-2036/)).toBeInTheDocument();
  });
});
