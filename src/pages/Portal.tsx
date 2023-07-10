import {
  Fragment,
  useEffect,
} from 'react';

import { useNavigate } from 'react-router-dom';

import PestControlIcon from '@mui/icons-material/PestControl';
import SettingsIcon from '@mui/icons-material/Settings';
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
      desc: "实时调试前端信息，包括构件、窗体中各种数据，以及规则执行情况...",
      to: "/frontendAnalysis",
    },{
      title: "设置",
      avatarIcon: <SettingsIcon sx={{ width: "68px", height: "68px" }} />,
      desc: "动态调整前端配置，方便灵活使用VAct各种功能...",
      to: "/frontendSetting",
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
