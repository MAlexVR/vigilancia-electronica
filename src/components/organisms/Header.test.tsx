import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { Header } from "./Header";
import { TECHNOLOGIES } from "@/lib/radar-data";
import messages from "../../../messages/es.json";

function renderHeader() {
  return render(
    <NextIntlClientProvider messages={messages} locale="es">
      <Header />
    </NextIntlClientProvider>,
  );
}

describe("Header — Trajectory Map entry point", () => {
  it("shows a 'Mapa de Trayectoria Tecnológica' button in the desktop bar and opens the modal on click", async () => {
    const user = userEvent.setup();
    renderHeader();

    const trigger = screen.getByRole("button", {
      name: "Mapa de Trayectoria Tecnológica",
    });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog");
    // Real electronica data renders inside the modal — not a placeholder.
    expect(
      within(dialog).getAllByText(TECHNOLOGIES[0].name).length,
    ).toBeGreaterThan(0);
  });

  it("opens the modal from the mobile menu", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByLabelText("Menú"));
    const mobileButtons = screen.getAllByRole("button", {
      name: "Mapa de Trayectoria Tecnológica",
    });
    // The mobile menu button is the extra one that appears once the menu opens.
    expect(mobileButtons.length).toBeGreaterThan(1);
    await user.click(mobileButtons[mobileButtons.length - 1]);

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getAllByText(TECHNOLOGIES[0].name).length,
    ).toBeGreaterThan(0);
  });
});
