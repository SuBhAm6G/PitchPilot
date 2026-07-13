import { useState, useEffect, useMemo, memo } from "react";
import Card from "@/components/ui/Card";
import type { StadiumState } from "@/lib/types";

interface ProactiveInsightBriefProps {
  readonly stadiumState: StadiumState | null;
}

const ProactiveInsightBrief = memo(function ProactiveInsightBrief({
  stadiumState,
}: ProactiveInsightBriefProps) {
  const [insight, setInsight] = useState<string>(
    "Analyzing stadium operations...",
  );
  const [isLoading, setIsLoading] = useState(true);

  // Stable dependency key — only re-fetch when match phase or timestamp actually changes
  const stateFingerprint = useMemo(
    () =>
      stadiumState
        ? `${stadiumState.matchPhase}-${stadiumState.lastUpdated}`
        : null,
    [stadiumState],
  );

  useEffect(() => {
    if (!stadiumState || !stateFingerprint) return;

    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    async function fetchInsight() {
      try {
        const response = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stadiumState }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Failed to fetch insights");

        const data: { insight?: string } = await response.json();
        if (isMounted && data.insight) {
          setInsight(data.insight);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Proactive Insight Error:", err);
        if (isMounted)
          setInsight("Unable to generate AI briefing at this time.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchInsight().catch(console.error);

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [stateFingerprint, stadiumState]);

  return (
    <Card
      as="section"
      className="col-span-full border-indigo-500/30 bg-indigo-900/10"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 text-white"
            aria-hidden="true"
          >
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.758a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
            GenAI Executive Briefing
          </h2>
          <div className="mt-2 text-sm text-slate-300 leading-relaxed min-h-[2.5rem]">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500"
                  aria-hidden="true"
                />
                <span className="text-slate-400 animate-pulse">
                  Generating insights...
                </span>
              </div>
            ) : (
              <p aria-live="polite">{insight}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
});

export default ProactiveInsightBrief;
