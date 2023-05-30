import { getEventManager } from './Utils';

class FrontendOberser {
  extensionId: string;

  sandbox: any;

  mount(extensionId: string | null, sandbox: any) {
    if (extensionId) {
      this.extensionId = extensionId;
    }
    this.sandbox = sandbox;
    const eventManager = getEventManager(this.sandbox);
    eventManager.register({
      event: eventManager.Events.AfterWindowLoad,
      handler: () => {
        try {
          this.callExtension({
            data: { eventName: "windowInited" },
            action: "fireFrontendEvent",
          });
        } catch (e) {
          console.error(e);
        }
      },
    });
    eventManager.register({
      event: eventManager.Events.AfterComponentLoad,
      handler: () => {
        try {
          this.callExtension({
            data: { eventName: "componentInited" },
            action: "fireFrontendEvent",
          });
        } catch (e) {
          console.error(e);
        }
      },
    });
  }
  callExtension(params: { data: any; action: string }) {
    return new Promise<null | any>((resolve, reject) => {
      if (this.extensionId && this.sandbox) {
        try {
          //@ts-ignore
          chrome.runtime.sendMessage(
            this.extensionId,
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
      } else {
        resolve(null);
      }
    });
  }
}

export default FrontendOberser;
