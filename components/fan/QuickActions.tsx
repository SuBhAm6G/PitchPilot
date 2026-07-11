/**
 * Quick action buttons for common fan tasks.
 * Fully keyboard-navigable with ARIA labels.
 */

interface QuickActionsProps {
  readonly onAction: (action: string) => void;
}

interface ActionItem {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly ariaLabel: string;
  readonly colorClass: string;
}

const ACTIONS: readonly ActionItem[] = [
  {
    id: "find-food",
    label: "Find Food",
    emoji: "🍔",
    ariaLabel: "Find nearest food court with shortest wait time",
    colorClass: "from-orange-500/20 to-amber-600/10 hover:from-orange-500/30",
  },
  {
    id: "find-restroom",
    label: "Find Restroom",
    emoji: "🚻",
    ariaLabel: "Find nearest restroom with shortest wait time",
    colorClass: "from-sky-500/20 to-blue-600/10 hover:from-sky-500/30",
  },
  {
    id: "get-directions",
    label: "Directions",
    emoji: "🗺️",
    ariaLabel: "Get directions to your seat or destination",
    colorClass: "from-emerald-500/20 to-green-600/10 hover:from-emerald-500/30",
  },
  {
    id: "report-issue",
    label: "Report Issue",
    emoji: "🚨",
    ariaLabel: "Report a safety or maintenance issue",
    colorClass: "from-red-500/20 to-rose-600/10 hover:from-red-500/30",
  },
];

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <section aria-label="Quick actions">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(action.id)}
            aria-label={action.ariaLabel}
            className={`flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-br p-4 transition-all duration-200 hover:scale-105 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${action.colorClass}`}
          >
            <span className="text-2xl" aria-hidden="true">{action.emoji}</span>
            <span className="text-sm font-medium text-slate-300">{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
