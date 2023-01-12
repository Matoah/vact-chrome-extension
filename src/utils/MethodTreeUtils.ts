import {
  notEmpty,
  uuid,
} from '../utils/StringUtils';
import {
  MethodInfo,
  MethodTreeNode,
  MethodTreeSearchItem,
} from './Types';

function toWindowMethodId(data: {
  componentCode: string;
  methodCode: string;
  windowCode: string;
}) {
  const { componentCode, windowCode, methodCode } = data;
  return `${componentCode}_$_component_@_windows_$_${windowCode}_$_window_@_methods_$_${methodCode}`;
}

function toComponentMethodId(data: {
  componentCode: string;
  methodCode: string;
}) {
  const { componentCode, methodCode } = data;
  return `${componentCode}_$_component_@_methods_$_${methodCode}`;
}
function toWindowId(data: { componentCode: string; windowCode: string }) {
  const { componentCode, windowCode } = data;
  return `${componentCode}_$_component_@_windows_$_${windowCode}`;
}

export function toMethodTreeSearchItems(
  datas: Array<MethodInfo>
): MethodTreeSearchItem[] {
  const items: MethodTreeSearchItem[] = [];
  const tmp: string[] = [];
  datas.forEach((data) => {
    const {
      componentCode,
      componentName,
      methodCode,
      methodName,
      windowCode,
      windowName,
    } = data;
    if (tmp.indexOf(componentCode) == -1) {
      tmp.push(componentCode);
      items.push({
        code: uuid(),
        componentCode,
        label: componentCode,
      });
      if (notEmpty(componentName)) {
        items.push({
          code: uuid(),
          componentCode,
          label: componentName,
        });
      }
    }
    if (windowCode) {
      const windowId = toWindowId({ componentCode, windowCode });
      if (tmp.indexOf(windowId) == -1) {
        tmp.push(windowId);
        items.push({
          code: uuid(),
          componentCode,
          windowCode,
          label: windowCode,
        });
        if (notEmpty(windowName)) {
          items.push({
            code: uuid(),
            componentCode,
            windowCode,
            label: windowName || "",
          });
        }
      }
    }
    items.push({
      code: uuid(),
      componentCode,
      windowCode,
      methodCode,
      label: methodCode,
    });
    if (notEmpty(methodName)) {
      items.push({
        code: uuid(),
        componentCode,
        windowCode,
        methodCode,
        label: methodName,
      });
    }
  });
  return items;
}

export function toMethodTree(datas: Array<MethodInfo>): MethodTreeNode[] {
  const tree: MethodTreeNode[] = [];
  const map: { [id: string]: MethodTreeNode } = {};
  datas.forEach((data) => {
    const {
      componentCode,
      componentName,
      methodCode,
      methodName,
      windowCode,
      windowName,
    } = data;
    let componentNode = map[componentCode];
    if (!componentNode) {
      componentNode = {
        id: componentCode,
        label: componentName,
        type: "component",
      };
      map[componentCode] = componentNode;
      tree.push(componentNode);
    }
    if (windowCode) {
      //窗体方法
      let children = componentNode.children || [];
      let componentWindowNode = children.find(
        (node) => node.id == `${componentCode}_$_component_@_windows`
      );
      if (!componentWindowNode) {
        componentWindowNode = {
          id: `${componentCode}_$_component_@_windows`,
          label: "窗体",
          type: "catalog",
        };
        children.push(componentWindowNode);
      }
      const componentWindows = componentWindowNode.children || [];
      let windowNode = componentWindows.find(
        (node) => node.id == toWindowId({ componentCode, windowCode })
      );
      if (!windowNode) {
        windowNode = {
          id: toWindowId({ componentCode, windowCode }),
          label: windowName || windowCode,
          type: "window",
        };
        componentWindows.push(windowNode);
      }
      const windowMethods = windowNode.children || [];
      windowMethods.push({
        id: toWindowMethodId({ componentCode, windowCode, methodCode }),
        label: methodName || methodCode,
        type: "method",
      });
      windowNode.children = windowMethods;
      componentWindowNode.children = componentWindows;
      componentNode.children = children;
    } else {
      //构件方法
      const children = componentNode.children || [];
      let componentMethodNode = children.find(
        (node) => node.id == `${componentCode}_$_component_@_methods`
      );
      if (!componentMethodNode) {
        componentMethodNode = {
          id: `${componentCode}_$_component_@_methods`,
          label: "构件方法",
          type: "catalog",
        };
        children.push(componentMethodNode);
      }
      const componentMethods = componentMethodNode.children || [];
      componentMethods.push({
        id: toComponentMethodId(data),
        label: methodName || methodCode,
        type: "method",
      });
      componentMethodNode.children = componentMethods;
      componentNode.children = children;
    }
  });
  return tree;
}

export const toMethodTreeNodeId = function (option: {
  componentCode: string;
  windowCode?: string;
  methodCode?: string;
}) {
  const { componentCode, windowCode, methodCode } = option;
  if (windowCode) {
    if (methodCode) {
      return toWindowMethodId({ componentCode, windowCode, methodCode });
    } else {
      return toWindowId({ componentCode, windowCode });
    }
  } else {
    if (methodCode) {
      return toComponentMethodId({ componentCode, methodCode });
    } else {
      return componentCode;
    }
  }
};

export const filterMethodTree = function (
  tree: MethodTreeNode[],
  filter?: MethodTreeSearchItem
) {
  if (filter) {
    const result: MethodTreeNode[] = [];
    const key = toMethodTreeNodeId(filter);
    tree.forEach((node) => {
      if (key.startsWith(node.id)) {
        result.push({
          ...node,
          children:
            node.id == key
              ? node.children
              : node.children
              ? filterMethodTree(node.children, filter)
              : [],
        });
      }
    });
    return result;
  } else {
    return tree;
  }
};

export const getAllNodeIds = function (tree: MethodTreeNode[]): string[] {
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
