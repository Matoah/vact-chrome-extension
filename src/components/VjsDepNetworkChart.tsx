import Vjs from "../utils/Vjs";
import { useEffect, useRef } from "react";
import VjsDepChart from "../utils/VjsDepChart";

interface VjsDepNetworkChartProps {
  vjsList: Vjs[];
}

function VjsDepNetworkChart(pros: VjsDepNetworkChartProps) {
  const { vjsList } = pros;
  const ref = useRef(null);
  useEffect(() => {
    const renderChart = () => {
      VjsDepChart(ref.current, vjsList);
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
