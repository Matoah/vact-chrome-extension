import { ExposeMethod } from '../types/Types';
import LocalStorageManager from './private/LocalStorageManager';

type EventHandler = (manager: ExtensionManager) => void;

enum Events {
  /**
   * VAct开发者工具标识id改变
   */
  ExtensionIdChanged,
}
/**
 * VAct开发者工具管理器
 */
class ExtensionManager implements ExposeMethod {
  private static INSTANCE = new ExtensionManager();

  /**
   * 获取实例
   * @returns
   */
  static getInstance() {
    return ExtensionManager.INSTANCE;
  }

  Events = Events;

  private eventHandlers: { [key: string]: Array<EventHandler> } = {};

  /**
   * VAct开发者工具标识id
   */
  extensionId: null | string = null;

  constructor() {
    const manager = LocalStorageManager.getInstance();
    this.extensionId = manager.get(manager.KEYS.extensionId);
  }

  /**
   * 获取VAct开发者工具标识id
   * @returns
   */
  getExtensionId() {
    return this.extensionId;
  }

  /**
   * 设置VAct开发者工具标识id
   * @param extensionId
   */
  setExtensionId(extensionId: string) {
    this.extensionId = extensionId;
    const manager = LocalStorageManager.getInstance();
    manager.set(manager.KEYS.extensionId, extensionId);
    this._fire(this.Events.ExtensionIdChanged);
  }

  /**
   * 触发事件
   * @param event
   */
  private _fire(event: Events) {
    const handlers = this.eventHandlers[event];
    if (handlers && handlers.length > 0) {
      handlers.forEach((handler) => {
        try {
          handler(this);
        } catch (e) {}
      });
    }
  }

  /**
   * 注册事件回调
   * @param event
   * @param handler
   */
  on(event: Events, handler: EventHandler) {
    const handlers = this.eventHandlers[event] || [];
    handlers.push(handler);
    this.eventHandlers[event] = handlers;
  }

  /**
   * 取消注册事件回调
   * @param handler
   */
  un(event: Events, handler: EventHandler) {
    const handlers = this.eventHandlers[event];
    if (handlers && handlers.length > 0) {
      for (let index = 0; index < handlers.length; index++) {
        const hd = handlers[index];
        if (hd === handler) {
          handlers.splice(index, 1);
          break;
        }
      }
    }
  }

  /**
   * 设置开发者工具标识id
   */
  setChromeExtensionId(extensionId: string) {
    this.setExtensionId(extensionId);
  }

}

export default ExtensionManager;
