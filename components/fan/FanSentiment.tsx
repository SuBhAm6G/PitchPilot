import { memo } from "react";
import Card from "@/components/ui/Card";
import type { SentimentScore } from "@/lib/types";

interface FanSentimentProps {
  readonly sentiment: SentimentScore;
}

const FanSentiment = memo(function FanSentiment({ sentiment }: FanSentimentProps) {
  if (!sentiment) return null;

  // Compute color based on level
  let colorClass = "from-slate-500 to-slate-600";
  if (sentiment.level >= 4) colorClass = "from-emerald-500 to-emerald-600";
  else if (sentiment.level === 3) colorClass = "from-sky-500 to-sky-600";
  else if (sentiment.level <= 2) colorClass = "from-amber-500 to-amber-600";

  return (
    <Card className="flex items-center justify-between">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Crowd Sentiment
        </h3>
        <p className="mt-1 font-medium">{sentiment.label}</p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br shadow-lg ${colorClass} text-2xl`}>
        {sentiment.emoji}
      </div>
    </Card>
  );
});

export default FanSentiment;
