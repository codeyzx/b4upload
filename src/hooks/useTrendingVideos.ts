import { useState, useEffect, useCallback, useRef } from "react";
import { TrendingVideo } from "../types";
import { fetchTrendingVideos } from "../services/trendingVideosService";
import { PredictionError } from "../utils/errorHandler";

interface UseTrendingVideosState {
  videos: TrendingVideo[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
}

interface UseTrendingVideosReturn extends UseTrendingVideosState {
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

const PAGE_SIZE = Number(import.meta.env.VITE_TRENDING_VIDEOS_PAGE_SIZE) || 10;
const AUTO_REFRESH_INTERVAL = Number(import.meta.env.VITE_TRENDING_VIDEOS_REFRESH_INTERVAL) || 5 * 60 * 1000; // 5 minutes default
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export function useTrendingVideos(): UseTrendingVideosReturn {
  const [state, setState] = useState<UseTrendingVideosState>({
    videos: [],
    isLoading: false,
    error: null,
    hasMore: false,
    totalCount: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

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
   * Load initial batch of videos
   */
  const loadInitial = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchTrendingVideos(PAGE_SIZE, 0);

      setState({
        videos: result.videos,
        isLoading: false,
        error: null,
        hasMore: result.hasMore,
        totalCount: result.total,
      });
    } catch (error) {
      console.error("[TrendingVideos] Failed to load initial videos:", error);

      const errorMessage =
        error instanceof PredictionError
          ? error.message
          : "Failed to load trending videos. Please try again.";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  /**
   * Load more videos (pagination)
   */
  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const currentCount = state.videos.length;
      const result = await fetchTrendingVideos(PAGE_SIZE, currentCount);

      setState((prev) => ({
        ...prev,
        videos: [...prev.videos, ...result.videos],
        isLoading: false,
        error: null,
        hasMore: result.hasMore,
        totalCount: result.total,
      }));
    } catch (error) {
      console.error("[TrendingVideos] Failed to load more videos:", error);

      const errorMessage =
        error instanceof PredictionError
          ? error.message
          : "Failed to load more videos. Please try again.";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [state.videos.length, state.isLoading, state.hasMore]);

  /**
   * Refresh all videos
   */
  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchTrendingVideos(PAGE_SIZE, 0);

      setState({
        videos: result.videos,
        isLoading: false,
        error: null,
        hasMore: result.hasMore,
        totalCount: result.total,
      });
    } catch (error) {
      console.error("[TrendingVideos] Failed to refresh videos:", error);

      const errorMessage =
        error instanceof PredictionError
          ? error.message
          : "Failed to refresh videos. Please try again.";

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
    if (state.videos.length === 0) {
      await loadInitial();
    } else {
      await refresh();
    }
  }, [state.videos.length, loadInitial, refresh]);

  /**
   * Auto-refresh with exponential backoff on failure
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

      try {
        const result = await fetchTrendingVideos(PAGE_SIZE, 0);

        // Update videos without disrupting UI
        setState((prev) => ({
          ...prev,
          videos: result.videos,
          hasMore: result.hasMore,
          totalCount: result.total,
          error: null,
        }));

        // Reset retry count on success
        retryCountRef.current = 0;
        
        // Schedule next refresh
        scheduleAutoRefresh();
      } catch (error) {
        console.error("[TrendingVideos] Auto-refresh failed:", error);

        // Increment retry count
        retryCountRef.current += 1;

        if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
          // Exponential backoff
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current - 1);

          refreshTimerRef.current = setTimeout(() => {
            scheduleAutoRefresh();
          }, delay);
        } else {
          // Max retries reached, schedule normal refresh
          retryCountRef.current = 0;
          scheduleAutoRefresh();
        }
      }
    }, AUTO_REFRESH_INTERVAL);
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadInitial();
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
    loadInitial,
    loadMore,
    refresh,
    retry,
  };
}
