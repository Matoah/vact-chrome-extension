import { ReactNode } from 'react';

interface Breakpoint {
  enable: boolean;
  location: {
    componentCode: string;
    windowCode?: string;
    methodCode: string;
    ruleCode: string;
  };
}

interface Operations {
  [operation: string]: {
    disabled: boolean;
    active: boolean;
  };
}

interface FrontendDebuggerState {
  //断点集合
  breakpoints: Breakpoint[];
  //方法树
  //methodTree: MethodTreeNode[];
  //方法树展开节点
  //methodTreeExpand: string[];
  //方法规则配置树
  //ruleConfigTree: RuleConfigTreeNode[];
  //搜索候选项（过滤方法树）
  //searchItems: MethodTreeSearchItem[];
  //搜索值
  //search?: MethodTreeSearchItem;
  //禁用所有断点
  disableAll: boolean;
  //中断所有规则
  breakAll: boolean;
  //操作动作
  //operations: Operation[];
  //当前方法
  method?: Method;
  //当前规则
  rule?: Rule;
  //当前调试规则
  debug?: Debug;
  //调试回调id
  debugCallbackId?: string;
}

interface FrontendDataPortalState {
  selectNode:ScopeTreeNode|null
}

interface Operation {
  code: string;
  title: string;
  icon: ReactNode;
  disabled: ((state: FrontendDebuggerState) => boolean) | boolean;
  shortcut?: (evt: KeyboardEvent) => boolean;
  click: (state: FrontendDebuggerState, active: boolean) => void;
}

interface Method {
  componentCode: string;
  methodCode: string;
  windowCode?: string;
}
interface Rule {
  method: Method;
  code: string;
}

interface Debug {
  type: "beforeRuleExe" | "afterRuleExe";
  rule: Rule;
}

interface MethodTreeNode {
  id: string;
  type: "component" | "window" | "method" | "catalog";
  label: string;
  componentCode?: string;
  windowCode?: string;
  methodCode?: string;
  children?: MethodTreeNode[];
}

interface ScopeTreeNode{
  id: string;
  type: "component"|"window";
  label:string;
  componentCode:string;
  windowCode?:string
  children?:ScopeTreeNode[]
}

interface RuleConfigTreeNode {
  id: string;
  label: string;
  type: "rule" | "if" | "else" | "foreach";
  desc?: string;
  ruleCode?: string;
  debug?: boolean | { debug: boolean; condition: string };
  children?: RuleConfigTreeNode[];
}

interface MethodTreeSearchItem {
  code: string;
  componentCode: string;
  windowCode?: string;
  methodCode?: string;
  label: string;
}

interface ScopeTreeSearchItem{
  id:string;
  instanceId:string;
  label:string
}

interface MethodInfo {
  componentCode: string;
  componentName: string;
  methodCode: string;
  methodName: string;
  windowCode?: string;
  windowName?: string;
}

interface RuleInstance {
  condition: string;
  $: {
    ruleCode: string;
    instanceCode: string;
    instanceName: string;
    ruleName: string;
  };
}
interface Logic {
  ruleInstances: { ruleInstance: RuleInstance | RuleInstance[] };
  ruleSets: {
    ruleSet: {
      ruleRoute: {
        _: string;
      };
      ruleInstances: {
        ruleInstance: RuleInstance | RuleInstance[];
      };
    };
  };
}

interface FrontendScope {
    type:"window"|"component",
    instanceId:string,
    componentCode:string,
    title:string,
    pId:string|null,
    windowCode?:string
}

interface TreeNode {
  id: string;
  label: string|ReactNode;
  type: string;
  isFolder?: boolean;
  children?: TreeNode[];
}

interface VjsUrl {
  id: string;
  url: string;
  size: number;
}

interface ConsoleSetting{
  enable?:boolean;
  enableDebug?:boolean;
  enableInfo?:boolean;
  enableWarn?:boolean;
  enableError?:boolean;
}

export {
  type Breakpoint,
  type ConsoleSetting,
  type Debug,
  type FrontendDataPortalState,
  type FrontendDebuggerState,
  type FrontendScope,
  type Logic,
  type Method,
  type MethodInfo,
  type MethodTreeNode,
  type MethodTreeSearchItem,
  type Operation,
  type Operations,
  type Rule,
  type RuleConfigTreeNode,
  type RuleInstance,
  type ScopeTreeNode,
  type ScopeTreeSearchItem,
  type TreeNode,
  type VjsUrl,
};
