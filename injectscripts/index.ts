import {
  clear,
  genViewTimePoint,
} from './DataManager';
import { register } from './EventObserver';
import FrontendJSON from './FrontendJSON';
import FrontendOberser from './FrontendOberser';
import RuleDebugger from './RuleDebugger';
import { Breakpoint } from './Types';
import {
  getComponentMetadata,
  getComponentParam,
  getComponentTitle,
  getDatasourceManager,
  getLogicDefines,
  getScopeManager,
  getWindowMetadata,
  getWindowParam,
  getWindowTitle,
  indexOf,
  isEmptyObject,
} from './Utils';

interface FrontendScopeTree {
  instanceId: string;
  title: string;
  type: "component" | "window";
  children?: FrontendScopeTree[];
}

class VActDevTools {
  //vact开发者工具id
  extensionId: null | string = null;

  //vact开发者工具版本
  vactInjectScriptVersion = "1.0";

  vjsUrls: Array<{
    //vjs请求标识id
    id: string;
    //vjs请求链接
    url: string;
  }> = [];
  /**
   * vjs沙箱
   */
  sandbox: null | { getService: (name: string) => any } = null;
  /**
   * 规则调试
   */
  ruleDebugger: RuleDebugger;

  frontendOberser: FrontendOberser;

  constructor(extensionId: null | string) {
    this.extensionId = extensionId;
    this.ruleDebugger = new RuleDebugger();
    this.ruleDebugger.setExtensionId(extensionId);
    this.frontendOberser = new FrontendOberser();
  }
  /**
   * 是否为VAct平台页面
   * @returns boolean
   */
  isVActPlatform() {
    //@ts-ignore
    return window.VMetrix && window.VMetrix.loadBundles;
  }
  /**
   * 设置vjs请求链接
   */
  putVjsUrl(params: { id: string; url: string }) {
    this.vjsUrls.push(params);
  }
  /**
   * 获取所有vjs请求
   * @returns
   */
  getVjsUrls() {
    return this.vjsUrls;
  }

  _getVjsUrl(id: string) {
    let item = this.vjsUrls.find((item) => item.id == id);
    let url: null | string = null;
    if (item) {
      url = item.url;
    }
    return url;
  }
  /**
   * 根据请求标识id获取vjs请求
   */
  getVjsUrl(params: { id: string }) {
    const { id } = params;
    return this._getVjsUrl(id);
  }
  /**
   * 根据请求标识id获取vjs请求内容
   */
  getVjsContent(params: { id: string }) {
    let result = "",
      hasError = false,
      { id } = params;
    let url = this._getVjsUrl(id);
    if (url) {
      //@ts-ignore
      $.ajax({
        url,
        async: false,
        complete: (xhr, status) => {
          if (xhr.status == 200) {
            const content = xhr.responseText;
            if (typeof content == "string") {
              const index = content.indexOf("exports.__$isErrorModule=true;");
              if (index != -1) {
                hasError = true;
                result = "请求url失败！";
              } else {
                result = content;
              }
            } else {
              hasError = true;
              result = "请求url失败！";
            }
          }
        },
      });
    } else {
      hasError = true;
      result = "未找到指定的vjs！";
    }
    if (hasError) {
      throw new Error(result);
    } else {
      return result;
    }
  }
  /**
   * 获取初始化vjs名称
   * 使用vact开发者工具，需要额外初始化一些vjs
   * @returns
   */
  getInitVjsNames() {
    return ["vjs.framework.extension.platform.interface.event"];
  }
  /**
   * vact页面vjs初始化完成后，触发此方法
   */
  vjsInited(sandbox) {
    this.sandbox = sandbox;
    register(sandbox);
    this.ruleDebugger.setSandbox(sandbox).mount();
    this.frontendOberser.mount(this.extensionId,this.sandbox);
  }
  /**
   * 是否在统计前端耗时
   */
  isMonitored() {
    const res = window.localStorage.getItem("vact_devtools_isMonitored");
    return res == "true";
  }
  /**
   * 开始记录前端耗时统计
   */
  markMonitored() {
    window.localStorage.setItem("vact_devtools_isMonitored", "true");
  }
  /**
   * 结束记录前端耗时统计
   */
  markUnMonitored() {
    window.localStorage.setItem("vact_devtools_isMonitored", "false");
  }
  /**
   * 清除前端耗时数据
   */
  clearMonitorData() {
    clear();
  }
  /**
   * 获取前端耗时数据
   */
  getMonitorDatas(params) {
    return genViewTimePoint(params ? params.key : null);
  }
  /**
   * 获取前端所有方法定义信息
   * @returns
   */
  getFrontendMethods() {
    const result: Array<{
      componentCode: string;
      componentName: string;
      windowCode?: string;
      windowName?: string;
      methodCode: string;
      methodName: string;
    }> = [];
    if (this.sandbox) {
      try {
        const routeSchema = this.sandbox.getService(
          "v_act_vjs_framework_extension_platform_data_storage_schema_route"
        );
        const componentCodes = routeSchema.ComponentRoute.getComponents();
        componentCodes.forEach((componentCode) => {
          const componentMetadata = getComponentMetadata(
            this.sandbox,
            componentCode
          );
          const componentName = getComponentTitle(this.sandbox, componentCode);
          const componentLogics = componentMetadata.logics;
          const logicDefines = getLogicDefines(componentLogics);
          logicDefines.forEach(function ({ methodCode, methodName }) {
            result.push({
              componentCode,
              componentName,
              methodCode,
              methodName,
            });
          });
        });
        const winDefines = routeSchema.WindowRoute.getWindows();
        winDefines.forEach(({ componentCode, windowCode }) => {
          const windowMetadata = getWindowMetadata(
            this.sandbox,
            componentCode,
            windowCode
          );
          const componentName = getComponentTitle(this.sandbox, componentCode);
          const windowName = getWindowTitle(
            this.sandbox,
            componentCode,
            windowCode
          );
          const windowLogics = windowMetadata.logics;
          const logicDefines = getLogicDefines(windowLogics);
          logicDefines.forEach(({ methodCode, methodName }) => {
            result.push({
              componentCode,
              componentName,
              windowCode,
              windowName,
              methodCode,
              methodName,
            });
          });
        });
      } catch (e) {
        return result;
      }
    }
    return result;
  }
  /**
   * 获取指定方法定义
   */
  getFrontendMethod(params: {
    componentCode: string;
    methodCode: string;
    windowCode?: string;
  }) {
    if (this.sandbox) {
      try {
        const { componentCode, methodCode, windowCode } = params;
        let metadata = windowCode
          ? getWindowMetadata(this.sandbox, componentCode, windowCode)
          : getComponentMetadata(this.sandbox, componentCode);
        //@ts-ignore
        const logics = Array.isArray(metadata.logics.logic)
          ? //@ts-ignore
            metadata.logics.logic
          : //@ts-ignore
            [metadata.logics.logic];
        return logics.find(
          (logic) => logic.ruleSets.ruleSet.$.code == methodCode
        );
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  /**
   * 添加断点信息
   */
  addBreakpoint(breakpoint: Breakpoint) {
    const breakpointJson = window.localStorage.getItem(
      "vact_devtools_breakpoints"
    );
    const breakpoints = breakpointJson ? JSON.parse(breakpointJson) : [];
    breakpoints.push(breakpoint);
    window.localStorage.setItem(
      "vact_devtools_breakpoints",
      JSON.stringify(breakpoints)
    );
  }
  /**
   * 更新断点信息
   * 开发者工具中可以启用/禁用断点
   */
  updateBreakpoint(breakpoint: Breakpoint) {
    const breakpointJson = window.localStorage.getItem(
      "vact_devtools_breakpoints"
    );
    const breakpoints: Breakpoint[] = breakpointJson
      ? JSON.parse(breakpointJson)
      : [];
    for (let index = 0; index < breakpoints.length; index++) {
      const bp = breakpoints[index];
      if (
        bp.location.componentCode == breakpoint.location.componentCode &&
        bp.location.methodCode == breakpoint.location.methodCode &&
        bp.location.ruleCode == breakpoint.location.ruleCode
      ) {
        if (
          typeof bp.location.windowCode == typeof breakpoint.location.windowCode
        ) {
          breakpoints[index] = breakpoint;
        }
      }
    }
    window.localStorage.setItem(
      "vact_devtools_breakpoints",
      JSON.stringify(breakpoints)
    );
  }
  /**
   * 移除断点信息
   */
  removeBreakpoint(breakpoint: Breakpoint | Breakpoint[]) {
    const breakpointJson = window.localStorage.getItem(
      "vact_devtools_breakpoints"
    );
    const breakpoints: Breakpoint[] = breakpointJson
      ? JSON.parse(breakpointJson)
      : [];
    const removed: Breakpoint[] = Array.isArray(breakpoint)
      ? breakpoint
      : [breakpoint];
    const storage: Breakpoint[] = [];
    breakpoints.forEach((bp) => {
      if (indexOf(bp, removed) == -1) {
        storage.push(bp);
      }
    });
    window.localStorage.setItem(
      "vact_devtools_breakpoints",
      JSON.stringify(storage)
    );
  }
  /**
   * 获取所有断点信息
   */
  getBreakpoints() {
    const breakpointJson = window.localStorage.getItem(
      "vact_devtools_breakpoints"
    );
    return breakpointJson ? JSON.parse(breakpointJson) : [];
  }
  /**
   * 是否断点所有规则
   */
  isBreakAllRule() {
    const flag = window.localStorage.getItem("vact_devtools_breakallrule");
    return flag == "true";
  }
  /**
   * 标记断点所有规则
   */
  markBreakAllRule() {
    window.localStorage.setItem("vact_devtools_breakallrule", "true");
  }
  /**
   * 取消断点所有谷子额
   */
  unmarkBreakAllRule() {
    window.localStorage.setItem("vact_devtools_breakallrule", "false");
  }
  /**
   * 清除所有断点
   */
  clearBreakpoint() {
    window.localStorage.setItem("vact_devtools_breakallrule", "false");
    window.localStorage.setItem("vact_devtools_breakpoints", "[]");
  }
  /**
   * 标记忽略所有断点
   */
  markIgnoreBreakpoints() {
    window.localStorage.setItem("vact_devtools_ignorebreakpoints", "true");
  }
  /**
   * 取消忽略所有断点
   */
  unmarkIgnoreBreakpoints() {
    window.localStorage.setItem("vact_devtools_ignorebreakpoints", "false");
  }
  /**
   * 是否忽略所有断点
   */
  isIgnoreBreakpoints() {
    return (
      window.localStorage.getItem("vact_devtools_ignorebreakpoints") == "true"
    );
  }
  /**
   * 设置开发者工具标识id
   */
  setChromeExtensionId(extensionId: string) {
    this.extensionId = extensionId;
    window.localStorage.setItem("vact_devtools_extensionId", extensionId);
    this.ruleDebugger.setExtensionId(extensionId);
  }
  /**
   * 打印信息到控制台
   */
  print(params: { msg: string }) {
    console.log(params.msg);
  }

  //获取构件实例列表
  getComponentInstances() {
    const scopeManager = getScopeManager(this.sandbox);
  }
  /**
   * 获取规则调试信息
   * @returns
   */
  getRuleDebugInfo() {
    const ruleContext = this.ruleDebugger.getRuleContext();
    if (ruleContext) {
      const ruleCfg = ruleContext.getRuleCfg();
      const ruleParams = ruleCfg.inParams;
      return JSON.parse(ruleParams);
    }
    return {};
  }
  //获取方法调试信息
  getRulesetDebugInfo() {
    const ruleContext = this.ruleDebugger.getRuleContext();
    const result = {};
    if (ruleContext) {
      const routeContext = ruleContext.getRouteContext();
      const inputs = routeContext.getInputParams();
      if (inputs && !isEmptyObject(inputs)) {
        result["输入"] = toJson(inputs);
      }
      const variants = routeContext.getVariables();
      if (variants && !isEmptyObject(variants)) {
        result["变量"] = toJson(variants);
      }
      const outputs = routeContext.getOutPutParams();
      if (outputs && !isEmptyObject(outputs)) {
        result["输出"] = toJson(variants);
      }
    }
    return result;
  }
  /**
   * 获取窗体调试信息
   */
  getWindowDebugInfo() {
    const ruleContext = this.ruleDebugger.getRuleContext();
    const result = {};
    if (ruleContext) {
      const routeContext = ruleContext.getRouteContext();
      const scopeId = routeContext.getScopeId();
      return this.getWindowDatas({instanceId:scopeId});
    }
    return result;
  }
  /**
   * 获取窗体数据
   * @param instanceId
   * @returns
   */
  getWindowDatas(params: { instanceId: string; keepDSContructor?: boolean }) {
    const { instanceId, keepDSContructor } = params;
    const result = {};
    const scopeManager = getScopeManager(this.sandbox);
    const windowParam = getWindowParam(this.sandbox);
    const datasourceManager = getDatasourceManager(this.sandbox);
    try {
      scopeManager.openScope(instanceId);
      const inputs = windowParam.getInputs();
      if (inputs && !isEmptyObject(inputs)) {
        result["输入"] = toJson(inputs, keepDSContructor);
      }
      const outputs = windowParam.getOutputs();
      if (outputs && !isEmptyObject(outputs)) {
        result["输出"] = toJson(outputs, keepDSContructor);
      }
      const windowScope = scopeManager.getScope(instanceId);
      result["控件"] = toJson(windowScope.get("windowWidgetMetadata"));
      const datasources = datasourceManager.getAll();
      if (datasources && datasources.length > 0) {
        const dsMap = {};
        for (let i = 0; i < datasources.length; i++) {
          const ds = datasources[i];
          const metadata = ds.getMetadata();
          const key = metadata.getDatasourceName
            ? `${metadata.getDatasourceName()}`
            : `${metadata.getCode()}`;
          dsMap[key] = ds; //toVal(ds,keepDSContructor);
        }
        result["实体"] = toJson(dsMap, keepDSContructor);
      }
    } finally {
      scopeManager.closeScope();
    }
    return result;
  }
  /**
   * 获取构件调试信息
   */
  getComponentDebugInfo() {
    const ruleContext = this.ruleDebugger.getRuleContext();
    const result = {};
    if (ruleContext) {
      const routeContext = ruleContext.getRouteContext();
      const scopeId = routeContext.getScopeId();
      return this.getComponentDatas({instanceId:scopeId});
    }
    return result;
  }
  /**
   * 获取构件数据
   * @param instanceId
   * @returns
   */
  getComponentDatas(params: {
    instanceId: string;
    keepDSContructor?: boolean;
  }) {
    const { instanceId, keepDSContructor } = params;
    const result = {};
    const componentParam = getComponentParam(this.sandbox);
    const scopeManager = getScopeManager(this.sandbox);
    const scope = scopeManager.getScope(instanceId);
    const componentCode = scope.getComponentCode();
    try {
      scopeManager.openScope(instanceId);
      const vars = componentParam.getVariants(componentCode);
      if (vars && !isEmptyObject(vars)) {
        result["变量"] = toJson(vars, keepDSContructor);
      }
      const options = componentParam.getOptions(componentCode);
      if (options && !isEmptyObject(options)) {
        result["常量"] = toJson(options, keepDSContructor);
      }
    } finally {
      scopeManager.closeScope();
    }
    return result;
  }
  /**
   * 获取前端构件、窗体实例树
   * @returns
   */
  getFrontendScopes() {
    const scopeManager = getScopeManager(this.sandbox);
    const scopes = scopeManager.getAll();
    const result: Array<{
      type: "window" | "component";
      instanceId: string;
      componentCode: string;
      title: string;
      pId: string;
      windowCode?: string;
    }> = [];
    scopes.forEach((scope) => {
      const instanceId: string = scope.getInstanceId();
      const componentCode = scope.getComponentCode();
      const type = scopeManager.isWindowScope(instanceId)
        ? "window"
        : "component";
      if (type == "window") {
        const windowCode = scope.getWindowCode();
        const title = getWindowTitle(this.sandbox, componentCode, windowCode);
        const pId = scopeManager.getParentScopeId(instanceId);
        result.push({
          type: "window",
          instanceId,
          componentCode,
          title,
          pId,
          windowCode,
        });
      } else {
        const title = getComponentTitle(this.sandbox, componentCode);
        const pId = scopeManager.getParentScopeId(instanceId);
        result.push({
          type: "component",
          instanceId,
          componentCode,
          title,
          pId,
        });
      }
    });
    return result;
  }
}

const handleErr = function (e) {
  return {
    __$vactType: "error",
    message: e.message,
  };
};

const toJson = (obj: {}, keepDsContructor?: boolean) => {
  const json = new FrontendJSON(obj, keepDsContructor);
  return json.parse();
};

const toVal = (val: any, keepDsContructor?: boolean) => {
  const json = new FrontendJSON(val, keepDsContructor);
  return json.parse();
};

//@ts-ignore
const vact_devtools = window.vact_devtools || {};
const extensionId = window.localStorage.getItem("vact_devtools_extensionId");
vact_devtools.methods = new VActDevTools(extensionId);
//@ts-ignore
window.vact_devtools = vact_devtools;
export { vact_devtools };
