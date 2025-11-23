// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Theme Types
export type ThemeMode = 'dark' | 'light';

export interface ThemeState {
  mode: ThemeMode;
}

// Prediction Form Types
export interface PredictionFormData {
  videoDuration: number;
  caption: string;
  musicTitle: string;
  scheduleTime: string;
}

// Prediction Result Types
export type EngagementStatus = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ProbabilityDistribution {
  low: number;
  medium: number;
  high: number;
}

export interface PredictionResult {
  engagementStatus: EngagementStatus;
  confidenceScore: number;
  probabilityDistribution: ProbabilityDistribution;
  suggestions: string[];
  modelInsight: string;
  prediction?: string; // For backward compatibility
  confidence_score?: number; // For backward compatibility
  probabilities?: Array<{ label: string; score: number }>; // For backward compatibility
  shap_insight?: string; // For backward compatibility
}

export interface PredictionState {
  currentPrediction: PredictionResult | null;
  isLoading: boolean;
  error: string | null;
}

// Trending Videos Types
export interface TrendingVideo {
  id: number;
  thumbnail: string;
  title: string;
  duration: string;
  creatorName: string;
  creatorAvatar: string;
  creatorUsername: string;
  country: string;
  category: string;
  followerCount: number;
  publicationTime: string;
  views: string;
  likes: string;
  engagementRate: string;
}

export interface TrendingVideosState {
  videos: TrendingVideo[];
  visibleCount: number;
  isLoading: boolean;
  hasMore: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}
