import TimePoint from './TimePoint';

function getRuleTipDom(data, time: TimePoint) {
  const funcCode = time.getFunCode();
  const windowCode = time.getWindowCode();
  const ruleCode = time.getRuleCode();
  const ruleName = time.getRuleName();
  const ruleInstanceCode = time.getRuleInstanceCode();
  const count = data.to - data.from;
  const componentCode = time.getComponentCode();
  return (
    '<dl class="item-summary">' +
    "<dt>" +
    ruleName +
    "(" +
    ruleInstanceCode +
    ") 执行耗时信息</dt>" +
    (ruleName ? "<dd>规则名称：" + ruleName + "</dd>" : "") +
    "<dd>所属构件：" +
    componentCode +
    "</dd>" +
    (windowCode ? "<dd>所属窗体：" + windowCode + "</dd>" : "") +
    "<dd>所属方法：" +
    funcCode +
    "</dd>" +
    '<dd>耗时：<span><i class="rect-method"></i>' +
    count +
    "ms</span></dd>" +
    (ruleCode == "ExecuteRuleSet" || ruleCode == "OpenComponentReturnData"
      ? '<dd class="double-click-desc" style="text-align:center;">双击查看详情</dd>'
      : "") +
    "</dl>" +
    '<i class="icon-arrow"></i>'
  );
}

function getFunctionTipDom(data, time: TimePoint) {
  const funCode = time.getFunCode();
  const winCode = time.getWindowCode();
  const count = data.to - data.from;
  const componentCode = time.getComponentCode();
  return (
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
    '<i class="icon-arrow"></i>'
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
    '<i class="icon-arrow"></i>'
  );
}

function getComponentLoadTipDom(data, time: TimePoint) {
  const count = data.to - data.from;
  const componentCode = time.getComponentCode();
  return (
    '<dl class="item-summary">' +
    "<dt>构件：" +
    componentCode +
    " 加载耗时信息</dt>" +
    '<dd>耗时：<span><i class="rect-method"></i>' +
    count +
    "ms</span></dd>" +
    "</dl>" +
    '<i class="icon-arrow"></i>'
  );
}

function getRPCTipDom(data, time: TimePoint) {
  const windowCode = time.getWindowCode();
  const rpcCode = time.getRPCCode();
  const count = data.to - data.from;
  const componentCode = time.getComponentCode();
  return (
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
    '<i class="icon-arrow"></i>'
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
