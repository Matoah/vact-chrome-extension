import {
  useEffect,
  useRef,
} from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { toFileSize } from '../utils/NumberUtils';
import Vjs from '../utils/Vjs';
import VjsContentAnalysis from '../utils/VjsContentAnalysis';
import {
  isComponentSchemVjs,
  isWindowSchemaVjs,
} from '../utils/VjsUtils';
import WallMapChart from '../utils/WallMapChart';

interface VjsSizeWallChartProps {
  content: string;
  onClick:(vjsName:string,isCtrl:boolean)=>void;
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

function VjsSizeWallChart(props: VjsSizeWallChartProps) {
  const { content,onClick } = props;
  const ref = useRef<any>(null);
  useEffect(() => {
    const renderChart = () => {
      const vjsSizeAnalyze = new VjsContentAnalysis(content);
      const vjsList = vjsSizeAnalyze.analyze();
      const datas = toJsonList(vjsList);
      //@ts-ignore
      const chart = new WallMapChart(datas, {
        path: (data: VjsData) => data.vjsName,
        label: (data: VjsData) => data.vjsName + `\n(${toFileSize(data.size)})`,
        title: (data: VjsData) => `vjs名称：${data.vjsName}&#10;vjs大小：${toFileSize(data.size)}&#10;单击查看依赖关系${isWindowSchemaVjs(data.vjsName) ? "&#10;Ctrl+单击查看窗体配置大小详情":(isComponentSchemVjs(data.vjsName) ? "&#10;Ctrl+单击查看构件配置大小详情":"")}`,
        //@ts-ignore
        value: (data: VjsData) => {
          return data ? data.size : 0;
        },
        group: (data: VjsData) => data.vjsName,
        //@ts-ignore
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
        onclick:(data:any,evt:any)=>onClick(data.vjsName,evt.ctrlKey)
      });
      ref.current.innerHTML = "";
      ref.current.appendChild(chart);
    };
    window.addEventListener("resize", renderChart);
    renderChart();
    return () => {
      window.removeEventListener("resize", renderChart);
    };
  }, []);
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

export default VjsSizeWallChart;
