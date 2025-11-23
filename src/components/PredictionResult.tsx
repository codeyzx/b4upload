import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Lightbulb, CheckCircle, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { PredictionResult as PredictionResultType } from '../types';
import { Card } from './ui/Card';

interface PredictionResultProps {
  result: PredictionResultType | null;
  isLoading: boolean;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!result) {
    return <EmptyState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <div className="bg-white dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border-[1.5px] border-gray-200 dark:border-gray-700 shadow-lg p-8 space-y-8">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Prediction Results
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            AI Analysis Report
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Predicted Engagement */}
          <Card variant="default" padding="md">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Predicted Engagement
              </p>
              <div className="flex items-center space-x-3">
                {getEngagementIcon(result.engagementStatus)}
                <span className={`text-3xl font-bold ${getEngagementColor(result.engagementStatus)}`}>
                  {result.engagementStatus}
                </span>
              </div>
            </div>
          </Card>

          {/* Confidence Score */}
          <Card variant="default" padding="md">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Confidence Score
              </p>
              <div className="flex items-center space-x-4">
                <CircularProgress value={result.confidenceScore} />
                <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                  {result.confidenceScore}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Probability Distribution */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <TrendingUp size={20} className="text-violet-600" />
            <span>Probability Distribution</span>
          </h3>
          
          <div className="space-y-3">
            <ProbabilityBar
              label="High"
              value={result.probabilityDistribution.high}
              color="emerald"
            />
            <ProbabilityBar
              label="Medium"
              value={result.probabilityDistribution.medium}
              color="amber"
            />
            <ProbabilityBar
              label="Low"
              value={result.probabilityDistribution.low}
              color="red"
            />
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Lightbulb size={20} className="text-amber-500" />
            <span>AI Suggestions</span>
          </h3>
          
          <div className="space-y-2">
            {result.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
              >
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Model Insight */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                Model Insight
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {result.modelInsight}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper Components
const LoadingState: React.FC = () => (
  <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border-[1.5px] border-gray-200 dark:border-gray-700 shadow-lg p-8">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
          <Sparkles size={32} className="text-violet-600 dark:text-violet-400" />
        </div>
        <Loader2 size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-600 animate-spin" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Processing AI Analysis
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Evaluating your content parameters...
        </p>
      </div>
      <div className="w-64 mx-auto h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border-[1.5px] border-gray-200 dark:border-gray-700 shadow-lg p-8">
    <div className="text-center space-y-6 max-w-md">
      <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <Sparkles size={32} className="text-gray-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Prediction Yet
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Fill in the video details on the left and click "Generate Prediction" to see AI analysis results.
        </p>
      </div>
      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

const CircularProgress: React.FC<{ value: number }> = ({ value }) => {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg className="w-16 h-16 -rotate-90">
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        className="text-gray-200 dark:text-gray-700"
      />
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-violet-600 dark:text-violet-400 transition-all duration-500"
      />
    </svg>
  );
};

interface ProbabilityBarProps {
  label: string;
  value: number;
  color: 'emerald' | 'amber' | 'red';
}

const ProbabilityBar: React.FC<ProbabilityBarProps> = ({ label, value, color }) => {
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {value}%
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
        />
      </div>
    </div>
  );
};

const getEngagementIcon = (status: string) => {
  switch (status) {
    case 'HIGH':
      return <TrendingUp size={24} className="text-emerald-500" />;
    case 'MEDIUM':
      return <Minus size={24} className="text-amber-500" />;
    case 'LOW':
      return <TrendingDown size={24} className="text-red-500" />;
    default:
      return <Minus size={24} className="text-gray-500" />;
  }
};

const getEngagementColor = (status: string): string => {
  switch (status) {
    case 'HIGH':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'MEDIUM':
      return 'text-amber-600 dark:text-amber-400';
    case 'LOW':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};
