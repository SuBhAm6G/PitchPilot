import { memo } from "react";
import Card from "@/components/ui/Card";
import type { ItineraryItem } from "@/lib/types";

interface PersonalItineraryProps {
  readonly items: readonly ItineraryItem[];
}

const PersonalItinerary = memo(function PersonalItinerary({ items }: PersonalItineraryProps) {
  if (!items || items.length === 0) return null;

  return (
    <Card as="section" aria-label="Personal Itinerary">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Your Match-Day Plan
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              item.priority === "now"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : item.priority === "soon"
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-slate-700/50 bg-slate-800/30"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  item.priority === "now" ? "text-emerald-400" : item.priority === "soon" ? "text-amber-400" : "text-slate-400"
                }`}>
                  {item.time}
                </span>
                <span className="text-sm font-semibold">{item.action}</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

export default PersonalItinerary;
