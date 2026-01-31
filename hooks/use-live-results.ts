import { useEffect, useState } from "react";
import { fetchDrawForecast, type DrawResult } from "@/lib/stryktipset-api";

export function useLiveResults(drawNumber: number | null) {
  const [results, setResults] = useState<DrawResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!drawNumber) {
      setIsLoading(false);
      setResults([]);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchResults = async () => {
      try {
        console.log(`[useLiveResults] Fetching results for draw ${drawNumber}`);
        const forecast = await fetchDrawForecast(drawNumber);

        if (!isMounted) return;

        if (forecast && forecast.forecastResult) {
          console.log(`[useLiveResults] Got ${forecast.forecastResult.drawResults.length} results`);
          setResults(forecast.forecastResult.drawResults);
          setError(null);
        } else {
          console.warn(`[useLiveResults] No forecast data returned for draw ${drawNumber}`);
          setError("Could not fetch results");
          setResults([]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error(`[useLiveResults] Error fetching draw ${drawNumber}:`, err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setResults([]);
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

  return { results, isLoading, error };
}
