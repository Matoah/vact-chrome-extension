function injectScriptAsync(src) {
  const script = document.createElement("script");
  script.src = src;

  script.onload = function () {
    script.remove();
  };
  document.documentElement.appendChild(script);
}
injectScriptAsync(chrome.runtime.getURL("dist/assets/inject-4604e200.js"));
