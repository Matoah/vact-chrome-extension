import TimePoint from '../../model/TimePoint';
import { getTipDom } from '../../utils/MonitorUtils';

interface MonitorData {
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
  children: MonitorData[];
}

class MonitorDataManager {

  private static INSTANCE = new MonitorDataManager();

  static getInstance() {
    return MonitorDataManager.INSTANCE;
  }

  timePointMap = new Map<string, TimePoint>();

  dataStorage = new Map<string, any>();

  TimePoint_Root = "Time_Point_Root_Data";

  TimePoint_Method = "Time_Point_Method_Data";

  TimePoint_Rule = "Time_Point_Rule_Data";
  
  TimePoint_WinComNet = "Time_Point_WinComNet_Data";

  /**
   * 添加时间节点
   * @param timePoint
   */
  add(timePoint: TimePoint) {
    let datas,
      key = timePoint.getKey();
    if (!this.timePointMap.has(key)) {
      datas = [];
      this.timePointMap.set(key, datas);
    } else {
      datas = this.timePointMap.get(key);
    }
    datas.push(timePoint);
  }

  /**
   * 删除开始时间
   * */
  remove(sourceKey: string) {
    let datas;
    if (!this.timePointMap.has(sourceKey)) {
      return false;
    } else {
      datas = this.timePointMap.get(sourceKey);
    }
    for (let i = 0, l = datas.length; i < l; i++) {
      const data = datas[i];
      if (sourceKey == data.key) {
        datas.removeAt(i);
        if (datas.length == 0) {
          this.timePointMap.delete(sourceKey);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * 清除数据
   */
  clear() {
    this.timePointMap.clear();
    this.dataStorage.clear();
  }

  /**
   * 复制时间点
   * */
  private _copyTimePoint(timePoint: MonitorData):MonitorData {
    const time = {};
    for (let key in timePoint) {
      if (timePoint.hasOwnProperty(key)) {
        time[key] = timePoint[key];
      }
    }
    //@ts-ignore
    return time;
  }

  /**
   * 重置数据
   */
  private _resetViewData() {
    const ruleTimePoint = {}; //保存规则时间点
    const methodTimePoint = {}; //保存方法时间点
    const win_Net_ComTimePoint = {}; //保存窗体、构件、网络的时间点
    const iteror = this.timePointMap.entries();
    for (let index = 0; index < this.timePointMap.size; index++) {
      const next = iteror.next();
      const entry = next.value;
      const times = entry[1];
      const dataArray: MonitorData[] = [];
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
              methodTimePoint[tmpData.key] = this._copyTimePoint(tmpData);
              break;
            case 2:
              ruleTimePoint[tmpData.key] = this._copyTimePoint(tmpData);
              break;
            case 3:
            case 4:
            case 5:
              win_Net_ComTimePoint[tmpData.key] = this._copyTimePoint(tmpData);
              break;
          }
        }
      }
    }

    const rootTimePoint:MonitorData[] = []; //保存根的时间点
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
    this.dataStorage.set(this.TimePoint_Root, rootTimePoint);
    this.dataStorage.set(this.TimePoint_Method, methodTimePoint);
    this.dataStorage.set(this.TimePoint_Rule, ruleTimePoint);
    this.dataStorage.set(this.TimePoint_WinComNet, win_Net_ComTimePoint);
  }

  /**
   * 删除已经组装好的数据
   * */
  clearTreeData() {
    this.dataStorage.clear();
  }

  /**
   * 获取渲染数据
   * */
  private _getRenderData(params) {
    const resultMap = params;
    const RouteDatas:MonitorData[] = [];
    const RuleDatas:MonitorData[] = [];
    const WindowDatas:MonitorData[] = [];
    const ComponentDatas:MonitorData[] = [];
    const NetworkDatas:MonitorData[] = [];
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
   * 获取预览的数据
   * @param String ruleKey 规则key，若为空，则是以根节点处理
   * */
  genViewTimePoint(ruleKey?: string) {
    this._resetViewData();
    const rootTimePoint = this.dataStorage.get(this.TimePoint_Root);
    const ruleTimePoint = this.dataStorage.get(this.TimePoint_Rule);
    const resultMap:MonitorData[] = [];
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
    return this._getRenderData(resultMap);
  }
}

export default MonitorDataManager;
export { MonitorData, MonitorDataManager };
