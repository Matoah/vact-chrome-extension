const pool = {};

let tabId = null;

function uuid() {
  let S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
}

chrome.devtools.inspectedWindow.eval(
  `(function(id){
  window.vact_devtools.methods.setChromeExtensionId(id);
})("${chrome.runtime.id}")`,
  function (res, e) {
    if (e) {
      console.error(e);
    }
  }
);

chrome.runtime.connect({
  name: "VAct-devtool-page",
});

chrome.devtools.panels.create(
  "VAct",
  "/images/logo32.png",
  "/dist/index.html",
  function (extensionPanel) {
    extensionPanel.onShown.addListener(function tmp(panelWindow) {
      extensionPanel.onShown.removeListener(tmp);
      const vact_devtools = panelWindow.vact_devtools || {};
      vact_devtools.sendRequest = function (method, params) {
        const id = uuid();
        return new Promise((resolve, reject) => {
          params = params || {};
          chrome.devtools.inspectedWindow.eval(
            `(function(){
              let res = null;
              try{
                const rs = window.vact_devtools.methods.${method}(${JSON.stringify(
              params
            )});
                res = {
                  success:true,
                  data:rs
                };
              }catch(e){
                res = {
                  success:false,
                  msg:e.message
                };
              }
              return JSON.stringify(res);
            }())`,
            function (result, e) {
              if (e) {
                return reject(e);
              } else {
                result = JSON.parse(result);
                if (result.success) {
                  resolve(result.data);
                } else {
                  reject(new Error(result.msg));
                }
              }
            }
          );
        });
      };
      chrome.runtime.onMessageExternal.addListener(function (
        request,
        sender,
        sendResponse
      ) {
        if (request && request.type == "vact") {
          const action = request.action;
          if (
            panelWindow &&
            panelWindow.vact_devtools &&
            panelWindow.vact_devtools.actions &&
            panelWindow.vact_devtools.actions[action]
          ) {
            const handler = panelWindow.vact_devtools.actions[action];
            handler(request.data, (res) => {
              sendResponse(res);
            });
          }
        }
      });
      panelWindow.vact_devtools = vact_devtools;
    });
  }
);
