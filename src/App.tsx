import "./App.css";

import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";

import FrontendDebugger from "./pages/FrontendDebugger";
import FrontendMonitor from "./pages/FrontendMonitor";
import PerformanceAnalysis from "./pages/PerformanceAnalysis";
import Portal from "./pages/Portal";
import TimelineMonitor from "./pages/TimelineMonitor";
import VjsDepAnalysis from "./pages/VjsDepAnalysis";
import VjsDepUrlList from "./pages/VjsDepUrlList";
import VjsSizeAnalysis from "./pages/VjsSizeAnalysis";
import VjsSizeUlList from "./pages/VjsSizeUlList";
import Status500 from "./status/500";
import store from "./store";
import { DarkSpacesTheme } from "./themes/DarkSpacesTheme";

function App() {
  //@ts-ignore
  const vact_devtools = window.vact_devtools || {};
  vact_devtools.actions = vact_devtools.actions || {};
  //@ts-ignore
  window.vact_devtools = vact_devtools;
  return (
    <Provider store={store}>
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
            <Route path="/frontendDebugger" element={<FrontendDebugger />} />
            <Route path="/500" element={<Status500 />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
