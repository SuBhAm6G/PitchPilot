"use client";

import { useMemo } from "react";
import { calculateSustainability } from "@/lib/engine/sustainabilityEngine";
import type { UserProfile } from "@/lib/types";

export default function GreenTravelBadge({
  profile,
}: {
  profile: UserProfile;
}) {
  const metrics = useMemo(() => calculateSustainability(profile), [profile]);

  if (!metrics.badgeEarned) {
    return null;
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3 shadow-sm dark:bg-emerald-950/20 dark:border-emerald-800">
      <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full dark:bg-emerald-900 dark:text-emerald-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>
      <div>
        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">
          Green Fan Badge Earned!
        </h4>
        <p className="text-emerald-700 dark:text-emerald-300 text-xs mt-1">
          {metrics.message}
        </p>
        <div className="mt-2 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-400">
          -{metrics.co2SavedKg}kg CO₂e
        </div>
      </div>
    </div>
  );
}
