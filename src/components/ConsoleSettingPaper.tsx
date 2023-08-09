import {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

import CustomTreeView, { TreeNode } from '../components/CustomTreeView';
import {
  getConsoleSetting,
  setConsoleSetting,
} from '../utils/RPCUtils';
import { getAllNodeIds } from '../utils/TreeUtils';
import { ConsoleSetting } from '../utils/Types';
import ElevationPaper from './ElevationPaper';

interface ConsoleSettingProps {}

function ConsoleSettingPaper(props: ConsoleSettingProps) {
  const [data, setData] = useState<{
    consoleSetting: ConsoleSetting | null;
    tree: TreeNode[];
  }>({
    consoleSetting: null,
    tree: [
      {
        id: "enable",
        label: "启用日志打印",
        children: [
          {
            id: "enableCount",
            label: "统计",
          },
          {
            id: "enableDebug",
            label: "调试",
          },
          {
            id: "enableInfo",
            label: "消息",
          },
          {
            id: "enableWarn",
            label: "警告",
          },
          {
            id: "enableError",
            label: "错误",
          },
        ],
      },
    ],
  });
  const nav = useNavigate();
  const errHandler = (e: any) => {
    console.error(e);
    nav("/500");
  };
  useEffect(() => {
    getConsoleSetting()
      .then((consoleSetting) => {
        if (consoleSetting) {
          setData({
            ...data,
            consoleSetting,
          });
        }
      })
      .catch((e) => errHandler(e));
  }, []);
  return (
    <ElevationPaper>
      <Typography align="left" variant="h4">
        日志打印
      </Typography>
      <Box sx={{ marginTop: "8px" }}>
        <CustomTreeView
          tree={data.tree}
          expanded={getAllNodeIds(data.tree)}
          labelTemplate={(props, node) => {
            const disabled =
              node.id != "enable"
                ? data.consoleSetting
                  ? !data.consoleSetting.enable
                  : true
                : false;
            
            const checked = data.consoleSetting
            //@ts-ignore
              ? data.consoleSetting[node.id]
              : false;
            return (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  disabled={disabled}
                  checked={checked}
                  onChange={(evt, status) => {
                    const setting = data.consoleSetting || {};
                    //@ts-ignore
                    setting[node.id] = status;
                    setConsoleSetting(setting)
                      .then(() =>
                        setData({
                          ...data,
                          consoleSetting: setting,
                        })
                      )
                      .catch((e) => errHandler(e));
                  }}
                ></Checkbox>
                <Typography sx={{color:disabled ? '#ccc':'#fff'}}>{node.label}</Typography>
              </Box>
            );
          }}
        ></CustomTreeView>
      </Box>
    </ElevationPaper>
  );
}

export default ConsoleSettingPaper;
