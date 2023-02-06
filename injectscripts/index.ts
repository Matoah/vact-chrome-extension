import {
  clear,
  genViewTimePoint,
} from './DataManager';
import { register } from './EventObserver';
import RuleDebugger from './RuleDebugger';
import { Breakpoint } from './Types';
import {
  getComponentParam,
  getDatasourceManager,
  getScopeManager,
  getWindowParam,
  indexOf,
  isEmptyObject,
} from './Utils';

const handleErr = function (e) {
  return {
    __$vactType: "error",
    message: e.message,
  };
};

const toJson = (obj: {}) => {
  try {
    const inputObj = {};
    for (let code in obj) {
      inputObj[code] = toVal(obj[code]);
    }
    //进行序列化尝试，防止通信时数据序列化失败造成功能异常
    JSON.stringify(inputObj);
    return inputObj;
  } catch (e) {
    return handleErr(e);
  }
};

const toVal = (val: any) => {
  if (val) {
    if (typeof val._get == "function") {
      val = val._get();
    }
    if (typeof val.serialize == "function") {
      val = val.serialize();
      val = val.datas.values;
    }
  }
  return val;
};

const getLogicDefines = function (
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

//@ts-ignore
const vact_devtools = window.vact_devtools || {};
const extensionId = window.localStorage.getItem("vact_devtools_extensionId");
const ruleDebugger = new RuleDebugger();
ruleDebugger.setExtensionId(extensionId);
vact_devtools.storage = {
  vjsUrls: [],
  sandbox: null,
  extensionId,
  ruleDebugger,
};
const _getVjsUrl = function (id) {
  let item = vact_devtools.storage.vjsUrls.find((item) => item.id == id);
  let url = null;
  if (item) {
    url = item.url;
  }
  return url;
};
vact_devtools.methods = {
  vactInjectScriptVersion: "1.0",
  isVActPlatform: function () {
    //@ts-ignore
    return window.VMetrix && window.VMetrix.loadBundles;
  },
  putVjsUrl: function (params) {
    vact_devtools.storage.vjsUrls.push(params);
  },
  getVjsUrls: function () {
    return vact_devtools.storage.vjsUrls;
  },
  getVjsUrl: function ({ id }) {
    return _getVjsUrl(id);
  },
  getVjsContent: function ({ id }) {
    let result = "",
      hasError = false;
    let url = _getVjsUrl(id);
    if (url) {
      //@ts-ignore
      $.ajax({
        url,
        async: false,
        complete: (xhr, status) => {
          if (status == "success") {
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
  },
  getInitVjsNames: function () {
    return ["vjs.framework.extension.platform.interface.event"];
  },
  vjsInited: function (sandbox) {
    vact_devtools.storage.sandbox = sandbox;
    register(sandbox);
    vact_devtools.storage.ruleDebugger.setSandbox(sandbox).mount();
  },
  isMonitored: function () {
    const res = window.localStorage.getItem("vact_devtools_isMonitored");
    return res == "true";
  },
  markMonitored: function () {
    window.localStorage.setItem("vact_devtools_isMonitored", "true");
  },
  markUnMonitored: function () {
    window.localStorage.setItem("vact_devtools_isMonitored", "false");
  },
  clearMonitorData: function () {
    clear();
  },
  getMonitorDatas: function (params) {
    return genViewTimePoint(params ? params.key : null);
  },
  getFrontendMethods: function () {
    const result: Array<{
      componentCode: string;
      componentName: string;
      windowCode?: string;
      windowName?: string;
      methodCode: string;
      methodName: string;
    }> = [];
    if (vact_devtools.storage.sandbox) {
      try {
        const routeSchema = vact_devtools.storage.sandbox.getService(
          "v_act_vjs_framework_extension_platform_data_storage_schema_route"
        );
        const componentCodes = routeSchema.ComponentRoute.getComponents();
        componentCodes.forEach(function (componentCode) {
          const componentMetadata = vact_devtools.storage.sandbox
            .getService(
              `vact.vjs.framework.extension.platform.init.view.schema.component.${componentCode}`
            )
            .default.returnComponentSchema();
          const componentName = componentMetadata.$.name;
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
        winDefines.forEach(function ({ componentCode, windowCode }) {
          const windowMetadata = vact_devtools.storage.sandbox
            .getService(
              `vact.vjs.framework.extension.platform.init.view.schema.window.${componentCode}.${windowCode}`
            )
            .getWindowDefine()
            .getWindowMetadata();
          const componentMetadata = vact_devtools.storage.sandbox
            .getService(
              `vact.vjs.framework.extension.platform.init.view.schema.component.${componentCode}`
            )
            .default.returnComponentSchema();
          const componentName = componentMetadata.$.name;
          const windowName = windowMetadata.$.name;
          const windowLogics = windowMetadata.logics;
          const logicDefines = getLogicDefines(windowLogics);
          logicDefines.forEach(function ({ methodCode, methodName }) {
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
  },
  getFrontendMethod: function (params: {
    componentCode: string;
    methodCode: string;
    windowCode?: string;
  }) {
    if (vact_devtools.storage.sandbox) {
      try {
        const { componentCode, methodCode, windowCode } = params;
        let metadata = null;
        if (windowCode) {
          metadata = vact_devtools.storage.sandbox
            .getService(
              `vact.vjs.framework.extension.platform.init.view.schema.window.${componentCode}.${windowCode}`
            )
            .getWindowDefine()
            .getWindowMetadata();
        } else {
          metadata = vact_devtools.storage.sandbox
            .getService(
              `vact.vjs.framework.extension.platform.init.view.schema.component.${componentCode}`
            )
            .default.returnComponentSchema();
        }
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
  },
  addBreakpoint: function (breakpoint: Breakpoint) {
    const breakpointJson = window.localStorage.getItem(
      "vact_devtools_breakpoints"
    );
    const breakpoints = breakpointJson ? JSON.parse(breakpointJson) : [];
    breakpoints.push(breakpoint);
    window.localStorage.setItem(
      "vact_devtools_breakpoints",
      JSON.stringify(breakpoints)
    );
  },
  updateBreakpoint: function (breakpoint: Breakpoint) {
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
  },
  removeBreakpoint: function (breakpoint: Breakpoint | Breakpoint[]) {
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
  },
  getBreakpoints: function () {
    const breakpointJson = window.localStorage.getItem(
      "vact_devtools_breakpoints"
    );
    return breakpointJson ? JSON.parse(breakpointJson) : [];
  },
  isBreakAllRule: function () {
    const flag = window.localStorage.getItem("vact_devtools_breakallrule");
    return flag == "true";
  },
  markBreakAllRule: function () {
    window.localStorage.setItem("vact_devtools_breakallrule", "true");
  },
  unmarkBreakAllRule: function () {
    window.localStorage.setItem("vact_devtools_breakallrule", "false");
  },
  clearBreakpoint: function () {
    window.localStorage.setItem("vact_devtools_breakallrule", "false");
    window.localStorage.setItem("vact_devtools_breakpoints", "[]");
  },
  markIgnoreBreakpoints: function () {
    window.localStorage.setItem("vact_devtools_ignorebreakpoints", "true");
  },
  unmarkIgnoreBreakpoints: function () {
    window.localStorage.setItem("vact_devtools_ignorebreakpoints", "false");
  },
  isIgnoreBreakpoints: function () {
    return (
      window.localStorage.getItem("vact_devtools_ignorebreakpoints") == "true"
    );
  },
  setChromeExtensionId: function (extensionId: string) {
    vact_devtools.storage.extensionId = extensionId;
    window.localStorage.setItem("vact_devtools_extensionId", extensionId);
    vact_devtools.storage.ruleDebugger.setExtensionId(extensionId);
  },
  print: function (params: { msg: string }) {
    console.log(params.msg);
  },
  //获取构件实例列表
  getComponentInstances: function () {
    const scopeManager = getScopeManager(vact_devtools.storage.sandbox);
  },
  getRuleDebugInfo: function () {
    const ruleContext = vact_devtools.storage.ruleDebugger.getRuleContext();
    if (ruleContext) {
      const ruleCfg = ruleContext.getRuleCfg();
      const ruleParams = ruleCfg.inParams;
      return JSON.parse(ruleParams);
    }
    return {};
  },
  //获取方法调试信息
  getRulesetDebugInfo: function () {
    const ruleContext = vact_devtools.storage.ruleDebugger.getRuleContext();
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
  },
  getWindowDebugInfo: function () {
    const ruleContext = vact_devtools.storage.ruleDebugger.getRuleContext();
    const result = {};
    if (ruleContext) {
      const routeContext = ruleContext.getRouteContext();
      const scopeId = routeContext.getScopeId();
      const windowParam = getWindowParam(vact_devtools.storage.sandbox);
      const scopeManager = getScopeManager(vact_devtools.storage.sandbox);
      const datasourceManager = getDatasourceManager(
        vact_devtools.storage.sandbox
      );
      try {
        scopeManager.openScope(scopeId);
        const inputs = windowParam.getInputs();
        if (inputs && !isEmptyObject(inputs)) {
          result["输入"] = toJson(inputs);
        }
        const outputs = windowParam.getOutputs();
        if (outputs && !isEmptyObject(outputs)) {
          result["输出"] = toJson(outputs);
        }
        const windowScope = scopeManager.getScope(scopeId);
        result["控件"] = toJson(windowScope.get("windowWidgetMetadata"));
        const datasources = datasourceManager.getAll();
        if (datasources && datasources.length > 0) {
          const dsMap = {};
          for (let i = 0; i < datasources.length; i++) {
            const ds = datasources[i];
            const metadata = ds.getMetadata();
            dsMap[
              metadata.getDatasourceName
                ? metadata.getDatasourceName()
                : metadata.getCode()
            ] = toVal(ds);
          }
          result["实体"] = toJson(dsMap);
        }
      } finally {
        scopeManager.closeScope();
      }
    }
    return result;
  },
  getComponentDebugInfo: function () {
    const ruleContext = vact_devtools.storage.ruleDebugger.getRuleContext();
    const result = {};
    if (ruleContext) {
      const routeContext = ruleContext.getRouteContext();
      const scopeId = routeContext.getScopeId();
      const componentParam = getComponentParam(vact_devtools.storage.sandbox);
      const scopeManager = getScopeManager(vact_devtools.storage.sandbox);
      const scope = scopeManager.getScope(scopeId);
      const componentCode = scope.getComponentCode();
      try {
        scopeManager.openScope(scopeId);
        const vars = componentParam.getVariants(componentCode);
        if (vars && !isEmptyObject(vars)) {
          result["变量"] = toJson(vars);
        }
        const options = componentParam.getOptions(componentCode);
        if (options && !isEmptyObject(options)) {
          result["常量"] = toJson(options);
        }
      } finally {
        scopeManager.closeScope();
      }
    }
    return result;
  },
};
//@ts-ignore
window.vact_devtools = vact_devtools;
export { vact_devtools };
