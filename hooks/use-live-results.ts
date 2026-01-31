import { useEffect, useState } from "react";
import { fetchDrawForecast, type ProcessedDrawResult } from "@/lib/stryktipset-api";

export function useLiveResults(drawNumber: number | null) {
  const [results, setResults] = useState<ProcessedDrawResult[]>([]);
  const [roundStarted, setRoundStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!drawNumber) {
      setIsLoading(false);
      setResults([]);
      setRoundStarted(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchResults = async () => {
      try {
        const data = await fetchDrawForecast(drawNumber);

        if (!isMounted) return;

        if (data) {
          setResults(data.results);
          setRoundStarted(data.roundStarted);
          setError(null);
        } else {
          setError("Could not fetch results");
          setResults([]);
          setRoundStarted(false);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setResults([]);
        setRoundStarted(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Fetch immediately
    fetchResults();

    // Then fetch every 30 seconds
    const interval = setInterval(fetchResults, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [drawNumber]);

  return { results, roundStarted, isLoading, error };
}
