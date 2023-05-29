import { Fragment } from 'react';

import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
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
      title: "前端数据查看",
      avatarIcon: (
        <ContentPasteSearchIcon sx={{ width: "68px", height: "68px" }} />
      ),
      desc: "搜寻当前已打开构件、窗体；查看构件变量、窗体输入、窗体输出、窗体实体等数据...",
      to: "/frontendDataPortal",
    },
    {
      title: "规则执行顺序",
      avatarIcon: (
        <AccountTreeIcon sx={{ width: "68px", height: "68px" }} />
      ),
      desc: "实时记录前端规则执行顺序，并以回放的方式展示...",
      to: "/frontendRuleExeRecord",
    },
    {
      title: "前端规则调试",
      avatarIcon: <BugReportIcon sx={{ width: "68px", height: "68px" }} />,
      desc: "实时调试规则执行，展示规则执行时上下文信息，包括规则配置，方法输入输出，窗体控件信息...",
      to: "/frontendDebugger",
    },
  ];
}

function FrontendAnalysis() {
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

export default FrontendAnalysis;
