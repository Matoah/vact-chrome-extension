import ExtensionManager from '../manager/ExtensionManager';
import { getEventManager } from '../utils/VjsUtils';

function callExtension(params: { data: any; action: string }) {
  return new Promise<null | any>((resolve, reject) => {
    const extensionId = ExtensionManager.getInstance().getExtensionId();
    if (extensionId) {
      try {
        //@ts-ignore
        chrome.runtime.sendMessage(
          extensionId,
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

export function mount() {
  const eventManager = getEventManager();
  eventManager.register({
    event: eventManager.Events.AfterWindowLoad,
    handler: () => {
      try {
        callExtension({
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
