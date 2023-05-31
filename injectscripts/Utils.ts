import TimePoint from './TimePoint';
import { Breakpoint } from './Types';

function getRuleTipDom(data, time: TimePoint) {
  const funcCode = time.getFunCode();
  const windowCode = time.getWindowCode();
  const ruleCode = time.getRuleCode();
  const ruleName = time.getRuleName();
  const ruleInstanceCode = time.getRuleInstanceCode();
  const count = data.to - data.from;
  const componentCode = time.getComponentCode();
  return `
      <i class="icon-arrow icon-arrow-up"></i>
      <dl class="item-summary">
        <dt>${ruleName}(${ruleInstanceCode})执行耗时信息</dt>
        ${ruleName ? "<dd>规则名称：" + ruleName + "</dd>" : ""}
        <dd>规则编号：${ruleCode}</dd>
        <dd>所属构件：${componentCode}</dd>
        ${windowCode ? "<dd>所属窗体：" + windowCode + "</dd>" : ""}
        <dd>所属方法：${funcCode}</dd>
        <dd>耗时：
          <span>
            <i class="rect-method"></i>
            ${count}ms
          </span>
        </dd>
        ${
          ruleCode == "ExecuteRuleSet" || ruleCode == "OpenComponentReturnData"
            ? '<dd class="double-click-desc" style="text-align:center;">单击查看详情</dd>'
            : ""
        }
      </dl>
      <i class="icon-arrow icon-arrow-down"></i>`;
}

function getFunctionTipDom(data, time: TimePoint) {
  const funCode = time.getFunCode();
  const winCode = time.getWindowCode();
  const count = data.to - data.from;
  const componentCode = time.getComponentCode();
  return (
    '<i class="icon-arrow icon-arrow-up"></i><dl class="item-summary">' +
    '<dl class="item-summary">' +
    "<dt>方法：" +
    funCode +
    " 执行耗时信息</dt>" +
    "<dd>所属构件：" +
    componentCode +
    "</dd>" +
    (winCode ? "<dd>所属窗体：" + winCode + "</dd>" : "") +
    '<dd>耗时：<span><i class="rect-method"></i>' +
    count +
    "ms</span></dd>" +
    "</dl>" +
    '<i class="icon-arrow icon-arrow-down"></i>'
  );
}

function getInitOrRenderTipDom(data, time: TimePoint) {
  let name = "";
  const type = time.getType();
  const componentCode = time.getComponentCode();
  if (type == 3) name = "加载";
  else if (type == 4) name = "渲染";
  else name = "初始化";
  const winCode = time.getWindowCode();
  const count = data.to - data.from;
  return (
    '<i class="icon-arrow icon-arrow-up"></i><dl class="item-summary">' +
    '<dl class="item-summary">' +
    "<dt>窗体：" +
    winCode +
    " " +
    name +
    "耗时信息</dt>" +
    "<dd>所属构件：" +
    componentCode +
    "</dd>" +
    '<dd>耗时：<span><i class="rect-method"></i>' +
    count +
    "ms</span></dd>" +
    "</dl>" +
    '<i class="icon-arrow icon-arrow-down"></i>'
  );
}

function getComponentLoadTipDom(data, time: TimePoint) {
  const count = data.to - data.from;
  const componentCode = time.getComponentCode();
  return (
    '<i class="icon-arrow icon-arrow-up"></i><dl class="item-summary">' +
    '<dl class="item-summary">' +
    "<dt>构件：" +
    componentCode +
    " 加载耗时信息</dt>" +
    '<dd>耗时：<span><i class="rect-method"></i>' +
    count +
    "ms</span></dd>" +
    "</dl>" +
    '<i class="icon-arrow icon-arrow-down"></i>'
  );
}

function getRPCTipDom(data, time: TimePoint) {
  const windowCode = time.getWindowCode();
  const rpcCode = time.getRPCCode();
  const count = data.to - data.from;
  const componentCode = time.getComponentCode();
  return (
    '<i class="icon-arrow icon-arrow-up"></i><dl class="item-summary">' +
    '<dl class="item-summary">' +
    "<dt>请求：" +
    rpcCode +
    " 执行耗时信息</dt>" +
    "<dd>所属构件：" +
    componentCode +
    "</dd>" +
    (windowCode ? "<dd>所属窗体：" + windowCode + "</dd>" : "") +
    '<dd>耗时：<span><i class="rect-method"></i>' +
    count +
    "ms</span></dd>" +
    "</dl>" +
    '<i class="icon-arrow icon-arrow-down"></i>'
  );
}

export function getTipDom(data, time: TimePoint) {
  const type = time.type;
  if (type == 1 || type == -1) {
    return getRuleTipDom(data, time);
  } else if (type == 2 || type == -2) {
    return getFunctionTipDom(data, time);
  } else if ([3, -3, 4, -4, 5, -5].indexOf(type) != -1) {
    return getInitOrRenderTipDom(data, time);
  } else if (type == 6 || type == -6) {
    return getComponentLoadTipDom(data, time);
  } else if (type == 7 || type == -7) {
    return getRPCTipDom(data, time);
  }
  return "";
}

export function getScopeManager(sandbox) {
  return sandbox.getService(
    "v_act_vjs_framework_extension_platform_interface_scope"
  ).ScopeManager;
}

export function getEventManager(sandbox) {
  return sandbox.getService(
    "v_act_vjs_framework_extension_platform_interface_event"
  ).EventManager;
}

export function getWindowParam(sandbox) {
  return sandbox.getService(
    "v_act_vjs_framework_extension_platform_data_storage_runtime_param"
  ).WindowParam;
}

export function getComponentParam(sandbox) {
  return sandbox.getService(
    "v_act_vjs_framework_extension_platform_data_storage_runtime_param"
  ).ComponentParam;
}

export function getDatasourceManager(sandbox) {
  return sandbox.getService(
    "v_act_vjs_framework_extension_platform_data_manager_runtime_datasource"
  ).WindowDatasource;
}

export function getWindowMetadata(sandbox,componentCode,windowCode){
  return sandbox
  .getService(
    `vact.vjs.framework.extension.platform.init.view.schema.window.${componentCode}.${windowCode}`
  )
  ?.getWindowDefine()
  ?.getWindowMetadata();
}

export function getComponentMetadata(sandbox,componentCode){
  return sandbox
  .getService(
    `vact.vjs.framework.extension.platform.init.view.schema.component.${componentCode}`
  )
  ?.default?.returnComponentSchema();
}

export function getComponentTitle(sandbox,componentCode){
  const metadata = getComponentMetadata(sandbox,componentCode);
  return metadata?.$?.name;
}

export function getWindowTitle(sandbox,componentCode,windowCode){
  const metadata = getWindowMetadata(sandbox,componentCode,windowCode);
  return metadata?.$?.name;
}

export function indexOf(breakpoint: Breakpoint, breakpoints: Breakpoint[]) {
  for (let index = 0; index < breakpoints.length; index++) {
    const bp = breakpoints[index];
    if (
      bp.location.componentCode == breakpoint.location.componentCode &&
      bp.location.methodCode == breakpoint.location.methodCode &&
      bp.location.ruleCode == breakpoint.location.ruleCode
    ) {
      if (
        (!bp.location.windowCode && !breakpoint.location.windowCode) ||
        bp.location.windowCode == breakpoint.location.windowCode
      ) {
        return index;
      }
    }
  }
  return -1;
}
export const isEmptyObject = function (obj: {}) {
  let res = true;
  for (let attr in obj) {
    res = false;
    break;
  }
  return res;
};

const devtools = {
  isOpen: false,
  orientation: undefined,
};

const threshold = 170;

const emitEvent = (isOpen, orientation) => {
  globalThis.dispatchEvent(
    new globalThis.CustomEvent("devtoolschange", {
      detail: {
        isOpen,
        orientation,
      },
    })
  );
};

export const isDevtoolOpened = function () {
  const widthThreshold =
    globalThis.outerWidth - globalThis.innerWidth > threshold;
  const heightThreshold =
    globalThis.outerHeight - globalThis.innerHeight > threshold;

  if (
    !(heightThreshold && widthThreshold) &&
    ((globalThis.Firebug &&
      globalThis.Firebug.chrome &&
      globalThis.Firebug.chrome.isInitialized) ||
      widthThreshold ||
      heightThreshold)
  ) {
    return true;
  } else {
    return false;
  }
};

export function  getLogicDefines (
  logics: any
): Array<{ methodCode: string; methodName: string }> {
  if (typeof logics != "string") {
    try {
      const defines: Array<{ methodCode: string; methodName: string }> = [];
      logics = Array.isArray(logics.logic) ? logics.logic : [logics.logic];
      logics.forEach((logic) => {
        const ruleSet = logic.ruleSets.ruleSet.$;
        defines.push({
          methodCode: ruleSet.code,
          methodName: ruleSet.name,
        });
      });
      return defines;
    } catch (e) {}
  }
  return [];
};
