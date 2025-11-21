import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  Zap,
  BarChart2,
} from "lucide-react";

const ResultDashboard = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass-effect rounded-3xl p-8 h-full min-h-[500px] flex flex-col items-center justify-center border border-white/10">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-8 h-8 text-violet-400 animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analyzing Content</h3>
        <p className="text-gray-400 text-center max-w-xs">
          Our AI is processing your video details to predict engagement
          potential...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-effect rounded-3xl p-8 h-full min-h-[500px] flex flex-col items-center justify-center border border-white/10 text-center">
        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-700">
          <BarChart2 className="w-10 h-10 text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Ready to Predict</h3>
        <p className="text-gray-400 max-w-xs">
          Fill out the form on the left to get instant AI-powered engagement
          predictions.
        </p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="glass-effect rounded-3xl p-8 h-fit border border-red-500/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Error Occurred</h2>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <p className="text-red-300 font-medium">{result.error}</p>
        </div>
      </div>
    );
  }

  // Prepare data for bar chart
  const chartData =
    result.probabilities?.map((prob) => ({
      label: prob.label.charAt(0).toUpperCase() + prob.label.slice(1),
      score: Math.round(prob.score * 100),
      color: getColorForLabel(prob.label),
    })) || [];

  // Get prediction badge color and icon
  const getPredictionStyle = (prediction) => {
    switch (prediction?.toLowerCase()) {
      case "tinggi":
        return {
          gradient: "from-emerald-500 to-teal-500",
          text: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          icon: CheckCircle,
        };
      case "sedang":
        return {
          gradient: "from-amber-500 to-orange-500",
          text: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          icon: Clock,
        };
      case "rendah":
        return {
          gradient: "from-red-500 to-pink-500",
          text: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          icon: AlertCircle,
        };
      default:
        return {
          gradient: "from-gray-500 to-slate-500",
          text: "text-gray-400",
          bg: "bg-gray-500/10",
          border: "border-gray-500/20",
          icon: TrendingUp,
        };
    }
  };

  const predictionStyle = getPredictionStyle(result.prediction);
  const PredictionIcon = predictionStyle.icon;

  // Generate AI suggestions
  const getAISuggestions = (prediction, confidence) => {
    const suggestions = [];

    if (prediction?.toLowerCase() === "rendah") {
      suggestions.push({
        title: "Music Choice",
        desc: "Try using trending music or sounds to boost reach.",
        icon: MusicIcon,
      });
      suggestions.push({
        title: "Timing",
        desc: "Upload during prime time (19:00 - 21:00) for better visibility.",
        icon: Clock,
      });
      suggestions.push({
        title: "Hashtags",
        desc: "Add 3-5 relevant hashtags to categorize your content.",
        icon: HashIcon,
      });
    } else if (prediction?.toLowerCase() === "sedang") {
      suggestions.push({
        title: "Engagement",
        desc: "Ask a question in your caption to encourage comments.",
        icon: MessageCircleIcon,
      });
      suggestions.push({
        title: "Duration",
        desc: "Optimal video length for this category is 15-60 seconds.",
        icon: Clock,
      });
    } else {
      suggestions.push({
        title: "Excellent!",
        desc: "Your content has high engagement potential. Keep it up!",
        icon: CheckCircle,
      });
      suggestions.push({
        title: "Consistency",
        desc: "Consider this timing and format for future uploads.",
        icon: CalendarIcon,
      });
    }

    if (confidence < 0.7) {
      suggestions.push({
        title: "Note",
        desc: "Results may vary - consider A/B testing different captions.",
        icon: AlertCircle,
      });
    }

    return suggestions;
  };

  // Mock icons for suggestions since I can't import them all dynamically easily without clutter
  const MusicIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  );
  const HashIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
      />
    </svg>
  );
  const MessageCircleIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
  const CalendarIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const suggestions = getAISuggestions(
    result.prediction,
    result.confidence_score
  );

  return (
    <div className="glass-effect rounded-3xl p-8 h-fit border border-white/10 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500/30">
          <TrendingUp className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Prediction Results</h2>
          <p className="text-sm text-gray-400">AI Analysis Report</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Prediction Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`relative overflow-hidden rounded-2xl p-6 flex flex-col items-center justify-center text-center border ${predictionStyle.border} ${predictionStyle.bg}`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${predictionStyle.gradient} opacity-10`}
          />
          <PredictionIcon
            className={`w-12 h-12 mb-3 ${predictionStyle.text}`}
          />
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">
            Predicted Engagement
          </h3>
          <div className={`text-3xl font-bold ${predictionStyle.text}`}>
            {result.prediction?.toUpperCase() || "UNKNOWN"}
          </div>
        </motion.div>

        {/* Confidence Score */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center mb-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-800"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={
                  251.2 - 251.2 * (result.confidence_score || 0)
                }
                className={`${predictionStyle.text} transition-all duration-1000 ease-out`}
              />
            </svg>
            <span className="absolute text-2xl font-bold text-white">
              {Math.round((result.confidence_score || 0) * 100)}%
            </span>
          </div>
          <span className="text-sm font-medium text-gray-400">
            Confidence Score
          </span>
        </div>
      </div>

      {/* Probability Bar Chart */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Probability Distribution
        </h4>
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 500 }}
                width={60}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="score"
                radius={[0, 4, 4, 0]}
                barSize={24}
                background={{
                  fill: "rgba(255,255,255,0.05)",
                  radius: [0, 4, 4, 0],
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h4 className="text-lg font-bold text-white">AI Suggestions</h4>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-colors flex items-start gap-4"
            >
              <div className="mt-1 p-2 bg-gray-800 rounded-lg">
                <suggestion.icon className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white mb-1">
                  {suggestion.title}
                </h5>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {suggestion.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {result.shap_insight && (
          <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
            <p className="text-xs text-violet-300 leading-relaxed">
              <span className="font-bold block mb-1">Model Insight:</span>
              {result.shap_insight}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get color for each label
function getColorForLabel(label) {
  switch (label?.toLowerCase()) {
    case "tinggi":
      return "#10b981"; // emerald-500
    case "sedang":
      return "#f59e0b"; // amber-500
    case "rendah":
      return "#ef4444"; // red-500
    default:
      return "#6b7280"; // gray-500
  }
}

export default ResultDashboard;
