function injectScriptAsync(src) {
  const script = document.createElement("script");
  script.src = src;

  script.onload = function () {
    script.remove();
  };
  document.documentElement.appendChild(script);
}
injectScriptAsync(chrome.runtime.getURL("dist/assets/inject-a1f4a50a.js"));
