import { ExposeMethod } from '../types/Types';
import { toJson } from '../utils/JsonUtils';
import { isEmptyObject } from '../utils/ObjectUtils';
import {
  getDatasourceManager,
  getScopeManager,
  getWindowMetadata,
  getWindowParam,
} from '../utils/VjsUtils';
import RuleDebuggerManager from './private/RuleDebuggerManager';

class WindowManager implements ExposeMethod {
  private static INSTANCE = new WindowManager();

  /**
   * 获取实例
   * @returns
   */
  static getInstance() {
    return this.INSTANCE;
  }

  /**
   * 获取窗体调试信息
   */
  getWindowDebugInfo() {
    const ruleContext = RuleDebuggerManager.getInstance().getRuleContext();
    const result = {};
    if (ruleContext) {
      const routeContext = ruleContext.getRouteContext();
      const scopeId = routeContext.getScopeId();
      return this.getWindowDatas({ instanceId: scopeId });
    }
    return result;
  }
  /**
   * 获取窗体数据
   * @param instanceId
   * @returns
   */
  getWindowDatas(params: { instanceId: string; keepDSContructor?: boolean }) {
    const { instanceId, keepDSContructor } = params;
    const result = {};
    const scopeManager = getScopeManager();
    const windowParam = getWindowParam();
    const datasourceManager = getDatasourceManager();
    try {
      scopeManager.openScope(instanceId);
      const inputs = windowParam.getInputs();
      if (inputs && !isEmptyObject(inputs)) {
        result["输入"] = toJson(inputs, keepDSContructor);
      }
      const outputs = windowParam.getOutputs();
      if (outputs && !isEmptyObject(outputs)) {
        result["输出"] = toJson(outputs, keepDSContructor);
      }
      const windowScope = scopeManager.getScope(instanceId);
      result["控件"] = toJson(windowScope.get("windowWidgetMetadata"));
      const datasources = datasourceManager.getAll();
      if (datasources && datasources.length > 0) {
        const dsMap = {};
        for (let i = 0; i < datasources.length; i++) {
          const ds = datasources[i];
          const metadata = ds.getMetadata();
          const key = metadata.getDatasourceName
            ? `${metadata.getDatasourceName()}`
            : `${metadata.getCode()}`;
          dsMap[key] = ds; //toVal(ds,keepDSContructor);
        }
        result["实体"] = toJson(dsMap, keepDSContructor);
      }
    } finally {
      scopeManager.closeScope();
    }
    return result;
  }

  /**
   * 获取窗体配置信息（元数据）
   * @param params
   * @returns
   */
  getWindowMetadata(params: { componentCode: string; windowCode: string }) {
    const { componentCode, windowCode } = params;
    return getWindowMetadata(componentCode, windowCode);
  }
}

export default WindowManager;
