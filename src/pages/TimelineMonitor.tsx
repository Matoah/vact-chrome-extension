import {
  useEffect,
  useRef,
  useState,
} from 'react';

import $ from 'jquery';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import Navigator from '../components/Navigator';
import { getMonitorMockDatas } from '../utils/MockUtils';
import { uuid } from '../utils/StringUtils';
import TimelineChart from '../utils/TimelineChart';

function addTopNode(params: any) {
  const funName = params.funName,
    funKey = params.funKey,
    resetFunc = params.resetFunc;
  const targetDom = $("#ul");
  $(targetDom).find("li").removeClass("cur");
  const nfStyle = funKey.indexOf("ROOTKEY") != -1 ? "nav-first" : "";
  const li =
    '<li id="' +
    funKey +
    '" class="' +
    nfStyle +
    ' cur"><a href="#">' +
    funName +
    "</a></li>";
  targetDom.append(li);
  targetDom.find("li[id='" + funKey + "']").on("click", function () {
    var isDelete = false;
    $("#ul")
      .find("li")
      .each(function () {
        //@ts-ignore
        var key = $(this).attr("id");
        if (!isDelete) {
          if (key == funKey) {
            //@ts-ignore
            $(this).addClass("cur");
            isDelete = true;
          }
        } else {
          //@ts-ignore
          $(this).remove();
        }
      });
    if (typeof resetFunc == "function") {
      var dom = $("#chart")[0];
      getMonitorDatas(dom, (datas: any) => {
        resetFunc(dom, datas);
      });
    }
  });
}

function _createTimeLineChart(data: any) {
  const targetDom = $("#chart");
  targetDom.html("");
  new TimelineChart(targetDom[0], data, {
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
    dblclick: function (data: any) {
      //@ts-ignore
      $(event.target).trigger("mouseout");
      if (
        data.customClass == "type-rule" &&
        data.children &&
        data.children.length > 0
      ) {
        var funKey = data.children[0].key;
        var funCode = data.children[0].funCode;
        var ruleKey = data.key;
        addTopNode({
          funKey: funKey,
          funName: funCode,
          ruleKey: ruleKey,
          resetFunc: _createTimeLineChart,
        });
        getMonitorDatas({ key: ruleKey }, (showData: any) => {
          _createTimeLineChart(showData);
        });
      }
    },
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
function getMonitorDatas(
  params: any,
  success: (datas: any) => void,
  fail?: (e: any) => void
) {
  //@ts-ignore
  if (window.vact_devtools) {
    //@ts-ignore
    const promise = window.vact_devtools.sendRequest("getMonitorDatas", params);
    promise
      .then((datas: any) => {
        _dealMonitorDatas(datas);
        success(datas);
      })
      .catch((e: any) => {
        if (fail) {
          fail(e);
        }
      });
  } else {
    const datas = getMonitorMockDatas();
    _dealMonitorDatas(datas);
    success(datas);
  }
}

function TimelineMonitor() {
  const [children, setChildren] = useState(function () {
    return (
      <CircularProgress size={80} sx={{ boxShadow: 0 }}></CircularProgress>
    );
  });
  const ref = useRef(null);
  useEffect(() => {
    const renderMonitor = () => {
      getMonitorDatas({}, (datas: any) => {
        let hasData = false;
        for (var i = 0, l = datas.length; i < l; i++) {
          if (datas[i]["data"].length > 0) {
            hasData = true;
            break;
          }
        }
        if (hasData) {
          _createTimeLineChart(datas);
          addTopNode({
            funKey: "ROOTKEY" + uuid(),
            funName: "ROOT",
            resetFunc: _createTimeLineChart,
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
              <Typography>暂无数据</Typography>
            </Box>
          );
        }
      });
    };
    window.addEventListener("resize", () => {
      renderMonitor();
    });
    renderMonitor();
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
      <Box
        ref={ref}
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        <section id="section">
          <div id="chart">{children}</div>
        </section>
      </Box>
      <Navigator />
    </Box>
  );
}

export default TimelineMonitor;
