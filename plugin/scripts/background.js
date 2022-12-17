const vact_devtool_ports = [];

function uuid() {
  let S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
}

function registerPort(port) {
  const portName = port.name;
  if (portName == "vact") {
    vact_devtool_ports.push(port);
    port.onDisconnect.addListener(() => {
      const i = vact_devtool_ports.indexOf(port);
      if (i !== -1) vact_devtool_ports.splice(i, 1);
    });
  } else {
    return false;
  }
  return true;
}

chrome.runtime.onConnect.addListener(function (port) {
  if (registerPort(port)) {
    port.onMessage.addListener(function (msg) {
      let params = {};
      try {
        params = JSON.parse(msg);
      } catch (e) {}
      const { method, id, tabId } = params;
      chrome.devtools.inspectedWindow.eval(
        `window.vact_devtools.methods.${method}()`,
        function (result, isException) {
          if (isException) {
            console.log("the page is not using jQuery");
          } else {
            console.log("The page is using jQuery v" + result);
          }
        }
      );
      /*const promise = chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        function: function () {
          return new Promise((resolve, reject) => {
            console.log("1111111111111111111");
            debugger;
            console.log("window.vact_devtools:" + window.vact_devtools);
            if (window.vact_devtools && window.vact_devtools.methods) {
              const methods = win.vact_devtools.methods;
              const handler = methods[method];
              if (handler) {
                handler(params.params)
                  .then((data) => {
                    resolve(data);
                  })
                  .catch((e) => {
                    reject(e);
                  });
              } else {
                reject(`不存在${method}方法，无法执行！`);
              }
            } else {
              reject(`当前页面非VAct页面`);
            }
          });
        },
      });
      promise
        .then((data) => {
          notifyDevtools(
            JSON.stringify({
              id,
              success: true,
              data: data,
            })
          );
        })
        .catch((e) => {
          notifyDevtools(
            JSON.stringify({
              id,
              success: false,
              msg: e.message,
            })
          );
        });*/
    });
  }
});
function notifyDevtools(msg) {
  vact_devtool_ports.forEach(function (port) {
    port.postMessage(msg);
  });
}
