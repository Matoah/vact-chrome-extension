export function init() {
  //@ts-ignore
  const vact_devtools = window.vact_devtools || {};
  vact_devtools.actions = vact_devtools.actions || {};
  vact_devtools.eventHandlers = vact_devtools.eventHandlers || {};
  /**
   * 触发前端事件
   * @param params
   */
  vact_devtools.actions.fireFrontendEvent = function (params: {
    eventName: "windowInited" | "componentInited";
  }) {
    const eventName = params.eventName;
    //@ts-ignore
    const handlers = window.vact_devtools.eventHandlers[eventName];
    if (handlers && handlers.length > 0) {
      //@ts-ignore
      handlers.forEach((handler) => {
        try {
          handler();
        } catch (e) {}
      });
    }
  };

  vact_devtools.actions.on = function (params: {
    eventName: "windowInited" | "componentInited";
    handler: () => void;
  }) {
    const { eventName, handler } = params;
    //@ts-ignore
    const handlers = window.vact_devtools.eventHandlers[eventName] || [];
    handlers.push(handler);
    //@ts-ignore
    window.vact_devtools.eventHandlers[eventName] = handlers;
  };
  /**
   * 取消监听前端事件
   * @param params
   */
  vact_devtools.actions.un = function (params: {
    eventName: "windowInited" | "componentInited";
    handler: () => void;
  }) {
    const { eventName, handler } = params;
    //@ts-ignore
    const handlers = window.vact_devtools.eventHandlers[eventName] || [];
    const index = handlers.indexOf(handler);
    if (index != -1) {
      handlers.splice(index, 1);
    }
    //@ts-ignore
    window.vact_devtools.eventHandlers[eventName] = handlers;
  };
  //@ts-ignore
  window.vact_devtools = vact_devtools;
}
/**
 * 注册前端事件监听
 * @param params
 */
export function on(params: {
  eventName: "windowInited" | "componentInited";
  handler: () => void;
}) {
  //@ts-ignore
  window.vact_devtools.actions.on(params);
}

/**
 * 取消监听前端事件
 * @param params
 */
export function un(params: {
  eventName: "windowInited" | "componentInited";
  handler: () => void;
}) {
  //@ts-ignore
  window.vact_devtools.actions.un(params);
}
