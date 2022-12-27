import {
  getMonitorMockDatas,
  getVjsContent as getMockVjsContent,
  getVjsUrlList,
} from "./MockUtils";

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
