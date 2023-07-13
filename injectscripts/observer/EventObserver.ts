import MonitorManager from '../manager/MonitorManager';
import MonitorDataManager from '../manager/private/MonitorDataManager';
import TimePoint from '../model/TimePoint';
import {
  getEventManager,
  getScopeManager,
} from '../utils/VjsUtils';

/**
 * 获取路由上下文的时间点
 * */
function _getRouteTimePoint(routeContext, type) {
  let scopeId = routeContext.getScopeId();
  const scopeManager = getScopeManager();
  if (!scopeId) scopeId = scopeManager.getCurrentScopeId();
  const parentScopeId = scopeManager.getParentScopeId(scopeId);
  const scope = scopeManager.getScope(scopeId);
  const componentCode = scope.getComponentCode();
  let windowCode = undefined;
  if (scopeManager.isWindowScope(scopeId)) {
    windowCode = scope.getWindowCode();
  }
  const routeCfg = routeContext.getRouteConfig();
  let funCode = undefined,
    key = undefined,
    timePointType = undefined,
    series: undefined | number = undefined,
    parentKey = undefined;
  if (routeCfg) {
    funCode = routeCfg.getCode();
    const monitorSign = routeContext._monitorSign;
    key = monitorSign;
    timePointType = type;
    series = TimePoint.Series.Route;
    var parentRule = routeContext.getParentRuleContext();
    if (
      parentRule &&
      !parentRule.getRouteContext().isVirtual &&
      parentRule._monitorSign
    ) {
      parentKey = parentRule._monitorSign;
    }
    return new TimePoint({
      scopeId,
      parentScopeId,
      componentCode,
      windowCode,
      funCode,
      key,
      type: timePointType,
      series,
      parentKey,
    });
  }
  return null;
}

function _getRuleTimePoint(ruleContext, type) {
  const scopeManager = getScopeManager();
  const rr = ruleContext.getRouteContext();
  if (rr.isVirtual) {
    //虚拟路由里面的规则不作显示
    return null;
  }
  const key = ruleContext._monitorSign;
  const monitorSign = rr._monitorSign;
  let parentKey = undefined;
  if (monitorSign) parentKey = monitorSign;
  const scopeId = scopeManager.getCurrentScopeId();
  const scope = scopeManager.getScope();
  const componentCode = scope.getComponentCode();
  let winCode = undefined;
  if (scopeManager.isWindowScope(scopeId)) {
    winCode = scope.getWindowCode();
  }
  const routeCfg = rr.getRouteConfig();
  const funCode = routeCfg.getCode();
  const ruleCfg = ruleContext.getRuleCfg();
  const ruleCode = ruleCfg.ruleCode;
  const ruleName = ruleCfg.instanceName;
  const ruleInstanceCode = ruleCfg.instanceCode;
  const series = TimePoint.Series.Rule;
  return new TimePoint({
    key,
    parentKey,
    scopeId,
    componentCode,
    windowCode:winCode,
    funCode,
    ruleCode,
    ruleName,
    ruleInstanceCode,
    type,
    series,
  });
}
/**
 * 获取窗体相关的时间点
 * */
function _getWindowTimePoint(scopeId, type, uuid) {
  const scopeManager = getScopeManager();
  const scope = scopeManager.getScope(scopeId);
  const componentCode = scope.getComponentCode();
  const winCode = scope.getWindowCode();
  return new TimePoint({
    componentCode: componentCode,
    windowCode: winCode,
    key: uuid,
    type: type,
    series: TimePoint.Series.Window,
  });
}
/**
 * 获取构件相关的时间点
 * */
function _getComponentTimePoint(scopeId, type, uuid) {
  const scopeManager = getScopeManager();
  const scope = scopeManager.getScope(scopeId);
  const componentCode = scope.getComponentCode();
  return new TimePoint({
    componentCode: componentCode,
    key: uuid,
    type: type,
    series: TimePoint.Series.Component,
  });
}

/**
 * 获取rpc相关的时间点
 * */
function _getRPCTimePoint(request, type, uuid) {
  const operations = request.getOperations();
  const operationList:string[] = [];
  let componentCode = "";
  let winCode = undefined;
  let rpcCode:string|undefined = undefined;
  if (operations && operations.length > 0) {
    for (let i = 0, l = operations.length; i < l; i++) {
      const operation = operations[i];
      componentCode = operation.getComponentCode();
      winCode = operation.getWindowCode();
      let operationCode;
      const params = operation.getParams();
      if (params.hasOwnProperty("ruleSetCode")) {
        operationCode = params["ruleSetCode"];
      } else if (params.hasOwnProperty("transaction_action")) {
        operationCode = params["transaction_action"];
      } else {
        operationCode = operation.getOperation();
      }
      if (operationCode && operationList.indexOf(operationCode) == -1) {
        operationList.push(operationCode);
      }
    }
    rpcCode = operationList.join(",");
  }
  return new TimePoint({
    componentCode: componentCode,
    windowCode: winCode,
    rpcCode: rpcCode,
    key: uuid,
    type: type,
    series: TimePoint.Series.Network,
  });
}

/**
 * 监控状态是否开启
 * */
function isOpenMonitor() {
  return MonitorManager.getInstance().isMonitored();
}

/**
 * 方法执行前
 */
function beforeRouteExe(rr) {
  if (isOpenMonitor()) {
    const time = _getRouteTimePoint(rr, TimePoint.Types.BeforeRouteExe);
    if (time) {
      MonitorDataManager.getInstance().add(time);
    }
  }
}

/**
 * 方法执行后
 */
function afterRouteExe(rr) {
  if (isOpenMonitor()) {
    const monitorSign = rr._monitorSign;
    if (monitorSign) {
      if (rr._isInnerRoute) {
        //删除对应的方法执行前时间点
        MonitorDataManager.getInstance().remove(monitorSign);
      } else {
        if (!rr.isVirtual && rr._monitorSign) {
          const time = _getRouteTimePoint(rr, TimePoint.Types.AfterRouteExe);
          if (time) {
            MonitorDataManager.getInstance().add(time);
          }
        }
      }
    }
  }
}

function _isBusinessRule(ruleContext) {
  const ruleInstance = ruleContext.getRuleCfg();
  return ruleInstance.hasOwnProperty("transactionType");
}

function beforeRuleExe(ruleContext) {
  if (isOpenMonitor()) {
    if (_isBusinessRule(ruleContext)) {
      const time = _getRuleTimePoint(ruleContext, TimePoint.Types.BeforeRuleExe);
      if (time) MonitorDataManager.getInstance().add(time);
    } else {
      const routeContext = ruleContext.getRouteContext();
      routeContext._isInnerRoute = true;
    }
  }
}

function afterRuleExe(ruleContext) {
  if (isOpenMonitor()) {
    if (_isBusinessRule(ruleContext)) {
      const time = _getRuleTimePoint(ruleContext, TimePoint.Types.AfterRuleExe);
      if (time) MonitorDataManager.getInstance().add(time);
    }
  }
}

function beforeWindowLoad(scopeId, uuid) {
  if (isOpenMonitor()) {
    const time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.BeforeWindowLoad,
      uuid
    );
    MonitorDataManager.getInstance().add(time);
  }
}

function afterWindowLoad(scopeId, uuid) {
  if (isOpenMonitor()) {
    const time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.AfterWindowLoad,
      uuid
    );
    MonitorDataManager.getInstance().add(time);
  }
}

function beforeWindowRender(scopeId, uuid) {
  if (isOpenMonitor()) {
    const time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.BeforeWindowRender,
      uuid
    );
    MonitorDataManager.getInstance().add(time);
  }
}

function afterWindowRender(scopeId, uuid) {
  if (isOpenMonitor()) {
    const time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.AfterWindowRender,
      uuid
    );
    MonitorDataManager.getInstance().add(time);
  }
}

function beforeWindowInit(scopeId, uuid) {
  if (isOpenMonitor()) {
    const time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.BeforeWindowInit,
      uuid
    );
    MonitorDataManager.getInstance().add(time);
  }
}

function afterWindowInit(scopeId, uuid) {
  if (isOpenMonitor()) {
    const time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.AfterWindowInit,
      uuid
    );
    MonitorDataManager.getInstance().add(time);
  }
}

function beforeComponentInit(scopeId, uuid) {
  if (isOpenMonitor()) {
    const time = _getComponentTimePoint(
      scopeId,
      TimePoint.Types.BeforeComponentInit,
      uuid
    );
    MonitorDataManager.getInstance().add(time);
  }
}

function afterComponentInit(scopeId, uuid) {
  if (isOpenMonitor()) {
    const time = _getComponentTimePoint(
      scopeId,
      TimePoint.Types.AfterComponentInit,
      uuid
    );
    MonitorDataManager.getInstance().add(time);
  }
}

function beforeRPC(request, uuid) {
  if (isOpenMonitor()) {
    const time = _getRPCTimePoint(request, TimePoint.Types.BeforeRPC, uuid);
    MonitorDataManager.getInstance().add(time);
  }
}

function afterRPC(request, uuid) {
  if (isOpenMonitor()) {
    const time = _getRPCTimePoint(request, TimePoint.Types.AfterRPC, uuid);
    MonitorDataManager.getInstance().add(time);
  }
}

/**
 * 开启监控
 * */
function openMonitor() {
  MonitorManager.getInstance().markMonitored();
}

/**
 * 关闭监控
 * */
function closeMonitor() {
  MonitorManager.getInstance().markUnMonitored()
}

export function doStart() {
  //删除已组装的数据
  MonitorDataManager.getInstance().clearTreeData();
  openMonitor();
}

export function doStop() {
  //删除已组装的数据
  MonitorDataManager.getInstance().clearTreeData();
  closeMonitor();
}

export function doClear() {
  closeMonitor();
  MonitorDataManager.getInstance().clear();
}

export function mount() {
  const eventManager = getEventManager();
  eventManager.register({
    event: eventManager.Events.BeforeRouteExe,
    handler: beforeRouteExe,
  });
  eventManager.register({
    event: eventManager.Events.AfterRouteExe,
    handler: afterRouteExe,
  });
  eventManager.register({
    event: eventManager.Events.BeforeRuleExe,
    handler: beforeRuleExe,
  });
  eventManager.register({
    event: eventManager.Events.AfterRuleExe,
    handler: afterRuleExe,
  });
  eventManager.register({
    event: eventManager.Events.BeforeWindowLoad,
    handler: beforeWindowLoad,
  });
  eventManager.register({
    event: eventManager.Events.AfterWindowLoad,
    handler: afterWindowLoad,
  });

  eventManager.register({
    event: eventManager.Events.BeforeWindowRender,
    handler: beforeWindowRender,
  });
  eventManager.register({
    event: eventManager.Events.AfterWindowRender,
    handler: afterWindowRender,
  });

  eventManager.register({
    event: eventManager.Events.BeforeWindowInit,
    handler: beforeWindowInit,
  });
  eventManager.register({
    event: eventManager.Events.AfterWindowInit,
    handler: afterWindowInit,
  });

  eventManager.register({
    event: eventManager.Events.BeforeComponentInit,
    handler: beforeComponentInit,
  });
  eventManager.register({
    event: eventManager.Events.AfterComponentInit,
    handler: afterComponentInit,
  });

  eventManager.register({
    event: eventManager.Events.BeforeRPC,
    handler: beforeRPC,
  });
  eventManager.register({
    event: eventManager.Events.AfterRPC,
    handler: afterRPC,
  });
}

exports.isOpenMonitor = isOpenMonitor;
