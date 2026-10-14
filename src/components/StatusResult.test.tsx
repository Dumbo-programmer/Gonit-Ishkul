import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LangProvider } from "@/lib/i18n/LangContext";
import { StatusResult } from "@/components/StatusResult";
import type { ApplicationRecord } from "@/lib/types";

const application: ApplicationRecord = {
  id: "app_test",
  trackingCode: "GD-TEST1234",
  fullName: "Test Doot",
  email: "test@example.com",
  phone: "01700000000",
  university: "DU",
  department: "Math",
  district: "Dhaka",
  division: "Dhaka",
  statement: "x",
  status: "SHORTLISTED",
  timeline: [
    { status: "SUBMITTED", createdAt: "2026-01-01T00:00:00.000Z" },
    { status: "UNDER_REVIEW", createdAt: "2026-01-02T00:00:00.000Z" },
    { status: "SHORTLISTED", createdAt: "2026-01-03T00:00:00.000Z" },
  ],
  userId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-03T00:00:00.000Z",
};

describe("StatusResult", () => {
  it("shows the tracking code and reached timeline steps (en)", () => {
    render(
      <LangProvider initialLang="en">
        <StatusResult application={application} query="GD-TEST1234" />
      </LangProvider>,
    );

    expect(screen.getByText("GD-TEST1234")).toBeInTheDocument();
    expect(screen.getAllByText("Shortlisted").length).toBeGreaterThan(0);
  });

  it("renders the not-found state", () => {
    render(
      <LangProvider initialLang="en">
        <StatusResult application={null} query="GD-NOPE" />
      </LangProvider>,
    );

    expect(screen.getByText(/No application found/i)).toBeInTheDocument();
  });
});