import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/Button";

export const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b-[1.5px] border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-all duration-200">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              B4Upload
            </span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Predict Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/predict")}
            >
              <Zap size={16} className="mr-2" />
              Predict
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
