import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DeleteIcon from "@mui/icons-material/Delete";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Navigator from "../components/Navigator";

enum State {
  stoped,
  started,
}

function FrontendMonitor() {
  const [state, setState] = useState(State.stoped);
  const nav = useNavigate();
  useEffect(() => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("isMonitored", {});
      promise
        .then((monitored: boolean) => {
          setState(monitored ? State.started : State.stoped);
        })
        .catch();
    }
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
          <ListItemButton
            disabled={state == State.started}
            onClick={() => {
              //@ts-ignore
              window?.vact_devtools?.sendRequest("clearMonitorData", {});
            }}
          >
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
          <ListItemButton
            disabled={state == State.started}
            onClick={() => {
              nav("/timelineMonitor");
            }}
          >
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
      <Navigator />
    </Box>
  );
}

export default FrontendMonitor;
