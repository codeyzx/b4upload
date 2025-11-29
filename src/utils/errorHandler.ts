import axios, { AxiosError } from "axios";
import { ApiErrorResponse } from "../types/api";

export class PredictionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "PredictionError";
  }
}

export function handleApiError(error: unknown): PredictionError {
  // Log error for debugging
  console.error("[Prediction Error Handler]", error);

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    if (!axiosError.response) {
      // Network error
      return new PredictionError(
        "Unable to connect to the server. Please check your internet connection.",
        "NETWORK_ERROR"
      );
    }

    const { status, data } = axiosError.response;

    switch (status) {
      case 400:
        return new PredictionError(
          data?.error || "Invalid input data. Please check your form.",
          "VALIDATION_ERROR",
          400,
          data
        );
      case 500:
        return new PredictionError(
          "Server error occurred. Please try again later.",
          "SERVER_ERROR",
          500,
          data
        );
      case 504:
        return new PredictionError(
          "Request timeout. The server took too long to respond.",
          "TIMEOUT_ERROR",
          504
        );
      default:
        return new PredictionError(
          data?.error || "An unexpected error occurred.",
          "UNKNOWN_ERROR",
          status,
          data
        );
    }
  }

  if (error instanceof Error) {
    return new PredictionError(error.message, "UNKNOWN_ERROR");
  }

  return new PredictionError("An unexpected error occurred.", "UNKNOWN_ERROR");
}
