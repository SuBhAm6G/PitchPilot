/**
 * Render tests for MatchTimeline component.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MatchTimeline from "@/components/fan/MatchTimeline";
import type { MatchState } from "@/lib/types";

const mockMatchState: MatchState = {
  homeTeam: "USA",
  awayTeam: "Mexico",
  homeScore: 2,
  awayScore: 1,
  currentMinute: 67,
  events: [
    { id: "e1", minute: 14, type: "goal", team: "home", playerName: "Pulisic", description: "Free kick from 25 yards." },
    { id: "e2", minute: 38, type: "yellow_card", team: "away", playerName: "Lozano", description: "Dangerous tackle." },
    { id: "e3", minute: 55, type: "goal", team: "home", playerName: "McKennie", description: "Header from corner." },
  ],
};

describe("MatchTimeline", () => {
  it("renders the match score", () => {
    render(<MatchTimeline matchState={mockMatchState} />);
    expect(screen.getByText("2 - 1")).toBeTruthy();
  });

  it("renders the current minute", () => {
    render(<MatchTimeline matchState={mockMatchState} />);
    // The minute is rendered with &apos; — check for "67" in the DOM
    expect(screen.getByText(/67/)).toBeTruthy();
  });

  it("renders match events with player names", () => {
    render(<MatchTimeline matchState={mockMatchState} />);
    // Recent events are reversed; should show the latest 3
    expect(screen.getByText(/Pulisic/)).toBeTruthy();
    expect(screen.getByText(/McKennie/)).toBeTruthy();
  });

  it("renders no events message when events are empty", () => {
    const emptyState: MatchState = { ...mockMatchState, events: [] };
    render(<MatchTimeline matchState={emptyState} />);
    expect(screen.getByText(/No major events yet/)).toBeTruthy();
  });
});
