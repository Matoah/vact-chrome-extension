import {
  addBreakpoint as addMockBreakpoint,
  clearBreakpoint as clearMockBreakpoint,
  getBreakpoints as getMockBreakpoints,
  getComponentDebugInfo as getMockComponentDebugInfo,
  getConsoleSetting as getMockConsoleSetting,
  getFrontendMethod as getMockFrontendMethod,
  getFrontendMethods as getMockFrontendMethods,
  getFrontendScopes as getMockFrontendScopes,
  getMethodDebugInfo as getMockMethodDebugInfo,
  getMonitorMockDatas,
  getRuleDebugInfo as getMockRuleDebugInfo,
  getVjsContent as getMockVjsContent,
  getVjsUrl as getMockVjsUrl,
  getVjsUrlList,
  getWindowDebugInfo as getMockWindowDebugInfo,
  isBreakAllRule as isMockBreakAllRule,
  isIgnoreBreakpoints as isMockIgnoreBreakpoints,
  markBreakAllRule as markMockBreakAllRule,
  markIgnoreBreakpoints as markMockIgnoreBreakpoints,
  removeBreakpoint as removeMockBreakpoint,
  setConsoleSetting as setMockConsoleSetting,
  unmarkBreakAllRule as unmarkMockBreakAllRule,
  unmarkIgnoreBreakpoints as unmarkMockIgnoreBreakpoints,
  updateBreakpoint as updateMockBreakpoint,
} from './MockUtils';
import {
  Breakpoint,
  ConsoleSetting,
  FrontendScope,
  VjsUrl,
} from './Types';

export function isMonitored() {
  return new Promise<boolean>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("isMonitored", {});
      promise
        .then((monitored: boolean) => {
          resolve(monitored);
        })
        .catch((e: Error) => {
          reject(e);
        });
    }
  });
}

export function markMonitored() {
  return new Promise<void>((resolve, reject) => {
    //@ts-ignore
    window?.vact_devtools?.sendRequest("markMonitored", {});
    resolve();
  });
}

export function markUnMonitored() {
  return new Promise<void>((resolve, reject) => {
    //@ts-ignore
    window?.vact_devtools?.sendRequest("markUnMonitored", {});
    resolve();
  });
}

export function clearMonitorData() {
  return new Promise<void>((resolve, reject) => {
    //@ts-ignore
    const promise = window?.vact_devtools?.sendRequest("clearMonitorData", {});
    if (promise) {
      promise
        .then(() => {
          resolve();
        })
        .catch(reject);
    } else {
      resolve();
    }
  });
}

export function getMonitorDatas(params: any) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "getMonitorDatas",
        params
      );
      promise.then(resolve).catch(reject);
    } else {
      const datas = getMonitorMockDatas();
      resolve(datas);
    }
  });
}

export function getVjsContent(id: string) {
  return new Promise<string>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getVjsContent", {
        id: id,
      });
      promise.then(resolve).catch(reject);
    } else {
      resolve(getMockVjsContent());
    }
  });
}

export function getVjsUrls() {
  return new Promise<VjsUrl[]>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getVjsUrls", {});
      promise
        .then((urls: Array<{ id: string; url: string }>) => {
          const vjsUrls: VjsUrl[] = [];
          if (Array.isArray(urls)) {
            //@ts-ignore
            window.chrome.devtools.network.getHAR((log) => {
              const entries = log.entries;
              urls.forEach((vjs) => {
                const url = vjs.url;
                //@ts-ignore
                const vjsFilename: string = url
                  .split("?")[0]
                  .split(/[\\/]/)
                  .pop();
                let notFound = true;
                for (let index = 0; index < entries.length; index++) {
                  const entry: {
                    request: { url: string };
                    response: { content: { size: number } };
                  } = entries[index];
                  const { request, response } = entry;
                  const requestUrl = request.url;
                  if (requestUrl.indexOf(vjsFilename) != -1) {
                    vjsUrls.push({
                      id: vjs.id,
                      url: vjs.url,
                      size: response.content.size,
                    });
                    notFound = false;
                    break;
                  }
                }
                if (notFound) {
                  vjsUrls.push({
                    id: vjs.id,
                    url: vjs.url,
                    size: -1,
                  });
                }
              });
              resolve(vjsUrls);
            });
          } else {
            resolve(vjsUrls);
          }
        })
        .catch(reject);
    } else {
      resolve(getVjsUrlList());
    }
  });
}

export function getVjsUrl(id: string) {
  return new Promise<string>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getVjsUrl", { id });
      promise.then(resolve).catch(reject);
    } else {
      resolve(getMockVjsUrl());
    }
  });
}

export function getFrontendMethods() {
  return new Promise<
    Array<{
      componentCode: string;
      componentName: string;
      methodCode: string;
      methodName: string;
      windowCode?: string;
      windowName?: string;
    }>
  >((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "getFrontendMethods",
        {}
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(getMockFrontendMethods());
    }
  });
}

export function getFrontendMethod(params: {
  componentCode: string;
  methodCode: string;
  windowCode?: string;
}) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "getFrontendMethod",
        params
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(getMockFrontendMethod());
    }
  });
}

export function addBreakpoint(breakpoint: Breakpoint) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "addBreakpoint",
        breakpoint
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(addMockBreakpoint(breakpoint));
    }
  });
}

export function updateBreakpoint(breakpoint: Breakpoint) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "updateBreakpoint",
        breakpoint
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(updateMockBreakpoint(breakpoint));
    }
  });
}

export function removeBreakpoint(breakpoint: Breakpoint | Breakpoint[]) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "removeBreakpoint",
        breakpoint
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(removeMockBreakpoint(breakpoint));
    }
  });
}

export function getBreakpoints() {
  return new Promise<Breakpoint[]>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getBreakpoints", {});
      promise.then(resolve).catch(reject);
    } else {
      resolve(getMockBreakpoints());
    }
  });
}

export function clearBreakpoint() {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("clearBreakpoint", {});
      promise.then(resolve).catch(reject);
    } else {
      resolve(clearMockBreakpoint());
    }
  });
}

export function markBreakAllRule() {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("markBreakAllRule", {});
      promise.then(resolve).catch(reject);
    } else {
      resolve(markMockBreakAllRule());
    }
  });
}

export function isBreakAllRule() {
  return new Promise<boolean>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("isBreakAllRule", {});
      promise.then(resolve).catch(reject);
    } else {
      resolve(isMockBreakAllRule());
    }
  });
}

export function unmarkBreakAllRule() {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "unmarkBreakAllRule",
        {}
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(unmarkMockBreakAllRule());
    }
  });
}

export function markIgnoreBreakpoints() {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "markIgnoreBreakpoints",
        {}
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(markMockIgnoreBreakpoints());
    }
  });
}

export function unmarkIgnoreBreakpoints() {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "unmarkIgnoreBreakpoints",
        {}
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(unmarkMockIgnoreBreakpoints());
    }
  });
}

export function isIgnoreBreakpoints() {
  return new Promise<boolean>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "isIgnoreBreakpoints",
        {}
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(isMockIgnoreBreakpoints());
    }
  });
}

export function printToWebPageConsole(msg: string) {
  return new Promise<boolean>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("print", { msg });
      promise.then(resolve).catch(reject);
    } else {
      console.log(msg);
    }
  });
}

export function getMethodDebugInfo() {
  return new Promise<{} | null>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "getMethodDebugInfo",
        {}
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(getMockMethodDebugInfo());
    }
  });
}

export function getWindowDebugInfo() {
  return new Promise<{} | null>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "getWindowDebugInfo",
        {}
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(getMockWindowDebugInfo());
    }
  });
}

export function getComponentDebugInfo() {
  return new Promise<{} | null>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "getComponentDebugInfo",
        {}
      );
      promise.then(resolve).catch(reject);
    } else {
      resolve(getMockComponentDebugInfo());
    }
  });
}

export function getRuleDebugInfo() {
  return new Promise<{} | null>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getRuleDebugInfo", {});
      promise.then(resolve).catch(reject);
    } else {
      resolve(getMockRuleDebugInfo());
    }
  });
}

export function getFrontendScopes() {
  return new Promise<Array<FrontendScope>>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getFrontendScopes", {});
      promise.then(resolve).catch(reject);
    } else {
      resolve(getMockFrontendScopes());
    }
  });
}

export function getWindowDatas(instanceId: string) {
  return new Promise<{} | null>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getWindowDatas", {
        instanceId,
        keepDSContructor: true,
      });
      promise.then(resolve).catch(reject);
    } else {
      resolve({
        输入: {
          windowCode: "gz_zdys_Task20190612088",
          componentCode: "v_gz_new",
          workspaceKey: "",
        },
        控件: {
          __$vactType: "error",
          message:
            "Converting circular structure to JSON\\n    --> starting at object with constructor 'HTMLDivElement'\\n    |     property '__reactContainer$dvpewyrngvh' -> object with constructor 'Uj'\\n    |     property 'stateNode' -> object with constructor 'Wj'\\n    --- property 'containerInfo' closes the circle",
        },
        实体: {
          autotest_gz02_Task20190612088: {
            metadata: {
              model: [
                {
                  datasourceName: "autotest_gz02_Task20190612088",
                  fields: [
                    {
                      code: "id",
                      name: "id",
                      length: 64,
                      type: "char",
                      precision: 0,
                      defaultValue: null,
                      expression: "",
                    },
                    {
                      code: "colText",
                      name: "colText",
                      length: 1000,
                      type: "text",
                      precision: 0,
                      defaultValue: null,
                      expression: "",
                    },
                    {
                      code: "colDouble",
                      name: "colDouble",
                      length: 6,
                      type: "number",
                      precision: 4,
                      defaultValue: null,
                      expression: "",
                    },
                    {
                      code: "colBoolean",
                      name: "colBoolean",
                      length: 1,
                      type: "boolean",
                      precision: 0,
                      defaultValue: false,
                      expression: "",
                    },
                    {
                      code: "colDate",
                      name: "colDate",
                      length: 255,
                      type: "date",
                      precision: 0,
                      defaultValue: null,
                      expression: "",
                    },
                    {
                      code: "colDateTime",
                      name: "colDateTime",
                      length: 255,
                      type: "longDate",
                      precision: 0,
                      defaultValue: null,
                      expression: "",
                    },
                    {
                      code: "colInt",
                      name: "colInt",
                      length: 3,
                      type: "integer",
                      precision: 0,
                      defaultValue: null,
                      expression: "",
                    },
                    {
                      code: "wenben",
                      name: "wenben",
                      length: 255,
                      type: "char",
                      precision: 0,
                      defaultValue: null,
                      expression: "",
                    },
                  ],
                },
              ],
            },
            datas: {
              values: [
                {
                  id: "43778f22e1f04892b3ab7c0132afd017",
                  colText: "默认长文本",
                  colDouble: 2.3,
                  colBoolean: true,
                  colDate: "2017-06-06",
                  colDateTime: "2019-06-18 08:56:09",
                  colInt: 1,
                  wenben: null,
                },
                {
                  id: "a95d7ecba5a244198828fac9c5b3ec14",
                  colText: "默认长文本",
                  colDouble: 2.3,
                  colBoolean: true,
                  colDate: "2016-12-30",
                  colDateTime: "2016-12-30 09:01:55",
                  colInt: 1,
                  wenben: null,
                },
                {
                  id: "ab9ef94c9a564e6eb8ac9a12a18ee6cc",
                  colText: "默认长文本",
                  colDouble: 7.8,
                  colBoolean: true,
                  colDate: "2016-12-30",
                  colDateTime: "2016-12-30 09:01:55",
                  colInt: 1,
                  wenben: null,
                },
                {
                  id: "cd87f3017a7d45248f67d6e353887fd9",
                  colText: "默认长文本",
                  colDouble: 2.3,
                  colBoolean: true,
                  colDate: "2016-12-30",
                  colDateTime: "2016-12-30 09:01:55",
                  colInt: 1,
                  wenben: null,
                },
              ],
              recordCount: 4,
            },
          },
        },
      });
    }
  });
}

export function getComponentDatas(instanceId: string) {
  return new Promise<{} | null>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getComponentDatas", {
        instanceId,
        keepDSContructor: true,
      });
      promise.then(resolve).catch(reject);
    } else {
      resolve({});
    }
  });
}

export function getWindowMetadata(componentCode: string, windowCode: string) {
  return new Promise<{} | null>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getWindowMetadata", {
        componentCode,
        windowCode,
      });
      promise
        .then((rs: any) => {
          resolve(rs || {});
        })
        .catch(reject);
    } else {
      resolve({});
    }
  });
}

export function getComponentMetadata(componentCode: string) {
  return new Promise<{} | null>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getComponentMetadata", {
        componentCode,
      });
      promise
        .then((rs: any) => {
          resolve(rs || {});
        })
        .catch(reject);
    } else {
      resolve({});
    }
  });
}

export function setConsoleSetting(consoleSetting: ConsoleSetting) {
  return new Promise<void>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest(
        "setConsoleSetting",
        consoleSetting
      );
      promise
        .then((rs: any) => {
          resolve(rs || {});
        })
        .catch(reject);
    } else {
      resolve(setMockConsoleSetting(consoleSetting));
    }
  });
}

export function getConsoleSetting(){
  return new Promise<ConsoleSetting>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getConsoleSetting", {});
      promise
        .then((rs: any) => {
          resolve(rs || {});
        })
        .catch(reject);
    } else {
      resolve(getMockConsoleSetting());
    }
  });
}
