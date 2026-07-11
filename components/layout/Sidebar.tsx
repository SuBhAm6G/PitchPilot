/**
 * Sidebar with role selection and zone selector.
 * Uses semantic <aside> element with keyboard navigation.
 */

"use client";

import { STADIUM_ZONES, USER_ROLES } from "@/lib/utils/constants";
import type { UserRole, ZoneId } from "@/lib/utils/constants";

interface SidebarProps {
  readonly currentRole: UserRole;
  readonly currentZone: ZoneId;
  readonly onRoleChange: (role: UserRole) => void;
  readonly onZoneChange: (zone: ZoneId) => void;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const ROLE_OPTIONS: readonly { role: UserRole; label: string; icon: string }[] = [
  { role: USER_ROLES.FAN, label: "Fan", icon: "🎉" },
  { role: USER_ROLES.STAFF, label: "Staff", icon: "👷" },
  { role: USER_ROLES.SECURITY, label: "Security", icon: "🛡️" },
  { role: USER_ROLES.MEDICAL, label: "Medical", icon: "🏥" },
];

export default function Sidebar({
  currentRole,
  currentZone,
  onRoleChange,
  onZoneChange,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 transform border-r border-white/10 bg-slate-900/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Settings sidebar"
      >
        <div className="flex h-full flex-col gap-6 overflow-y-auto p-5 pt-20 lg:pt-5">
          {/* Role selector */}
          <section aria-label="Role selection">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Your Role
            </h2>
            <div className="flex flex-col gap-1.5">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => onRoleChange(option.role)}
                  aria-label={`Switch to ${option.label} role`}
                  aria-pressed={currentRole === option.role}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    currentRole === option.role
                      ? "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span aria-hidden="true">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* Zone selector */}
          <section aria-label="Zone selection">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Your Location
            </h2>
            <div className="flex flex-col gap-1">
              {STADIUM_ZONES.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => onZoneChange(zone.id)}
                  aria-label={`Set location to ${zone.name}`}
                  aria-pressed={currentZone === zone.id}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                    currentZone === zone.id
                      ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {zone.name}
                </button>
              ))}
            </div>
          </section>

          {/* Footer info */}
          <div className="mt-auto border-t border-white/10 pt-4">
            <p className="text-xs text-slate-600">
              PitchPilot v0.1.0 · Data refreshes every 30s
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
