import {
  getEventManager,
  getScopeManager,
  indexOf,
} from './Utils';

class RuleDebugger {
  extensionId;
  sandbox;
  port;
  nextRule = false;
  setExtensionId(extensionId: string) {
    this.extensionId = extensionId;
    return this;
  }
  setSandbox(sandbox: any) {
    this.sandbox = sandbox;
    return this;
  }
  _isBusinessRule(ruleContext) {
    var ruleInstance = ruleContext.getRuleCfg();
    return ruleInstance.hasOwnProperty("transactionType");
  }
  _getRuleDefineFromRuleContext(ruleContext) {
    const routeContext = ruleContext.getRouteContext();
    const routeCfg = routeContext.getRouteConfig();
    const scopeId = routeContext.getScopeId();
    const scope = getScopeManager(this.sandbox).getScope(scopeId);
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
    if (this.sandbox) {
      const eventManager = getEventManager(this.sandbox);
      eventManager.register({
        event: eventManager.Events.BeforeRuleExe,
        handler: (ruleContext) => {
          if (
            this._isBusinessRule(ruleContext) &&
            this._isDebugger(ruleContext)
          ) {
            return new Promise((resolve, reject) => {
              this.sendMessage(this._getRuleDefineFromRuleContext(ruleContext))
                .then((res: null | { operation: string }) => {
                  if (res) {
                    if (res.operation == "nextRule") {
                      this.nextRule = true;
                    }
                    resolve(null);
                  } else {
                    resolve(null);
                  }
                  resolve(res);
                })
                .catch(reject);
            });
          }
        },
      });
    } else {
      throw Error("无法挂载规则调试器！原因：未设置sandbox");
    }
  }
  _isDebugger(ruleContext) {
    //@ts-ignore
    const methods = window.vact_devtools.methods;
    if (this.extensionId) {
      if (this.nextRule) {
        return true;
      } else if (methods.isIgnoreBreakpoints()) {
        //忽略所有断点
        return false;
      } else if (methods.isBreakAllRule()) {
        //断点所有规则
        return true;
      } else {
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
    }
    return false;
  }
  sendMessage(params) {
    return new Promise<null | { operation: string }>((resolve, reject) => {
      if (this.extensionId && this.sandbox) {
        try {
          //@ts-ignore
          chrome.runtime.sendMessage(
            this.extensionId,
            { data: params, action: "ruleDebug", type: "vact" },
            function (response: { operation: string }) {
              resolve(response);
            }
          );
        } catch (e) {
          reject(e);
        }
      } else {
        resolve(null);
      }
    });
  }
}

export default RuleDebugger;
