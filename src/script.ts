export function getScript() {
  return `var nowVjsContext = {"clientType":"pc","theme":"default_theme","themeType":"Default","isPure":"false","domain":null};VMetrix.markInterface("vact.vjs.framework.extension.platform.init.view.schema.window.bizcontrolform.biz_ctrl_email_EMail", nowVjsContext);VMetrix.markInterface("vjs.framework.extension.vjs.i18n.package.37d51cdcfe1fa2ca053a60727da531fb", nowVjsContext);window.v_act_vjs_framework_extension_platform_interface_storage={};defineV("v_act_vjs_framework_extension_platform_interface_storage",[],function(req, exp, mod) {mod.exports = window["v_act_vjs_framework_extension_platform_interface_storage"];mod.exports.initModule = function(){(function(global,factory){"object"===typeof exports&&"undefined"!==typeof module?factory(exports):"function"===typeof define&&define.amd?define(["exports"],factory):(global="undefined"!==typeof globalThis?globalThis:global||self,factory(global.v_act_vjs_framework_extension_platform_interface_storage=window.v_act_vjs_framework_extension_platform_interface_storage||{}))})(this,(function(exports2){"use strict";var __defProp=Object.defineProperty;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:true,configurable:true,writable:true,value:value}):obj[key]=value;var __publicField=(obj,key,value)=>{__defNormalProp(obj,"symbol"!==typeof key?key+"":key,value);return value};class MapStorage{constructor(){__publicField(this,"len",0);__publicField(this,"pool",{})}size(){return this.len}isEmpty(){return 0==this.len}containsKey(key){return this.pool.hasOwnProperty(key)}containsValue(val){for(let key in this.pool)if(val==this.pool[key])return true;return false}get(key){return this.pool[key]}put(key,value){if(!this.containsKey(key))this.len++;this.pool[key]=value}remove(key){try{delete this.pool[key]}catch(e){}}putAll(map){for(let key in map)this.put(key,map[key])}getAll(){return this.pool}clear(){this.len=0;this.pool={}}iterate(fn){for(let key in this.pool)if(this.pool.hasOwnProperty(key))fn(key,this.pool[key])}}class TreeNode{constructor(id,value,pId,storage){__publicField(this,"id");__publicField(this,"pId");__publicField(this,"value");__publicField(this,"children");__publicField(this,"searchChildren");__publicField(this,"storage");this.id=id;this.pId=pId;this.value=value;this.children=[];this.searchChildren=false;this.storage=storage}getId(){return this.id}getValue(){return this.value}getPId(){return this.pId}getChildren(){if(!this.searchChildren&&this.storage){let storage=this.storage.storage;for(let id in storage)if(storage.hasOwnProperty(id)){let node=storage[id];if(this.id==node.pId)this.children.push(node)}this.searchChildren=true}return this.children}_clearCache(){this.searchChildren=false;this.children=[]}destroy(){this.storage=null}}let iterateChildren=function(children,container){let childrenArray=[];for(let i=0,len=children.length;i<len;i++){let child=children[i];let childs=child.getChildren();container=container.concat(childs);childrenArray.push(childs)}for(let i=0,len=childrenArray.length;i<len;i++)container=iterateChildren(childrenArray[i],container);return container};class TreeStorage{constructor(){__publicField(this,"storage");this.storage={}}add(pId,id,obj){if(this.storage){this.storage[id]=new TreeNode(id,obj,pId,this);let parent=this.storage[pId];if(parent)parent._clearCache()}}get(id){let node=this.storage[id];return node?node.getValue():null}getTreeNode(id){return this.storage[id]}remove(id){let node=this.storage[id];if(node){let children=node.getChildren();for(let i=0,len=children.length;i<len;i++){let child=children[i];let childId=child.getId();this.remove(childId)}try{delete this.storage[id]}catch(e){}}}has(id){return this.storage.hasOwnProperty(id)}getParent(id){let node=this.storage[id];if(node){let pId=node.getPId();return this.get(pId)}return null}getChildren(id){let node=this.storage[id];if(node){let children=node.getChildren();let result=[];for(let i=0,len=children.length;i<len;i++)result.push(children[i].getValue());return result}return null}getDescendants(id){let descendants=[];let node=this.storage[id];if(node){let childrenNode=[];let children=node.getChildren();childrenNode=childrenNode.concat(children);childrenNode=iterateChildren(children,childrenNode);for(let i=0,len=childrenNode.length;i<len;i++)descendants.push(childrenNode[i].getValue())}return descendants}getBrothers(id){let brothers=[];let node=this.storage[id];if(node){let pId=node.getPId();let parent=this.storage[pId];if(parent){let children=parent.getChildren();for(let i=0,len=children.length;i<len;i++){let child=children[i];if(child!=node)brothers.push(child.getValue())}}}return brothers}iterate(fn){for(let key in this.storage)if(this.storage.hasOwnProperty(key))fn(key,this.storage[key].getValue())}getAllfunction(){let result=[];this.iterate((function(id,value){result.push(value)}));return result}}const _storagePool={};var TYPES;(function(TYPES2){TYPES2["TREE"]="tree";TYPES2["MAP"]="map"})(TYPES||(TYPES={}));for(let type in TYPES)_storagePool[TYPES[type]]={};const get=function(type,token){if(exists(type,token)){let pool=_storagePool[type];return pool[token]}else{const constructor=type==TYPES.MAP?MapStorage:TreeStorage;const storage=new constructor;const pool=_storagePool[type];pool[token]=storage;return storage}};const destory=function(type,token){if(contains(type,token)){const pool=_storagePool[type];try{delete pool[token]}catch(e){}}};const exists=function(type,token){const pool=_storagePool[type];if(pool)return pool.hasOwnProperty(token);else throw Error("[StorageManager.contains]未识别仓库类型[type="+type+"]，请检查！")};const newInstance=function(type){const constructor=type==TYPES.MAP?MapStorage:TreeStorage;return new constructor};var StorageManager=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",destory:destory,exists:exists,get:get,newInstance:newInstance,get TYPES(){return TYPES}});exports2.MapStorage=MapStorage;exports2.StorageManager=StorageManager;Object.defineProperty(exports2,"__esModule",{value:true});exports2[Symbol.toStringTag]="Module"}));
}});
defineVJS({"id":"189856000","name":"v_act_vjs_framework_extension_platform_interface_storage","version":"3.0.0","pros":null,"deps":{},"children":{"v_act_vjs_framework_extension_platform_interface_storage":{"service":{"name":"v_act_vjs_framework_extension_platform_interface_storage"}}}});window.v_act_vjs_framework_extension_platform_interface_environment={};defineV("v_act_vjs_framework_extension_platform_interface_environment",[],function(req, exp, mod) {mod.exports = window["v_act_vjs_framework_extension_platform_interface_environment"];mod.exports.initModule = function(){(function(global,factory){"object"===typeof exports&&"undefined"!==typeof module?factory(exports,require("@v-act/vjs.framework.extension.platform.interface.storage")):"function"===typeof define&&define.amd?define(["exports","@v-act/vjs.framework.extension.platform.interface.storage"],factory):(global="undefined"!==typeof globalThis?globalThis:global||self,factory(global.v_act_vjs_framework_extension_platform_interface_environment=window.v_act_vjs_framework_extension_platform_interface_environment||{},global.v_act_vjs_framework_extension_platform_interface_storage))})(this,(function(exports2,vjs_framework_extension_platform_interface_storage){"use strict";const token="ENVIRONMENT_V3_INFO",RUNNING_MODE="RUNNING_MODE",DEBUG_KEY="DEBUG_KEY",CTX_PATH="CTX_PATH",CTX_HOST="CTX_HOST",PLATFORM_TYPE="PLATFORM_TYPE",LOGIN_INFO="LOGIN_INFO",IS_ASYNC="IS_ASYNC",DEV_ID="DEV_ID",DEBUGGER_PORT="DEBUGGER_PORT",OPTIMIZELINK_KEY="OPTIMIZELINK_KEY",ENCRYPT_TOKEN_KEY="ENCRYPT_TOKEN_KEY",IS_WEB_DESIGN_KEY="IS_WEB_DESIGN_KEY",EXCEPTION_INSTANCE_IDEN_KEY="EXCEPTION_INSTANCE_IDEN_KEY",COMPATIBLE_MODE_KEY="COMPATIBLE_MODE_KEY",WIDGET_RENDER_CONTEXT_KEY="WIDGET_RENDER_CONTEXT_KEY";const storage=vjs_framework_extension_platform_interface_storage.StorageManager.get(vjs_framework_extension_platform_interface_storage.StorageManager.TYPES.MAP,token);const init=function(params){if(params){setDomain(params.domain);setOptimizeLink(params.optimizeLink);storage.put(ENCRYPT_TOKEN_KEY,params.isEncryptToken?true:false);storage.put(EXCEPTION_INSTANCE_IDEN_KEY,params.ExceptionInstanceIden);storage.put(COMPATIBLE_MODE_KEY,!!params.CompatibleMode)}};const useCompatibleMode=function(){let val=storage.get(COMPATIBLE_MODE_KEY);return false===val?false:true};const getExceptionInstanceId=function(){let val=storage.get(EXCEPTION_INSTANCE_IDEN_KEY);return val};const isEncryptToken=function(){let val=storage.get(ENCRYPT_TOKEN_KEY);return true===val};const setRunningMode=function(mode){storage.put(RUNNING_MODE,mode)};const getRunningMode=function(){return storage.get(RUNNING_MODE)};const setDebug=function(debug){storage.put(DEBUG_KEY,debug)};const isDebug=function(){return storage.get(DEBUG_KEY)};const setContextPath=function(ctxPath){storage.put(CTX_PATH,ctxPath)};const getContextPath=function(){let contextPath=storage.get(CTX_PATH);return contextPath?contextPath:""};const setPlatformType=function(type){storage.put(PLATFORM_TYPE,type)};const getPlatformType=function(){return storage.get(PLATFORM_TYPE)};const isAsync=function(){return storage.containsKey(IS_ASYNC)?storage.get(IS_ASYNC):true};const setAsync=function(async){storage.put(IS_ASYNC,async)};const setHost=function(host){storage.put(CTX_HOST,host)};const getHost=function(){return storage.containsKey(CTX_HOST)?storage.get(CTX_HOST):""};const setLoginInfo=function(params){storage.put(LOGIN_INFO,params)};const getLoginInfo=function(){return storage.get(LOGIN_INFO)};let _getHostUrl=function(){let l=window.location;return l.protocol+"//"+l.host+getContextPath()};const getLoginUrl=function(){if(storage.containsKey(LOGIN_INFO)){let info=storage.get(LOGIN_INFO);let type=info.type?info.type:"platform";if("platform"==type)return _getHostUrl()+"/module-operation!executeOperation?operation=Form&componentCode="+info.componentCode+"&windowCode="+info.windowCode;else return info.url}else return _getHostUrl()};const isLogin=function(){return storage.containsKey(LOGIN_INFO)};const parseCssStr=function(css){if(css&&"undefined"!=typeof document){let wrapDiv=document.getElementById("_$styleWrapDiv");if(!wrapDiv){wrapDiv=document.createElement("div");wrapDiv.setAttribute("id","_$styleWrapDiv");wrapDiv.setAttribute("style","display:none;");document.body.appendChild(wrapDiv)}let styleDom=wrapDiv.children[0];if(styleDom)css=styleDom.innerHTML+css;let html="_<style id='cslk'>"+css+"</style>";wrapDiv.innerHTML=html}};const setDebugPort=function(port){storage.put(DEBUGGER_PORT,port)};const getDebugPort=function(){return storage.get(DEBUGGER_PORT)};const setDevId=function(id){storage.put(DEV_ID,id)};const getDevId=function(){return storage.get(DEV_ID)};let domainId=null;const getDomain=function(){return domainId};const setDomain=function(domain){if(!domain||null==domain)domain=null;domainId=domain};let setOptimizeLink=function(optimize){storage.put(OPTIMIZELINK_KEY,true===optimize)};const isOptimizeLink=function(){return storage.get(OPTIMIZELINK_KEY)};const isWebDesign=function(){return true==storage.get(IS_WEB_DESIGN_KEY)};const setWebDesign=function(){storage.put(IS_WEB_DESIGN_KEY,true)};let isOpera=function(){return"Opera"==navigator.appName||-1!=navigator.userAgent.indexOf("Opera")};let isIE=function(){return"Microsoft Internet Explorer"==navigator.appName&&!isOpera()||-1!=navigator.userAgent.indexOf("Trident/")};let isAIR=function(){return-1!=navigator.userAgent.indexOf("AdobeAIR")};let version=function(){let minorVersion;if(navigator.userAgent.indexOf("Trident/")>=0&&navigator.userAgent.lastIndexOf("rv:")>=0)minorVersion=parseFloat(navigator.userAgent.substring(navigator.userAgent.lastIndexOf("rv:")+"rv:".length));else minorVersion=parseFloat(isIE()?navigator.appVersion.substring(navigator.appVersion.indexOf("MSIE")+5):navigator.appVersion);if(!isIE())(function(){var needle,pos;if(navigator.appVersion){needle="Version/";pos=navigator.appVersion.indexOf(needle);if(pos>=0){minorVersion=parseFloat(navigator.appVersion.substring(pos+needle.length));return}}var ua=navigator.userAgent;needle="Chrome/";pos=ua.indexOf(needle);if(pos>=0){minorVersion=parseFloat(ua.substring(pos+needle.length));return}needle="Camino/";pos=ua.indexOf(needle);if(pos>=0){minorVersion=parseFloat(ua.substring(pos+needle.length));return}needle="Firefox/";pos=ua.indexOf(needle);if(pos>=0){minorVersion=parseFloat(ua.substring(pos+needle.length));return}if(ua.indexOf("Opera/")>=0){needle="Version/";pos=ua.indexOf(needle);if(pos>=0){minorVersion=parseFloat(ua.substring(pos+needle.length));return}else{needle="Opera/";pos=ua.indexOf(needle);minorVersion=parseFloat(ua.substring(pos+needle.length));return}}})();return parseInt(minorVersion+"")};let isSafari=function(){return isAIR()||-1!=navigator.userAgent.indexOf("Safari")||-1!=navigator.userAgent.indexOf("AppleWebKit")};let isChrome=function(){return isSafari()&&-1!=navigator.userAgent.indexOf("Chrome/")};let isIE8=function(){return isIE()&&version()>=8&&8==document.documentMode};let isIE9=function(){return isIE()&&version()>=9&&document.documentMode>=9};let isIE10=function(){return isIE()&&version()>=10};let isIE11=function(){return isIE()&&version()>=11};const registerWidgetRenderContext=function(ctx){storage.put(WIDGET_RENDER_CONTEXT_KEY,ctx)};const getWidgetRenderContext=function(){return storage.get(WIDGET_RENDER_CONTEXT_KEY)};let navigate=null;const useNavigate=function(){return navigate};const setNavigate=function(nav){if(nav)navigate=nav};let modalHandler=null;const setModalHandler=function(handler){modalHandler=handler};const openModal=function(...args){console.log(...args);return new Promise(((resolve,reject)=>{if("function"==typeof modalHandler){debugger;modalHandler(...args);resolve()}else reject(new Error("当前窗体未获得打开模态窗事件"))}))};var Environment=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",getContextPath:getContextPath,getDebugPort:getDebugPort,getDevId:getDevId,getDomain:getDomain,getExceptionInstanceId:getExceptionInstanceId,getHost:getHost,getLoginInfo:getLoginInfo,getLoginUrl:getLoginUrl,getPlatformType:getPlatformType,getRunningMode:getRunningMode,getWidgetRenderContext:getWidgetRenderContext,init:init,isAsync:isAsync,isChrome:isChrome,isDebug:isDebug,isEncryptToken:isEncryptToken,isIE:isIE,isIE10:isIE10,isIE11:isIE11,isIE8:isIE8,isIE9:isIE9,isLogin:isLogin,isOptimizeLink:isOptimizeLink,isWebDesign:isWebDesign,openModal:openModal,parseCssStr:parseCssStr,registerWidgetRenderContext:registerWidgetRenderContext,setAsync:setAsync,setContextPath:setContextPath,setDebug:setDebug,setDebugPort:setDebugPort,setDevId:setDevId,setDomain:setDomain,setHost:setHost,setLoginInfo:setLoginInfo,setNavigate:setNavigate,setPlatformType:setPlatformType,setRunningMode:setRunningMode,setWebDesign:setWebDesign,setModalHandler:setModalHandler,useCompatibleMode:useCompatibleMode,useNavigate:useNavigate});exports2.Environment=Environment;Object.defineProperty(exports2,"__esModule",{value:true});exports2[Symbol.toStringTag]="Module"}));
}});
defineVJS({"id":"1299636712","name":"v_act_vjs_framework_extension_platform_interface_environment","version":"3.0.0","pros":null,"deps":{"v_act_vjs_framework_extension_platform_interface_storage":"3.0.0"},"children":{"v_act_vjs_framework_extension_platform_interface_environment":{"service":{"name":"v_act_vjs_framework_extension_platform_interface_environment"}}}});window.v_act_vjs_framework_extension_util_jsonutil={};defineV("v_act_vjs_framework_extension_util_jsonutil",[],function(req, exp, mod) {mod.exports = window["v_act_vjs_framework_extension_util_jsonutil"];mod.exports.initModule = function(){(function(i,o){typeof exports=="object"&&typeof module!="undefined"?o(exports):typeof define=="function"&&define.amd?define(["exports"],o):(i=typeof globalThis!="undefined"?globalThis:i||self,o(i.v_act_vjs_framework_extension_util_jsonutil=window.v_act_vjs_framework_extension_util_jsonutil||{}))})(this,function(i){"use strict";const o=function(e,n){return l(e,n)},g=function(e){return h(e)},d=function(e){let n=l(e);return h(n)};let y=!!{}.hasOwnProperty,s=function(e){return e<10?"0"+e:e},c={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r"},p=["(["];for(let e in c)c.hasOwnProperty(e)&&p.push(e);p.push("])");let b=new RegExp(p.join(""),"g"),S={'"':'\\"',"\\":"\\\\"},j=function(e){return/["\\\x00-\x1f]/.test(e)?'"'+e.replace(/([\x00-\x1f\\"])/g,function(n,t){let r=S[t]||e[t];return r||(r=t.charCodeAt(),"\\u00"+Math.floor(r/16).toString(16)+(r%16).toString(16))})+'"':'"'+e+'"'},w=function(e,n){let t=["["],r,u,f=e.length,a;for(u=0;u<f;u+=1)switch(a=e[u],typeof a){case"undefined":case"function":n&&(r&&t.push(","),t.push(l(u,n),":",a.toString()),r=!0);break;case"unknown":break;default:r&&t.push(","),t.push(a===null?"null":l(a,n)),r=!0}return t.push("]"),t.join("")},_=function(e){return'"'+e.getFullYear()+"-"+s(e.getMonth()+1)+"-"+s(e.getDate())+"T"+s(e.getHours())+":"+s(e.getMinutes())+":"+s(e.getSeconds())+'"'},l=function(e,n){if(typeof e=="undefined"||e===null)return"null";if(Object.prototype.toString.call(e)==="[object Array]")return w(e,n);if(e instanceof Date)return _(e);if(typeof e=="string")return j(e);if(typeof e=="number")return isFinite(e)?String(e):"null";if(typeof e=="boolean")return String(e);if(n&&typeof e=="function")return e.toString();{let t=["{"],r,u,f;for(u in e)if(!y||e.hasOwnProperty(u))switch(f=e[u],typeof f){case"undefined":case"function":n&&(r&&t.push(","),t.push(l(u,n),":",f.toString()),r=!0);break;case"unknown":break;default:r&&t.push(","),t.push(l(u,n),":",f===null?"null":l(f,n)),r=!0}return t.push("}"),t.join("")}},h=function(e){if(e==null||e=="")return e;try{return new Function("return "+e.replace(b,function(n,t){let r=c[t];return r||t})+";")()}catch(n){if(JSON&&JSON.parse)try{return JSON.parse(e)}catch(t){throw t}else throw n}};var O=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",clone:d,json2obj:g,obj2json:o});i.jsonUtil=O,Object.defineProperty(i,"__esModule",{value:!0}),i[Symbol.toStringTag]="Module"});
}});
defineVJS({"id":"236922160","name":"v_act_vjs_framework_extension_util_jsonutil","version":"3.0.0","pros":null,"deps":{},"children":{"v_act_vjs_framework_extension_util_jsonutil":{"service":{"name":"v_act_vjs_framework_extension_util_jsonutil"}}}});window.v_act_vjs_framework_extension_util_logutil={};defineV("v_act_vjs_framework_extension_util_logutil",[],function(req, exp, mod) {mod.exports = window["v_act_vjs_framework_extension_util_logutil"];mod.exports.initModule = function(){(function(n,t){typeof exports=="object"&&typeof module!="undefined"?t(exports):typeof define=="function"&&define.amd?define(["exports"],t):(n=typeof globalThis!="undefined"?globalThis:n||self,t(n.v_act_vjs_framework_extension_util_logutil=window.v_act_vjs_framework_extension_util_logutil||{}))})(this,function(n){"use strict";let t=!1;const i=function(){return typeof window!="undefined"?window.console:null},r=function(){return!t};function f(){if(r()){const e=i();e&&e.showLogConsole&&e.showLogConsole()}}function s(){t=!0}function u(){t=!1}function l(e){try{if(r()){const o=i();o&&o.log(e)}}catch{}}const c=e=>l(e);function g(e){try{if(r()){const o=i();o&&o.warn(e)}}catch{}}function d(e){try{if(r()){const o=i();o&&o.error(e)}}catch{}}var a=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",showLogConsole:f,disable:s,enable:u,debug:l,log:c,warn:g,error:d});n.Log=a,Object.defineProperty(n,"__esModule",{value:!0}),n[Symbol.toStringTag]="Module"});
}});
defineVJS({"id":"709637472","name":"v_act_vjs_framework_extension_util_logutil","version":"3.0.0","pros":null,"deps":{},"children":{"v_act_vjs_framework_extension_util_logutil":{"service":{"name":"v_act_vjs_framework_extension_util_logutil"}}}});window.v_act_vjs_framework_extension_platform_interface_event={};defineV("v_act_vjs_framework_extension_platform_interface_event",[],function(req, exp, mod) {mod.exports = window["v_act_vjs_framework_extension_platform_interface_event"];mod.exports.initModule = function(){(function(t,n){typeof exports=="object"&&typeof module!="undefined"?n(exports,require("@v-act/vjs.framework.extension.platform.interface.environment"),require("@v-act/vjs.framework.extension.platform.interface.exception"),require("@v-act/vjs.framework.extension.platform.interface.scope"),require("@v-act/vjs.framework.extension.platform.interface.storage"),require("@v-act/vjs.framework.extension.util.jsonutil"),require("@v-act/vjs.framework.extension.util.logutil")):typeof define=="function"&&define.amd?define(["exports","@v-act/vjs.framework.extension.platform.interface.environment","@v-act/vjs.framework.extension.platform.interface.exception","@v-act/vjs.framework.extension.platform.interface.scope","@v-act/vjs.framework.extension.platform.interface.storage","@v-act/vjs.framework.extension.util.jsonutil","@v-act/vjs.framework.extension.util.logutil"],n):(t=typeof globalThis!="undefined"?globalThis:t||self,n(t.v_act_vjs_framework_extension_platform_interface_event=window.v_act_vjs_framework_extension_platform_interface_event||{},t.v_act_vjs_framework_extension_platform_interface_environment,t.v_act_vjs_framework_extension_platform_interface_exception,t.v_act_vjs_framework_extension_platform_interface_scope,t.v_act_vjs_framework_extension_platform_interface_storage,t.v_act_vjs_framework_extension_util_jsonutil,t.v_act_vjs_framework_extension_util_logutil))})(this,function(exports,vjs_framework_extension_platform_interface_environment,vjs_framework_extension_platform_interface_exception,vjs_framework_extension_platform_interface_scope,vjs_framework_extension_platform_interface_storage,vjs_framework_extension_util_jsonutil,vjs_framework_extension_util_logutil){"use strict";var c=Object.defineProperty;var m=(t,n,o)=>n in t?c(t,n,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[n]=o;var l=(t,n,o)=>(m(t,typeof n!="symbol"?n+"":n,o),o);class Callback{constructor(n,o){l(this,"type");l(this,"handler");this.type=n,this.handler=o}getType(){return this.type}getHandler(){return this.handler}}const Types={Success:"Success",Fail:"Fail"},create=function(t){return new Callback(t.type,t.handler)},isCallback=function(t){return t instanceof Callback};var CallbackFactory=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",create,isCallback,Types});let storage,token="V3_Platform_Services_Event_AOP",crossDomainStorage,isStartListener=!1,V3_TOONE_PLATFORM_CROSSDOMAIN_IDEN="TOONE_COM_CN_V3_PLATFORM_POST_MESSAGE_IDEN_THREE";const crossDomainEventKey="Coross_Domain_Event_Key";let _getStorage=function(){return storage||(storage=vjs_framework_extension_platform_interface_storage.StorageManager.get(vjs_framework_extension_platform_interface_storage.StorageManager.TYPES.MAP,token)),storage},_getCrossDomainStorage=function(){return crossDomainStorage||(crossDomainStorage=vjs_framework_extension_platform_interface_storage.StorageManager.get(vjs_framework_extension_platform_interface_storage.StorageManager.TYPES.MAP,crossDomainEventKey)),crossDomainStorage};const register=function(t){let n=_getStorage(),o=t.event,a=t.handler,r;n.containsKey(o)?r=storage.get(o):(r=[],n.put(o,r)),r.push(a)},fire=function(t){let n=t.event,o=t.args,a=_getStorage();if(a.containsKey(n)){let r=a.get(n);for(let s=0,_=r.length;s<_;s++)r[s].apply(this,o)}},startCrossDomainListener=function(){let handle=vjs_framework_extension_platform_interface_scope.ScopeManager.createScopeHandler({handler:function(e){if(e&&e.data)try{let _data=e.data;if(typeof _data=="string"&&_data=="TOONE_COM_CN_V3_PLATFORM_POST_MESSAGE_IDEN"||typeof _data=="object"&&_data.TOONE_IDEN=="TOONE_COM_CN_V3_PLATFORM_POST_MESSAGE_IDEN"){let n=_getCrossDomainStorage().get(CrossDomainEvents.ModalWindowClose);if(n&&n.length>0){let o=n[0];typeof o=="object"&&(o=o.handler),typeof o=="function"&&o.apply(this,arguments)}}else{let _data=e.data;if(vjs_framework_extension_platform_interface_environment.Environment.isIE9()&&(_data=vjs_framework_extension_util_jsonutil.jsonUtil.json2obj(e.data)),_data.TOONE_IDEN==V3_TOONE_PLATFORM_CROSSDOMAIN_IDEN){let type=_data.TYPE?_data.TYPE:CrossDomainMessageType.EVENT,cds=_getCrossDomainStorage();switch(type){case CrossDomainMessageType.EVENT:var eventName=_data.EVENTNAME,fInfo=_data.EVENTINFO,params=_data.PARAMS;if(params||(params={}),params.MsgEvent=e,cds.containsKey(eventName)){var events=cds.get(eventName);if(events&&events.length>0){for(var removeIndex=[],i=0,len=events.length;i<len;i++){var event=events[i];if(typeof event=="object"){var rInfo=event.eventInfo,fu=event.handler,isExcute=!1;if(rInfo&&rInfo.condition!=null&&rInfo.condition!="")try{eval(rInfo.condition)&&(isExcute=!0,fu(params))}catch(t){}else isExcute=!0,fu(params);isExcute&&rInfo&&rInfo.isDelete==!0&&removeIndex.push(i)}else typeof event=="function"&&event(params)}for(var i=removeIndex.length-1;i>=0;i--)events.splice(removeIndex[i],1)}}break;case CrossDomainMessageType.MESSAGE:var msgParams=_data.PARAMS;if(msgParams&&msgParams.msg=="UnLogin"){var newParams=msgParams.params;newParams.TYPE=CrossDomainMessageType.EVENT,newParams.TOONE_IDEN=V3_TOONE_PLATFORM_CROSSDOMAIN_IDEN;var childs=window.frames;if(childs&&childs.length>0)for(var i=0,len=childs.length;i<len;i++)window.frames[i].postMessage(newParams,"*");var ex=vjs_framework_extension_platform_interface_exception.ExceptionFactory.create({type:vjs_framework_extension_platform_interface_exception.ExceptionFactory.TYPES.Unlogin,error:"Exception",message:"\u672A\u767B\u5F55"});vjs_framework_extension_platform_interface_exception.ExceptionHandler.handle(ex,null)}break}}}}catch(t){}}});isStartListener||(isStartListener=!0,window.addEventListener("message",handle,!1))},CrossDomainEvents={ModalWindowClose:"ModalWindowClose",ContainerWindowClose:"ContainerWindowClose",SetModalWindowTitle:"SetModalWindowTitle",UnLoginException:"UnLoginException",OpenWindow:"OpenWindow",ActiveWindow:"ActiveWindow",CloseWindow:"CloseWindow",CustomEvent:"CustomEvent"},CrossDomainMessageType={EVENT:"Event",MESSAGE:"Message"},onCrossDomainEvent=function(t){let n=t.eventName,o=t.handler;if(n&&typeof o=="function"){let a=_getCrossDomainStorage(),r;a.containsKey(n)?r=a.get(n):(r=[],a.put(n,r));let s={handler:o,eventInfo:t.eventInfo};r.push(s)}},unCrossDomainEvent=function(t){let n=t.eventName,o=t.handler;if(n&&typeof o=="function"){let a=_getCrossDomainStorage(),r;if(a.containsKey(n)){r=a.get(n);for(let s=0,_=r.length;s<_;s++){let f=r[s];typeof f=="object"&&(f=f.handler),typeof f=="function"&&o===f&&r.splice(s,1)}}}},fireCrossDomainEvent=function(t){if(!t)return!1;let n=t.type?t.type:CrossDomainMessageType.EVENT,o={PARAMS:t.params,EVENTINFO:t.eventInfo,TYPE:n,TOONE_IDEN:V3_TOONE_PLATFORM_CROSSDOMAIN_IDEN};if(n==CrossDomainMessageType.EVENT){let a=t.eventName;if(a)o.EVENTNAME=a;else{vjs_framework_extension_util_logutil.Log.warn("\u8DE8\u57DF\u5904\u7406\u7684\u4E8B\u4EF6\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A.");return}}try{vjs_framework_extension_platform_interface_environment.Environment.isIE9()&&(o=vjs_framework_extension_util_jsonutil.jsonUtil.obj2json(o)),t.win?t.win.postMessage(o,"*"):window.parent.postMessage(o,"*")}catch{}},Events={BeforeRuleExe:"BeforeRuleExe",AfterRuleExe:"AfterRuleExe",BeforeRouteExe:"BeforeRouteExe",AfterRouteExe:"AfterRouteExe",BeforeWindowLoad:"BeforeWindowLoad",AfterWindowLoad:"AfterWindowLoad",BeforeWindowRender:"BeforeWindowRender",AfterWindowRender:"AfterWindowRender",BeforeWindowInit:"BeforeWindowInit",AfterWindowInit:"AfterWindowInit",BeforeComponentLoad:"BeforeComponentLoad",AfterComponentLoad:"AfterComponentLoad",BeforeComponentInit:"BeforeComponentInit",AfterComponentInit:"AfterComponentInit",BeforeRPC:"BeforeRPC",AfterRPC:"AfterRPC"};var EventManager=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",CrossDomainEvents,CrossDomainMessageType,Events,fire,fireCrossDomainEvent,onCrossDomainEvent,register,startCrossDomainListener,unCrossDomainEvent});exports.EventManager=EventManager,exports.callbackFactory=CallbackFactory,Object.defineProperty(exports,"__esModule",{value:!0}),exports[Symbol.toStringTag]="Module"});
}});
defineVJS({"id":"1690109535","name":"v_act_vjs_framework_extension_platform_interface_event","version":"3.0.0","pros":null,"deps":{"v_act_vjs_framework_extension_platform_interface_environment":"3.0.0","v_act_vjs_framework_extension_platform_interface_exception":"3.0.0","v_act_vjs_framework_extension_platform_interface_scope":"3.0.0","v_act_vjs_framework_extension_platform_interface_storage":"3.0.0","v_act_vjs_framework_extension_util_jsonutil":"3.0.0","v_act_vjs_framework_extension_util_logutil":"3.0.0"},"children":{"v_act_vjs_framework_extension_platform_interface_event":{"service":{"name":"v_act_vjs_framework_extension_platform_interface_event"}}}});window.v_act_vjs_framework_extension_platform_interface_i18n={};defineV("v_act_vjs_framework_extension_platform_interface_i18n",[],function(req, exp, mod) {mod.exports = window["v_act_vjs_framework_extension_platform_interface_i18n"];mod.exports.initModule = function(){(function(t,o){typeof exports=="object"&&typeof module!="undefined"?o(exports):typeof define=="function"&&define.amd?define(["exports"],o):(t=typeof globalThis!="undefined"?globalThis:t||self,o(t.v_act_vjs_framework_extension_platform_interface_i18n=window.v_act_vjs_framework_extension_platform_interface_i18n||{}))})(this,function(t){"use strict";let o={};const f=function(e){o[e.vjsName]=e.items},l=function(e,i){if(typeof e=="object"&&e.defaultVal){let n=o[e.vjsName];return n&&n.hasOwnProperty(e.code)?n[e.code]:e.defaultVal}else return e},u=function(e){let i=o[e.vjsName],n=e.code;return!!(i&&i.hasOwnProperty(n))};var d=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",get:l,has:u,init:f});t.Platform=d,Object.defineProperty(t,"__esModule",{value:!0}),t[Symbol.toStringTag]="Module"});
}});
defineVJS({"id":"1746544199","name":"v_act_vjs_framework_extension_platform_interface_i18n","version":"3.0.0","pros":null,"deps":{},"children":{"v_act_vjs_framework_extension_platform_interface_i18n":{"service":{"name":"v_act_vjs_framework_extension_platform_interface_i18n"}}}});window.v_act_vjs_framework_extension_util_uuid={};defineV("v_act_vjs_framework_extension_util_uuid",[],function(req, exp, mod) {mod.exports = window["v_act_vjs_framework_extension_util_uuid"];mod.exports.initModule = function(){(function(t,n){typeof exports=="object"&&typeof module!="undefined"?n(exports):typeof define=="function"&&define.amd?define(["exports"],n):(t=typeof globalThis!="undefined"?globalThis:t||self,n(t.v_act_vjs_framework_extension_util_uuid=window.v_act_vjs_framework_extension_util_uuid||{}))})(this,function(t){"use strict";const n=()=>{let e=()=>((1+Math.random())*65536|0).toString(16).substring(1);return e()+e()+e()+e()+e()+e()+e()+e()};var o=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",generate:n});t.uuid=o,Object.defineProperty(t,"__esModule",{value:!0}),t[Symbol.toStringTag]="Module"});
}});
defineWrap({"id":"./8a819cf9850f50f401850fab9f865f70_1048b0044f8c96b9f80aef96f2ca716a","alias":"gim","children":["189856000","1299636712","236922160","709637472","1746544199","652433370","51021261","1195862363","1107331233","308474681","1746602852","1917908640","1121724511","90772016","1349969401","1064479881","780953472","1254460915","69223832","942465272","1008907183","647588579","297569256","1079607044","1804703651","222129393","917818836","1534296034","1438542966","1617341657","203206590","108156117","612762403","1981019084","953545031","387039070","1270300817","1606734254","848351642","963125744","1526930193","2087520709","1921697435","1164711380","159819386","1149236744","2093898547","945174173","1686345281","1286537239","1701922318","127164976","1415016544","118949984","732727111","1653604813","2062639452","474175215","482516897","1437297314","160731561","192395865","1988197343","661810022","259208157","1168627078","1687006497","1019443980","1117433347","136240895","1645374255","374121072","171082329","497076653","481993900","1316806431","1081736926","1977571129","1107074030","1439317056","534164366","281687606","1759099215","578873779","1742339748","1272568397","1702482457","788561793","1156408718","1855781268","1690109535","1133698825","444368367","108386687","170542376","1123305854","164381621","1382940561","1657882730","164511110","1716073915","200501716","1490266069","1599732560","1334281627","141387165","1135639379","2098066891","1134009180","1328715403","698140497","838326043","121468570","356830753","864643562","333998490","735692373","1761070881","1437666417","2062149296","1615006473","1439779588","975641086","1880470187","232687187","716253730","1925677469","1948539593","1392179788","1591480576","178098372","1207668541","2131524937","120861492","621274975","2055760710","1996520288","1670413280","747709846","491874908","634432223","40909592","123831793","1105199502","1877491157","495812829","108451457","1107307213","864037311","569710473","1414211380","1731619215","804646142","1923493604","28994524","102835274","1492600480","607525459","1128944569","1275703412","1403674836","486108251","1894487385","1804086412","932153254","1858612133","402670197","521284710","100897949","1815364741","588316168","1811995150","1873324178","273325873","762923211","1372246290","1511550226","102843796","616586594","4217506","1556432104","2006368511","2110039840","1106805908","1913332215","1392417268","1990213777","1976722832","1080845700","120126177","1877555592","452364428","157451792","1653168767","799744855","1653269743","521896977","1327540330","138160678","1867263789","980897150","620498342","552612835","607531252","1911905811","361685588","1824179366","516870958","545123674","40970189","2146549100","181351566","743709248","1474654614","1595295473","1944642636","284592214","185586733","62712913","294131025","1684310458","685341668","1776989316","2057108679","2018985523","1938505344","1695094663","845854237","802216696","534051477","458934930","2086816342","1235724414","1554430651","138360571","902899226","1359965661","1783701683","425195235","526038594","2092440407","925917201","1841076952","1982858107","926639933","1102676800","350299072","1624346850"]});`;
}