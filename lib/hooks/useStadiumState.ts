/**
 * Custom hook for stadium state polling with efficient data fetching.
 * Features: AbortController cleanup, request deduplication, memoized recommendations.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { StadiumApiResponse, ContextRecommendation, UserProfile } from "@/lib/types";
import { getPersonalizedRecommendations } from "@/lib/engine/contextDecisionEngine";

const POLLING_INTERVAL_MS = 30_000;

export function useStadiumState(userProfile: UserProfile) {
  const [stadiumData, setStadiumData] = useState<StadiumApiResponse | null>(null);
  const [recommendations, setRecommendations] = useState<readonly ContextRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchStadiumData = useCallback(async (signal: AbortSignal) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const response = await fetch("/api/stadium", { signal });
      if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
      const data = (await response.json()) as StadiumApiResponse;
      setStadiumData(data);

      const recs = getPersonalizedRecommendations(userProfile, data.stadiumState);
      setRecommendations(recs);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Failed to fetch stadium data:", error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = () => {
      fetchStadiumData(controller.signal).catch(console.error);
    };

    const timeoutId = setTimeout(loadData, 0);
    const intervalId = setInterval(loadData, POLLING_INTERVAL_MS);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [fetchStadiumData]);

  return { stadiumData, recommendations, isLoading };
}
