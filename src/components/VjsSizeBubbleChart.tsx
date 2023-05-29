import {
  useEffect,
  useRef,
  useState,
} from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import BubbleChart from '../utils/BubbleChart';
import { toFileSize } from '../utils/NumberUtils';
import Vjs from '../utils/Vjs';
import VjsContentAnalysis from '../utils/VjsContentAnalysis';

interface VjsSizeBubbleChartProps {
  content: string;
  onDblClick: (vjsName:any)=>void;
}

interface VjsData {
  vjsName: string;
  size: number;
}

const toJsonList = function (vjsList: Vjs[]) {
  const result: Array<VjsData> = [];
  if (Array.isArray(vjsList)) {
    vjsList.forEach((vjs) => {
      result.push({
        vjsName: vjs.getName(),
        size: vjs.getSize(),
      });
    });
  }
  return result;
};

function VjsSizeBubbleChart(props: VjsSizeBubbleChartProps) {
  const { content,onDblClick } = props;
  const [type, setType] = useState("bubble");
  const ref = useRef<any>(null);
  useEffect(() => {
    const renderChart = () => {
      const vjsSizeAnalyze = new VjsContentAnalysis(content);
      const vjsList = vjsSizeAnalyze.analyze();
      const datas = toJsonList(vjsList);
      //@ts-ignore
      const chart = new BubbleChart(datas, {
        label: (data: VjsData) => toFileSize(data.size),
        //@ts-ignore
        value: (data: VjsData) => data.size,
        group: (data: VjsData) => data.vjsName,
        title: (data: VjsData) => `vjs名称：${data.vjsName}&#10;vjs大小：${toFileSize(data.size)}&#10;双击查看依赖关系`,
        //@ts-ignore
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
        ondblclick:(data:any)=>onDblClick(data.vjsName)
      });
      //setChildren(null);
      ref.current.innerHTML = "";
      ref.current.appendChild(chart);
    };
    window.addEventListener("resize", renderChart);
    renderChart();
    return () => {
      window.removeEventListener("resize", renderChart);
    };
  }, [type]);
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <div
        style={{
          width: "100%",
          height: "calc(100% - 35px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={80} />
        <Typography
          variant="subtitle2"
          color="inherit"
          component="div"
          sx={{ marginTop: "16px" }}
        >
          正在分析中，请稍候...
        </Typography>
      </div>
    </div>
  );
}

export default VjsSizeBubbleChart;
