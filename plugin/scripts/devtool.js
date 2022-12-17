const pool = {};

let tabId = null;

function uuid() {
  let S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
}

chrome.tabs.query({ active: true }, function (tabs) {
  if (tabs.length > 0) {
    tabId = tabs[0].id;
  }
});

chrome.devtools.panels.create(
  "VAct",
  "/images/logo.png",
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
      panelWindow.vact_devtools = vact_devtools;
    });
  }
);
