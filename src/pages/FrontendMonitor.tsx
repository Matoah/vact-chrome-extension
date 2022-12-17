import { useState } from 'react';

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

enum State {
  stoped,
  started,
}

function FrontendMonitor() {
  const [state, setState] = useState(State.stoped);
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
            disabled={state != State.stoped}
            onClick={() => {
              setState(State.started);
              //@ts-ignore
              window?.vact_devtools?.sendRequest("markMonitored", {});
            }}
          >
            <ListItemIcon>
              <PlayCircleFilledWhiteIcon
                color={state != State.stoped ? "inherit" : "info"}
              />
            </ListItemIcon>
            <ListItemText
              primary="录制"
              secondary="点击后开始录制前端性能消耗数据，支持统计规则执行，窗体加载、后台请求等等耗时。"
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            disabled={state != State.started}
            onClick={() => {
              setState(State.stoped);
              //@ts-ignore
              window?.vact_devtools?.sendRequest("markUnMonitored", {});
            }}
          >
            <ListItemIcon>
              <StopCircleIcon
                color={state != State.started ? "inherit" : "info"}
              />
            </ListItemIcon>
            <ListItemText
              primary="停止"
              secondary="录制开始后，点击此选项可以停止录制。停止后再次点击录制可继续录制性能消耗数据。"
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton disabled={state == State.started}>
            <ListItemIcon>
              <DeleteIcon color={state == State.started ? "inherit" : "info"} />
            </ListItemIcon>
            <ListItemText
              primary="清除"
              secondary="清除已录制的性能消耗数据。"
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton disabled={state == State.started}>
            <ListItemIcon>
              <VisibilityIcon
                color={state == State.started ? "inherit" : "info"}
              />
            </ListItemIcon>
            <ListItemText
              primary="显示"
              secondary="点击此选项，以图形化方式展示前端性能消耗数据"
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

export default FrontendMonitor;
