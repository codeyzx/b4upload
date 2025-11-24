import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PredictionResult, PredictionState } from '../types';

interface PredictionContextType extends PredictionState {
  setPrediction: (result: PredictionResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPrediction: () => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error('usePrediction must be used within PredictionProvider');
  }
  return context;
};

interface PredictionProviderProps {
  children: ReactNode;
}

export const PredictionProvider: React.FC<PredictionProviderProps> = ({ children }) => {
  const [predictionState, setPredictionState] = useState<PredictionState>({
    currentPrediction: null,
    isLoading: false,
    error: null,
  });

  const setPrediction = (result: PredictionResult | null) => {
    setPredictionState(prev => ({
      ...prev,
      currentPrediction: result,
      error: null,
    }));
  };

  const setLoading = (loading: boolean) => {
    setPredictionState(prev => ({
      ...prev,
      isLoading: loading,
    }));
  };

  const setError = (error: string | null) => {
    setPredictionState(prev => ({
      ...prev,
      error,
      isLoading: false,
    }));
  };

  const clearPrediction = () => {
    setPredictionState({
      currentPrediction: null,
      isLoading: false,
      error: null,
    });
  };

  const value: PredictionContextType = {
    ...predictionState,
    setPrediction,
    setLoading,
    setError,
    clearPrediction,
  };

  return <PredictionContext.Provider value={value}>{children}</PredictionContext.Provider>;
};
