import { PredictApiResponse } from "../types/api";

export function validatePredictionResponse(
  data: unknown
): data is PredictApiResponse {
  if (!data || typeof data !== "object") {
    return false;
  }

  const response = data as Partial<PredictApiResponse>;

  // Check required fields
  if (!response.prediction || typeof response.prediction !== "string") {
    return false;
  }

  if (
    typeof response.confidence_score !== "number" ||
    response.confidence_score < 0 ||
    response.confidence_score > 1
  ) {
    return false;
  }

  if (!Array.isArray(response.probabilities)) {
    return false;
  }

  // Validate probabilities array
  for (const prob of response.probabilities) {
    if (
      !prob ||
      !prob.label ||
      typeof prob.label !== "string" ||
      typeof prob.score !== "number"
    ) {
      return false;
    }
  }

  return true;
}

export function sanitizePredictionResponse(
  data: Partial<PredictApiResponse>
): PredictApiResponse {
  return {
    prediction: data.prediction || "sedang",
    confidence_score: Math.max(0, Math.min(1, data.confidence_score || 0.5)),
    probabilities: Array.isArray(data.probabilities)
      ? data.probabilities.map((p) => ({
          label: p?.label || "unknown",
          score: Math.max(0, Math.min(1, p?.score || 0)),
        }))
      : [
          { label: "rendah", score: 0.33 },
          { label: "sedang", score: 0.34 },
          { label: "tinggi", score: 0.33 },
        ],
    shap_insight: data.shap_insight || "Prediction completed successfully.",
  };
}
