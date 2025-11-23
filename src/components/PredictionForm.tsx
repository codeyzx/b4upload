import React, { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Clock, Hash, Music, Calendar, Zap, Lightbulb } from 'lucide-react';
import { PredictionFormData } from '../types';
import { Button } from './ui/Button';

interface PredictionFormProps {
  onSubmit: (data: PredictionFormData) => void;
  isLoading: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit, isLoading }) => {
  const [videoDuration, setVideoDuration] = useState(30);
  const [caption, setCaption] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [hashtagCount, setHashtagCount] = useState(0);

  // Set default schedule time on mount
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
    setScheduleTime(formatted);
  }, []);

  // Count hashtags in real-time
  useEffect(() => {
    const hashtags = caption.match(/#\w+/g);
    setHashtagCount(hashtags ? hashtags.length : 0);
  }, [caption]);

  const isFormValid = videoDuration && caption && scheduleTime;

  const getProgressPercentage = () => {
    return (videoDuration / 300) * 100;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isLoading) return;

    const formData: PredictionFormData = {
      videoDuration: parseInt(videoDuration.toString()),
      caption,
      musicTitle: musicTitle || 'Original Sound',
      scheduleTime,
    };

    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <div className="bg-white dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border-[1.5px] border-gray-200 dark:border-gray-700 shadow-lg p-8 flex flex-col h-full">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Video Details
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your content parameters for AI analysis
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-7">
          <div className="flex-1 space-y-7">
            {/* Video Duration Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Clock size={16} className="text-violet-600" />
                  <span>Video Duration</span>
                </label>
                <div className="px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-lg">
                  <span className="text-sm font-bold text-violet-700 dark:text-violet-400">
                    {videoDuration} seconds
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="300"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all"
                  style={{
                    background: `linear-gradient(to right, 
                      #7C3AED 0%, 
                      #7C3AED ${getProgressPercentage()}%, 
                      #E5E7EB ${getProgressPercentage()}%, 
                      #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <span>1s</span>
                  <span>150s</span>
                  <span>300s</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700/50" />

            {/* Caption & Hashtags */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Hash size={16} className="text-violet-600" />
                  <span>Caption & Hashtags</span>
                </label>
                <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {hashtagCount} hashtags
                  </span>
                </div>
              </div>
              
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption here... #trending #viral #fyp"
                rows={4}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:border-2 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
              
              <div className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <Lightbulb size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Tip:</strong> Use 3-7 hashtags for optimal reach
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700/50" />

            {/* Music Title */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Music size={16} className="text-violet-600" />
                <span>Music Title</span>
              </label>
              
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Music size={18} />
                </div>
                <input
                  type="text"
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  placeholder="Enter background music title"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-[1.5px] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:border-2 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700/50" />

            {/* Schedule Time */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar size={16} className="text-violet-600" />
                <span>Schedule Time</span>
              </label>
              
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Calendar size={18} />
                </div>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-[1.5px] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:border-2 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!isFormValid || isLoading}
              isLoading={isLoading}
            >
              {!isLoading && <Zap size={18} className="mr-2" />}
              {isLoading ? 'Analyzing...' : 'Generate Prediction'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
