import VActDevTool from './model/VActDevTool';

const vactDevTools = new VActDevTool();
//@ts-ignore
const vact_devtools = window.vact_devtools || {};
vact_devtools.methods = vactDevTools
//@ts-ignore
window.vact_devtools = vact_devtools;
export { vact_devtools };
