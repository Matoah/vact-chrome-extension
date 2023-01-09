//@ts-nocheck
import * as dataManager from './DataManager';
import TimePoint from './TimePoint';
import {
  getEventManager,
  getScopeManager,
} from './Utils';

let sb;

/**
 * 获取路由上下文的时间点
 * */
function _getRouteTimePoint(routeContext, type) {
  const info = {};
  let scopeId = routeContext.getScopeId();
  const scopeManager = getScopeManager(sb);
  if (!scopeId) scopeId = scopeManager.getCurrentScopeId();
  info.scopeId = scopeId;
  info.parentScopeId = scopeManager.getParentScopeId(scopeId);
  var scope = scopeManager.getScope(scopeId);
  info.componentCode = scope.getComponentCode();
  if (scopeManager.isWindowScope(scopeId)) {
    info.windowCode = scope.getWindowCode();
  }
  var routeCfg = routeContext.getRouteConfig();
  if (routeCfg) {
    var funCode = routeCfg.getCode();
    info.funCode = funCode;
    var monitorSign = routeContext._monitorSign;
    info.key = monitorSign;
    info.type = type;
    info.series = TimePoint.Series.Route;
    var parentRule = routeContext.getParentRuleContext();
    if (
      parentRule &&
      !parentRule.getRouteContext().isVirtual &&
      parentRule._monitorSign
    ) {
      info.parentKey = parentRule._monitorSign;
    }
    return new TimePoint(info);
  }
  return null;
}

function _getRuleTimePoint(ruleContext, type) {
  const scopeManager = getScopeManager(sb);
  var rr = ruleContext.getRouteContext();
  if (rr.isVirtual) {
    //虚拟路由里面的规则不作显示
    return null;
  }
  var info = {};
  info.key = ruleContext._monitorSign;
  var monitorSign = rr._monitorSign;
  if (monitorSign) info.parentKey = monitorSign;
  var scopeId = scopeManager.getCurrentScopeId();
  info.scopeId = scopeId;
  var scope = scopeManager.getScope();
  info.componentCode = scope.getComponentCode();
  if (scopeManager.isWindowScope(scopeId)) {
    info.winCode = scope.getWindowCode();
  }
  var routeCfg = rr.getRouteConfig();
  info.funCode = routeCfg.getCode();
  var ruleCfg = ruleContext.getRuleCfg();
  info.ruleCode = ruleCfg.ruleCode;
  info.ruleName = ruleCfg.instanceName;
  info.ruleInstanceCode = ruleCfg.instanceCode;
  info.type = type;
  info.series = TimePoint.Series.Rule;
  return new TimePoint(info);
}
/**
 * 获取窗体相关的时间点
 * */
function _getWindowTimePoint(scopeId, type, uuid) {
  const scopeManager = getScopeManager(sb);
  var scope = scopeManager.getScope(scopeId);
  var componentCode = scope.getComponentCode();
  var winCode = scope.getWindowCode();
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
  const scopeManager = getScopeManager(sb);
  var scope = scopeManager.getScope(scopeId);
  var componentCode = scope.getComponentCode();
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
  var operations = request.getOperations();
  var operationList = [];
  var componentCode = null;
  var winCode = null;
  var rpcCode = null;
  if (operations && operations.length > 0) {
    for (var i = 0, l = operations.length; i < l; i++) {
      var operation = operations[i];
      componentCode = operation.getComponentCode();
      winCode = operation.getWindowCode();
      var operationCode;
      var params = operation.getParams();
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
  //@ts-ignore
  return window.vact_devtools.methods.isMonitored();
}

/**
 * 方法执行前
 */
function beforeRouteExe(rr) {
  if (isOpenMonitor()) {
    var time = _getRouteTimePoint(rr, TimePoint.Types.BeforeRouteExe);
    if (time) {
      dataManager.add(time);
    }
  }
}

/**
 * 方法执行后
 */
function afterRouteExe(rr) {
  if (isOpenMonitor()) {
    var monitorSign = rr._monitorSign;
    if (monitorSign) {
      if (rr._isInnerRoute) {
        //删除对应的方法执行前时间点
        dataManager.remove(monitorSign);
      } else {
        if (!rr.isVirtual && rr._monitorSign) {
          var time = _getRouteTimePoint(rr, TimePoint.Types.AfterRouteExe);
          if (time) {
            dataManager.add(time);
          }
        }
      }
    }
  }
}

function _isBusinessRule(ruleContext) {
  var ruleInstance = ruleContext.getRuleCfg();
  return ruleInstance.hasOwnProperty("transactionType");
}

function beforeRuleExe(ruleContext) {
  if (isOpenMonitor()) {
    if (_isBusinessRule(ruleContext)) {
      var time = _getRuleTimePoint(ruleContext, TimePoint.Types.BeforeRuleExe);
      if (time) dataManager.add(time);
    } else {
      var routeContext = ruleContext.getRouteContext();
      routeContext._isInnerRoute = true;
    }
  }
}

function afterRuleExe(ruleContext) {
  if (isOpenMonitor()) {
    if (_isBusinessRule(ruleContext)) {
      var time = _getRuleTimePoint(ruleContext, TimePoint.Types.AfterRuleExe);
      if (time) dataManager.add(time);
    }
  }
}

function beforeWindowLoad(scopeId, uuid) {
  if (isOpenMonitor()) {
    var time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.BeforeWindowLoad,
      uuid
    );
    dataManager.add(time);
  }
}

function afterWindowLoad(scopeId, uuid) {
  if (isOpenMonitor()) {
    var time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.AfterWindowLoad,
      uuid
    );
    dataManager.add(time);
  }
}

function beforeWindowRender(scopeId, uuid) {
  if (isOpenMonitor()) {
    var time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.BeforeWindowRender,
      uuid
    );
    dataManager.add(time);
  }
}

function afterWindowRender(scopeId, uuid) {
  if (isOpenMonitor()) {
    var time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.AfterWindowRender,
      uuid
    );
    dataManager.add(time);
  }
}

function beforeWindowInit(scopeId, uuid) {
  if (isOpenMonitor()) {
    var time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.BeforeWindowInit,
      uuid
    );
    dataManager.add(time);
  }
}

function afterWindowInit(scopeId, uuid) {
  if (isOpenMonitor()) {
    var time = _getWindowTimePoint(
      scopeId,
      TimePoint.Types.AfterWindowInit,
      uuid
    );
    dataManager.add(time);
  }
}

function beforeComponentInit(scopeId, uuid) {
  if (isOpenMonitor()) {
    var time = _getComponentTimePoint(
      scopeId,
      TimePoint.Types.BeforeComponentInit,
      uuid
    );
    dataManager.add(time);
  }
}

function afterComponentInit(scopeId, uuid) {
  if (isOpenMonitor()) {
    var time = _getComponentTimePoint(
      scopeId,
      TimePoint.Types.AfterComponentInit,
      uuid
    );
    dataManager.add(time);
  }
}

function beforeRPC(request, uuid) {
  if (isOpenMonitor()) {
    var time = _getRPCTimePoint(request, TimePoint.Types.BeforeRPC, uuid);
    dataManager.add(time);
  }
}

function afterRPC(request, uuid) {
  if (isOpenMonitor()) {
    var time = _getRPCTimePoint(request, TimePoint.Types.AfterRPC, uuid);
    dataManager.add(time);
  }
}

/**
 * 开启监控
 * */
function openMonitor() {
  //@ts-ignore
  window.vact_devtools.methods.markMonitored();
}

/**
 * 关闭监控
 * */
function closeMonitor() {
  //@ts-ignore
  window.vact_devtools.methods.markUnMonitored();
}

export function doStart() {
  //删除已组装的数据
  dataManager.clearTreeData();
  openMonitor();
}

export function doStop() {
  //删除已组装的数据
  dataManager.clearTreeData();
  closeMonitor();
}

export function doClear() {
  closeMonitor();
  dataManager.clear();
}

export function register(sandbox) {
  sb = sandbox;
  const eventManager = getEventManager(sb);
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
