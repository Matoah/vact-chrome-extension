import {
  clear,
  genViewTimePoint,
} from './DataManager';
import { register } from './EventObserver';
import RuleDebugger from './RuleDebugger';
import { Breakpoint } from './Types';
import { indexOf } from './Utils';

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
        const winParam = vact_devtools.storage.sandbox.getService(
          "v_act_vjs_framework_extension_platform_data_storage_schema_param"
        ).WindowParam;
        const defines = winParam.getWindowDefines();
        defines.forEach(function ({ componentCode, windowCode }) {
          const componentMetadata = vact_devtools.storage.sandbox
            .getService(
              `vact.vjs.framework.extension.platform.init.view.schema.component.${componentCode}`
            )
            .default.returnComponentSchema();
          const windowMetadata = vact_devtools.storage.sandbox
            .getService(
              `vact.vjs.framework.extension.platform.init.view.schema.window.${componentCode}.${windowCode}`
            )
            .getWindowDefine()
            .getWindowMetadata();
          const componentName = componentMetadata.$.name;
          let componentLogics = componentMetadata.logics;
          if (typeof componentLogics != "string") {
            componentLogics = Array.isArray(componentLogics.logic)
              ? componentLogics.logic
              : [componentLogics.logic];
            componentLogics.forEach((logic) => {
              const ruleSet = logic.ruleSets.ruleSet.$;
              result.push({
                componentCode,
                componentName,
                methodCode: ruleSet.code,
                methodName: ruleSet.name,
              });
            });
          }
          let windowLogics = windowMetadata.logics;
          if (typeof windowLogics != "string") {
            const windowName = windowMetadata.$.name;
            windowLogics = Array.isArray(windowLogics.logic)
              ? windowLogics.logic
              : [windowLogics.logic];
            windowLogics.forEach((logic) => {
              const ruleSet = logic.ruleSets.ruleSet.$;
              result.push({
                componentCode,
                componentName,
                windowCode,
                windowName,
                methodCode: ruleSet.code,
                methodName: ruleSet.name,
              });
            });
          }
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
};
//@ts-ignore
window.vact_devtools = vact_devtools;
export { vact_devtools };
