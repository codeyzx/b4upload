import {
  PredictionFormData,
  PredictionResult,
  EngagementStatus,
} from "../types";
import { PredictApiRequest, PredictApiResponse } from "../types/api";
import { apiClient } from "../config/api";
import { handleApiError } from "../utils/errorHandler";
import {
  validatePredictionResponse,
  sanitizePredictionResponse,
} from "../utils/responseValidator";

// Constants
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

/**
 * Extract hashtag count from caption
 * Matches words starting with # symbol
 */
export function extractHashtagCount(caption: string): number {
  const hashtags = caption.match(/#\w+/g);
  return hashtags ? hashtags.length : 0;
}

/**
 * Format date to ISO 8601 string
 * Converts to UTC timezone
 */
export function formatScheduleTime(dateTime: string): string {
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      // Invalid date, use current time
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    // Fallback to current time
    return new Date().toISOString();
  }
}

/**
 * Transform frontend form data to API request format
 */
export function transformToApiRequest(
  data: PredictionFormData
): PredictApiRequest {
  return {
    video_duration: data.videoDuration,
    hashtags_count: extractHashtagCount(data.caption),
    schedule_time: formatScheduleTime(data.scheduleTime),
    music_title: data.musicTitle || "Original Sound",
  };
}

/**
 * Map API prediction label to internal engagement status
 */
function mapEngagementStatus(prediction: string): EngagementStatus {
  const normalized = prediction.toLowerCase();
  if (normalized === "tinggi") return "HIGH";
  if (normalized === "sedang") return "MEDIUM";
  if (normalized === "rendah") return "LOW";
  // Default fallback
  return "MEDIUM";
}

/**
 * Transform API response to internal PredictionResult format
 */
export function transformFromApiResponse(
  response: PredictApiResponse,
  formData: PredictionFormData
): PredictionResult {
  const engagementStatus = mapEngagementStatus(response.prediction);
  const confidenceScore = Math.round(response.confidence_score * 100);

  // Transform probabilities array to distribution object
  const probabilityDistribution = {
    low: 0,
    medium: 0,
    high: 0,
  };

  response.probabilities.forEach((prob) => {
    const percentage = Math.round(prob.score * 100);
    const label = prob.label.toLowerCase();
    if (label === "rendah") {
      probabilityDistribution.low = percentage;
    } else if (label === "sedang") {
      probabilityDistribution.medium = percentage;
    } else if (label === "tinggi") {
      probabilityDistribution.high = percentage;
    }
  });

  // Generate suggestions based on prediction
  const hashtagCount = extractHashtagCount(formData.caption);
  const suggestions = generateSuggestions(
    engagementStatus,
    formData.videoDuration,
    hashtagCount,
    formData.musicTitle
  );

  return {
    engagementStatus,
    confidenceScore,
    probabilityDistribution,
    suggestions,
    modelInsight: response.shap_insight,
    // Backward compatibility
    prediction: response.prediction,
    confidence_score: response.confidence_score,
    probabilities: response.probabilities,
    shap_insight: response.shap_insight,
  };
}

/**
 * Generate actionable suggestions based on prediction results
 */
function generateSuggestions(
  engagementStatus: EngagementStatus,
  videoDuration: number,
  hashtagCount: number,
  musicTitle: string
): string[] {
  const suggestions: string[] = [];

  // Status-based suggestions
  if (engagementStatus === "HIGH") {
    suggestions.push("Great! Your content has high engagement potential.");
    suggestions.push("Consider posting at peak hours for maximum reach.");
  } else if (engagementStatus === "MEDIUM") {
    suggestions.push("Good foundation. Try optimizing your hashtags.");
    suggestions.push("Consider adjusting video duration for better engagement.");
  } else {
    suggestions.push("Try increasing video duration to 15-60 seconds.");
    suggestions.push("Add 3-7 relevant hashtags for better discoverability.");
  }

  // Duration-based suggestions
  if (videoDuration < 15) {
    suggestions.push("Videos between 15-60 seconds tend to perform better.");
  } else if (videoDuration > 120) {
    suggestions.push("Consider shortening your video for better retention.");
  }

  // Hashtag-based suggestions
  if (hashtagCount < 3) {
    suggestions.push("Add more hashtags (3-7 recommended) to boost reach.");
  } else if (hashtagCount > 10) {
    suggestions.push("Too many hashtags may reduce effectiveness. Aim for 3-7.");
  }

  // Music-based suggestions
  if (!musicTitle || musicTitle === "Original Sound") {
    suggestions.push("Adding trending music can improve engagement.");
  }

  return suggestions.slice(0, 4); // Limit to 4 suggestions
}

/**
 * Check if error is retryable (network or 5xx errors)
 */
function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as { response?: { status?: number } };
  // Retry on network errors (no response) or 5xx server errors
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
    console.log(`[Retry] Waiting ${delay}ms before retry. Retries left: ${retries - 1}`);
    
    await new Promise((resolve) => setTimeout(resolve, delay));
    return makeRequestWithRetry(request, retries - 1);
  }
}

/**
 * Main prediction function - calls real ML API
 */
export async function predictVideo(
  data: PredictionFormData
): Promise<PredictionResult> {
  try {
    // Transform form data to API request format
    const apiRequest = transformToApiRequest(data);

    console.log("[Prediction] Sending request to API", apiRequest);

    // Make API call with retry logic
    const response = await makeRequestWithRetry(() =>
      apiClient.post<PredictApiResponse>("/predict", apiRequest)
    );

    console.log("[Prediction] Received response", response.data);

    // Validate response structure
    let validatedResponse: PredictApiResponse;
    if (validatePredictionResponse(response.data)) {
      validatedResponse = response.data;
    } else {
      console.warn("[Prediction] Invalid response format, sanitizing...");
      validatedResponse = sanitizePredictionResponse(response.data);
    }

    // Transform to internal format
    const result = transformFromApiResponse(validatedResponse, data);

    console.log("[Prediction] Transformed result", result);

    return result;
  } catch (error) {
    // Handle and transform error
    const predictionError = handleApiError(error);
    console.error("[Prediction] Error occurred", predictionError);
    throw predictionError;
  }
}
