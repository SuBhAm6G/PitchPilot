import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WaitTimeCard from "@/components/dashboard/WaitTimeCard";
import type { Venue } from "@/lib/types";
import { VENUE_TYPES } from "@/lib/utils/constants";

describe("WaitTimeCard", () => {
  it("renders venue wait times correctly", () => {
    const mockVenues: Venue[] = [
      {
        id: "v1",
        name: "North Food Court",
        type: VENUE_TYPES.FOOD_COURT,
        zoneId: "north-lower",
        isOpen: true,
        estimatedWaitMinutes: 5,
        currentQueueLength: 10,
      },
    ];

    render(<WaitTimeCard venues={mockVenues} />);

    // Check if food courts text renders
    expect(screen.getByText("Food Courts")).toBeTruthy();
    // 1 open
    expect(screen.getByText("1 open")).toBeTruthy();
    // 5m wait
    expect(screen.getByText("5m")).toBeTruthy();
  });
});
