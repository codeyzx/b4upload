import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Zap, TrendingUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { TrendingTable } from "../components/TrendingTable";
import { LoginModal } from "../components/LoginModal";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { MOCK_TRENDING_VIDEOS } from "../data/mockData";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(5);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("login") === "true") {
      setIsLoginModalOpen(true);
    }
  }, [searchParams]);

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    setSearchParams({});
  };

  const handlePredictClick = () => {
    if (isAuthenticated) {
      navigate("/predict");
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, MOCK_TRENDING_VIDEOS.length));
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
      <section className="py-20 bg-white dark:bg-[#0F172A]">
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
              </p>
            </div>
          </div>

          {/* Trending Table */}
          <TrendingTable
            videos={MOCK_TRENDING_VIDEOS}
            visibleCount={visibleCount}
            onLoadMore={handleLoadMore}
            hasMore={visibleCount < MOCK_TRENDING_VIDEOS.length}
          />
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </div>
  );
};
