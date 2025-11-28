import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PredictionProvider } from "./contexts/PredictionContext";
import { MainLayout } from "./layouts/MainLayout";
import { LandingPage } from "./pages/LandingPage";
import { PredictionPage } from "./pages/PredictionPage";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PredictionProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="predict" element={<PredictionPage />} />
            </Route>
          </Routes>
        </PredictionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
