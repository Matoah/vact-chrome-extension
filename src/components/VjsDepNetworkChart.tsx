import {
  useEffect,
  useRef,
} from 'react';

import Vjs from '../utils/Vjs';
import VjsDepChart from '../utils/VjsDepChart';

interface VjsDepNetworkChartProps {
  vjsList: Vjs[];
  highlights?: string[];
}

function VjsDepNetworkChart(pros: VjsDepNetworkChartProps) {
  const { vjsList, highlights } = pros;
  const ref = useRef(null);
  useEffect(() => {
    const renderChart = () => {
      VjsDepChart(ref.current, vjsList, highlights);
    };
    window.addEventListener("resize", renderChart);
    renderChart();
    return () => {
      window.removeEventListener("resize", renderChart);
    };
  }, [vjsList]);
  return <div ref={ref} style={{ width: "100%", height: "100%" }}></div>;
}

export default VjsDepNetworkChart;
