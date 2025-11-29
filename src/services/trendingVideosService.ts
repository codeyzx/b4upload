import { TrendingVideo, MongoTrendingVideoDoc } from "../types";
import { TrendingVideosApiResponse } from "../types/api";
import { apiClient } from "../config/api";
import { handleApiError } from "../utils/errorHandler";
import {
  validateTrendingVideosResponse,
  sanitizeTrendingVideosResponse,
} from "../utils/trendingVideosValidator";

// Constants
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop";

// Get page size from environment or use default
export const PAGE_SIZE = Number(
  import.meta.env.VITE_TRENDING_VIDEOS_PAGE_SIZE
) || 10;

/**
 * Format number with K/M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Calculate engagement rate as (likes / views) * 100
 */
export function calculateEngagementRate(likes: number, views: number): string {
  if (views === 0) {
    return "0.00%";
  }
  const rate = (likes / views) * 100;
  return `${rate.toFixed(2)}%`;
}

/**
 * Extract hashtags from description
 * Matches words starting with # symbol
 */
export function extractHashtags(description: string): string[] {
  if (!description) {
    return [];
  }
  const hashtags = description.match(/#\w+/g);
  return hashtags ? hashtags.map((tag) => tag.substring(1)) : [];
}

/**
 * Format duration from seconds to "XXs" format
 */
export function formatDuration(seconds: number): string {
  return `${seconds}s`;
}

/**
 * Format timestamp to readable date-time string
 * Format: "14 Nov 25, 11:31 PM"
 */
export function formatTimestamp(timestamp: number | string | Date): string {
  try {
    let date: Date;
    
    if (typeof timestamp === "number") {
      // Unix timestamp in seconds
      date = new Date(timestamp * 1000);
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else {
      date = timestamp;
    }

    if (isNaN(date.getTime())) {
      date = new Date();
    }

    // Format: "14 Nov 25, 11:31 PM"
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}`;
  } catch {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}, 12:00 AM`;
  }
}

/**
 * Derive category from hashtags
 */
function deriveCategory(hashtags: string[]): string {
  if (!hashtags || hashtags.length === 0) {
    return "General";
  }

  const categoryMap: Record<string, string[]> = {
    Food: ["food", "cooking", "recipe", "foodie", "chef"],
    Entertainment: ["dance", "music", "comedy", "funny", "entertainment"],
    Lifestyle: ["lifestyle", "aesthetic", "vlog", "daily"],
    Fitness: ["fitness", "workout", "gym", "health"],
    Beauty: ["beauty", "makeup", "skincare"],
    Travel: ["travel", "vacation", "explore"],
    DIY: ["diy", "craft", "handmade"],
    Education: ["education", "learning", "tutorial", "howto"],
  };

  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const hashtag of hashtags) {
      if (keywords.some((keyword) => hashtag.toLowerCase().includes(keyword))) {
        return category;
      }
    }
  }

  return "General";
}

/**
 * Get country flag emoji (placeholder for now)
 */
function getCountryFlag(): string {
  const flags = ["🇺🇸", "🇬🇧", "🇯🇵", "🇰🇷", "🇫🇷", "🇮🇹", "🇦🇺", "🌍"];
  return flags[Math.floor(Math.random() * flags.length)];
}

/**
 * Transform MongoDB document to TrendingVideo frontend type
 */
export function transformMongoDocToTrendingVideo(
  doc: MongoTrendingVideoDoc
): TrendingVideo {
  const stats = doc.stats || {
    play_count: 0,
    digg_count: 0,
    comment_count: 0,
    share_count: 0,
  };

  const views = stats.play_count || 0;
  const likes = stats.digg_count || 0;

  return {
    id: doc._id || doc.video_id,
    thumbnail: DEFAULT_THUMBNAIL,
    title: doc.description || "Untitled Video",
    duration: formatDuration(doc.video_duration || 0),
    creatorName: doc.author_username || "Unknown Creator",
    creatorAvatar: DEFAULT_AVATAR,
    creatorUsername: `@${doc.author_username || "unknown"}`,
    country: getCountryFlag(),
    category: deriveCategory(doc.hashtags || []),
    followerCount: 0, // Not available in current data
    publicationTime: formatTimestamp(doc.create_time || Date.now()),
    views: formatNumber(views),
    likes: formatNumber(likes),
    engagementRate: calculateEngagementRate(likes, views),
  };
}

/**
 * Check if error is retryable (network or 5xx errors)
 */
function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as { response?: { status?: number } };
  return !err.response || (err.response.status ?? 0) >= 500;
}

/**
 * Make API request with retry logic
 */
async function makeRequestWithRetry<T>(
  request: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (retries === 0 || !isRetryableError(error)) {
      throw error;
    }

    const delay = INITIAL_DELAY * Math.pow(2, MAX_RETRIES - retries);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return makeRequestWithRetry(request, retries - 1);
  }
}

/**
 * Fetch trending videos from API with pagination
 */
export async function fetchTrendingVideos(
  limit: number = 10,
  skip: number = 0
): Promise<{
  videos: TrendingVideo[];
  total: number;
  hasMore: boolean;
}> {
  try {
    // Make API call with retry logic
    const response = await makeRequestWithRetry(() =>
      apiClient.get<TrendingVideosApiResponse>("/trending", {
        params: { limit, skip },
      })
    );

    // Validate response structure
    let validatedResponse: TrendingVideosApiResponse;
    if (validateTrendingVideosResponse(response.data)) {
      validatedResponse = response.data;
    } else {
      console.warn("[TrendingVideos] Invalid response format, sanitizing...");
      validatedResponse = sanitizeTrendingVideosResponse(response.data);
    }

    // Transform MongoDB documents to frontend format
    const videos = validatedResponse.videos.map((doc) =>
      transformMongoDocToTrendingVideo(doc)
    );

    return {
      videos,
      total: validatedResponse.total,
      hasMore: validatedResponse.hasMore,
    };
  } catch (error) {
    const trendingError = handleApiError(error);
    console.error("[TrendingVideos] Failed to fetch videos:", trendingError);
    throw trendingError;
  }
}
