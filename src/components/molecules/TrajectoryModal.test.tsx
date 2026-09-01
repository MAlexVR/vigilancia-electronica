import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { TrajectoryModal } from "./TrajectoryModal";
import { TECHNOLOGIES } from "@/lib/radar-data";
import messages from "../../../messages/es.json";

const { downloadElementAsPDF } = vi.hoisted(() => ({
  downloadElementAsPDF: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/core", () => ({
  downloadElementAsPDF,
}));

function renderModal() {
  return render(
    <NextIntlClientProvider messages={messages} locale="es">
      <TrajectoryModal open onOpenChange={() => {}} />
    </NextIntlClientProvider>,
  );
}

describe("TrajectoryModal", () => {
  it("renders electronica's real Layer 1 data (from TECHNOLOGIES), not fabricated or telecom's data", () => {
    renderModal();

    expect(
      screen.getAllByText(TECHNOLOGIES[0].name).length,
    ).toBeGreaterThan(0);
  });

  it("exports the map as PDF via downloadElementAsPDF from @/core", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: /exportar pdf/i }));

    expect(downloadElementAsPDF).toHaveBeenCalledTimes(1);
    const [element, options] = downloadElementAsPDF.mock.calls[0];
    expect(element).toBeInstanceOf(HTMLElement);
    expect(options).toMatchObject({ filename: expect.any(String) });
  });
});
