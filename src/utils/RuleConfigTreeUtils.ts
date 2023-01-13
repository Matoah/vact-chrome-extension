import {
  Element,
  xml2js,
} from 'xml-js';

import { uuid } from '../utils/StringUtils';
import {
  Breakpoint,
  Logic,
  RuleInstance,
} from '../utils/Types';

export function ruleInstanceToId(
  ruleCode: string,
  currentMethod: {
    componentCode: string;
    methodCode: string;
    windowCode?: string;
  }
) {
  const { componentCode, windowCode, methodCode } = currentMethod;
  return windowCode
    ? `window_rule_$_${componentCode}_$_${windowCode}_$_${methodCode}_$_${ruleCode}`
    : `component_rule_$_${componentCode}_$_${methodCode}_$_${ruleCode}`;
}

interface TreeNode {
  id: string;
  label: string;
  type: "rule" | "if" | "else" | "foreach";
  desc?: string;
  ruleCode?: string;
  debug?: boolean | { debug: boolean; condition: string };
  children?: TreeNode[];
}

const dispatcher = {
  dispatch: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ): TreeNode {
    const name = element.name;
    //@ts-ignore
    const handler = dispatcher[name + ""];
    if (handler) {
      return handler(element, map, currentMethod);
    } else {
      throw Error("未识别节点！节点名称：" + name);
    }
  },
  Root: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ) {
    return null;
  },
  if: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ): TreeNode {
    const elements = element.elements;
    let condition = "";
    let children: TreeNode[] = [];
    elements?.forEach((ele) => {
      const name = ele.name;
      if (name == "define") {
        const defines = ele.elements;
        defines?.forEach((define) => {
          const name = define.name;
          if (name == "expression") {
            if (
              define.elements &&
              define.elements[0] &&
              define.elements[0].text
            ) {
              condition = define.elements[0].text + "";
            }
          }
        });
      } else if (name == "sequence") {
        const elements = ele.elements;
        elements?.forEach((ele) => {
          const node = dispatcher.dispatch(ele, map, currentMethod);
          if (node) {
            children.push(node);
          }
        });
      }
    });
    return {
      id: uuid(),
      label: "IF",
      type: "if",
      desc: condition,
      children,
    };
  },
  else: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ): TreeNode {
    const children: TreeNode[] = [];
    const elements = element.elements;
    elements?.forEach((ele) => {
      const name = ele.name;
      if (name == "sequence") {
        const elements = ele.elements;
        elements?.forEach((ele) => {
          const node = dispatcher.dispatch(ele, map, currentMethod);
          if (node) {
            children.push(node);
          }
        });
      }
    });
    return {
      id: uuid(),
      label: "ELSE",
      type: "else",
      desc: "",
      children,
    };
  },
  evaluateRule: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ): TreeNode {
    const code = element.attributes?.code + "";
    return {
      id: ruleInstanceToId(code, currentMethod),
      type: "rule",
      ruleCode: code,
      label: map[code].$.instanceName || map[code].$.ruleName,
      desc: "",
    };
  },
  foreach: function (
    element: Element,
    map: { [ruleCode: string]: RuleInstance },
    currentMethod: {
      componentCode: string;
      methodCode: string;
      windowCode?: string;
    }
  ): TreeNode {
    const elements = element.elements;
    let entityCode = "",
      varCode = "";
    let children: TreeNode[] = [];
    elements?.forEach((ele) => {
      const name = ele.name;
      if (name == "define") {
        const defines = ele.elements;
        defines?.forEach((define) => {
          const name = define.name;
          if (name == "entityCode") {
            if (
              define.elements &&
              define.elements[0] &&
              define.elements[0].text
            ) {
              entityCode = define.elements[0].text + "";
            }
          } else if (name == "varCode") {
            if (
              define.elements &&
              define.elements[0] &&
              define.elements[0].text
            ) {
              varCode = define.elements[0].text + "";
            }
          }
        });
      } else if (name == "sequence") {
        const elements = ele.elements;
        elements?.forEach((ele) => {
          const node = dispatcher.dispatch(ele, map, currentMethod);
          if (node) {
            children.push(node);
          }
        });
      }
    });
    return {
      id: uuid(),
      label: `Foreach(var ${varCode} in ${entityCode})`,
      type: "foreach",
      desc: "",
      children,
    };
  },
};

export function getBreakpointByNodeId(
  nodeId: string,
  breakpoints?: Breakpoint[]
) {
  if (breakpoints) {
    return breakpoints.find((breakpoint) => {
      return (
        nodeId ==
        ruleInstanceToId(breakpoint.location.ruleCode, breakpoint.location)
      );
    });
  }
  return null;
}

function ruleInstanceToMap(ruleInstances: {
  ruleInstance: RuleInstance | RuleInstance[];
}) {
  const map: { [instanceCode: string]: RuleInstance } = {};
  if (ruleInstances && ruleInstances.ruleInstance) {
    const instances = Array.isArray(ruleInstances.ruleInstance)
      ? ruleInstances.ruleInstance
      : [ruleInstances.ruleInstance];
    instances.forEach((inst) => {
      map[inst.$.instanceCode] = inst;
    });
  }
  return map;
}

export function isDebuged(nodeId: string, breakpoints?: Breakpoint[]) {
  return !!getBreakpointByNodeId(nodeId, breakpoints);
}

export function toTree(
  logic: Logic,
  currentMethod: {
    componentCode: string;
    methodCode: string;
    windowCode?: string;
  }
): TreeNode[] {
  const tree: TreeNode[] = [];
  if (logic) {
    let xmlStr = logic.ruleSets.ruleSet.ruleRoute._;
    if (xmlStr && xmlStr.trim()) {
      const map: { [ruleCode: string]: RuleInstance } = {
        ...ruleInstanceToMap(logic.ruleSets.ruleSet.ruleInstances),
        ...ruleInstanceToMap(logic.ruleInstances),
      };
      xmlStr = `<root>${xmlStr.trim()}</root>`;
      const json = xml2js(xmlStr, {
        trim: true,
        ignoreComment: true,
        alwaysChildren: true,
        alwaysArray: true,
      });
      const elements = json.elements[0].elements;
      elements?.forEach((ele: Element) => {
        const node = dispatcher.dispatch(ele, map, currentMethod);
        if (node) {
          tree.push(node);
        }
      });
    }
  }
  return tree;
}

export const getAllNodeIds = function (tree: TreeNode[]): string[] {
  let result: string[] = [];
  tree.forEach((node) => {
    result.push(node.id);
    const children = node.children;
    if (children && children.length > 0) {
      result = result.concat(getAllNodeIds(children));
    }
  });
  return result;
};

export { type TreeNode };
