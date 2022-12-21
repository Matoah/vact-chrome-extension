import {
  clear,
  genViewTimePoint,
} from './DataManager';
import { register } from './EventObserver';

//@ts-ignore
const vact_devtools = window.vact_devtools || {};
vact_devtools.storage = { vjsUrls: [] };
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
  getVjsContent: function ({ id }) {
    let result = "",
      hasError = false;
    let item = vact_devtools.storage.vjsUrls.find((item) => item.id == id);
    let url = null;
    if (item) {
      url = item.url;
    }
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
};
//@ts-ignore
window.vact_devtools = vact_devtools;
export { vact_devtools };
