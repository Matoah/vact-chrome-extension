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

interface Operation {
  code: string;
  icon: ReactNode;
  title: string;
}

interface Operations {
  [operation: string]: {
    disabled: boolean;
    active: boolean;
  };
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

interface MethodTreeNode {
  id: string;
  type: "component" | "window" | "method" | "catalog";
  label: string;
  children?: MethodTreeNode[];
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

export {
  type Breakpoint,
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
};
