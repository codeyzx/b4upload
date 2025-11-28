import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { usePrediction } from "../contexts/PredictionContext";
import { PredictionForm } from "../components/PredictionForm";
import { PredictionResult } from "../components/PredictionResult";
import { LoginModal } from "../components/LoginModal";
import { Button } from "../components/ui/Button";
import { PredictionFormData } from "../types";
import { predictVideo } from "../services/predictionService";

export const PredictionPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { currentPrediction, isLoading, setPrediction, setLoading, setError } =
    usePrediction();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated]);

  const handlePredictionSubmit = async (data: PredictionFormData) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await predictVideo(data);
      setPrediction(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Prediction failed");
      console.error("Prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseLoginModal = () => {
    if (!isAuthenticated) {
      navigate("/");
    } else {
      setIsLoginModalOpen(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left Panel - Form (40%) */}
          <div className="lg:col-span-2">
            <PredictionForm
              onSubmit={handlePredictionSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* Right Panel - Results (60%) */}
          <div className="lg:col-span-3">
            <PredictionResult
              result={currentPrediction}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </div>
  );
};
