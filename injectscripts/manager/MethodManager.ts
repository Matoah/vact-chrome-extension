import { ExposeMethod } from '../types/Types';
import { getComponentTitle } from '../utils/ComponentUtils';
import { toJson } from '../utils/JsonUtils';
import { isEmptyObject } from '../utils/ObjectUtils';
import { getLogicDefines } from '../utils/Utils';
import {
  getComponentMetadata,
  getComponentRoute,
  getWindowMetadata,
  getWindowRoute,
} from '../utils/VjsUtils';
import { getWindowTitle } from '../utils/WindowUtils';
import RuleDebuggerManager from './private/RuleDebuggerManager';
import SandboxManager from './private/SandboxManager';

class MethodManager implements ExposeMethod{
  private static INSTANCE = new MethodManager();

  static getInstance() {
    return MethodManager.INSTANCE;
  }

  sandboxManager = SandboxManager.getInstance();

  getExposeMethods():undefined|string[]{
    return undefined;
  }

  getUnExposeMethods():undefined|string[]{
    return ["getInstance","_getVjsUrl"]
  }

  /**
   * 获取前端所有方法定义信息
   * @returns
   */
  getFrontendMethods() {
    const result: Array<{
      componentCode: string;
      componentName: string;
      windowCode?: string;
      windowName?: string;
      methodCode: string;
      methodName: string;
    }> = [];
    try {
      const componentRoute = getComponentRoute();
      const componentCodes = componentRoute.getComponents();
      componentCodes.forEach((componentCode) => {
        const componentMetadata = getComponentMetadata(componentCode);
        const componentName = getComponentTitle(componentCode);
        const componentLogics = componentMetadata.logics;
        const logicDefines = getLogicDefines(componentLogics);
        logicDefines.forEach(function ({ methodCode, methodName }) {
          result.push({
            componentCode,
            componentName,
            methodCode,
            methodName,
          });
        });
      });
      const windowRoute = getWindowRoute();
      const winDefines = windowRoute.getWindows();
      winDefines.forEach(({ componentCode, windowCode }) => {
        const windowMetadata = getWindowMetadata(componentCode, windowCode);
        const componentName = getComponentTitle(componentCode);
        const windowName = getWindowTitle(componentCode, windowCode);
        const windowLogics = windowMetadata.logics;
        const logicDefines = getLogicDefines(windowLogics);
        logicDefines.forEach(({ methodCode, methodName }) => {
          result.push({
            componentCode,
            componentName,
            windowCode,
            windowName,
            methodCode,
            methodName,
          });
        });
      });
    } catch (e) {
      return result;
    }
    return result;
  }
  /**
   * 获取指定方法定义
   */
  getFrontendMethod(params: {
    componentCode: string;
    methodCode: string;
    windowCode?: string;
  }) {
    try {
      const { componentCode, methodCode, windowCode } = params;
      let metadata = windowCode
        ? getWindowMetadata(componentCode, windowCode)
        : getComponentMetadata(componentCode);
      //@ts-ignore
      const logics = Array.isArray(metadata.logics.logic)
        ? //@ts-ignore
          metadata.logics.logic
        : //@ts-ignore
          [metadata.logics.logic];
      return logics.find(
        (logic) => logic.ruleSets.ruleSet.$.code == methodCode
      );
    } catch (e) {
      return null;
    }
  }

  /**
     * 获取规则调试信息
     * @returns
     */
  getRuleDebugInfo() {
    const ruleContext = RuleDebuggerManager.getInstance().getRuleContext();
    if (ruleContext) {
      const ruleCfg = ruleContext.getRuleCfg();
      const ruleParams = ruleCfg.inParams;
      return JSON.parse(ruleParams);
    }
    return {};
  }
  //获取方法调试信息
  getMethodDebugInfo() {
    const ruleContext = RuleDebuggerManager.getInstance().getRuleContext();
    const result = {};
    if (ruleContext) {
      const routeContext = ruleContext.getRouteContext();
      const inputs = routeContext.getInputParams();
      if (inputs && !isEmptyObject(inputs)) {
        result["输入"] = toJson(inputs);
      }
      const variants = routeContext.getVariables();
      if (variants && !isEmptyObject(variants)) {
        result["变量"] = toJson(variants);
      }
      const outputs = routeContext.getOutPutParams();
      if (outputs && !isEmptyObject(outputs)) {
        result["输出"] = toJson(variants);
      }
    }
    return result;
  }

}

export default MethodManager;
