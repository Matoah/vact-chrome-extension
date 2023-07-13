import { ExposeMethod } from '../types/Types';
import { getComponentTitle } from '../utils/ComponentUtils';
import { toJson } from '../utils/JsonUtils';
import { isEmptyObject } from '../utils/ObjectUtils';
import {
  getComponentMetadata,
  getComponentParam,
  getScopeManager,
} from '../utils/VjsUtils';
import { getWindowTitle } from '../utils/WindowUtils';
import RuleDebuggerManager from './private/RuleDebuggerManager';

class ComponentManager implements ExposeMethod {
  private static INSTANCE = new ComponentManager();

  /**
   * 获取实例
   * @returns
   */
  static getInstance() {
    return this.INSTANCE;
  }

  getExposeMethods(): undefined | string[] {
    return undefined;
  }

  getUnExposeMethods(): undefined | string[] {
    return ["getInstance", "_getVjsUrl"];
  }

  /**
   * 获取构件配置信息（元数据）
   * @param params
   * @returns
   */
  getComponentMetadata(params: { componentCode: string }) {
    const { componentCode } = params;
    return getComponentMetadata(componentCode);
  }

  /**
   * 获取构件调试信息
   */
  getComponentDebugInfo() {
    const ruleContext = RuleDebuggerManager.getInstance().getRuleContext();
    const result = {};
    if (ruleContext) {
      const routeContext = ruleContext.getRouteContext();
      const scopeId = routeContext.getScopeId();
      return this.getComponentDatas({ instanceId: scopeId });
    }
    return result;
  }
  /**
   * 获取构件数据
   * @param instanceId
   * @returns
   */
  getComponentDatas(params: {
    instanceId: string;
    keepDSContructor?: boolean;
  }) {
    const { instanceId, keepDSContructor } = params;
    const result = {};
    const componentParam = getComponentParam();
    const scopeManager = getScopeManager();
    const scope = scopeManager.getScope(instanceId);
    const componentCode = scope.getComponentCode();
    try {
      scopeManager.openScope(instanceId);
      const vars = componentParam.getVariants(componentCode);
      if (vars && !isEmptyObject(vars)) {
        result["变量"] = toJson(vars, keepDSContructor);
      }
      const options = componentParam.getOptions(componentCode);
      if (options && !isEmptyObject(options)) {
        result["常量"] = toJson(options, keepDSContructor);
      }
    } finally {
      scopeManager.closeScope();
    }
    return result;
  }

  /**
   * 获取前端构件、窗体实例树
   * @returns
   */
  getFrontendScopes() {
    const scopeManager = getScopeManager();
    const scopes = scopeManager.getAll();
    const result: Array<{
      type: "window" | "component";
      instanceId: string;
      componentCode: string;
      title: string;
      pId: string;
      windowCode?: string;
    }> = [];
    scopes.forEach((scope) => {
      const instanceId: string = scope.getInstanceId();
      const componentCode = scope.getComponentCode();
      const type = scopeManager.isWindowScope(instanceId)
        ? "window"
        : "component";
      if (type == "window") {
        const windowCode = scope.getWindowCode();
        const title = getWindowTitle(componentCode, windowCode);
        const pId = scopeManager.getParentScopeId(instanceId);
        result.push({
          type: "window",
          instanceId,
          componentCode,
          title,
          pId,
          windowCode,
        });
      } else {
        const title = getComponentTitle(componentCode);
        const pId = scopeManager.getParentScopeId(instanceId);
        result.push({
          type: "component",
          instanceId,
          componentCode,
          title,
          pId,
        });
      }
    });
    return result;
  }
}

export default ComponentManager;
