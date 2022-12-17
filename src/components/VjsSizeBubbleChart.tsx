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
  const { content } = props;
  const ref = useRef<any>(null);
  const [children, setChildren] = useState<JSX.Element | null>(function () {
    return (
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
    );
  });
  useEffect(() => {
    const vjsSizeAnalyze = new VjsContentAnalysis(content);
    const vjsList = vjsSizeAnalyze.analyze();
    const datas = toJsonList(vjsList);
    //@ts-ignore
    const chart = new BubbleChart(datas, {
      label: (data: VjsData) => toFileSize(data.size),
      //@ts-ignore
      value: (data: VjsData) => data.size,
      group: (data: VjsData) => data.vjsName,
      title: (data: VjsData) => data.vjsName,
      //@ts-ignore
      width: ref.current.clientWidth,
      height: ref.current.clientHeight,
    });
    setChildren(null);
    ref.current.appendChild(chart);
  }, []);
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {children}
    </div>
  );
}

export default VjsSizeBubbleChart;
