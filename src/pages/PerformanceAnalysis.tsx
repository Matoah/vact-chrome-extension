import { Fragment } from 'react';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import LanIcon from '@mui/icons-material/Lan';
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
      desc: "搜集前端vjs请求，分析vjs请求结果，以图形化展示返回结果中vjs脚本大小",
      to: "/vjsSizeUrlList",
    },
    {
      title: "VJS依赖分析",
      avatarIcon: <LanIcon sx={{ width: "68px", height: "68px" }} />,
      desc: "搜集前端vjs请求，分析vjs间的依赖关系，解决vjs脚本量太大等问题...",
      to: "/vjsDepUrlList",
    },
    {
      title: "执行耗时分析",
      avatarIcon: <InsertChartIcon sx={{ width: "68px", height: "68px" }} />,
      desc: "实时记录前端脚本执行耗时，包括窗体、构件加载时间，方法、规则执行耗时...",
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
