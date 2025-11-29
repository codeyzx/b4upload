import { TrendingVideosApiResponse } from "../types/api";
import { MongoTrendingVideoDoc } from "../types";

/**
 * Type guard to validate MongoDB document structure
 * More lenient - only checks critical fields
 */
export function isValidMongoDoc(doc: unknown): doc is MongoTrendingVideoDoc {
  if (!doc || typeof doc !== "object") {
    return false;
  }

  const d = doc as Partial<MongoTrendingVideoDoc>;

  // Check required string fields (allow empty strings)
  if (typeof d._id !== "string") {
    return false;
  }
  
  if (typeof d.video_id !== "string") {
    return false;
  }

  // Check stats object exists (values can be missing)
  if (!d.stats || typeof d.stats !== "object") {
    return false;
  }

  // All other fields are optional or will use defaults
  return true;
}

/**
 * Type guard to validate trending videos API response
 */
export function validateTrendingVideosResponse(
  data: unknown
): data is TrendingVideosApiResponse {
  if (!data || typeof data !== "object") {
    return false;
  }

  const response = data as Partial<TrendingVideosApiResponse>;

  // Check required fields
  if (!Array.isArray(response.videos)) {
    return false;
  }

  if (
    typeof response.total !== "number" ||
    typeof response.limit !== "number" ||
    typeof response.skip !== "number" ||
    typeof response.hasMore !== "boolean"
  ) {
    return false;
  }

  // Validate each video document (lenient - just check if they're objects)
  for (const video of response.videos) {
    if (!isValidMongoDoc(video)) {
      console.warn("[TrendingVideos] Invalid video document found, will be filtered out");
      // Don't fail the entire response, just log the warning
    }
  }

  return true;
}

/**
 * Sanitize trending videos API response with safe defaults
 */
export function sanitizeTrendingVideosResponse(
  data: Partial<TrendingVideosApiResponse>
): TrendingVideosApiResponse {
  const videos = Array.isArray(data.videos)
    ? data.videos.filter((v) => isValidMongoDoc(v))
    : [];

  return {
    videos,
    total: typeof data.total === "number" ? data.total : videos.length,
    limit: typeof data.limit === "number" ? data.limit : 10,
    skip: typeof data.skip === "number" ? data.skip : 0,
    hasMore: typeof data.hasMore === "boolean" ? data.hasMore : false,
  };
}

/**
 * Sanitize a single MongoDB document with safe defaults
 */
export function sanitizeMongoDoc(
  doc: Partial<MongoTrendingVideoDoc>
): MongoTrendingVideoDoc {
  return {
    _id: doc._id || "",
    video_id: doc.video_id || doc._id || "",
    author_username: doc.author_username || "Unknown",
    author_nickname: doc.author_nickname || "",
    author_id: doc.author_id || "",
    author_followers: typeof doc.author_followers === "number" ? doc.author_followers : 0,
    author_verified: typeof doc.author_verified === "boolean" ? doc.author_verified : false,
    description: doc.description || "",
    hashtags: Array.isArray(doc.hashtags) ? doc.hashtags : [],
    hashtags_count:
      typeof doc.hashtags_count === "number"
        ? doc.hashtags_count
        : Array.isArray(doc.hashtags)
        ? doc.hashtags.length
        : 0,
    create_time: typeof doc.create_time === "number" ? doc.create_time : 0,
    stats: {
      play_count: doc.stats?.play_count || 0,
      digg_count: doc.stats?.digg_count || 0,
      comment_count: doc.stats?.comment_count || 0,
      share_count: doc.stats?.share_count || 0,
      collect_count: doc.stats?.collect_count || 0,
    },
    video_duration: typeof doc.video_duration === "number" ? doc.video_duration : 0,
    music_title: doc.music_title || "Original Sound",
    fetched_at: doc.fetched_at || new Date().toISOString(),
  };
}
