import {
  Fragment,
  useEffect,
} from 'react';

import { useNavigate } from 'react-router-dom';

import PestControlIcon from '@mui/icons-material/PestControl';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Grid from '@mui/material/Grid';

import FunctionCard from '../components/FunctionCard';
import { uuid } from '../utils/StringUtils';

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
      desc: "实时调试规则执行，展示规则执行时上下文信息，包括规则配置，方法输入输出，窗体控件信息...",
      to: "/frontendDebugger",
    },
  ];
}

function Portal() {
  const datas: Data[] = getDatas();
  const nav = useNavigate();
  useEffect(() => {
    //@ts-ignore
    const actions = window.vact_devtools.actions;
    actions.ruleDebug = function (
      params: {
        type: "beforeRuleExe" | "afterRuleExe";
        rule: {
          componentCode: string;
          methodCode: string;
          ruleCode: string;
          windowCode?: string;
        };
      },
      callback: (res: any) => void
    ) {
      const callbackId = `callback_${uuid()}`;
      //@ts-ignore
      window[callbackId] = (rs: any) => {
        //@ts-ignore
        delete window[callbackId];
        callback(rs);
      };
      nav("/frontendDebugger", {
        state: { data: params, callbackId },
      });
    };
    actions.refreshTreeMethod = function (
      params: null,
      callback: (res: any) => void
    ) {
      if (actions._refreshTreeMethod) {
        actions._refreshTreeMethod();
      }
      callback({});
    };
  }, []);
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
