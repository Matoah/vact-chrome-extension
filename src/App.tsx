import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";

import FrontendMonitor from "./pages/FrontendMonitor";
import PerformanceAnalysis from "./pages/PerformanceAnalysis";
import Portal from "./pages/Portal";
import VjsSizeAnalysis from "./pages/VjsSizeAnalysis";
import VjsDepAnalysis from "./pages/VjsDepAnalysis";
import VjsSizeUlList from "./pages/VjsSizeUlList";
import VjsDepUrlList from "./pages/VjsDepUrlList";
import TimelineMonitor from "./pages/TimelineMonitor";
import { DarkSpacesTheme } from "./themes/DarkSpacesTheme";

function App() {
  return (
    <ThemeProvider theme={DarkSpacesTheme}>
      <BrowserRouter basename="/dist">
        <Routes>
          <Route path="/" element={<Portal />} />
          <Route path="/index.html" element={<Portal />} />
          <Route path="/performance" element={<PerformanceAnalysis />} />
          <Route path="/vjsSizeUrlList" element={<VjsSizeUlList />} />
          <Route path="/vjsDepUrlList" element={<VjsDepUrlList />} />
          <Route path="/vjsSizeAnalysis/:id" element={<VjsSizeAnalysis />} />
          <Route path="/vjsDepAnalysis/:id" element={<VjsDepAnalysis />} />
          <Route path="/frontendMonitor" element={<FrontendMonitor />} />
          <Route path="/timelineMonitor" element={<TimelineMonitor />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
