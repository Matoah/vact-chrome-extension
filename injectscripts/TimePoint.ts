class TimePoint {
  static Types = {
    BeforeRuleExe: -1,
    AfterRuleExe: 1,
    BeforeRouteExe: -2,
    AfterRouteExe: 2,
    BeforeWindowLoad: -3,
    AfterWindowLoad: 3,
    BeforeWindowRender: -4,
    AfterWindowRender: 4,
    BeforeWindowInit: -5,
    AfterWindowInit: 5,
    BeforeComponentInit: -6,
    AfterComponentInit: 6,
    BeforeRPC: -7,
    AfterRPC: 7,
  };

  static Series = {
    Route: 1,
    Rule: 2,
    Network: 3,
    Window: 4,
    Component: 5,
  };

  time: Date;
  type: number;
  key: string;
  series: number;
  componentCode: string;
  componentName: string;
  windowCode: string;
  windowName: string;
  funCode: string;
  funName: string;
  ruleCode: string;
  ruleName: string;
  ruleInstanceCode: string;
  rpcCode: string;
  parentKey: string;
  scopeId: string;
  parentScopeId: string;
  constructor(params) {
    this.time = new Date();
    this.type = params.type;
    this.key = params.key;
    this.series = params.series;
    this.componentCode = params.componentCode;
    this.componentName = params.componentName;
    this.windowCode = params.windowCode;
    this.windowName = params.windowName;
    this.funCode = params.funCode;
    this.funName = params.funName;
    this.ruleCode = params.ruleCode;
    this.ruleName = params.ruleName;
    this.ruleInstanceCode = params.ruleInstanceCode;
    this.rpcCode = params.rpcCode;
    this.parentKey = params.parentKey;
    this.scopeId = params.scopeId;
    this.parentScopeId = params.parentScopeId;
  }
  getComponentCode() {
    return this.componentCode;
  }

  setComponentCode(componentCode) {
    this.componentCode = componentCode;
  }

  getComponentName() {
    return this.componentName;
  }

  setComponentName(componentName) {
    this.componentName = componentName;
  }

  getWindowCode() {
    return this.windowCode;
  }

  setWindowCode(windowCode) {
    this.windowCode = windowCode;
  }

  getWindowName() {
    return this.windowName;
  }

  setWindowtName(windowName) {
    this.windowName = windowName;
  }

  getFunCode() {
    return this.funCode;
  }

  setFunCode(funCode) {
    this.funCode = funCode;
  }

  getFunName() {
    return this.funName;
  }

  setFuntName(funName) {
    this.funName = funName;
  }

  getRuleCode() {
    return this.ruleCode;
  }

  setRuleCode(ruleCode) {
    this.ruleCode = ruleCode;
  }

  getRuleName() {
    return this.ruleName;
  }

  setRuletName(ruleName) {
    this.ruleName = ruleName;
  }

  getRuleInstanceCode() {
    return this.ruleInstanceCode;
  }

  setRuletInstanceCode(ruleInstanceCode) {
    this.ruleInstanceCode = ruleInstanceCode;
  }

  getRPCCode() {
    return this.rpcCode;
  }

  setRPCCode(rpcCode) {
    this.rpcCode = rpcCode;
  }

  getTime() {
    return this.time;
  }

  getType() {
    return this.type;
  }

  getKey() {
    return this.key;
  }

  getSeries() {
    return this.series;
  }

  getParentKey() {
    return this.parentKey;
  }

  setParentKey(parentKey) {
    this.parentKey = parentKey;
  }

  getScopeId() {
    return this.scopeId;
  }

  setScopeId(scopeId) {
    this.scopeId = scopeId;
  }

  getParentScopeId() {
    return this.parentScopeId;
  }

  getTypeCode() {
    var series = this.series;
    var typeCode = "";
    switch (series) {
      case 1:
        typeCode = "type-method";
        break;
      case 2:
        typeCode = "type-rule";
        break;
      case 4:
        typeCode = "type-win";
        break;
      case 5:
        typeCode = "type-widget";
        break;
      default:
        typeCode = "type-net";
        break;
    }
    return typeCode;
  }

  clone() {
    return new TimePoint({
      time: this.time,
      type: this.type,
      key: this.key,
      series: this.series,
      componentCode: this.componentCode,
      componentName: this.componentName,
      windowCode: this.windowCode,
      windowName: this.windowName,
      funCode: this.funCode,
      funName: this.funName,
      ruleCode: this.ruleCode,
      ruleName: this.ruleName,
      ruleInstanceCode: this.ruleInstanceCode,
      rpcCode: this.rpcCode,
      parentKey: this.parentKey,
      scopeId: this.scopeId,
      parentScopeId: this.parentScopeId,
    });
  }
}
export default TimePoint;
