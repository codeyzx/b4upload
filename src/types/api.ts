// API Request Types
export interface PredictApiRequest {
  video_duration: number;
  hashtags_count: number;
  schedule_time: string; // ISO 8601 format
  music_title: string;
}

// API Response Types
export interface PredictApiResponse {
  prediction: string; // "rendah" | "sedang" | "tinggi"
  confidence_score: number; // 0-1 range
  probabilities: Array<{
    label: string;
    score: number;
  }>;
  shap_insight: string;
}

// Error Response Types
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

// Trending Videos API Types
export interface TrendingVideosApiResponse {
  videos: Array<{
    _id: string;
    video_id: string;
    author_username: string;
    author_id: string;
    description: string;
    hashtags: string[];
    hashtags_count: number;
    create_time: number;
    stats: {
      play_count: number;
      digg_count: number;
      comment_count: number;
      share_count: number;
    };
    video_duration: number;
    music_title: string;
    fetched_at: string;
  }>;
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}
