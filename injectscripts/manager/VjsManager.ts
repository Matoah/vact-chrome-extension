import { ExposeMethod } from '../types/Types';
import SandboxManager from './private/SandboxManager';

type EventHandler = (manager:VjsManager)=>void;

enum Events{
  /**
   * Vjs初始化完成
   */
  VjsInited
}

class VjsManager implements ExposeMethod{

  private static INSTANCE = new VjsManager();

  /**
   * 获取实例
   * @returns
   */
  static getInstance() {
    return this.INSTANCE;
  }

  getExposeMethods():undefined|string[]{
    return undefined;
  }

  getUnExposeMethods():undefined|string[]{
    return ["getInstance","_getVjsUrl"]
  }

  vjsUrls: Array<{
    //vjs请求标识id
    id: string;
    //vjs请求链接
    url: string;
  }> = [];

  private eventHandlers:{[key:string]:Array<EventHandler>} = {};

  Events = Events;

  /**
   * 设置vjs请求链接
   */
  putVjsUrl(params: { id: string; url: string }) {
    this.vjsUrls.push(params);
  }

  /**
   * 获取所有vjs请求
   * @returns
   */
  getVjsUrls() {
    return this.vjsUrls;
  }

  private _getVjsUrl(id: string) {
    let item = this.vjsUrls.find((item) => item.id == id);
    let url: null | string = null;
    if (item) {
      url = item.url;
    }
    return url;
  }

  /**
   * 根据请求标识id获取vjs请求
   */
  getVjsUrl(params: { id: string }) {
    const { id } = params;
    return this._getVjsUrl(id);
  }

  /**
   * 根据请求标识id获取vjs请求内容
   */
  getVjsContent(params: { id: string }) {
    let result = "",
      hasError = false,
      { id } = params;
    let url = this._getVjsUrl(id);
    if (url) {
      //@ts-ignore
      let xhr = null;
      if (window.XMLHttpRequest) {
        //@ts-ignore
        xhr = new XMLHttpRequest();
      } else {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      }
      //@ts-ignore
      xhr.open("POST", url, false);
      //@ts-ignore
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      //@ts-ignore
      xhr.onreadystatechange = function () {
        //@ts-ignore
        if (xhr.readyState == 4) {
          //@ts-ignore
          if (xhr.status == 200) {
            //@ts-ignore
            const content = xhr.responseText;
            if (typeof content == "string") {
              const index = content.indexOf("exports.__$isErrorModule=true;");
              if (index != -1) {
                hasError = true;
                result = "请求url失败！";
              } else {
                result = content;
              }
            } else {
              hasError = true;
              result = "请求url失败！";
            }
          }
        }
      };
      //@ts-ignore
      xhr.send();
    } else {
      hasError = true;
      result = "未找到指定的vjs！";
    }
    if (hasError) {
      throw new Error(result);
    } else {
      return result;
    }
  }
  
  /**
   * 获取初始化vjs名称
   * 使用vact开发者工具，需要额外初始化一些vjs
   * @returns
   */
  getInitVjsNames() {
    return ["v_act_vjs_framework_extension_platform_interface_event"];
  }

  /**
   * 注册事件回调
   * @param event 
   * @param handler 
   */
  on(event:Events,handler:EventHandler){
    const handlers = this.eventHandlers[event]||[];
    handlers.push(handler);
    this.eventHandlers[event] = handlers;
  }

  /**
   * 取消注册事件回调
   * @param handler 
   */
  un(event:Events,handler:EventHandler){
    const handlers = this.eventHandlers[event]
    if(handlers&&handlers.length>0){
      for (let index = 0; index < handlers.length; index++) {
        const hd = handlers[index];
        if(hd === handler){
          handlers.splice(index,1);
          break;
        }
      }
    }
  }

  /**
   * 触发事件
   * @param event 
   */
  private _fire(event:Events){
    const handlers = this.eventHandlers[event]
    if(handlers&&handlers.length>0){
      handlers.forEach(handler=>{
        try{
          handler(this);
        }catch(e){}
      });
    }
  }

  /**
   * vact页面vjs初始化完成后，触发此方法
   */
  vjsInited(sandbox) {
    const sandboxManager = SandboxManager.getInstance();
    sandboxManager.set(sandbox);
    this._fire(this.Events.VjsInited);
    
  }

}

export default VjsManager;
