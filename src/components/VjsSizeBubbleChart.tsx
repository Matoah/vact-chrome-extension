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
import {
  isComponentSchemVjs,
  isWindowSchemaVjs,
} from '../utils/VjsUtils';

interface VjsSizeBubbleChartProps {
  content: string;
  onClick: (vjsName: string, isCtrl: boolean) => void;
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
  const { content, onClick } = props;
  const [type, setType] = useState("bubble");
  const ref = useRef<any>(null);
  const ref1 = useRef<any>(null);
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
        title: (data: VjsData) =>
          `vjs名称：${data.vjsName}&#10;vjs大小：${toFileSize(
            data.size
          )}&#10;单击查看依赖关系${
            isWindowSchemaVjs(data.vjsName)
              ? "&#10;Ctrl+单击查看窗体配置大小详情"
              : isComponentSchemVjs(data.vjsName)
              ? "&#10;Ctrl+单击查看构件配置大小详情"
              : ""
          }`,
        //@ts-ignore
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
        onclick: (data: any, evt: any) => onClick(data.vjsName, evt.ctrlKey),
      });
      //setChildren(null);
      ref.current.innerHTML = "";
      ref.current.appendChild(chart);
      ref1.current.innerHTML = `<h5 style="color: #ccc;text-align: left;padding: 0;margin: 4px 0px 0px 4px;">总个数：${
        vjsList.length
      }</h5><h5 style="color: #ccc;text-align: left;padding: 0;margin: 4px 0px 0px 4px;">总大小：${toFileSize(content.length)}</h5>`;
      ref1.current.style.display = 'block';
    };
    window.addEventListener("resize", renderChart);
    renderChart();
    return () => {
      window.removeEventListener("resize", renderChart);
    };
  }, [type]);
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        ref={ref}
        style={{ width: "100%", height: "100%", padding: "0px", margin: "0px" }}
      >
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
      <div
        ref={ref1}
        style={{
          position: "absolute",
          left: "8px",
          bottom: "8px",
          borderRadius: "8px",
          display: "none",
          width: "110px",
          height: "60px",
        }}
      ></div>
    </div>
  );
}

export default VjsSizeBubbleChart;
