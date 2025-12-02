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


