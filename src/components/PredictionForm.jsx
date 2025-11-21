import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Hash, Music, Play, Loader2, Calendar } from "lucide-react";

const PredictionForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    video_duration: 30,
    caption: "",
    music_title: "",
    schedule_time: "",
  });

  const [hashtagCount, setHashtagCount] = useState(0);

  // Auto-detect hashtags from caption
  React.useEffect(() => {
    const hashtags = formData.caption.match(/#[\w]+/g) || [];
    setHashtagCount(hashtags.length);
  }, [formData.caption]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.schedule_time) {
      alert("Please select a schedule time");
      return;
    }

    if (formData.video_duration < 1 || formData.video_duration > 300) {
      alert("Video duration must be between 1-300 seconds");
      return;
    }

    // Prepare data for API
    const apiData = {
      video_duration: parseInt(formData.video_duration),
      hashtags_count: hashtagCount,
      schedule_time: formData.schedule_time,
      music_title: formData.music_title || "Original Sound",
    };

    onSubmit(apiData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="glass-effect rounded-3xl p-8 h-fit border border-white/10 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500/30">
          <Play className="w-6 h-6 text-violet-400 fill-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Video Details</h2>
          <p className="text-sm text-gray-400">Enter your content parameters</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Video Duration */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Clock className="w-4 h-4 text-violet-400" />
              Video Duration
            </label>
            <span className="text-2xl font-bold text-white font-outfit">
              {formData.video_duration}
              <span className="text-sm text-gray-500 font-normal ml-1">s</span>
            </span>
          </div>
          <div className="relative h-6 flex items-center">
            <input
              type="range"
              min="1"
              max="300"
              value={formData.video_duration}
              onChange={(e) =>
                handleInputChange("video_duration", e.target.value)
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider z-10 relative"
            />
            <div className="absolute w-full flex justify-between text-[10px] text-gray-500 -bottom-5 font-medium uppercase tracking-wider">
              <span>1s</span>
              <span>150s</span>
              <span>300s</span>
            </div>
          </div>
        </div>

        {/* Caption with Hashtag Counter */}
        <div className="input-group group">
          <div className="flex justify-between items-center mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 transition-colors">
              <Hash className="w-4 h-4 text-gray-500 transition-colors" />
              Caption & Hashtags
            </label>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium transition-all ${
                hashtagCount > 0
                  ? "bg-violet-500 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {hashtagCount} tags
            </span>
          </div>
          <div className="relative">
            <textarea
              value={formData.caption}
              onChange={(e) => handleInputChange("caption", e.target.value)}
              placeholder="Write your caption here... #fyp #viral"
              rows={4}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none"
            />
            <div className="absolute bottom-3 right-3 pointer-events-none">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                Auto-detect
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Music Title */}
          <div className="input-group group">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 transition-colors">
              <Music className="w-4 h-4 text-gray-500 transition-colors" />
              Music Title
            </label>
            <input
              type="text"
              value={formData.music_title}
              onChange={(e) => handleInputChange("music_title", e.target.value)}
              placeholder="Original Sound"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>

          {/* Schedule Time */}
          <div className="input-group group">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 transition-colors">
              <Calendar className="w-4 h-4 text-gray-500 transition-colors" />
              Schedule Time
            </label>
            <input
              type="datetime-local"
              value={formData.schedule_time}
              onChange={(e) =>
                handleInputChange("schedule_time", e.target.value)
              }
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all [color-scheme:dark]"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
          }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-violet-900/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Content...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              Predict Engagement
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default PredictionForm;
