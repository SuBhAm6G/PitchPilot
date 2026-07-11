/**
 * PitchPilot — Main Application Page
 * Orchestrates role selection, view switching, data fetching, and context engine.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import OpsDashboard from "@/components/dashboard/OpsDashboard";
import FanHub from "@/components/fan/FanHub";
import ChatPanel from "@/components/chat/ChatPanel";
import { getPersonalizedRecommendations } from "@/lib/engine/contextDecisionEngine";
import type { UserProfile, StadiumApiResponse, ContextRecommendation } from "@/lib/types";
import type { UserRole, ZoneId } from "@/lib/utils/constants";
import { USER_ROLES, STADIUM_ZONES } from "@/lib/utils/constants";

const DEFAULT_ZONE = STADIUM_ZONES[0]?.id ?? "north-lower";

function buildUserProfile(role: UserRole, zone: ZoneId): UserProfile {
  return {
    id: "user-001",
    name: role === USER_ROLES.FAN ? "Fan" : "Staff Member",
    role,
    currentZone: zone,
    preferredLanguage: "en",
    accessibilityNeeds: {
      wheelchairAccess: false,
      visualAssistance: false,
      hearingAssistance: false,
    },
  };
}

export default function HomePage() {
  const [role, setRole] = useState<UserRole>(USER_ROLES.FAN);
  const [zone, setZone] = useState<ZoneId>(DEFAULT_ZONE as ZoneId);
  const [view, setView] = useState<"dashboard" | "fan" | "chat">("fan");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stadiumData, setStadiumData] = useState<StadiumApiResponse | null>(null);
  const [recommendations, setRecommendations] = useState<readonly ContextRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState<string | undefined>(undefined);

  const userProfile = buildUserProfile(role, zone);

  const fetchStadiumData = useCallback(async () => {
    try {
      const response = await fetch("/api/stadium");
      if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
      const data = (await response.json()) as StadiumApiResponse;
      setStadiumData(data);

      // Run context engine with fresh data
      const recs = getPersonalizedRecommendations(
        buildUserProfile(role, zone),
        data.stadiumState
      );
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to fetch stadium data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [role, zone]);

  // Initial fetch + 30s polling
  useEffect(() => {
    const loadData = () => {
      fetchStadiumData().catch(console.error);
    };
    
    // Defer initial execution to avoid synchronous setState inside effect body
    const timeoutId = setTimeout(loadData, 0);
    const intervalId = setInterval(loadData, 30_000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [fetchStadiumData]);

  function handleChatAction(message: string) {
    setChatMessage(message);
    setView("chat");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        currentRole={role}
        currentView={view}
        onViewChange={setView}
      />

      <div className="flex flex-1">
        {/* Mobile sidebar toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open settings sidebar"
          className="fixed bottom-4 left-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition-transform hover:scale-110 lg:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" />
          </svg>
        </button>

        <Sidebar
          currentRole={role}
          currentZone={zone}
          onRoleChange={setRole}
          onZoneChange={setZone}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {view === "dashboard" && (
            <OpsDashboard data={stadiumData} isLoading={isLoading} />
          )}

          {view === "fan" && (
            <FanHub
              data={stadiumData}
              recommendations={recommendations}
              isLoading={isLoading}
              userZone={zone}
              onChatAction={handleChatAction}
            />
          )}

          {view === "chat" && (
            <div className="mx-auto h-[calc(100vh-8rem)] max-w-3xl">
              <ChatPanel
                userProfile={userProfile}
                stadiumState={stadiumData?.stadiumState ?? null}
                initialMessage={chatMessage}
              />
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-white/5 px-6 py-4">
        <p className="text-center text-xs text-slate-600">
          PitchPilot © 2026 · FIFA World Cup 2026 Stadium Operations Platform · Powered by Google Gemini
        </p>
      </footer>
    </div>
  );
}
