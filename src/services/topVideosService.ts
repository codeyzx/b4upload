import { TrendingVideo, MongoTrendingVideoDoc } from "../types";
import { apiClient } from "../config/api";
import { handleApiError } from "../utils/errorHandler";

/**
 * API Response type for top videos endpoint
 */
interface TopVideosApiResponse {
  videos: MongoTrendingVideoDoc[];
  count: number;
  last_updated: string;
}

/**
 * Generate TikTok video URL
 * Format: https://www.tiktok.com/@username/video/videoId
 */
export function generateTikTokUrl(username: string, videoId: string): string {
  return `https://www.tiktok.com/@${username}/video/${videoId}`;
}

/**
 * Generate TikTok profile URL
 * Format: https://www.tiktok.com/@username
 */
export function generateTikTokProfileUrl(username: string): string {
  return `https://www.tiktok.com/@${username}`;
}

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
 * Calculate engagement rate as ((likes + comments + shares) / views) * 100
 */
export function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  views: number
): string {
  if (views === 0) {
    return "0.00%";
  }
  const rate = ((likes + comments + shares) / views) * 100;
  return `${rate.toFixed(2)}%`;
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
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}`;
  } catch {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString("en-US", { month: "short" });
    const year = now.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}, 12:00 AM`;
  }
}

/**
 * Transform MongoDB document to TrendingVideo frontend type
 * Reuses transformation logic from trendingVideosService
 */
export function transformMongoDocToTrendingVideo(
  doc: MongoTrendingVideoDoc
): TrendingVideo {
  const stats = doc.stats || {
    play_count: 0,
    digg_count: 0,
    comment_count: 0,
    share_count: 0,
    collect_count: 0,
  };

  const views = stats.play_count || 0;
  const likes = stats.digg_count || 0;
  const comments = stats.comment_count || 0;
  const shares = stats.share_count || 0;

  const username = doc.author_username || "unknown";
  const videoId = doc.video_id || doc._id;

  return {
    id: doc._id || doc.video_id,
    title: doc.description || "Untitled Video",
    duration: formatDuration(doc.video_duration || 0),
    creatorName:
      doc.author_nickname || doc.author_username || "Unknown Creator",
    creatorUsername: username,
    creatorVerified: doc.author_verified || false,
    tiktokUrl: generateTikTokUrl(username, videoId),
    tiktokProfileUrl: generateTikTokProfileUrl(username),
    followerCount: doc.author_followers || 0,
    publicationTime: formatTimestamp(doc.create_time || Date.now()),
    views: formatNumber(views),
    likes: formatNumber(likes),
    engagementRate: calculateEngagementRate(likes, comments, shares, views),
  };
}

/**
 * Fetch top 10 videos from API
 * No pagination - returns all top videos (max 10)
 */
export async function fetchTopVideos(): Promise<{
  videos: TrendingVideo[];
  lastUpdated: string;
}> {
  try {
    // Make API call to top-videos endpoint
    const response = await apiClient.get<TopVideosApiResponse>("/top-videos");

    // Transform MongoDB documents to frontend format
    const videos = response.data.videos.map((doc) =>
      transformMongoDocToTrendingVideo(doc)
    );

    return {
      videos,
      lastUpdated: response.data.last_updated,
    };
  } catch (error) {
    const topVideosError = handleApiError(error);
    console.error("[TopVideos] Failed to fetch videos:", topVideosError);
    throw topVideosError;
  }
}
