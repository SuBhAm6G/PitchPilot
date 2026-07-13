import { memo } from "react";
import Card from "@/components/ui/Card";
import type { MatchState } from "@/lib/types";
import { MATCH_EVENT_LABELS } from "@/lib/utils/constants";

interface MatchTimelineProps {
  readonly matchState: MatchState;
}

const MatchTimeline = memo(function MatchTimeline({
  matchState,
}: MatchTimelineProps) {
  if (!matchState) return null;

  // Show only the latest 3 events
  const recentEvents = [...matchState.events].reverse().slice(0, 3);

  return (
    <Card as="section" aria-label="Match Timeline">
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Match Center
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            {matchState.homeScore} - {matchState.awayScore}
          </span>
          <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-300">
            {matchState.currentMinute}&apos;
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {recentEvents.length === 0 ? (
          <p className="text-sm text-slate-500">No major events yet.</p>
        ) : (
          recentEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-lg bg-slate-800/30 p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700/50 text-sm">
                {MATCH_EVENT_LABELS[event.type]?.charAt(0) || "•"}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {event.minute}&apos; -{" "}
                  {MATCH_EVENT_LABELS[event.type] || event.type}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {event.playerName} ({event.team})
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {event.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
});

export default MatchTimeline;
