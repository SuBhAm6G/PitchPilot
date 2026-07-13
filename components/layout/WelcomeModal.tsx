"use client";

import { useState } from "react";
import {
  STADIUM_ZONES,
  USER_ROLES,
  HOST_STADIUMS,
} from "@/lib/utils/constants";
import type { UserRole, ZoneId } from "@/lib/utils/constants";
import type { StadiumApiResponse, UserProfile } from "@/lib/types";

interface WelcomeModalProps {
  readonly stadiumData: StadiumApiResponse | null;
  readonly onComplete: (
    role: UserRole,
    zone: ZoneId,
    seat: string,
    stadiumId: string,
    language: string,
  ) => void;
}

export default function WelcomeModal({
  stadiumData,
  onComplete,
}: WelcomeModalProps) {
  const [role, setRole] = useState<UserRole>(USER_ROLES.FAN);
  const [zone, setZone] = useState<ZoneId>(STADIUM_ZONES[0].id);
  const [seat, setSeat] = useState<string>("");
  const [stadiumId, setStadiumId] = useState<string>(HOST_STADIUMS[0].id);
  const [language, setLanguage] = useState<string>("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);

  async function handleGenerateBriefing(e: React.FormEvent) {
    e.preventDefault();
    if (!stadiumData) return;

    setIsGenerating(true);

    const tempProfile: UserProfile = {
      id: "setup-user",
      name: role === "fan" ? "Fan" : "Staff Member",
      role,
      currentZone: zone,
      stadiumId,
      seatNumber: seat,
      preferredLanguage: language,
      accessibilityNeeds: {
        wheelchairAccess: false,
        visualAssistance: false,
        hearingAssistance: false,
      },
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I have just arrived. My role is ${role}, zone is ${zone}, and seat is ${seat || "unassigned"}. Please provide a comprehensive, 3-sentence welcome briefing with all necessary information at one go including weather, nearest food, and match status. Do not ask follow up questions. Respond in language: ${language}`,
          userProfile: tempProfile,
          stadiumState: stadiumData.stadiumState,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBriefing(data.reply);
      } else {
        setBriefing(
          "Welcome to the Stadium! Please proceed to your zone for more details.",
        );
      }
    } catch {
      setBriefing(
        "Welcome to the Stadium! Please proceed to your zone for more details.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to PitchPilot
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Let&apos;s set up your match-day experience.
          </p>

          {!briefing ? (
            <form onSubmit={handleGenerateBriefing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Your Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="fan">Fan</option>
                  <option value="staff">Staff</option>
                  <option value="security">Security</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Select Stadium
                </label>
                <select
                  value={stadiumId}
                  onChange={(e) => setStadiumId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {HOST_STADIUMS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Current Zone
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as ZoneId)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {STADIUM_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Seat Number (Optional)
                </label>
                <input
                  type="text"
                  value={seat}
                  onChange={(e) => setSeat(e.target.value)}
                  placeholder="e.g. 112A"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !stadiumData}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                    Generating Briefing...
                  </>
                ) : (
                  "Generate AI Briefing"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-4">
                <h3 className="text-indigo-400 font-semibold mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.758a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                  Your Personalized Briefing
                </h3>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {briefing}
                </p>
              </div>

              <button
                onClick={() =>
                  onComplete(role, zone, seat, stadiumId, language)
                }
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Enter Stadium Experience
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
