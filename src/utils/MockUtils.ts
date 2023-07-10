import {
  Breakpoint,
  ConsoleSetting,
  FrontendScope,
} from './Types';

export function getVjsContent() {
  return "";
}

export function getMonitorMockDatas() {
  return [];
}

export function getVjsUrlList() {
  return [];
}

export function getVjsUrl() {
  return "";
}

export function getFrontendMethods() {
  return [];
}

export function getFrontendMethod() {
  return null;
}

let breakpoints: Breakpoint[] = [];

export function addBreakpoint(breakpoint: Breakpoint) {
  breakpoints.push(breakpoint);
}

const indexOf = function (breakpoint: Breakpoint, breakpoints: Breakpoint[]) {
  for (let index = 0; index < breakpoints.length; index++) {
    const bp = breakpoints[index];
    if (
      bp.location.componentCode == breakpoint.location.componentCode &&
      bp.location.methodCode == breakpoint.location.methodCode &&
      bp.location.ruleCode == breakpoint.location.ruleCode
    ) {
      if (
        typeof bp.location.windowCode == typeof breakpoint.location.windowCode
      ) {
        return index;
      }
    }
  }
  return -1;
};

export function removeBreakpoint(breakpoint: Breakpoint | Breakpoint[]) {
  const storage: Breakpoint[] = [];
  const removed: Breakpoint[] = Array.isArray(breakpoint)
    ? breakpoint
    : [breakpoint];
  breakpoints.forEach((bp) => {
    if (indexOf(bp, removed) == -1) {
      storage.push(bp);
    }
  });
  breakpoints = storage;
}

export function updateBreakpoint(breakpoint: Breakpoint) {
  for (let index = 0; index < breakpoints.length; index++) {
    const bp = breakpoints[index];
    if (
      bp.location.componentCode == breakpoint.location.componentCode &&
      bp.location.methodCode == breakpoint.location.methodCode &&
      bp.location.ruleCode == breakpoint.location.ruleCode
    ) {
      if (
        typeof bp.location.windowCode == typeof breakpoint.location.windowCode
      ) {
        breakpoints[index] = breakpoint;
      }
    }
  }
}

export function getBreakpoints() {
  return breakpoints.concat([]);
}

let breakAllRule = false;

export function clearBreakpoint() {
  breakpoints = [];
  breakAllRule = false;
}

export function markBreakAllRule() {
  breakAllRule = true;
}

export function isBreakAllRule() {
  return breakAllRule;
}

export function unmarkBreakAllRule() {
  breakAllRule = false;
}

let ignorebreakpoints = false;

export function markIgnoreBreakpoints() {
  ignorebreakpoints = true;
}

export function unmarkIgnoreBreakpoints() {
  ignorebreakpoints = false;
}

export function isIgnoreBreakpoints() {
  return ignorebreakpoints;
}

export function getRulesetDebugInfo() {
  return null;
}

export function getWindowDebugInfo() {
  return null;
}

export function getRuleDebugInfo() {
  return null;
}

export function getComponentDebugInfo() {
  return null;
}

export function getFrontendScopes(): Array<FrontendScope> {
  return [
    {
      type: "window",
      instanceId: "514eedd1959d5d17b65a04d2eddf3270",
      componentCode: "i18n_test_unit",
      title: "表单1",
      windowCode: "form1",
      pId: null,
    },
    {
      type: "component",
      instanceId: "514eedd1959d5d17b65a04d2eddf3340",
      componentCode: "i18n_test_unit",
      title: "国际化单元测试场景",
      pId: "514eedd1959d5d17b65a04d2eddf3270",
    },
    {
      type: "component",
      instanceId: "514eedd1959d5d17b65a04d2eddf3341",
      componentCode: "skin_test_unit",
      title: "皮肤测试场景",
      pId: "514eedd1959d5d17b65a04d2eddf3270",
    },
  ];
}

let localConsoleSetting:ConsoleSetting|null = null;

export function getConsoleSetting(){
  return localConsoleSetting||{}
}

export function setConsoleSetting(consoleSetting:ConsoleSetting){
  localConsoleSetting = consoleSetting;
}
