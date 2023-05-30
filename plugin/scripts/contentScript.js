function injectScriptAsync(src) {
  const script = document.createElement("script");
  script.src = src;

  script.onload = function () {
    script.remove();
  };
  document.documentElement.appendChild(script);
}
injectScriptAsync(chrome.runtime.getURL("dist/assets/inject-f8c759df.js"));
