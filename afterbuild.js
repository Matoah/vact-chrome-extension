import fs from "fs";
import path from "path";

const assetsDirPath = path.resolve("./plugin/dist/assets");
if (fs.existsSync(assetsDirPath)) {
  const files = fs.readdirSync(assetsDirPath);
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (file.endsWith(".js")) {
      const absPath = path.resolve(assetsDirPath, file);
      const buff = fs.readFileSync(absPath);
      let content = new String(buff);
      if (content.indexOf("vactInjectScriptVersion") != -1) {
        const reg = /export\s+default\s+(.+)?\(\);\n*$/;
        const matcher = content.match(reg);
        if (matcher) {
          content =
            content.substring(0, content.length - matcher[0].length) +
            matcher[1] +
            "();\n";
          fs.writeFileSync(absPath, content);
        }
        const contentScriptPath = path.resolve(
          "./plugin/scripts/contentScript.js"
        );
        const scriptBuff = fs.readFileSync(contentScriptPath);
        let script = new String(scriptBuff);
        script = script.replace(
          /injectScriptAsync\(chrome\.runtime\.getURL\(".+?"\)\);/,
          'injectScriptAsync(chrome.runtime.getURL("dist/assets/' +
            file +
            '"));'
        );
        fs.writeFileSync(contentScriptPath, script);
        break;
      }
    }
  }
}
