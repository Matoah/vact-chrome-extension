import { Fragment } from 'react';

import PestControlIcon from '@mui/icons-material/PestControl';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Grid from '@mui/material/Grid';

import FunctionCard from '../components/FunctionCard';

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
      title: "性能分析",
      avatarIcon: <ZoomInIcon sx={{ width: "68px", height: "68px" }} />,
      desc: "分析前端性能，包括js脚本大小分析，方法执行耗时，js加载耗时...",
      to: "/performance",
    },
    {
      title: "功能调试",
      avatarIcon: <PestControlIcon sx={{ width: "68px", height: "68px" }} />,
      desc: "分析前端性能，包括js脚本大小分析，方法执行耗时，js加载耗时...",
      to: "",
    },
  ];
}

function Portal() {
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
    </Grid>
  );
}

export default Portal;
