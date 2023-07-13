import BreakpointManager from '../manager/BreakpointManager';
import ComponentManager from '../manager/ComponentManager';
import ConsoleManager from '../manager/ConsoleManager';
import ExtensionManager from '../manager/ExtensionManager';
import MethodManager from '../manager/MethodManager';
import MonitorManager from '../manager/MonitorManager';
import RuleDebuggerManager from '../manager/private/RuleDebuggerManager';
import VjsManager from '../manager/VjsManager';
import WindowManager from '../manager/WindowManager';
import * as EventObserver from '../observer/EventObserver';
import * as FrontendOberser from '../observer/FrontendOberser';
import { ExposeMethod } from '../types/Types';

class VActDevTool implements ExposeMethod {

    //vact开发者工具版本
    vactInjectScriptVersion = "1.0";

    exposeInstances:ExposeMethod[] = [];

    constructor() {
      this._expose(BreakpointManager.getInstance());
      this._expose(ComponentManager.getInstance());
      this._expose(ConsoleManager.getInstsance());
      this._expose(ExtensionManager.getInstance());
      this._expose(MethodManager.getInstance());
      this._expose(MonitorManager.getInstance());
      const vjsManager = VjsManager.getInstance()
      this._expose(vjsManager);
      this._expose(WindowManager.getInstance());
      this._expose(this);
      vjsManager.on(vjsManager.Events.VjsInited,()=>{
        this.launch();
      });
    }
  
    /**
     * 暴露目标指定方法
     * @param target 
     * @param includes 
     * @param excludes 
     */
    private _expose(target:ExposeMethod){
      this.exposeInstances.push(target);
    }
    /**
     * 插件调用
     * @param methodName 
     * @param params 
     */
    apply(methodName:string,params:any){
      let target:ExposeMethod|null = null;
      for (let index = 0; index < this.exposeInstances.length; index++) {
        const inst = this.exposeInstances[index];
        if(typeof inst[methodName] == 'function'){
          if(target!=null){
            throw Error(`多个实例暴露了【${methodName}】方法供插件使用！`);
          }
          target = inst;
        }
      }
      if(target == null){
        throw Error(`未找到【${methodName}】方法供插件使用！`);
      }
      return target[methodName](params);
    }
    
    /**
     * 是否为VAct平台页面
     * @returns boolean
     */
    isVActPlatform() {
      //@ts-ignore
      return window.VMetrix && window.VMetrix.loadBundles;
    }
    
    /**
     * 启动时触发
     */
    launch(){
      RuleDebuggerManager.getInstance().mount();
      EventObserver.mount();
      FrontendOberser.mount();
    }
   
  }

  export default VActDevTool;