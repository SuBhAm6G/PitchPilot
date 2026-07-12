import { describe, it, expect } from "vitest";
import { generateShiftBriefing } from "@/lib/engine/shiftBriefingEngine";
import type { UserProfile } from "@/lib/types";
import { generateStadiumState } from "@/lib/data/mockStadiumData";

const baseProfile: UserProfile = {
  id: "staff-1",
  name: "Test Staff",
  role: "staff",
  currentZone: "north-lower",
  preferredLanguage: "en",
  accessibilityNeeds: { wheelchairAccess: false, visualAssistance: false, hearingAssistance: false },
};

describe("shiftBriefingEngine", () => {
  it("should return null for fans", () => {
    const profile: UserProfile = { ...baseProfile, role: "fan" };
    const state = generateStadiumState("first_half", 1);
    expect(generateShiftBriefing(profile, state)).toBeNull();
  });

  it("should generate briefing for staff", () => {
    const state = generateStadiumState("first_half", 1);
    const briefing = generateShiftBriefing(baseProfile, state);
    expect(briefing).not.toBeNull();
    expect(briefing?.roleName).toMatch(/Volunteer/);
  });

  it("should adjust duties for pre_match", () => {
    const state = generateStadiumState("pre_match", 1);
    const briefing = generateShiftBriefing(baseProfile, state);
    expect(briefing?.primaryDuty).toMatch(/seats/);
  });

  it("should adjust escalation for security", () => {
    const profile: UserProfile = { ...baseProfile, role: "security" };
    const state = generateStadiumState("first_half", 1);
    const briefing = generateShiftBriefing(profile, state);
    expect(briefing?.roleName).toMatch(/Security/);
    expect(briefing?.escalationProtocol).toMatch(/Command Center/);
  });

  it("should provide spanish phrases", () => {
    const profile: UserProfile = { ...baseProfile, preferredLanguage: "es" };
    const state = generateStadiumState("first_half", 1);
    const briefing = generateShiftBriefing(profile, state);
    expect(briefing?.keyPhrases[0]).toMatch(/¿Cómo/);
  });
});
