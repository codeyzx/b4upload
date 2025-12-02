import { useState, useEffect, useCallback, useRef } from "react";
import { TrendingVideo } from "../types";
import { fetchTopVideos } from "../services/topVideosService";
import { PredictionError } from "../utils/errorHandler";

interface UseTopVideosState {
  videos: TrendingVideo[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

interface UseTopVideosReturn extends UseTopVideosState {
  loadVideos: () => Promise<void>;
  retry: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
}

const AUTO_REFRESH_INTERVAL =
  Number(import.meta.env.VITE_TRENDING_VIDEOS_REFRESH_INTERVAL) ||
  5 * 60 * 1000; // 5 minutes default

export function useTopVideos(): UseTopVideosReturn {
  const [state, setState] = useState<UseTopVideosState>({
    videos: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  /**
   * Load top 10 videos
   */
  const loadVideos = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchTopVideos();

      setState({
        videos: result.videos,
        isLoading: false,
        error: null,
        lastUpdated: result.lastUpdated,
      });
    } catch (error) {
      console.error("[TopVideos] Failed to load videos:", error);

      const errorMessage =
        error instanceof PredictionError
          ? error.message
          : "Failed to load top videos. Please try again.";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  /**
   * Retry after error
   */
  const retry = useCallback(async () => {
    await loadVideos();
  }, [loadVideos]);

  /**
   * Check for updates by comparing timestamps
   * Only fetch if timestamp has changed
   */
  const checkForUpdates = useCallback(async () => {
    try {
      // Fetch to get latest timestamp
      const result = await fetchTopVideos();

      // Compare timestamps
      if (result.lastUpdated !== state.lastUpdated) {
        console.log(
          "[TopVideos] New data available, updating...",
          `Old: ${state.lastUpdated}, New: ${result.lastUpdated}`
        );

        // Update with new data
        setState((prev) => ({
          ...prev,
          videos: result.videos,
          lastUpdated: result.lastUpdated,
          error: null,
        }));
      } else {
        console.log("[TopVideos] No updates available, keeping current data");
      }
    } catch (error) {
      console.error("[TopVideos] Failed to check for updates:", error);
      // Don't update error state for background checks
    }
  }, [state.lastUpdated]);

  /**
   * Schedule auto-refresh with timestamp-based updates
   */
  const scheduleAutoRefresh = useCallback(() => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Schedule next refresh
    refreshTimerRef.current = setTimeout(async () => {
      // Check if page is visible using Page Visibility API
      if (document.hidden) {
        // Reschedule for later if page is hidden
        scheduleAutoRefresh();
        return;
      }

      // Check for updates
      await checkForUpdates();

      // Schedule next refresh
      scheduleAutoRefresh();
    }, AUTO_REFRESH_INTERVAL);
  }, [checkForUpdates]);

  // Load initial data on mount
  useEffect(() => {
    loadVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Start auto-refresh after initial load
  useEffect(() => {
    if (state.videos.length > 0 && !state.isLoading) {
      scheduleAutoRefresh();
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.videos.length, state.isLoading]); // Don't include scheduleAutoRefresh to avoid re-creating timer

  return {
    ...state,
    loadVideos,
    retry,
    checkForUpdates,
  };
}
