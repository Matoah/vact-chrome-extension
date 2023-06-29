import {
  useEffect,
  useRef,
  useState,
} from 'react';

import $ from 'jquery';

import HomeIcon from '@mui/icons-material/Home';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

import Navigator from '../components/Navigator';
import { getMonitorDatas } from '../utils/RPCUtils';
import TimelineChart from '../utils/TimelineChart';

function _createTimeLineChart(params: {
  datas: any;
  click: (evt: any, data: any) => void;
}) {
  const targetDom = $("#chart");
  targetDom.html("");
  new TimelineChart(targetDom[0], params.datas, {
    intervalMinWidth: 16,
    enableLiveTimer: false,
    tip: function (evt: any, d: any) {
      if (d.customClass == "type-rule" && d.children.length > 0) {
        this.style.cursor = "pointer";
      }
      var showDom = d.dt || "${d.from}<br>${d.to}";
      if (d.dt && d.children.length < 1) {
        showDom = showDom.replace("item-summary", "item-summary hide-desc");
      }
      return showDom;
    },
    click: params.click,
  });
}

interface MonitorData {
  from: string | Date;
  to: string | Date;
  type: any;
  children: MonitorData[];
}

function _dealMonitorDatas(datas: Array<{ data: MonitorData[] }>) {
  datas.forEach((data) => {
    _dealDatas(data.data);
  });
}

function _dealDatas(datas: MonitorData[]) {
  datas.forEach((data) => {
    data.from = new Date(data.from);
    data.to = new Date(data.to);
    data.type = TimelineChart.TYPE.INTERVAL;
    const children = data.children;
    if (children) {
      _dealDatas(children);
    }
  });
  return;
}

function TimelineMonitor() {
  const [children, setChildren] = useState(function () {
    return (
      <Box
        sx={{
          position: "absolute",
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={80} sx={{ boxShadow: 0 }}></CircularProgress>
      </Box>
    );
  });
  const [data, setData] = useState<{
    headers: Array<{ id: string; title: string }>;
    parentKey: null | string;
  }>(function () {
    return { headers: [{ id: "_$Root$_", title: "ROOT" }], parentKey: null };
  });
  const ref = useRef(null);
  useEffect(() => {
    const renderMonitor = () => {
      getMonitorDatas({ key: data.parentKey }).then((datas: any) => {
        _dealMonitorDatas(datas);
        let hasData = false;
        for (var i = 0, l = datas.length; i < l; i++) {
          if (datas[i]["data"].length > 0) {
            hasData = true;
            break;
          }
        }
        if (hasData) {
          _createTimeLineChart({
            datas,
            click: function (evt: any, item: any) {
              //@ts-ignore
              $(event.target).trigger("mouseout");
              if (
                item.customClass == "type-rule" &&
                item.children &&
                item.children.length > 0
              ) {
                const funKey = item.children[0].key;
                const funCode = item.children[0].funCode;
                const ruleKey = item.key;
                const headers = data.headers;
                headers.push({
                  id: ruleKey,
                  title: funCode,
                });
                setData({
                  headers,
                  parentKey: ruleKey,
                });
              }
            },
          });
        } else {
          setChildren(
            <Box
              sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ color: "#fff" }}>暂无数据</Typography>
            </Box>
          );
        }
      });
    };
    window.addEventListener("resize", () => {
      renderMonitor();
    });
    renderMonitor();
  }, [data.parentKey]);
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
      <Box
        ref={ref}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <List>
          <ListItem>
            <Breadcrumbs>
              {data.headers.map((header) => {
                return (
                  <Link
                    key={header.id}
                    underline="hover"
                    color="inherit"
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      const headers = [];
                      for (
                        let index = 0;
                        index < data.headers.length;
                        index++
                      ) {
                        const item = data.headers[index];
                        headers.push(item);
                        if (item.id == header.id) {
                          break;
                        }
                      }
                      setData({
                        headers: headers,
                        parentKey: header.id == "_$Root$_" ? null : header.id,
                      });
                    }}
                  >
                    {header.id == "_$Root$_" ? (
                      <HomeIcon
                        sx={{ mr: 0.5, mb: "-3.5px" }}
                        fontSize="small"
                      />
                    ) : null}
                    {header.title}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </ListItem>
        </List>
        <section id="section" style={{ flex: 1 }}>
          <div id="chart">{children}</div>
        </section>
      </Box>
      <Navigator />
    </Box>
  );
}

export default TimelineMonitor;
