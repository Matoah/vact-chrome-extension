import { indexOf } from '../../utils/BreakpointUtils';
import { isDevtoolOpened } from '../../utils/ConsoleUtils';
import {
  getEventManager,
  getScopeManager,
} from '../../utils/VjsUtils';
import BreakpointManager from '../BreakpointManager';
import ExtensionManager from '../ExtensionManager';
import MethodManager from '../MethodManager';

interface Method {
  componentCode: string;
  methodCode: string;
  windowCode?: string;
}
interface Rule {
  method: Method;
  code: string;
}
class RuleDebuggerManager {

  private static INSTANCE:RuleDebuggerManager|null = null;

  static getInstance(){
    if(RuleDebuggerManager.INSTANCE == null){
      RuleDebuggerManager.INSTANCE = new RuleDebuggerManager();
    }
    return RuleDebuggerManager.INSTANCE;
  }

  port;
  modal;
  nextRule = false;
  debug: Array<{ type: string; rule?: Rule }> = [];
  ruleContext;
  _initModal() {
    if (!this.modal) {
      const modal = document.createElement("div");
      const styles = {
        left: "0px",
        top: "0px",
        width: "100%",
        height: "100%",
        position: "fixed",
        display: "none",
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "999999999",
        opacity: "0.5",
      };
      Object.assign(modal.style, styles);
      this.modal = modal;
      this.modal.innerHTML = `<span style="color:white;font-size:18px;">调试中,请在VAct插件中进行操作...</span>`;
      document.body.appendChild(modal);
    }
  }
  _showModal() {
    this._initModal();
    this.modal.style.display = "flex";
  }
  _hideModal() {
    if (this.modal) {
      this.modal.style.display = "none";
    }
  }
  _isBusinessRule(ruleContext) {
    var ruleInstance = ruleContext.getRuleCfg();
    let result = ruleInstance.hasOwnProperty("transactionType");
    if (result) {
      //判断是否为事件调用规则，如果是则不需要断点，如：按钮点击事件中绑定方法A，按钮点击时，会先执行【执行方法规则】，该规则再执行方法A，此时该执行方法无需断点
      const info = this._getRuleDefineFromRuleContext(ruleContext);
      if (info) {
        const routeContext = ruleContext.getRouteContext();
        const scopeId = routeContext.getScopeId();
        const scope = getScopeManager().getScope(scopeId);
        if (scope && scope.getWindowCode) {
          const logic = MethodManager.getInstance().getFrontendMethod({
            componentCode: info.componentCode,
            windowCode: info.windowCode,
            methodCode: info.methodCode,
          });
          if (logic) {
            const routeScript = logic.ruleSets?.ruleSet?.ruleRoute?._ || "";
            const reg = /<evaluateRule\s+code=['"](.+?)['"]\s+\/>/g;
            let match: RegExpExecArray | null = null;
            while ((match = reg.exec(routeScript)) !== null) {
              if (match[1] == info.ruleCode) {
                return true;
              }
            }
          } else {
            return false;
          }
        }
      }
    }
    return false;
  }
  _getRuleDefineFromRuleContext(ruleContext) {
    const routeContext = ruleContext.getRouteContext();
    const routeCfg = routeContext.getRouteConfig();
    const scopeId = routeContext.getScopeId();
    const scope = getScopeManager().getScope(scopeId);
    const ruleCfg = ruleContext.getRuleCfg();
    if (ruleCfg && routeCfg && scope) {
      const methodCode: string = routeCfg.getCode();
      const ruleCode: string = ruleCfg.instanceCode;
      const componentCode: string = scope.getComponentCode();
      const define: {
        componentCode: string;
        methodCode: string;
        ruleCode: string;
        windowCode?: string;
      } = {
        methodCode,
        componentCode,
        ruleCode,
      };
      if (scope.getWindowCode) {
        define.windowCode = scope.getWindowCode();
      }
      return define;
    }
    return null;
  }
  mount() {
    const eventManager = getEventManager();
    eventManager.register({
      event: eventManager.Events.BeforeRuleExe,
      handler: (ruleContext) => {
        try {
          if (
            this._isBusinessRule(ruleContext) &&
            this._isDebuggerAtBefore(ruleContext)
          ) {
            if (!BreakpointManager.getInstance().isBreakAllRule()) {
              this._clearDebug();
            }
            return this._sendDebug(ruleContext, "breforeRuleExe");
          }
        } catch (e) {
          console.error(e);
        }
      },
    });
    eventManager.register({
      event: eventManager.Events.AfterRuleExe,
      handler: (ruleContext) => {
        try {
          if (
            this._isBusinessRule(ruleContext) &&
            this._isDebuggerAtAfter(ruleContext)
          ) {
            this.debug.pop();
            return this._sendDebug(ruleContext, "afterRuleExe");
          }
        } catch (e) {
          console.error(e);
        }
      },
    });
  }
  _sendDebug(ruleContext, type: "breforeRuleExe" | "afterRuleExe") {
    return new Promise((resolve, reject) => {
      this.ruleContext = ruleContext;
      this._showModal();
      this.callExtension({
        data: {
          type,
          rule: this._getRuleDefineFromRuleContext(ruleContext),
        },
        action: "ruleDebug",
      })
        .then((res: null | { operation: string; rule?: Rule }) => {
          this._hideModal();
          this.ruleContext = null;
          if (res) {
            if (res.operation == "nextRule") {
              this.nextRule = true;
              this.debug.push({
                type: "nextRule",
              });
            } else if (res.operation == "afterRuleExe") {
              this.debug.push({
                type: "afterRuleExe",
                rule: res.rule,
              });
            } else if ((res.operation = "nextBreakpoint")) {
              this.debug.push({
                type: "nextBreakpoint",
              });
            }
          }
          resolve(res);
        })
        .catch((e) => {
          this.ruleContext = null;
          this._hideModal();
          console.error("通信失败！" + e.message);
          resolve(null);
        });
    });
  }
  _clearDebug() {
    if (this.debug && this.debug.length > 0) {
      const type = this.debug[this.debug.length - 1].type;
      if (["nextRule", "nextBreakpoint"].indexOf(type) != -1) {
        this.debug.pop();
      }
    }
  }
  _isDebuggerAtAfter(ruleContext) {
    if (
      isDevtoolOpened() &&
      this.debug &&
      this.debug[this.debug.length - 1] &&
      this.debug[this.debug.length - 1].type == "afterRuleExe"
    ) {
      const rule = this.debug[this.debug.length - 1].rule;
      const define = this._getRuleDefineFromRuleContext(ruleContext);
      if (
        rule &&
        rule.code == define?.ruleCode &&
        rule.method.methodCode == define.methodCode &&
        rule.method.componentCode == define.componentCode &&
        ((!rule.method.windowCode && !define.windowCode) ||
          rule.method.windowCode == define.windowCode)
      ) {
        return true;
      }
    }
    return false;
  }
  _isDebuggerAtBefore(ruleContext) {
    const methods = BreakpointManager.getInstance();
    if (isDevtoolOpened()) {
      if (methods.isIgnoreBreakpoints()) {
        //忽略所有断点
        return false;
      } else if (methods.isBreakAllRule()) {
        //断点所有规则
        return true;
      }
      if (
        this.debug.length > 0 &&
        this.debug[this.debug.length - 1].type !== "afterRuleExe"
      ) {
        const type = this.debug[this.debug.length - 1].type;
        if (type == "nextRule") {
          return true;
        } else if (type == "nextBreakpoint") {
        }
      }
      const breakpoints = methods.getBreakpoints();
      if (breakpoints && breakpoints.length > 0) {
        const define = this._getRuleDefineFromRuleContext(ruleContext);
        if (define) {
          const index = indexOf(
            { enable: true, location: define },
            breakpoints
          );
          if (index != -1) {
            const bp = breakpoints[index];
            return bp.enable;
          }
        }
      }
    }
    return false;
  }
  getRuleContext() {
    return this.ruleContext;
  }
  callExtension(params: {
    data: any;
    action: "ruleDebug" | "refreshTreeMethod";
  }) {
    return new Promise<null | any>((resolve, reject) => {
      try {
        //@ts-ignore
        chrome.runtime.sendMessage(
          ExtensionManager.getInstance().getExtensionId(),
          { data: params.data, action: params.action, type: "vact" },
          function (response: any) {
            //@ts-ignore
            if (chrome.runtime.lastError) {
              resolve(null);
            } else {
              resolve(response);
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }
  sendMessage(params) {
    return new Promise<null | { operation: string }>((resolve, reject) => {
      try {
        //@ts-ignore
        chrome.runtime.sendMessage(
          ExtensionManager.getInstance().getExtensionId(),
          { data: params, action: "ruleDebug", type: "vact" },
          function (response: { operation: string }) {
            //@ts-ignore
            if (chrome.runtime.lastError) {
              resolve(null);
            } else {
              resolve(response);
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default RuleDebuggerManager;
