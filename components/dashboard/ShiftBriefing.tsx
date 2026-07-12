"use client";

import { useMemo } from "react";
import { generateShiftBriefing } from "@/lib/engine/shiftBriefingEngine";
import type { UserProfile, StadiumState } from "@/lib/types";

export default function ShiftBriefing({ profile, state }: { profile: UserProfile, state: StadiumState }) {
  const briefing = useMemo(() => generateShiftBriefing(profile, state), [profile, state]);

  if (!briefing) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold">{briefing.roleName} Shift Briefing</h3>
          <p className="text-slate-400 text-sm">Zone: {briefing.location}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Primary Duty</h4>
          <p className="text-slate-200 text-sm">{briefing.primaryDuty}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Escalation Protocol</h4>
          <p className="text-slate-200 text-sm">{briefing.escalationProtocol}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Phrases (Language: {profile.preferredLanguage})</h4>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {briefing.keyPhrases.map((phrase, idx) => (
              <li key={idx}>{phrase}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
