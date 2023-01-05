import {
  clear,
  genViewTimePoint,
} from './DataManager';
import { register } from './EventObserver';

//@ts-ignore
const vact_devtools = window.vact_devtools || {};
vact_devtools.storage = { vjsUrls: [], sandbox: null };
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
};
//@ts-ignore
window.vact_devtools = vact_devtools;
export { vact_devtools };
