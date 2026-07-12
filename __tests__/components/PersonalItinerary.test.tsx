/**
 * Render tests for PersonalItinerary component.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PersonalItinerary from "@/components/fan/PersonalItinerary";
import type { ItineraryItem } from "@/lib/types";

const mockItems: ItineraryItem[] = [
  { id: "itin-1", time: "Now", action: "Enter Stadium", reason: "Gates are open.", priority: "now", icon: "map" },
  { id: "itin-2", time: "Soon", action: "Grab food early", reason: "Food courts are busy.", priority: "soon", icon: "utensils" },
  { id: "itin-3", time: "Later", action: "Find your seat", reason: "Match starts in 30 min.", priority: "later", icon: "map" },
];

describe("PersonalItinerary", () => {
  it("renders itinerary items", () => {
    render(<PersonalItinerary items={mockItems} />);
    expect(screen.getByText("Enter Stadium")).toBeTruthy();
    expect(screen.getByText("Grab food early")).toBeTruthy();
  });

  it("renders priority indicators", () => {
    render(<PersonalItinerary items={mockItems} />);
    expect(screen.getByText("Now")).toBeTruthy();
    expect(screen.getByText("Soon")).toBeTruthy();
  });

  it("renders nothing when items are empty", () => {
    const { container } = render(<PersonalItinerary items={[]} />);
    expect(container.innerHTML).toBe("");
  });
});
