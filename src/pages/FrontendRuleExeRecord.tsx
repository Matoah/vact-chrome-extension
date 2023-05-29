import {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleFilledWhiteIcon
  from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import Navigator from '../components/Navigator';
import {
  clearMonitorData,
  isMonitored,
  markMonitored,
  markUnMonitored,
} from '../utils/RPCUtils';

enum State {
  stoped,
  started,
}

function FrontendRuleExeRecord() {
  const [state, setState] = useState({ status: State.stoped, cleared: false });
  const nav = useNavigate();
  useEffect(() => {
    isMonitored()
      .then((monitored: boolean) => {
        setState((pre) => {
          return {
            status: monitored ? State.started : State.stoped,
            cleared: pre.cleared,
          };
        });
      })
      .catch();
  }, []);
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <List sx={{ width: 360 }}>
        <ListItem disablePadding>
          <ListItemButton
            disabled={state.status != State.stoped}
            onClick={() => {
              setState((pre) => {
                return {
                  status: State.started,
                  cleared: false,
                };
              });
              markMonitored();
            }}
          >
            <ListItemIcon>
              <PlayCircleFilledWhiteIcon
                color={state.status != State.stoped ? "inherit" : "primary"}
              />
            </ListItemIcon>
            <ListItemText
              primary="开始"
              secondary="点击后开始记录前端规则执行顺序，可以刷新页面。"
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            disabled={state.status != State.started}
            onClick={() => {
              setState((pre) => {
                return {
                  status: State.stoped,
                  cleared: pre.cleared,
                };
              });
              markUnMonitored();
            }}
          >
            <ListItemIcon>
              <StopCircleIcon
                color={state.status != State.started ? "inherit" : "primary"}
              />
            </ListItemIcon>
            <ListItemText
              primary="停止"
              secondary="记录开始后，点击此选项可以停止记录。停止后再次点击记录可继续记录规则执行顺序信息。"
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            disabled={state.status == State.started || state.cleared}
            onClick={() => {
              clearMonitorData()
                .then(() => {
                  setState((pre) => {
                    return {
                      status: pre.status,
                      cleared: true,
                    };
                  });
                })
                .catch(() => {
                  setState((pre) => {
                    return {
                      status: pre.status,
                      cleared: true,
                    };
                  });
                });
            }}
          >
            <ListItemIcon>
              <DeleteIcon
                color={
                  state.status == State.started || state.cleared
                    ? "inherit"
                    : "primary"
                }
              />
            </ListItemIcon>
            <ListItemText
              primary="清除"
              secondary="清除已记录的规则执行顺序信息。"
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            disabled={state.status == State.started}
            onClick={() => {
              nav("/timelineMonitor");
            }}
          >
            <ListItemIcon>
              <VisibilityIcon
                color={state.status == State.started ? "inherit" : "primary"}
              />
            </ListItemIcon>
            <ListItemText
              primary="显示"
              secondary="点击此选项，展示前端规则执行顺序。"
            />
          </ListItemButton>
        </ListItem>
      </List>
      <Navigator />
    </Box>
  );
}

export default FrontendRuleExeRecord;
