import { Fragment } from 'react';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import Grid from '@mui/material/Grid';

import FunctionCard from '../components/FunctionCard';
import Navigator from '../components/Navigator';

interface Data {
  title: string;
  avatarSrc?: string;
  avatarIcon?: JSX.Element;
  desc: string;
  to: string;
}

function getDatas(): Data[] {
  return [
    {
      title: "VJS大小分析",
      avatarIcon: <PieChartIcon sx={{ width: "68px", height: "68px" }} />,
      desc: "分析前端性能，包括js脚本大小分析，方法执行耗时，js加载耗时...",
      to: "/vjsUrlList",
    },
    {
      title: "执行耗时分析",
      avatarIcon: <InsertChartIcon sx={{ width: "68px", height: "68px" }} />,
      desc: "分析前端性能，包括js脚本大小分析，方法执行耗时，js加载耗时...",
      to: "/frontendMonitor",
    },
  ];
}

function PerformanceAnalysis() {
  const datas: Data[] = getDatas();
  return (
    <Grid
      container
      spacing={4}
      sx={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {datas.map((data: Data, index) => {
        return (
          <Fragment key={data.title}>
            <FunctionCard {...data}></FunctionCard>
          </Fragment>
        );
      })}
      <Navigator />
    </Grid>
  );
}

export default PerformanceAnalysis;
