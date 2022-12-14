import {
  getEventManager,
  getScopeManager,
  indexOf,
} from './Utils';

class RuleDebugger {
  extensionId;
  sandbox;
  port;
  modal;
  nextRule = false;
  setExtensionId(extensionId: string | null) {
    if (extensionId) {
      this.extensionId = extensionId;
    }
    return this;
  }
  setSandbox(sandbox: any) {
    this.sandbox = sandbox;
    return this;
  }
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
        const scope = getScopeManager(this.sandbox).getScope(scopeId);
        if (scope && scope.getWindowCode) {
          //@ts-ignore
          const logic = window.vact_devtools.methods.getFrontendMethod({
            componentCode: info.componentCode,
            windowCode: info.windowCode,
            methodCode: info.methodCode,
          });
          const instance = logic.ruleInstances?.ruleInstance;
          if (instance) {
            return instance.$.instanceCode != info.ruleCode;
          }
        }
      }
    }
    return result;
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
              this._showModal();
              this.sendMessage(this._getRuleDefineFromRuleContext(ruleContext))
                .then((res: null | { operation: string }) => {
                  this._hideModal();
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
                .catch((e) => {
                  this._hideModal();
                  reject(e);
                });
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
