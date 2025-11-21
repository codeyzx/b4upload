import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Github, Twitter } from "lucide-react";
import PredictionForm from "./components/PredictionForm";
import ResultDashboard from "./components/ResultDashboard";

function App() {
  const [predictionResult, setPredictionResult] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePredictionSubmit = async (formData) => {
    setIsLoading(true);
    try {
      // API call will be implemented here
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const result = await response.json();
      setPredictionResult(result);
    } catch (error) {
      console.error("Prediction error:", error);
      setPredictionResult({
        error: "Service maintenance. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.2] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-effect-strong">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-outfit tracking-tight">
              B4<span className="text-violet-400">Upload</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              How it works
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              About
            </a>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl px-4 pt-32 pb-20 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            AI-Powered Analysis v2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-outfit mb-6 leading-tight">
            Predict Your Vitality <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">
              Before You Upload
            </span>
          </h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed mb-8">
            Stop guessing. Use our advanced AI model to predict engagement
            rates, optimize your captions, and find the perfect upload time.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <PredictionForm
              onSubmit={handlePredictionSubmit}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Result Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-7"
          >
            <ResultDashboard result={predictionResult} isLoading={isLoading} />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0B1120] py-12 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-md flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-lg font-bold font-outfit text-gray-300">
                B4Upload
              </span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2025 B4Upload AI. All rights reserved.
            </div>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
