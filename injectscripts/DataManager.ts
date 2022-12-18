//@ts-nocheck
import TimePoint from "./TimePoint";
import { getTipDom } from "./Utils";

let storage, storage_data;
const TimePoint_Root = "Time_Point_Root_Data";
const TimePoint_Method = "Time_Point_Method_Data";
const TimePoint_Rule = "Time_Point_Rule_Data";
const TimePoint_WinComNet = "Time_Point_WinComNet_Data";
interface Data {
  to: Date | null;
  from: Date | null;
  dt?: string;
  dataType: number;
  key: string;
  parentKey: string;
  funCode: string;
  scopeId: string;
  parentScopeId: string;
  ruleCode: string;
  type: any;
  customClass: string;
  series: number;
  children: Data[];
}

const _getStorage = function () {
  if (!storage) {
    storage = new Map<string, TimePoint>();
  }
  return storage;
};

const _getDataStorage = function () {
  if (!storage_data) {
    storage_data = new Map();
  }
  return storage_data;
};

export function add(timePoint) {
  const s = _getStorage();
  let datas,
    key = timePoint.getKey();
  if (!s.has(key)) {
    datas = [];
    s.set(key, datas);
  } else {
    datas = s.get(key);
  }
  datas.push(timePoint);
}
/**
 * 删除开始时间
 * */
export function remove(sourceKey) {
  const s = _getStorage();
  let datas,
    key = sourceKey;
  if (!s.has(sourceKey)) {
    return false;
  } else {
    datas = s.get(sourceKey);
  }
  for (let i = 0, l = datas.length; i < l; i++) {
    const data = datas[i];
    if (sourceKey == data.key) {
      datas.removeAt(i);
      if (datas.length == 0) {
        s.remove(sourceKey);
      }
      return true;
    }
  }
  console.log("没有找到对应的开始时间：" + key + "\ndatas:" + datas);
  return false;
}

export function clear() {
  var s = _getStorage();
  s.clear();
  var st = _getDataStorage();
  st.clear();
}

function _resetViewData() {
  const s = _getStorage();
  const ruleTimePoint = {}; //保存规则时间点
  const methodTimePoint = {}; //保存方法时间点
  const win_Net_ComTimePoint = {}; //保存窗体、构件、网络的时间点
  const iteror = s.entries();
  for (let index = 0; index < s.size; index++) {
    const next = iteror.next();
    const entry = next.value;
    const times = entry[1];
    const dataArray: Data[] = [];
    for (let i = 0; i < times.length; i++) {
      const time: TimePoint = times[i];
      const type = time.getType();
      let hasFound = false;
      for (let j = dataArray.length - 1; j >= 0; j--) {
        const data = dataArray[j];
        if (data.dataType + type == 0 && data["key"] == time.getKey()) {
          if (type > 0) {
            data.to = time.getTime();
          } else {
            data.from = time.getTime();
          }
          data.dt = getTipDom(data, time);
          hasFound = true;
          break;
        }
      }
      if (!hasFound) {
        dataArray.push({
          key: time.getKey(),
          dataType: time.getType(),
          parentKey: time.getParentKey(),
          funCode: time.getFunCode(),
          scopeId: time.getScopeId(),
          parentScopeId: time.getParentScopeId(),
          ruleCode: time.getRuleCode(),
          type: "INTERVAL",
          customClass: time.getTypeCode(),
          series: time.getSeries(),
          from: type > 0 ? null : time.getTime(),
          to: type > 0 ? time.getTime() : null,
          children: [],
        });
      }
    }
    //去掉没有开始点或者没有结束点的时间点。
    for (var i = 0, l = dataArray.length; i < l; i++) {
      var tmpData = dataArray[i];
      if (tmpData.from && tmpData.to) {
        switch (tmpData.series) {
          case 1:
            methodTimePoint[tmpData.key] = _copyTimePoint(tmpData);
            break;
          case 2:
            ruleTimePoint[tmpData.key] = _copyTimePoint(tmpData);
            break;
          case 3:
          case 4:
          case 5:
            win_Net_ComTimePoint[tmpData.key] = _copyTimePoint(tmpData);
            break;
        }
      }
    }
  }

  const rootTimePoint = []; //保存根的时间点
  //处理方法的父子关系
  for (let method in methodTimePoint) {
    const data = methodTimePoint[method];
    const parentKey = data.parentKey;
    if (!parentKey) {
      const methodScopeId = data.parentScopeId;
      if (methodScopeId) {
        let isRootRoute = true;
        for (let rule in ruleTimePoint) {
          const ruleObj = ruleTimePoint[rule];
          const ruleCode = ruleObj["ruleCode"];
          if (
            ruleCode &&
            ruleCode == "OpenComponentReturnData" &&
            ruleObj["scopeId"] == methodScopeId
          ) {
            isRootRoute = false;
            ruleObj.children.push(data);
            break;
          }
        }
        if (isRootRoute) {
          rootTimePoint.push(data);
        }
      } else {
        rootTimePoint.push(data);
      }
    } else {
      var parentPoint = ruleTimePoint[parentKey];
      if (parentPoint) {
        parentPoint.children.push(data);
      } else {
        rootTimePoint.push(data);
      }
    }
  }
  //处理规则的父子关系
  for (var rule in ruleTimePoint) {
    var data = ruleTimePoint[rule];
    var parentKey = data.parentKey;
    if (!parentKey) {
      console.log("rule is root?");
      rootTimePoint.push(ruleTimePoint[rule]);
    } else {
      var parentPoint = methodTimePoint[parentKey];
      if (parentPoint) {
        parentPoint.children.push(data);
      } else {
        console.log("rule is root?");
        rootTimePoint.push(data);
      }
    }
  }
  for (let key in win_Net_ComTimePoint) {
    rootTimePoint.push(win_Net_ComTimePoint[key]);
  }
  const st = _getDataStorage();
  st.set(TimePoint_Root, rootTimePoint);
  st.set(TimePoint_Method, methodTimePoint);
  st.set(TimePoint_Rule, ruleTimePoint);
  st.set(TimePoint_WinComNet, win_Net_ComTimePoint);
}
/**
 * 删除已经组装好的数据
 * */
export function clearTreeData() {
  const s = _getDataStorage();
  s.clear();
}
/**
 * 获取预览的数据
 * @param String ruleKey 规则key，若为空，则是以根节点处理
 * */
export function genViewTimePoint(ruleKey?: string) {
  const s = _getDataStorage();
  //如果结果是空，则重新生成数据
  //if (!s.has(TimePoint_Root)) {
  _resetViewData();
  //}
  const rootTimePoint = s.get(TimePoint_Root);
  const ruleTimePoint = s.get(TimePoint_Rule);
  const resultMap = [];
  if (!ruleKey) {
    //根节点
    for (let i = 0, l = rootTimePoint.length; i < l; i++) {
      const data = rootTimePoint[i];
      resultMap.push(data);
      if (data.customClass == "type-method") {
        const children = data.children;
        for (let j = 0, m = children.length; j < m; j++) {
          const child = children[j];
          if (child.customClass == "type-rule") {
            resultMap.push(child);
          }
        }
      }
    }
  } else {
    //执行方法 / 打开窗体 进入
    const rulePoint = ruleTimePoint[ruleKey];
    const children = rulePoint.children;
    let startTime = 0;
    let endTime = 0;
    for (let i = 0, l = children.length; i < l; i++) {
      const child = children[i];
      resultMap.push(child);
      if (startTime == 0 || child.from - startTime < 0) {
        startTime = child.from;
      }
      if (endTime == 0 || child.to - endTime > 0) {
        endTime = child.to;
      }
      if (child.children.length > 0) {
        const childs = child.children;
        for (let j = 0, m = childs.length; j < m; j++) {
          resultMap.push(childs[j]);
        }
      }
    }
    for (let i = 0, l = rootTimePoint.length; i < l; i++) {
      const time = rootTimePoint[i];
      if (
        (time.customClass == "type-widget" ||
          time.customClass == "type-win" ||
          time.customClass == "type-net") &&
        ((time.from > startTime && time.from < endTime) ||
          (time.to > startTime && time.to < endTime))
      ) {
        resultMap.push(time);
      }
    }
  }
  return _getRenderData(resultMap);
}
/**
 * 获取渲染数据
 * */
function _getRenderData(params) {
  const resultMap = params;
  const RouteDatas = [];
  const RuleDatas = [];
  const WindowDatas = [];
  const ComponentDatas = [];
  const NetworkDatas = [];
  for (let i = 0, l = resultMap.length; i < l; i++) {
    const data = resultMap[i];
    const series = data.series;
    if (series == TimePoint.Series.Route) {
      RouteDatas.push(data);
    } else if (series == TimePoint.Series.Rule) {
      RuleDatas.push(data);
    } else if (series == TimePoint.Series.Window) {
      WindowDatas.push(data);
    } else if (series == TimePoint.Series.Component) {
      ComponentDatas.push(data);
    } else {
      NetworkDatas.push(data);
    }
  }
  return [
    { label: "方法", data: RouteDatas },
    { label: "规则", data: RuleDatas },
    { label: "窗体", data: WindowDatas },
    { label: "构件", data: ComponentDatas },
    { label: "网络", data: NetworkDatas },
  ];
}

/**
 * 复制时间点
 * */
function _copyTimePoint(timePoint: TimePoint) {
  const time = {};
  for (let key in timePoint) {
    if (timePoint.hasOwnProperty(key)) {
      time[key] = timePoint[key];
    }
  }
  return time;
}
