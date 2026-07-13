import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CrowdDensityCard from "@/components/dashboard/CrowdDensityCard";
import type { CrowdDensityReport } from "@/lib/types";

describe("CrowdDensityCard", () => {
  it("renders sorted crowd density correctly", () => {
    const mockReport: CrowdDensityReport[] = [
      {
        zoneId: "north-lower",
        zoneName: "North Stand (Lower)",
        currentOccupancy: 8500,
        maxCapacity: 10000,
        occupancyPercent: 85,
        densityLevel: "high",
      },
      {
        zoneId: "south-upper",
        zoneName: "South Stand (Upper)",
        currentOccupancy: 2000,
        maxCapacity: 10000,
        occupancyPercent: 20,
        densityLevel: "low",
      },
    ];

    render(<CrowdDensityCard crowdReport={mockReport} />);

    expect(screen.getAllByText("North Stand (Lower)")).toHaveLength(2);
    expect(screen.getByText("8,500 / 10,000")).toBeTruthy();
    expect(screen.getAllByText("South Stand (Upper)")).toHaveLength(2);
    expect(screen.getByText("2,000 / 10,000")).toBeTruthy();
  });
});
