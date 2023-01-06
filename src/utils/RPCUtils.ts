import {
  addBreakpoint as addMockBreakpoint,
  clearBreakpoint as clearMockBreakpoint,
  getBreakpoints as getMockBreakpoints,
  getFrontendMethod as getMockFrontendMethod,
  getFrontendMethods as getMockFrontendMethods,
  getMonitorMockDatas,
  getVjsContent as getMockVjsContent,
  getVjsUrl as getMockVjsUrl,
  getVjsUrlList,
  isBreakAllRule as isMockBreakAllRule,
  isIgnoreBreakpoints as isMockIgnoreBreakpoints,
  markBreakAllRule as markMockBreakAllRule,
  markIgnoreBreakpoints as markMockIgnoreBreakpoints,
  removeBreakpoint as removeMockBreakpoint,
  unmarkBreakAllRule as unmarkMockBreakAllRule,
  unmarkIgnoreBreakpoints as unmarkMockIgnoreBreakpoints,
  updateBreakpoint as updateMockBreakpoint,
} from './MockUtils';
import { Breakpoint } from './Types';

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

interface VjsUrl {
  id: string;
  url: string;
}

export function getVjsUrls() {
  return new Promise<VjsUrl[]>((resolve, reject) => {
    //@ts-ignore
    if (window.vact_devtools && window.vact_devtools.sendRequest) {
      //@ts-ignore
      const promise = window.vact_devtools.sendRequest("getVjsUrls", {});
      promise.then(resolve).catch(reject);
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
