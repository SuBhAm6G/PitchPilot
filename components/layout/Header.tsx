/**
 * Header component with role indicator and navigation.
 * Uses semantic <header> and <nav> elements.
 */

"use client";

import type { UserRole } from "@/lib/utils/constants";
import { USER_ROLES } from "@/lib/utils/constants";

interface HeaderProps {
  readonly currentRole: UserRole;
  readonly currentView: "dashboard" | "fan" | "chat";
  readonly onViewChange: (view: "dashboard" | "fan" | "chat") => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.FAN]: "🎉 Fan Mode",
  [USER_ROLES.STAFF]: "👷 Staff Ops",
  [USER_ROLES.SECURITY]: "🛡️ Security",
  [USER_ROLES.MEDICAL]: "🏥 Medical",
};

const NAV_ITEMS: readonly { id: "dashboard" | "fan" | "chat"; label: string; ariaLabel: string }[] = [
  { id: "dashboard", label: "Ops Dashboard", ariaLabel: "View operations dashboard" },
  { id: "fan", label: "Fan Hub", ariaLabel: "View fan experience hub" },
  { id: "chat", label: "AI Assistant", ariaLabel: "Open AI chat assistant" },
];

export default function Header({ currentRole, currentView, onViewChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-lg font-bold" aria-hidden="true">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">PitchPilot</h1>
            <p className="text-xs text-slate-400">FIFA World Cup 2026 · MetLife Stadium</p>
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1 rounded-xl bg-slate-800/50 p-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  aria-label={item.ariaLabel}
                  aria-current={currentView === item.id ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    currentView === item.id
                      ? "bg-sky-500/20 text-sky-300 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Role indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1.5 text-sm">
          <span className="text-slate-400">Role:</span>
          <span className="font-semibold text-sky-300">{ROLE_LABELS[currentRole]}</span>
        </div>
      </div>
    </header>
  );
}
