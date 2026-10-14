import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LangProvider, useLang } from "@/lib/i18n/LangContext";
import { LangToggle } from "@/components/LangToggle";

function Probe() {
  const { t, lang } = useLang();
  return (
    <p data-testid="probe" data-lang={lang}>
      {t("common.home")}
    </p>
  );
}

describe("LangToggle", () => {
  it("starts in Bangla and switches to English on click", () => {
    render(
      <LangProvider initialLang="bn">
        <LangToggle />
        <Probe />
      </LangProvider>,
    );

    expect(screen.getByTestId("probe")).toHaveTextContent("হোম");
    expect(screen.getByTestId("probe")).toHaveAttribute("data-lang", "bn");

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByTestId("probe")).toHaveTextContent("Home");
    expect(screen.getByTestId("probe")).toHaveAttribute("data-lang", "en");
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});