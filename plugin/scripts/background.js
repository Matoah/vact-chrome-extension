/*const vact_devtool_ports = [];

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
    });
  }
});
function notifyDevtools(msg) {
  vact_devtool_ports.forEach(function (port) {
    port.postMessage(msg);
  });
}

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name == "VAct-devtool-page") {
    console.log("onConnect" + new Date());
    port.onDisconnect.addListener(function (port) {
      chrome.devtools.inspectedWindow.eval(
        `(function(){console.log('onDisconnect')})()`
      );
    });
  }
});*/
