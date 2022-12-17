import './App.css';

import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';

import FrontendMonitor from './pages/FrontendMonitor';
import PerformanceAnalysis from './pages/PerformanceAnalysis';
import Portal from './pages/Portal';
import VjsSizeAnalysis from './pages/VjsSizeAnalysis';
import VjsUrlList from './pages/VjsUrlList';
import { DarkSpacesTheme } from './themes/DarkSpacesTheme';

function App() {
  return (
    <ThemeProvider theme={DarkSpacesTheme}>
      <BrowserRouter basename="/dist">
        <Routes>
          <Route path="/" element={<Portal />} />
          <Route path="/index.html" element={<Portal />} />
          <Route path="/performance" element={<PerformanceAnalysis />} />
          <Route path="/vjsUrlList" element={<VjsUrlList />} />
          <Route path="/vjsSizeAnalysis/:id" element={<VjsSizeAnalysis />} />
          <Route path="/frontendMonitor" element={<FrontendMonitor />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
