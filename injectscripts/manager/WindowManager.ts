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

  widgetMaskElementId = "__$__vactdevTools_widgetMask";

  private _highlight: { instanceId: string; widgetCode: string } | null = null;

  private _getOrCreateWidgetMask() {
    let widgetMask = document.getElementById(this.widgetMaskElementId);
    if (!widgetMask) {
      widgetMask = document.createElement("div");
      widgetMask.id = this.widgetMaskElementId;
      widgetMask.style.position = "absolute";
      widgetMask.style.background = "#a0c5e8";
      widgetMask.style.opacity = "0.7";
      widgetMask.style.border = "1px dashed #6d22cd";
      //widgetMask.style.boxSizing = 'content-box';
      widgetMask.style.display = "none";
      document.body.appendChild(widgetMask);
    }
    return widgetMask;
  }

  private _highlightWidget() {
    if (this._highlight) {
      const { instanceId, widgetCode } = this._highlight;
      const scopeManager = getScopeManager();
      const scope = scopeManager.getScope(instanceId);
      const componentCode = scope.getComponentCode();
      const windowCode = scope.getWindowCode();
      const widgetId = `${componentCode}_$_${windowCode}_$_${widgetCode}_$_${instanceId}`;
      const element = document.getElementById(widgetId);
      if (element) {
        const { left, top, width, height } = element.getBoundingClientRect();
        const widgetMask = this._getOrCreateWidgetMask();
        widgetMask.style.display = "none";
        widgetMask.style.zIndex = "999999";
        widgetMask.style.left = left + "px";
        widgetMask.style.top = top + "px";
        widgetMask.style.width = width + "px";
        widgetMask.style.height = height + "px";
        widgetMask.style.display = "block";
        widgetMask.onmouseover = ()=>{
          widgetMask.style.display = 'none'
        }
      } else {
        this.unHighlightWidget();
      }
      this._highlight = null;
    }else{
      this.unHighlightWidget();
    }
  }

  /**
   * 高亮控件
   * @param params
   */
  highlightWidget(params: { instanceId: string; widgetCode: string }) {
    const { instanceId, widgetCode } = params;
    if (instanceId && widgetCode) {
      if (!this._highlight) {
        setTimeout(() => this._highlightWidget(), 30);
      }
      this._highlight = params;
    }
  }

  /**
   * 移除控件高亮效果
   */
  unHighlightWidget() {
    this._highlight = null;
    const widgetMask = this._getOrCreateWidgetMask();
    widgetMask.style.display = "none";
  }
}

export default WindowManager;
