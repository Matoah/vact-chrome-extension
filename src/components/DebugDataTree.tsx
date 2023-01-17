import {
  useEffect,
  useState,
} from 'react';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';

import { useSelector } from '../store';
import {
  isEmptyObject,
  isObject,
} from '../utils/ObjectUtils';
import {
  getRuleDebugInfo,
  getRulesetDebugInfo,
  getWindowDebugInfo,
} from '../utils/RPCUtils';
import { uuid } from '../utils/StringUtils';
import { Rule } from '../utils/Types';

interface TreeNode {
  id: string;
  label: string;
  type: string;
  isFolder?: boolean;
  children?: TreeNode[];
}

const arrayToTree = function (prefix: string, array: any[]): TreeNode[] {
  const tree: TreeNode[] = [];
  if (array.length == 0) {
    tree.push({
      id: `${prefix}_$_emptyArray`,
      label: "[]",
      type: "none",
    });
  } else {
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      const id = `${prefix}_$_${i}`;
      tree.push(toTreeNode(id, i + "", item));
    }
  }
  return tree;
};

const toTreeNode = function (id: string, key: string, val: any): TreeNode {
  if (Array.isArray(val)) {
    const isEmpty = val.length == 0;
    return {
      id,
      label: isEmpty ? `${key}:[]` : key,
      type: "none",
      children: isEmpty ? undefined : arrayToTree(id, val),
    };
  } else if (isObject(val)) {
    const isEmpty = isEmptyObject(val);
    return {
      id,
      label: isEmpty ? `${key}:{}` : key,
      type: "none",
      children: isEmpty ? undefined : objectToTree(id, val),
    };
  } else {
    return {
      id,
      label: `${key}:${val}`,
      type: "none",
    };
  }
};

const objectToTree = function (
  prefix: string,
  object: { [code: string]: any }
): TreeNode[] {
  const tree: TreeNode[] = [];
  if (isEmptyObject(object)) {
    tree.push({
      id: `${prefix}_$_emptyObject`,
      label: "{}",
      type: "none",
    });
  } else {
    for (let attr in object) {
      const val = object[attr];
      const id = `${prefix}_$_${attr}`;
      tree.push(toTreeNode(id, attr, val));
    }
  }
  return tree;
};

const getRuleTree = async function (debug: Rule, expanded: string[]) {
  const id = "debug_$_data_$_rule";
  let children = undefined;
  if (expanded.indexOf(id) != -1) {
    const ruleDebug = await getRuleDebugInfo();
    if (ruleDebug) {
      children = objectToTree(id, ruleDebug);
    }
  }
  return [
    {
      id,
      label: "规则",
      type: "ruleset",
      isFolder: true,
      children,
    },
  ];
};

const getRuleSetTree = async function (debug: Rule, expanded: string[]) {
  const id = "debug_$_data_$_ruleset";
  let children = undefined;
  if (expanded.indexOf(id) != -1) {
    const rulesetDebug = await getRulesetDebugInfo();
    if (rulesetDebug) {
      children = objectToTree(id, rulesetDebug);
    }
  }
  return [
    {
      id,
      label: "方法",
      type: "ruleset",
      isFolder: true,
      children,
    },
  ];
};

const getWindowTree = async function (debug: Rule, expanded: string[]) {
  const id = "debug_$_data_$_window";
  let children = undefined;
  if (expanded.indexOf(id) != -1) {
    const windowDebug = await getWindowDebugInfo();
    if (windowDebug) {
      children = objectToTree(id, windowDebug);
    }
  }
  return [
    {
      id,
      label: "窗体",
      type: "none",
      isFolder: true,
      children,
    },
  ];
};

const getComponentTree = async function (debug: Rule, expanded: string[]) {
  return [
    {
      id: "debug_$_data_$_component",
      label: "构件",
      isFolder: true,
      type: "componentList",
      children: [],
    },
  ];
};

const handlers = {
  componentList: function () {},
  windowInput: function () {},
  windowOutput: function () {},
  windowWidget: function () {},
  ruleset: function () {},
};

const toTree = async function (expanded: string[], debug?: Rule) {
  if (debug) {
    const method = debug.method;
    const windowCode = method.windowCode;
    let tree: TreeNode[] = await getRuleTree(debug, expanded);
    const rulesetTree = await getRuleSetTree(debug, expanded);
    tree = tree.concat(rulesetTree);
    if (windowCode) {
      const windowTree = await getWindowTree(debug, expanded);
      tree = tree.concat(windowTree);
    }
    const componentTree = await getComponentTree(debug, expanded);
    return tree.concat(componentTree);
  }
  return [];
};

const getNode = function (nodeId: string, tree: TreeNode[]) {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id == nodeId) {
      return node;
    } else {
      const children = node.children;
      if (children && children.length > 0) {
        const n = getNode(nodeId, children);
        if (n) {
          return node;
        }
      }
    }
  }
  return null;
};

const getExpandNode = function (
  newExpanded: string[],
  expanded: string[],
  tree: TreeNode[]
) {
  if (newExpanded.length > expanded.length) {
    for (let i = 0; i < newExpanded.length; i++) {
      const nodeId = newExpanded[i];
      if (expanded.indexOf(nodeId) == -1) {
        return getNode(nodeId, tree);
      }
    }
  }
  return null;
};

function DebugDataTree() {
  const { debug } = useSelector((state) => state.frontendDebugger);
  const [data, setData] = useState<{ expanded: string[]; tree: TreeNode[] }>({
    expanded: [],
    tree: [],
  });
  const renderTreeChildren = (node: TreeNode) => (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      label={node.label}
      sx={{ textAlign: "left" }}
    >
      {Array.isArray(node.children) && node.children.length > 0 ? (
        node.children.map((node) => renderTreeChildren(node))
      ) : node.isFolder ? (
        <TreeItem key={uuid()} label="" nodeId={uuid()}></TreeItem>
      ) : null}
    </TreeItem>
  );
  useEffect(() => {
    (async () => {
      const tree = await toTree(data.expanded, debug);
      setData({
        ...data,
        tree,
      });
    })();
  }, [debug, data.expanded]);
  return (
    <TreeView
      expanded={data.expanded}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      onNodeToggle={(evt, expanded) => {
        setData({
          ...data,
          expanded,
        });
      }}
    >
      {data.tree.map((node: TreeNode) => renderTreeChildren(node))}
    </TreeView>
  );
}

export default DebugDataTree;
