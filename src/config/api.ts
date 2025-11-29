import axios, { AxiosInstance, AxiosError } from "axios";

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

export const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.VITE_ENABLE_API_LOGGING === "true") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        config.data
      );
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_ENABLE_API_LOGGING === "true") {
      console.log(
        `[API Response] ${response.status} ${response.config.url}`,
        response.data
      );
    }
    return response;
  },
  (error: AxiosError) => {
    console.error(
      "[API Response Error]",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);
