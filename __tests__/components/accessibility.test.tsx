import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import MatchTimeline from "@/components/fan/MatchTimeline";
import PersonalItinerary from "@/components/fan/PersonalItinerary";
import QuickActions from "@/components/fan/QuickActions";
import type { MatchState, ItineraryItem } from "@/lib/types";

expect.extend(toHaveNoViolations);

const mockMatchState: MatchState = {
  homeTeam: "USA",
  awayTeam: "Mexico",
  homeScore: 2,
  awayScore: 1,
  currentMinute: 67,
  events: [],
};

const mockItems: ItineraryItem[] = [
  {
    id: "itin-1",
    time: "Now",
    action: "Enter Stadium",
    reason: "Gates are open.",
    priority: "now",
    icon: "map",
  },
];

describe("Accessibility (A11y) E2E Tests", () => {
  it("MatchTimeline should have no WCAG violations", async () => {
    const { container } = render(<MatchTimeline matchState={mockMatchState} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("PersonalItinerary should have no WCAG violations", async () => {
    const { container } = render(<PersonalItinerary items={mockItems} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("QuickActions should have no WCAG violations", async () => {
    const { container } = render(<QuickActions onAction={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
