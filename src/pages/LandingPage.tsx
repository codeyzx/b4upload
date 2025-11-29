import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, TrendingUp, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { TrendingTable } from "../components/TrendingTable";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useTrendingVideos } from "../hooks/useTrendingVideos";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const scrollPositionRef = useRef(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    videos,
    isLoading,
    error,
    hasMore,
    totalCount,
    loadMore,
    retry,
  } = useTrendingVideos();

  // Save scroll position before updates
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePredictClick = () => {
    navigate("/predict");
  };

  const handleLoadMore = async () => {
    const currentScroll = window.scrollY;
    await loadMore();
    // Restore scroll position after load
    window.scrollTo(0, currentScroll);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-[#0B1120] dark:to-[#0F172A] pt-20 pb-32">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="info" size="lg">
              <Sparkles size={14} className="mr-1.5" />
              AI-Powered Analysis v2.0
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent">
              Predict TikTok Video
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">
              Success Before Upload
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Leverage AI to analyze your content parameters and predict
            engagement rates before publishing. Make data-driven decisions for
            viral success.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePredictClick}
              className="w-full sm:w-auto"
            >
              <Zap size={20} className="mr-2" />
              Predict Your Content
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-violet-600 dark:text-violet-400">
                95%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Accuracy Rate
              </p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
                50K+
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Predictions Made
              </p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                10K+
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active Users
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Videos Section */}
      <section ref={sectionRef} className="py-20 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp size={28} className="text-violet-600" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Trending Videos Today
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time analysis of top-performing content
                {totalCount > 0 && (
                  <span className="ml-2 text-violet-600 dark:text-violet-400 font-medium">
                    ({totalCount} videos)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && videos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Loading trending videos...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && videos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md">
                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 text-center mb-2">
                  Failed to Load Videos
                </h3>
                <p className="text-red-700 dark:text-red-300 text-center mb-6">
                  {error}
                </p>
                <Button
                  variant="primary"
                  onClick={retry}
                  className="w-full"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && videos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 max-w-md">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
                  No Trending Videos
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  No trending videos are available at the moment. Check back later!
                </p>
              </div>
            </div>
          )}

          {/* Trending Table */}
          {videos.length > 0 && (
            <TrendingTable
              videos={videos}
              visibleCount={videos.length}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              isLoading={isLoading}
            />
          )}

          {/* Load More Error */}
          {error && videos.length > 0 && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retry}
                >
                  <RefreshCw size={14} className="mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
